import type { ProjectBody } from './schema';
import type { ProjectPhase } from './lifecycle-schema';
import type { MilestonePhaseLink } from './overview-data';
import type { ProjectPhaseState } from './phase-status';

/** Saved formal states take precedence over legacy evidence. History is an explicit scope. */
export function activePhaseMilestones(
  body: ProjectBody, links: MilestonePhaseLink[], legacyActivePhases: ProjectPhase[],
  states?: ProjectPhaseState[] | null,
) {
  const active = new Set(states ? states.filter(item => item.status === 'active').map(item => item.phase) : legacyActivePhases);
  const eligible = new Set<string>();
  for (const link of links) {
    if (active.has(link.phase)) eligible.add(link.milestoneId);
  }
  return body.milestones.filter(milestone => eligible.has(milestone.id))
    .sort((a, b) => Number(a.status === 'done') - Number(b.status === 'done'));
}
