'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {ClipboardList, History, ShieldCheck, RefreshCcw, ChevronDown} from 'lucide-react';
import type {ProjectRecord, ProjectEvent} from '@/lib/projects/data';
import {projectStates, type ProjectBody} from '@/lib/projects/schema';
import {projectBodiesEqual} from '@/lib/projects/workplan-merge';
import {postProjectCommand, confirmProjectCommandRead} from '@/lib/projects/immediate-command';
import {refreshProjectSurfaces} from '@/lib/projects/refresh';

type Decision = 'complete' | 'reopen';
type LatestProject = {body:ProjectBody;revision:number;state:string};

const projectUrl = (id:string) => '/api/admin/projects/' + id;
const sectionClass = 'overflow-hidden rounded-xl border border-border/70 bg-white dark:bg-card';
const summaryClass = 'group flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden';
const actionClass = 'inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40';

async function verifiedProject(id:string):Promise<LatestProject> {
  const response=await fetch(projectUrl(id),{cache:'no-store',signal:AbortSignal.timeout(20000)});
  const result=await response.json();
  if(!response.ok||!Number.isInteger(result.revision)||!result.body||typeof result.state!=='string') {
    throw new Error(result.error||'The latest saved project could not be verified.');
  }
  return {body:result.body,revision:result.revision,state:result.state};
}

/** These panels belong to Brief, not the Tasks work-plan editor.
 * The project state is changed using its existing authorized API, after
 * checking the authoritative saved revision and unresolved private drafts.
 */
export function ProjectBriefGovernance({id,record,history,gateReady}:{
  id:string;record:ProjectRecord;history:ProjectEvent[];gateReady:boolean;
}) {
  const router=useRouter();
  const [reason,setReason]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [needsVerification,setNeedsVerification]=useState(false);
  const [uncertainAction,setUncertainAction]=useState<Decision|null>(null);
  const completeReady=record.state==='active'&&gateReady&&record.body.tasks.length>0
    &&record.body.tasks.every(task=>task.status==='done')
    &&record.body.milestones.every(milestone=>milestone.status==='done');

  async function verifyDecision() {
    if(busy)return;
    setBusy(true);setError('');setMessage('Verifying saved project state…');
    try {
      const latest=await verifiedProject(id);
      confirmProjectCommandRead(projectUrl(id));
      const expected=uncertainAction==='complete'?'completed':'on_hold';
      setNeedsVerification(false);
      setUncertainAction(null);
      if(latest.state===expected&&latest.revision>record.revision) {
        setMessage('Project state was saved and verified.');
        setReason('');
      }else {
        setError('The previous state change was not confirmed. The latest saved project is being loaded. Review its state and revision before another attempt.');
        setMessage('');
      }
      refreshProjectSurfaces(id,router);
    }catch(cause){
      setError(cause instanceof Error?cause.message:'Could not verify the saved project. Do not retry the state change until it can be checked.');
      setMessage('');
    }finally {setBusy(false);}
  }

  async function changeState(action:Decision){
    if(busy||needsVerification||!reason.trim())return;
    if(action==='complete'&&!completeReady)return;
    if(action==='reopen'&&record.state!=='completed')return;
    setBusy(true);setError('');setMessage('Checking the latest project and private work-plan draft…');
    try{
      const latest=await verifiedProject(id);
      if(latest.revision!==record.revision||latest.state!==record.state){
        setError('The project changed since Brief loaded. Refresh and review the latest state before continuing.');
        setMessage('');
        router.refresh();
        return;
      }
      if(action==='complete'&&(!gateReady||!latest.body.tasks.length||
          latest.body.tasks.some(task=>task.status!=='done')||
          latest.body.milestones.some(milestone=>milestone.status!=='done'))){
        setError('Complete all saved tasks and milestones, and resolve project prerequisites, before completing the project.');
        setMessage('');
        return;
      }

      const draftResponse=await fetch(projectUrl(id)+'/draft',{cache:'no-store',signal:AbortSignal.timeout(20000)});
      const draftResult=await draftResponse.json();
      if(!draftResponse.ok||!Number.isInteger(draftResult.currentRevision)){
        throw new Error(draftResult.error||'Private work-plan draft state could not be checked. No project state change was submitted.');
      }
      if(draftResult.currentRevision!==latest.revision){
        setError('The project revision changed during the draft check. Refresh Brief before attempting a state change.');
        setMessage('');
        router.refresh();
        return;
      }
      if(draftResult.draft&&!projectBodiesEqual(draftResult.draft.body,latest.body)){
        setError('Unsaved work-plan edits exist. Restore, save, or discard the private draft in Tasks before changing project state.');
        setMessage('');
        return;
      }
      const question=action==='complete'
        ? 'Complete this project using the saved task and milestone records?'
        : 'Reopen this completed project on hold for review?';
      if(!window.confirm(question)){setMessage('No project state change was submitted.');return;}
      setMessage('Saving project state…');
      await postProjectCommand(projectUrl(id),{action,expectedRevision:latest.revision,reason:reason.trim()});
      setReason('');setMessage('Project state changed successfully.');setError('');
      refreshProjectSurfaces(id,router);
    }catch(cause){
      const kind=cause&&typeof cause==='object'&&'kind'in cause?String(cause.kind):'';
      if(kind==='unknown'){
        setNeedsVerification(true);setUncertainAction(action);
        setError('The save result is uncertain. Verify the saved project state before retrying. No automatic retry will occur.');
      }else {
        setError(cause instanceof Error?cause.message:'The project state could not be changed.');
        if(kind==='conflict')router.refresh();
      }
      setMessage('');
    }finally {setBusy(false);}
  }

  return <section aria-label="Project governance and records" className="space-y-3">
    <details className={sectionClass+" group"} id="project-brief-decisions">
      <summary className={summaryClass}>
        <span className="inline-flex min-w-0 items-center gap-2"><ShieldCheck size={17} aria-hidden/>Project state &amp; decisions</span>
        <ChevronDown size={16} className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"/>
      </summary>
      <div className="space-y-3 border-t border-border/70 px-4 py-4">
        <p className="text-xs text-muted-foreground">
          {gateReady
            ? 'Accepted scope, agreement/deposit readiness and current onboarding are verified.'
            : 'Prerequisites require review before resuming or completing this project.'}
        </p>
        <p className="text-xs text-muted-foreground">Saved lifecycle state: <strong className="font-semibold text-foreground">{projectStates[record.state]}</strong> · Revision {record.revision}</p>
        {record.state==='on_hold'
          ? <p className="text-xs text-muted-foreground">Use the Operational status section above to resume this project.</p>
          : <p className="text-xs text-muted-foreground">Operational status changes, including On hold and Waiting on client, are managed in the Operational status section above.</p>}
        {(record.state==='active'||record.state==='completed')&&<label className="block max-w-3xl text-xs font-medium">
          Decision reason / completion summary
          <textarea rows={3} maxLength={2000} value={reason} disabled={busy||needsVerification}
            onChange={event=>setReason(event.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            placeholder="Required for project state changes"/>
        </label>}
        <div className="flex flex-wrap items-center gap-2">
          {record.state==='active'&&<button type="button" className={actionClass}
            disabled={busy||needsVerification||!reason.trim()||!completeReady}
            onClick={()=>void changeState('complete')}>Complete project</button>}
          {record.state==='completed'&&<button type="button" className={actionClass}
            disabled={busy||needsVerification||!reason.trim()}
            onClick={()=>void changeState('reopen')}>Reopen on hold</button>}
          {needsVerification&&<button type="button" className={actionClass} disabled={busy}
            onClick={()=>void verifyDecision()}><RefreshCcw size={14}/>Verify saved state</button>}
          {!gateReady&&<p className="text-xs text-muted-foreground">Project readiness requires review before completion.</p>}
        </div>
        {record.state==='active'&&!completeReady&&<p className="text-xs text-muted-foreground">Complete every task and milestone in the saved work plan and meet all prerequisites to enable project completion.</p>}
        {message&&<p role="status" className="text-xs text-muted-foreground">{message}</p>}
        {error&&<p role="alert" className="text-xs text-destructive">{error}{error.includes('Unsaved work-plan')&&<>
          {' '}<Link href={`/projects/${id}?tab=plan`} className="font-semibold underline">Review Tasks</Link>
        </>}</p>}
      </div>
    </details>

    <details className={sectionClass+" group"} id="project-brief-activation">
      <summary className={summaryClass}>
        <span className="inline-flex min-w-0 items-center gap-2"><ClipboardList size={17} aria-hidden/>Activation snapshot <span className="text-[11px] font-normal text-muted-foreground">Scope v{record.proposal_version}</span></span>
        <ChevronDown size={16} className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"/>
      </summary>
      <div className="space-y-4 border-t border-border/70 px-4 py-4 text-xs">
        <p className="text-muted-foreground">The accepted scope and onboarding snapshot remain fixed as the project changes.</p>
        <dl className="grid gap-4 sm:grid-cols-2">
          {(['summary','deliverables','exclusions','clientInputs','revisions','schedule','fees'] as const).map(key=>
            <div className="min-w-0" key={key}>
              <dt className="font-semibold">{key==='clientInputs'?'Client inputs':key.charAt(0).toUpperCase()+key.slice(1)}</dt>
              <dd className="mt-1 whitespace-pre-wrap break-words text-muted-foreground">{record.scope_snapshot[key]}</dd>
            </div>)}
          <div className="min-w-0">
            <dt className="font-semibold">Activation references</dt>
            <dd className="mt-1 break-words text-muted-foreground">
              Agreement: {record.readiness_snapshot.agreementRef} · Deposit: {record.readiness_snapshot.depositStatus} · Contact: {record.onboarding_snapshot.contactName} · Kickoff: {record.onboarding_snapshot.kickoffDate}
            </dd>
          </div>
        </dl>
      </div>
    </details>

    <details className={sectionClass+" group"} id="project-brief-history">
      <summary className={summaryClass}>
        <span className="inline-flex min-w-0 items-center gap-2"><History size={17} aria-hidden/>Project history <span className="text-[11px] font-normal text-muted-foreground">{history.length} recent events</span></span>
        <ChevronDown size={16} className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"/>
      </summary>
      <div className="max-h-[420px] space-y-2 overflow-y-auto border-t border-border/70 px-4 py-3">
        {history.map(event=><details key={event.id} className="rounded-lg border border-border/70 bg-background text-xs">
          <summary className="cursor-pointer px-3 py-3 font-medium">
            {({activate:'Activated',save:'Work plan saved',hold:'Placed on hold',resume:'Resumed',complete:'Completed',reopen:'Reopened'} as Record<string,string>)[event.action]||event.action}
            <span className="ml-2 font-normal text-muted-foreground">{new Date(event.created_at).toISOString().replace('T',' ').slice(0,16)} UTC</span>
          </summary>
          <div className="space-y-2 border-t border-border/60 px-3 py-3 text-muted-foreground">
            <p>Staff: {event.actor||'Account removed'}</p>
            {event.reason&&<p className="whitespace-pre-wrap">{event.reason}</p>}
            <p className="font-medium text-foreground">Saved work plan · Revision {event.snapshot.revision}</p>
            <p>{event.snapshot.body.title} · {projectStates[event.snapshot.state]} · Owner: {event.snapshot.body.owner||'Unassigned'}</p>
            {event.snapshot.body.notes&&<p className="whitespace-pre-wrap">{event.snapshot.body.notes}</p>}
            {event.snapshot.body.milestones.map(milestone=><p key={milestone.id}>
              Milestone: {milestone.title} · {milestone.status} · {milestone.dueOn||'No due date'}
            </p>)}
            {event.snapshot.body.tasks.map(task=><div key={task.id}>
              <p>{task.title} · {task.status} · {task.owner||'Unassigned'} · {task.dueOn||'No due date'} · {event.snapshot.body.milestones.find(milestone=>milestone.id===task.milestoneId)?.title||'No milestone'}</p>
              {task.notes&&<p className="whitespace-pre-wrap">{task.notes}</p>}
            </div>)}
          </div>
        </details>)}
        {!history.length&&<p className="py-3 text-xs text-muted-foreground">No project events yet.</p>}
      </div>
    </details>
  </section>;
}
