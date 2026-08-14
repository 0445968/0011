// Centralized assessment definition lookup.
// Maps assessment slugs to their AssessmentDefinition objects.
// To add a new assessment: create its definition file, import it here,
// and set its status to 'active' in data/studio-lab/registry.ts.

import type { AssessmentDefinition } from './types';
import { brandPersonality } from './brand-personality';
import { brandArchetype } from './brand-archetype';
import { brandHealth } from './brand-health';
import { brandPositioning } from './brand-positioning';
import { brandVoice } from './brand-voice';
import { rebrandReadiness } from './rebrand-readiness';

export const assessmentDefinitions: Record<string, AssessmentDefinition> = {
  'brand-personality': brandPersonality,
  'brand-archetype': brandArchetype,
  'brand-health': brandHealth,
  'brand-positioning': brandPositioning,
  'brand-voice': brandVoice,
  'rebrand-readiness': rebrandReadiness,
};

export function getAssessmentDefinition(slug: string): AssessmentDefinition | undefined {
  return assessmentDefinitions[slug];
}
