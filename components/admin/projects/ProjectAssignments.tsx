'use client';
import {postProjectCommand,confirmProjectCommandRead,ProjectCommandError} from '@/lib/projects/immediate-command';
import {useProjectMutationRefresh} from './useProjectMutationRefresh';
import {refreshProjectSurfaces} from '@/lib/projects/refresh';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, Users, UserRoundPlus, Menu } from 'lucide-react';
import {Popover,PopoverTrigger,PopoverContent} from '@/components/ui/popover';
import { ProfileImage } from '@/components/profile-images/ProfileImage';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import type { ProjectAssignmentWorkspace } from '@/lib/projects/assignment-schema';

type Person = ProjectAssignmentWorkspace['staff'][number];
type Side = 'bivi' | 'client';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50';

/** One RLS-authorized request for the work plan, not one request per task. */
export function useProjectAssignments(projectId: string, projectRevision?: number) {
  const router=useRouter();
  const [data, setData] = useState<ProjectAssignmentWorkspace | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const requestGeneration = useRef(0);
  const pending=useRef(false);
  const url=`/api/admin/projects/${projectId}/assignees`;
  // Never abort fetches during React effect cleanup. Ignore stale responses instead.
  const load = useCallback(async (isActive: () => boolean = () => true) => {
    const generation = ++requestGeneration.current;
    const isCurrent = () => isActive() && generation === requestGeneration.current;
    try {
      const result = await fetch(`/api/admin/projects/${projectId}/assignees`, { cache: 'no-store' });
      const json = await result.json();
      if (!isCurrent()) return false;
      if (!result.ok) throw new Error(json.error || 'Could not load project members.');
      confirmProjectCommandRead(url);
      setData(json as ProjectAssignmentWorkspace);
      setError('');
      return true;
    } catch (cause) {
      if (isCurrent()) setError(cause instanceof Error ? cause.message : 'Could not load project members.');
      return false;
    }
  }, [projectId]);
  useEffect(() => {
    let active = true;
    setData(null);
    setError('');
    void load(() => active);
    return () => { active = false; };
  }, [load, projectRevision]);
  useProjectMutationRefresh(projectId,()=>load());
  const save = useCallback(async (body: object) => {
    if (pending.current) return false;
    pending.current=true;++requestGeneration.current;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await postProjectCommand(url,body);
      const refreshed=await load();
      setMessage(refreshed?'Task assignments saved.':'Task assignments saved. Refresh members before another change.');
      refreshProjectSurfaces(projectId,router);
      return true;
    } catch (cause) {
      if(cause instanceof ProjectCommandError&&cause.kind==='conflict')await load();
      if(cause instanceof ProjectCommandError&&cause.kind==='unknown'){
        const refreshed=await load();
        setError(refreshed?'Assignment result was uncertain. The latest saved members were refreshed; check them before trying again.':cause.message);
      }else setError(cause instanceof Error ? cause.message : 'Assignment could not save.');
      return false;
    } finally { pending.current=false;setBusy(false); }
  }, [busy, load, projectId, router]);
  return { data, error, busy, message, save, load };
}

type AssignmentControls = ReturnType<typeof useProjectAssignments>;

function SideLogo({ side, data }: {side: Side; data: ProjectAssignmentWorkspace}) {
  if (side === 'bivi') return <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg border border-border bg-background" title="Bivi responsible">
    <Image src="/images/bivi-icon.svg" width={23} height={23} alt="Bivi" />
  </span>;
  const company = data.clientCompany;
  if (company) return <span title={`${company.name} responsible`}><ProfileImage kind="company" subject={company.id} name={company.name} path={company.logo_path} size="h-7 w-7" /></span>;
  return <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-xs font-bold" title="Client responsible">C</span>;
}

function Faces({ ids, options, side, max = 4 }: { ids: string[]; options: Person[]; side: Side; max?: number }) {
  const people = ids.flatMap(id => { const found = options.find(person => person.id === id); return found ? [found] : []; });
  if (!people.length) return <span title="Assign members" aria-label="Assign members"><UserRoundPlus size={16} aria-hidden/></span>;
  return <div className="flex items-center" aria-label={`${side === 'bivi' ? 'Bivi' : 'Client'} assignees`}>
    {people.slice(0, max).map(person => <span key={person.id} title={person.label} className="-ml-1.5 first:ml-0 rounded-full border-2 border-card">
      <ProfileImage kind={side === 'bivi' ? 'staff' : 'client'} subject={person.id} name={person.label} path={person.avatar_path} size="h-7 w-7" />
    </span>)}
    {people.length > max && <span title={people.slice(max).map(p => p.label).join(', ')} className="ml-1 text-[11px]">+{people.length - max}</span>}
  </div>;
}

function MemberChoices({ options, values, change, side, search }: {
  options: Person[]; values: string[]; change: (next: string[]) => void; side: Side; search: string;
}) {
  const filtered = options.filter(p => p.label.toLowerCase().includes(search.trim().toLowerCase()));
  return <div className="max-h-60 space-y-1 overflow-y-auto rounded-xl border border-border p-2">
    {filtered.map(person => {
      const selected = values.includes(person.id);
      return <button key={person.id} type="button" aria-pressed={selected} className={`flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted ${selected ? 'bg-muted/60' : ''}`}
        onClick={() => change(selected ? values.filter(id => id !== person.id) : [...values, person.id])}>
        <ProfileImage kind={side === 'bivi' ? 'staff' : 'client'} subject={person.id} name={person.label} path={person.avatar_path} size="h-8 w-8" />
        <span className="min-w-0 flex-1 truncate text-sm">{person.label}</span>
        {selected && <Check size={16} aria-label="Selected" />}
      </button>;
    })}
    {!filtered.length && <p className="p-3 text-xs text-muted-foreground">No eligible members match. Invite project members in Access first.</p>}
  </div>;
}

export function TaskMemberPicker({ taskId, disabled, controls }: { taskId: string; disabled: boolean; controls: AssignmentControls }) {
  const { data, busy, save } = controls;
  const task = data?.tasks.find(t => t.task_id === taskId);
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<Side>('bivi');
  const [ids, setIds] = useState<string[]>([]);
  const [expectedRevision,setExpectedRevision]=useState(0);
  const [search, setSearch] = useState('');
  const options = side === 'bivi' ? data?.staff ?? [] : data?.clients ?? [];
  const chosen = task?.side === 'bivi' ? data?.staff ?? [] : data?.clients ?? [];
  const available = Boolean(task && data);
  const changed = Boolean(task && (task.side !== side || JSON.stringify(task.assignees) !== JSON.stringify(ids)));
  function show() {
    if (!task || !data) return;
    setExpectedRevision(task.revision);
    setSide(task.side);
    setIds(task.assignees);
    setSearch('');
    setOpen(true);
  }
  function pickSide(next: Side) {
    if (!data) return;
    setSide(next);
    setIds(next === 'bivi' ? [data.currentStaffId] : data.managers);
    setSearch('');
  }
  async function commit() {
    if (!task || !data || busy || task.revision!==expectedRevision || ids.length > 12) return;
    const okay = await save({ action: 'task', taskId, side, userIds: ids, expectedRevision });
    if (okay) setOpen(false);
  }
  return <Popover open={open} onOpenChange={value=>{if(!busy){if(value)show();else setOpen(false);}}}><PopoverTrigger asChild>
    <button type="button" className="flex max-w-full shrink-0 items-center gap-1.5 rounded-lg p-1 hover:bg-muted disabled:opacity-50" disabled={disabled || busy || !available} onClick={show}
      title="Choose responsible side and task assignees" aria-label="Responsible side and assignees">
      {data && task ? <><SideLogo side={task.side} data={data} /><Faces ids={task.assignees} options={chosen} side={task.side} /></> : <span className="text-[11px] text-muted-foreground">Members…</span>}
    <Menu size={13} aria-hidden/></button></PopoverTrigger>
      <PopoverContent align="start" className="bivi-staff-surface max-h-[75dvh] w-[min(90vw,380px)] space-y-3 overflow-y-auto">
        <p className="text-sm font-semibold">Responsible side & assignees</p>
        <p className="text-xs text-muted-foreground">Only Bivi staff can change responsibility. Choose verified members associated with the project. Other team members are not shown.</p>
        <div className="flex flex-wrap gap-2">
          {(['bivi','client'] as const).map(value => <button type="button" key={value} aria-pressed={value === side} className={`${buttonClass} ${side === value ? 'border-foreground bg-muted' : ''}`} onClick={() => pickSide(value)}>
            {data && <SideLogo side={value} data={data} />}{value === 'bivi' ? 'Bivi' : 'Client'}
          </button>)}
        </div>
        {side === 'client' && <p className="text-xs text-muted-foreground">Switching to Client selects the designated client project managers by default. You can select other verified client members below.</p>}
        <label className="text-xs font-medium">Select assignees (up to 12)
          <input className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" type="search" placeholder="Search eligible members" value={search} onChange={event => setSearch(event.target.value)} />
        </label>
        <MemberChoices side={side} options={options} values={ids} change={setIds} search={search} />
        <p className="text-xs text-muted-foreground">{ids.length} selected · Every active Bivi assignee appears in My Tasks.</p>
        {task&&task.revision!==expectedRevision&&<div role="alert" className="text-xs"><p>Saved responsibility changed: {task.side}, {task.assignees.map(id=>[...(data?.staff??[]),...(data?.clients??[])].find(person=>person.id===id)?.label??id).join(', ')||'no assignees'}. Your selections remain unchanged.</p><button type="button" className={buttonClass} onClick={()=>{setSide(task.side);setIds(task.assignees);setExpectedRevision(task.revision);}}>Use saved</button><button type="button" className={buttonClass} onClick={()=>setExpectedRevision(task.revision)}>Keep selections after review</button></div>}
        <div className="flex justify-end gap-2">
          <button type="button" className={buttonClass} disabled={busy} onClick={() => setOpen(false)}>Cancel</button>
          <button type="button" className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background disabled:opacity-40" disabled={busy || !changed || task?.revision!==expectedRevision || ids.length > 12} onClick={() => void commit()}>{busy ? 'Saving…' : 'Save responsibility'}</button>
        </div>
        {controls.error && <p role="alert" className="text-xs text-red-600">{controls.error}</p>}
      </PopoverContent>
  </Popover>;
}

export function ProjectManagersButton({ controls, disabled }: { controls: AssignmentControls; disabled: boolean }) {
  const { data, save, busy } = controls;
  const [open, setOpen] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const [expectedRevision,setExpectedRevision]=useState(0);
  const [search, setSearch] = useState('');
  const selected = useMemo(() => [...ids].sort().join(','), [ids]);
  const original = useMemo(() => [...(data?.managers ?? [])].sort().join(','), [data]);
  async function commit() {
    if (await save({ action: 'managers', userIds: ids, expectedRevision })) setOpen(false);
  }
  return <>
    <button type="button" className={buttonClass} disabled={disabled || busy || !data} onClick={() => { setExpectedRevision(data?.assignmentRevision??0);setIds(data?.managers ?? []); setSearch(''); setOpen(true); }}>
      <Users size={15} aria-hidden /> Client managers ({data?.managers.length ?? 0})
    </button>
    <Dialog open={open} onOpenChange={value => { if (!busy) setOpen(value); }}>
      <DialogContent className="bivi-staff-surface max-h-[90dvh] overflow-y-auto">
        <DialogTitle>Designate client project managers</DialogTitle>
        <DialogDescription>Choose up to five client members who already have active access to this project and belong to its client organization. They will be the default assignees when responsibility changes to Client.</DialogDescription>
        <label className="text-xs font-medium">Find client members
          <input type="search" className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={search} placeholder="Search project members" onChange={e => setSearch(e.target.value)} />
        </label>
        <MemberChoices options={data?.clients ?? []} values={ids} change={setIds} search={search} side="client" />
        <p className="text-xs text-muted-foreground">{ids.length} of 5 maximum</p>
        <DialogFooter>
          <button type="button" className={buttonClass} disabled={busy} onClick={() => setOpen(false)}>Cancel</button>
          <button type="button" disabled={busy || selected === original || ids.length > 5} onClick={() => void commit()} className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background disabled:opacity-40">{busy ? 'Saving…' : 'Save managers'}</button>
        </DialogFooter>
        {controls.error && <p role="alert" className="text-xs text-red-600">{controls.error}</p>}
      </DialogContent>
    </Dialog>
  </>;
}

export function ProjectOrganizationOwnerButton({ projectId, controls, disabled }: { projectId: string; controls: AssignmentControls; disabled: boolean }) {
  const { data, error, load } = controls;
  const [ownerId, setOwnerId] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    void fetch(`/api/admin/projects/${projectId}/organization-owner`, { cache: 'no-store' })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Organization owner could not load.');
        if (active) { setOwnerId(result.ownerId ?? ''); setSelectedId(result.ownerId ?? ''); }
      })
      .catch(cause => { if (active) setMessage(cause instanceof Error ? cause.message : 'Organization owner could not load.'); });
    return () => { active = false; };
  }, [projectId]);
  async function save() {
    if (!selectedId || busy) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/organization-owner`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedId }), signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok || !result.saved) throw new Error(result.error || 'Organization owner could not be verified.');
      setOwnerId(selectedId);
      setMessage('Organization owner verified.');
      await load();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Organization owner could not be verified.');
    } finally { setBusy(false); }
  }
  return <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border p-3">
    <label className="min-w-[220px] flex-1 text-xs font-medium">Verified organization owner
      <select className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={selectedId} onChange={event => setSelectedId(event.target.value)} disabled={disabled || busy || !data?.clients.length}>
        <option value="">Select active project client</option>
        {data?.clients.map(person => <option key={person.id} value={person.id}>{person.label}</option>)}
      </select>
    </label>
    <button type="button" className={buttonClass} disabled={disabled || busy || !selectedId || selectedId === ownerId} onClick={() => void save()}>{busy ? 'Saving…' : 'Verify owner'}</button>
    {(message || error) && <p role="status" className="w-full text-xs text-muted-foreground">{message || error}</p>}
  </div>;
}
