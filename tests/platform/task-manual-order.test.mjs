import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// Exercise the actual TypeScript helper without introducing a runtime TS loader.
const source = fs.readFileSync(new URL('../../lib/projects/task-manual-order.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const module = { exports: {} };
new Function('module', 'exports', compiled)(module, module.exports);
const { reorderProjectTasks } = module.exports;

function example() {
  const task = (id, milestoneId, status='todo') => ({
    id, milestoneId, title: id, owner: 'Bivi', notes: '', status, dueOn: null,
  });
  return {
    title: 'Project', owner: 'Bivi', notes: '',
    milestones: [
      {id: 'm1', title: 'Discovery', status: 'in_progress', dueOn: null},
      {id: 'm2', title: 'Design', status: 'planned', dueOn: null},
    ],
    tasks: [task('a','m1'),task('b','m1'),task('c','m2'),task('d',null)],
  };
}
const ids = body => body.tasks.map(task=>task.id);

test('reorders tasks within a milestone without changing any task data', () => {
  const before = example();
  const result = reorderProjectTasks(before, 'b', 'm1', 'a', 'before');
  assert.deepEqual(ids(result), ['b','a','c','d']);
  assert.deepEqual(result.tasks.find(t=>t.id==='a'),before.tasks.find(t=>t.id==='a'));
  assert.deepEqual(before.tasks.map(t=>t.id),['a','b','c','d']);
});

test('moves a task between milestone columns and preserves all task IDs', () => {
  const body = example();
  const result = reorderProjectTasks(body, 'b', 'm2', 'c', 'after');
  assert.deepEqual(ids(result), ['a','c','b','d']);
  assert.equal(result.tasks.find(t=>t.id==='b').milestoneId, 'm2');
  assert.deepEqual(new Set(ids(result)), new Set(ids(body)));
  assert.equal(result.tasks.find(t=>t.id==='b').owner,'Bivi');
});

test('can drop into an empty milestone and move into the unassigned column', () => {
  const body = example();
  const first = reorderProjectTasks(body, 'c', 'm1', null, 'end');
  assert.deepEqual(ids(first), ['a','b','c','d']);
  assert.equal(first.tasks.find(t=>t.id==='c').milestoneId,'m1');
  const next = reorderProjectTasks(first, 'a', 'm2', null, 'end');
  assert.deepEqual(ids(next), ['b','c','a','d']);
  const unassigned = reorderProjectTasks(next, 'a', null, 'd', 'before');
  assert.deepEqual(ids(unassigned), ['b','c','a','d']);
  assert.equal(unassigned.tasks.find(t=>t.id==='a').milestoneId,null);
});

test('normalizes interleaved tasks into milestone completion order on first drag', () => {
  const body = example();
  body.tasks = [body.tasks[2], body.tasks[0], body.tasks[3], body.tasks[1]];
  const result = reorderProjectTasks(body, 'b', 'm1', 'a', 'before');
  assert.deepEqual(ids(result),['b','a','c','d']);
});

test('rejects unknown tasks, invalid destinations and malformed hover targets', () => {
  const body = example();
  assert.strictEqual(reorderProjectTasks(body,'missing','m1',null),body);
  assert.strictEqual(reorderProjectTasks(body,'a','invalid',null),body);
  assert.strictEqual(reorderProjectTasks(body,'a','m2','b','before'),body);
  assert.strictEqual(reorderProjectTasks(body,'a','m1','a','before'),body);
});

test('blocks edits involving completed milestones and returns original on no-op', () => {
  const body = example();
  body.milestones[1].status = 'done';
  assert.strictEqual(reorderProjectTasks(body,'c','m1',null),body);
  assert.strictEqual(reorderProjectTasks(body,'a','m2',null),body);
  assert.strictEqual(reorderProjectTasks(body,'b','m1',null,'end'),body);
});
