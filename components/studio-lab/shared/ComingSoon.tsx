'use client';

import { motion } from 'framer-motion';
import { Clock, Construction, ArrowLeft } from 'lucide-react';
import type { LabItem } from '@/data/studio-lab/registry';
import { LabShell } from './LabShell';

export function ComingSoon({ item }: { item: LabItem }) {
  return (
    <LabShell item={item}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-border bg-card p-10 text-center"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Construction size={28} className="text-primary" />
        </span>
        <h2 className="mt-6 font-heading text-2xl font-semibold tracking-tight">
          Coming Soon
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          This {item.type} is currently in development. It will be available soon as part of the Studio Lab.
          Check back later to try it out.
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock size={14} />
          <span>Estimated time: {item.estimatedTime}</span>
        </div>
        <a
          href="/studio-lab"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          <ArrowLeft size={16} />
          Back to Studio Lab
        </a>
      </motion.div>
    </LabShell>
  );
}
