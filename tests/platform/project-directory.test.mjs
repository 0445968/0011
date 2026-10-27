import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
function load(path, imports = {}) {
  const module = {exports:{}};
  const source = fs.readFileSync(new URL(path, import.meta.url), 'utf8');
  new Function('module','exports','require',ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(module,module.exports,name => name in imports ? imports[name] : name.startsWith('.')?loadProjectTs(new URL(`${name}.ts`,new URL(path,import.meta.url))):require(name));
  return module.exports;
}
import {loadProjectTs} from './load-project-ts.mjs';
const lifecycle = load('../../lib/projects/lifecycle-schema.ts');
const { directoryProgress } = load('../../lib/projects/directory-progress.ts', {'./lifecycle-schema': lifecycle,'./metrics':loadProjectTs('lib/projects/metrics.ts')});
const { validDirectoryMode } = load('../../lib/projects/directory-types.ts');
const body = tasks => ({title:'Test',owner:'',notes:'',milestones:[],tasks});
const task = (id,status) => ({id,status,title:id,owner:'',notes:'',milestoneId:null,dueOn:null});

test('No tasks means unknown progress; stale controls do not complete phases', () => {
  const result = directoryProgress(body([]), [{taskId:'deleted',phase:'discovery'}]);
  assert.equal(result.percent,null);
  assert.ok(result.phases.every(phase => phase.state === 'unknown'));
});
test('Mixed and blocked work supports simultaneous active phases without advancing others', () => {
  const result = directoryProgress(body([task('a','done'),task('b','todo'),task('c','blocked'),task('unmapped','doing')]),[
    {taskId:'a',phase:'discovery'}, {taskId:'b',phase:'discovery'}, {taskId:'c',phase:'production'},
  ]);
  assert.equal(result.percent,25);
  assert.deepEqual(result.activePhases.map(phase => phase.phase),['discovery','production']);
  assert.equal(result.phases.find(phase => phase.phase === 'production').blocked,1);
  assert.equal(result.phases.find(phase => phase.phase === 'direction').state,'unknown');
  assert.equal(result.unassigned,1);
});
test('Completed task group does not imply the next phase started and does not mutate source records', () => {
  const source = body([task('a','done'),task('b','todo')]);
  const before = structuredClone(source);
  const result = directoryProgress(source,[{taskId:'a',phase:'discovery'},{taskId:'b',phase:'direction'}]);
  assert.equal(result.phases.find(phase => phase.phase === 'discovery').state,'completed');
  assert.equal(result.phases.find(phase => phase.phase === 'direction').state,'not_started');
  assert.deepEqual(result.activePhases,[]);
  assert.deepEqual(source,before);
  assert.equal(validDirectoryMode('cards'),'cards');
  assert.equal(validDirectoryMode('grouped'),'grouped');
  assert.equal(validDirectoryMode('untrusted'),'table');
});
const { getProjectDirectoryContext } = load('../../lib/projects/directory-context.ts', {'server-only':{},'./lifecycle-schema':lifecycle});
test('Directory enrichment respects page IDs, paginates task controls, and uses company identity', async () => {
  const id='00000000-0000-4000-8000-000000000001', company='00000000-0000-4000-8000-000000000002';
  const rows = Array.from({length:1100},(_,i)=>({request_id:id,task_id:`t${i}`,phase:'discovery'}));
  const calls=[];
  const client={from(table){const call={table};calls.push(call);const query={
    select(){return query;},in(column,ids){call.ids=ids;return query;},order(){return query;},range(start,end){call.range=[start,end];return query;},
    then(resolve,reject){let data=table==='inquiry_projects'?[{request_id:id,company_id:company,body:body([task('t0','todo')])}]:table==='project_lifecycle'?[{request_id:id,phase:'discovery'}]:table==='company_directory'?[{id:company,name:'Acme',logo_path:null}]:table==='project_milestone_phases'?[]:rows.slice(call.range[0],call.range[1]+1);return Promise.resolve({data,error:null}).then(resolve,reject);}
  };return query;}};
  const result=await getProjectDirectoryContext(client,[id]);
  assert.equal(result[id].company.name,'Acme');
  assert.equal(result[id].selectedPhase,'discovery');
  assert.equal(result[id].taskPhases.length,1100);
  assert.deepEqual(calls.filter(call=>call.table==='project_task_controls').map(call=>call.range),[[0,499],[500,999],[1000,1499]]);
  assert.ok(calls.filter(call=>call.table!=='company_directory').every(call=>call.ids.length===1&&call.ids[0]===id));
  assert.deepEqual(await getProjectDirectoryContext({from(){throw new Error('unexpected query');}},[]),{});
});
test('Failed enrichment surfaces an error instead of invented empty evidence', async () => {
  const client={from(){return {select(){return {in(){return Promise.resolve({data:null,error:{message:'denied'}});}};}};}};
  await assert.rejects(getProjectDirectoryContext(client,['id']),/could not load/);
});
