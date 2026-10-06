import { getServiceBlueprint } from '@/data/serviceCatalog';
import type { SelectionResolution } from './types';

/** Resolve one raw ID. Broad choices retain their meaning instead of becoming purchases. */
export function resolveSelection(rawId: string): SelectionResolution {
  const inputId = rawId.trim();
  if (inputId === 'web-design') {
    return {
      kind: 'clarification', inputId, label: 'Web and Digital',
      question: 'Do you need website design, development, or both?',
      candidateServiceIds: ['website-design', 'website-development'],
    };
  }
  if (inputId === 'graphic-design') {
    return {
      kind: 'clarification', inputId, label: 'Graphic Design',
      question: 'Which design deliverables do you need?',
      candidateServiceIds: ['logo-design', 'visual-identity', 'brand-guidelines', 'social-media-kit', 'presentation-design'],
    };
  }
  if (inputId === 'development') {
    return { kind: 'service', inputId, serviceId: 'website-development' };
  }
  const service = getServiceBlueprint(inputId);
  if (service) return { kind: 'service', inputId, serviceId: service.id };

  // A management inquiry must never silently become a one-off creative kit.
  switch (inputId) {
    case 'social-media-management':
      return { kind: 'custom', inputId, label: 'Social Media Management', question: 'Which channels and ongoing management services do you need?' };
    case 'creative-direction':
      return { kind: 'custom', inputId, label: 'Creative Direction', question: 'What project needs creative direction?' };
    case 'concept-creation':
      return { kind: 'custom', inputId, label: 'Concept Creation', question: 'What output or campaign is the concept for?' };
    case 'email-design':
      return { kind: 'custom', inputId, label: 'Email Design', question: 'Which emails, templates, or flows do you need?' };
    case 'print-design':
      return { kind: 'custom', inputId, label: 'Print Design', question: 'Which printed items and quantities do you need?' };
    default:
      return { kind: 'unknown', inputId };
  }
}

/** Accept URLSearchParams.get('services') or a list. Empty values are ignored.
 * Aliases resolving to one service are deduplicated; quantities are configured separately.
 * Unknown IDs remain explicit so the UI can ask for clarification, never render raw HTML.
 */
export function resolveSelections(
  input: string | readonly string[] | null | undefined,
): SelectionResolution[] {
  const values: readonly string[] = typeof input === 'string' ? input.split(',') : input ?? [];
  const seen = new Set<string>();
  const results: SelectionResolution[] = [];
  for (const value of values) {
    if (!value.trim()) continue;
    const result = resolveSelection(value);
    const key = result.kind === 'service' ? `service:${result.serviceId}` : `input:${result.inputId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(result);
  }
  return results;
}
