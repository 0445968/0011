import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { DemoLibrary } from '@/components/demos/shared/DemoLibrary';
import { featuredDemos } from '@/data/demos/registry';

export const metadata: Metadata = {
  title: 'Demos',
  description:
    'Interactive product demos — small apps, games, utilities, dashboards, and creative experiments you can launch directly from the browser.',
};

export default function DemosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Interactive Demos"
        title="Launch and explore real, working products."
        description="A growing collection of interactive demos — apps, dashboards, games, utilities, and creative experiments. Filter by category, search by tag, and launch any demo right in your browser."
      />
      <DemoLibrary />
    </>
  );
}
