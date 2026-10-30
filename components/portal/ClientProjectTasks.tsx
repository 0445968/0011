'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ClientTaskResponseActions } from '@/components/portal/ClientTaskResponseActions';
import { Textarea } from '@/components/ui/textarea';
import {
  projectPhaseLabels,
  projectPhaseOrder,
  type ClientProjectTask,
  type ClientProjectWork,
} from '@/lib/projects/lifecycle-schema';

function taskStatus(status: ClientProjectTask['status']) {
  return {
    todo: 'To do',
    doing: 'In progress',
    blocked: 'Blocked',
    done: 'Complete',in_review:'In review',rejected:'Rejected',
  }[status];
}

function ClientTaskCard({ id, work, task }: { id: string; work: ClientProjectWork; task: ClientProjectTask }) {
  const router = useRouter();
  const [note, setNote] = useState(task.clientNote);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const currentRank = projectPhaseOrder.indexOf(work.currentPhase);
  const taskRank = projectPhaseOrder.indexOf(task.phase);
  const future = work.activePhases ? !(task.phases??[task.phase]).some(phase=>work.activePhases!.includes(phase)) : taskRank > currentRank;
  const canProgress=task.canProgress!==false&&task.status!=='in_review';
  const blocked = Boolean(task.blockerOwner || !task.dependencyComplete || task.status === 'blocked');
  const briefApproval = task.id === 'project-brief-client-approval';

  async function save(status: 'todo' | 'doing') {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/client/projects/${id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          expectedProjectRevision: work.projectRevision,
          expectedControlRevision: task.controlRevision,
          status,
          clientNote: note,
        }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The task could not be saved.');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'The result could not be confirmed. Reload before retrying.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-xl border border-border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{(task.phases??[task.phase]).map(phase=>projectPhaseLabels[phase]).join(' · ')}{task.serviceId ? ` · ${task.serviceId}` : ''}</p>
          <h3 className="mt-1 font-medium">{task.title}</h3>
          {task.description && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{task.description}</p>}
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs">{taskStatus(task.status)}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {task.responsibleSide==='bivi'&&<span>Bivi responsible · Client-owned task</span>}
        {task.status==='in_review'&&<span>Waiting for the current review decision</span>}
        {task.dueOn && <span>Due {task.dueOn}</span>}
        {future && <span>Upcoming</span>}
        {task.dependsOn && !task.dependencyComplete && <span>Blocked by another task</span>}
        {task.blockerOwner && <span>Waiting on {task.blockerOwner}</span>}
      </div>

      {briefApproval ? (
        <p className="mt-4 text-sm text-muted-foreground">Complete this task by approving the current project brief in the brief section.</p>
      ) : (
        <>
          <label htmlFor={`client-task-note-${task.id}`} className="mb-2 mt-4 block text-sm">Your note</label>
          <Textarea id={`client-task-note-${task.id}`} rows={3} maxLength={2000} value={note} onChange={(event) => setNote(event.target.value)} disabled={busy || !canProgress || future || blocked || work.state !== 'active'} />
          <div className="mt-4 flex flex-wrap gap-3">
            {(task.status === 'todo'||task.status==='rejected') && <Button type="button" variant="outline" disabled={busy || !canProgress || future || blocked || work.state !== 'active'} onClick={() => void save('doing')}>{task.status==='rejected'?'Resume task':'Start task'}</Button>}
            <ClientTaskResponseActions projectId={id} taskId={task.id} projectRevision={work.projectRevision} disabled={busy || !canProgress || work.state !== 'active'} completed={task.status === 'done'} completionUnavailable={future || blocked} />
            {task.status === 'doing' && <Button type="button" variant="outline" disabled={busy || !canProgress || future || blocked || work.state !== 'active'} onClick={() => void save('doing')}>Save note</Button>}
          </div>
        </>
      )}
      {message && <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p>}
    </article>
  );
}

export function ClientProjectTasks({ id, work }: { id: string; work: ClientProjectWork }) {
  return (
    <section className="rounded-[22px] border border-border bg-card p-6 sm:p-7">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Current phase</p>
      <h2 className="mt-2 font-heading text-2xl font-semibold">{projectPhaseLabels[work.currentPhase]}</h2>
      <p className="mt-3 text-sm text-muted-foreground">{work.waitingOnClient} waiting on you · {work.waitingOnBivi} waiting on Bivi.</p>

      {work.nextAction && (
        <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What you need to do next</p>
          <p className="mt-2 font-medium">{work.nextAction.title}</p>
          {work.nextAction.dueOn && <p className="mt-1 text-xs text-muted-foreground">Due {work.nextAction.dueOn}</p>}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {work.tasks.map((task) => <ClientTaskCard key={task.id} id={id} work={work} task={task} />)}
        {!work.tasks.length && <p className="text-sm text-muted-foreground">You do not have any assigned project tasks yet.</p>}
      </div>
    </section>
  );
}
