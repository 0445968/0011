'use client';
import {useRef,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {templateFields,templateKinds,type StaffTemplate,type TemplateVersion,type TemplateFields} from '@/lib/templates/schema';
import {useWorkspaceUnsavedChanges} from '@/components/admin/workspace/WorkspaceNavigationGuard';
const field='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm';
const button='inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm hover:bg-muted disabled:opacity-50';
export function TemplateEditor({template,version,userId,initialKind='project',initialFields}:{template?:StaffTemplate;version?:TemplateVersion;userId:string;initialKind?:keyof typeof templateKinds;initialFields?:TemplateFields}) {
 const router=useRouter();
 const initial:TemplateFields=initialFields||{title:version?.title||'',kind:version?.kind||initialKind,description:version?.description||'',visibility:version?.visibility||'personal',content:version?.content||'',changeNote:template?'':'Created template'};
 const [draft,setDraft]=useState(initial);
 const [busy,setBusy]=useState(false),[blocked,setBlocked]=useState(false),[error,setError]=useState(''),[copied,setCopied]=useState(false);
 const inFlight=useRef(false),newId=useRef<string|null>(null);
 const current=!template||version?.version===template.current_version;
 const owner=!template||template.owner_id===userId;
 const editable=owner&&current&&!template?.archived;
 const dirty=editable&&JSON.stringify(draft)!==JSON.stringify(initial);
 const markSaved=useWorkspaceUnsavedChanges(dirty,'Template draft');
 function change<K extends keyof TemplateFields>(key:K,value:TemplateFields[K]){setDraft(previous=>({...previous,[key]:value}));setCopied(false);}
 async function copy(){try{await navigator.clipboard.writeText(editable?draft.content:version?.content||'');setCopied(true);setError('');}catch{setError('Clipboard access is unavailable. Select the content and copy it manually.');}}
 async function command(action:'save'|'duplicate'|'archive'|'restore') {
  if(inFlight.current||blocked)return;
  let body:Record<string,unknown>;
  if(action==='save'){
   const parsed=templateFields.safeParse(draft);if(!parsed.success){setError(parsed.error.issues[0]?.message||'Check the template fields.');return;}
   if(!newId.current&&!template)newId.current=crypto.randomUUID();
   body={...parsed.data,id:template?.id||newId.current,action:template?'save':'create',...(template?{expectedVersion:template.current_version}:{})};
  }else{if(!template)return;body={action,id:template.id,expectedVersion:template.current_version};}
  inFlight.current=true;setBusy(true);setError('');
  try{
   const response=await fetch('/api/admin/templates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
   const result=await response.json();
   if(response.status===409||response.status>=500)setBlocked(true);
   if(!response.ok)throw new Error(result.error||'Template could not be saved.');
   markSaved();setBlocked(true);router.replace(`/templates/${result.id}`);router.refresh();
  }catch(e){if(e instanceof Error&&['TimeoutError','AbortError','TypeError'].includes(e.name))setBlocked(true);setError(e instanceof Error&&e.name!=='TimeoutError'?e.message:'The result could not be confirmed. Check the Templates directory before retrying.');}
  finally{inFlight.current=false;setBusy(false);}
 }
 return <div className="space-y-5">
  <div className="flex flex-wrap gap-2">
   <button className={button} type="button" disabled={busy||!(editable?draft.content:version?.content)} onClick={()=>void copy()}>{copied?'Copied':'Copy content'}</button>
   {template&&current&&<button type="button" disabled={busy||blocked||dirty} className={button} onClick={()=>void command('duplicate')}>Duplicate saved version</button>}
   {template&&owner&&current&&<button type="button" disabled={busy||blocked||dirty} className={button} onClick={()=>{if(window.confirm(`${template.archived?'Restore':'Archive'} “${template.title}”?`))void command(template.archived?'restore':'archive');}}>{template.archived?'Restore template':'Archive template'}</button>}
  </div>
  {dirty&&template&&<p className="text-xs text-muted-foreground">Save your edits before duplicating or archiving the saved version.</p>}
  {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
  {blocked&&<p className="text-sm"><button className="underline" onClick={()=>window.location.reload()}>Reload</button> or <Link href="/templates" className="underline">review the Templates directory</Link> before making another change.</p>}
  {editable?<form onSubmit={e=>{e.preventDefault();void command('save');}} className="space-y-4 rounded-xl border bg-card p-5">
   <fieldset disabled={busy||blocked} className="space-y-4"><legend className="sr-only">Template content</legend>
    <label className="block space-y-1 text-xs"><span>Title</span><input required maxLength={200} className={field} value={draft.title} onChange={e=>change('title',e.target.value)}/></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="block space-y-1 text-xs"><span>Category</span><select className={field} value={draft.kind} onChange={e=>change('kind',e.target.value as TemplateFields['kind'])}>{Object.entries(templateKinds).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label><label className="block space-y-1 text-xs"><span>Who can use it</span><select className={field} value={draft.visibility} onChange={e=>change('visibility',e.target.value as TemplateFields['visibility'])}><option value="personal">Only me</option><option value="workspace">Workspace staff</option></select></label></div>
    <p className="text-xs text-muted-foreground">{draft.visibility==='personal'?'Only your staff account can read this template.':'Workspace staff can read and copy this version. Earlier personal versions remain private to you.'}</p>
    <label className="block space-y-1 text-xs"><span>Description</span><textarea rows={2} maxLength={1000} className={field} value={draft.description} onChange={e=>change('description',e.target.value)}/></label>
    <label className="block space-y-1 text-xs"><span>Reusable content</span><textarea required rows={16} maxLength={30000} className={`${field} font-mono`} value={draft.content} onChange={e=>change('content',e.target.value)}/></label>
    <p className="text-xs text-muted-foreground">Reusable wording and checklists. Copy the content into a draft and review it before using it.</p>
    <label className="block space-y-1 text-xs"><span>Change note</span><input required maxLength={500} className={field} value={draft.changeNote} onChange={e=>change('changeNote',e.target.value)}/></label>
    <button type="submit" className="min-h-11 rounded-lg bg-foreground px-4 text-sm text-background" disabled={busy||blocked}>{busy?'Saving…':template?'Save new version':'Create template'}</button>
   </fieldset>
  </form>:<section className="space-y-4 rounded-xl border bg-card p-5"><p className="text-xs text-muted-foreground">{!current?'Historical version · Copy its content to reuse it.':template?.archived?'Archived template · Restore it or make a personal duplicate to continue.':'Workspace template · Duplicate it to edit your own copy.'}</p>{version?.description&&<p className="whitespace-pre-wrap text-sm">{version.description}</p>}<pre className="max-h-[65vh] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted/30 p-4 font-mono text-sm">{version?.content}</pre></section>}
 </div>;
}
