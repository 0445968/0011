import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = file => readFileSync(file,'utf8');

test('R5b activity is staff-only and serves existing authoritative audit sources',()=>{
  const page = read('app/admin/(workspace)/projects/[id]/activity/page.tsx');
  const data = read('lib/projects/activity-data.ts');
  const sql=read('supabase/migrations/20261023150000_r7e_project_events_requests_notifications.sql');
  assert.match(page,/await requireStaff\(\)/);
  assert.match(data,/import 'server-only'/);
  for(const source of ['inquiry_project_history','project_phase_status_history','project_hierarchy_history',
    'project_assignment_events','project_task_history','project_file_history','project_comment_history',
    'project_access_history','project_client_task_responses','project_brief_versions']){
    assert.ok(sql.includes(source),`Missing audit source: ${source}`);
  }
  assert.match(data,/previous = snapshot/);
  assert.match(data,/Other project details updated/);
  assert.match(data,/staff_project_activity_page/);assert.match(sql,/lag\(snapshot\) over/);
});

test('R5b actor lookup stays staff-gated and project-scoped',()=>{
  const sql = read('supabase/migrations/202610200039_project_activity_actors.sql');
  assert.match(sql,/not public\.is_inquiry_staff\(\)/);
  assert.match(sql,/where request_id=p_request/g);
  assert.match(sql,/grant execute on function public\.staff_project_activity_actors\(uuid\) to authenticated/);
  assert.doesNotMatch(sql,/grant (select|execute) .* to anon;/);
});

test('R5b activity stays live and R6 enables the project calendar',()=>{
  const sections = read('lib/admin/workspace/project-sections.ts');
  assert.match(sections,/id: 'activity', label: 'Activity', href: '\/activity'/);
  assert.match(sections,/id: 'calendar'.*tab=calendar/);
});
