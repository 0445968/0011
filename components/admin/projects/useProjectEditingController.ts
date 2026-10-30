'use client';
import {useCallback,useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {useRouter} from 'next/navigation';
import {projectBodySchema,type ProjectBody} from '@/lib/projects/schema';
import {normalizeWorkplanBodyForSave,projectBodiesEqual} from '@/lib/projects/workplan-merge';
import {readSavedProject,savedCandidateMatches,submitProjectWorkplan,type SavedProject} from '@/lib/projects/editing';
import type { ProjectWorkflowGate } from '@/lib/projects/workplan-save-outcome';
import {projectMutationEvent,refreshProjectSurfaces} from '@/lib/projects/refresh';
import {useProjectWorkDraft} from './useProjectWorkDraft';

type RecordState={body:ProjectBody;revision:number;state:string}|null;
type Blocker={milestoneId:string;milestoneTitle:string;needsTask:boolean;tasks:{taskId:string;title:string;taskIncomplete:boolean;subtasks:{id:string;title:string}[]}[]};

/** One canonical editor for Overview, compact Plan and advanced Plan. */
export function useProjectEditingController(id:string,record:RecordState,initialAdvanced=false,userId?:string){
  const router=useRouter();
  const [bodyState,setBodyState]=useState<ProjectBody|undefined>(record?.body);
  const [savedState,setSavedState]=useState<ProjectBody|undefined>(record?.body);
  const [revisionState,setRevisionState]=useState(record?.revision??0);
  const local=useRef(bodyState),baseline=useRef(savedState),revision=useRef(revisionState);
  const setBody:Dispatch<SetStateAction<ProjectBody|undefined>>=useCallback(next=>{const value=typeof next==='function'?next(local.current):next;local.current=value;setBodyState(value);},[]);
  const setSavedBody:Dispatch<SetStateAction<ProjectBody|undefined>>=useCallback(next=>{const value=typeof next==='function'?next(baseline.current):next;baseline.current=value;setSavedState(value);},[]);
  const setSavedRevision:Dispatch<SetStateAction<number>>=useCallback(next=>{const value=typeof next==='function'?next(revision.current):next;revision.current=value;setRevisionState(value);},[]);
  const [busy,setBusy]=useState(false),[blocked,setBlocked]=useState(false),[message,setMessage]=useState('');
  const [saveOutcomeUnknown,setSaveOutcomeUnknown]=useState(false);
  const [savePhase,setSavePhase]=useState<'idle'|'saving'|'saved'|'failed'|'uncertain'>('idle');
  const [serverBlockers,setServerBlockers]=useState<Blocker[]>([]);
  const [workflowGate,setWorkflowGate]=useState<ProjectWorkflowGate|null>(null);
  const [advanced,setAdvanced]=useState(initialAdvanced);
  const pending=useRef(false),active=useRef(true);
  const submitted=useRef<{body:ProjectBody;revision:number}|null>(null);
  useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
  const completed=record?.state==='completed';
  const drafts=useProjectWorkDraft({id,userId,initialRevision:record?.revision??0,revision:revisionState,body:bodyState,savedBody:savedState,
    enabled:Boolean(record&&!completed),busy,setBody,setSavedBody,setRevision:setSavedRevision});
  const dirty=Boolean(bodyState&&savedState&&!projectBodiesEqual(bodyState,savedState));

  async function adoptSaved(candidate:ProjectBody,current:SavedProject,warning?:string){
    const cleared=await drafts.clearSavedDraft(candidate);
    if(!active.current)return false;
    drafts.acceptSaved(candidate,current.body,current.revision);
    submitted.current=null;
    setServerBlockers([]);setWorkflowGate(null);setSaveOutcomeUnknown(false);setBlocked(false);
    // Compare with the submitted snapshot, not the server-normalized result.
    // Trigger-side milestone normalization is not a newer user edit.
    const newer=Boolean(local.current&&!projectBodiesEqual(local.current,candidate));
    setSavePhase(newer?'idle':'saved');
    setMessage(`Submitted work-plan changes saved.${newer?' Newer edits remain in your private draft.':''}${warning?` ${warning}`:!cleared?' The private draft could not be cleared; refresh draft status before continuing.':''}`);
    try{refreshProjectSurfaces(id,router);}catch{setMessage('Submitted changes saved. Refresh saved views to update their display.');}
    return !newer;
  }

  async function reconcileLatest(current:SavedProject){
    if(!active.current)return;
    const result=drafts.reconcile(current.body,current.revision);
    submitted.current=null;
    setBlocked(false);setSaveOutcomeUnknown(false);
    setSavePhase(result.conflicts.length?'failed':'idle');
    setMessage(result.conflicts.length?'The saved project changed. Resolve the conflicting fields before saving.':'The latest saved project is loaded. Your nonconflicting edits remain for review and Save all.');
  }

  async function checkUncertainSave(){
    if(pending.current)return false;
    pending.current=true;setBusy(true);
    try{
      await drafts.suspendAutosaves();
      const current=await readSavedProject(id);
      if(!active.current)return false;
      const attempt=submitted.current;
      if(attempt&&savedCandidateMatches(attempt.body,attempt.revision,current))return await adoptSaved(attempt.body,current);
      if(current.revision!==revision.current||!baseline.current||!projectBodiesEqual(current.body,baseline.current))await reconcileLatest(current);
      else{setSaveOutcomeUnknown(false);setBlocked(false);setSavePhase('idle');setMessage(local.current&&baseline.current&&projectBodiesEqual(local.current,baseline.current)?'Saved project data is current.':'The latest saved revision has not changed. Your edits remain available for a revision-checked retry.');}
      router.refresh();
      return false;
    }catch(cause){if(active.current){setSavePhase('uncertain');setMessage(cause instanceof Error?cause.message:'The saved project could not be checked.');}return false;}
    finally{pending.current=false;drafts.resumeAutosaves();if(active.current)setBusy(false);}
  }

  async function save(taskId?:string){
    if(pending.current||busy||blocked||completed||saveOutcomeUnknown)return false;
    if(!drafts.ready||drafts.recoverable||drafts.conflict){setMessage('Restore, discard or reconcile the private draft before Save all.');return false;}
    let candidate=local.current;
    if(taskId&&candidate&&baseline.current){
      const task=candidate.tasks.find(item=>item.id===taskId);
      if(!task)return false;
      if(task.milestoneId&&!baseline.current.milestones.some(item=>item.id===task.milestoneId)){
        setMessage('Save all changes to create this task’s draft milestone first.');return false;
      }
      // Save only this task, preserving saved ordering and all other draft edits.
      const saved=baseline.current;
      candidate={...saved,tasks:saved.tasks.some(item=>item.id===taskId)
        ?saved.tasks.map(item=>item.id===taskId?task:item):[...saved.tasks,task]};
      if(projectBodiesEqual(candidate,saved))return false;
    }
    if(!candidate||!dirty)return false;
    if(!projectBodySchema.safeParse(candidate).success){setSavePhase('failed');setMessage('Check the project title, task names, dates, times and milestone assignments.');return false;}
    pending.current=true;setBusy(true);setSavePhase('saving');setMessage('Saving submitted work-plan changes…');
    const attempt={body:candidate,revision:revision.current};submitted.current=attempt;
    try{
      await drafts.suspendAutosaves();
      const outcome=await submitProjectWorkplan(id,attempt.body,attempt.revision);
      if(!active.current)return false;
      if(outcome.kind==='saved')return await adoptSaved(attempt.body,{body:outcome.body??normalizeWorkplanBodyForSave(attempt.body),revision:outcome.revision},outcome.refreshWarning);
      if(outcome.kind==='revision_conflict'){await reconcileLatest(await readSavedProject(id));return false;}
      if(outcome.kind==='validation_rejected'){setSavePhase('failed');submitted.current=null;setServerBlockers(outcome.blockers as Blocker[]);setWorkflowGate(outcome.workflowGate??null);setMessage(outcome.error);return false;}
      if(outcome.kind==='unknown')throw new Error(outcome.error);
      submitted.current=null;setSavePhase('failed');setMessage(outcome.error);return false;
    }catch(cause){
      if(!active.current)return false;
      try{
        const current=await readSavedProject(id);
        if(!active.current)return false;
        if(savedCandidateMatches(attempt.body,attempt.revision,current))return await adoptSaved(attempt.body,current);
        if(current.revision!==attempt.revision){await reconcileLatest(current);return false;}
      }catch{/* Preserve edits and require an explicit check before retry. */}
      if(active.current){setSavePhase('uncertain');setSaveOutcomeUnknown(true);setMessage(`Save outcome is uncertain. Check save status before retrying. ${cause instanceof Error?cause.message:''}`);}
      return false;
    }finally{pending.current=false;drafts.resumeAutosaves();if(active.current)setBusy(false);}
  }

  async function discard(){
    if(pending.current||busy)return false;
    pending.current=true;setBusy(true);
    try{const ok=await drafts.discardDraft();if(ok&&active.current){setSavePhase('idle');setServerBlockers([]);setWorkflowGate(null);setSaveOutcomeUnknown(false);setBlocked(false);setMessage('Private draft discarded. The latest saved project is loaded.');}return ok;}
    finally{pending.current=false;if(active.current)setBusy(false);}
  }
  // Sidecar events request a canonical read/rebase, never just a newer revision token.
  useEffect(()=>{
    const changed=(event:Event)=>{if((event as CustomEvent).detail?.projectId===id&&!pending.current)void checkUncertainSave();};
    window.addEventListener(projectMutationEvent,changed);return()=>window.removeEventListener(projectMutationEvent,changed);
  });
  return {body:bodyState,savedBody:savedState,savedRevision:revisionState,setBody,setSavedBody,setSavedRevision,
    busy,setBusy,blocked,setBlocked,message,setMessage,saveOutcomeUnknown,setSaveOutcomeUnknown,serverBlockers,setServerBlockers,workflowGate,setWorkflowGate,
    dirty,drafts,save,savePhase,discard,checkUncertainSave,advanced,setAdvanced};
}
