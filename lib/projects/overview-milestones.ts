import type { ProjectBody } from './schema';
import type { ProjectPhase } from './lifecycle-schema';
import type { MilestonePhaseLink } from './overview-data';

/** Show milestones linked to an active phase, once each, with finished items last. */
export function activePhaseMilestones(body: ProjectBody, links: MilestonePhaseLink[], activePhases: ProjectPhase[]) {
  const active = new Set(activePhases);
  const eligible = new Set(links.filter(link => active.has(link.phase)).map(link => link.milestoneId));
  return body.milestones.filter(milestone => eligible.has(milestone.id))
    .sort((a,b) => Number(a.status === 'done') - Number(b.status === 'done'));
}
