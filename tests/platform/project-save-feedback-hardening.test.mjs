import test from 'node:test';
import assert from 'node:assert/strict';
import { projectEditor, copy, plan, deferred } from './project-editor-harness.mjs';

test('work-plan save lifecycle reports saving and success without inventing newer edits', async () => {
  const gate = deferred();
  const work = projectEditor({ controls: { postGate: gate } });
  try {
    await work.flush();
    work.edit(body => { body.tasks[0].title = 'New task sequence'; });
    assert.equal(work.current.savePhase, 'idle');
    const pending = work.current.save();
    await work.flush();
    assert.equal(work.current.savePhase, 'saving');
    gate.resolve();
    assert.equal(await pending, true);
    await work.flush();
    assert.equal(work.current.savePhase, 'saved');
    assert.equal(work.current.dirty, false);
    assert.doesNotMatch(work.current.message, /Newer edits remain/);
  } finally { work.unmount(); }
});

test('rejected saves are visibly retryable, then acknowledged on the same editor', async () => {
  const work = projectEditor({ controls: { validation: true } });
  try {
    await work.flush();
    work.edit(body => { body.tasks[0].title = 'Needs review'; });
    assert.equal(await work.current.save(), false);
    await work.flush();
    assert.equal(work.current.savePhase, 'failed');
    assert.equal(work.current.dirty, true);
    assert.match(work.current.message, /Unfinished subtasks/);
    work.controls.validation = false;
    assert.equal(await work.current.save(), true);
    await work.flush();
    assert.equal(work.current.savePhase, 'saved');
    assert.equal(work.current.dirty, false);
    assert.equal(work.server.posts, 2);
  } finally { work.unmount(); }
});

test('uncertain saves do not issue duplicate writes and verification repairs the state', async () => {
  const work = projectEditor({ controls: { loseReply: true } });
  try {
    await work.flush();
    // The editor must load its initial saved baseline before simulating a
    // temporary read outage during save-result verification.
    work.controls.readFails = true;
    work.edit(body => { body.title = 'Ordering revision'; });
    assert.equal(await work.current.save(), false);
    await work.flush();
    assert.equal(work.current.savePhase, 'uncertain');
    assert.equal(work.current.saveOutcomeUnknown, true);
    assert.equal(await work.current.save(), false);
    assert.equal(work.server.posts, 1);
    work.controls.readFails = false;
    assert.equal(await work.current.checkUncertainSave(), true);
    await work.flush();
    assert.equal(work.current.savePhase, 'saved');
    assert.equal(work.current.saveOutcomeUnknown, false);
    assert.equal(work.current.dirty, false);
  } finally { work.unmount(); }
});

test('a concurrent post-submission edit stays pending rather than being labeled saved', async () => {
  const gate = deferred();
  const work = projectEditor({ controls: { postGate: gate } });
  try {
    await work.flush();
    work.edit(body => { body.tasks[0].title = 'Submitted order'; });
    const saving = work.current.save();
    await work.flush();
    work.edit(body => { body.tasks[0].notes = 'Later note'; });
    gate.resolve();
    assert.equal(await saving, false);
    await work.flush();
    assert.equal(work.current.savePhase, 'idle');
    assert.equal(work.current.dirty, true);
    assert.equal(work.current.body.tasks[0].notes, 'Later note');
    assert.equal(work.server.body.tasks[0].notes, '');
  } finally { work.unmount(); }
});
