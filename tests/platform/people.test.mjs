import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const directory=new URL('../../supabase/migrations/',import.meta.url);
test('People: automatic intake, random IDs, duplicate identity, client lifecycle, staff RLS and revisions',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to authenticated;`);
 for(const name of ['202610060001_project_inquiries.sql','202610060002_inquiry_staff_and_reviews.sql','202610060003_inquiry_proposals.sql'])await db.exec(fs.readFileSync(new URL(name,directory),'utf8'));
 const before=randomUUID();await db.query('insert into project_inquiries(request_id,payload,payload_hash) values($1,$2,$3)',[before,{name:'Existing person',email:'existing@example.com',company:'Existing company'},'a'.repeat(64)]);
 await db.exec(fs.readFileSync(new URL('202610140015_people.sql',directory),'utf8'));
 assert.equal((await db.query('select count(*)::int n from people_contacts')).rows[0].n,1);
 // Reseeding PostgreSQL random() forces a collision on the first candidate, testing retry.
 await db.exec('select setseed(0.31)');const first=(await db.query('select allocate_people_id() id')).rows[0].id;
 await db.exec('select setseed(0.31)');const second=(await db.query('select allocate_people_id() id')).rows[0].id;assert.notEqual(first,second);assert.ok(first>=1&&first<=999999999&&second>=1&&second<=999999999);
 await db.exec('set role service_role');const id=randomUUID();const payload={name:'Alice',email:'alice@example.com',company:'Bivi test'};
 assert.equal((await db.query('select submit_project_inquiry($1,$2,$3,$4) r',[id,payload,'b'.repeat(64),'c'.repeat(64)])).rows[0].r,'created');
 assert.equal((await db.query('select submit_project_inquiry($1,$2,$3,$4) r',[id,payload,'b'.repeat(64),'c'.repeat(64)])).rows[0].r,'duplicate');
 await db.query('select submit_project_inquiry($1,$2,$3,$4)',[randomUUID(),{...payload,email:' ALICE@EXAMPLE.COM ',name:'Untrusted changed name'},'d'.repeat(64),'e'.repeat(64)]);
 await db.exec('reset role');const alice=(await db.query("select * from people_contacts where email='alice@example.com'")).rows[0];assert.equal(alice.name,'Alice');assert.equal((await db.query('select count(*)::int n from people_inquiry_links where contact_id=$1',[alice.id])).rows[0].n,2);
 await db.query("insert into inquiry_proposals(request_id,version,status,body) values($1,1,'accepted','{}')",[id]);assert.deepEqual((await db.query('select labels from people_contacts where id=$1',[alice.id])).rows[0].labels,['client']);
 const staff=randomUUID(),outsider=randomUUID();await db.query('insert into auth.users values($1),($2)',[staff,outsider]);await db.query('insert into inquiry_staff(user_id) values($1)',[staff]);
 await db.exec('set role anon');await assert.rejects(db.query('select * from people_contacts'),/permission denied/);
 await db.exec('reset role;set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[outsider]);assert.equal((await db.query('select * from people_directory')).rows.length,0);await assert.rejects(db.query('select allocate_people_id()'),/permission denied/);
 const body={name:'Alice revised',email:alice.email,phone:'123',company_name:'Company',labels:['client','partner'],notes:'Internal'};
 await assert.rejects(db.query('select save_people_contact($1,$2,$3)',[alice.id,2,body]),/Staff authorization/);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[staff]);assert.equal((await db.query('select * from people_directory')).rows.length,2);
 await assert.rejects(db.query("update people_contacts set name='unauthorized direct edit'"),/permission denied/);
 assert.equal((await db.query('select save_people_contact($1,$2,$3) r',[alice.id,0,body])).rows[0].r.result,'conflict');
 assert.equal((await db.query('select save_people_contact($1,$2,$3) r',[alice.id,null,body])).rows[0].r.result,'conflict');
 assert.equal((await db.query('select save_people_contact($1,$2,$3) r',[alice.id,2,body])).rows[0].r.result,'saved');
 assert.equal((await db.query('select save_people_contact($1,$2,$3) r',[alice.id,2,body])).rows[0].r.result,'conflict');
 await db.query('select link_people_contact($1,$2)',[alice.id,before]);assert.equal((await db.query('select count(*)::int n from people_inquiry_links where contact_id=$1',[alice.id])).rows[0].n,3);
 await assert.rejects(db.query('select save_people_contact(null,0,$1)',[body]),/duplicate key/);
 await db.exec('reset role');await db.query('delete from people_inquiry_links where contact_id=$1',[alice.id]);await db.query('delete from people_contacts where id=$1',[alice.id]);assert.equal((await db.query('select count(*)::int n from people_id_ledger where id=$1',[alice.id])).rows[0].n,1);
 }finally{await db.close();}
});
