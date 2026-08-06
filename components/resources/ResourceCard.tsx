'use client';

import { motion } from 'framer-motion';
import {
  FileText,
  Wrench,
  BookOpen,
  ExternalLink,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import type { Resource } from '@/data/resources';

const typeConfig: Record<
  Resource['type'],
  { label: string; icon: typeof FileText }
> = {
  guide: { label: 'Guide', icon: FileText },
  tool: { label: 'Tool', icon: Wrench },
  article: { label: 'Article', icon: BookOpen },
  link: { label: 'Link', icon: ExternalLink },
};

export function ResourceCard({
  resource,
  index = 0,
}: {
  resource: Resource;
  index?: number;
}) {
  const cfg = typeConfig[resource.type];
  const Icon = cfg.icon;
  const isExternal = resource.external;

  return (
    <motion.a
      href={resource.href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: (index % 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
    >
      {resource.preview && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resource.preview}
            alt={resource.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            <Icon size={13} />
            {cfg.label}
          </span>
          {resource.badge && (
            <span className="rounded-full border border-border bg-secondary/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {resource.badge}
            </span>
          )}
        </div>
        <h3 className="mt-4 font-heading text-lg font-semibold leading-tight tracking-tight">
          {resource.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {resource.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {resource.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <span className="text-xs text-muted-foreground">
            {resource.category}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors group-hover:text-accent">
            {resource.type === 'guide'
              ? 'Download'
              : isExternal
                ? 'Visit'
                : 'Open'}
            {resource.type === 'guide' ? (
              <Download size={14} />
            ) : (
              <ArrowUpRight size={14} />
            )}
          </span>
        </div>
      </div>
    </motion.a>
  );
}
