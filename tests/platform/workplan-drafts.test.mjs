import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const module = { exports: {} };
const source = fs.readFileSync(new URL('../../lib/projects/workplan-draft-schema.ts', import.meta.url), 'utf8');
new Function('module', 'exports', 'require', ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText)(module, module.exports, require);
const { saveWorkplanDraftSchema } = module.exports;

const example = {
  baseRevision: 3,
  body: {
    title: '', owner: '', notes: '', milestones: [],
    tasks: [{ id: 'one', title: '', owner: '', notes: '', dueOn: null, status: 'todo', milestoneId: null }],
  },
};

test('Draft accepts temporarily blank editor fields, but does not change the published project validator', () => {
  assert.equal(saveWorkplanDraftSchema.safeParse(example).success, true);
  assert.equal(saveWorkplanDraftSchema.safeParse({ ...example, baseRevision: 0 }).success, false);
  assert.equal(saveWorkplanDraftSchema.safeParse({ ...example, body: { ...example.body, title: 'x'.repeat(201) } }).success, false);
  assert.equal(saveWorkplanDraftSchema.safeParse({ ...example, body: { ...example.body, tasks: [{ ...example.body.tasks[0], status: 'admin' }] } }).success, false);
});

test('Draft migration declares per-staff row-level security with no broad grants', () => {
  const sql = fs.readFileSync(new URL('../../supabase/migrations/202610160031_project_workplan_drafts.sql', import.meta.url), 'utf8');
  assert.match(sql, /enable row level security/);
  assert.match(sql, /staff_id = \(select auth\.uid\(\)\)/);
  assert.match(sql, /is_inquiry_staff\(\)/);
  assert.match(sql, /primary key \(request_id, staff_id\)/);
});
