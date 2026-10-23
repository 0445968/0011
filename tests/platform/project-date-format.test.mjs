import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProjectTs} from './load-project-ts.mjs';

const {formatSafeDateTime,safeTimeZone}=loadProjectTs('lib/date-format.ts');

test('safe date formatter formats valid timestamps with a valid timezone abbreviation',()=>{
  const expected=new Intl.DateTimeFormat('en-US',{
    year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',
    timeZone:'America/Los_Angeles',timeZoneName:'short',
  }).format(new Date('2026-01-15T18:30:00.000Z'));
  assert.equal(formatSafeDateTime('2026-01-15T18:30:00.000Z','America/Los_Angeles'),expected);
  assert.match(expected,/PST/);
});

test('safe date formatter preserves explicit absent and invalid date labels',()=>{
  assert.equal(formatSafeDateTime(null,'UTC',{absent:'Not activated',invalid:'Activation date unavailable'}),'Not activated');
  assert.equal(formatSafeDateTime('not-a-date','UTC',{absent:'Not activated',invalid:'Activation date unavailable'}),'Activation date unavailable');
});

test('invalid timezones fall back to America/Chicago without throwing',()=>{
  assert.equal(safeTimeZone('Mars/Olympus_Mons'),'America/Chicago');
  const chicago=formatSafeDateTime('2026-01-15T18:30:00.000Z','America/Chicago');
  const invalidZone=formatSafeDateTime('2026-01-15T18:30:00.000Z','Mars/Olympus_Mons');
  assert.equal(invalidZone,chicago);
});
