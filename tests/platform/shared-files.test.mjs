import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const migrations=new URL('../../supabase/migrations/',import.meta.url);
test('Shared Files preserves private storage and client isolation while projecting project/company/uploader and auditing staff access',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to authenticated;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id bigint generated always as identity,bucket_id text,name text,metadata jsonb,unique(bucket_id,name));alter table storage.objects enable row level security;grant usage on schema storage to authenticated,anon;grant select,insert,update,delete on storage.objects to authenticated,anon;grant usage on sequence storage.objects_id_seq to authenticated,anon;`);
 for(const file of fs.readdirSync(migrations).filter(name=>name.endsWith('.sql')).sort())await db.exec(fs.readFileSync(new URL(file,migrations),'utf8'));
 const staff=randomUUID(),client=randomUUID(),other=randomUUID(),project=randomUUID(),company=randomUUID();
 await db.query('insert into auth.users(id,email) values($1,$2),($3,$4),($5,$6)',[staff,'staff@example.com',client,'client@example.com',other,'other@example.com']);await db.query('insert into inquiry_staff(user_id) values($1)',[staff]);
 await db.query("insert into client_profiles(user_id,first_name,last_name) values($1,'Client','Person')",[client]);
 await db.query('insert into client_organizations(id,name) values($1,$2)',[company,'Sample Company']);
 await db.query('insert into project_inquiries(request_id,payload,payload_hash) values($1,$2,$3)',[project,{name:'Client',email:'client@example.com'},'a'.repeat(64)]);await db.query("insert into inquiry_proposals(request_id,version,status,body) values($1,1,'accepted','{}')",[project]);
 await db.query("insert into inquiry_projects(request_id,proposal_version,revision,state,body,scope_snapshot,onboarding_snapshot,readiness_snapshot,activated_readiness_revision,activated_onboarding_revision,company_id) values($1,1,1,'active',$2,'{}','{}','{}',1,1,$3)",[project,{title:'Files Project',owner:'',notes:'',milestones:[],tasks:[]},company]);
 await db.query('insert into project_clients(request_id,user_id) values($1,$2)',[project,client]);
 const privateId=randomUUID(),sharedId=randomUUID(),pendingId=randomUUID(),withdrawnId=randomUUID();
 for(const [id,state,shared,uploader,name] of [[privateId,'ready',false,staff,'Private.png'],[sharedId,'ready',true,client,'Shared.txt'],[pendingId,'pending',false,staff,'Pending.pdf'],[withdrawnId,'withdrawn',false,null,'Withdrawn.zip']]){
  await db.query('insert into project_files(id,request_id,object_path,filename,size_bytes,mime_type,uploader_id,state,shared) values($1,$2,$3,$4,100,$5,$6,$7,$8)',[id,project,`${project}/${id}`,name,name.endsWith('png')?'image/png':name.endsWith('txt')?'text/plain':name.endsWith('pdf')?'application/pdf':'application/zip',uploader,state,shared]);
 }
 const actor=async id=>{await db.exec('set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);};
 await actor(staff);const rows=(await db.query('select * from staff_file_directory')).rows;assert.equal(rows.length,4);assert.equal(new Set(rows.map(row=>row.id)).size,4);assert.ok(rows.every(row=>row.company_name==='Sample Company'&&row.project_title==='Files Project'));
 assert.ok(rows.find(row=>row.id===sharedId).uploader_label.startsWith('Client Person'));assert.equal(rows.find(row=>row.id===privateId).uploader_type,'staff');assert.equal(rows.find(row=>row.id===withdrawnId).uploader_type,'former');assert.ok(!('object_path' in rows[0]));
 assert.equal((await db.query("select * from staff_file_directory where state='ready'")).rows.length,2);
 const before=(await db.query('select revision,state from project_files where id=$1',[privateId])).rows[0];await db.query("select record_staff_file_access($1,$2,'preview')",[project,privateId]);await db.query("select record_staff_file_access($1,$2,'download')",[project,privateId]);assert.deepEqual((await db.query('select revision,state from project_files where id=$1',[privateId])).rows[0],before);
 const events=(await db.query('select action,actor_id,revision from project_file_history where file_id=$1 order by id',[privateId])).rows;assert.deepEqual(events.map(row=>row.action),['preview','download']);assert.ok(events.every(row=>row.actor_id===staff&&row.revision===before.revision));
 await assert.rejects(db.query("select record_staff_file_access($1,$2,'download')",[project,pendingId]),/File unavailable/);await assert.rejects(db.query("select record_staff_file_access($1,$2,'download')",[project,withdrawnId]),/File unavailable/);await assert.rejects(db.query("select record_staff_file_access($1,$2,'share')",[project,privateId]),/Invalid access/);
 await assert.rejects(db.query("update staff_file_directory set shared=true"),/permission denied|cannot update/);
 assert.equal((await db.query('select can_download_project_file($1) allowed',[`${project}/${privateId}`])).rows[0].allowed,true);
 await actor(client);assert.equal((await db.query('select * from staff_file_directory')).rows.length,0);assert.equal((await db.query('select * from staff_file_uploader($1)',[staff])).rows.length,0);await assert.rejects(db.query("select record_staff_file_access($1,$2,'download')",[project,sharedId]),/Staff authorization/);
 assert.equal((await db.query('select can_download_project_file($1) allowed',[`${project}/${privateId}`])).rows[0].allowed,false);assert.equal((await db.query('select can_download_project_file($1) allowed',[`${project}/${sharedId}`])).rows[0].allowed,true);
 await actor(other);assert.equal((await db.query('select * from staff_file_directory')).rows.length,0);assert.equal((await db.query('select can_download_project_file($1) allowed',[`${project}/${sharedId}`])).rows[0].allowed,false);
 await db.exec('reset role');await db.query('update inquiry_staff set active=false where user_id=$1',[staff]);await actor(staff);assert.equal((await db.query('select * from staff_file_directory')).rows.length,0);await assert.rejects(db.query("select record_staff_file_access($1,$2,'download')",[project,privateId]),/Staff authorization/);
 await db.exec('set role anon');await assert.rejects(db.query('select * from staff_file_directory'),/permission denied/);await db.exec('reset role');assert.equal((await db.query("select public from storage.buckets where id='bivi-project-files'")).rows[0].public,false);
 }finally{await db.close();}
});
