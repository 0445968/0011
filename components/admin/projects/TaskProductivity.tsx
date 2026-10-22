'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceUnsavedChanges } from '../workspace/WorkspaceNavigationGuard';
import { MessageSquareText, Paperclip, StickyNote } from 'lucide-react';

type Note = { id:string; body:string; author_id:string|null; revision:number; created_at:string; updated_at:string };
type FileRow = { id:string; filename:string };
type TaskContext = { projectRevision:number; priority:string|null; notes:Note[]; comments:{id:string}[]; files:FileRow[]; availableFiles:FileRow[] };

export function TaskProductivity({projectId,taskId,taskTitle,revision,disabled,userId,onPriority}: {
  projectId:string;taskId:string;taskTitle:string;revision:number;disabled:boolean;userId:string;
  onPriority?:(priority:string|null)=>void;
}) {
  const router=useRouter();
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
  const noteDirty=editId ? draft!==(data?.notes.find(note=>note.id===editId)?.body??'') : Boolean(draft);
  useWorkspaceUnsavedChanges(noteDirty,`Task note: ${taskTitle}`,async()=>{
    const note=data?.notes.find(item=>item.id===editId);
    const saved=note?await editNote(note):await addNote();
    if(!saved)throw new Error('Task note was not saved. Save the work plan first if it has other edits.');
  });
  const endpoint=`/api/admin/projects/${projectId}/task-productivity`;
  async function load(){
    const generation=++loadGeneration.current;
    setLoading(true);
    try { const response=await fetch(`${endpoint}?taskId=${encodeURIComponent(taskId)}`,{cache:'no-store'});const json=await response.json();if(generation!==loadGeneration.current)return false;if(!response.ok)throw new Error(json.error||'Task details could not load.');setData(json as TaskContext);setError('');return true; }
    catch(cause){if(generation===loadGeneration.current)setError(cause instanceof Error?cause.message:'Task details could not load.');return false;}
    finally{if(generation===loadGeneration.current)setLoading(false);}
  }
  useEffect(()=>{if(open)void load();},[revision]);
  async function save(payload:Record<string,unknown>){
    if(busy||disabled||loading)return false;setBusy(true);setBusyLabel('Saving task details…');setError('');setMessage('');
    try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,expectedProjectRevision:revision}),signal:AbortSignal.timeout(20000)});const json=await response.json();if(!response.ok||!json.saved)throw new Error(json.error||'Task update could not save.');const refreshed=await load();setMessage(refreshed?'Task details saved.':'Task details saved. Refresh their display before another change.');router.refresh();return true;}
    catch(cause){setError(cause instanceof Error?cause.message:'Task update could not save.');return false;}finally{setBusy(false);}
  }
  async function addNote(){if(!draft.trim())return false;const id=crypto.randomUUID();const saved=await save({action:'note_create',taskId,noteId:id,body:draft.trim()});if(saved)setDraft('');return saved;}
  async function editNote(note:Note){if(!draft.trim())return false;const saved=await save({action:'note_edit',taskId,noteId:note.id,expectedNoteRevision:note.revision,body:draft.trim()});if(saved){setDraft('');setEditId(null);}return saved;}
  async function removeNote(note:Note){await save({action:'note_remove',taskId,noteId:note.id,expectedNoteRevision:note.revision});}
  async function preview(file:FileRow){
    if(busy||loading)return;setBusy(true);setBusyLabel('Opening file preview…');setError('');
    try{const response=await fetch(`/api/admin/projects/${projectId}/files/${file.id}/preview`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(20000)});const result=await response.json();if(!response.ok||typeof result.url!=='string')throw new Error(result.error||'File preview could not be opened.');window.open(result.url,'_blank','noopener,noreferrer');}
    catch(cause){setError(cause instanceof Error?cause.message:'File preview could not be opened.');}finally{setBusy(false);}
  }
  return <details className="mt-2 border-t border-border/70 pt-2" onToggle={event=>{const next=event.currentTarget.open;setOpen(next);if(next)void load();}}>
    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 text-[11px] text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
      <span className="inline-flex items-center gap-1"><StickyNote size={13} aria-hidden/>Notes{data?` (${data.notes.length})`:''}</span>
      <Link href={`/admin/projects/${projectId}/discussion?task=${encodeURIComponent(taskId)}`} onClick={event=>event.stopPropagation()} className="inline-flex items-center gap-1 underline underline-offset-2"><MessageSquareText size={13} aria-hidden/>Comments{data?` (${data.comments.length})`:''}</Link>
      <span className="inline-flex items-center gap-1"><Paperclip size={13} aria-hidden/>Files{data?` (${data.files.length})`:''}</span>
      <span className="ml-auto">Task details</span>
    </summary>
    {open&&<div className="mt-3 space-y-4 rounded-lg bg-muted/30 p-3">
      {noteDirty&&<p role="status" className="text-xs text-amber-800 dark:text-amber-200">Unsaved task note. Save or cancel this note draft below.</p>}
      {loading&&<p role="status" className="text-xs text-muted-foreground">Loading saved task details…</p>}
      {data&&<>
        <div className="flex flex-wrap items-center gap-2"><label htmlFor={`priority-${taskId}`} className="text-xs font-medium">Manual priority</label><select id={`priority-${taskId}`} className="rounded-md border border-input bg-background px-2 py-1.5 text-xs" disabled={disabled||busy||loading} value={data.priority??''} onChange={async event=>{const value=event.target.value||null;if(await save({action:'priority',taskId,priority:value}))onPriority?.(value);}}><option value="">Not set</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
        <section aria-label={`Notes for ${taskTitle}`}><h4 className="text-xs font-semibold">Task notes</h4><ul className="mt-2 space-y-2">{data.notes.map(note=><li key={note.id} className="rounded-md border border-border bg-background p-2"><p className="whitespace-pre-wrap break-words text-xs">{note.body}</p><p className="mt-1 text-[10px] text-muted-foreground">{new Date(note.updated_at).toLocaleString('en-US',{timeZone:'America/Chicago'})}</p>{note.author_id===userId&&!disabled&&<div className="mt-2 flex gap-3 text-[11px]"><button type="button" className="underline" onClick={()=>{setEditId(note.id);setDraft(note.body);}}>Edit</button><button type="button" disabled={busy} className="underline" onClick={()=>void removeNote(note)}>Remove</button></div>}</li>)}</ul><label className="mt-2 block text-[11px]" htmlFor={`note-${taskId}`}>{editId?'Edit note':'Add a task note'}<textarea id={`note-${taskId}`} maxLength={4000} disabled={disabled||busy||loading} value={draft} onChange={event=>setDraft(event.target.value)} className="mt-1 min-h-20 w-full rounded-md border border-input bg-background p-2 text-xs"/></label><div className="mt-2 flex gap-2"><button type="button" disabled={disabled||busy||loading||!draft.trim()} className="rounded-md bg-foreground px-3 py-1.5 text-xs text-background disabled:opacity-50" onClick={()=>{const note=data.notes.find(item=>item.id===editId);if(note)void editNote(note);else void addNote();}}>{busy?'Saving…':editId?'Save note':'Add note'}</button>{(editId||draft)&&<button type="button" className="rounded-md border px-3 py-1.5 text-xs" onClick={()=>{setEditId(null);setDraft('');}}>Cancel note draft</button>}</div></section>
        <section aria-label={`Files attached to ${taskTitle}`}><h4 className="text-xs font-semibold">Task files</h4>{data.files.map(file=><div key={file.id} className="mt-2 flex items-center justify-between gap-2 rounded-md border border-border bg-background p-2 text-xs"><Link className="min-w-0 truncate underline" href={`/admin/projects/${projectId}/files`}>{file.filename}</Link><button type="button" className="shrink-0 underline" disabled={disabled||busy||loading} onClick={()=>void preview(file)}>Preview</button><button type="button" className="shrink-0 underline" disabled={disabled||busy||loading} onClick={()=>void save({action:'file_unlink',taskId,fileId:file.id})}>Unlink</button></div>)}{data.availableFiles.length>0&&<label className="mt-2 block text-[11px]">Attach a verified project file<select className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs" disabled={disabled||busy||loading} value="" onChange={event=>{if(event.target.value)void save({action:'file_link',taskId,fileId:event.target.value});}}><option value="">Choose a project file…</option>{data.availableFiles.map(file=><option key={file.id} value={file.id}>{file.filename}</option>)}</select></label>}{!data.files.length&&!data.availableFiles.length&&<p className="mt-1 text-[11px] text-muted-foreground">No verified project files are available.</p>}</section>
      </>}
      {busy&&<p role="status" className="text-xs text-muted-foreground">{busyLabel}</p>}
      {message&&<p role="status" className="text-xs text-emerald-700 dark:text-emerald-300">{message}</p>}
      {error&&<p role="alert" className="text-xs text-red-700 dark:text-red-300">{error}<button type="button" className="ml-2 underline" onClick={()=>void load()}>Refresh details</button></p>}
      {data&&data.projectRevision!==revision&&<p role="status" className="text-xs text-amber-700">The project revision changed. Refresh the work plan before editing task details.</p>}
    </div>}
  </details>;
}
