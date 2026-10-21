import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProjectBody } from './schema';

type Row = Record<string, unknown>;
type AuditSource =
  | 'project' | 'tasks' | 'milestones' | 'phases' | 'members'
  | 'files' | 'discussion' | 'clients' | 'brief' | 'access';

export interface ProjectActivityEvent {
  id: string;
  source: AuditSource;
  title: string;
  detail: string | null;
  actorId: string | null;
  createdAt: string;
  href: string;
}

export interface ProjectActivityActor {
  id: string;
  label: string;
  kind: 'staff' | 'client' | null;
  avatarPath: string | null;
}

const text = (value: unknown): string => typeof value === 'string' ? value : '';
const object = (value: unknown): Row => value && typeof value === 'object' && !Array.isArray(value) ? value as Row : {};
const array = (value: unknown): Row[] => Array.isArray(value) ? value.map(object) : [];
const id = (value: unknown): string | null => typeof value === 'string' && value.length > 0 ? value : null;
const date = (value: unknown): string => text(value);
const display = (value: unknown, fallback = 'Not set'): string => (text(value).trim() || fallback).slice(0, 180);
const link = (base: string, source: AuditSource, itemId?: string): string => {
  if (source === 'files') return `${base}/files`;
  if (source === 'discussion') return `${base}/discussion`;
  if (source === 'access' || source === 'members') return `${base}/access`;
  if (source === 'brief') return `${base}?tab=brief`;
  if (source === 'phases') return `${base}?tab=phases`;
  if (source === 'clients') return `${base}?tab=plan`;
  if ((source === 'tasks' || source === 'milestones') && itemId) {
    const key = source === 'tasks' ? 'task' : 'milestone';
    return `${base}?tab=plan&${key}=${encodeURIComponent(itemId)}`;
  }
  return base;
};

function auditEvent(source: AuditSource, prefix: string, row: Row, title: string, detail: string | null, base: string, actorKey = 'actor', timeKey = 'created_at', focusId?: string): ProjectActivityEvent {
  return {
    id: `${prefix}:${String(row.id ?? row.version ?? row.phase ?? '')}`,
    source, title, detail: detail?.trim().slice(0, 350) || null,
    actorId: id(row[actorKey]), createdAt: date(row[timeKey]),
    href: link(base, source, focusId),
  };
}

function snapshots(history: Row[], base: string): ProjectActivityEvent[] {
  const events: ProjectActivityEvent[] = [];
  // Oldest to newest. Use the oldest retained snapshot as the baseline, rather
  // than inventing changes that predate our bounded audit window.
  const sequence = [...history].reverse();
  let previous: Row | null = null;
  const getCollection = (body: Row, key: string) => new Map(array(body[key]).filter(item => id(item.id)).map(item => [String(item.id), item]));
  for (const row of sequence) {
    const snapshot = object(row.snapshot);
    const body = object(snapshot.body);
    const action = text(row.action);
    const common = { actorId: id(row.actor), createdAt: date(row.created_at) };
    const create = (source: AuditSource, slug: string, title: string, detail: string | null, itemId?: string) => {
      events.push({ id: `project:${String(row.id)}:${slug}`, source, title, detail,
        href: link(base, source, itemId), ...common });
    };
    if (action !== 'save') {
      const labels: Record<string, string> = {
        activate: 'Project activated', hold: 'Project placed on hold',
        resume: 'Project resumed', complete: 'Project completed', reopen: 'Project reopened',
      };
      create('project', 'state', labels[action] ?? 'Project state changed', text(row.reason) || null);
    } else if (previous) {
      const before = object(previous.body);
      let count = 0;
      if (before.title !== body.title) {
        create('project', 'title', 'Project title changed', `${display(before.title)} → ${display(body.title)}`);
        count++;
      }
      if (before.owner !== body.owner) {
        create('project', 'owner', 'Legacy owner label updated', `${display(before.owner)} → ${display(body.owner)}`);
        count++;
      }
      for (const [kind, source] of [['tasks','tasks'],['milestones','milestones']] as const) {
        const oldItems = getCollection(before, kind);
        const newItems = getCollection(body, kind);
        for (const [itemId, item] of newItems) {
          const earlier = oldItems.get(itemId);
          const name = display(item.title, `Untitled ${kind === 'tasks' ? 'task' : 'milestone'}`);
          if (!earlier) {
            create(source, `${kind}:${itemId}:new`, `${kind === 'tasks' ? 'Task' : 'Milestone'} created`, name, itemId);
            count++;
          } else {
            for (const [field, label] of [['title','title'],['status','status'],['dueOn','deadline']] as const) {
              if (earlier[field] === item[field]) continue;
              create(source, `${kind}:${itemId}:${field}`, `${kind === 'tasks' ? 'Task' : 'Milestone'} ${label} changed`,
                `${name}: ${display(earlier[field])} → ${display(item[field])}`, itemId);
              count++;
            }
            if (kind === 'tasks' && earlier.milestoneId !== item.milestoneId) {
              create(source, `${kind}:${itemId}:milestone`, 'Task moved between milestones', name, itemId);
              count++;
            }
          }
        }
        for (const [itemId, item] of oldItems) {
          if (newItems.has(itemId)) continue;
          create(source, `${kind}:${itemId}:removed`, `${kind === 'tasks' ? 'Task' : 'Milestone'} removed`, display(item.title), itemId);
          count++;
        }
      }
      // Other project fields (e.g., internal notes) have no trustworthy public
      // field-level audit description. Keep the real revision, not a false claim.
      if (!count) create('project', 'revision', 'Other project details updated', text(row.reason) || null);
    } else {
      create('project', 'baseline', 'Earlier project revision', text(row.reason) || null);
    }
    previous = snapshot;
  }
  return events;
}

/** Read-only, staff/RLS-scoped. Never generates synthetic history entries. */
export async function getProjectActivity(client: SupabaseClient, requestId: string, body: ProjectBody) {
  const base = `/projects/${requestId}`;
  const sources = [
    ['project', 'inquiry_project_history', 'id,action,reason,snapshot,actor,created_at'],
    ['phases', 'project_phase_status_history', 'id,phase,previous_status,next_status,reason,actor,created_at'],
    ['phase_colors', 'project_phase_color_history', 'id,phase,previous_color,next_color,revision,reason,actor,created_at'],
    ['hierarchy', 'project_hierarchy_history', 'id,action,details,actor,created_at'],
    ['members', 'project_assignment_events', 'id,task_id,action,before_state,after_state,actor,created_at'],
    ['tasks', 'project_task_history', 'id,task_id,action,snapshot,actor,created_at'],
    ['files', 'project_file_history', 'id,file_id,action,reason,actor_id,created_at'],
    ['discussion', 'project_comment_history', 'id,action,snapshot,actor_id,created_at'],
    ['task_notes', 'project_task_note_history', 'id,task_id,action,snapshot,actor_id,created_at'],
    ['task_files', 'project_task_file_history', 'id,task_id,file_id,action,actor_id,created_at'],
    ['access', 'project_access_history', 'id,user_id,active,can_review,actor_id,created_at'],
    ['clients', 'project_client_task_responses', 'id,task_id,kind,status,submitted_by,submitted_at,reviewed_by,reviewed_at'],
    ['brief', 'project_brief_versions', 'version,status,published_at,published_by,decided_at,decided_by'],
    ['policies', 'project_task_client_policy_history', 'id,task_id,next_policy,actor,created_at'],
  ] as const;

  // Short and bounded source queries. RLS remains enforced by the authenticated
  // staff Supabase client, and no client portal endpoint exposes this feed.
  const response = await Promise.all(sources.map(async ([key, table, fields]) => {
    const ordering = key === 'clients' ? 'submitted_at' : key === 'brief' ? 'published_at' : 'id';
    // The table names have different generated Supabase row types. Widen only
    // this read-only query builder to avoid an unrepresentable union of schemas.
    const historyClient = client as unknown as {
      from: (name: string) => {
        select: (columns: string) => {
          eq: (column: string, value: string) => {
            order: (column: string, options: { ascending: boolean }) => {
              limit: (count: number) => PromiseLike<{ data: unknown; error: unknown }>;
            };
          };
        };
      };
    };
    const result = await historyClient.from(table).select(fields).eq('request_id', requestId)
      .order(ordering, { ascending: false }).limit(key === 'project' ? 100 : 65);
    if (result.error) throw new Error(`Project activity could not load ${key} history. Check prior migrations and staff permissions.`);
    return [key, (result.data ?? []) as unknown as Row[]] as const;
  }));
  const bySource = Object.fromEntries(response) as Record<string, Row[]>;
  const titles = new Map(body.tasks.map(task => [task.id, task.title]));
  const taskName = (task: unknown) => titles.get(text(task)) ?? 'Task';
  const events = snapshots(bySource.project ?? [], base);

  for (const row of bySource.phases ?? []) {
    events.push(auditEvent('phases', 'phase', row, `Phase ${display(row.phase)}: ${display(row.previous_status)} → ${display(row.next_status)}`,
      text(row.reason) || null, base));
  }
  for (const row of bySource.phase_colors ?? []) {
    events.push(auditEvent('phases', 'phase-color', row, `${display(row.phase)} phase color changed`,
      `${display(row.previous_color, 'Purple default')} → ${display(row.next_color, 'Purple default')}${text(row.reason) ? ` · ${text(row.reason)}` : ''}`, base));
  }
  for (const row of bySource.hierarchy ?? []) {
    const detail = object(row.details);
    const action = text(row.action);
    const labels: Record<string,string> = {
      set_milestone_phases:'Milestone phase assignments changed', add_subtask:'Subtask added',
      update_subtask:'Subtask updated', remove_subtask:'Subtask removed', prune_deleted_parents:'Removed stale task relationships',
    };
    const focus = id(detail.taskId);
    events.push(auditEvent(action === 'set_milestone_phases' ? 'milestones' : 'tasks', 'hierarchy', row,
      labels[action] ?? 'Work hierarchy updated', focus ? taskName(focus) : null, base, 'actor', 'created_at', focus ?? undefined));
  }
  for (const row of bySource.members ?? []) {
    const action = text(row.action);
    const label = action === 'client_managers' ? 'Client project managers updated' : action === 'organization_owner' ? 'Client organization owner verified' : 'Task responsibility updated';
    const focus = id(row.task_id);
    const state = object(row.after_state);
    const side = text(state.side);
    const size = Array.isArray(state.users) ? state.users.length : null;
    const detail = action === 'organization_owner' ? `Verified organization member ${text(state.organizationOwner).slice(0, 8)}` : action === 'client_managers' ? 'Designated client managers changed' :
      `${taskName(focus)}${side ? ` · ${side === 'bivi' ? 'Bivi' : 'Client'}` : ''}${size === null ? '' : ` · ${size} assignee(s)`}`;
    events.push(auditEvent('members', 'members', row, label, detail, base, 'actor', 'created_at', focus ?? undefined));
  }
  for (const row of bySource.tasks ?? []) {
    const action = text(row.action);
    const detail = object(row.snapshot);
    const change = text(detail.change);
    const task = text(row.task_id);
    const labels:Record<string,string> = {
      seed:'Task controls initialized', metadata:'Task responsibility or dependency updated',
      client_update:'Client task update recorded', brief_review:'Brief task review recorded',
    };
    const changeLabels:Record<string,string>={priority:'Task priority changed',start_date:'Task start date changed',bulk_status:'Task statuses changed in bulk',staff_assignment:'Task staff assignment changed',staff_deactivated:'Inactive staff assignment removed'};
    const before=detail.before,after=detail.after;
    const detailText=change==='priority'||change==='start_date'?`${taskName(task)} · ${display(before,'Not set')} → ${display(after,'Not set')}`:
      change==='bulk_status'&&before&&after?`${taskName(task)} · ${display(object(before).status)} → ${display(object(after).status)}`:
      taskName(task) + (text(detail.kind) ? ` · ${display(detail.kind)}` : '');
    events.push(auditEvent('tasks', 'task-history', row, changeLabels[change]??labels[action] ?? 'Task control updated',
      detailText, base, 'actor', 'created_at', task));
  }
  for (const row of bySource.task_notes ?? []) {
    const action=text(row.action);
    const label=action==='create'?'Task note added':action==='edit'?'Task note edited':action==='remove'?'Task note removed':'Task note updated';
    events.push(auditEvent('tasks','task-note',row,label,taskName(row.task_id),base,'actor_id','created_at',text(row.task_id)));
  }
  const files = new Map<string,string>();
  if ((bySource.files ?? []).length || (bySource.task_files ?? []).length) {
    const result = await client.from('project_files').select('id,filename').eq('request_id',requestId).limit(500);
    if (result.error) throw new Error('Project activity could not load file names.');
    for (const file of result.data ?? []) files.set(String(file.id), String(file.filename));
  }
  for (const row of bySource.files ?? []) {
    const action = text(row.action);
    events.push(auditEvent('files', 'file', row, `Project file ${action.replaceAll('_',' ')}`,
      [files.get(text(row.file_id)) ?? 'File', text(row.reason)].filter(Boolean).join(' · '), base, 'actor_id'));
  }
  for (const row of bySource.task_files ?? []) {
    const action=text(row.action);
    events.push(auditEvent('files','task-file',row,action==='link'?'File attached to task':'File removed from task',
      `${taskName(row.task_id)} · ${files.get(text(row.file_id))??'File'}`,base,'actor_id','created_at',text(row.task_id)));
  }
  for (const row of bySource.discussion ?? []) {
    const snapshot = object(row.snapshot);
    const action = text(row.action);
    const labels:Record<string,string> = {create:'Discussion comment added',edit:'Discussion comment edited',remove:'Discussion comment removed'};
    events.push(auditEvent('discussion', 'comment', row, labels[action] ?? 'Discussion updated',
      display(snapshot.taskTitle, 'Project discussion'), base, 'actor_id'));
  }
  for (const row of bySource.access ?? []) {
    const change = row.active === true ? 'granted' : 'removed';
    events.push(auditEvent('access', 'access', row, `Client access ${change}`,
      `Member ${text(row.user_id).slice(0,8)} · review access ${row.can_review === true ? 'enabled' : 'disabled'}`,
      base, 'actor_id'));
  }
  for (const row of bySource.clients ?? []) {
    const task = text(row.task_id);
    const kind = display(row.kind).replaceAll('_',' ');
    events.push({ id:`client:${row.id}:submitted`, source:'clients', title:`Client submitted ${kind} request`,
      detail:taskName(task), actorId:id(row.submitted_by), createdAt:date(row.submitted_at), href:link(base,'clients',task) });
    if (row.reviewed_at) events.push({ id:`client:${row.id}:reviewed`, source:'clients',
      title:`Client ${kind} request ${row.status === 'accepted' ? 'accepted' : row.status === 'rejected' ? 'rejected' : 'reviewed'}`,
      detail:taskName(task), actorId:id(row.reviewed_by), createdAt:date(row.reviewed_at), href:link(base,'clients',task) });
  }
  for (const row of bySource.brief ?? []) {
    events.push({ id:`brief:${row.version}:published`, source:'brief', title:'Project brief version published',
      detail:`Version ${row.version}`, actorId:id(row.published_by), createdAt:date(row.published_at), href:link(base,'brief') });
    if (row.decided_at) events.push({ id:`brief:${row.version}:decision`, source:'brief',
      title:`Project brief ${display(row.status).replaceAll('_',' ')}`, detail:`Version ${row.version}`,
      actorId:id(row.decided_by), createdAt:date(row.decided_at), href:link(base,'brief') });
  }
  for (const row of bySource.policies ?? []) {
    const policy = object(row.next_policy);
    events.push(auditEvent('clients','decline-policy',row,'Client task decline permission changed',
      `${taskName(row.task_id)} · ${policy.allowDecline === true ? 'Allowed' : 'Not allowed'}`,base));
  }

  const result = await client.rpc('staff_project_activity_actors', { p_request: requestId });
  if (result.error) throw new Error('Project activity actor names could not load. Apply migration 039.');
  const actorRows = array(result.data);
  const actors: Record<string,ProjectActivityActor> = {};
  for (const row of actorRows) {
    const personId = id(row.id);
    if (!personId) continue;
    actors[personId] = {
      id:personId, label:display(row.label, 'Former account'),
      kind:row.kind === 'staff' || row.kind === 'client' ? row.kind : null,
      avatarPath:id(row.avatarPath),
    };
  }
  events.sort((a,b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
  return { events: events.filter(row => row.createdAt).slice(0,250), actors };
}
