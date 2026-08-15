'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import type { Template } from '@/data/templates';

export function TemplateCard({ template }: { template: Template }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
    >
      <a
        href={template.route}
        className="relative block aspect-[16/11] w-full overflow-hidden bg-secondary"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={template.preview}
          alt={template.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
            <ExternalLink size={15} />
            Live preview
          </span>
        </div>
        {template.featured && (
          <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            Featured
          </span>
        )}
      </a>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            {template.category}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {template.year}
          </span>
        </div>
        <h3 className="mt-3 font-serif text-xl font-semibold tracking-tight">
          {template.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {template.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <div className="flex flex-wrap gap-1.5">
            {template.technologies.map((tech) => (
              <span key={tech} className="text-xs text-muted-foreground/80">
                {tech}
              </span>
            ))}
          </div>
          <a
            href={template.route}
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors group-hover:text-accent"
          >
            Visit
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
