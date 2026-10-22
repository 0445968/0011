import type { ProjectBody } from './schema';
import { distinctById } from './metrics';
import { suggestedTaskPriority } from './workplan-views';

export type OverviewSource<T> = { rows: T[]; error: null } | { rows: null; error: string };
export type OverviewContent = {
  files: OverviewSource<{id:string}>;
  links: OverviewSource<{task_id:string;file_id:string}>;
  notes: OverviewSource<{id:string;task_id:string}>;
  comments: OverviewSource<{id:string;task_id:string}>;
  priorities: OverviewSource<{task_id:string;priority:'low'|'medium'|'high'|'urgent'|null;blocker_owner:string|null;depends_on:string|null}>;
  schedule: OverviewSource<{task_id:string;start_on:string|null}>;
};

/** Read every page, using exact counts to detect truncated or changing reads.
 * Failure returns no partial rows: a partial preview must never become a total. */
export async function readOverviewRows<T>(read: (from:number,to:number) => PromiseLike<{data:T[]|null;error:unknown;count:number|null}>, label:string): Promise<OverviewSource<T>> {
  try {
    const rows:T[]=[];
    let expected:number|null=null;
    for (let from=0;;) {
      const result=await read(from,from+499);
      if(result.error || result.data===null || result.count===null) throw new Error('Unavailable');
      if(expected!==null && result.count!==expected) throw new Error('Changed during read');
      expected=result.count;
      rows.push(...result.data);
      if(rows.length===expected) return {rows,error:null};
      if(!result.data.length || rows.length>expected) throw new Error('Incomplete');
      from+=result.data.length;
    }
  } catch { return {rows:null,error:`${label} unavailable. Retry saved data.`}; }
}

/** Scope only includes saved top-level task IDs. Subtasks are never task denominators. */
export function milestoneContent(body:ProjectBody,milestoneId:string,content:OverviewContent,today:string) {
  const tasks=distinctById(body.tasks).filter(task=>task.milestoneId===milestoneId);
  const ids=new Set(tasks.map(task=>task.id));
  const count=(source:OverviewSource<{id:string;task_id:string}>)=>source.rows===null?null:
    new Set(source.rows.filter(row=>ids.has(row.task_id)).map(row=>row.id)).size;
  const accessibleFiles=new Set(content.files.rows?.map(file=>file.id));
  const files=content.files.rows===null||content.links.rows===null?null:
    new Set(content.links.rows.filter(row=>ids.has(row.task_id)&&accessibleFiles.has(row.file_id)).map(row=>row.file_id)).size;
  const taskContent=tasks.map(task=>{
    const control=content.priorities.rows?.find(row=>row.task_id===task.id);
    const dependency=body.tasks.find(item=>item.id===control?.depends_on);
    const paused=task.status==='done'||task.status==='blocked'||!control||!!control.blocker_owner||
      (!!control.depends_on&&dependency?.status!=='done');
    const start=content.schedule.rows?.find(row=>row.task_id===task.id)?.start_on??null;
    return {id:task.id,title:task.title,
      files:content.files.rows===null||content.links.rows===null?null:new Set(content.links.rows.filter(row=>row.task_id===task.id&&accessibleFiles.has(row.file_id)).map(row=>row.file_id)).size,
      notes:content.notes.rows===null?null:new Set(content.notes.rows.filter(row=>row.task_id===task.id).map(row=>row.id)).size,
      comments:content.comments.rows===null?null:new Set(content.comments.rows.filter(row=>row.task_id===task.id).map(row=>row.id)).size,
      manual:control?.priority??null,
      suggestion:content.schedule.rows===null||content.priorities.rows===null?null:suggestedTaskPriority(start,task.dueOn,today,paused),
      priorityAvailable:content.priorities.rows!==null&&!!control,
    };
  });
  const order={low:1,medium:2,high:3};
  const suggestions=taskContent.flatMap(task=>task.suggestion?[task.suggestion]:[]).sort((a,b)=>order[b]-order[a]);
  return {files,notes:count(content.notes),comments:count(content.comments),tasks:taskContent,
    priorityAvailable:content.priorities.rows!==null&&taskContent.every(task=>task.priorityAvailable),
    suggestion:content.schedule.rows===null||content.priorities.rows===null||taskContent.some(task=>!task.priorityAvailable)?'Unavailable':suggestions[0]??'Not calculated',
    manual:taskContent.filter(task=>task.manual!==null),
  };
}
