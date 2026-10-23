import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL(`../../${path}`,import.meta.url),'utf8');

test('normal task cards own grouped editing and use shared task controls, productivity, hierarchy, and completion override',()=>{
 const board=read('components/admin/projects/ProjectMilestoneBoardV2.tsx');
 assert.match(board,/<details key=\{task\.id\} id=\{taskDomId\(task\.id\)\}/);
 assert.match(board,/open=\{Boolean\(openTasks\[task\.id\]\)\}/);
 assert.equal((board.match(/<ProjectLifecycleControls/g)||[]).length,1);
 assert.match(board,/<ProjectLifecycleControls[\s\S]*taskOnlyTaskId=\{task\.id\}/);
 assert.match(board,/<TaskProductivity[\s\S]*taskId=\{task\.id\}/);
 assert.match(board,/Subtasks \(\{hierarchy\.data\?children\.length/);
 assert.match(board,/Override and change status/);
 assert.match(board,/Remove task/);
 assert.doesNotMatch(board,/<h3 className="text-sm font-semibold">Task details<\/h3>/);
});

test('Phases keeps phase controls and sends task work back to the canonical Tasks section',()=>{
 const phases=read('components/admin/projects/ProjectPhasesPage.tsx');
 const lifecycle=read('components/admin/ProjectLifecycleControls.tsx');
 assert.match(phases,/Open Tasks &amp; Milestones/);
 assert.match(phases,/showTaskManagement=\{false\}/);
 assert.match(lifecycle,/taskOnlyTaskId\?/);
 assert.match(lifecycle,/showTaskManagement && events\.length/);
});

test('Open task clears transient board filters and resolves legacy phase task links to Tasks',()=>{
 const board=read('components/admin/projects/ProjectMilestoneBoardV2.tsx');
 const page=read('app/admin/(workspace)/projects/[id]/page.tsx');
 assert.match(board,/setFilters\(\{\.\.\.emptyWorkplanFilters\}\); setTagFilter\(''\); setView\('tasks'\); setGrouping\('none'\)/);
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
 assert.match(phases,/tab=plan&task=/);
});
