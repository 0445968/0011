import type { ProjectBody } from './schema';
import type { ProjectPhase } from './lifecycle-schema';
import type { MilestonePhaseLink } from './overview-data';
import type { ProjectPhaseState } from './phase-status';

/** Explicitly active phases show every milestone. Historically active/completed phases
 * retain their approved milestones. Multi-phase milestones display just once. */
export function activePhaseMilestones(
  body: ProjectBody, links: MilestonePhaseLink[], legacyActivePhases: ProjectPhase[],
  states?: ProjectPhaseState[] | null,
) {
  const active = new Set(states ? states.filter(item => item.status === 'active').map(item => item.phase) : legacyActivePhases);
  const previouslyActive = new Set(states?.filter(item => item.everActive && item.status !== 'active').map(item => item.phase) ?? []);
  const eligible = new Set<string>();
  for (const link of links) {
    const milestone = body.milestones.find(item => item.id === link.milestoneId);
    if (active.has(link.phase) || (milestone?.status === 'done' && previouslyActive.has(link.phase))) eligible.add(link.milestoneId);
  }
  return body.milestones.filter(milestone => eligible.has(milestone.id))
    .sort((a, b) => Number(a.status === 'done') - Number(b.status === 'done'));
}
