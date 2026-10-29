'use client';
import {postProjectCommand,confirmProjectCommandRead,ProjectCommandError} from '@/lib/projects/immediate-command';
import {useProjectMutationRefresh} from './useProjectMutationRefresh';
import {refreshProjectSurfaces} from '@/lib/projects/refresh';

import Link from 'next/link';
import { useEffect, useRef, useState, useId, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceUnsavedChanges } from '../workspace/WorkspaceNavigationGuard';
import { MessageSquareText, Paperclip, StickyNote } from 'lucide-react';

type Note = { id:string; body:string; author_id:string|null; revision:number; created_at:string; updated_at:string };
type FileRow = { id:string; filename:string };
type TaskComment = { id:string; body:string; author_id:string|null; created_at:string; updated_at:string; revision:number };
type TaskContext = { projectRevision:number; priority:string|null; notes:Note[]; comments:TaskComment[]; files:FileRow[]; noteCount:number;commentCount:number;fileCount:number;linkedFileIds?:string[]; availableFiles:FileRow[] };

export function TaskProductivity({projectId,taskId,taskTitle,revision,disabled,userId,onPriority,hidePriority=false,workplanEditable=false,workplanDescription,onWorkplanDescriptionChange,tabbed=false,activity}: {
  tabbed?:boolean;activity?:ReactNode;
  projectId:string;taskId:string;taskTitle:string;revision:number;disabled:boolean;userId:string;
  onPriority?:(priority:string|null)=>void;
  hidePriority?:boolean;workplanEditable?:boolean;workplanDescription?:string;onWorkplanDescriptionChange?:(value:string)=>void;
}) {
  const router=useRouter();
  const [tab,setTab]=useState('activity');const tabId=useId();

  const [open,setOpen]=useState(false);
  const [data,setData]=useState<TaskContext|null>(null);
  const [draft,setDraft]=useState('');
  const [editId,setEditId]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(false);
  const [busyLabel,setBusyLabel]=useState('Saving task details…');
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const loadGeneration=useRef(0);
  const latestData=useRef<TaskContext|null>(null);
  const noteCreateId=useRef<string|null>(null);
  const [commentDraft,setCommentDraft]=useState('');
  const [commentBusy,setCommentBusy]=useState(false);
  const [commentError,setCommentError]=useState('');
  const [commentMessage,setCommentMessage]=useState('');
  const pendingComment=useRef<{id:string;body:string;taskId:string;expectedProjectRevision:number}|null>(null);
  const noteDirty=editId ? draft!==(data?.notes.find(note=>note.id===editId)?.body??'') : Boolean(draft);
  useWorkspaceUnsavedChanges(noteDirty,`Task note: ${taskTitle}`,async()=>{
    const note=data?.notes.find(item=>item.id===editId);
    const saved=note?await editNote(note):await addNote();
    if(!saved)throw new Error('Task note was not saved. Save the work plan first if it has other edits.');
  });
  useWorkspaceUnsavedChanges(Boolean(commentDraft.trim()),`Task comment: ${taskTitle}`,async()=>{
    if(!await submitComment())throw new Error('Task comment could not be saved.');
  });
  const endpoint=`/api/admin/projects/${projectId}/task-productivity`;
  async function load(){
    const generation=++loadGeneration.current;
    setLoading(true);
    try { const response=await fetch(`${endpoint}?taskId=${encodeURIComponent(taskId)}`,{cache:'no-store'});const json=await response.json();if(generation!==loadGeneration.current)return false;if(!response.ok)throw new Error(json.error||'Task details could not load.');latestData.current=json as TaskContext;confirmProjectCommandRead(endpoint);setData(json as TaskContext);setError('');return true; }
    catch(cause){if(generation===loadGeneration.current)setError(cause instanceof Error?cause.message:'Task details could not load.');return false;}
    finally{if(generation===loadGeneration.current)setLoading(false);}
  }
  useEffect(()=>{void load();},[revision,taskId]);
  useProjectMutationRefresh(projectId,load);
  async function save(payload:Record<string,unknown>){
    if(busy||disabled||loading)return false;setBusy(true);setBusyLabel('Saving task details…');setError('');setMessage('');
    try{
      await postProjectCommand(endpoint,{...payload,expectedProjectRevision:revision});
      const refreshed=await load();setMessage(refreshed?'Task details saved.':'Task details saved. Refresh their display before another change.');refreshProjectSurfaces(projectId,router);return true;
    }catch(cause){
      if(cause instanceof ProjectCommandError&&cause.kind==='unknown'&&await load()){
        const current=latestData.current;
        const verified=payload.action==='note_create'||payload.action==='note_edit'?current?.notes.some(note=>note.id===payload.noteId&&note.body===payload.body)
          :payload.action==='note_remove'?!current?.notes.some(note=>note.id===payload.noteId)
          :payload.action==='file_link'?current?.linkedFileIds?.includes(String(payload.fileId))
          :payload.action==='file_unlink'?current?.linkedFileIds!==undefined&&!current.linkedFileIds.includes(String(payload.fileId))
          :payload.action==='priority'?current?.priority===payload.priority:false;
        if(verified){setMessage('Task details saved and verified after the response was lost.');refreshProjectSurfaces(projectId,router);return true;}
      }
      setError(cause instanceof Error?cause.message:'Task update could not save.');return false;
    }finally{setBusy(false);}
  }

  async function addNote(){if(!draft.trim())return false;const id=noteCreateId.current??crypto.randomUUID();noteCreateId.current=id;const saved=await save({action:'note_create',taskId,noteId:id,body:draft.trim()});if(saved){noteCreateId.current=null;setDraft('');}return saved;}
  async function editNote(note:Note){if(!draft.trim())return false;const saved=await save({action:'note_edit',taskId,noteId:note.id,expectedNoteRevision:note.revision,body:draft.trim()});if(saved){setDraft('');setEditId(null);}return saved;}
  async function removeNote(note:Note){await save({action:'note_remove',taskId,noteId:note.id,expectedNoteRevision:note.revision});}
  async function submitComment(){
    const trimmed=commentDraft.trim();
    if(!trimmed||disabled||commentBusy||busy||loading||trimmed.length>4000)return false;
    if(!pendingComment.current||pendingComment.current.body!==trimmed||pendingComment.current.taskId!==taskId||pendingComment.current.expectedProjectRevision!==revision){
      pendingComment.current={id:crypto.randomUUID(),body:trimmed,taskId,expectedProjectRevision:revision};
    }
    const submitted=pendingComment.current;
    setCommentBusy(true);setCommentError('');setCommentMessage('');
    try{
      const response=await fetch(`/api/admin/projects/${projectId}/comments`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create',...submitted}),signal:AbortSignal.timeout(20000)});
      const result=await response.json();
      if(!response.ok||!result.saved)throw new Error(result.error||'Comment could not be saved.');
      pendingComment.current=null;setCommentDraft('');setCommentMessage('Comment posted.');
      await load();refreshProjectSurfaces(projectId,router);return true;
    }catch(cause){
      const refreshed=await load();
      if(refreshed&&latestData.current?.comments.some(comment=>comment.id===submitted.id&&comment.body===submitted.body)){
        pendingComment.current=null;setCommentDraft('');setCommentMessage('Comment saved and verified.');refreshProjectSurfaces(projectId,router);return true;
      }
      setCommentError(cause instanceof Error?cause.message:'Comment result is uncertain. Refresh before retrying.');
      return false;
    }finally{setCommentBusy(false);}
  }
  async function preview(file:FileRow){
    if(busy||loading)return;setBusy(true);setBusyLabel('Opening file preview…');setError('');
    try{const response=await fetch(`/api/admin/projects/${projectId}/files/${file.id}/preview`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(20000)});const result=await response.json();if(!response.ok||typeof result.url!=='string')throw new Error(result.error||'File preview could not be opened.');window.open(result.url,'_blank','noopener,noreferrer');}
    catch(cause){setError(cause instanceof Error?cause.message:'File preview could not be opened.');}finally{setBusy(false);}
  }
  return <>{!hidePriority&&data&&<div className="flex flex-wrap items-center gap-2"><label htmlFor={`priority-${taskId}`} className="text-xs font-medium">Priority</label><select id={`priority-${taskId}`} className="rounded-md border border-input bg-background px-2 py-1.5 text-xs" disabled={disabled||busy||loading} value={data.priority??''} onChange={async event=>{const value=event.target.value||null;if(await save({action:'priority',taskId,priority:value}))onPriority?.(value);}}><option value="">Not set</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>}
  <details open={tabbed?true:undefined} className="mt-2 pt-2" onToggle={event=>{const next=event.currentTarget.open;setOpen(next);if(next)void load();}}>
    <summary style={tabbed?{display:'none'}:undefined} hidden={tabbed} className={(tabbed?"hidden ":"")+"flex cursor-pointer list-none flex-wrap items-center gap-3 text-[11px] text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"}>
      <span title="Notes" aria-label={`Notes: ${data?.noteCount??'loading'}`} className="inline-flex items-center gap-1"><StickyNote size={13} aria-hidden/>{data?.noteCount??'…'}</span>
      <span title="Comments" aria-label={`Comments: ${data?.commentCount??'loading'}`} className="inline-flex items-center gap-1"><MessageSquareText size={13} aria-hidden/>{data?.commentCount??'…'}</span>
      <span title="Files" aria-label={`Files: ${data?.fileCount??'loading'}`} className="inline-flex items-center gap-1"><Paperclip size={13} aria-hidden/>{data?.fileCount??'…'}</span>
    </summary>
    {(tabbed||open)&&<div className="mt-3 space-y-4 rounded-lg bg-white p-2 dark:bg-card">
      {tabbed&&<><div role="tablist" aria-label="Task details" className="flex gap-4 overflow-x-auto border-b border-border">{[{id:'activity',label:'Activity',count:null},{id:'files',label:'Files',count:data?.fileCount},{id:'comments',label:'Comments',count:data?.commentCount},{id:'notes',label:'Private Notes',count:data?.noteCount}].map(item=><button key={item.id} type="button" role="tab" id={tabId+'-'+item.id} aria-controls={tabId+'-panel-'+item.id} aria-selected={tab===item.id} tabIndex={tab===item.id?0:-1} onClick={()=>setTab(item.id)} onKeyDown={event=>{const ids=['activity','files','comments','notes'];const index=ids.indexOf(item.id);const next=event.key==='ArrowRight'?ids[(index+1)%4]:event.key==='ArrowLeft'?ids[(index+3)%4]:event.key==='Home'?ids[0]:event.key==='End'?ids[3]:null;if(next){event.preventDefault();setTab(next);document.getElementById(tabId+'-'+next)?.focus();}}} className={'relative shrink-0 px-1 py-3 text-xs font-medium focus-visible:ring-2 focus-visible:ring-ring '+(tab===item.id?'text-primary':'text-muted-foreground')}>{item.label}{item.count!=null&&<span className="ml-1 text-[10px]">{item.count}</span>}{tab===item.id&&<span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transition-all"/>}</button>)}</div><section role="tabpanel" id={tabId+'-panel-activity'} aria-labelledby={tabId+'-activity'} hidden={tab!=='activity'}>{activity}</section></>}
      {onWorkplanDescriptionChange&&<label className="block text-xs font-medium">Task description<textarea aria-label={'Task description for '+taskTitle} className="mt-2 min-h-20 w-full rounded-md border border-input bg-background p-2 text-xs" value={workplanDescription??''} onChange={event=>onWorkplanDescriptionChange(event.target.value)} disabled={!workplanEditable} maxLength={2000}/></label>}
      {noteDirty&&<p role="status" className="text-xs text-amber-800 dark:text-amber-200">Unsaved task note. Save or cancel this note draft below.</p>}
      {loading&&<p role="status" className="text-xs text-muted-foreground">Loading saved task details…</p>}
      {data&&<>

        <section hidden={tabbed&&tab!=='notes'} role={tabbed?'tabpanel':undefined} id={tabbed?tabId+'-panel-notes':undefined} aria-labelledby={tabbed?tabId+'-notes':undefined} aria-label={`Notes for ${taskTitle}`}><h4 className="text-xs font-semibold">Private task notes</h4><ul className="mt-2 space-y-2">{data.notes.map(note=><li key={note.id} className="rounded-md border border-border bg-background p-2"><p className="whitespace-pre-wrap break-words text-xs">{note.body}</p><p className="mt-1 text-[10px] text-muted-foreground">{new Date(note.updated_at).toLocaleString('en-US',{timeZone:'America/Chicago'})}</p>{note.author_id===userId&&!disabled&&<div className="mt-2 flex gap-3 text-[11px]"><button type="button" className="underline" onClick={()=>{setEditId(note.id);setDraft(note.body);}}>Edit</button><button type="button" disabled={busy} className="underline" onClick={()=>void removeNote(note)}>Remove</button></div>}</li>)}</ul><label className="mt-2 block text-[11px]" htmlFor={`note-${taskId}`}>{editId?'Edit private note':'Add a private note'}<textarea id={`note-${taskId}`} maxLength={4000} disabled={disabled||busy||loading} value={draft} onChange={event=>setDraft(event.target.value)} className="mt-1 min-h-20 w-full rounded-md border border-input bg-background p-2 text-xs"/></label><div className="mt-2 flex gap-2"><button type="button" disabled={disabled||busy||loading||!draft.trim()} className="rounded-md bg-foreground px-3 py-1.5 text-xs text-background disabled:opacity-50" onClick={()=>{const note=data.notes.find(item=>item.id===editId);if(note)void editNote(note);else void addNote();}}>{busy?'Saving…':editId?'Save note':'Add note'}</button>{(editId||draft)&&<button type="button" className="rounded-md border px-3 py-1.5 text-xs" onClick={()=>{setEditId(null);setDraft('');}}>Cancel note draft</button>}</div></section>
        <section hidden={tabbed&&tab!=='files'} role={tabbed?'tabpanel':undefined} id={tabbed?tabId+'-panel-files':undefined} aria-labelledby={tabbed?tabId+'-files':undefined} aria-label={`Files attached to ${taskTitle}`}><h4 className="text-xs font-semibold">Task files</h4>{data.files.map(file=><div key={file.id} className="mt-2 flex items-center justify-between gap-2 rounded-md border border-border bg-background p-2 text-xs"><Link className="min-w-0 truncate underline" href={`/projects/${projectId}/files`}>{file.filename}</Link><button type="button" className="shrink-0 underline" disabled={disabled||busy||loading} onClick={()=>void preview(file)}>Preview</button><button type="button" className="shrink-0 underline" disabled={disabled||busy||loading} onClick={()=>void save({action:'file_unlink',taskId,fileId:file.id})}>Unlink</button></div>)}{data.availableFiles.length>0&&<label className="mt-2 block text-[11px]">Attach a verified project file<select className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs" disabled={disabled||busy||loading} value="" onChange={event=>{if(event.target.value)void save({action:'file_link',taskId,fileId:event.target.value});}}><option value="">Choose a project file…</option>{data.availableFiles.map(file=><option key={file.id} value={file.id}>{file.filename}</option>)}</select></label>}{!data.files.length&&!data.availableFiles.length&&<p className="mt-1 text-[11px] text-muted-foreground">No verified project files are available.</p>}</section>
        <section hidden={tabbed&&tab!=='comments'} role={tabbed?'tabpanel':undefined} id={tabbed?tabId+'-panel-comments':undefined} aria-labelledby={tabbed?tabId+'-comments':undefined} aria-label={`Comments for ${taskTitle}`} className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold">Comments ({data.commentCount})</h4>
            <Link href={`/projects/${projectId}/discussion?task=${encodeURIComponent(taskId)}`} className="text-[11px] font-medium underline">Full discussion</Link>
          </div>
          <ol className="max-h-56 space-y-2 overflow-y-auto">
            {data.comments.map(comment=><li key={comment.id} className="rounded-lg border border-border bg-background p-2">
              <p className="whitespace-pre-wrap break-words text-xs">{comment.body}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{comment.author_id===userId?'You':'Team member'} · {new Date(comment.created_at).toLocaleString('en-US',{dateStyle:'medium',timeStyle:'short'})}</p>
            </li>)}
            {!data.comments.length&&<li className="text-[11px] text-muted-foreground">No comments on this task yet.</li>}
          </ol>
          {data.commentCount>data.comments.length&&<p className="text-[11px] text-muted-foreground">Showing recent comments. Open the full discussion to view older comments.</p>}
          <label className="block text-[11px] font-medium">Write a comment
            <textarea className="mt-1 min-h-20 w-full rounded-lg border border-input bg-background p-2 text-xs" value={commentDraft} maxLength={4000} disabled={disabled||busy||commentBusy||loading||data.projectRevision!==revision} onChange={event=>setCommentDraft(event.target.value)} placeholder="Add an update or mention a review…"/>
          </label>
          <button type="button" disabled={disabled||busy||commentBusy||loading||!commentDraft.trim()||data.projectRevision!==revision} onClick={()=>{void submitComment();}} className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-50">{commentBusy?'Posting…':'Post comment'}</button>
          {commentMessage&&<p role="status" className="text-[11px] text-emerald-700 dark:text-emerald-300">{commentMessage}</p>}
          {commentError&&<p role="alert" className="text-[11px] text-destructive">{commentError}</p>}
        </section>
      </>}
    </div>}
  </details>
      {busy&&<p role="status" className="text-xs text-muted-foreground">{busyLabel}</p>}
      {message&&<p role="status" className="text-xs text-emerald-700 dark:text-emerald-300">{message}</p>}
      {error&&<p role="alert" className="text-xs text-red-700 dark:text-red-300">{error}<button type="button" className="ml-2 underline" onClick={()=>void load()}>Refresh details</button></p>}
      {data&&data.projectRevision!==revision&&<p role="status" className="text-xs text-amber-700">The project revision changed. Refresh the work plan before editing task details.</p>}
</>;
}
