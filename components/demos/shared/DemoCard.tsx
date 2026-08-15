'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Play, Eye } from 'lucide-react';
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

interface DemoCardProps {
  demo: Demo;
  index?: number;
}

export function DemoCard({ demo, index = 0 }: DemoCardProps) {
  const isComingSoon = demo.status === 'coming-soon';
  const isPlanned = demo.status === 'planned';
  const showLaunch = demo.status === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.06, 0.36),
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-lg"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={demo.thumbnail}
          alt={demo.productName}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category badge */}
        <span
          className={cn(
            'absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm',
            categoryBadgeColors[demo.category]
          )}
        >
          {demo.category}
        </span>

        {/* Status badge */}
        {(isComingSoon || isPlanned) && (
          <span className="absolute right-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            {isComingSoon ? 'Coming soon' : 'Planned'}
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {showLaunch ? (
            <span className="flex items-center gap-2 rounded-full bg-background/90 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur">
              <Play size={16} className="text-primary" />
              Launch demo
            </span>
          ) : (
            <span className="flex items-center gap-2 rounded-full bg-background/90 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur">
              <Eye size={16} />
              View details
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-semibold leading-snug tracking-tight">
          {demo.productName}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {demo.shortDescription}
        </p>

        {/* Technology tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {demo.technologies.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {tech}
            </span>
          ))}
          {demo.technologies.length > 3 && (
            <span className="rounded-full px-2.5 py-0.5 text-xs text-muted-foreground/60">
              +{demo.technologies.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {demo.difficulty}
          </span>

          <a
            href={demo.href}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors group-hover:text-primary"
          >
            {showLaunch ? 'Launch demo' : 'View details'}
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
