import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { loadProjectTs } from './load-project-ts.mjs';

const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const migration = read('supabase/migrations/20261023150424_project_targeted_rename.sql');
const integrityMigration = read('supabase/migrations/20261023130000_r7b_project_integrity.sql');
const extract = (file, name) => read(file).match(new RegExp(`create (?:or replace )?function public\\.${name}\\([\\s\\S]*?\\$\\$;`))[0];
const id = '00000000-0000-0000-0000-000000000010';
const actor = '00000000-0000-0000-0000-000000000001';
const workplan = title => ({ title, owner: '', notes: '', milestones: [{ id: 'm', title: 'Milestone', dueOn: null, status: 'in_progress' }], tasks: [
  { id: 'legacy-done', title: 'Legacy client completion', owner: '', dueOn: null, status: 'done', milestoneId: 'm', notes: '' },
  { id: 'todo', title: 'Client task', owner: '', dueOn: null, status: 'todo', milestoneId: 'm', notes: '' },
] });

async function setup() {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth;
    create function auth.uid() returns uuid language sql stable as $$ select '${actor}'::uuid $$;
    create function public.is_inquiry_staff() returns boolean language sql stable as $$ select current_setting('bivi.test_staff',true)::boolean $$;
    create table public.project_client_task_responses(request_id uuid,task_id text,status text);
    create function public.project_task_completion_approved(p_request uuid,p_task text) returns boolean language sql stable as $$ select exists(select 1 from public.project_client_task_responses where request_id=p_request and task_id=p_task and status='accepted') $$;
    create function public.project_effective_task_phases(uuid,jsonb) returns setof text language sql stable as $$ select 'discovery'::text $$;
    create table public.project_inquiries(request_id uuid primary key);
    create table public.inquiry_projects(request_id uuid primary key,revision integer,state text,body jsonb,updated_at timestamptz,updated_by uuid);
    create table public.project_task_controls(request_id uuid,task_id text,owner_type text default 'bivi',phase text default 'discovery',depends_on text,blocker_owner text,primary key(request_id,task_id));
    create table public.project_subtasks(request_id uuid,task_id text,status text);
    create table public.project_milestone_phases(request_id uuid,milestone_id text,phase text);
    create table public.project_phase_states(request_id uuid,phase text,status text);
    create table public.project_task_history(request_id uuid,task_id text,action text,snapshot jsonb,actor uuid);
    create table public.inquiry_project_history(request_id uuid,action text,reason text,snapshot jsonb,actor uuid,created_at timestamptz default now());
    select set_config('bivi.test_staff','true',false);
  `);
  await db.exec(extract('supabase/migrations/202610060006_project_workspace.sql', 'valid_project_body'));
  await db.exec(extract('supabase/migrations/20261022130000_r7a_milestone_draft_reconciliation.sql', 'project_sync_milestone_statuses'));
  await db.exec(extract('supabase/migrations/20261023130000_r7b_project_integrity.sql', 'guard_project_work_integrity'));
  await db.exec(`create trigger work_integrity before update of body,state on public.inquiry_projects for each row execute function public.guard_project_work_integrity(); create trigger milestone_sync before update of body on public.inquiry_projects for each row execute function public.project_sync_milestone_statuses();`);
  await db.exec(migration);
  await db.query('insert into public.project_inquiries values($1)', [id]);
  await db.query('insert into public.inquiry_projects(request_id,revision,state,body) values($1,7,\'active\',$2)', [id, workplan('Old project name')]);
  await db.query(`insert into public.project_task_controls(request_id,task_id,owner_type) values($1,'legacy-done','client'),($1,'todo','client')`, [id]);
  return db;
}

test('targeted project rename preserves stale legacy work, gates new completion, and audits the title change', async () => {
  const db = await setup();
  try {
    const renamed = (await db.query('select public.rename_inquiry_project($1,$2,$3) as result', [id, '  New project name  ', 7])).rows[0].result;
    assert.deepEqual(renamed, { result: 'saved', revision: 8, title: 'New project name' });
    const stored = (await db.query('select revision,body from public.inquiry_projects where request_id=$1', [id])).rows[0];
    assert.equal(stored.body.title, 'New project name');
    assert.equal(stored.body.tasks[0].status, 'done');
    assert.equal(stored.body.tasks[1].status, 'todo');
    assert.equal(stored.body.milestones[0].status, 'in_progress', 'title-only update must not normalize milestones');
    assert.equal(stored.revision, 8);
    const event = (await db.query('select actor,reason,snapshot from public.inquiry_project_history where request_id=$1', [id])).rows[0];
    assert.equal(event.actor, actor);
    assert.equal(event.reason, 'Project title changed');
    assert.deepEqual(event.snapshot.change, { kind: 'project_title_renamed', oldTitle: 'Old project name', newTitle: 'New project name' });
    assert.equal(event.snapshot.revision, 8);

    const noOp = (await db.query('select public.rename_inquiry_project($1,$2,$3) as result', [id, 'New project name', 8])).rows[0].result;
    assert.deepEqual(noOp, { result: 'unchanged', revision: 8, title: 'New project name' });
    assert.equal((await db.query('select count(*)::int n from public.inquiry_project_history where request_id=$1', [id])).rows[0].n, 1);
    assert.equal((await db.query('select public.rename_inquiry_project($1,$2,$3) as result', [id, 'Stale overwrite', 7])).rows[0].result.result, 'conflict');

    await db.query(`insert into public.project_client_task_responses values($1,'legacy-done','accepted')`, [id]);
    const candidate = workplan('New project name');
    candidate.tasks[1].status = 'done';
    await assert.rejects(db.query('update public.inquiry_projects set body=$2,revision=revision+1 where request_id=$1', [id, candidate]), /Client completion requires Bivi review approval/);
    assert.equal((await db.query('select revision from public.inquiry_projects where request_id=$1', [id])).rows[0].revision, 8, 'rejected completion remains atomic');
  } finally { await db.close(); }
});

test('rename RPC enforces staff membership and does not grant anonymous execution', async () => {
  const db = await setup();
  try {
    assert.equal((await db.query(`select has_function_privilege('authenticated','public.rename_inquiry_project(uuid,text,integer)','EXECUTE') allowed`)).rows[0].allowed, true);
    assert.equal((await db.query(`select has_function_privilege('anon','public.rename_inquiry_project(uuid,text,integer)','EXECUTE') allowed`)).rows[0].allowed, false);
    await db.exec(`set role authenticated; select set_config('bivi.test_staff','false',false);`);
    await assert.rejects(db.query('select public.rename_inquiry_project($1,$2,$3)', [id, 'Client rename', 7]), /Staff authorization required/);
  } finally { await db.close(); }
});

test('rename endpoint is staff-gated, revision checked and accepts only the title', () => {
  const route = read('app/api/admin/projects/[id]/rename/route.ts');
  assert.match(route, /isSameOrigin\(request\)/);
  assert.match(route, /getStaffAccess\(\)/);
  assert.match(route, /rename_inquiry_project/);
  assert.match(route, /p_expected_revision/);
  assert.match(route, /z\.string\(\)\.trim\(\)\.min\(1\)\.max\(200\)/);
  assert.doesNotMatch(route, /manage_inquiry_project/);
});

test('a work-plan draft merges its task edits against the renamed canonical title', () => {
  const { mergeProjectBodies } = loadProjectTs('lib/projects/workplan-merge.ts');
  const baseline = workplan('Old project name');
  const draft = structuredClone(baseline);
  draft.tasks[1].notes = 'Keep this unsaved task edit';
  const renamed = workplan('New project name');
  const merged = mergeProjectBodies(baseline, draft, renamed);
  assert.equal(merged.body.title, 'New project name');
  assert.equal(merged.body.tasks[1].notes, 'Keep this unsaved task edit');
  assert.equal(merged.conflicts.length, 0);
});
