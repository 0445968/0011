'use client';

import { useState } from 'react';
import { MoreVertical, Pencil, Copy, Trash2, Calendar, CheckSquare, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BoardState } from './useBoard';
import type { Task } from '@/data/demos/kanban';
import { labels, team, priorityMeta, statusMeta, columns, type Status } from '@/data/demos/kanban';
import { formatDueDate, getDueState, subtaskProgress, priorityRank, type SortKey } from './utils';

interface Props {
  board: BoardState;
  onOpenTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export function ListView({ board, onOpenTask, onEditTask, onDeleteTask }: Props) {
  const tasks = board.filteredTasks;
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-black/5 bg-white dark:border-white/5 dark:bg-[#131821] lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/5 text-left dark:border-white/5">
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">Task</th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">Status</th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">Priority</th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">Assignees</th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">Labels</th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">Due</th>
              <th className="w-10 px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {tasks.map((task) => (
              <tr
                key={task.id}
                onClick={() => onOpenTask(task.id)}
                className="group cursor-pointer transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.02]"
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{task.title}</span>
                    {task.subtasks.length > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-[#9ca3af]">
                        <CheckSquare size={11} />
                        {subtaskProgress(task.subtasks).done}/{task.subtasks.length}
                      </span>
                    )}
                    {task.comments.length > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-[#9ca3af]">
                        <MessageSquare size={11} />
                        {task.comments.length}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <select
                    value={task.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => board.updateTask(task.id, { status: e.target.value as Status })}
                    className="rounded-md border border-black/10 bg-white px-2 py-1 text-xs focus:border-[#3b82f6] focus:outline-none dark:border-white/10 dark:bg-[#0e1117] dark:text-[#e2e8f0]"
                  >
                    {columns.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
                    style={{ backgroundColor: `${priorityMeta[task.priority].color}15`, color: priorityMeta[task.priority].color }}
                  >
                    {priorityMeta[task.priority].label}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex -space-x-1.5">
                    {team.filter((m) => task.assigneeIds.includes(m.id)).slice(0, 3).map((m) => (
                      <span key={m.id} className="flex h-6 w-6 items-center justify-center rounded-full border border-white text-[9px] font-semibold text-white dark:border-[#131821]" style={{ backgroundColor: m.color }} title={m.name}>
                        {m.initials}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1">
                    {labels.filter((l) => task.labelIds.includes(l.id)).map((l) => (
                      <span key={l.id} className="h-1.5 w-6 rounded-full" style={{ backgroundColor: l.color }} title={l.name} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-sm">
                  {task.dueDate ? (
                    <span className={cn(
                      'inline-flex items-center gap-1',
                      getDueState(task.dueDate, task.status) === 'overdue' && 'text-[#dc2626]',
                      getDueState(task.dueDate, task.status) === 'today' && 'text-[#f59e0b]',
                    )}>
                      <Calendar size={12} className="text-[#9ca3af]" />
                      {formatDueDate(task.dueDate)}
                    </span>
                  ) : (
                    <span className="text-[#9ca3af]">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === task.id ? null : task.id)}
                      className="rounded p-1 text-[#9ca3af] opacity-0 transition-opacity hover:bg-black/5 group-hover:opacity-100 dark:hover:bg-white/5"
                      aria-label="Task actions"
                    >
                      <MoreVertical size={14} />
                    </button>
                    {menuOpenId === task.id && (
                      <div className="absolute right-0 top-8 z-20 w-32 rounded-lg border border-black/10 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#1e2330]">
                        <button onClick={() => { setMenuOpenId(null); onEditTask(task); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5"><Pencil size={13} /> Edit</button>
                        <button onClick={() => { setMenuOpenId(null); board.duplicateTask(task.id); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5"><Copy size={13} /> Duplicate</button>
                        <button onClick={() => { setMenuOpenId(null); onDeleteTask(task); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[#dc2626] hover:bg-[#dc2626]/5"><Trash2 size={13} /> Delete</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && (
          <div className="py-12 text-center text-sm text-[#9ca3af]">No tasks match these filters.</div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 lg:hidden">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onOpenTask(task.id)}
            className="flex w-full flex-col gap-2 rounded-xl border border-black/5 bg-white p-3 text-left dark:border-white/5 dark:bg-[#131821]"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium">{task.title}</span>
              <span
                className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: `${priorityMeta[task.priority].color}15`, color: priorityMeta[task.priority].color }}
              >
                {priorityMeta[task.priority].label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6b7280] dark:text-[#9ca3af]">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusMeta[task.status].dotColor }} />
                {statusMeta[task.status].label}
              </span>
              {task.dueDate && (
                <span className={cn(
                  'inline-flex items-center gap-0.5',
                  getDueState(task.dueDate, task.status) === 'overdue' && 'text-[#dc2626]',
                )}>
                  <Calendar size={11} />
                  {formatDueDate(task.dueDate)}
                </span>
              )}
              <div className="ml-auto flex -space-x-1.5">
                {team.filter((m) => task.assigneeIds.includes(m.id)).slice(0, 2).map((m) => (
                  <span key={m.id} className="flex h-5 w-5 items-center justify-center rounded-full border border-white text-[8px] font-semibold text-white dark:border-[#131821]" style={{ backgroundColor: m.color }}>
                    {m.initials}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
        {tasks.length === 0 && (
          <div className="rounded-xl border border-black/5 bg-white py-12 text-center dark:border-white/5 dark:bg-[#131821]">
            <p className="text-sm text-[#9ca3af]">No tasks match these filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
