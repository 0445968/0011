import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadProjectTs} from './load-project-ts.mjs';

const read=path=>readFileSync(new URL(`../../${path}`,import.meta.url),'utf8');

test('single task inspector uses shared controls, productivity, hierarchy, and completion override',()=>{
 const board=read('components/admin/projects/ProjectMilestoneBoardV2.tsx');
 assert.match(board,/const editorTaskContent=\(task:Task\)=>/);
 assert.match(board,/return task\?editorTaskContent\(task\):null/);
 assert.doesNotMatch(board,/<details key=\{task\.id\}/);
 assert.equal((board.match(/<TaskDraftControlSettings/g)||[]).length,1);
 assert.match(board,/<TaskDraftControlSettings[\s\S]*onChange=\{control=>draftSettings\(task,\{control\}\)\}/);
 assert.match(board,/<TaskProductivity[\s\S]*taskId=\{task\.id\}/);
 assert.match(board,/Subtasks \(\{hierarchy\.data\?children\.length/);
 assert.match(board,/Override and change status/);
 assert.match(board,/Remove task/);
 assert.doesNotMatch(board,/<h3 className="text-sm font-semibold">Task details<\/h3>/);
});

test('Phases keeps phase controls and sends task work back to the canonical Tasks section',()=>{
 const phases=read('components/admin/projects/ProjectPhasesPage.tsx');
 const lifecycle=read('components/admin/ProjectLifecycleControls.tsx');
 assert.match(phases,/Open Tasks/);
 assert.match(phases,/<ProjectLifecycleMilestones/);
 assert.match(phases,/showTaskManagement=\{false\}/);
 assert.match(lifecycle,/taskOnlyTaskId\?/);
 assert.match(lifecycle,/showTaskManagement && events\.length/);
});

test('Open task preserves the current view except when revealing a deep-linked task',()=>{
 const board=read('components/admin/projects/ProjectMilestoneBoardV2.tsx');
 const page=read('app/admin/(workspace)/projects/[id]/page.tsx');
 assert.match(board,/function openTask\(taskId:string, reveal=false\)/);
 assert.match(board,/if\(reveal\)\{(?:setArchivedView\([^;]+\);)?setFilters\(\{\.\.\.emptyWorkplanFilters\}\);setTagFilter\(''\);setView\('overview'\);setGrouping\('none'\);\}/);
 assert.match(board,/if\(focusTaskId\)openTask\(focusTaskId,true\)/);
 assert.match(board,/taskDomId\(selectedTaskId\)/);
 assert.match(board,/focusTaskId/);
 assert.match(page,/legacyTaskRoute[\s\S]*\? 'plan'/);
 assert.match(page,/This task is no longer in the project/);
});

test('Overview and milestone previews link to canonical task editing rather than retaining editors',()=>{
 const overview=read('components/admin/projects/ProjectOverview.tsx');
 const milestones=read('components/admin/projects/ProjectMilestonePreviews.tsx');
 const phases=read('components/admin/projects/ProjectPhaseCards.tsx');
 assert.doesNotMatch(overview,/editing\.editTask|Edit task &amp; subtasks/);
 assert.doesNotMatch(milestones,/editing\.editTask|Edit task &amp; subtasks/);
 assert.doesNotMatch(milestones,/editing\.editMilestone/);
 assert.match(phases,/href=\{taskHref\(id,task.id\)\}/);
 const {taskHref}=loadProjectTs('lib/tasks/links.ts');
 const target=new URL(taskHref('project','task & detail'),'https://example.test');
 assert.equal(target.searchParams.get('tab'),'plan');
 assert.equal(target.searchParams.get('task'),'task & detail');
});
