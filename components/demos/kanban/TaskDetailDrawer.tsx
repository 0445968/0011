'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, Pencil, Trash2, Copy, Plus, Check, MessageSquare, Activity as ActivityIcon,
  CheckSquare, Calendar, Send, Trash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, Priority, Status } from '@/data/demos/kanban';
import type { BoardState } from './useBoard';
import { team, labels, columns, priorityMeta, priorityOrder, statusMeta, currentUserId } from '@/data/demos/kanban';
import { formatDueDateLong, formatTimestamp, relativeTime, subtaskProgress, getDueState } from './utils';

interface Props {
  task: Task | null;
  board: BoardState;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onDuplicate: (task: Task) => void;
}

type Tab = 'details' | 'subtasks' | 'comments' | 'activity';

export function TaskDetailDrawer({ task, board, onClose, onEdit, onDelete, onDuplicate }: Props) {
  const [tab, setTab] = useState<Tab>('details');
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState('');

  useEffect(() => {
    if (task) {
      setTab('details');
      setTitleDraft(task.title);
      setDescDraft(task.description);
    }
  }, [task?.id]);

  useEffect(() => {
    if (!task) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [task, onClose]);

  const taskActivity = task ? board.activity.filter((a) => a.taskId === task.id).slice(0, 10) : [];

  const saveTitle = () => {
    if (task && titleDraft.trim()) {
      board.updateTask(task.id, { title: titleDraft.trim() });
      setEditingTitle(false);
    }
  };

  const saveDesc = () => {
    if (task) {
      board.updateTask(task.id, { description: descDraft });
      setEditingDesc(false);
    }
  };

  const handleAddSubtask = () => {
    if (task && newSubtask.trim()) {
      board.addSubtask(task.id, newSubtask.trim());
      setNewSubtask('');
    }
  };

  const handleAddComment = () => {
    if (task && newComment.trim()) {
      board.addComment(task.id, newComment.trim());
      setNewComment('');
    }
  };

  const toggleArrayItem = (key: 'labelIds' | 'assigneeIds', id: string) => {
    if (!task) return;
    const arr = task[key];
    const newArr = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
    board.updateTask(task.id, { [key]: newArr });
  };

  return (
    <AnimatePresence>
      {task && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] bg-black/20"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-md flex-col bg-white dark:bg-[#1a1f29]"
            role="dialog"
            aria-modal="true"
            aria-label="Task details"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/5">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                  style={{ backgroundColor: statusMeta[task.status].dotColor }}
                >
                  {task.priority === 'urgent' ? '!' : task.priority[0].toUpperCase()}
                </span>
                <span className="text-sm font-medium text-[#6b7280] dark:text-[#9ca3af]">
                  {statusMeta[task.status].label}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={() => onDuplicate(task)} className="rounded-md p-1.5 text-[#6b7280] hover:bg-black/5 dark:text-[#9ca3af] dark:hover:bg-white/5" aria-label="Duplicate task" title="Duplicate">
                  <Copy size={16} />
                </button>
                <button onClick={() => onEdit(task)} className="rounded-md p-1.5 text-[#6b7280] hover:bg-black/5 dark:text-[#9ca3af] dark:hover:bg-white/5" aria-label="Edit task" title="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => onDelete(task)} className="rounded-md p-1.5 text-[#6b7280] hover:bg-[#dc2626]/5 hover:text-[#dc2626] dark:text-[#9ca3af]" aria-label="Delete task" title="Delete">
                  <Trash2 size={16} />
                </button>
                <button onClick={onClose} className="rounded-md p-1.5 text-[#6b7280] hover:bg-black/5 dark:text-[#9ca3af] dark:hover:bg-white/5" aria-label="Close drawer">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="px-4 pt-4">
              {editingTitle ? (
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    className="flex-1 rounded-lg border border-[#3b82f6] bg-white px-2 py-1 text-lg font-bold focus:outline-none dark:bg-[#0e1117] dark:text-[#e2e8f0]"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                  />
                  <button onClick={saveTitle} className="rounded-md bg-[#3b82f6] p-1.5 text-white"><Check size={16} /></button>
                </div>
              ) : (
                <h1
                  className="cursor-text text-lg font-bold leading-tight"
                  onClick={() => { setEditingTitle(true); setTitleDraft(task.title); }}
                >
                  {task.title}
                </h1>
              )}
            </div>

            {/* Tabs */}
            <div className="mt-3 flex gap-0.5 border-b border-black/5 px-4 dark:border-white/5">
              {(['details', 'subtasks', 'comments', 'activity'] as Tab[]).map((t) => {
    const labelMap: Record<Tab, string> = { details: 'Details', subtasks: 'Subtasks', comments: 'Comments', activity: 'Activity' };
                const count = t === 'subtasks' ? task.subtasks.length : t === 'comments' ? task.comments.length : t === 'activity' ? taskActivity.length : 0;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      'relative px-3 py-2 text-xs font-medium transition-colors',
                      tab === t ? 'text-[#3b82f6]' : 'text-[#6b7280] hover:text-[#1e2330] dark:text-[#9ca3af]'
                    )}
                  >
                    {labelMap[t]}
                    {count > 0 && <span className="ml-1 opacity-60">{count}</span>}
                    {tab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#3b82f6]" />}
                  </button>
                );
              })}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {tab === 'details' && (
                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">Description</p>
                    {editingDesc ? (
                      <div className="space-y-2">
                        <textarea
                          value={descDraft}
                          onChange={(e) => setDescDraft(e.target.value)}
                          rows={4}
                          className="w-full resize-none rounded-lg border border-[#3b82f6] bg-white px-3 py-2 text-sm focus:outline-none dark:bg-[#0e1117] dark:text-[#e2e8f0]"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button onClick={saveDesc} className="rounded-md bg-[#3b82f6] px-3 py-1 text-xs font-medium text-white">Save</button>
                          <button onClick={() => setEditingDesc(false)} className="rounded-md px-3 py-1 text-xs text-[#6b7280] dark:text-[#9ca3af]">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p
                        className="cursor-text rounded-lg px-3 py-2 text-sm leading-relaxed text-[#1e2330] hover:bg-black/[0.02] dark:text-[#e2e8f0] dark:hover:bg-white/5"
                        onClick={() => { setEditingDesc(true); setDescDraft(task.description); }}
                      >
                        {task.description || 'Add a description...'}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <DetailRow label="Status">
                    <select
                      value={task.status}
                      onChange={(e) => board.updateTask(task.id, { status: e.target.value as Status })}
                      className="rounded-md border border-black/10 bg-white px-2 py-1 text-sm focus:border-[#3b82f6] focus:outline-none dark:border-white/10 dark:bg-[#0e1117] dark:text-[#e2e8f0]"
                    >
                      {columns.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </DetailRow>

                  {/* Priority */}
                  <DetailRow label="Priority">
                    <select
                      value={task.priority}
                      onChange={(e) => board.updateTask(task.id, { priority: e.target.value as Priority })}
                      className="rounded-md border border-black/10 bg-white px-2 py-1 text-sm focus:border-[#3b82f6] focus:outline-none dark:border-white/10 dark:bg-[#0e1117] dark:text-[#e2e8f0]"
                    >
                      {priorityOrder.map((p) => <option key={p} value={p}>{priorityMeta[p].label}</option>)}
                    </select>
                  </DetailRow>

                  {/* Due date */}
                  <DetailRow label="Due date">
                    <input
                      type="date"
                      value={task.dueDate ?? ''}
                      onChange={(e) => board.updateTask(task.id, { dueDate: e.target.value || null })}
                      className="rounded-md border border-black/10 bg-white px-2 py-1 text-sm focus:border-[#3b82f6] focus:outline-none dark:border-white/10 dark:bg-[#0e1117] dark:text-[#e2e8f0]"
                    />
                  </DetailRow>

                  {/* Labels */}
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">Labels</p>
                    <div className="flex flex-wrap gap-1.5">
                      {labels.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => toggleArrayItem('labelIds', l.id)}
                          className={cn(
                            'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                            task.labelIds.includes(l.id)
                              ? 'border-transparent text-white'
                              : 'border-black/10 text-[#6b7280] hover:bg-black/[0.02] dark:border-white/10 dark:text-[#9ca3af]'
                          )}
                          style={task.labelIds.includes(l.id) ? { backgroundColor: l.color } : undefined}
                        >
                          {l.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Assignees */}
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">Assignees</p>
                    <div className="flex flex-wrap gap-1.5">
                      {team.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => toggleArrayItem('assigneeIds', m.id)}
                          className={cn(
                            'flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-xs font-medium transition-colors',
                            task.assigneeIds.includes(m.id)
                              ? 'border-[#3b82f6] bg-[#3b82f6]/5 text-[#3b82f6]'
                              : 'border-black/10 text-[#6b7280] hover:bg-black/[0.02] dark:border-white/10 dark:text-[#9ca3af]'
                          )}
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-white" style={{ backgroundColor: m.color }}>{m.initials}</span>
                          {m.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtask progress */}
                  {task.subtasks.length > 0 && (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">Progress</p>
                        <span className="text-xs tabular-nums text-[#6b7280] dark:text-[#9ca3af]">
                          {subtaskProgress(task.subtasks).done}/{task.subtasks.length}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#e5e7eb] dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-[#10b981] transition-all duration-300"
                          style={{ width: `${subtaskProgress(task.subtasks).pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 'subtasks' && (
                <div className="space-y-2">
                  {task.subtasks.length === 0 && (
                    <p className="py-4 text-center text-sm text-[#9ca3af]">No subtasks yet. Add one below.</p>
                  )}
                  {task.subtasks.map((s) => (
                    <div key={s.id} className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-black/[0.02] dark:hover:bg-white/5">
                      <button
                        onClick={() => board.toggleSubtask(task.id, s.id)}
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                          s.done
                            ? 'border-[#10b981] bg-[#10b981] text-white'
                            : 'border-[#d1d5db] dark:border-white/20'
                        )}
                        aria-label={s.done ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {s.done && <Check size={12} />}
                      </button>
                      <span className={cn('flex-1 text-sm', s.done && 'text-[#9ca3af] line-through')}>{s.title}</span>
                      <button
                        onClick={() => board.deleteSubtask(task.id, s.id)}
                        className="rounded p-1 text-[#9ca3af] opacity-0 transition-opacity hover:text-[#dc2626] group-hover:opacity-100"
                        aria-label="Delete subtask"
                      >
                        <Trash size={13} />
                      </button>
                    </div>
                  ))}
                  {/* Add subtask */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask(); }}
                      placeholder="Add a subtask..."
                      className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-[#3b82f6] focus:outline-none dark:border-white/10 dark:bg-[#0e1117] dark:text-[#e2e8f0]"
                    />
                    <button
                      onClick={handleAddSubtask}
                      disabled={!newSubtask.trim()}
                      className="rounded-lg bg-[#3b82f6] p-1.5 text-white disabled:opacity-40"
                      aria-label="Add subtask"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              {tab === 'comments' && (
                <div className="space-y-3">
                  {task.comments.length === 0 && (
                    <p className="py-4 text-center text-sm text-[#9ca3af]">No comments yet. Start the conversation.</p>
                  )}
                  {task.comments.map((c) => {
                    const author = team.find((m) => m.id === c.authorId);
                    return (
                      <div key={c.id} className="group flex gap-2.5">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                          style={{ backgroundColor: author?.color ?? '#6b7280' }}
                        >
                          {author?.initials ?? '?'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{author?.name ?? 'Unknown'}</span>
                            <span className="text-xs text-[#9ca3af]">{relativeTime(c.createdAt)}</span>
                            {c.authorId === currentUserId && (
                              <button
                                onClick={() => board.deleteComment(task.id, c.id)}
                                className="ml-auto rounded p-0.5 text-[#9ca3af] opacity-0 transition-opacity hover:text-[#dc2626] group-hover:opacity-100"
                                aria-label="Delete comment"
                              >
                                <Trash size={12} />
                              </button>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm leading-relaxed">{c.text}</p>
                        </div>
                      </div>
                    );
                  })}
                  {/* Add comment */}
                  <div className="flex items-start gap-2 pt-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: team[0].color }}>
                      {team[0].initials}
                    </span>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        rows={2}
                        className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#3b82f6] focus:outline-none dark:border-white/10 dark:bg-[#0e1117] dark:text-[#e2e8f0]"
                        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment(); }}
                      />
                      <div className="mt-1.5 flex justify-end">
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#3b82f6] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                        >
                          <Send size={13} />
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'activity' && (
                <div className="space-y-3">
                  {taskActivity.length === 0 && (
                    <p className="py-4 text-center text-sm text-[#9ca3af]">No activity recorded.</p>
                  )}
                  {taskActivity.map((a) => {
                    const actor = team.find((m) => m.id === a.actorId);
                    return (
                      <div key={a.id} className="flex gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: actor?.color ?? '#6b7280' }}>
                          {actor?.initials ?? '?'}
                        </span>
                        <div className="text-sm">
                          <span className="font-medium">{actor?.name}</span>{' '}
                          <span className="text-[#6b7280] dark:text-[#9ca3af]">{a.action}</span>{' '}
                          <span className="font-medium">{a.taskTitle}</span>
                          {a.fromStatus && a.toStatus && (
                            <span className="text-[#6b7280] dark:text-[#9ca3af]">
                              {' '}(from {statusMeta[a.fromStatus].label} to {statusMeta[a.toStatus].label})
                            </span>
                          )}
                          <div className="mt-0.5 text-xs text-[#9ca3af]">{formatTimestamp(a.timestamp)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">{label}</span>
      {children}
    </div>
  );
}
