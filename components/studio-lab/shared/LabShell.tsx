'use client';

import { ArrowLeft, RotateCcw, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LabItem } from '@/data/studio-lab/registry';
import { labTypeMeta } from '@/data/studio-lab/registry';
import { labIcons } from './labIcons';

interface LabShellProps {
  item: LabItem;
  children: React.ReactNode;
  onReset?: () => void;
  onShare?: () => void;
  className?: string;
}

export function LabShell({ item, children, onReset, onShare, className }: LabShellProps) {
  const Icon = labIcons[item.icon] ?? labIcons.sparkles;
  const typeMeta = labTypeMeta[item.type];

  return (
    <div className={cn('container-page pt-32 md:pt-36', className)}>
      {/* Subtle toolbar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <a
          href="/studio-lab"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
          Studio Lab
        </a>
        <div className="flex items-center gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Share2 size={13} />
              Share
            </button>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="mb-8 max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card">
            <Icon size={20} className="text-primary" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {item.title}
              </h1>
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', typeMeta.color)}>
                {typeMeta.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{item.estimatedTime}</span>
          {item.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2 py-0.5">{tag}</span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">{children}</div>
    </div>
  );
}
