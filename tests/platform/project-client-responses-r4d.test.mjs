import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
const sql=readFileSync('supabase/migrations/202610160036_project_client_task_responses.sql','utf8');
const portal=readFileSync('components/portal/ClientTaskResponseActions.tsx','utf8');
const staff=readFileSync('components/admin/projects/ProjectTaskResponseReview.tsx','utf8');
const read=(text,p)=>assert.match(text,p);
test('client task responses require project/organization authorization and staff-only review',()=>{
  read(sql,/public\.client_can_respond_to_task\(p_request,p_task,auth\.uid\(\)\)/);
  read(sql,/public\.project_client_member_eligible\(p_request,p_user\)/);
  read(sql,/not public\.is_inquiry_staff\(\)/);
  read(sql,/one_pending.*status='pending'/);
  read(sql,/create policy client_task_response_own_read/);
  read(sql,/revoke all on public\.project_task_client_policies,public\.project_client_task_responses/);
});
test('legacy client completion writes are denied at the database boundary',()=>{
  read(sql,/alter function public\.manage_client_project_task\(uuid,jsonb\) rename to/);
  read(sql,/revoke all on function public\.manage_client_project_task_r4c_legacy\(uuid,jsonb\) from public,anon,authenticated,service_role/);
  read(sql,/p_command->>'status'='done'.*staff_review_required/);
  read(sql,/not public\.client_can_respond_to_task\(p_request_id,coalesce\(p_command->>'taskId',''\),auth\.uid\(\)\)/);
});
test('only staff approval advances canonical completed task status',()=>{
  read(sql,/create function public\.staff_review_client_task_response/);
  read(sql,/p_action='accept' and r\.kind='completion'/);
  read(sql,/jsonb_set\(t\.value,'\{status\}','"done"'::jsonb\)/);
  read(sql,/result_revision:=p\.revision/);
});
test('decline requires staff policy, risk guidance and client explanation',()=>{
  read(sql,/allow_decline boolean not null default false/);
  read(sql,/length\(btrim\(p_guidance\)\)<15/);
  read(sql,/p_kind='decline'/);
  read(portal,/Before declining/);
  read(portal,/policy\.declineGuidance/);
  read(staff,/Client decline permissions/);
});
test('review buttons and client confirmation use in-app dialogs, not browser popups',()=>{
  read(portal,/<Dialog open=\{open\}/);
  read(staff,/<Dialog open=\{review!==null\}/);
  assert.doesNotMatch(portal,/window\.(confirm|alert|prompt)\(/);
  assert.doesNotMatch(staff,/window\.(confirm|alert|prompt)\(/);
});
