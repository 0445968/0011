'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBoard } from './useBoard';
import { ProjectHeader } from './ProjectHeader';
import { BoardToolbar } from './BoardToolbar';
import { BoardView } from './BoardView';
import { ListView } from './ListView';
import { TimelineView } from './TimelineView';
import { ActivityView } from './ActivityView';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { TaskModal } from './TaskModal';
import { ConfirmDialog } from './ConfirmDialog';
import type { Task } from '@/data/demos/kanban';

export type View = 'board' | 'list' | 'timeline' | 'activity';

export function FlowApp() {
  const board = useBoard();
  const [view, setView] = useState<View>('board');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const selectedTask = board.tasks.find((t) => t.id === selectedTaskId) ?? null;

  const openTask = (id: string) => setSelectedTaskId(id);
  const closeTask = () => setSelectedTaskId(null);

  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setTaskModalOpen(true);
    setSelectedTaskId(null);
  };

  const handleDeleteTask = (task: Task) => {
    setDeleteTarget(task);
    setSelectedTaskId(null);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      board.deleteTask(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#f5f6f8] text-[#1e2330] dark:bg-[#0e1117] dark:text-[#e2e8f0]">
      {/* Project header — fixed */}
      <ProjectHeader board={board} />

      {/* Toolbar */}
      <BoardToolbar
        board={board}
        view={view}
        onViewChange={setView}
        onAddTask={() => { setEditTask(null); setTaskModalOpen(true); }}
      />

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            {view === 'board' && (
              <BoardView board={board} onOpenTask={openTask} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} />
            )}
            {view === 'list' && (
              <ListView board={board} onOpenTask={openTask} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} />
            )}
            {view === 'timeline' && (
              <TimelineView board={board} onOpenTask={openTask} />
            )}
            {view === 'activity' && (
              <ActivityView board={board} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Task detail drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        board={board}
        onClose={closeTask}
        onEdit={(t) => handleEditTask(t)}
        onDelete={(t) => handleDeleteTask(t)}
        onDuplicate={(t) => { board.duplicateTask(t.id); closeTask(); }}
      />

      {/* Task modal (create/edit) */}
      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        board={board}
        editTask={editTask}
      />

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete task?"
        message={`"${deleteTarget?.title}" will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
