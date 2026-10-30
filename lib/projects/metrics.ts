import {taskIsOverdue,taskDeadlineDay,type DeadlineContext} from './deadlines';
import type { ProjectBody } from './schema';
import type { ProjectPhase } from './lifecycle-schema';

/** Count identities, never joins, filtered rows, assignees or phase memberships. */
export function distinctById<T extends {id:string}>(items: readonly T[]): T[] {
  return [...new Map(items.map(item=>[item.id,item])).values()];
}

export function taskMetrics(tasks: ProjectBody['tasks'], today?: string,context?:Omit<DeadlineContext,'today'>) {
  const rows=distinctById(tasks);
  const done=rows.filter(task=>task.status==='done').length;
  const open=rows.filter(task=>task.status!=='done');
  return {total:rows.length,done,open:rows.length-done,
    blocked:open.filter(task=>!task.archived&&task.status==='blocked').length,
    percent:rows.length ? Math.round(done/rows.length*100) : null,
    overdue:today ? open.filter(task=>taskIsOverdue(task,{today,...context})).length : null,
    dueToday:today ? open.filter(task=>!task.archived&&taskDeadlineDay(task,context?.timezone)===today).length : null};
}

/** Direct phase is independent; milestone links add scope without replacing it. */
export function effectiveTaskPhases(
  task: Pick<ProjectBody['tasks'][number],'id'|'milestoneId'>,
  controls: readonly {taskId:string;phase:ProjectPhase}[],
  links: readonly {milestoneId:string;phase:ProjectPhase}[],
): ProjectPhase[] {
  return [...new Set([...controls.filter(row=>row.taskId===task.id).map(row=>row.phase),
    ...links.filter(row=>row.milestoneId===task.milestoneId).map(row=>row.phase)])];
}
