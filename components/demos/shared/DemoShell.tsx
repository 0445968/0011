'use client';

import { useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Info,
  X,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Demo, DemoCategory } from '@/data/demos/registry';

const categoryBadgeColors: Record<DemoCategory, string> = {
  App: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  SaaS: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Dashboard: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  Ecommerce: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Game: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  Utility: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  Experiment: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
  Mobile: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
};

interface DemoShellProps {
  demo: Demo;
  children: ReactNode;
  /** When true, the demo content fills the viewport with no page chrome. */
  immersiveByDefault?: boolean;
}

export function DemoShell({
  demo,
  children,
  immersiveByDefault = false,
}: DemoShellProps) {
  const [immersive, setImmersive] = useState(immersiveByDefault);
  const [infoOpen, setInfoOpen] = useState(false);

  if (immersive) {
    return (
      <div className="fixed inset-0 z-[60] bg-background">
        {/* Immersive toolbar */}
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          <button
            onClick={() => setInfoOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur transition-transform hover:scale-105"
            aria-label="Show demo info"
          >
            <Info size={18} />
          </button>
          <button
            onClick={() => setImmersive(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur transition-transform hover:scale-105"
            aria-label="Exit full screen"
          >
            <Minimize2 size={18} />
          </button>
        </div>

        <div className="h-full w-full overflow-auto">{children}</div>

        {infoOpen && (
          <DemoInfoPanel
            demo={demo}
            onClose={() => setInfoOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <section className="min-h-screen pt-24 md:pt-28">
      {/* Shell toolbar */}
      <div className="container-page">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <a
              href="/demos"
              className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft
                size={16}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
              <span className="hidden sm:inline">All demos</span>
            </a>

            <span className="text-border">/</span>

            <span className="text-sm font-medium text-foreground">
              {demo.productName}
            </span>

            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                categoryBadgeColors[demo.category]
              )}
            >
              {demo.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInfoOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
            >
              <Info size={14} />
              <span className="hidden sm:inline">Info</span>
            </button>
            <button
              onClick={() => setImmersive(true)}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
            >
              <Maximize2 size={14} />
              <span className="hidden sm:inline">Full screen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo content area */}
      <div className="container-page py-8 md:py-10">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {children}
        </div>
      </div>

      {infoOpen && (
        <DemoInfoPanel
          demo={demo}
          onClose={() => setInfoOpen(false)}
        />
      )}
    </section>
  );
}

function DemoInfoPanel({
  demo,
  onClose,
}: {
  demo: Demo;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="relative mx-4 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close info panel"
        >
          <X size={18} />
        </button>

        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium',
            categoryBadgeColors[demo.category]
          )}
        >
          {demo.category}
        </span>

        <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight">
          {demo.productName}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">{demo.title}</p>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {demo.longDescription}
        </p>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Technologies
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {demo.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Tag size={12} />
            Tags
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {demo.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            Difficulty:{' '}
            <span className="font-medium text-foreground">
              {demo.difficulty}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
