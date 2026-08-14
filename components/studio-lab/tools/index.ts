import type { ComponentType } from 'react';
import { InvoiceGenerator } from './InvoiceGenerator';
import { EstimateBuilder } from './EstimateBuilder';
import { SocialPreview } from './SocialPreview';
import { ColorPaletteGenerator } from './ColorPaletteGenerator';
import { TimezonePlanner } from './TimezonePlanner';
import { TypingTest } from './TypingTest';

// Maps active tool slugs to their implemented React components.
// To add a new tool: create its component, add it here, and set
// its status to 'active' in data/studio-lab/registry.ts.
export const toolComponents: Record<string, ComponentType<{ item: import('@/data/studio-lab/registry').LabItem }>> = {
  'invoice-generator': InvoiceGenerator,
  'estimate-builder': EstimateBuilder,
  'social-preview': SocialPreview,
  'color-palette': ColorPaletteGenerator,
  'timezone-planner': TimezonePlanner,
  'typing-test': TypingTest,
};
