import 'server-only';

import { getServiceBlueprint } from '@/data/serviceCatalog';
import type { InquiryRecord } from '@/lib/admin/inquiries';
import type { OnboardingItem } from '@/lib/onboarding/item-schema';
import type { ProposalRecord } from '@/lib/proposals/data';
import type { ProjectBody } from '@/lib/projects/schema';

import type { ProjectBriefBody } from './brief-schema';
import type { ProjectPhase } from './lifecycle-schema';

type SeedControl = {
  taskId: string;
  ownerType: 'bivi' | 'client';
  phase: ProjectPhase;
  serviceId: string | null;
  dependsOn: string | null;
  blockerOwner: 'bivi' | 'client' | 'external' | null;
};

type Seed = {
  tasks: ProjectBody['tasks'];
  controls: SeedControl[];
  brief: ProjectBriefBody;
};

function clean(value: string | undefined | null) {
  return (value ?? '').trim();
}

export function projectLaunchSeed(
  inquiry: InquiryRecord,
  proposal: ProposalRecord,
  onboardingItems: OnboardingItem[]
): Seed {
  const tasks: ProjectBody['tasks'] = [];
  const controls: SeedControl[] = [];
  const ids = new Set<string>();

  function addTask(
    id: string,
    title: string,
    ownerType: 'bivi' | 'client',
    phase: ProjectPhase,
    serviceId: string | null,
    dependsOn: string | null = null,
    status: ProjectBody['tasks'][number]['status'] = 'todo'
  ) {
    if (tasks.length >= 100 || ids.has(id) || id.length > 100) return;
    ids.add(id);
    tasks.push({
      id,
      title: title.slice(0, 300),
      owner: ownerType === 'client' ? 'Client' : 'Bivi',
      dueOn: null,
      status,
      milestoneId: null,
      notes: '',
    });
    controls.push({ taskId: id, ownerType, phase, serviceId, dependsOn, blockerOwner: null });
  }

  addTask(
    'project-brief-bivi-prepare',
    'Prepare and issue the project brief',
    'bivi',
    'discovery',
    null
  );
  addTask(
    'project-brief-client-approval',
    'Review and approve the project brief',
    'client',
    'discovery',
    null,
    'project-brief-bivi-prepare',
    'blocked'
  );

  for (const item of proposal.body.items) {
    const blueprint = getServiceBlueprint(item.serviceId);
    if (!blueprint) continue;
    if (item.blueprintVersion !== null && item.blueprintVersion !== blueprint.blueprintVersion) continue;

    for (const task of blueprint.tasks) {
      addTask(task.id, task.title, task.owner, task.phase, item.serviceId);
    }
  }

  const acceptedResponses = onboardingItems
    .filter((item) => ['accepted', 'waived'].includes(item.status))
    .map((item) => {
      const value = clean(item.response) || clean(item.staffNotes) || clean(item.waiverReason);
      return value ? `${item.title}: ${value}` : '';
    })
    .filter(Boolean)
    .join('\n\n');

  const assetResponses = onboardingItems
    .filter((item) => item.itemType === 'file_upload' && ['accepted', 'waived'].includes(item.status))
    .map((item) => `${item.title}: ${clean(item.response) || 'Files received by Bivi.'}`)
    .join('\n');

  const scopeParts = [
    clean(proposal.body.summary),
    clean(proposal.body.deliverables) ? `Deliverables\n${proposal.body.deliverables}` : '',
    clean(proposal.body.exclusions) ? `Exclusions\n${proposal.body.exclusions}` : '',
  ].filter(Boolean);

  const brief: ProjectBriefBody = {
    title: proposal.body.title,
    objectives: clean(inquiry.payload.goals) || clean(proposal.body.summary),
    audience: '',
    context: acceptedResponses.slice(0, 8000),
    scope: scopeParts.join('\n\n').slice(0, 8000),
    requirements: clean(proposal.body.clientInputs),
    timeline: clean(proposal.body.schedule),
    assets: assetResponses.slice(0, 6000),
    notes: '',
  };

  return { tasks, controls, brief };
}
