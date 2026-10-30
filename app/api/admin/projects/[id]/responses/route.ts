import {revalidateProjectSurfaces} from '@/lib/projects/revalidate';
import { z } from 'zod';
import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import {taskToday} from '@/lib/tasks/links';
import { staffTaskResponseCommandSchema, taskResponseWorkspaceSchema } from '@/lib/projects/task-response-schema';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project unavailable.' }, 404);
  const result = await access.client.rpc('project_task_response_workspace', { p_request: params.id });
  if(result.error?.code==='42501')return adminReply({error:'Only a workspace admin can record this task review decision.',code:'permission_denied'},403);
  if (result.error) return adminReply({ error: 'Client task responses could not load. Check migration 036.' }, 503);
  const url=new URL(_request.url),status=url.searchParams.get('status')||'pending',kind=url.searchParams.get('kind')||'all';
  const page=Math.max(1,Math.min(10000,Math.floor(Number(url.searchParams.get('page'))||1)));
  const focus=url.searchParams.get('request');
  let query=access.client.from('project_client_task_responses').select('id,task_id,kind,note,status,submitted_at,submitted_by,review_note,reviewed_at,reviewed_by',{count:'exact'}).eq('request_id',params.id);
  if(status==='pending')query=query.eq('status','pending');else if(status==='reviewed')query=query.neq('status','pending');
  if(['completion','clarification','postponement','modification','decline'].includes(kind))query=query.eq('kind',kind);
  if(focus){if(!z.string().uuid().safeParse(focus).success)return adminReply({error:'Invalid request link.'},400);query=query.eq('id',focus);}
  const [rows,pending,people,prefs]=await Promise.all([
    query.order('submitted_at',{ascending:false}).order('id').range((page-1)*25,page*25-1),
    access.client.from('project_client_task_responses').select('id',{count:'exact',head:true}).eq('request_id',params.id).eq('status','pending'),
    access.client.rpc('staff_project_activity_actors',{p_request:params.id}),
    access.client.from('staff_notification_preferences').select('timezone').eq('user_id',access.user.id).maybeSingle(),
  ]);
  if(rows.error||pending.error||people.error||prefs.error)return adminReply({error:'Request history or identities could not load.'},503);
  const baselines=rows.data?.length?await access.client.from('project_request_baselines').select('response_id').eq('request_id',params.id).in('response_id',rows.data.map(row=>row.id)):{data:[],error:null};
  if(baselines.error)return adminReply({error:'Submission baselines could not be verified.'},503);
  const baselineIds=new Set(baselines.data?.map(row=>row.response_id));
  const actors=Object.fromEntries((people.data??[]).map((person:{id:string})=>[person.id,person]));
  const parsed = taskResponseWorkspaceSchema.safeParse({...result.data,total:rows.count,pendingTotal:pending.count,actors,timezone:taskToday(prefs.data?.timezone||'America/Chicago').timezone,
    responses:(rows.data??[]).map(row=>({id:row.id,taskId:row.task_id,kind:row.kind,note:row.note,status:row.status,submittedAt:row.submitted_at,submittedBy:row.submitted_by,reviewNote:row.review_note,reviewedAt:row.reviewed_at,reviewedBy:row.reviewed_by,legacyBaseline:!baselineIds.has(row.id)}))});
  return parsed.success ? adminReply(parsed.data) : adminReply({ error: 'Project unavailable.' }, 404);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the staff workspace.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project unavailable.' }, 404);
  let raw: unknown;
  try { raw = await readAdminJson(request, 6144); } catch { return adminReply({ error: 'Invalid response action.' }, 400); }
  const parsed = staffTaskResponseCommandSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Check the review or policy details.' }, 400);
  const command = parsed.data;
  if(command.action==='review'){
    const target=await access.client.from('project_client_task_responses').select('id').eq('request_id',params.id).eq('id',command.responseId).maybeSingle();
    if(target.error)return adminReply({error:'Request could not be verified.'},503);
    if(!target.data)return adminReply({error:'Request not found in this project.'},404);
  }
  const result = command.action === 'policy'
    ? await access.client.rpc('staff_set_client_task_policy', {
        p_request: params.id, p_task: command.taskId, p_allow: command.allowDecline,
        p_guidance: command.declineGuidance, p_revision: command.expectedRevision,
      })
    : await access.client.rpc('staff_review_client_task_response', {
        p_response: command.responseId, p_action: command.decision,
        p_note: command.note, p_revision: command.projectRevision,
      });
  if(result.error?.code==='42501')return adminReply({error:'Only a workspace admin can record this task review decision.',code:'permission_denied'},403);
  if (result.error) return adminReply({ error: result.error.code === '23514' ? 'Completion rejected. Complete subtasks, resolve dependencies, and reopen affected completed milestones or phases before review.' : 'The action could not be saved.',code:result.error.code==='23514'?'validation_rejected':'database_error' }, result.error.code === '23514' ? 422 : 503);
  const failures: Record<string, [number, string]> = {
    not_found: [404, 'Task or request no longer exists.'],
    conflict: [409, 'Another edit was saved. Refresh and retry.'],
    locked: [409, 'Completed projects are locked.'],
    guidance_required: [400, 'Describe the impact of a client decline (at least 15 characters).'],
    already_reviewed: [409, 'This request has already been reviewed.'],
    stale: [409, 'The submitted task or responsibility changed. Reject this request and ask the client to resubmit against the current work.'],
    baseline_missing:[409,'This legacy request has no saved submission baseline. Reject it and ask the client to submit a new request.'],
    blocked: [409, 'Task is blocked. Resolve dependencies first.'],
    phase_closed: [409, 'This phase is completed. Reopen it before approving additional work.'],
    already_done: [409, 'The task is already complete.'],
  };
  if (failures[result.data?.result]) {
    const [status, message] = failures[result.data.result];
    return adminReply({ error: message,code:result.data.result==='conflict'?'revision_conflict':result.data.result }, status);
  }
  if(result.data?.result==='saved')revalidateProjectSurfaces(params.id);
  return result.data?.result === 'saved' ? adminReply({ saved: true, projectRevision: result.data.projectRevision, revision: result.data.revision }) : adminReply({ error: 'Action could not be confirmed.' }, 503);
}
