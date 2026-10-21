import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import vm from 'node:vm';
import { PGlite } from '@electric-sql/pglite';

const require = createRequire(import.meta.url);
const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const migrations = read('supabase/migrations/20261022130000_r7a_milestone_draft_reconciliation.sql');
const baselineBackfill = migrations.slice(
  migrations.indexOf('update public.project_workplan_drafts d set base_body'),
  migrations.indexOf('-- A tombstone generation'),
);
const milestoneSql = migrations.match(/create or replace function public\.project_sync_milestone_statuses\(\)[\s\S]*?\$\$;/)?.[0];
const subtaskGuardSql = migrations.match(/create function public\.guard_project_subtask_completed_milestone\(\)[\s\S]*?\$\$;/)?.[0];
const draftContextSql = migrations.match(/create function public\.staff_project_workplan_draft_context\(p_request uuid\)[\s\S]*?\$\$;/)?.[0];
const draftValidatorSql = migrations.match(/create function public\.valid_project_workplan_draft_body\(b jsonb\)[\s\S]*?\$\$;/)?.[0];
const saveDraftSql = migrations.match(/create function public\.save_project_workplan_draft\([\s\S]*?\$\$;/)?.[0];
const discardDraftSql = migrations.match(/create function public\.discard_project_workplan_draft\([\s\S]*?\$\$;/)?.[0];
const projectRpcMigration = read('supabase/migrations/202610140024_my_tasks.sql');
const projectRpcSql = projectRpcMigration.match(/create or replace function public\.manage_inquiry_project\([\s\S]*?\$\$;/)?.[0];
const validProjectSql = read('supabase/migrations/202610060006_project_workspace.sql').match(/create function public\.valid_project_body\(b jsonb\)[\s\S]*?\$\$;/)?.[0];

const body = ({ taskStatus = 'todo', milestoneStatus = 'planned', extraTasks = [] } = {}) => ({
  title: 'Project', owner: '', notes: '',
  milestones: [{ id: 'm', title: 'Milestone', dueOn: null, status: milestoneStatus }],
  tasks: [{ id: 't', title: 'Task', owner: '', dueOn: null, status: taskStatus, milestoneId: 'm', notes: '' }, ...extraTasks],
});

function loadTs(path) {
  const exports = {};
  const source = read(path);
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  vm.runInNewContext(compiled.outputText, { exports, module: { exports }, require });
  return exports;
}

async function projectDb() {
  assert.ok(milestoneSql && subtaskGuardSql && projectRpcSql && validProjectSql);
  const db = new PGlite();
  await db.exec(`
    create schema auth;
    create function auth.uid() returns uuid language sql stable as $$ select current_setting('bivi.test_actor')::uuid $$;
    create function public.is_inquiry_staff() returns boolean language sql stable as $$ select true $$;
    create table public.project_inquiries(request_id uuid primary key);
    create table public.inquiry_proposals(request_id uuid,version integer,status text,body jsonb);
    create table public.inquiry_readiness(request_id uuid,revision integer,state text,body jsonb);
    create table public.inquiry_onboarding(request_id uuid,revision integer,state text,body jsonb,proposal_version integer,completed_readiness_revision integer);
    create table public.inquiry_projects(request_id uuid primary key,proposal_version integer,revision integer not null,state text not null,body jsonb not null,scope_snapshot jsonb,onboarding_snapshot jsonb,onboarding_items_snapshot jsonb,readiness_snapshot jsonb,activated_readiness_revision integer,activated_onboarding_revision integer,activated_by uuid,updated_at timestamptz,updated_by uuid);
    create table public.project_task_controls(request_id uuid,task_id text,owner_type text default 'bivi',phase text default 'discovery',service_id text,depends_on text,blocker_owner text,updated_by uuid,primary key(request_id,task_id));
    create table public.project_subtasks(request_id uuid,task_id text,status text);
    create table public.project_client_task_responses(request_id uuid,task_id text,kind text,status text);
    create table public.project_lifecycle(request_id uuid,phase text);
    create table public.project_task_history(request_id uuid,task_id text,action text,snapshot jsonb,actor uuid);
    create table public.inquiry_project_history(request_id uuid,action text,reason text,snapshot jsonb,actor uuid);
    create function public.project_prerequisites_met(p_id uuid) returns boolean language sql stable as $$ select true $$;
    select set_config('bivi.test_actor','00000000-0000-0000-0000-000000000001',false);
  `);
  await db.exec(validProjectSql);
  await db.exec(milestoneSql);
  await db.exec(subtaskGuardSql);
  await db.exec(projectRpcSql);
  await db.exec(`create trigger milestone_guard before update of body on public.inquiry_projects for each row execute function public.project_sync_milestone_statuses();`);
  await db.exec(`create trigger completed_milestone_subtask_guard before insert or update of task_id,status or delete on public.project_subtasks for each row execute function public.guard_project_subtask_completed_milestone();`);
  return db;
}

test('milestone validation rejection is atomic and the same candidate can complete required tasks and milestone together', async () => {
  const db = await projectDb();
  const ids = ['00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000012'];
  try {
    for (const [i, id] of ids.entries()) {
      await db.query(`insert into public.project_inquiries values ($1)`, [id]);
      await db.query(`insert into public.inquiry_projects(request_id,proposal_version,revision,state,body) values($1,1,1,'active',$2)`, [id, body()]);
      await db.query(`insert into public.project_task_controls(request_id,task_id) values($1,'t')`, [id]);
    }
    await db.query(`insert into public.project_subtasks values($1,'t','done')`, [ids[1]]);
    const candidate = body({ milestoneStatus: 'done' });
    await assert.rejects(db.query(`select public.manage_inquiry_project($1,$2)`, [ids[0], { action:'save', expectedRevision:1, body:candidate }]), /Complete all linked milestone tasks and subtasks first/);
    const unchanged = await db.query(`select revision,body from public.inquiry_projects where request_id=$1`, [ids[0]]);
    assert.equal(unchanged.rows[0].revision, 1);
    assert.deepEqual(unchanged.rows[0].body, body());
    assert.equal((await db.query(`select count(*)::int as n from public.inquiry_project_history where request_id=$1`, [ids[0]])).rows[0].n, 0);
    assert.equal((await db.query(`select count(*)::int as n from public.project_task_controls where request_id=$1`, [ids[0]])).rows[0].n, 1);
    const stale = await db.query(`select public.manage_inquiry_project($1,$2) as result`, [ids[0], { action:'save', expectedRevision:0, body:body() }]);
    assert.equal(stale.rows[0].result.result, 'conflict');
    assert.equal((await db.query(`select revision from public.inquiry_projects where request_id=$1`, [ids[0]])).rows[0].revision, 1);

    const allDone = body({ taskStatus:'done', milestoneStatus:'done' });
    const saved = await db.query(`select public.manage_inquiry_project($1,$2) as result`, [ids[1], { action:'save', expectedRevision:1, body:allDone }]);
    assert.equal(saved.rows[0].result.result, 'saved');
    assert.equal(saved.rows[0].result.revision, 2);
    assert.deepEqual((await db.query(`select body from public.inquiry_projects where request_id=$1`, [ids[1]])).rows[0].body, allDone);
    assert.equal((await db.query(`select count(*)::int as n from public.inquiry_project_history where request_id=$1`, [ids[1]])).rows[0].n, 1);
    await assert.rejects(db.query(`insert into public.project_subtasks values($1,'t','todo')`, [ids[1]]), /Reopen the completed milestone/);
    await db.query(`delete from public.project_subtasks where request_id=$1 and task_id='t' and status='done'`, [ids[1]]);

    await db.query(`insert into public.project_subtasks values($1,'t','todo')`, [ids[2]]);
    await assert.rejects(db.query(`select public.manage_inquiry_project($1,$2)`, [ids[2], { action:'save', expectedRevision:1, body:allDone }]), /Complete all linked milestone tasks and subtasks first/);
    assert.equal((await db.query(`select revision from public.inquiry_projects where request_id=$1`, [ids[2]])).rows[0].revision, 1);
    assert.equal((await db.query(`select count(*)::int as n from public.inquiry_project_history where request_id=$1`, [ids[2]])).rows[0].n, 0);
  } finally { await db.close(); }
});

test('milestone closure fails closed for unresolved dependencies, client approval and missing saved controls', async () => {
  const db = await projectDb();
  const ids = ['00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000022'];
  const dep = { id:'dependency', title:'Dependency', owner:'', dueOn:null, status:'todo', milestoneId:null, notes:'' };
  try {
    for (const id of ids) await db.query(`insert into public.project_inquiries values($1)`, [id]);
    await db.query(`insert into public.inquiry_projects(request_id,proposal_version,revision,state,body) values($1,1,1,'active',$2),($3,1,1,'active',$2),($4,1,1,'active',$5)`, [ids[0], body(), ids[1], ids[2], body()]);
    await db.query(`insert into public.project_task_controls(request_id,task_id,depends_on) values($1,'t','dependency'),($2,'t',null)`, [ids[0], ids[1]]);
    await db.query(`update public.project_task_controls set owner_type='client' where request_id=$1 and task_id='t'`, [ids[1]]);
    const withDependency = body({ taskStatus:'done', milestoneStatus:'done', extraTasks:[dep] });
    await assert.rejects(db.query(`select public.manage_inquiry_project($1,$2)`, [ids[0], {action:'save',expectedRevision:1,body:withDependency}]), /Resolve task dependencies and blockers/);
    const allDone = body({taskStatus:'done',milestoneStatus:'done'});
    await assert.rejects(db.query(`select public.manage_inquiry_project($1,$2)`, [ids[1], {action:'save',expectedRevision:1,body:allDone}]), /Client task completion requires staff approval/);
    await assert.rejects(db.query(`select public.manage_inquiry_project($1,$2)`, [ids[2], {action:'save',expectedRevision:1,body:allDone}]), /Task control record is missing/);
    const counts = await db.query(`select count(*)::int as n from public.inquiry_project_history where request_id=any($1::uuid[])`, [ids]);
    assert.equal(counts.rows[0].n, 0);
  } finally { await db.close(); }
});

test('draft generation tombstone prevents a delayed autosave from recreating a discarded draft', async () => {
  assert.ok(draftValidatorSql && saveDraftSql && discardDraftSql);
  const db = new PGlite();
  const id = '00000000-0000-0000-0000-000000000030';
  const base = body();
  try {
    await db.exec(`
      create schema auth;
      create function auth.uid() returns uuid language sql stable as $$ select '00000000-0000-0000-0000-000000000001'::uuid $$;
      create function public.is_inquiry_staff() returns boolean language sql stable as $$ select true $$;
      create table public.inquiry_projects(request_id uuid primary key, revision integer, state text, body jsonb);
      create table public.project_workplan_drafts(request_id uuid,staff_id uuid,base_revision integer,body jsonb,base_body jsonb,updated_at timestamptz,primary key(request_id,staff_id));
      create table public.project_workplan_draft_versions(request_id uuid,staff_id uuid,generation bigint default 0,updated_at timestamptz default now(),primary key(request_id,staff_id));
    `);
    await db.query(`insert into public.inquiry_projects values($1,1,'active',$2)`, [id,base]);
    await db.exec(validProjectSql);
    await db.exec(draftValidatorSql);
    await db.exec(saveDraftSql);
    await db.exec(discardDraftSql);
    const draft = { ...base, title: 'Private draft' };
    const saved = await db.query(`select public.save_project_workplan_draft($1,1,$2,$3,0) as result`, [id,draft,base]);
    assert.equal(saved.rows[0].result.generation, 1);
    const discarded = await db.query(`select public.discard_project_workplan_draft($1,1) as result`, [id]);
    assert.equal(discarded.rows[0].result.generation, 2);
    assert.equal(discarded.rows[0].result.currentRevision, 1);
    assert.deepEqual(discarded.rows[0].result.body, base);
    const delayed = await db.query(`select public.save_project_workplan_draft($1,1,$2,$3,1) as result`, [id,draft,base]);
    assert.equal(delayed.rows[0].result.result, 'generation_conflict');
    assert.equal((await db.query(`select count(*)::int as n from public.project_workplan_drafts`)).rows[0].n, 0);
  } finally { await db.close(); }
});

test('legacy draft recovery uses only an exact saved revision as its baseline', async () => {
  assert.ok(draftContextSql && baselineBackfill.trim());
  const db = new PGlite();
  const id = '00000000-0000-0000-0000-000000000031';
  try {
    await db.exec(`
      create schema auth;
      create function auth.uid() returns uuid language sql stable as $$ select '00000000-0000-0000-0000-000000000001'::uuid $$;
      create function public.is_inquiry_staff() returns boolean language sql stable as $$ select true $$;
      create table public.inquiry_projects(request_id uuid primary key,revision integer,state text,body jsonb);
      create table public.project_workplan_drafts(request_id uuid,staff_id uuid,base_revision integer,body jsonb,base_body jsonb,updated_at timestamptz,primary key(request_id,staff_id));
      create table public.project_workplan_draft_versions(request_id uuid,staff_id uuid,generation bigint,updated_at timestamptz,primary key(request_id,staff_id));
      create table public.inquiry_project_history(id bigint,request_id uuid,snapshot jsonb);
      insert into public.inquiry_projects values('${id}',3,'active','{}'::jsonb);
      insert into public.project_workplan_drafts values('${id}','00000000-0000-0000-0000-000000000001',2,'{}'::jsonb,null,now());
      insert into public.inquiry_project_history values(1,'${id}','{"revision":1,"body":{"title":"too old"}}'::jsonb);
    `);
    await db.exec(baselineBackfill);
    await db.exec(draftContextSql);
    const noExactBaseline = await db.query(`select public.staff_project_workplan_draft_context($1) as result`, [id]);
    assert.equal(noExactBaseline.rows[0].result.draft.baseBody, null, 'an older snapshot is never guessed as the draft baseline');
    await db.query(`insert into public.inquiry_project_history values(2,$1,$2)`, [id,{revision:2,body:body()}]);
    await db.exec(baselineBackfill);
    const backfilled = await db.query(`select base_body from public.project_workplan_drafts where request_id=$1`, [id]);
    assert.deepEqual(backfilled.rows[0].base_body, body(), 'migration backfills only an exact history revision');
    const exactBaseline = await db.query(`select public.staff_project_workplan_draft_context($1) as result`, [id]);
    assert.deepEqual(exactBaseline.rows[0].result.draft.baseBody, body());
  } finally { await db.close(); }
});

test('three-way merge preserves independent edits and blocks same-field conflicts until a choice is made', () => {
  const { mergeProjectBodies } = loadTs('lib/projects/workplan-merge.ts');
  const base = body();
  const local = { ...base, tasks: [{ ...base.tasks[0], notes: 'Local note' }] };
  const latest = { ...base, tasks: [{ ...base.tasks[0], status: 'done' }] };
  const merged = mergeProjectBodies(base, local, latest);
  assert.equal(merged.conflicts.length, 0);
  assert.equal(merged.body.tasks[0].notes, 'Local note');
  assert.equal(merged.body.tasks[0].status, 'done');
  const collision = { ...latest, tasks: [{ ...latest.tasks[0], notes: 'Other note' }] };
  const conflicted = mergeProjectBodies(base, local, collision);
  assert.equal(conflicted.conflicts.length, 1);
  assert.equal(conflicted.body.tasks[0].notes, 'Local note', 'the draft remains visible until resolved');
  const selected = mergeProjectBodies(base, local, collision, { 'tasks.t.notes':'latest' });
  assert.equal(selected.conflicts.length, 0);
  assert.equal(selected.body.tasks[0].notes, 'Other note');
});

test('save response classification distinguishes validation, actual revision conflict, success with refresh failure and unknown outcome', () => {
  const { interpretProjectSaveOutcome } = loadTs('lib/projects/workplan-save-outcome.ts');
  assert.equal(interpretProjectSaveOutcome(409,{error:'Review all milestone tasks'}).kind,'rejected');
  assert.equal(interpretProjectSaveOutcome(409,{code:'revision_conflict'}).kind,'revision_conflict');
  assert.equal(interpretProjectSaveOutcome(422,{code:'milestone_tasks_incomplete',blockers:[]}).kind,'validation_rejected');
  const saved = interpretProjectSaveOutcome(200,{saved:true,revision:4,refreshWarning:'saved, but refresh failed'});
  assert.equal(saved.kind,'saved');
  assert.equal(saved.refreshWarning,'saved, but refresh failed');
  assert.equal(interpretProjectSaveOutcome(503,{}).kind,'unknown');
});

test('same-session revision changes use saved-body reconciliation, preserve drafts on discard failure, and keep phase feedback connected to Overview', () => {
  const workspace = read('components/admin/ProjectWorkspace.tsx');
  const draft = read('components/admin/projects/useProjectWorkDraft.ts');
  const responseReview = read('components/admin/projects/ProjectTaskResponseReview.tsx');
  const phaseHook = read('components/admin/projects/useProjectPhaseStatuses.ts');
  const phaseCards = read('components/admin/projects/ProjectPhaseCards.tsx');
  const page = read('app/admin/(workspace)/projects/[id]/page.tsx');
  const overview = read('components/admin/projects/ProjectOverview.tsx');
  const directory = read('components/admin/projects/DirectoryIndicators.tsx');
  assert.match(workspace, /drafts\.reconcile\(latest\.body, latest\.revision\)/);
  assert.match(workspace, /saveOutcome\?\.kind === 'revision_conflict'/);
  assert.match(workspace, /saveOutcome\?\.kind === 'validation_rejected'/);
  assert.match(draft, /cancelPendingAutosave\(\)/);
  assert.match(draft, /await suspendAutosaves\(\)/);
  assert.match(draft, /const current = await deletePrivateDraft\(\);/);
  assert.match(migrations, /'currentRevision', project\.revision, 'state', project\.state, 'body', project\.body/);
  assert.match(responseReview, /workplanDirty/);
  assert.match(responseReview, /router\.refresh\(\)/);
  assert.match(phaseHook, /setSavedByPhase/);
  assert.match(phaseHook, /router\.refresh\(\)/);
  assert.match(phaseCards, /Confirm change/);
  assert.match(page, /staff_project_phase_states/);
  assert.match(page, /phaseStates=\{overview\.phaseStates\}/);
  assert.match(overview, /formalStates=\{phaseStates\}/);
  assert.match(directory, /Saved project phase statuses/);
  assert.doesNotMatch(directory, /Saved phase status/);
  assert.match(directory, /state==='completed'.*Check/s);
});
