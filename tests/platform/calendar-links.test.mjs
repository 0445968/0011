import fs from 'node:fs';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
function load(path,require=()=>{}){const module={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module,module.exports,require);return module.exports;}
const tasks=load('../../lib/tasks/links.ts');
const calendar=load('../../lib/calendar/links.ts',()=>tasks);
test('Calendar source links preserve arbitrary task/milestone IDs and exact focus anchors',()=>{
 for(const kind of ['task','milestone'])for(const id of ['launch','unicode é /?%&']){
  const url=new URL(calendar.calendarHref({event_type:kind,request_id:'project-id',source_id:id}),'https://staff.bivi.pro');
  assert.equal(url.pathname,'/projects/project-id');assert.equal(url.searchParams.get('tab'),'plan');assert.equal(url.searchParams.get(kind),id);
  assert.equal(decodeURIComponent(url.hash.slice(1)),kind==='task'?tasks.taskDomId(id):calendar.milestoneDomId(id));
 }
});
test('Calendar ranges handle leap years, invalid dates, date bounds and midnight without shifting saved due dates',()=>{
 const now=new Date('2026-11-01T01:00:00Z');
 assert.equal(calendar.calendarRange({},now).month,'2026-10');assert.equal(calendar.calendarRange({tz:'UTC'},now).month,'2026-11');
 assert.deepEqual([calendar.calendarRange({month:'2024-02'},now).from,calendar.calendarRange({month:'2024-02'},now).to],['2024-02-01','2024-02-29']);
 for(const p of [{from:'2026-02-30'},{from:'2026-10-30',to:'2026-10-01'},{from:'2020-01-01',to:'2026-01-01'}])assert.ok(calendar.calendarRange(p,now).warning);
 assert.equal(calendar.calendarDate('2024-02-29'),true);assert.equal(calendar.calendarDate('2026-02-29'),false);
 assert.equal(calendar.calendarMonth('2026-12',1),'2027-01');assert.equal(calendar.calendarMonth('2026-01',-1),'2025-12');
 assert.equal(calendar.calendarDateLabel('2026-11-01'),'Sunday, November 1, 2026');
});
