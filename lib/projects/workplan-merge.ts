import type { ProjectBody } from './schema';

export type MergeChoice = 'draft' | 'latest';
export type WorkplanMergeConflict = {
  path: string;
  label: string;
  baseline: unknown;
  draft: unknown;
  latest: unknown;
};
export type WorkplanMergeResult = { body: ProjectBody; conflicts: WorkplanMergeConflict[] };

function stableValue(value:unknown):unknown{
  if(Array.isArray(value))return value.map(stableValue);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>[key,stableValue(item)]));
  return value;
}
const same = (left: unknown, right: unknown) => JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
const display = (value: unknown) => value === undefined ? null : value;

function mergeValue<T>(
  path: string,
  label: string,
  baseline: T | undefined,
  draft: T | undefined,
  latest: T | undefined,
  choices: Record<string, MergeChoice>,
  conflicts: WorkplanMergeConflict[],
): T | undefined {
  if (same(draft, baseline)) return latest;
  if (same(latest, baseline)) return draft;
  if (same(draft, latest)) return draft;
  const choice = choices[path];
  if (!choice) conflicts.push({ path, label, baseline: display(baseline), draft: display(draft), latest: display(latest) });
  // On an unresolved conflict keep the person's draft visible, while the conflict
  // blocks saving until they explicitly pick the latest value or their edit.
  return choice === 'latest' ? latest : draft;
}

function mergeCollection<T extends { id: string }>(
  key: 'tasks' | 'milestones',
  baseline: T[],
  draft: T[],
  latest: T[],
  choices: Record<string, MergeChoice>,
  conflicts: WorkplanMergeConflict[],
) {
  const baselineById = new Map(baseline.map(item => [item.id, item]));
  const draftById = new Map(draft.map(item => [item.id, item]));
  const latestById = new Map(latest.map(item => [item.id, item]));
  const merged = new Map<string, T>();
  const ids = new Set([...baselineById.keys(), ...draftById.keys(), ...latestById.keys()]);

  for (const id of ids) {
    const before = baselineById.get(id);
    const local = draftById.get(id);
    const remote = latestById.get(id);
    const titleOf = (item: T | undefined) => (item as (T & { title?: string }) | undefined)?.title;
    const label = `${key === 'tasks' ? 'Task' : 'Milestone'} “${titleOf(local) ?? titleOf(remote) ?? titleOf(before) ?? id}”`;

    if (before && (!local || !remote)) {
      if (!local && !remote) continue;
      const remaining = local ?? remote;
      if (same(remaining, before)) continue;
      const path = `${key}.${id}.$presence`;
      const choice = choices[path];
      if (!choice) conflicts.push({ path, label, baseline: before, draft: display(local), latest: display(remote) });
      const selected = choice === 'latest' ? remote : local;
      if (selected) merged.set(id, selected);
      continue;
    }

    if (!local && !remote) continue;
    if (!before) {
      // New records have no shared baseline. UUID collision is uncommon, but if both sides
      // created the same ID, report the fields that differ instead of dropping either edit.
      const preferred = local ?? remote!;
      if (local && remote && !same(local, remote)) {
        const item = { ...preferred } as T;
        for (const field of [...new Set([...Object.keys(before??{}),...Object.keys(local??{}),...Object.keys(remote??{})])] as (keyof T)[]) {
          if (field === 'id') continue;
          const value = mergeValue(`${key}.${id}.${String(field)}`, `${label} › ${String(field)}`,
            undefined, local[field], remote[field], choices, conflicts);
          if (value !== undefined) item[field] = value as T[keyof T];
          else delete item[field];
        }
        merged.set(id, item);
      } else merged.set(id, preferred);
      continue;
    }

    const localItem = local!;
    const remoteItem = remote!;
    const item = { ...remoteItem } as T;
    for (const field of [...new Set([...Object.keys(before??{}),...Object.keys(local??{}),...Object.keys(remote??{})])] as (keyof T)[]) {
      if (field === 'id') continue;
      const value = mergeValue(`${key}.${id}.${String(field)}`, `${label} › ${String(field)}`,
        before[field], localItem[field], remoteItem[field], choices, conflicts);
      if (value !== undefined) item[field] = value as T[keyof T];
          else delete item[field];
    }
    merged.set(id, item);
  }

  const baselineCommon = baseline.map(item => item.id).filter(id => draftById.has(id) && latestById.has(id) && merged.has(id));
  const draftCommon = draft.map(item => item.id).filter(id => baselineCommon.includes(id));
  const latestCommon = latest.map(item => item.id).filter(id => baselineCommon.includes(id));
  const draftReordered = !same(draftCommon, baselineCommon);
  const latestReordered = !same(latestCommon, baselineCommon);
  const orderPath = `${key}.$order`;
  let preferred = latest.map(item => item.id);
  if (draftReordered && !latestReordered) preferred = draft.map(item => item.id);
  else if (draftReordered && latestReordered && !same(draftCommon, latestCommon)) {
    const choice = choices[orderPath];
    if (!choice) conflicts.push({
      path: orderPath,
      label: `${key === 'tasks' ? 'Task' : 'Milestone'} order`,
      baseline: baselineCommon,
      draft: draftCommon,
      latest: latestCommon,
    });
    if (choice !== 'latest') preferred = draft.map(item => item.id);
  }
  const allOrders = [...preferred, ...draft.map(item => item.id), ...latest.map(item => item.id), ...baseline.map(item => item.id)];
  const orderedIds = [...new Set(allOrders)].filter(id => merged.has(id));
  return orderedIds.map(id => merged.get(id)!);
}

export function mergeProjectBodies(
  baseline: ProjectBody,
  draft: ProjectBody,
  latest: ProjectBody,
  choices: Record<string, MergeChoice> = {},
): WorkplanMergeResult {
  const conflicts: WorkplanMergeConflict[] = [];
  const title = mergeValue('title', 'Project › title', baseline.title, draft.title, latest.title, choices, conflicts) ?? latest.title;
  const owner = mergeValue('owner', 'Project › owner', baseline.owner, draft.owner, latest.owner, choices, conflicts) ?? latest.owner;
  const notes = mergeValue('notes', 'Project › notes', baseline.notes, draft.notes, latest.notes, choices, conflicts) ?? latest.notes;
  const tasks = mergeCollection('tasks', baseline.tasks, draft.tasks, latest.tasks, choices, conflicts);
  const milestones = mergeCollection('milestones', baseline.milestones, draft.milestones, latest.milestones, choices, conflicts);
  return { body: { title, owner, notes, tasks, milestones }, conflicts };
}

export function projectBodiesEqual(left: ProjectBody, right: ProjectBody) {
  return same(left, right);
}

/** Mirror the existing BEFORE UPDATE milestone normalization for uncertain-save comparison. */
export function normalizeWorkplanBodyForSave(body: ProjectBody): ProjectBody {
  return {
    ...body,
    milestones: body.milestones.map(milestone => {
      if (milestone.status === 'done') return milestone;
      const active = body.tasks.some(task => task.milestoneId === milestone.id && (task.status === 'doing' || task.status === 'blocked'));
      return { ...milestone, status: active ? 'in_progress' : 'planned' };
    }),
  };
}
