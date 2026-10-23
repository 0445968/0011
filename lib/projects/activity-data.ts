import 'server-only';
import {activityCursor,encodeActivityCursor} from './activity-pagination';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProjectBody } from './schema';

type Row = Record<string, unknown>;
type AuditSource =
  | 'project' | 'tasks' | 'milestones' | 'phases' | 'members'
  | 'files' | 'discussion' | 'clients' | 'brief' | 'access' | 'delivery' | 'forms' | 'meetings' | 'communications';

export interface ProjectActivityEvent {
  id: string;
  source: AuditSource;
  title: string;
  detail: string | null;
  actorId: string | null;
  createdAt: string;
  href: string;
  taskId?:string;
  orderKey?:string;
  technical?: boolean;
  provenance?:string;
  recipients?:string[];
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
  if (source === 'clients') return `${base}?tab=requests${itemId?`&request=${encodeURIComponent(itemId)}`:''}`;
  if(source==='meetings')return `${base}?tab=calendar${itemId?`&meeting=${encodeURIComponent(itemId)}`:''}`;
  if(source==='delivery')return `${base}?tab=delivery`;
  if(source==='forms')return base.replace('/projects/','/leads/')+'/onboarding';
  if(source==='communications')return `${base}/activity?type=communications`;
  if ((source === 'tasks' || source === 'milestones') && itemId) {
    const key = source === 'tasks' ? 'task' : 'milestone';
    return `${base}?tab=plan&${key}=${encodeURIComponent(itemId)}`;
  }
  return base;
};

function auditEvent(source: AuditSource, prefix: string, row: Row, title: string, detail: string | null, base: string, actorKey = 'actor', timeKey = 'created_at', focusId?: string): ProjectActivityEvent {
  return {
    id: `${prefix}:${String(row.id ?? row.version ?? row.phase ?? '')}`,
    taskId:text(row.task_id)||text(object(row.details).taskId)||(source==='tasks'?focusId:undefined),orderKey:text(row.__key),source, title, detail: detail?.trim().slice(0, 350) || null,
    actorId: id(row[actorKey]), createdAt: date(row[timeKey]),
    href: link(base, source, focusId),
  };
}

export function snapshots(history: Row[], base: string): ProjectActivityEvent[] {
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
    const common = { orderKey:text(row.__key),actorId: id(row.actor), createdAt: date(row.created_at) };
    const create = (source: AuditSource, slug: string, title: string, detail: string | null, itemId?: string) => {
      events.push({ id: `project:${String(row.id)}:${slug}`, source, title, detail,
        href: link(base, source, itemId),taskId:source==='tasks'?itemId:undefined, technical:slug==='revision'||slug==='baseline', ...common });
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
      if (before.notes !== body.notes) {
        create('project','notes','Project work-plan notes updated',null);
        count++;
      }
      for (const [kind, source] of [['tasks','tasks'],['milestones','milestones']] as const) {
        const oldItems = getCollection(before, kind);
        const newItems = getCollection(body, kind);
        if(oldItems.size===newItems.size&&[...oldItems.keys()].every(key=>newItems.has(key))&&JSON.stringify([...oldItems.keys()])!==JSON.stringify([...newItems.keys()])){
          create(source,`${kind}:order`,`${kind==='tasks'?'Task':'Milestone'} order changed`,null);count++;
        }
        for (const [itemId, item] of newItems) {
          const earlier = oldItems.get(itemId);
          const name = display(item.title, `Untitled ${kind === 'tasks' ? 'task' : 'milestone'}`);
          if (!earlier) {
            create(source, `${kind}:${itemId}:new`, `${kind === 'tasks' ? 'Task' : 'Milestone'} created`, name, itemId);
            count++;
          } else {
            for (const [field, label] of [['title','title'],['status','status'],['dueOn','deadline'],['owner','owner label']] as const) {
              if (earlier[field] === item[field]) continue;
              create(source, `${kind}:${itemId}:${field}`, `${kind === 'tasks' ? 'Task' : 'Milestone'} ${label} changed`,
                `${name}: ${display(earlier[field])} → ${display(item[field])}`, itemId);
              count++;
            }
            if (kind === 'tasks' && earlier.milestoneId !== item.milestoneId) {
              create(source, `${kind}:${itemId}:milestone`, 'Task moved between milestones', name, itemId);
              count++;
            }
            if (kind === 'tasks' && earlier.notes !== item.notes) {
              create(source,`${kind}:${itemId}:notes`,'Task work-plan notes updated',name,itemId);
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
export async function getProjectActivity(client: SupabaseClient, requestId: string, body: ProjectBody, cursor?:string, taskId?:string) {
  const base = `/projects/${requestId}`;
  const before=activityCursor(cursor);
  const response=await client.rpc('staff_project_activity_page',{p_request:requestId,p_before_at:before?.at??null,p_before_key:before?.key??null,p_limit:25,p_task:taskId??null});
  if(response.error||!response.data||!Array.isArray(response.data.rows))throw new Error('Project activity could not load its audited page.');
  const page=response.data as {rows:{source:string;key:string;at:string;payload:Row}[];actors:unknown;next:unknown};
  const bySource:Record<string,Row[]>={};
  for(const row of page.rows)(bySource[row.source]??=[]).push({...row.payload,__key:row.key});
  const titles = new Map(body.tasks.map(task => [task.id, task.title]));
  const taskName = (task: unknown) => titles.get(text(task)) ?? 'Task';
  const events = (bySource.project??[]).flatMap(row=>snapshots(row.previous_snapshot?[row,{id:'predecessor',action:'save',snapshot:row.previous_snapshot}]:[row],base));

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
    events.push(auditEvent('tasks', 'task-history', row, detail.kind==='completion_reopened'?'Task reopened — renewed completion review required':changeLabels[change]??labels[action] ?? 'Task control updated',
      detailText, base, 'actor', 'created_at', task));
  }
  for (const row of bySource.task_notes ?? []) {
    const action=text(row.action);
    const label=action==='create'?'Task note added':action==='edit'?'Task note edited':action==='remove'?'Task note removed':'Task note updated';
    events.push(auditEvent('tasks','task-note',row,label,taskName(row.task_id),base,'actor_id','created_at',text(row.task_id)));
  }
  const files = new Map<string,string>();
  if ((bySource.files ?? []).length || (bySource.task_files ?? []).length) {
    const result = await client.from('project_files').select('id,filename').eq('request_id',requestId).in('id',[...new Set([...(bySource.files??[]),...(bySource.task_files??[])].map(row=>text(row.file_id)))]);
    if (result.error) throw new Error('Project activity could not load file names.');
    for (const file of result.data ?? []) files.set(String(file.id), String(file.filename));
  }
  for (const row of bySource.files ?? []) {
    const action = text(row.action);
    events.push({...auditEvent('files', 'file', row, `Project file ${action.replaceAll('_',' ')}`,
      [files.get(text(row.file_id)) ?? 'File', text(row.reason),row.action==='share'&&row.recipient_ids===null?'Historical recipients not recorded':''].filter(Boolean).join(' · '), base, 'actor_id'),provenance:'project_file_history',recipients:Array.isArray(row.recipient_ids)?row.recipient_ids as string[]:[]});
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
    events.push({ id:`client:${row.id}:submitted`, orderKey:text(row.__key),taskId:task,source:'clients', title:`Client submitted ${kind} request`,
      detail:taskName(task), actorId:id(row.submitted_by), createdAt:date(row.submitted_at), href:link(base,'clients',text(row.id)) });
    if (row.reviewed_at) events.push({ id:`client:${row.id}:reviewed`, orderKey:text(row.__key),taskId:task,source:'clients',
      title:`Client ${kind} request ${row.status === 'accepted' ? 'accepted' : row.status === 'rejected' ? 'rejected' : 'reviewed'}`,
      detail:taskName(task), actorId:id(row.reviewed_by), createdAt:date(row.reviewed_at), href:link(base,'clients',text(row.id)) });
  }
  for (const row of bySource.brief ?? []) {
    events.push({ id:`brief:${row.version}:published`, orderKey:text(row.__key),source:'brief', title:'Project brief version published',
      detail:`Version ${row.version}`, actorId:id(row.published_by), createdAt:date(row.published_at), href:link(base,'brief') });
    if (row.decided_at) events.push({ id:`brief:${row.version}:decision`, orderKey:text(row.__key),source:'brief',
      title:`Project brief ${display(row.status).replaceAll('_',' ')}`, detail:`Version ${row.version}`,
      actorId:id(row.decided_by), createdAt:date(row.decided_at), href:link(base,'brief') });
  }
  for (const row of bySource.policies ?? []) {
    const policy = object(row.next_policy);
    events.push(auditEvent('clients','decline-policy',row,'Client task decline permission changed',
      `${taskName(row.task_id)} · ${policy.allowDecline === true ? 'Allowed' : 'Not allowed'}`,base));
  }

  for(const row of bySource.schedule??[])events.push(auditEvent('tasks','schedule',row,'Task schedule changed',taskName(row.task_id),base,'actor','created_at',text(row.task_id)));
  for(const row of bySource.lifecycle??[])events.push(auditEvent('phases','lifecycle',row,'Project lifecycle updated',text(row.action),base));
  for(const row of bySource.readiness??[])events.push(auditEvent('forms','readiness',row,'Agreement/readiness evidence updated',`${text(row.action)} · recorded evidence, not an electronic signature receipt`,base));
  for(const row of bySource.onboarding??[])events.push(auditEvent('forms','onboarding',row,'Onboarding form or requirement updated',text(row.action),base));
  for(const row of bySource.changes??[])events.push(auditEvent('delivery','change',row,`Project change ${text(row.action)}`,null,base));
  for(const row of bySource.deliverables??[]){
    if(row.created_at)events.push(auditEvent('delivery',`deliverable:${row.deliverable_id}:${row.version}:created`,row,'Deliverable version published',`Version ${row.version}`,base,'created_by'));
    if(row.decided_at)events.push(auditEvent('delivery',`deliverable:${row.deliverable_id}:${row.version}:decision`,row,`Deliverable ${display(row.status)}`,`Version ${row.version}`,base,'decided_by','decided_at'));
  }
  for(const row of bySource.publishing??[]){
    if(row.created_at)events.push(auditEvent('project','publication',row,'Project update published',`Version ${row.version}`,base,'created_by'));
    if(row.withdrawn_at)events.push(auditEvent('project','publication-withdrawal',row,'Project update withdrawn',`Version ${row.version}`,base,'withdrawn_by','withdrawn_at'));
  }
  for(const row of bySource.publication_reviews??[])events.push({...auditEvent('project',`publication-review:${row.version}:${row.user_id}`,row,`Project update ${display(row.decision)}`,`Version ${row.version}`,base,'user_id'),href:`${base}/publish`});
  for(const row of bySource.domain??[]){
    const source=text(row.source) as AuditSource,details=object(row.details);
    events.push({...auditEvent(source,'domain',row,`${source==='communications'?'Communication':source==='meetings'?'Meeting':'Delivery record'} ${text(row.action).replaceAll('_',' ')}`,
      [text(details.title),text(details.kind),details.attempt?`Attempt ${details.attempt}`:'',text(details.status)].filter(Boolean).join(' · '),base,'actor','created_at',text(row.item_id)),
      provenance:source==='communications'?'project_communication_outbox':'project_event_history',recipients:Array.isArray(row.recipients)?row.recipients.filter((value):value is string=>typeof value==='string'):[]});
  }
  for(const row of bySource.legacy_queue??[])events.push({...auditEvent('communications','outbox-evidence',row,`Communication ${text(row.status)}`,text(row.kind),base),provenance:'project_communication_outbox',recipients:row.recipient?[text(row.recipient)]:[]});
  const actorRows = array(page.actors);
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
  return { events: domainActivity(events).filter(event=>!taskId||event.taskId===taskId), actors, nextCursor:encodeActivityCursor(page.next) };
}

/** Stable identities deduplicate repeat audit rows; distinct audit sources remain
 * distinct evidence. Technical snapshots are retained in storage/history readers. */
export function domainActivity(events:ProjectActivityEvent[]) {
  return [...new Map(events.filter(event=>event.createdAt&&!event.technical).map(event=>[event.id,event])).values()]
    .sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||(b.orderKey??'').localeCompare(a.orderKey??'')||a.id.localeCompare(b.id));
}

export type ProjectActivity = Awaited<ReturnType<typeof getProjectActivity>>;
