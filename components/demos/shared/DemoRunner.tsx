'use client';

import { notFound } from 'next/navigation';
import { DemoShell } from './DemoShell';
import { ComingSoon } from './ComingSoon';
import { getDemoComponent } from '@/components/demos';
import type { Demo } from '@/data/demos/registry';

interface DemoRunnerProps {
  demo: Demo;
}

/**
 * Bridges the server-rendered demo page to the client-only
 * demo components. Looks up the demo's component from the
 * registry; if none exists yet, renders the ComingSoon placeholder.
 */
export function DemoRunner({ demo }: DemoRunnerProps) {
  if (demo.status === 'planned') {
    notFound();
  }

  const DemoComponent = getDemoComponent(demo.slug);

  return (
    <DemoShell demo={demo}>
      {DemoComponent ? (
        <DemoComponent slug={demo.slug} />
      ) : (
        <ComingSoon demo={demo} />
      )}
    </DemoShell>
  );
}
