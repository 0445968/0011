import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
const require=createRequire(import.meta.url);
export const copy=value=>JSON.parse(JSON.stringify(value));
export const plan={title:'Project',owner:'',notes:'',milestones:[{id:'m',title:'Milestone',status:'planned',dueOn:null}],tasks:[{id:'t',title:'Task',status:'todo',dueOn:null,milestoneId:'m',owner:'',notes:''}]};
export function deferred(){let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};}

/** Stable React hook state with controlled transport; no DOM or source-string assertions. */
export function projectEditor(options={}){
 const slots=[],timers=new Map(),events=new EventTarget(),cache=new Map();let cursor=0,changed=false,effects=[],value,nextTimer=0,alive=true;
 const server={body:copy(plan),revision:1,generation:0,draft:null,posts:0,deletes:0,reads:0,...options.server};
 const controls={postGate:null,draftGate:null,deleteGate:null,validation:false,loseReply:false,readFails:false,refreshFails:false,...options.controls};
 const props={id:'project',userId:options.userId,record:{body:copy(plan),revision:1,state:'active'}};
 const router={refresh(){if(controls.refreshFails)throw new Error('Refresh failed');},replace(){}};
 const same=(a,b)=>a&&b&&a.length===b.length&&a.every((item,index)=>Object.is(item,b[index]));
 const react={
  useState(initial){const index=cursor++;if(!slots[index])slots[index]={value:typeof initial==='function'?initial():initial};const slot=slots[index];return [slot.value,next=>{if(!alive)return;const result=typeof next==='function'?next(slot.value):next;if(!Object.is(result,slot.value)){slot.value=result;changed=true;}}];},
  useRef(initial){const index=cursor++;return slots[index]??(slots[index]={current:initial});},
  useCallback(fn,deps){const index=cursor++;if(!slots[index]||!same(slots[index].deps,deps))slots[index]={fn,deps};return slots[index].fn;},
  useEffect(fn,deps){const index=cursor++;if(!slots[index]||!same(slots[index].deps,deps)){const old=slots[index];slots[index]={deps};effects.push(()=>{old?.cleanup?.();slots[index].cleanup=fn();});}},
 };
 const reply=(json,status=200)=>({ok:status>=200&&status<300,status,json:async()=>copy(json)});
 async function fetch(url,options={}){
  const command=options.body?JSON.parse(options.body):null;
  if(url.endsWith('/draft')){
   if(options.method==='POST'){
    if(controls.draftGate)await controls.draftGate.promise;
    if(command.expectedGeneration!==server.generation)return reply({error:'Draft generation changed'},409);
    server.draft={body:command.body,baseBody:command.baseBody,baseRevision:command.baseRevision,updatedAt:'2026-10-22T12:00:00Z'};
    return reply({generation:++server.generation,savedAt:server.draft.updatedAt,conflict:server.revision!==command.baseRevision});
   }
   if(options.method==='DELETE'){
    if(controls.deleteGate)await controls.deleteGate.promise;
    if(command.generation!==server.generation)return reply({error:'Draft changed in another session'},409);
    server.deletes++;server.draft=null;
    return reply({generation:++server.generation,body:server.body,revision:server.revision});
   }
   return reply({draft:server.draft,generation:server.generation});
  }
  if(options.method==='POST'){
   server.posts++;if(controls.postGate)await controls.postGate.promise;
   if(command.expectedRevision!==server.revision)return reply({code:'revision_conflict',error:'Changed elsewhere'},409);
   if(controls.validation)return reply({code:'task_subtasks_incomplete',error:'Unfinished subtasks',blockers:[]},422);
   server.body=copy(command.body);server.revision++;
   if(controls.loseReply)throw new TypeError('Lost response');
   return reply({saved:true,body:server.body,revision:server.revision});
  }
  server.reads++;if(controls.readFails)throw new TypeError('Read unavailable');
  return reply({body:server.body,revision:server.revision});
 }
 const storage=options.storage??new Map();
 const localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
 const fakeWindow={localStorage,addEventListener:(...args)=>events.addEventListener(...args),removeEventListener:(...args)=>events.removeEventListener(...args),dispatchEvent:event=>events.dispatchEvent(event),setTimeout:fn=>{timers.set(++nextTimer,fn);return nextTimer;},clearTimeout:id=>timers.delete(id)};
 function load(file){
  if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);
  const source=readFileSync(new URL(`../../${file}`,import.meta.url),'utf8');
  const resolve=name=>name==='react'?react:name==='next/navigation'?{useRouter:()=>router}:name.startsWith('@/')?load(`${name.slice(2)}.ts`):name.startsWith('.')?load(`${path.posix.normalize(path.posix.join(path.posix.dirname(file),name))}.ts`):require(name);
  vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,module:{exports},require:resolve,fetch,window:fakeWindow,CustomEvent,Event,AbortSignal,console});return exports;
 }
 const {useProjectEditingController}=load('components/admin/projects/useProjectEditingController.ts');
 function render(){cursor=0;changed=false;effects=[];value=useProjectEditingController(props.id,props.record,false,props.userId);effects.forEach(effect=>effect());}
 async function flush(){for(let step=0;step<40;step++){await new Promise(done=>setImmediate(done));if(!changed)return;render();}throw new Error('Editor did not settle');}
 render();
 return {server,controls,props,storage,flush,render,get current(){return value;},edit(fn){value.setBody(body=>{const next=copy(body);fn(next);return next;});render();},fireTimers(){const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn());},renew(){fakeWindow.dispatchEvent(new Event('bivi:staff-session-renewed'));},notify(){fakeWindow.dispatchEvent(new CustomEvent('bivi:project-mutation',{detail:{projectId:props.id}}));},unmount(){for(const slot of slots)slot?.cleanup?.();alive=false;}};
}
