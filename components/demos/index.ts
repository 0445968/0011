import type { ComponentType } from 'react';
import { RoamlyApp } from './travel-planner/RoamlyApp';
import { LedgerApp } from './finance-dashboard/LedgerApp';
import { EchoApp } from './music-player/EchoApp';
import { FlowApp } from './kanban/FlowApp';
import { QuizzedApp } from './trivia/QuizzedApp';
import { SlotlyApp } from './appointment-booking/SlotlyApp';

export interface DemoComponentProps {
  slug: string;
}

/**
 * Registry of demo components keyed by slug.
 *
 * Demos not in this map fall back to the ComingSoon placeholder.
 */
const demoComponents: Record<
  string,
  ComponentType<DemoComponentProps>
> = {
  'appointment-booking': SlotlyApp,
  'travel-planner': RoamlyApp,
  'finance-dashboard': LedgerApp,
  'music-player': EchoApp,
  'kanban': FlowApp,
  'trivia': QuizzedApp,
};

export function getDemoComponent(
  slug: string
): ComponentType<DemoComponentProps> | null {
  return demoComponents[slug] ?? null;
}
