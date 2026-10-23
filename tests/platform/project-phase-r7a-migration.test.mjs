import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const migration = read('supabase/migrations/20261022120000_r7a_phase_completion_integrity.sql');
const functionSql = migration.match(/create or replace function public\.manage_project_phase_state\([\s\S]*?\$\$;/)?.[0];

test('R7A phase completion RPC enforces missing-control, subtask and revision blockers in PostgreSQL', async () => {
  assert.ok(functionSql, 'migration must contain the phase RPC definition');
  const db = new PGlite();
  try {
    await db.exec(`
      create schema auth;
      create function auth.uid() returns uuid language sql stable as $$ select current_setting('bivi.test_actor')::uuid $$;
      create function public.is_inquiry_staff() returns boolean language sql stable as $$ select true $$;
      create function public.project_phase_rank(p text) returns integer language sql immutable as $$ select case when p in ('inquiry','proposal-onboarding','discovery','direction','production','review','qa','delivery','handoff') then 1 else 999 end $$;
      create table public.inquiry_projects(request_id uuid primary key,state text not null,body jsonb not null);
      create table public.project_phase_states(request_id uuid,phase text,status text,revision integer,activated_at timestamptz,completed_at timestamptz,updated_at timestamptz,updated_by uuid,primary key(request_id,phase));
      create table public.project_milestone_phases(request_id uuid,milestone_id text,phase text);
      create table public.project_task_controls(request_id uuid,task_id text,phase text);
      create table public.project_subtasks(request_id uuid,task_id text,status text);
      create table public.project_phase_status_history(request_id uuid,phase text,previous_status text,next_status text,revision integer,reason text,actor uuid);
      select set_config('bivi.test_actor','00000000-0000-0000-0000-000000000001',false);
    `);
    await db.exec(functionSql);
    await db.exec(`
      insert into public.inquiry_projects values
        ('00000000-0000-0000-0000-000000000010','active','{"tasks":[{"id":"a","status":"done","milestoneId":"m"}],"milestones":[{"id":"m","status":"done"}]}'::jsonb),
        ('00000000-0000-0000-0000-000000000011','active','{"tasks":[{"id":"missing","status":"done","milestoneId":null}],"milestones":[]}'::jsonb),
        ('00000000-0000-0000-0000-000000000012','active','{"tasks":[{"id":"parent","status":"done","milestoneId":null}],"milestones":[]}'::jsonb);
      insert into public.project_phase_states(request_id,phase,status,revision,activated_at) values
        ('00000000-0000-0000-0000-000000000010','discovery','active',2,now()),
        ('00000000-0000-0000-0000-000000000010','production','active',5,now()),
        ('00000000-0000-0000-0000-000000000011','production','active',1,now()),
        ('00000000-0000-0000-0000-000000000012','production','active',1,now());
      insert into public.project_milestone_phases values ('00000000-0000-0000-0000-000000000010','m','discovery');
      insert into public.project_task_controls values ('00000000-0000-0000-0000-000000000010','a','discovery'),('00000000-0000-0000-0000-000000000012','parent','production');
      insert into public.project_subtasks values ('00000000-0000-0000-0000-000000000012','parent','todo');
    `);

    const close = (request, revision) => db.query(
      `select public.manage_project_phase_state($1,'${request.endsWith('10') ? 'discovery' : 'production'}','completed',$2,'reviewed') as result`,
      [request, revision],
    );
    const saved = await close('00000000-0000-0000-0000-000000000010', 2);
    assert.equal(saved.rows[0].result.result, 'saved');
    const parallel = await db.query(`select status from public.project_phase_states where request_id='00000000-0000-0000-0000-000000000010' and phase='production'`);
    assert.equal(parallel.rows[0].status, 'active', 'closing Discovery must not change Production');
    const stale = await close('00000000-0000-0000-0000-000000000010', 2);
    assert.equal(stale.rows[0].result.result, 'conflict');
    const missing = await close('00000000-0000-0000-0000-000000000011', 1);
    assert.equal(missing.rows[0].result.result, 'task_controls_missing');
    const subtask = await close('00000000-0000-0000-0000-000000000012', 1);
    assert.equal(subtask.rows[0].result.result, 'subtasks_incomplete');
    const audited = await db.query(`select count(*)::int as count from public.project_phase_status_history where request_id='00000000-0000-0000-0000-000000000010'`);
    assert.equal(audited.rows[0].count, 1, 'successful closure writes one audit event');
  } finally {
    await db.close();
  }
});
