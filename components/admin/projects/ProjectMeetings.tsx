'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import type {ProjectMeeting} from '@/lib/projects/meeting-schema';
import {meetingTimeChoices,meetingWallTime,meetingState} from '@/lib/projects/meeting-time';
import {postProjectCommand,confirmProjectCommandRead} from '@/lib/projects/immediate-command';
import {refreshProjectSurfaces} from '@/lib/projects/refresh';
import {useProjectMutationRefresh} from './useProjectMutationRefresh';
import {useWorkspaceUnsavedChanges} from '@/components/admin/workspace/WorkspaceNavigationGuard';

type Member={id:string;label:string;kind:string};
type Data={rows:ProjectMeeting[];total:number;members:Member[];timezone:string;currentStaffId:string};
type Form={id:string;revision:number;title:string;start:string;end:string;timezone:string;startOffset:string;endOffset:string;organizer:string;attendees:string[];location:string;meetingUrl:string};
const field='rounded border border-border bg-background px-2 py-1.5 text-xs';
const button='rounded border border-border px-3 py-1.5 text-xs disabled:opacity-50';
function formFor(row:ProjectMeeting):Form{
  const start=meetingWallTime(row.starts_at,row.timezone),end=meetingWallTime(row.ends_at,row.timezone);
  return {id:row.id,revision:row.revision,title:row.title,start,end,timezone:row.timezone,
    startOffset:meetingTimeChoices(start,row.timezone).find(choice=>Date.parse(choice.value)===Date.parse(row.starts_at))?.offset??'',
    endOffset:meetingTimeChoices(end,row.timezone).find(choice=>Date.parse(choice.value)===Date.parse(row.ends_at))?.offset??'',
    organizer:row.organizer??'',attendees:row.attendees,location:row.location,meetingUrl:row.meeting_url??''};
}
export function ProjectMeetings({id,readOnly=false,focusId}:{id:string;readOnly?:boolean;focusId?:string}){
  const router=useRouter(),pending=useRef(false),generation=useRef(0);
  const [focused,setFocused]=useState(focusId??'');
  useEffect(()=>{setFocused(focusId??'');setPage(1);},[focusId]);
  const [data,setData]=useState<Data|null>(null),[page,setPage]=useState(1),[form,setForm]=useState<Form|null>(null);
  const [error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  const url=`/api/admin/projects/${id}/meetings`;
  const load=useCallback(async()=>{
    const current=++generation.current;
    try{const response=await fetch(`${url}?${new URLSearchParams({page:String(page),...(focused?{meeting:focused}:{})})}`,{cache:'no-store'});const json=await response.json();if(!response.ok)throw new Error(json.error||'Meetings unavailable.');if(current!==generation.current)return false;
      setData(json);confirmProjectCommandRead(url);setError('');return true;
    }catch(cause){if(current===generation.current)setError(cause instanceof Error?cause.message:'Meetings unavailable.');return false;}
  },[url,page,focused]);
  useEffect(()=>{void load();return()=>{generation.current+=1;};},[load]);
  useProjectMutationRefresh(id,()=>load());
  useEffect(()=>{if(focusId&&data?.rows.some(row=>row.id===focusId)){const node=document.getElementById(`meeting-${focusId}`);node?.focus();node?.scrollIntoView({block:'center'});}},[focusId,data]);
  async function save(){
    if(!form||pending.current)return false;
    const startChoices=meetingTimeChoices(form.start,form.timezone),endChoices=meetingTimeChoices(form.end,form.timezone);
    const start=startChoices.length===1?startChoices[0]:startChoices.find(choice=>choice.offset===form.startOffset);
    const end=endChoices.length===1?endChoices[0]:endChoices.find(choice=>choice.offset===form.endOffset);
    if(!start||!end){setError('Choose valid local times and timezone. A repeated DST time requires an explicit offset; skipped times cannot be scheduled.');return false;}
    if(Date.parse(end.value)<=Date.parse(start.value)){setError('End must be after start.');return false;}
    pending.current=true;setBusy(true);setError('');setMessage('Saving meeting…');
    try{
      await postProjectCommand(url,{action:'save',id:form.id,expectedRevision:form.revision,title:form.title,startsAt:start.value,endsAt:end.value,timezone:form.timezone,organizer:form.organizer,attendees:form.attendees,location:form.location,meetingUrl:form.meetingUrl});
      setForm(null);setFocused(form.id);setPage(1);const refreshed=await load();setMessage(refreshed?'Meeting saved.':'Meeting saved. Refresh the saved list.');refreshProjectSurfaces(id,router);return true;
    }catch(cause){setMessage('');setError(cause instanceof Error?cause.message:'Save outcome unknown. Refresh before retrying.');return false;}
    finally{pending.current=false;setBusy(false);}
  }
  useWorkspaceUnsavedChanges(form!==null,'Project meeting',async()=>{if(!await save())throw new Error('Meeting not saved.');},async()=>{setForm(null);});
  async function cancel(row:ProjectMeeting){
    if(pending.current||form){setError('Save or discard the open meeting edit before cancelling another meeting.');return;}
    pending.current=true;setBusy(true);setError('');setMessage('Cancelling meeting…');
    try{await postProjectCommand(url,{action:'cancel',id:row.id,expectedRevision:row.revision});const refreshed=await load();setMessage(refreshed?'Meeting cancelled.':'Meeting cancelled. Refresh the saved list.');refreshProjectSurfaces(id,router);}
    catch(cause){setMessage('');setError(cause instanceof Error?cause.message:'Cancellation could not be confirmed.');}finally{pending.current=false;setBusy(false);}
  }
  const change=(value:Partial<Form>)=>setForm(current=>current?{...current,...value}:null);
  const stamp=(value:string,timezone:string)=>new Intl.DateTimeFormat('en-US',{timeZone:timezone,dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
  const saved=form?data?.rows.find(row=>row.id===form.id):null;
  return <section className="space-y-3 rounded-xl border border-border bg-card p-4" aria-label="Project meetings">
    <header className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold">Meetings</h2><div className="flex gap-2"><button type="button" className={button} disabled={busy} onClick={()=>void load()}>Refresh meetings</button><button type="button" className={button} disabled={readOnly||busy||!!form||!data} onClick={()=>{if(!data)return;setForm({id:crypto.randomUUID(),revision:0,title:'',start:'',end:'',timezone:data.timezone,startOffset:'',endOffset:'',organizer:data.currentStaffId,attendees:[],location:'',meetingUrl:''});}}>Create meeting</button></div></header>
    {focused&&<button type="button" disabled={!!form||busy} className={button} onClick={()=>{setFocused('');setPage(1);}}>Show all project meetings</button>}
    <p className="text-xs text-muted-foreground">Meetings are separate from task deadlines. Selecting attendees records them here; it does not send invitations or sync an external calendar.</p>
    {form&&<div className="space-y-3 border border-border p-3"><fieldset disabled={busy||readOnly} className="space-y-3"><legend className="text-xs font-semibold">{form.revision?'Edit meeting':'New meeting'}</legend>
      {saved&&saved.revision!==form.revision&&<div role="alert" className="text-xs">This meeting changed. Your inputs are retained. Review the saved meeting below before choosing <button type="button" className="underline" onClick={()=>setForm(formFor(saved))}>Use saved</button> or <button type="button" className="underline" onClick={()=>change({revision:saved.revision})}>Keep my fields after review</button>.</div>}
      <label className="block text-xs">Title <input className={`${field} w-full`} value={form.title} maxLength={300} onChange={event=>change({title:event.target.value})}/></label>
      <label className="block text-xs">Timezone <input className={field} value={form.timezone} onChange={event=>change({timezone:event.target.value,startOffset:'',endOffset:''})} placeholder="America/Chicago"/></label>
      {(['start','end'] as const).map(kind=>{const choices=meetingTimeChoices(form[kind],form.timezone),offsetKey=kind==='start'?'startOffset':'endOffset';return <div key={kind} className="flex flex-wrap gap-2"><label className="text-xs">{kind==='start'?'Start':'End'} <input type="datetime-local" className={field} value={form[kind]} onChange={event=>change({[kind]:event.target.value,[offsetKey]:''})}/></label>{choices.length>1&&<label className="text-xs">Repeated time offset <select className={field} value={form[offsetKey]} onChange={event=>change({[offsetKey]:event.target.value})}><option value="">Choose offset</option>{choices.map(choice=><option key={choice.offset} value={choice.offset}>UTC{choice.offset}</option>)}</select></label>}</div>;})}
      <label className="block text-xs">Organizer <select className={field} value={form.organizer} onChange={event=>change({organizer:event.target.value})}>{form.organizer&&!data?.members.some(member=>member.id===form.organizer)&&<option value={form.organizer}>Unavailable organizer — choose replacement</option>}{data?.members.map(member=><option key={member.id} value={member.id}>{member.label} · {member.kind}</option>)}</select></label>
      <fieldset className="space-y-1"><legend className="text-xs">Eligible attendees</legend>{data?.members.map(member=><label key={member.id} className="mr-3 inline-flex items-center gap-1 text-xs"><input type="checkbox" checked={form.attendees.includes(member.id)} onChange={event=>change({attendees:event.target.checked?[...form.attendees,member.id]:form.attendees.filter(uid=>uid!==member.id)})}/>{member.label} · {member.kind}</label>)}{form.attendees.filter(uid=>!data?.members.some(member=>member.id===uid)).map(uid=><div key={uid} className="inline-flex items-center gap-1 text-xs"><span>Unavailable attendee ({uid.slice(0,8)})</span><button type="button" className="underline" onClick={()=>change({attendees:form.attendees.filter(value=>value!==uid)})}>Remove</button></div>)}</fieldset>
      <label className="block text-xs">Location <input className={`${field} w-full`} value={form.location} maxLength={1000} onChange={event=>change({location:event.target.value})}/></label>
      <label className="block text-xs">Meeting URL (optional HTTPS) <input type="url" className={`${field} w-full`} value={form.meetingUrl} onChange={event=>change({meetingUrl:event.target.value})}/></label>
      <button type="button" className={button} onClick={()=>void save()}>Save meeting</button>
    </fieldset><button type="button" disabled={busy} className={`${button} mt-3`} onClick={()=>setForm(null)}>Discard meeting edit</button></div>}
    {message&&<p role="status" className="text-xs">{message}</p>}{error&&<p role="alert" className="text-xs text-red-700 dark:text-red-400">{error}</p>}
    {!data&&!error&&<p role="status" className="text-xs">Loading meetings…</p>}
    <ul className="space-y-3">{data?.rows.map(row=><li id={`meeting-${row.id}`} tabIndex={-1} key={row.id} className="border-t border-border pt-2 text-xs"><p className="font-semibold">{row.title} · {meetingState(row)}</p><p>{stamp(row.starts_at,data.timezone)} – {stamp(row.ends_at,data.timezone)} · {data.timezone}</p><p className="text-muted-foreground">Saved meeting zone: {row.timezone} · Organizer: {data.members.find(member=>member.id===row.organizer)?.label??'Account no longer eligible'}</p><p>Attendees: {row.attendees.map(uid=>data.members.find(member=>member.id===uid)?.label??'Account no longer eligible').join(', ')||'None selected'}</p>{row.location&&<p>{row.location}</p>}{row.meeting_url&&<a href={row.meeting_url} target="_blank" rel="noopener noreferrer" className="underline">Open meeting link</a>}<div className="mt-2 flex gap-2"><button type="button" className={button} disabled={readOnly||busy||!!form} onClick={()=>setForm(formFor(row))}>Edit meeting</button><button type="button" className={button} disabled={readOnly||busy||!!form||row.status==='cancelled'} onClick={()=>void cancel(row)}>Cancel meeting</button></div></li>)}</ul>
    {data&&!data.rows.length&&<p className="text-xs">{focused?'This linked meeting is unavailable in this project. Use Show all project meetings to recover.':'No saved meetings on this page.'}</p>}
    <nav className="flex gap-3 text-xs" aria-label="Meeting pages"><button type="button" disabled={page===1||busy||!!form} onClick={()=>setPage(value=>value-1)} className={button}>Previous</button><span>Page {page} · {data?`${data.total} meetings`:'total unavailable'}</span><button type="button" className={button} disabled={!data||page*25>=data.total||busy||!!form} onClick={()=>setPage(value=>value+1)}>Next</button></nav>
  </section>;
}
