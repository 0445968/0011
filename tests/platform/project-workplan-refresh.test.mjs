import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const require=createRequire(import.meta.url);
const copy=value=>JSON.parse(JSON.stringify(value));
const baseline={title:'Project',owner:'',notes:'',milestones:[{id:'m',title:'Milestone',status:'planned',dueOn:null}],tasks:[{id:'t',title:'Task',status:'todo',dueOn:null,milestoneId:'m',owner:'',notes:''}]};

// Exercise asynchronous draft loads and revision changes with stable hook state.
// Timers are held so a newer in-memory edit can be tested before autosave fires.
function editor(initial=baseline,storedDraft=null){
  const slots=[];let cursor=0,changed=false,pendingEffects=[],value,timer=0;
  const state={body:copy(initial),savedBody:copy(initial),revision:1,initialRevision:1};
  const server={body:copy(initial),revision:1,draft:storedDraft};
  const equal=(a,b)=>a&&b&&a.length===b.length&&a.every((item,index)=>Object.is(item,b[index]));
  const react={
    useState(init){const index=cursor++;if(!slots[index])slots[index]={value:typeof init==='function'?init():init};const slot=slots[index];return [slot.value,next=>{const result=typeof next==='function'?next(slot.value):next;if(!Object.is(result,slot.value)){slot.value=result;changed=true;}}];},
    useRef(init){const index=cursor++;return slots[index]??(slots[index]={current:init});},
    useCallback(fn,deps){const index=cursor++;if(!slots[index]||!equal(slots[index].deps,deps))slots[index]={fn,deps};return slots[index].fn;},
    useEffect(fn,deps){const index=cursor++;if(!slots[index]||!equal(slots[index].deps,deps)){const previous=slots[index];slots[index]={deps};pendingEffects.push(()=>{previous?.cleanup?.();slots[index].cleanup=fn();});}},
  };
  const setters=Object.fromEntries(['body','savedBody','revision'].map(key=>[`set${key[0].toUpperCase()+key.slice(1)}`,next=>{state[key]=typeof next==='function'?next(state[key]):next;changed=true;}]));
  const cache=new Map();
  function load(file){
    if(cache.has(file))return cache.get(file);
    const exports={};cache.set(file,exports);
    const source=readFileSync(new URL(`../../${file}`,import.meta.url),'utf8');
    const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
    const resolve=name=>name==='react'?react:name.startsWith('@/')?load(`${name.slice(2)}.ts`):name.startsWith('.')?load(`${path.posix.normalize(path.posix.join(path.posix.dirname(file),name))}.ts`):require(name);
    vm.runInNewContext(compiled,{exports,module:{exports},require:resolve,console,AbortSignal,window:{setTimeout:()=>++timer,clearTimeout:()=>{}},fetch:async(url,options)=>{
      assert.ok(!options?.method||options.method==='GET','loading a revision must not publish or delete drafts');
      return {ok:true,json:async()=>url.endsWith('/draft')?{generation:3,draft:copy(server.draft)}:{body:copy(server.body),revision:server.revision}};
    }});
    return exports;
  }
  const {useProjectWorkDraft}=load('components/admin/projects/useProjectWorkDraft.ts');
  function render(){cursor=0;changed=false;pendingEffects=[];value=useProjectWorkDraft({id:'project',...state,enabled:true,busy:false,...setters});pendingEffects.forEach(effect=>effect());}
  async function flush(){for(let step=0;step<20;step++){await new Promise(resolve=>setImmediate(resolve));if(!changed)return;render();}throw new Error('Hook did not settle');}
  render();
  return {state,server,flush,render,get current(){return value;}};
}

test('a revision refresh merges the newest in-memory edit instead of restoring an older autosave',async()=>{
  const work=editor();await work.flush();
  work.state.body=copy(baseline);work.state.body.tasks[0].title='Newest local title';work.render();
  const older=copy(baseline);older.tasks[0].title='Older autosave';
  work.server.draft={body:older,baseBody:copy(baseline),baseRevision:1,updatedAt:'2026-10-21T12:00:00Z'};
  work.server.body.tasks[0].dueOn='2026-10-30';work.server.revision=2;work.state.initialRevision=2;
  work.render();await work.flush();
  assert.equal(work.state.body.tasks[0].title,'Newest local title');
  assert.equal(work.state.body.tasks[0].dueOn,'2026-10-30');
  assert.equal(work.state.revision,2);assert.equal(work.current.conflict,false);
});

test('same-field revision conflicts remain recoverable and require an explicit choice',async()=>{
  const work=editor();await work.flush();
  work.state.body=copy(baseline);work.state.body.tasks[0].title='My title';work.render();
  work.server.body.tasks[0].title='Other staff title';work.server.revision=2;work.state.initialRevision=2;
  work.render();await work.flush();
  assert.equal(work.current.conflict,true);assert.equal(work.current.rebase.conflicts.length,1);
  assert.equal(work.current.recoverable.body.tasks[0].title,'My title');
  work.current.chooseConflict(work.current.rebase.conflicts[0].path,'draft');await work.flush();
  assert.equal(work.state.body.tasks[0].title,'My title');assert.equal(work.current.conflict,false);
});

test('clean server updates refresh the editor and stored drafts still require restoration',async()=>{
  const draft=copy(baseline);draft.tasks[0].notes='Recover this note';
  const work=editor(baseline,{body:draft,baseBody:copy(baseline),baseRevision:1,updatedAt:'2026-10-21T12:00:00Z'});await work.flush();
  assert.equal(work.state.body.tasks[0].notes,'');assert.equal(work.current.recoverable.body.tasks[0].notes,'Recover this note');
  assert.equal(work.current.restore(),true);await work.flush();assert.equal(work.state.body.tasks[0].notes,'Recover this note');
  const clean=editor();await clean.flush();clean.server.body.tasks[0].status='done';clean.server.revision=2;clean.state.initialRevision=2;clean.render();await clean.flush();
  assert.equal(clean.state.body.tasks[0].status,'done');assert.equal(clean.state.revision,2);assert.equal(clean.current.dirty,false);
});
