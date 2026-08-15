'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MessageSquare, CheckSquare, Paperclip, MoreVertical, Copy, Trash2, Pencil, Flame, ArrowUp, ArrowRight, ArrowDown, type LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/data/demos/kanban';
import type { BoardState } from './useBoard';
import { labels, team, priorityMeta } from '@/data/demos/kanban';
import { formatDueDate, getDueState, subtaskProgress } from './utils';
import type { ComponentType } from 'react';

const priorityIcons: Record<string, ComponentType<LucideProps>> = {
  flame: Flame,
  'arrow-up': ArrowUp,
  'arrow-right': ArrowRight,
  'arrow-down': ArrowDown,
};

interface Props {
  task: Task;
  board: BoardState;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isOverlay?: boolean;
}

export function TaskCard({ task, board, onOpen, onEdit, onDelete, onDuplicate, isOverlay }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const taskLabels = labels.filter((l) => task.labelIds.includes(l.id));
  const assignees = team.filter((m) => task.assigneeIds.includes(m.id));
  const dueState = getDueState(task.dueDate, task.status);
  const subProgress = subtaskProgress(task.subtasks);
  const pMeta = priorityMeta[task.priority];
  const PIcon = priorityIcons[pMeta.icon];

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative cursor-grab rounded-lg border border-black/5 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing dark:border-white/5 dark:bg-[#1a1f29]',
        isDragging && 'opacity-40',
        isOverlay && 'rotate-3 cursor-grabbing shadow-lg',
      )}
      onClick={() => !isDragging && onOpen()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }}
      aria-label={`Task: ${task.title}`}
    >
      {/* Labels */}
      {taskLabels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {taskLabels.map((l) => (
            <span
              key={l.id}
              className="h-1.5 w-8 rounded-full"
              style={{ backgroundColor: l.color }}
              title={l.name}
            />
          ))}
        </div>
      )}

      {/* Title + priority */}
      <div className="flex items-start gap-2">
        <p className="flex-1 text-sm font-medium leading-snug">{task.title}</p>
        <div
          className="flex shrink-0 items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium"
          style={{ backgroundColor: `${pMeta.color}15`, color: pMeta.color }}
          title={`Priority: ${pMeta.label}`}
        >
          <PIcon size={11} className={pMeta.icon === 'flame' ? 'fill-current' : ''} />
          {pMeta.label}
        </div>
      </div>

      {/* Footer: meta */}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        {/* Left: due date + subtask + comments */}
        <div className="flex min-w-0 items-center gap-2 text-xs text-[#6b7280] dark:text-[#9ca3af]">
          {task.dueDate && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5',
                dueState === 'overdue' && 'text-[#dc2626]',
                dueState === 'today' && 'text-[#f59e0b]',
              )}
            >
              <Calendar size={12} />
              {formatDueDate(task.dueDate)}
            </span>
          )}
          {subProgress.total > 0 && (
            <span className="inline-flex items-center gap-0.5" title={`${subProgress.done}/${subProgress.total} subtasks`}>
              <CheckSquare size={12} />
              {subProgress.done}/{subProgress.total}
            </span>
          )}
          {task.comments.length > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <MessageSquare size={12} />
              {task.comments.length}
            </span>
          )}
        </div>

        {/* Right: assignees */}
        {assignees.length > 0 && (
          <div className="flex -space-x-1.5">
            {assignees.slice(0, 3).map((m) => (
              <div
                key={m.id}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-white text-[9px] font-semibold text-white dark:border-[#1a1f29]"
                style={{ backgroundColor: m.color }}
                title={m.name}
              >
                {m.initials}
              </div>
            ))}
            {assignees.length > 3 && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white bg-[#e5e7eb] text-[9px] font-semibold text-[#6b7280] dark:border-[#1a1f29] dark:bg-white/10">
                +{assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Context menu trigger */}
      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded text-[#9ca3af] opacity-0 transition-opacity hover:bg-black/5 hover:text-[#1e2330] group-hover:opacity-100 dark:hover:bg-white/10 dark:hover:text-[#e2e8f0]"
        aria-label="Task actions"
      >
        <MoreVertical size={14} />
      </button>

      {menuOpen && (
        <div
          className="absolute right-1.5 top-7 z-20 w-36 rounded-lg border border-black/10 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#1e2330]"
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem icon={Pencil} label="Edit" onClick={() => { setMenuOpen(false); onEdit(); }} />
          <MenuItem icon={Copy} label="Duplicate" onClick={() => { setMenuOpen(false); onDuplicate(); }} />
          <div className="my-1 border-t border-black/5 dark:border-white/5" />
          <MenuItem icon={Trash2} label="Delete" danger onClick={() => { setMenuOpen(false); onDelete(); }} />
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';

function MenuItem({ icon: Icon, label, onClick, danger }: { icon: typeof Pencil; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5',
        danger ? 'text-[#dc2626]' : 'text-[#1e2330] dark:text-[#e2e8f0]'
      )}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
