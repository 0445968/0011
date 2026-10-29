import {taskDeadlineDay,taskIsOverdue} from './deadlines';
import type { ProjectBody } from './schema';
import { effectiveTaskPhases } from './metrics';
import type { ProjectPhase, ProjectTaskControl } from './lifecycle-schema';
import type { ProjectHierarchyResponse } from './hierarchy-schema';
import type { ProjectAssignmentWorkspace } from './assignment-schema';

type Task = ProjectBody['tasks'][number];
type Milestone = ProjectBody['milestones'][number];
export type WorkplanFilters = {
  query: string;
  phase: 'all' | 'unassigned' | ProjectPhase;
  side: 'all' | 'bivi' | 'client' | 'unknown';
  assignee: string;
  status: 'all' | 'open' | 'not_started' | 'in_progress' | 'blocked' | 'done';
  deadline: 'all' | 'overdue' | 'today' | 'next7' | 'dated' | 'undated';
  from: string;
  to: string;
};
export const emptyWorkplanFilters: WorkplanFilters = { query:'', phase:'all', side:'all', assignee:'all', status:'all', deadline:'all', from:'', to:'' };
export type WorkplanFilterContext = {
  body: ProjectBody;
  links: ProjectHierarchyResponse['milestonePhases'];
  controls: ProjectTaskControl[];
  assignments: ProjectAssignmentWorkspace['tasks'];
  today: string;
  timezone?:string;now?:string;
};

/** A task keeps its canonical phase and also belongs to its milestone's linked phases. */
export function workplanTaskPhases(task: Task, context: WorkplanFilterContext): ProjectPhase[] {
  return effectiveTaskPhases(task,context.controls,context.links);
}

function statusMatches(status: Task['status'] | Milestone['status'], filter: WorkplanFilters['status']) {
  return filter==='all' || (filter==='open' ? status!=='done' : filter==='not_started' ? status==='todo'||status==='planned'
    : filter==='in_progress' ? status==='doing'||status==='in_progress' : status===filter);
}

function dateMatches(dueOn: string|null, status: string, filters: WorkplanFilters, today: string,task?:Task,context?:WorkplanFilterContext) {
  if(task)dueOn=taskDeadlineDay(task,context?.timezone);
  if (filters.from && (!dueOn || dueOn<filters.from)) return false;
  if (filters.to && (!dueOn || dueOn>filters.to)) return false;
  if (filters.deadline==='all') return true;
  if (filters.deadline==='undated') return !dueOn;
  if (!dueOn) return false;
  if (filters.deadline==='dated') return true;
  if (filters.deadline==='overdue') return task?taskIsOverdue(task,{today,timezone:context?.timezone,now:context?.now}):status!=='done' && dueOn<today;
  if (filters.deadline==='today') return dueOn===today;
  const end = new Date(`${today}T12:00:00Z`);
  end.setUTCDate(end.getUTCDate()+6);
  return dueOn>=today && dueOn<=end.toISOString().slice(0,10);
}

function phaseMatches(phases: ProjectPhase[], filter: WorkplanFilters['phase']) {
  return filter==='all' || (filter==='unassigned' ? !phases.length : phases.includes(filter));
}

export function workplanTaskMatches(task: Task, filters: WorkplanFilters, context: WorkplanFilterContext) {
  const assignment=context.assignments.find(row=>row.task_id===task.id);
  const milestone=context.body.milestones.find(row=>row.id===task.milestoneId);
  const query=filters.query.trim().toLocaleLowerCase();
  if (query && ![task.title,task.notes,task.owner,milestone?.title??''].some(value=>value.toLocaleLowerCase().includes(query))) return false;
  if (!phaseMatches(workplanTaskPhases(task,context),filters.phase)) return false;
  if (filters.side!=='all' && (assignment?.side??'unknown')!==filters.side) return false;
  if (filters.assignee==='unassigned' && (!assignment || assignment.assignees.length>0)) return false;
  if (filters.assignee!=='all' && filters.assignee!=='unassigned' && !assignment?.assignees.includes(filters.assignee)) return false;
  return statusMatches(task.status,filters.status) && dateMatches(task.dueOn,task.status,filters,context.today,task,context);
}

/** Child criteria must match the same task; unrelated children cannot satisfy different filters. */
export function workplanMilestoneMatches(milestone: Milestone, filters: WorkplanFilters, context: WorkplanFilterContext) {
  if (context.body.tasks.some(task=>task.milestoneId===milestone.id && workplanTaskMatches(task,filters,context))) return true;
  if (filters.side!=='all' || filters.assignee!=='all') return false;
  const query=filters.query.trim().toLocaleLowerCase();
  return (!query || milestone.title.toLocaleLowerCase().includes(query))
    && phaseMatches(context.links.filter(link=>link.milestoneId===milestone.id).map(link=>link.phase),filters.phase)
    && statusMatches(milestone.status,filters.status) && dateMatches(milestone.dueOn,milestone.status,filters,context.today);
}

export type TaskGrouping = 'none' | 'milestone' | 'status' | 'side';
export function groupWorkplanTasks(tasks: Task[], grouping: TaskGrouping, context: WorkplanFilterContext) {
  const groups=new Map<string,{key:string;label:string;tasks:Task[]}>();
  const labels: Record<string,string>={todo:'To do',doing:'In progress',blocked:'Blocked',done:'Completed',bivi:'Bivi',client:'Client',unknown:'Responsibility not saved'};
  for (const task of tasks) {
    const key=grouping==='milestone' ? task.milestoneId??'unassigned' : grouping==='status' ? task.status
      : grouping==='side' ? context.assignments.find(row=>row.task_id===task.id)?.side??'unknown' : 'all';
    const label=grouping==='milestone' ? context.body.milestones.find(row=>row.id===key)?.title??'Unassigned tasks' : grouping==='none' ? 'Tasks' : labels[key];
    if (!groups.has(key)) groups.set(key,{key,label,tasks:[]});
    groups.get(key)!.tasks.push(task);
  }
  return [...groups.values()];
}
