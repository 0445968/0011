'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { BoardState } from './useBoard';
import { team, statusMeta, priorityMeta } from '@/data/demos/kanban';
import { formatDueDate, getDueState } from './utils';

interface Props {
  board: BoardState;
  onOpenTask: (id: string) => void;
}

export function TimelineView({ board, onOpenTask }: Props) {
  const tasks = board.filteredTasks.filter((t) => t.dueDate);

  // Calculate date range (2 weeks before earliest, 2 weeks after latest due date)
  const { weeks, startDate } = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date('2026-08-22T00:00:00');
      return { weeks: 4, startDate: today };
    }
    const dates = tasks.map((t) => new Date(t.dueDate! + 'T00:00:00'));
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));
    // Start from the Monday of the min week
    const start = new Date(min);
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    const rangeMs = max.getTime() - start.getTime();
    const numWeeks = Math.max(4, Math.ceil(rangeMs / (7 * 86400000)) + 1);
    return { weeks: numWeeks, startDate: start };
  }, [tasks]);

  const dayWidth = 32;
  const totalDays = weeks * 7;
  const totalWidth = totalDays * dayWidth;

  const dayOffset = (iso: string): number => {
    const d = new Date(iso + 'T00:00:00');
    return Math.floor((d.getTime() - startDate.getTime()) / 86400000);
  };

  const todayOffset = dayOffset('2026-08-22');

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="rounded-xl border border-black/5 bg-white dark:border-white/5 dark:bg-[#131821]" style={{ minWidth: totalWidth + 200 }}>
        {/* Header: week labels */}
        <div className="sticky top-0 z-10 flex border-b border-black/5 bg-white dark:border-white/5 dark:bg-[#131821]">
          <div className="w-48 shrink-0 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">
            Task
          </div>
          <div className="flex" style={{ width: totalWidth }}>
            {Array.from({ length: weeks }).map((_, w) => {
              const weekStart = new Date(startDate);
              weekStart.setDate(weekStart.getDate() + w * 7);
              return (
                <div
                  key={w}
                  className="shrink-0 border-l border-black/5 px-2 py-2 text-xs font-medium text-[#6b7280] dark:border-white/5 dark:text-[#9ca3af]"
                  style={{ width: dayWidth * 7 }}
                >
                  {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Today line */}
        <div className="relative">
          {todayOffset >= 0 && todayOffset < totalDays && (
            <div
              className="absolute top-0 bottom-0 w-px bg-[#3b82f6] opacity-40"
              style={{ left: 192 + todayOffset * dayWidth }}
            >
              <span className="absolute -top-0 left-1 text-[10px] font-medium text-[#3b82f6]">Today</span>
            </div>
          )}

          {/* Rows */}
          {tasks.map((task, i) => {
            const offset = dayOffset(task.dueDate!);
            if (offset < 0 || offset >= totalDays) return null;
            const assignees = team.filter((m) => task.assigneeIds.includes(m.id));
            const dueState = getDueState(task.dueDate, task.status);
            const sMeta = statusMeta[task.status];

            return (
              <div
                key={task.id}
                className="flex items-center border-b border-black/5 dark:border-white/5"
                style={{ minHeight: 44 }}
              >
                {/* Task name */}
                <button
                  onClick={() => onOpenTask(task.id)}
                  className="w-48 shrink-0 truncate px-4 py-2 text-left text-sm hover:text-[#3b82f6]"
                >
                  {task.title}
                </button>

                {/* Timeline bar */}
                <div className="relative flex-1" style={{ width: totalWidth }}>
                  <div
                    className="absolute flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-white transition-transform hover:scale-[1.02] cursor-pointer"
                    style={{
                      left: offset * dayWidth + 4,
                      width: Math.max(dayWidth * 2, 80),
                      backgroundColor: sMeta.color,
                      opacity: task.status === 'done' ? 0.6 : 1,
                    }}
                    onClick={() => onOpenTask(task.id)}
                  >
                    <span className="truncate">{formatDueDate(task.dueDate)}</span>
                    {assignees.length > 0 && (
                      <span className="ml-auto flex -space-x-1">
                        {assignees.slice(0, 2).map((m) => (
                          <span key={m.id} className="flex h-4 w-4 items-center justify-center rounded-full border border-white text-[7px] font-bold" style={{ backgroundColor: m.color }}>
                            {m.initials}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>

                  {/* Overdue indicator */}
                  {dueState === 'overdue' && task.status !== 'done' && (
                    <span
                      className="absolute top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#dc2626]"
                      style={{ left: offset * dayWidth + 4 + Math.max(dayWidth * 2, 80) + 4 }}
                    >
                      !
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {tasks.length === 0 && (
            <div className="flex items-center justify-center py-12 text-sm text-[#9ca3af]">
              No tasks with due dates. Assign due dates to see them on the timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
