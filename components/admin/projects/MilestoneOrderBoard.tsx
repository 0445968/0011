'use client';

import { useState, type ReactNode } from 'react';
import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor,
  closestCorners, pointerWithin, useDroppable, useSensor, useSensors,
  type CollisionDetection, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, GripVertical, Info, Plus, Save, ShieldAlert } from 'lucide-react';
import type { ProjectBody } from '@/lib/projects/schema';

type Task = ProjectBody['tasks'][number];
type Milestone = ProjectBody['milestones'][number];
type DropPosition = 'before' | 'after' | 'end';

const itemId = (taskId: string) => 'task:' + taskId;
const columnId = (milestoneId: string | null) => 'milestone:' + (milestoneId ?? 'unassigned');

function SortableMilestoneTask({ task, index, disabled, children }: {
  task: Task; index: number; disabled: boolean; children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({
      id: itemId(task.id),
      data: { kind: 'task', taskId: task.id, milestoneId: task.milestoneId },
      disabled,
    });
  return <div
    ref={setNodeRef}
    style={{ transform: CSS.Transform.toString(transform), transition }}
    className={'relative min-w-0 rounded-lg border border-border/40 bg-white shadow-sm dark:bg-card ' +
      (isDragging ? 'z-10 opacity-30' : 'hover:border-border/80')}
  >
    <div className="flex min-w-0 items-center gap-0.5 pl-1">
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        disabled={disabled}
        aria-label={'Reorder task ' + task.title}
        title={disabled ? 'Reordering is unavailable' : 'Drag to reorder; or press Space and use arrow keys'}
        className="inline-flex h-9 w-6 shrink-0 touch-none items-center justify-center rounded-md text-muted-foreground/60 hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-30"
      ><GripVertical size={15}/></button>
      <span title={'Milestone completion position ' + index} className="w-4 shrink-0 text-center font-mono text-[10px] tabular-nums text-muted-foreground">{index}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  </div>;
}

function MilestoneColumn({ milestone, tasks, disabled, addDisabled, canReorder, onAddTask, renderTask }: {
  milestone: Milestone | null; tasks: Task[]; disabled: boolean; addDisabled: boolean; canReorder: boolean;
  onAddTask: (milestoneId: string | null) => void;
  renderTask: (task: Task) => ReactNode;
}) {
  const milestoneId = milestone?.id ?? null;
  const completed = milestone?.status === 'done';
  const { setNodeRef, isOver } = useDroppable({
    id: columnId(milestoneId),
    data: { kind: 'milestone', milestoneId },
    disabled: !canReorder || completed,
  });
  const done = tasks.filter(task => task.status === 'done').length;
  return <section
    ref={setNodeRef}
    aria-label={(milestone?.title ?? 'No milestone') + ' task column'}
    className={'flex min-h-52 min-w-0 flex-col rounded-xl border p-2 transition-colors ' +
      (isOver && canReorder && !completed
        ? 'border-blue-400 bg-blue-50/80 dark:border-blue-600 dark:bg-blue-950/30'
        : 'border-border/50 bg-muted/40 dark:bg-muted/20')}
  >
    <div className="flex min-w-0 items-start justify-between gap-2 px-2 py-2">
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold" title={milestone?.title ?? 'No milestone'}>{milestone?.title ?? 'No milestone'}</h2>
        <p className="mt-1 text-[11px] text-muted-foreground">{done} of {tasks.length} completed{completed ? ' · Milestone locked' : ''}</p>
      </div>
      <button type="button"
        onClick={() => onAddTask(milestoneId)}
        disabled={disabled || addDisabled || completed}
        aria-label={'Add task to ' + (milestone?.title ?? 'No milestone')}
        title={completed ? 'Reopen this milestone before adding tasks' : 'Add task'}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-background/80 disabled:opacity-35"
      ><Plus size={15}/></button>
    </div>
    <SortableContext items={tasks.map(task => itemId(task.id))} strategy={verticalListSortingStrategy}>
      <div className="flex min-h-24 flex-1 flex-col gap-1.5 rounded-lg p-1">
        {tasks.map((task, index) =>
          <SortableMilestoneTask key={task.id} task={task} index={index + 1}
            disabled={!canReorder || completed}>{renderTask(task)}</SortableMilestoneTask>)}
        {!tasks.length && <div className="flex min-h-20 flex-1 items-center justify-center rounded-lg border border-dashed border-border/70 px-3 py-4 text-center text-[11px] text-muted-foreground">
          {completed ? 'Completed milestone' : !canReorder ? 'No matching tasks' : 'Drop a task here'}
        </div>}
      </div>
    </SortableContext>
  </section>;
}

const detectDrop: CollisionDetection = args => {
  // The active sortable is also a droppable. Never return it as its own
  // target: doing so can turn an otherwise valid drag into a silent no-op.
  const others = {
    ...args,
    droppableContainers: args.droppableContainers.filter(
      container => container.id !== args.active.id && !container.disabled,
    ),
  };
  const pointerHits = pointerWithin(others);
  if (pointerHits.length) {
    const tasks = pointerHits.filter(item => String(item.id).startsWith('task:'));
    return tasks.length ? tasks : pointerHits;
  }
  return closestCorners(others);
};

export function MilestoneOrderBoard({ milestones, tasks, disabled, addDisabled=false, canReorder, orderDirty,
  saving, saveIssue, verifyRequired=false, onVerifySave, onMove, onAddTask, onSave, renderTask }: {
  milestones: Milestone[];
  tasks: Task[];
  disabled: boolean;
  addDisabled?: boolean;
  canReorder: boolean;
  orderDirty: boolean;
  saving: boolean;
  saveIssue?: string | null;
  verifyRequired?: boolean;
  onVerifySave?: () => void;
  onMove: (taskId: string, milestoneId: string | null, overTaskId: string | null, position: DropPosition) => boolean;
  onAddTask: (milestoneId: string | null) => void;
  onSave: () => void;
  renderTask: (task: Task) => ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 7 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const draggedTask = tasks.find(task => itemId(task.id) === draggedId);
  const milestoneIds = new Set(milestones.map(milestone => milestone.id));
  const filteredTasks = tasks.filter(task => task.milestoneId === null || milestoneIds.has(task.milestoneId));

  function drop(event: DragEndEvent) {
    setDraggedId(null);
    if (!canReorder || !event.over) return;
    const fromId = String(event.active.id);
    const overId = String(event.over.id);
    if (!fromId.startsWith('task:')) return;
    const taskId = fromId.slice(5);
    const source = tasks.find(task => task.id === taskId);
    if (!source) return;
    const targetTask = overId.startsWith('task:') ? tasks.find(task => itemId(task.id) === overId) : null;
    // Only known task and milestone IDs are valid. Never interpret an
    // unexpected collision result as the unassigned column.
    if (!targetTask && !overId.startsWith('milestone:')) return;
    const key = overId.startsWith('milestone:') ? overId.slice(10) : null;
    const destinationId = targetTask
      ? targetTask.milestoneId
      : key === 'unassigned' ? null : key;
    if (destinationId === undefined || (destinationId !== null && !milestoneIds.has(destinationId))) return;
    if (source.id === targetTask?.id) return;

    let position: DropPosition = 'end';
    if (targetTask) {
      if (source.milestoneId === destinationId) {
        position = tasks.findIndex(task => task.id === source.id) <
          tasks.findIndex(task => task.id === targetTask.id) ? 'after' : 'before';
      } else {
        const moved = event.active.rect.current.translated;
        position = moved && moved.top + moved.height / 2 > event.over.rect.top + event.over.rect.height / 2
          ? 'after' : 'before';
      }
    }
    if (onMove(taskId, destinationId, targetTask?.id ?? null, position)) {
      setAnnouncement('Completion order updated. Work-plan autosave will save this as the project manual order.');
    } else {
      setAnnouncement('Task order was unchanged. Completed milestones and invalid moves are protected.');
    }
  }

  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold">Project completion order</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Drag tasks by their grip to arrange completion order. Moving between columns updates their milestone. Dependencies remain enforced.
        </p>
      </div>
      <div className="flex items-center gap-2">
        {orderDirty ? <span role="status" className={'text-[11px] '+(saveIssue?'text-amber-700 dark:text-amber-300':'text-blue-700 dark:text-blue-300')}>
          {saving ? 'Saving order…' : saveIssue ? 'Order needs attention' : 'Order awaiting autosave'}
        </span> : <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Check size={13}/>Order saved</span>}
        {orderDirty && !verifyRequired && <button type="button" onClick={onSave} disabled={disabled || saving} title="Save the entire work-plan draft, including this order"
          className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-[11px] font-medium hover:bg-muted disabled:opacity-40">
          <Save size={14}/>{saveIssue ? 'Retry save' : 'Save now'}
        </button>}
        {verifyRequired && <button type="button" onClick={onVerifySave} disabled={saving}
          title="Verify the saved revision before retrying"
          className="inline-flex min-h-8 items-center rounded-lg border border-border bg-background px-3 text-[11px] font-medium hover:bg-muted disabled:opacity-40">
          Verify save
        </button>}
      </div>
    </div>
    {saveIssue && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">{saveIssue}</p>}
    {!canReorder && !disabled && <p role="status" className="flex items-center gap-2 px-3 text-[11px] text-amber-700 dark:text-amber-300">
      <Info size={14}/>Switch Sort to Manual order and clear active filters to enable dragging. Task order remains visible.
    </p>}
    {disabled && <p role="status" className="flex items-center gap-2 px-3 text-[11px] text-muted-foreground"><ShieldAlert size={14}/>Reordering is unavailable while this project is read-only or saving.</p>}
    {announcement && <p role="status" className="px-3 text-[11px] text-muted-foreground">{announcement}</p>}
    <DndContext sensors={sensors} collisionDetection={detectDrop}
      onDragStart={event => {setDraggedId(String(event.active.id));setAnnouncement('');}}
      onDragCancel={() => setDraggedId(null)}
      onDragEnd={drop}>
      <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
        {milestones.map(milestone => <MilestoneColumn key={milestone.id} milestone={milestone}
          tasks={filteredTasks.filter(task => task.milestoneId === milestone.id)}
          disabled={disabled} addDisabled={addDisabled} canReorder={canReorder} onAddTask={onAddTask} renderTask={renderTask}/>)}
        <MilestoneColumn key="unassigned" milestone={null}
          tasks={filteredTasks.filter(task => task.milestoneId === null)}
          disabled={disabled} addDisabled={addDisabled} canReorder={canReorder} onAddTask={onAddTask} renderTask={renderTask}/>
      </div>
      <DragOverlay dropAnimation={null}>
        {draggedTask ? <div className="max-w-80 rounded-lg border border-blue-300 bg-white px-4 py-3 text-xs font-medium shadow-xl dark:bg-card">
          <span className="mr-2 inline-flex text-blue-600"><GripVertical size={15}/></span>
          {draggedTask.title}
        </div> : null}
      </DragOverlay>
    </DndContext>
  </div>;
}
