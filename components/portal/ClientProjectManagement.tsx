'use client';

import { useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { projectPhaseLabels } from '@/lib/projects/lifecycle-schema';
import type { ClientProjectWork } from '@/lib/projects/lifecycle-schema';
import type { ClientProjectAssignmentWorkspace } from '@/lib/projects/client-team-schema';

async function saveTeam(id: string, body: object) {
  const response = await fetch(`/api/client/projects/${id}/team`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  const result = await response.json();
  if (!response.ok || !result.saved) throw new Error(result.error || 'Project team change could not be saved.');
  if(result.submitted)window.dispatchEvent(new Event('bivi:client-task-proposals-changed'));
  return result;
}

function MemberChecks({ team, selected, setSelected }: {
  team: ClientProjectAssignmentWorkspace; selected: string[]; setSelected: (ids: string[]) => void;
}) {
  return <fieldset className="mt-3 space-y-2">
    <legend className="text-sm font-medium">Client assignees</legend>
    {team.members.map(member => <label key={member.id} className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={selected.includes(member.id)} onChange={event => setSelected(event.target.checked ? [...selected, member.id] : selected.filter(id => id !== member.id))} />
      {member.name}{member.id === team.currentUserId ? ' (you)' : ''}
    </label>)}
  </fieldset>;
}

function ClientTaskCreator({ id, work, team }: { id: string; work: ClientProjectWork; team: ClientProjectAssignmentWorkspace }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [phase, setPhase] = useState(team.activePhases[0] ?? '');
  const [assignees, setAssignees] = useState([team.currentUserId]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function create() {
    setBusy(true); setMessage('');
    try {
      const result=await saveTeam(id, { action: 'create_task', title, notes, phase, userIds: assignees, projectRevision: work.projectRevision });
      setTitle(''); setNotes('');setMessage(result.submitted?'Task submitted for Bivi admin approval. It will appear in the task list after acceptance.':'Task created.'); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Task could not be created.'); }
    finally { setBusy(false); }
  }
  return <div className="rounded-xl border border-border p-4">
    <h3 className="font-medium">Create a client task</h3>
    <p className="mt-1 text-xs text-muted-foreground">New tasks are submitted for Bivi admin approval and start as To do after acceptance.</p>
    <label className="mt-3 block text-sm">Task title<input maxLength={300} value={title} onChange={event => setTitle(event.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
    <label className="mt-3 block text-sm">Details<Textarea rows={3} maxLength={2000} value={notes} onChange={event => setNotes(event.target.value)} /></label>
    <label className="mt-3 block text-sm">Active phase<select value={phase} onChange={event => setPhase(event.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2">
      {team.activePhases.map(value => <option key={value} value={value}>{projectPhaseLabels[value as keyof typeof projectPhaseLabels] ?? value}</option>)}
    </select></label>
    <MemberChecks team={team} selected={assignees} setSelected={setAssignees} />
    <Button type="button" className="mt-4" disabled={busy || !title.trim() || !phase || !assignees.length} onClick={() => void create()}>{busy ? 'Creating…' : 'Create task'}</Button>
    {message && <p role="alert" className="mt-3 text-sm text-red-700">{message}</p>}
  </div>;
}

function ClientTaskAssignees({ id, taskId, team }: { id: string; taskId: string; team: ClientProjectAssignmentWorkspace }) {
  const router = useRouter();
  const record = team.tasks.find(task => task.taskId === taskId);
  const [selected, setSelected] = useState(record?.assignees ?? []);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  if (!record) return null;
  const taskRevision = record.revision;
  async function save() {
    setBusy(true); setMessage('');
    try { const result=await saveTeam(id, { action: 'task', taskId, userIds: selected, expectedRevision: taskRevision });setMessage(result.submitted?'Assignment changes submitted for Bivi admin approval.':'Assignees saved.'); router.refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Task assignees could not be saved.'); }
    finally { setBusy(false); }
  }
  const changed = selected.length !== record.assignees.length || selected.some(value => !record.assignees.includes(value));
  return <div className="mt-4 rounded-lg bg-muted/30 p-3"><p className="text-xs font-medium">Assigned client members</p>
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">{team.members.map(member => <label key={member.id} className="flex items-center gap-2 text-xs">
      <input type="checkbox" checked={selected.includes(member.id)} onChange={event => setSelected(event.target.checked ? [...selected, member.id] : selected.filter(value => value !== member.id))} />{member.name}
    </label>)}</div>
    <Button type="button" variant="outline" className="mt-3" disabled={busy || !changed || !selected.length} onClick={() => void save()}>{busy ? 'Saving…' : 'Save assignees'}</Button>
    {message && <p role="alert" className="mt-2 text-xs text-red-700">{message}</p>}
  </div>;
}

export function ClientProjectManagement({ id, work, team }: { id: string; work: ClientProjectWork; team: ClientProjectAssignmentWorkspace | null }) {
  const router = useRouter();
  const [managers, setManagers] = useState(team?.managers ?? []);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [pendingChanges,setPendingChanges]=useState<NonNullable<ClientProjectAssignmentWorkspace['pendingChanges']>>([]);
  useEffect(()=>{let active=true;const load=()=>{void fetch(`/api/client/projects/${id}/team`,{cache:'no-store'}).then(response=>response.json()).then(value=>{if(active&&Array.isArray(value.pendingChanges))setPendingChanges(value.pendingChanges);}).catch(()=>{});};load();window.addEventListener('bivi:client-task-proposals-changed',load);return()=>{active=false;window.removeEventListener('bivi:client-task-proposals-changed',load);};},[id,work.projectRevision]);
  if (work.state !== 'active' || !team || (!team.isOwner && !team.isManager)) return null;
  const currentTeam = team;
  const selectedChanged = managers.length !== currentTeam.managers.length || managers.some(value => !currentTeam.managers.includes(value));
  async function saveManagers() {
    setBusy(true); setMessage('');
    try { await saveTeam(id, { action: 'managers', userIds: managers, expectedRevision: currentTeam.assignmentRevision }); router.refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Project managers could not be saved.'); }
    finally { setBusy(false); }
  }
  return <section className="space-y-5 rounded-[22px] border border-border bg-card p-6 sm:p-7">
    <div><p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Client team</p><h2 className="mt-2 font-heading text-2xl font-semibold">Manage client work</h2>
      <p className="mt-2 text-sm text-muted-foreground">{team.isOwner ? 'You are the staff-verified organization owner.' : 'You are a designated project manager.'} Changes are limited to active members with access to this project.</p></div>
    {currentTeam.isOwner && <div className="rounded-xl border border-border p-4"><h3 className="font-medium">Project managers</h3><p className="mt-1 text-xs text-muted-foreground">Choose up to five active project members.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{currentTeam.members.map(member => <label key={member.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={managers.includes(member.id)} onChange={event => setManagers(event.target.checked ? [...managers, member.id] : managers.filter(value => value !== member.id))} />{member.name}</label>)}</div>
      <Button type="button" variant="outline" className="mt-3" disabled={busy || !selectedChanged || managers.length > 5} onClick={() => void saveManagers()}>{busy ? 'Saving…' : 'Save project managers'}</Button>
    </div>}
    {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
    {currentTeam.activePhases.length > 0 && <ClientTaskCreator id={id} work={work} team={currentTeam} />}
    <div className="space-y-3"><h3 className="font-medium">Assign client tasks</h3>{work.tasks.filter(task => currentTeam.tasks.some(row => row.taskId === task.id)).map(task => <div key={task.id} className="rounded-xl border border-border p-4"><p className="text-sm font-medium">{task.title}</p><ClientTaskAssignees id={id} taskId={task.id} team={currentTeam} /></div>)}</div>
  {pendingChanges.length>0&&<div className="mt-4 space-y-2 rounded-lg border border-border p-3"><h3 className="text-sm font-medium">Task change requests</h3>{pendingChanges.map(row=><div key={row.id} className="text-xs"><p>{row.title} · {row.status} · Version {row.version}</p>{row.reviewNote&&<p className="mt-1 whitespace-pre-wrap text-muted-foreground">{row.reviewNote}</p>}</div>)}</div>}</section>;
}
