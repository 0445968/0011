import type {ProjectHierarchyResponse,ProjectHierarchyCommand} from './hierarchy-schema';

type Command=ProjectHierarchyCommand extends infer T?T extends unknown?Omit<T,'expectedProjectRevision'|'expectedHierarchyRevision'>:never:never;
/** Verify an uncertain hierarchy write by its stable identity and submitted fields. */
export function hierarchyCommandSaved(command:Command,data:ProjectHierarchyResponse,previousHierarchyRevision:number){
  if(data.hierarchyRevision<=previousHierarchyRevision)return false;
  if(command.action==='set_milestone_phases'){
    const actual=data.milestonePhases.filter(row=>row.milestoneId===command.milestoneId).map(row=>row.phase).sort();
    return JSON.stringify(actual)===JSON.stringify([...command.phases].sort());
  }
  const row=data.subtasks.find(row=>row.id===command.subtaskId);
  if(command.action==='remove_subtask')return !row;
  return Boolean(row&&row.taskId===command.taskId&&row.title===command.title&&row.status===command.status&&row.dueOn===command.dueOn);
}
