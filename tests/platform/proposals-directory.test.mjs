import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const migrations=new URL('../../supabase/migrations/',import.meta.url);
test('Proposal directory preserves inquiry/version identity, latest selection, all statuses and staff isolation',async()=>{const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to authenticated;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id bigint generated always as identity,bucket_id text,name text,metadata jsonb,unique(bucket_id,name));alter table storage.objects enable row level security;grant usage on schema storage to authenticated,anon;grant select,insert,update,delete on storage.objects to authenticated,anon;grant usage on sequence storage.objects_id_seq to authenticated,anon;`);
 for(const file of fs.readdirSync(migrations).filter(name=>name.endsWith('.sql')).sort())await db.exec(fs.readFileSync(new URL(file,migrations),'utf8'));

 const staff=randomUUID(),other=randomUUID(),one=randomUUID(),two=randomUUID(),three=randomUUID();
 await db.query('insert into auth.users(id,email) values($1,$2),($3,$4)',[staff,'staff@example.com',other,'client@example.com']);await db.query('insert into inquiry_staff(user_id) values($1)',[staff]);
 for(const [id,name,email] of [[one,'Old Company','one@example.com'],[two,'Second Client','two@example.com'],[three,'Third Client','three@example.com']])await db.query('insert into project_inquiries(request_id,payload,payload_hash) values($1,$2,$3)',[id,{name,company:name,email},id.replaceAll('-','').repeat(2)]);
 const company=(await db.query("insert into client_organizations(name) values('Renamed Company') returning id,public_id")).rows[0];await db.query('insert into inquiry_client_organizations(request_id,organization_id) values($1,$2)',[one,company.id]);
 await db.query("insert into inquiry_proposals(request_id,version,status,body) values($1,1,'superseded',$2),($1,2,'issued',$3),($1,3,'draft',$4),($5,1,'accepted',$6),($7,1,'declined',$8)",[one,{title:'Historical scope'},{title:'Issued scope'},{title:'Current draft'},two,{title:'Accepted scope'},three,{title:'Declined scope'}]);
 await db.exec('set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[staff]);
 const all=(await db.query('select * from proposals_directory')).rows;assert.equal(all.length,5);assert.equal(all.filter(row=>row.is_latest).length,3);assert.equal(all.find(row=>row.request_id===one&&row.is_latest).version,3);assert.equal(all.find(row=>row.request_id===one).company_name,'Renamed Company');assert.equal(all.find(row=>row.request_id===one).company_public_id,company.public_id);
 assert.equal((await db.query("select * from proposals_directory where status='issued' and is_latest")).rows.length,0);assert.equal((await db.query("select * from proposals_directory where status='issued'")).rows.length,1);assert.deepEqual(new Set(all.map(row=>row.status)),new Set(['draft','issued','accepted','declined','superseded']));
 assert.equal(new Set(all.map(row=>row.request_id+':'+row.version)).size,5);assert.equal(all.find(row=>row.request_id===two).company_name,'Second Client');
 assert.equal((await db.query("select has_table_privilege(current_user,'proposals_directory','update') allowed")).rows[0].allowed,false);
 await assert.rejects(db.query("update proposals_directory set status='accepted' where request_id=$1",[one]),/permission denied|cannot update view/);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[other]);assert.equal((await db.query('select * from proposals_directory')).rows.length,0);
 await db.exec('set role anon');await assert.rejects(db.query('select * from proposals_directory'),/permission denied/);
 }finally{await db.close();}});
