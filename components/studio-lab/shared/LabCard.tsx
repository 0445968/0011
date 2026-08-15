'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LabItem } from '@/data/studio-lab/registry';
import { labTypeMeta } from '@/data/studio-lab/registry';
import { labIcons } from './labIcons';

interface LabCardProps {
  item: LabItem;
  compact?: boolean;
}

export function LabCard({ item, compact }: LabCardProps) {
  const Icon = labIcons[item.icon] ?? labIcons.sparkles;
  const typeMeta = labTypeMeta[item.type];
  const isComingSoon = item.status === 'coming-soon';

  return (
    <motion.a
      href={item.href}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group relative flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30',
        compact && 'p-4',
      )}
    >
      {/* Top row: icon + type badge */}
      <div className="mb-4 flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background">
          <Icon size={18} className="text-primary" />
        </span>
        <div className="flex items-center gap-2">
          {isComingSoon && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Soon
            </span>
          )}
          <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', typeMeta.color)}>
            {typeMeta.label}
          </span>
        </div>
      </div>

      {/* Title + description */}
      <h3 className={cn('font-heading font-semibold tracking-tight', compact ? 'text-base' : 'text-lg')}>
        {item.title}
      </h3>
      <p className={cn('mt-1.5 text-sm leading-relaxed text-muted-foreground', compact && 'line-clamp-2')}>
        {item.description}
      </p>

      {/* Footer: estimated time + arrow */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-border">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock size={13} />
          {item.estimatedTime}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-transform group-hover:translate-x-0.5">
          {isComingSoon ? 'Preview' : 'Open'}
          <ArrowRight size={13} />
        </span>
      </div>
    </motion.a>
  );
}
