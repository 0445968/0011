'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ProjectBody } from '@/lib/projects/schema';
import {
  projectPhaseLabels,
  projectPhaseOrder,
  type ProjectPhase,
  type ProjectTaskControl,
} from '@/lib/projects/lifecycle-schema';

type Lifecycle = {
  requestId: string;
  phase: ProjectPhase;
  revision: number;
  updatedAt: string;
};

type Event = {
  id: number;
  task_id: string;
  action: string;
  snapshot: Record<string, unknown>;
  created_at: string;
};

function TaskControlCard({
  id,
  task,
  control,
  allTasks,
}: {
  id: string;
  task: ProjectBody['tasks'][number];
  control: ProjectTaskControl;
  allTasks: ProjectBody['tasks'];
}) {
  const [ownerType, setOwnerType] = useState(control.ownerType);
  const [phase, setPhase] = useState(control.phase);
  const [serviceId, setServiceId] = useState(control.serviceId ?? '');
  const [dependsOn, setDependsOn] = useState(control.dependsOn ?? '');
  const [blockerOwner, setBlockerOwner] = useState(control.blockerOwner ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function save() {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/projects/${id}/lifecycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_task',
          taskId: task.id,
          expectedRevision: control.revision,
          ownerType,
          phase,
          serviceId: serviceId.trim() || null,
          dependsOn: dependsOn || null,
          blockerOwner: blockerOwner || null,
        }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Task controls could not be saved.');
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Task controls could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  const controlClass = 'h-11 w-full rounded-xl border border-input bg-background px-3 text-sm';

  return (
    <article className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-medium">{task.title}</h4>
          <p className="mt-1 text-xs text-muted-foreground">{task.status} · {task.dueOn || 'No due date'} · revision {control.revision}</p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs">{ownerType === 'client' ? 'Waiting on client' : 'Bivi task'}</span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs" htmlFor={`owner-type-${task.id}`}>Responsibility</label>
          <select id={`owner-type-${task.id}`} className={controlClass} value={ownerType} onChange={(event) => setOwnerType(event.target.value as 'bivi' | 'client')}>
            <option value="bivi">Bivi</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs" htmlFor={`phase-${task.id}`}>Lifecycle phase</label>
          <select id={`phase-${task.id}`} className={controlClass} value={phase} onChange={(event) => setPhase(event.target.value as ProjectPhase)}>
            {projectPhaseOrder.map((value) => <option key={value} value={value}>{projectPhaseLabels[value]}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs" htmlFor={`depends-${task.id}`}>Blocked by task</label>
          <select id={`depends-${task.id}`} className={controlClass} value={dependsOn} onChange={(event) => setDependsOn(event.target.value)}>
            <option value="">No task dependency</option>
            {allTasks.filter((candidate) => candidate.id !== task.id).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.title}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs" htmlFor={`blocker-${task.id}`}>Waiting on</label>
          <select id={`blocker-${task.id}`} className={controlClass} value={blockerOwner} onChange={(event) => setBlockerOwner(event.target.value)}>
            <option value="">No explicit blocker</option>
            <option value="bivi">Bivi</option>
            <option value="client">Client</option>
            <option value="external">External party</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-2 block text-xs" htmlFor={`service-${task.id}`}>Service ID</label>
          <Input id={`service-${task.id}`} maxLength={100} value={serviceId} onChange={(event) => setServiceId(event.target.value)} placeholder="Optional service link" />
        </div>
      </div>
      {control.clientNote && <p className="mt-4 rounded-xl bg-muted/30 p-3 text-sm"><strong>Client note:</strong> {control.clientNote}</p>}
      <Button type="button" variant="outline" className="mt-4" disabled={busy} onClick={() => void save()}>{busy ? 'Saving…' : 'Save task controls'}</Button>
      {message && <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p>}
    </article>
  );
}

export function ProjectLifecycleControls({
  id,
  lifecycle,
  controls,
  tasks,
  events,
}: {
  id: string;
  lifecycle: Lifecycle;
  controls: ProjectTaskControl[];
  tasks: ProjectBody['tasks'];
  events: Event[];
}) {
  const [phase, setPhase] = useState(lifecycle.phase);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const controlByTask = useMemo(() => new Map(controls.map((control) => [control.taskId, control])), [controls]);
  const visibleControls = tasks.map((task) => ({ task, control: controlByTask.get(task.id) })).filter((entry): entry is { task: ProjectBody['tasks'][number]; control: ProjectTaskControl } => Boolean(entry.control));
  const current = visibleControls.filter((entry) => entry.control.phase === lifecycle.phase && entry.task.status !== 'done');
  const waitingClient = current.filter((entry) => entry.control.ownerType === 'client').length;
  const waitingBivi = current.filter((entry) => entry.control.ownerType === 'bivi').length;

  async function savePhase() {
    if (!reason.trim()) {
      setMessage('Add the reason for changing the project phase.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/projects/${id}/lifecycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_phase', expectedRevision: lifecycle.revision, phase, reason }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The project phase could not be saved.');
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The project phase could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Project lifecycle</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold">{projectPhaseLabels[lifecycle.phase]}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{waitingClient} waiting on client · {waitingBivi} waiting on Bivi in this phase.</p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1.5 text-xs">Phase revision {lifecycle.revision}</span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] lg:items-end">
        <div>
          <label htmlFor="project-phase" className="mb-2 block text-sm">Current phase</label>
          <select id="project-phase" className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" value={phase} onChange={(event) => setPhase(event.target.value as ProjectPhase)}>
            {projectPhaseOrder.map((value) => <option key={value} value={value}>{projectPhaseLabels[value]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="phase-reason" className="mb-2 block text-sm">Reason / phase decision</label>
          <Textarea id="phase-reason" rows={2} maxLength={2000} value={reason} onChange={(event) => setReason(event.target.value)} />
        </div>
        <Button type="button" disabled={busy || phase === lifecycle.phase} onClick={() => void savePhase()}>Save phase</Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Moving beyond Discovery requires an approved project brief.</p>
      {message && <p role="status" className="mt-4 text-sm text-muted-foreground">{message}</p>}

      <div className="mt-8 border-t border-border pt-6">
        <h3 className="font-heading text-xl font-semibold">Task ownership and blockers</h3>
        <p className="mt-2 text-sm text-muted-foreground">Task title, due date and execution status remain in the work plan below. These controls determine what the client can see and what each task is waiting on.</p>
        <div className="mt-5 space-y-4">
          {visibleControls.map(({ task, control }) => <TaskControlCard key={task.id} id={id} task={task} control={control} allTasks={tasks} />)}
          {!visibleControls.length && <p className="text-sm text-muted-foreground">Save at least one project task to create its lifecycle controls.</p>}
        </div>
      </div>

      {events.length > 0 && (
        <details className="mt-8 border-t border-border pt-5">
          <summary className="cursor-pointer text-sm font-medium">Recent task-control history</summary>
          <ol className="mt-4 space-y-3">
            {events.slice(0, 20).map((event) => <li key={event.id} className="text-xs text-muted-foreground">{event.task_id} · {event.action} · {new Date(event.created_at).toISOString()}</li>)}
          </ol>
        </details>
      )}
    </section>
  );
}
