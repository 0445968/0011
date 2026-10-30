import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {projectEditor} from './project-editor-harness.mjs';
import {loadProjectTs} from './load-project-ts.mjs';
const helper=loadProjectTs('lib/admin/staff-session.ts');
const {sessionSecondsLeft,countdownLabel,SESSION_WARNING_MS}=loadProjectTs('lib/admin/session-countdown.ts');
const {writeUnsavedTab,readUnsavedTabs}=loadProjectTs('lib/admin/workspace/unsaved-tabs.ts');
const user='00000000-0000-0000-0000-000000000001';
const token=exp=>'header.'+Buffer.from(JSON.stringify({exp})).toString('base64url')+'.signature';
function route(){
 const jar=new Map(),writes=[],calls=[];
 const control={origin:true,allowed:true,status:403,refreshError:null,refreshThrow:false,userId:user};
 const session={access_token:token(Math.floor(Date.now()/1000)+3600),refresh_token:'test-refresh-rotated',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600};
 const auth={signInWithPassword:async input=>{calls.push(['login',input]);return {data:{session},error:null};},refreshSession:async input=>{calls.push(['refresh',input]);if(control.refreshThrow)throw Error('Offline');return {data:{session:control.refreshError?null:session},error:control.refreshError};}};
 const mocks={
  'next/headers':{cookies:()=>({get:key=>jar.has(key)?{value:jar.get(key)}:undefined})},
  '@/lib/admin/staff-session':helper,
  '@/lib/admin/auth':{STAFF_COOKIE:'bivi_staff_access',staffAuthConfigured:()=>true,createStaffClient:()=>({auth}),authorizeStaff:async value=>!value?{allowed:false,status:401}:control.allowed?{allowed:true,user:{id:control.userId}}:{allowed:false,status:control.status}},
  '@/lib/admin/http':{isSameOrigin:()=>control.origin,readAdminJson:request=>request.json(),adminReply:(body,status=200)=>({body,status,cookies:{set:(name,value,options)=>{writes.push({name,value,options});jar.set(name,value);}}})},
 };
 const exports={};const source=ts.transpileModule(readFileSync(new URL('../../app/api/admin/session/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const require=name=>{if(name==='zod')return zod;if(name in mocks)return mocks[name];throw Error(name);};
 new Function('exports','require','fetch',source)(exports,require,async()=>({ok:true}));
 return {api:exports,jar,writes,calls,control,session};
}
import * as zod from 'zod';
const request=body=>({json:async()=>body});
test('session expiry countdown uses verified server timestamps and never shows negative time',()=>{
 assert.equal(helper.staffAuthFailureStatus({status:429}),503);assert.equal(helper.staffAuthFailureStatus({status:0}),503);assert.equal(helper.staffAuthFailureStatus({status:401}),401);
 assert.equal(helper.staffTokenExpiry(token(100)),100000);assert.equal(helper.staffTokenExpiry('bad'),null);
 assert.equal(helper.sessionCookieValues({expires_in:7200},1000).maxAge,3600);
 assert.equal(sessionSecondsLeft(310000,10000)*1000,SESSION_WARNING_MS);assert.equal(sessionSecondsLeft(100,500),0);assert.equal(countdownLabel(65),'1:05');
});
test('login sets HTTP-only refresh and expiry cookies without returning credentials',async()=>{
 const r=route();const result=await r.api.POST(request({email:'staff@example.com',password:'example-only'}));assert.equal(result.status,200);
 assert.equal(result.body.userId,user);assert.equal('access_token' in result.body,false);assert.equal('refresh_token' in result.body,false);
 assert.ok(r.writes.find(c=>c.name===helper.STAFF_REFRESH_COOKIE&&c.options.httpOnly&&c.options.sameSite==='lax'));
 assert.equal(r.calls[0][1].expectedUserId,undefined);
});
test('renewal rotates cookies, checks staff membership/account, and rejects cross-origin or legacy sessions safely',async()=>{
 const r=route();r.jar.set(helper.STAFF_REFRESH_COOKIE,'test-refresh');let result=await r.api.PUT(request({expectedUserId:user}));assert.equal(result.status,200);assert.ok(r.writes.find(c=>c.name==='bivi_staff_access'));
 const noCookie=route();assert.equal((await noCookie.api.PUT(request({expectedUserId:user}))).body.reauthenticate,true);assert.equal(noCookie.writes.length,0);
 const blocked=route();blocked.control.origin=false;assert.equal((await blocked.api.PUT(request({expectedUserId:user}))).status,403);assert.equal(blocked.calls.length,0);
 const wrong=route();wrong.jar.set(helper.STAFF_REFRESH_COOKIE,'test-refresh');wrong.control.userId='00000000-0000-0000-0000-000000000002';assert.equal((await wrong.api.PUT(request({expectedUserId:user}))).status,409);assert.equal(wrong.writes.length,0);
 const revoked=route();revoked.jar.set(helper.STAFF_REFRESH_COOKIE,'test-refresh');revoked.control.allowed=false;assert.equal((await revoked.api.PUT(request({expectedUserId:user}))).status,403);assert.equal(revoked.writes.length,0);
});
test('temporary renewal errors keep editors/session retryable; status and logout respect expiry',async()=>{
 const r=route();r.jar.set(helper.STAFF_REFRESH_COOKIE,'test-refresh');r.control.refreshThrow=true;assert.equal((await r.api.PUT(request({expectedUserId:user}))).status,503);assert.equal(r.writes.length,0);
 r.control.refreshThrow=false;r.jar.set('bivi_staff_access',r.session.access_token);r.jar.set(helper.STAFF_EXPIRY_COOKIE,String(Date.now()+120000));const status=await r.api.GET();assert.equal(status.status,200);assert.ok(status.body.expiresAt<Date.now()+121000);assert.equal(status.body.canRenew,true);
 r.jar.delete('bivi_staff_access');assert.equal((await r.api.GET()).status,401);assert.equal((await r.api.DELETE(request({}))).status,200);assert.equal(r.writes.filter(c=>c.options.maxAge===0).length,3);assert.ok(r.calls.some(call=>call[0]==='refresh'));
});
test('unsaved tab metadata includes inactive drafts, groups records and isolates staff accounts',()=>{
 const data=new Map();const storage={get length(){return data.size;},key:i=>[...data.keys()][i],getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 writeUnsavedTab(storage,'a','/projects/00000000-0000-0000-0000-000000000010?tab=plan','Work plan',true,true,1000);
 writeUnsavedTab(storage,'a','/people/1','Contact',true,false,1000);
 assert.equal(readUnsavedTabs(storage,'a',1000).length,2);assert.equal(readUnsavedTabs(storage,'b',1000).length,0);
 assert.equal(readUnsavedTabs(storage,'a',100000).length,1,'stale live editor metadata expires while saved draft status remains');
 writeUnsavedTab(storage,'a','/projects/00000000-0000-0000-0000-000000000010?tab=plan','Work plan',false,true);assert.equal(readUnsavedTabs(storage,'a',100000).length,0);
});

test('network errors do not force reauthentication and renewed sessions retry pending drafts',async()=>{
 const r=route();r.jar.set(helper.STAFF_REFRESH_COOKIE,'test-refresh');r.control.refreshError={status:0,name:'AuthRetryableFetchError'};
 const response=await r.api.PUT(request({expectedUserId:user}));assert.equal(response.status,503);assert.equal(response.body.reauthenticate,false);
 const work=projectEditor({userId:user});await work.flush();work.edit(body=>body.tasks[0].notes='Retry after session renewal');await work.flush();assert.equal(work.server.draft,null);work.renew();await work.flush();assert.equal(work.server.draft.body.tasks[0].notes,'Retry after session renewal');assert.equal(work.server.posts,0);work.unmount();
});
