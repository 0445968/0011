
import 'server-only';

import {
  clientRequirements,
  getServiceBlueprint,
} from '@/data/serviceCatalog';

import type {
  ProposalRecord,
} from '@/lib/proposals/data';

import type {
  OnboardingItemDefinition,
  OnboardingItemType,
} from './item-schema';

const requirementById = new Map(
  clientRequirements.map((requirement) => [
    requirement.id,
    requirement,
  ])
);

function itemType(
  responseType: 'form' | 'file' | 'access' | 'assessment'
): OnboardingItemType {
  if (responseType === 'file') return 'file_upload';
  if (responseType === 'access') return 'access_invitation';
  if (responseType === 'assessment') return 'assessment';

  return 'information_request';
}

export function personalizedOnboardingSeed(
  proposal: ProposalRecord
): OnboardingItemDefinition[] {
  const services = proposal.body.items;

  const usage = new Map<string, Set<string>>();

  for (const service of services) {
    const blueprint = getServiceBlueprint(
      service.serviceId
    );

    if (!blueprint) continue;

    if (
      service.blueprintVersion !== null &&
      service.blueprintVersion !==
        blueprint.blueprintVersion
    ) {
      continue;
    }

    for (const requirementId of blueprint.requirementIds) {
      const serviceIds =
        usage.get(requirementId) ??
        new Set<string>();

      serviceIds.add(service.serviceId);
      usage.set(requirementId, serviceIds);
    }
  }

  if (usage.size === 0) {
    for (const requirementId of [
      'business-profile',
      'project-contacts',
      'existing-assets',
    ]) {
      usage.set(requirementId, new Set<string>());
    }
  }

  const result: OnboardingItemDefinition[] = [];

  // Array.from avoids downlevel Map iteration errors.
  for (const [requirementId, serviceIds] of Array.from(
    usage.entries()
  )) {
    const requirement =
      requirementById.get(requirementId);

    if (!requirement) continue;

    const type = itemType(requirement.responseType);

    const phase =
      requirementId === 'project-contacts'
        ? 'proposal-onboarding'
        : 'discovery';

    result.push({
      itemKey: requirement.id,
      title: requirement.label,
      owner: 'client',
      itemType: type,
      required: requirement.required,
      dueOn: null,
      serviceIds: Array.from(serviceIds).sort(),
      phase,
      dependsOn: null,
      prompt:
        type === 'access_invitation'
          ? `${requirement.label}. Invite Bivi through the service provider or describe the access that is ready. Never paste a password, recovery code, secret, or API token here.`
          : type === 'file_upload'
            ? `${requirement.label}. Upload the relevant files below, then submit this item when the upload is complete.`
            : type === 'assessment'
              ? `${requirement.label}. Complete the assessment and record the completion/result reference here.`
              : requirement.label,
      assessmentSlug: requirement.assessmentSlug ?? null,
    });
  }

  return result;
}
