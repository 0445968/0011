'use client';

import {
  notFound,
} from 'next/navigation';

import {
  DemoShell,
} from './DemoShell';

import {
  ComingSoon,
} from './ComingSoon';

import {
  getDemoComponent,
} from '@/components/demos';

import type {
  Demo,
} from '@/data/demos/registry';

interface DemoRunnerProps {
  demo: Demo;
}

export function DemoRunner({
  demo,
}: DemoRunnerProps) {
  /**
   * Planned demos should never have
   * a public interactive route.
   */
  if (
    demo.status ===
    'planned'
  ) {
    notFound();
  }

  const DemoComponent =
    getDemoComponent(
      demo.slug
    );

  /**
   * Coming-soon demos may still use
   * the shared shell if you want to
   * preview their placeholder.
   */
  if (
    demo.status ===
    'coming-soon'
  ) {
    return (
      <DemoShell
        demo={demo}
      >
        <ComingSoon
          demo={demo}
        />
      </DemoShell>
    );
  }

  /**
   * Active demos must have an actual
   * registered component.
   */
  if (!DemoComponent) {
    notFound();
  }

  return (
    <DemoShell
      demo={demo}
    >
      <DemoComponent
        slug={
          demo.slug
        }
      />
    </DemoShell>
  );
}