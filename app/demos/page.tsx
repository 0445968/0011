import type {
  Metadata,
} from 'next';

import {
  DemoHero,
} from '@/components/demos/shared/DemoHero';

import {
  DemoRequestCTA,
} from '@/components/demos/shared/DemoRequestCTA';

export const metadata: Metadata = {
  title:
    'Interactive Demos',

  description:
    'Explore interactive product demos, dashboards, applications, games, and digital experiences created by Design Blade.',
};

export default function DemosPage() {
  return (
    <>
      <DemoHero />

      <DemoRequestCTA />
    </>
  );
}