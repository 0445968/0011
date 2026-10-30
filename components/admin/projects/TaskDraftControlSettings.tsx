'use client';
import {projectPhaseLabels,projectPhaseOrder,type ProjectTaskControl} from '@/lib/projects/lifecycle-schema';
import type {ProjectBody} from '@/lib/projects/schema';
import type {TaskDraftEdits} from '@/lib/projects/task-draft-edits';
export function TaskDraftControlSettings({control,tasks,disabled,onChange}:{control:ProjectTaskControl;tasks:ProjectBody['tasks'];disabled:boolean;onChange:(value:NonNullable<TaskDraftEdits['control']>)=>void}){
 const value={ownerType:control.ownerType,phase:control.phase,serviceId:control.serviceId,dependsOn:control.dependsOn,blockerOwner:control.blockerOwner};
 const input='mt-1 min-h-9 w-full rounded-md border border-input bg-background px-2 text-xs';
 return <div className="grid grid-cols-2 gap-3 text-xs">
 <label>Phase<select className={input} disabled={disabled} value={value.phase} onChange={e=>onChange({...value,phase:e.target.value as typeof value.phase})}>{projectPhaseOrder.map(phase=><option key={phase} value={phase}>{projectPhaseLabels[phase]}</option>)}</select></label>
 <label>Depends on<select className={input} disabled={disabled} value={value.dependsOn??''} onChange={e=>onChange({...value,dependsOn:e.target.value||null})}><option value="">No prerequisite</option>{tasks.filter(task=>task.id!==control.taskId).map(task=><option key={task.id} value={task.id}>{task.title}</option>)}</select></label>
 <label>Blocker owner<select className={input} disabled={disabled} value={value.blockerOwner??''} onChange={e=>onChange({...value,blockerOwner:(e.target.value||null) as typeof value.blockerOwner})}><option value="">No blocker</option><option value="bivi">Bivi</option><option value="client">Client</option><option value="external">External</option></select></label>
 <label>Service reference<input className={input} disabled={disabled} maxLength={100} value={value.serviceId??''} onChange={e=>onChange({...value,serviceId:e.target.value||null})}/></label>
 </div>;
}
