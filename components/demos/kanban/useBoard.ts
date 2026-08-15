'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  seedTasks,
  seedActivity,
  currentUserId,
  type Task,
  type Subtask,
  type Comment,
  type Activity,
  type Status,
  type Priority,
} from '@/data/demos/kanban';
import {
  emptyFilters,
  matchFilters,
  matchSearch,
  sortTasks,
  type Filters,
  type SortKey,
} from './utils';

let idCounter = 1000;
const nextId = (prefix: string) => `${prefix}${idCounter++}`;
const nowISO = () => new Date('2026-08-22T10:00:00').toISOString();

export interface NewTaskInput {
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  labelIds?: string[];
  assigneeIds?: string[];
  dueDate?: string | null;
}

export function useBoard() {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [activity, setActivity] = useState<Activity[]>(seedActivity);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sort, setSort] = useState<SortKey>('manual');

  // --- Activity logging ---
  const logActivity = useCallback((entry: Omit<Activity, 'id' | 'timestamp'>) => {
    setActivity((prev) => [
      { ...entry, id: nextId('a'), timestamp: nowISO() },
      ...prev,
    ]);
  }, []);

  // --- Task CRUD ---
  const addTask = useCallback((input: NewTaskInput) => {
    const status = input.status;
    const orderInColumn = tasks.filter((t) => t.status === status).length;
    const task: Task = {
      id: nextId('t'),
      title: input.title,
      description: input.description ?? '',
      status,
      priority: input.priority,
      labelIds: input.labelIds ?? [],
      assigneeIds: input.assigneeIds ?? [],
      dueDate: input.dueDate ?? null,
      subtasks: [],
      comments: [],
      createdAt: nowISO(),
      updatedAt: nowISO(),
      order: orderInColumn,
    };
    setTasks((prev) => [...prev, task]);
    logActivity({
      actorId: currentUserId,
      action: 'created',
      taskId: task.id,
      taskTitle: task.title,
      toStatus: status,
    });
  }, [tasks, logActivity]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: nowISO() } : t))
    );
  }, []);

  const moveTask = useCallback((id: string, toStatus: Status, toIndex: number) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (!task) return prev;
      const fromStatus = task.status;
      const moved = fromStatus !== toStatus;

      // Remove from source, get target column tasks
      const withoutTask = prev.filter((t) => t.id !== id);
      const targetCol = withoutTask
        .filter((t) => t.status === toStatus)
        .sort((a, b) => a.order - b.order);

      // Insert at position
      const updatedTask: Task = {
        ...task,
        status: toStatus,
        updatedAt: nowISO(),
      };
      targetCol.splice(toIndex, 0, updatedTask);

      // Reindex target column
      const reindexedTarget = targetCol.map((t, i) => ({ ...t, order: i }));

      // Reindex source column if different
      let reindexedSource: Task[] = [];
      if (moved) {
        const sourceCol = withoutTask
          .filter((t) => t.status === fromStatus)
          .sort((a, b) => a.order - b.order);
        reindexedSource = sourceCol.map((t, i) => ({ ...t, order: i }));
      }

      // Merge
      const others = withoutTask.filter(
        (t) => t.status !== toStatus && t.status !== fromStatus
      );
      return [...others, ...reindexedTarget, ...reindexedSource];
    });

    // Log if status changed
    const task = tasks.find((t) => t.id === id);
    if (task && task.status !== toStatus) {
      logActivity({
        actorId: currentUserId,
        action: 'moved',
        taskId: id,
        taskTitle: task.title,
        fromStatus: task.status,
        toStatus,
      });
    }
  }, [tasks, logActivity]);

  const deleteTask = useCallback((id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      logActivity({
        actorId: currentUserId,
        action: 'deleted',
        taskId: null,
        taskTitle: task.title,
      });
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, [tasks, logActivity]);

  const duplicateTask = useCallback((id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const orderInColumn = tasks.filter((t) => t.status === task.status).length;
    const newTask: Task = {
      ...task,
      id: nextId('t'),
      title: `${task.title} copy`,
      status: 'backlog',
      order: tasks.filter((t) => t.status === 'backlog').length,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      subtasks: task.subtasks.map((s) => ({ ...s, id: nextId('s'), done: false })),
      comments: [],
    };
    setTasks((prev) => [...prev, newTask]);
    logActivity({
      actorId: currentUserId,
      action: 'duplicated',
      taskId: newTask.id,
      taskTitle: newTask.title,
      toStatus: 'backlog',
    });
  }, [tasks, logActivity]);

  // --- Subtasks ---
  const addSubtask = useCallback((taskId: string, title: string) => {
    const sub: Subtask = { id: nextId('s'), title, done: false };
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, subtasks: [...t.subtasks, sub], updatedAt: nowISO() } : t
      )
    );
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const subtasks = t.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, done: !s.done } : s
        );
        return { ...t, subtasks, updatedAt: nowISO() };
      })
    );
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId), updatedAt: nowISO() }
          : t
      )
    );
  }, []);

  // --- Comments ---
  const addComment = useCallback((taskId: string, text: string) => {
    const comment: Comment = {
      id: nextId('c'),
      authorId: currentUserId,
      text,
      createdAt: nowISO(),
    };
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, comments: [...t.comments, comment], updatedAt: nowISO() } : t
      )
    );
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      logActivity({
        actorId: currentUserId,
        action: 'commented on',
        taskId,
        taskTitle: task.title,
      });
    }
  }, [tasks, logActivity]);

  const deleteComment = useCallback((taskId: string, commentId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, comments: t.comments.filter((c) => c.id !== commentId), updatedAt: nowISO() }
          : t
      )
    );
  }, []);

  // --- Filters ---
  const setFilter = useCallback((key: keyof Filters, value: Filters[keyof Filters]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(emptyFilters);
    setSearch('');
  }, []);

  // --- Derived: filtered + sorted tasks ---
  const filteredTasks = useMemo(() => {
    let result = tasks.filter((t) => matchFilters(t, filters, currentUserId));
    if (search) {
      result = result.filter((t) => matchSearch(t, search));
    }
    if (sort !== 'manual') {
      result = sortTasks(result, sort);
    }
    return result;
  }, [tasks, filters, search, sort]);

  // --- Reset ---
  const reset = useCallback(() => {
    setTasks(seedTasks);
    setActivity(seedActivity);
    setSearch('');
    setFilters(emptyFilters);
    setSort('manual');
  }, []);

  return {
    tasks,
    filteredTasks,
    activity,
    search,
    setSearch,
    filters,
    setFilter,
    clearFilters,
    sort,
    setSort,
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    duplicateTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addComment,
    deleteComment,
    logActivity,
    reset,
  };
}

export type BoardState = ReturnType<typeof useBoard>;
