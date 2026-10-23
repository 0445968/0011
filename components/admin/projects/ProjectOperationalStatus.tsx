'use client';

import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {operationalStatusLabels,operationalStatusStyles,type OperationalStatus} from '@/lib/projects/operational-status';
import {ProjectPanel,projectControlClass} from './ProjectVisuals';
import {refreshProjectSurfaces} from '@/lib/projects/refresh';

type Blocker={key:string;label:string;href:string};
type WaitingSource={kind:string;source_id:string;title:string;source_status:string;type:string;context:string;approval_key:string};
type SourceDiagnostic={kind:string;source_id:string;title:string;message:string;href:string};
type SourceLoad='idle'|'loading'|'ready'|'empty'|'error';
const sourceValue=(row:WaitingSource)=>JSON.stringify([row.kind,row.source_id]);

export function ProjectOperationalStatus({id,initial}:{id:string;initial:any;}) {
  const router=useRouter();
  const [status,setStatus]=useState<OperationalStatus>(initial.status);
  const [revision,setRevision]=useState<number>(initial.revision);
  const [savedProjectRevision,setSavedProjectRevision]=useState<number>(initial.projectRevision);
  const [reason,setReason]=useState('');
  const [sourceKey,setSourceKey]=useState('');
  const [waiting,setWaiting]=useState<WaitingSource[]>([]);
  const [diagnostics,setDiagnostics]=useState<SourceDiagnostic[]>([]);
  const [sourceLoad,setSourceLoad]=useState<SourceLoad>('idle');
  const [sourceAttempt,setSourceAttempt]=useState(0);
  const [blockers,setBlockers]=useState<Blocker[]>(initial.blockers??[]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const current=status;
  const [target,setTarget]=useState<OperationalStatus>('active');
  const selected=waiting.find(row=>sourceValue(row)===sourceKey)??null;
  const completed=initial.executionState==='completed';

  useEffect(()=>{
    if(busy)return;
    setStatus(initial.status);setRevision(initial.revision);setSavedProjectRevision(initial.projectRevision);setBlockers(initial.blockers??[]);
  },[initial,busy]);

  useEffect(()=>{
    if(target!=='waiting_on_client')return;
    const controller=new AbortController();
    setSourceLoad('loading');setError('');
    void (async()=>{
      try {
        const response=await fetch(`/api/admin/projects/${id}/operational-status?view=waiting-sources`,{cache:'no-store',signal:controller.signal});
        const result=await response.json();
        if(!response.ok||result.result!=='ok'||!Array.isArray(result.sources)||!Array.isArray(result.diagnostics))throw new Error(result.error||'Dependency list could not load. Retry the check.');
        setWaiting(result.sources);setDiagnostics(result.diagnostics);setSourceLoad(result.sources.length?'ready':'empty');
        setSourceKey(currentKey=>result.sources.some((row:WaitingSource)=>sourceValue(row)===currentKey)?currentKey:'');
      } catch(e) {
        if(controller.signal.aborted)return;
        setWaiting([]);setDiagnostics([]);setSourceLoad('error');
        setError(e instanceof Error?e.message:'Dependency list could not load. Retry the check.');
      }
    })();
    return ()=>controller.abort();
  },[id,target,sourceAttempt]);

  async function change(next:OperationalStatus) {
    if(busy||next===status||completed)return;
    setBusy(true);setError('');setMessage('Saving operational status…');
    try {
      const response=await fetch(`/api/admin/projects/${id}/operational-status`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:next,reason,sourceKind:selected?.kind,sourceId:selected?.source_id,expectedRevision:revision,expectedProjectRevision:savedProjectRevision}),signal:AbortSignal.timeout(20000)});
      const result=await response.json();
      if(response.status===409){setError(next==='waiting_on_client'?'The project or selected client dependency changed. The dependency list is being refreshed; review it before retrying.':'This project changed in another session. Refresh its status and review your transition.');if(next==='waiting_on_client')setSourceAttempt(value=>value+1);router.refresh();return;}
      if(result.result==='blocked'){
        setBlockers(result.blockers??[]);setError('This transition is blocked. Resolve the listed requirements first.');
        if(next==='waiting_on_client'){setSourceAttempt(value=>value+1);}
        return;
      }
      if(!response.ok||result.result!=='saved'||!Number.isInteger(result.revision))throw new Error(result.error||'The saved status could not be confirmed.');
      setStatus(result.status);setRevision(result.revision);setSavedProjectRevision(result.projectRevision);setTarget(result.status==='active'?'on_hold':'active');setSourceKey('');setReason('');setMessage('Operational status saved.');setBlockers([]);refreshProjectSurfaces(id,router);
    } catch(e) {setError(e instanceof Error?e.message:'Operational status could not be saved.');}
    finally {setBusy(false);}
  }

  function selectTarget(next:OperationalStatus) {
    setTarget(next);setError('');setMessage('');setSourceKey('');
    if(next==='waiting_on_client')setSourceAttempt(value=>value+1);
  }

  const requiresReason=target==='on_hold'||target==='inactive'||target==='waiting_on_client'||target==='active'&&['on_hold','waiting_on_client','inactive'].includes(current);
  const reasonReady=!['on_hold','inactive','waiting_on_client'].includes(target)&&!(target==='active'&&['on_hold','waiting_on_client','inactive'].includes(current))||reason.trim().length>0;
  const sourceReady=target!=='waiting_on_client'||sourceLoad==='ready'&&Boolean(selected);
  const waitDisabledReason=sourceLoad==='loading'?'Checking eligible client dependencies…':sourceLoad==='error'?'Retry the dependency check before saving.':sourceLoad==='empty'?'No eligible client dependency currently blocks required work.':!selected?'Choose a verified client dependency.':!reason.trim()?'Enter a reason for waiting on the client.':'';

  return <ProjectPanel title="Operational status" description="Staff-managed work status. Completion and publishing remain separate.">
    <div className="flex flex-wrap items-center gap-2 p-3"><span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${operationalStatusStyles[status]}`}>{operationalStatusLabels[status]}</span>
      {initial.dependencyResolved&&<span role="status" className="text-xs text-blue-800 dark:text-blue-200">Client dependency resolved. Ready for an explicit staff transition.</span>}
      {Array.isArray(initial.dependencyBlockers)&&initial.dependencyBlockers.map((item:Blocker)=><Link key={item.key} href={item.href} className="text-xs text-amber-800 underline dark:text-amber-200">{item.label}</Link>)}
      <span className="ml-auto text-[11px] text-muted-foreground">Operational revision {revision} · project revision {savedProjectRevision}</span></div>
    <div className="grid gap-3 border-t border-border p-3 lg:grid-cols-[minmax(0,1fr)_minmax(240px,1fr)]">
      <div className="space-y-2">{completed?<p className="text-xs text-muted-foreground">Completed project controls remain locked. Use the existing authorized Reopen action before changing operational status.</p>:<>
        <label className="block text-xs">Change operational status<select className="mt-1 h-9 w-full rounded border border-border bg-background px-2" value={target} onChange={e=>selectTarget(e.target.value as OperationalStatus)}>{(['active','on_hold','waiting_on_client','inactive'] as const).filter(item=>item!==status).map(item=><option key={item} value={item}>{operationalStatusLabels[item]}</option>)}</select></label>
        {target==='waiting_on_client'&&<div className="space-y-1.5">
          <label className="block text-xs">Verified client dependency<select className="mt-1 h-9 w-full rounded border border-border bg-background px-2" value={sourceKey} onChange={e=>setSourceKey(e.target.value)} disabled={sourceLoad==='loading'||sourceLoad==='error'||sourceLoad==='empty'}>
            <option value="">Choose unresolved client dependency</option>{waiting.map(row=><option key={sourceValue(row)} value={sourceValue(row)}>{row.title} · {row.type} · {row.source_status.replaceAll('_',' ')}{row.context?` · ${row.context}`:''}</option>)}
          </select></label>
          {sourceLoad==='loading'&&<p role="status" className="text-xs text-muted-foreground">Checking unresolved client dependencies…</p>}
          {sourceLoad==='error'&&<div role="alert" className="flex items-center gap-2 text-xs text-destructive"><span>{error||'Dependency list could not load.'}</span><button type="button" className="underline" onClick={()=>setSourceAttempt(value=>value+1)}>Retry dependency check</button></div>}
          {sourceLoad==='empty'&&<div className="space-y-2 text-xs"><p>No eligible client dependencies currently block required work.</p>
            {diagnostics.map(item=><p key={item.kind+item.source_id} role="status" className="text-amber-800 dark:text-amber-200">{item.message} <Link className="underline" href={item.kind==='client_task_dependency'?`/projects/${id}?tab=phases&task=${encodeURIComponent(item.source_id)}`:item.href}>Open the saved controls</Link></p>)}
            <p className="text-muted-foreground">For a client task, assign it to Client, clear its own blocker and unfinished prerequisite, keep its phase active, and link an unfinished Bivi task to it.</p>
            <Link className="underline" href={`/projects/${id}?tab=phases`}>Manage task dependencies in Phases</Link>
          </div>}
          {sourceLoad==='ready'&&<p className="text-xs text-muted-foreground">Options are current client approvals, pending client task actions, and actionable client tasks linked from unfinished Bivi work.</p>}
          {current==='on_hold'&&<p className="text-xs text-blue-800 dark:text-blue-200">Setting Waiting on client explicitly resumes the held execution through the existing activation checks, so assigned client members can act.</p>}
        </div>}
        {requiresReason&&<label className="block text-xs">Transition reason<textarea className="mt-1 min-h-16 w-full rounded border border-border bg-background p-2" maxLength={2000} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Record why this status is changing."/></label>}
        <button type="button" className={projectControlClass} disabled={busy||!reasonReady||!sourceReady||(target==='inactive'&&blockers.length>0)} onClick={()=>void change(target)}>{busy?'Saving…':`Set ${operationalStatusLabels[target]}`}</button>
        {target==='waiting_on_client'&&waitDisabledReason&&<p className="text-xs text-muted-foreground">{waitDisabledReason}</p>}
      </>}
      {message&&<p role="status" className="text-xs text-muted-foreground">{message}</p>}{error&&sourceLoad!=='error'&&<p role="alert" className="text-xs text-destructive">{error}</p>}
      </div>
      <div className="rounded-lg border border-border bg-muted/20 p-3"><h3 className="text-xs font-semibold">Closeout eligibility</h3><p className="mt-1 text-[10px] text-muted-foreground">Inactive requires final-stage work, approvals, delivery receipt and handoff. Unused phases are not required.</p>
        {blockers.length?<ul className="mt-2 space-y-1.5">{blockers.map(item=><li key={item.key} className="text-xs"><Link className="underline underline-offset-2" href={item.href}>{item.label}</Link></li>)}</ul>:<p className="mt-2 text-xs">{initial.closeoutEligible?'All required closeout checks are satisfied.':'Eligibility checklist is unavailable.'}</p>}
      </div>
    </div>
  </ProjectPanel>;
}
