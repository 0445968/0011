import type { ProjectBody } from './schema';
import { distinctById, taskMetrics } from './metrics';
import { projectPhaseOrder, type ProjectPhase } from './lifecycle-schema';

export type PhaseTaskState = 'unknown' | 'not_started' | 'in_progress' | 'completed';
export interface DirectoryTaskPhase { taskId: string; phase: ProjectPhase }

/** Task evidence only. Never treats an earlier phase as approved or completed. */
export function directoryProgress(body: ProjectBody, controls: DirectoryTaskPhase[]) {
  const {done,total,percent} = taskMetrics(body.tasks);
  const phases = projectPhaseOrder.map(phase => {
    const ids = new Set(controls.filter(control => control.phase === phase).map(control => control.taskId));
    const tasks = distinctById(body.tasks).filter(task => ids.has(task.id));
    const completed = tasks.filter(task => task.status === 'done').length;
    const blocked = tasks.filter(task => task.status === 'blocked').length;
    const active = tasks.some(task => task.status === 'doing' || task.status === 'blocked');
    const state: PhaseTaskState = !tasks.length ? 'unknown'
      : completed === tasks.length ? 'completed'
      : active || completed > 0 ? 'in_progress' : 'not_started';
    return { phase, state, total: tasks.length, done: completed, blocked };
  });
  const mapped = new Set(controls.map(control => control.taskId));
  return {
    done, total, percent, phases,
    unassigned: distinctById(body.tasks).filter(task => !mapped.has(task.id)).length,
    activePhases: phases.filter(phase => phase.state === 'in_progress'),
  };
}
