import fs from 'node:fs';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
const module={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(new URL('../../lib/tasks/links.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module,module.exports);const {taskHref,taskDomId,taskToday}=module.exports;
test('Task links preserve source section, exact IDs, and safe anchors',()=>{for(const task of ['task-1','unicode é / task?&%'])for(const section of ['plan','lifecycle']){const href=taskHref('project-id',task,section);const url=new URL(href,'https://staff.bivi.pro');assert.equal(url.searchParams.get('task'),task);assert.equal(url.searchParams.get('tab'),section);assert.equal(decodeURIComponent(url.hash.slice(1)),taskDomId(task,section));}});
test('Due-date filters use the chosen calendar day across midnight and daylight saving',()=>{const now=new Date('2026-10-15T01:00:00Z');assert.equal(taskToday('America/Chicago',now).today,'2026-10-14');assert.equal(taskToday('UTC',now).today,'2026-10-15');assert.equal(taskToday('invalid timezone',now).timezone,'America/Chicago');assert.equal(taskToday('America/Chicago',new Date('2026-11-01T07:30:00Z')).today,'2026-11-01');});
