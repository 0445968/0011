import type { ProjectPhase } from './lifecycle-schema';
import type { PhaseStatus, ProjectPhaseState } from './phase-status';

type WriteResult = { saved: true; revision: number } | { saved: false; error: string };
type SaveOutcome = {
  outcome: 'saved' | 'saved_refresh_failed' | 'failed';
  error?: string;
  uncertain?: boolean;
  states?: ProjectPhaseState[];
};

export function updatePhaseState(states: ProjectPhaseState[], phase: ProjectPhase, status: PhaseStatus, revision: number) {
  return states.map(item => item.phase === phase ? { ...item, status, revision } : item);
}

export async function reconcilePhaseStatusSave(input: {
  phase: ProjectPhase;
  status: PhaseStatus;
  expectedRevision: number;
  write: () => Promise<WriteResult>;
  refresh: () => Promise<ProjectPhaseState[] | null>;
  applySaved: (revision: number) => void;
}): Promise<SaveOutcome> {
  try {
    const write = await input.write();
    if (write.saved) {
      input.applySaved(write.revision);
      const states = await input.refresh();
      return states ? { outcome: 'saved', states } : { outcome: 'saved_refresh_failed' };
    }
    const states = await input.refresh();
    const current = states?.find(item => item.phase === input.phase);
    if (current && current.status === input.status && current.revision > input.expectedRevision) {
      input.applySaved(current.revision);
      return { outcome: 'saved', states: states ?? undefined };
    }
    return { outcome: 'failed', error: write.error, states: states ?? undefined, uncertain: !states };
  } catch (cause) {
    const states = await input.refresh();
    const current = states?.find(item => item.phase === input.phase);
    if (current && current.status === input.status && current.revision > input.expectedRevision) {
      input.applySaved(current.revision);
      return { outcome: 'saved', states: states ?? undefined };
    }
    return {
      outcome: 'failed', states: states ?? undefined, uncertain: !states,
      error: cause instanceof Error ? cause.message : 'The phase save response was lost.',
    };
  }
}
