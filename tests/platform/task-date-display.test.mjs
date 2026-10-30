import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProjectTs} from './load-project-ts.mjs';
const {taskColumnDateLabel}=loadProjectTs('lib/projects/task-date-display.ts');
test('task column dates put weekday first and use consistent date/time typography',()=>{
 assert.equal(taskColumnDateLabel('2026-11-09','23:00',{weekday:true}),'Mon, 09 Nov 2026 11:00 PM');
 assert.equal(taskColumnDateLabel('2026-11-09','00:05',{}),'09 Nov 2026 12:05 AM');
 assert.equal(taskColumnDateLabel('2026-11-09','23:00',{weekday:true,showTime:false}),'Mon, 09 Nov 2026');
 assert.equal(taskColumnDateLabel('2026-11-09','23:00',{weekday:true,showTimezone:true,timezone:'America/Chicago'}),'Mon, 09 Nov 2026 11:00 PM · America/Chicago');
 assert.equal(taskColumnDateLabel(null),'');
});
