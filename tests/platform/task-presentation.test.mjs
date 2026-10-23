import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const migrations=new URL('../../supabase/migrations/',import.meta.url);
test('task codes remain stable and tags enforce staff access, revision checks and audit',async()=>{
 const db=new PGlite();try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to authenticated;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id bigint generated always as identity,bucket_id text,name text,metadata jsonb,unique(bucket_id,name));alter table storage.objects enable row level security;grant usage on schema storage to authenticated,anon;grant select,insert,update,delete on storage.objects to authenticated,anon;grant usage on sequence storage.objects_id_seq to authenticated,anon;`);
  for(const file of fs.readdirSync(migrations).filter(name=>name.endsWith('.sql')).sort())await db.exec(fs.readFileSync(new URL(file,migrations),'utf8'));

 const staff=randomUUID(),client=randomUUID(),request=randomUUID();
 await db.query('insert into auth.users(id,email) values($1,$2),($3,$4)',[staff,'staff@example.com',client,'client@example.com']);
 await db.query('insert into inquiry_staff(user_id,active) values($1,true)',[staff]);
 await db.query('insert into project_inquiries(request_id,payload,payload_hash) values($1,$2,$3)',[request,{},'a'.repeat(64)]);
 await db.query("insert into inquiry_proposals(request_id,version,status,body) values($1,1,'accepted','{}')",[request]);
 const task=id=>({id,title:id,owner:'',dueOn:null,status:'todo',milestoneId:null,notes:''});
 const body={title:'Tags',owner:'',notes:'',milestones:[],tasks:[task('first'),task('second'),task('third')]};
 await db.query("insert into inquiry_projects(request_id,proposal_version,revision,state,body,scope_snapshot,onboarding_snapshot,readiness_snapshot,activated_readiness_revision,activated_onboarding_revision) values($1,1,1,'active',$2,'{}','{}','{}',1,1)",[request,body]);
 await db.query("insert into project_task_controls(request_id,task_id,owner_type,phase) values($1,'first','bivi','inquiry'),($1,'second','bivi','production')",[request]);
 assert.deepEqual((await db.query('select code from project_task_presentation order by sequence_number')).rows.map(row=>row.code),['IQ-001','PD-002']);
 await db.query("update project_task_controls set phase='production' where task_id='first'");
 assert.equal((await db.query("select code from project_task_presentation where task_id='first'")).rows[0].code,'IQ-001');
 await db.exec('set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[staff]);
 const save=(tags,revision=1,projectRevision=1)=>db.query('select set_project_task_tags($1,$2,$3,$4,$5) r',[request,'first',tags,revision,projectRevision]);
 assert.equal((await save([' Design ','design','urgent'])).rows[0].r.result,'saved');
 assert.deepEqual((await db.query("select tags from project_task_presentation where task_id='first'")).rows[0].tags,['design','urgent']);
 assert.equal((await save(['different'])).rows[0].r.result,'conflict');
 assert.equal((await save(['design','urgent'])).rows[0].r.result,'saved');
 assert.equal((await save(['design'],2,999)).rows[0].r.result,'conflict');
 await assert.rejects(save(['']),/Invalid tags/);
 await assert.rejects(save(Array(21).fill('tag')),/Invalid tags/);
 await assert.rejects(db.query("update project_task_presentation set tags='{}'"),/permission denied/);
 assert.equal((await db.query("select count(*)::int n from project_task_history where snapshot->>'change'='tags'")).rows[0].n,1);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[client]);
 assert.equal((await db.query('select * from project_task_presentation')).rows.length,0);
 await assert.rejects(save(['forged'],2),/Staff authorization required/);
 await db.exec('reset role');
 await db.query("delete from project_task_controls where task_id='second'");
 await db.query("insert into project_task_controls(request_id,task_id,owner_type,phase) values($1,'third','bivi','production')",[request]);
 assert.equal((await db.query("select code from project_task_presentation where task_id='third'")).rows[0].code,'PD-003');
 await db.query("insert into project_operational_status(request_id,status,reason,updated_by) values($1,'inactive','Test lock',$2) on conflict(request_id) do update set status='inactive'",[request,staff]);
 await db.exec('set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[staff]);
 assert.equal((await save(['locked'],2)).rows[0].r.result,'locked');
 }finally{await db.close();}
});
