'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Plus, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BoardState } from './useBoard';
import type { View } from './FlowApp';
import { activeFilterCount, type SortKey, type DueState } from './utils';
import { team, labels, columns, priorityMeta, statusMeta, type Priority, type Status } from '@/data/demos/kanban';

interface Props {
  board: BoardState;
  view: View;
  onViewChange: (v: View) => void;
  onAddTask: () => void;
}

const viewLabels: Record<View, string> = {
  board: 'Board',
  list: 'List',
  timeline: 'Timeline',
  activity: 'Activity',
};

export function BoardToolbar({ board, view, onViewChange, onAddTask }: Props) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const filterCount = activeFilterCount(board.filters);
  const hasActiveFilters = filterCount > 0 || board.search.length > 0;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="border-b border-black/5 bg-white px-4 py-2 dark:border-white/5 dark:bg-[#131821] sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
        {/* View selector */}
        <div className="flex gap-0.5 rounded-lg bg-[#f0f1f3] p-0.5 dark:bg-white/5">
          {(Object.keys(viewLabels) as View[]).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={cn(
                'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm',
                view === v
                  ? 'bg-white text-[#1e2330] shadow-sm dark:bg-[#1e2330] dark:text-[#e2e8f0]'
                  : 'text-[#6b7280] hover:text-[#1e2330] dark:text-[#9ca3af] dark:hover:text-[#e2e8f0]'
              )}
            >
              {viewLabels[v]}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[140px] max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            type="text"
            value={board.search}
            onChange={(e) => board.setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-lg border border-black/10 bg-white py-1.5 pl-8 pr-7 text-sm focus:border-[#3b82f6] focus:outline-none dark:border-white/10 dark:bg-[#0e1117] dark:text-[#e2e8f0]"
          />
          {board.search && (
            <button
              onClick={() => board.setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#1e2330] dark:hover:text-[#e2e8f0]"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <label className="flex items-center gap-1">
          <ArrowUpDown size={14} className="text-[#9ca3af]" />
          <select
            value={board.sort}
            onChange={(e) => board.setSort(e.target.value as SortKey)}
            className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs text-[#1e2330] focus:border-[#3b82f6] focus:outline-none dark:border-white/10 dark:bg-[#0e1117] dark:text-[#e2e8f0] sm:text-sm"
            aria-label="Sort by"
          >
            <option value="manual">Manual</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due date</option>
            <option value="updated">Recently updated</option>
          </select>
        </label>

        {/* Filters */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm',
              filterCount > 0
                ? 'border-[#3b82f6] bg-[#3b82f6]/5 text-[#3b82f6]'
                : 'border-black/10 text-[#6b7280] hover:bg-black/[0.02] dark:border-white/10 dark:text-[#9ca3af]'
            )}
            aria-label="Filters"
            aria-expanded={filterOpen}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filters</span>
            {filterCount > 0 && (
              <span className="ml-0.5 rounded-full bg-[#3b82f6] px-1.5 py-0.5 text-[10px] font-bold text-white">
                {filterCount}
              </span>
            )}
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-black/10 bg-white p-3 shadow-lg dark:border-white/10 dark:bg-[#1e2330]">
              <div className="space-y-3">
                {/* My Tasks */}
                <FilterToggle
                  label="My Tasks"
                  active={board.filters.myTasks}
                  onToggle={() => board.setFilter('myTasks', !board.filters.myTasks)}
                />

                <Divider />

                {/* Assignee */}
                <FilterGroup label="Assignee">
                  <select
                    value={board.filters.assigneeId ?? ''}
                    onChange={(e) => board.setFilter('assigneeId', e.target.value || null)}
                    className="w-full rounded-md border border-black/10 bg-white px-2 py-1.5 text-sm dark:border-white/10 dark:bg-[#0e1117] dark:text-[#e2e8f0]"
                  >
                    <option value="">Anyone</option>
                    {team.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </FilterGroup>

                {/* Priority */}
                <FilterGroup label="Priority">
                  <div className="flex flex-wrap gap-1">
                    {(Object.keys(priorityMeta) as Priority[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => board.setFilter('priority', board.filters.priority === p ? null : p)}
                        className={cn(
                          'rounded-md border px-2 py-1 text-xs font-medium transition-colors',
                          board.filters.priority === p
                            ? 'border-transparent text-white'
                            : 'border-black/10 text-[#6b7280] hover:bg-black/[0.02] dark:border-white/10 dark:text-[#9ca3af]'
                        )}
                        style={board.filters.priority === p ? { backgroundColor: priorityMeta[p].color } : undefined}
                      >
                        {priorityMeta[p].label}
                      </button>
                    ))}
                  </div>
                </FilterGroup>

                {/* Label */}
                <FilterGroup label="Label">
                  <div className="flex flex-wrap gap-1">
                    {labels.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => board.setFilter('labelId', board.filters.labelId === l.id ? null : l.id)}
                        className={cn(
                          'rounded-md border px-2 py-1 text-xs font-medium transition-colors',
                          board.filters.labelId === l.id
                            ? 'border-transparent text-white'
                            : 'border-black/10 text-[#6b7280] hover:bg-black/[0.02] dark:border-white/10 dark:text-[#9ca3af]'
                        )}
                        style={board.filters.labelId === l.id ? { backgroundColor: l.color } : undefined}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </FilterGroup>

                {/* Due state */}
                <FilterGroup label="Due date">
                  <select
                    value={board.filters.dueState ?? ''}
                    onChange={(e) => board.setFilter('dueState', (e.target.value || null) as DueState | null)}
                    className="w-full rounded-md border border-black/10 bg-white px-2 py-1.5 text-sm dark:border-white/10 dark:bg-[#0e1117] dark:text-[#e2e8f0]"
                  >
                    <option value="">Any time</option>
                    <option value="overdue">Overdue</option>
                    <option value="today">Due today</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </FilterGroup>

                {hasActiveFilters && (
                  <button
                    onClick={() => { board.clearFilters(); setFilterOpen(false); }}
                    className="w-full rounded-md border border-[#dc2626]/20 py-1.5 text-xs font-medium text-[#dc2626] transition-colors hover:bg-[#dc2626]/5"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add task */}
        <button
          onClick={onAddTask}
          className="flex items-center gap-1 rounded-lg bg-[#3b82f6] px-2.5 py-1.5 text-xs font-medium text-white transition-transform hover:scale-[1.03] sm:text-sm"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">New task</span>
        </button>
      </div>
    </div>
  );
}

function FilterToggle({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'text-[#6b7280] hover:bg-black/[0.02] dark:text-[#9ca3af]'
      )}
    >
      <span className={cn(
        'flex h-4 w-4 items-center justify-center rounded border',
        active ? 'border-[#3b82f6] bg-[#3b82f6]' : 'border-black/20 dark:border-white/20'
      )}>
        {active && <span className="h-2 w-2 rounded-sm bg-white" />}
      </span>
      {label}
    </button>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">{label}</p>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-black/5 dark:border-white/5" />;
}
