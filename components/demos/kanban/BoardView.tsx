'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import type { BoardState } from './useBoard';
import type { Task, Status } from '@/data/demos/kanban';
import { columns, statusMeta } from '@/data/demos/kanban';
import { TaskCard } from './TaskCard';
import { tasksByStatus } from './utils';
import { Plus } from 'lucide-react';

interface Props {
  board: BoardState;
  onOpenTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export function BoardView({ board, onOpenTask, onEditTask, onDeleteTask }: Props) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [collapsedCols, setCollapsedCols] = useState<Set<Status>>(new Set());
  const [quickAddCol, setQuickAddCol] = useState<Status | null>(null);
  const [quickAddText, setQuickAddText] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const grouped = tasksByStatus(board.filteredTasks);

  const handleDragStart = (e: DragStartEvent) => {
    const task = board.tasks.find((t) => t.id === e.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine target column and index
    let targetStatus: Status;
    let targetIndex: number;

    if (overId.startsWith('col-')) {
      // Dropped on a column (empty area)
      targetStatus = overId.replace('col-', '') as Status;
      targetIndex = grouped[targetStatus]?.length ?? 0;
    } else {
      // Dropped on a task
      const overTask = board.tasks.find((t) => t.id === overId);
      if (!overTask) return;
      targetStatus = overTask.status;
      const colTasks = grouped[targetStatus];
      targetIndex = colTasks.findIndex((t) => t.id === overId);
      if (targetIndex < 0) targetIndex = colTasks.length;
    }

    board.moveTask(activeId, targetStatus, targetIndex);
  };

  const toggleCollapse = (status: Status) => {
    setCollapsedCols((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const handleQuickAdd = (status: Status) => {
    if (quickAddText.trim()) {
      board.addTask({ title: quickAddText.trim(), status, priority: 'medium' });
      setQuickAddText('');
    }
    setQuickAddCol(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="flex h-full gap-3 overflow-x-auto p-4 sm:p-6">
        {columns.map((col) => {
          const colTasks = grouped[col.id] ?? [];
          const isCollapsed = collapsedCols.has(col.id);
          return (
            <div
              key={col.id}
              className={cn('flex shrink-0 flex-col', isCollapsed ? 'w-12' : 'w-72')}
            >
              {/* Column header */}
              <div className="mb-2 flex items-center gap-2 px-1">
                <button
                  onClick={() => toggleCollapse(col.id)}
                  className="flex items-center gap-2 text-sm font-semibold"
                  aria-label={isCollapsed ? `Expand ${col.title}` : `Collapse ${col.title}`}
                >
                  <span className={cn('transition-transform', isCollapsed && 'rotate-[-90deg]')}>▼</span>
                  {!isCollapsed && (
                    <>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusMeta[col.id].dotColor }} />
                      {col.title}
                      <span className="text-xs font-normal text-[#9ca3af]">{colTasks.length}</span>
                    </>
                  )}
                </button>
                {!isCollapsed && (
                  <button
                    onClick={() => { setQuickAddCol(col.id); setQuickAddText(''); }}
                    className="ml-auto rounded p-0.5 text-[#9ca3af] hover:bg-black/5 hover:text-[#1e2330] dark:hover:bg-white/5"
                    aria-label={`Add task to ${col.title}`}
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>

              {/* Column body */}
              {!isCollapsed && (
                <div
                  id={`col-${col.id}`}
                  className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-lg bg-black/[0.02] p-2 dark:bg-white/[0.02]"
                  style={{ minHeight: '100px' }}
                >
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      board={board}
                      onOpen={() => onOpenTask(task.id)}
                      onEdit={() => onEditTask(task)}
                      onDelete={() => onDeleteTask(task)}
                      onDuplicate={() => board.duplicateTask(task.id)}
                    />
                  ))}

                  {/* Quick add */}
                  {quickAddCol === col.id ? (
                    <div className="rounded-lg border border-[#3b82f6] bg-white p-2 dark:bg-[#1a1f29]">
                      <input
                        type="text"
                        value={quickAddText}
                        onChange={(e) => setQuickAddText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleQuickAdd(col.id);
                          if (e.key === 'Escape') { setQuickAddCol(null); setQuickAddText(''); }
                        }}
                        placeholder="Task title..."
                        className="w-full bg-transparent text-sm focus:outline-none"
                        autoFocus
                        onBlur={() => handleQuickAdd(col.id)}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => { setQuickAddCol(col.id); setQuickAddText(''); }}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-[#9ca3af] transition-colors hover:bg-black/[0.04] dark:hover:bg-white/5"
                    >
                      <Plus size={15} />
                      Add task
                    </button>
                  )}

                  {colTasks.length === 0 && quickAddCol !== col.id && (
                    <p className="py-4 text-center text-xs text-[#9ca3af]">No tasks</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <TaskCard
            task={activeTask}
            board={board}
            onOpen={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            onDuplicate={() => {}}
            isOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
