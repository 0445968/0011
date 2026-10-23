'use client';

import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {operationalStatusLabels,operationalStatusStyles,type OperationalStatus} from '@/lib/projects/operational-status';
import {ProjectPanel,projectControlClass} from './ProjectVisuals';
import {refreshProjectSurfaces} from '@/lib/projects/refresh';

type Blocker={key:string;label:string;href:string};
type WaitingSource={kind:string;source_id:string;title:string;source_status:string;approval_key:string};
export function ProjectOperationalStatus({id,initial}:{id:string;initial:any;}) {
  const router=useRouter(); const [status,setStatus]=useState<OperationalStatus>(initial.status);
  const [revision,setRevision]=useState<number>(initial.revision); const [savedProjectRevision,setSavedProjectRevision]=useState<number>(initial.projectRevision);
  const [reason,setReason]=useState(''); const [source,setSource]=useState(''); const [waiting,setWaiting]=useState<WaitingSource[]>(initial.waitingSources??[]);
  const [blockers,setBlockers]=useState<Blocker[]>(initial.blockers??[]); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [message,setMessage]=useState('');
  const current=status; const [target,setTarget]=useState<OperationalStatus>('active'); const selected=source?waiting.find(row=>row.approval_key===source):null; const completed=initial.executionState==='completed';
  useEffect(()=>{if(busy)return;setStatus(initial.status);setRevision(initial.revision);setSavedProjectRevision(initial.projectRevision);setBlockers(initial.blockers??[]);setWaiting(initial.waitingSources??[]);},[initial,busy]);
  async function change(next:OperationalStatus) {
    if(busy||next===status||completed)return;setBusy(true);setError('');setMessage('Saving operational status…');
    try {
      const response=await fetch(`/api/admin/projects/${id}/operational-status`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:next,reason,sourceKind:selected?.kind,sourceId:selected?.source_id,expectedRevision:revision,expectedProjectRevision:savedProjectRevision}),signal:AbortSignal.timeout(20000)});
      const result=await response.json();
      if(response.status===409){setError('This project changed in another session. Refresh its status and review your transition.');router.refresh();return;}
      if(result.result==='blocked'){setBlockers(result.blockers??[]);setError('This transition is blocked. Resolve the listed requirements first.');return;}
      if(!response.ok||result.result!=='saved'||!Number.isInteger(result.revision)){throw new Error(result.error||'The saved status could not be confirmed.');}
      setStatus(result.status);setRevision(result.revision);setSavedProjectRevision(result.projectRevision);setTarget(result.status==='active'?'on_hold':'active');setSource('');setReason('');setMessage('Operational status saved.');setBlockers([]);refreshProjectSurfaces(id,router);
    } catch(e) {setError(e instanceof Error?e.message:'Operational status could not be saved.');}
    finally {setBusy(false);}
  }
  const requiresReason=target==='on_hold'||target==='inactive'||target==='waiting_on_client'||target==='active'&&['on_hold','waiting_on_client','inactive'].includes(current);
  const reasonReady=!['on_hold','inactive','waiting_on_client'].includes(target)&&!(target==='active'&&['on_hold','waiting_on_client','inactive'].includes(current))||reason.trim().length>0;
  const sourceReady=target!=='waiting_on_client'||Boolean(selected);
  return <ProjectPanel title="Operational status" description="Staff-managed work status. Completion and publishing remain separate.">
    <div className="flex flex-wrap items-center gap-2 p-3"><span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${operationalStatusStyles[status]}`}>{operationalStatusLabels[status]}</span>
      {initial.dependencyResolved&&<span role="status" className="text-xs text-blue-800 dark:text-blue-200">Client dependency resolved. Ready for an explicit staff transition.</span>}
      <span className="ml-auto text-[11px] text-muted-foreground">Operational revision {revision} · project revision {savedProjectRevision}</span></div>
    <div className="grid gap-3 border-t border-border p-3 lg:grid-cols-[minmax(0,1fr)_minmax(240px,1fr)]">
      <div className="space-y-2">{completed?<p className="text-xs text-muted-foreground">Completed project controls remain locked. Use the existing authorized Reopen action before changing operational status.</p>:<><label className="block text-xs">Change operational status<select className="mt-1 h-9 w-full rounded border border-border bg-background px-2" value={target} onChange={e=>setTarget(e.target.value as OperationalStatus)}>{(['active','on_hold','waiting_on_client','inactive'] as const).filter(item=>item!==status).map(item=><option key={item} value={item}>{operationalStatusLabels[item]}</option>)}</select></label>
        {target==='waiting_on_client'&&<label className="block text-xs">Verified client dependency<select className="mt-1 h-9 w-full rounded border border-border bg-background px-2" value={source} onChange={e=>setSource(e.target.value)}><option value="">Choose unresolved approval</option>{waiting.map(row=><option key={row.approval_key} value={row.approval_key}>{row.title} · {row.source_status.replaceAll('_',' ')}</option>)}</select></label>}
        {requiresReason&&<label className="block text-xs">Transition reason<textarea className="mt-1 min-h-16 w-full rounded border border-border bg-background p-2" maxLength={2000} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Record why this status is changing."/> </label>}
        <button type="button" className={projectControlClass} disabled={busy||!reasonReady||!sourceReady||(target==='inactive'&&blockers.length>0)} onClick={()=>void change(target)}>{busy?'Saving…':`Set ${operationalStatusLabels[target]}`}</button></>}
        {message&&<p role="status" className="text-xs text-muted-foreground">{message}</p>}{error&&<p role="alert" className="text-xs text-destructive">{error}</p>}
      </div>
      <div className="rounded-lg border border-border bg-muted/20 p-3"><h3 className="text-xs font-semibold">Closeout eligibility</h3><p className="mt-1 text-[10px] text-muted-foreground">Inactive requires final-stage work, approvals, delivery receipt and handoff. Unused phases are not required.</p>
        {blockers.length?<ul className="mt-2 space-y-1.5">{blockers.map(item=><li key={item.key} className="text-xs"><Link className="underline underline-offset-2" href={item.href}>{item.label}</Link></li>)}</ul>:<p className="mt-2 text-xs">{initial.closeoutEligible?'All required closeout checks are satisfied.':'Eligibility checklist is unavailable.'}</p>}
      </div>
    </div>
  </ProjectPanel>;
}
