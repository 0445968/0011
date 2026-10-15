import fs from 'node:fs';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
function load(path,imports={}){const module={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module,module.exports,name=>name in imports?imports[name]:require(name));return module.exports;}
const links=load('../../lib/files/directory-links.ts');
const schema=load('../../lib/files/schema.ts');
test('File preview allowlist and UTC upload filters reject active formats and retain inclusive date bounds',()=>{
 assert.equal(links.previewKind('image/png',100),'image');assert.equal(links.previewKind('text/plain',262144),'text');assert.equal(links.previewKind('text/plain',262145),null);
 for(const mime of ['text/html','image/svg+xml','application/pdf','application/zip'])assert.equal(links.previewKind(mime,100),null);
 const range=links.filesDateRange('2026-11-01','2026-11-01');assert.equal(range.from,'2026-11-01T00:00:00Z');assert.equal(range.before,'2026-11-02T00:00:00.000Z');
 assert.ok(links.filesDateRange('2026-02-30',undefined).warning);assert.ok(links.filesDateRange('2026-10-31','2026-10-01').warning);
});
test('Preview/download authorization binds source IDs, requires ready files, retains client behavior, and withholds URLs if auditing fails',async()=>{
 const project='00000000-0000-4000-8000-000000000001',file='00000000-0000-4000-8000-000000000002';
 let sameOrigin=true,allowed=true,ready=true,mime='image/png',auditError=false,storageError=false;const signed=[],audit=[],filters=[];
 const client={from:()=>{const query={select:()=>query,eq:(key,value)=>{filters.push([key,value]);return query;},maybeSingle:async()=>({data:{state:ready?'ready':'withdrawn',object_path:`${project}/${file}`,filename:'Asset.png',mime_type:mime,size_bytes:100},error:null})};return query;},storage:{from:bucket=>({createSignedUrl:async(path,seconds,options)=>{signed.push({bucket,path,seconds,options});return {data:{signedUrl:'https://storage.example.test/signed'},error:storageError?{}:null};}})},rpc:async(name,args)=>{audit.push({name,args});return{error:auditError?{code:'22023'}:null};}};
 const http=load('../../lib/files/http.ts',{'server-only':{},'./directory-links':links,'./schema':schema,'@/lib/admin/auth':{getStaffAccess:async()=>allowed?{allowed:true,client}:{allowed:false,status:403}},'@/lib/portal/auth':{getClientAccess:async()=>({allowed:true,client})},'@/lib/admin/http':{adminReply:(body,status=200)=>({body,status}),isSameOrigin:()=>sameOrigin,readAdminJson:()=>({})}});
 assert.equal((await http.filePreview({},project,file)).status,200);assert.deepEqual(filters.slice(0,2),[['request_id',project],['id',file]]);assert.equal(signed[0].seconds,60);assert.deepEqual(signed[0].options,{});assert.equal(audit[0].args.p_action,'preview');
 auditError=true;const failure=await http.filePreview({},project,file);assert.equal(failure.status,404);assert.equal(failure.body.url,undefined);auditError=false;
 ready=false;assert.equal((await http.filePreview({},project,file)).status,404);ready=true;
 mime='application/pdf';const count=signed.length;assert.equal((await http.filePreview({},project,file)).status,415);assert.equal(signed.length,count);
 assert.equal((await http.fileDownload({},project,file,true)).status,200);assert.deepEqual(signed.at(-1).options,{download:'Asset.png'});assert.equal(audit.at(-1).args.p_action,'download');
 const events=audit.length;assert.equal((await http.fileDownload({},project,file,false)).status,200);assert.equal(audit.length,events);
 storageError=true;assert.equal((await http.filePreview({},project,file)).status,415);mime='image/png';assert.equal((await http.filePreview({},project,file)).status,503);storageError=false;
 allowed=false;assert.equal((await http.filePreview({},project,file)).status,403);allowed=true;sameOrigin=false;assert.equal((await http.filePreview({},project,file)).status,403);
});
