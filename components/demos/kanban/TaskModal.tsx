'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BoardState, NewTaskInput } from './useBoard';
import type { Task, Priority, Status } from '@/data/demos/kanban';
import { team, labels, columns, priorityMeta, priorityOrder } from '@/data/demos/kanban';

interface Props {
  open: boolean;
  onClose: () => void;
  board: BoardState;
  editTask: Task | null;
}

const emptyDraft = (): NewTaskInput => ({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  labelIds: [],
  assigneeIds: [],
  dueDate: null,
});

const todayISO = () => new Date('2026-08-22').toISOString().split('T')[0];

export function TaskModal({ open, onClose, board, editTask }: Props) {
  const [draft, setDraft] = useState<NewTaskInput>(emptyDraft());

  useEffect(() => {
    if (open) {
      if (editTask) {
        setDraft({
          title: editTask.title,
          description: editTask.description,
          status: editTask.status,
          priority: editTask.priority,
          labelIds: [...editTask.labelIds],
          assigneeIds: [...editTask.assigneeIds],
          dueDate: editTask.dueDate,
        });
      } else {
        setDraft(emptyDraft());
      }
    }
  }, [open, editTask]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  const canSave = draft.title.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const input = { ...draft, title: draft.title.trim() };
    if (editTask) {
      board.updateTask(editTask.id, input);
    } else {
      board.addTask(input);
    }
    onClose();
  };

  const toggleArrayItem = (key: 'labelIds' | 'assigneeIds', id: string) => {
    setDraft((prev) => {
      const arr = prev[key] ?? [];
      return { ...prev, [key]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] };
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg overflow-hidden rounded-t-xl bg-white shadow-xl dark:bg-[#1e2330] sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
          >
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-3.5 dark:border-white/5">
              <h2 id="task-modal-title" className="font-semibold">
                {editTask ? 'Edit task' : 'New task'}
              </h2>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] hover:bg-black/5 dark:text-[#9ca3af] dark:hover:bg-white/5" aria-label="Close">
                <X size={17} />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
              {/* Title */}
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Title</span>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Task title"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#3b82f6] focus:outline-none dark:border-white/10 dark:bg-[#0e1117] dark:text-[#e2e8f0]"
                  autoFocus
                />
              </label>

              {/* Description */}
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Description</span>
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Add more detail..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#3b82f6] focus:outline-none dark:border-white/10 dark:bg-[#0e1117] dark:text-[#e2e8f0]"
                />
              </label>

              {/* Status + Priority */}
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Status</span>
                  <select
                    value={draft.status}
                    onChange={(e) => setDraft({ ...draft, status: e.target.value as Status })}
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#3b82f6] focus:outline-none dark:border-white/10 dark:bg-[#0e1117] dark:text-[#e2e8f0]"
                  >
                    {columns.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Priority</span>
                  <select
                    value={draft.priority}
                    onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#3b82f6] focus:outline-none dark:border-white/10 dark:bg-[#0e1117] dark:text-[#e2e8f0]"
                  >
                    {priorityOrder.map((p) => <option key={p} value={p}>{priorityMeta[p].label}</option>)}
                  </select>
                </label>
              </div>

              {/* Due date */}
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Due date</span>
                <input
                  type="date"
                  value={draft.dueDate ?? ''}
                  onChange={(e) => setDraft({ ...draft, dueDate: e.target.value || null })}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#3b82f6] focus:outline-none dark:border-white/10 dark:bg-[#0e1117] dark:text-[#e2e8f0]"
                />
              </label>

              {/* Labels */}
              <div>
                <span className="mb-1.5 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Labels</span>
                <div className="flex flex-wrap gap-1.5">
                  {labels.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => toggleArrayItem('labelIds', l.id)}
                      className={cn(
                        'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                        draft.labelIds?.includes(l.id)
                          ? 'border-transparent text-white'
                          : 'border-black/10 text-[#6b7280] hover:bg-black/[0.02] dark:border-white/10 dark:text-[#9ca3af]'
                      )}
                      style={draft.labelIds?.includes(l.id) ? { backgroundColor: l.color } : undefined}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignees */}
              <div>
                <span className="mb-1.5 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Assignees</span>
                <div className="flex flex-wrap gap-1.5">
                  {team.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => toggleArrayItem('assigneeIds', m.id)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-xs font-medium transition-colors',
                        draft.assigneeIds?.includes(m.id)
                          ? 'border-[#3b82f6] bg-[#3b82f6]/5 text-[#3b82f6]'
                          : 'border-black/10 text-[#6b7280] hover:bg-black/[0.02] dark:border-white/10 dark:text-[#9ca3af]'
                      )}
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-white" style={{ backgroundColor: m.color }}>
                        {m.initials}
                      </span>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-black/5 px-5 py-3.5 dark:border-white/5">
              <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-[#6b7280] hover:bg-black/5 dark:text-[#9ca3af] dark:hover:bg-white/5">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition-transform enabled:hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Check size={15} />
                {editTask ? 'Save changes' : 'Create task'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
