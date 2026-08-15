'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Monitor, Smartphone } from 'lucide-react';
import type { Template } from '@/data/templates';

interface TemplatePreviewProps {
  template: Template;
  backHref?: string;
}

export function TemplatePreview({ template, backHref = '/#templates' }: TemplatePreviewProps) {
  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28">
      <div className="container-page">
        <a
          href={backHref}
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft
            size={16}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          Back to templates
        </a>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 grid gap-12 md:grid-cols-12 md:gap-10"
        >
          <div className="md:col-span-7">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              {template.category}
            </span>
            <h1 className="mt-3 text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              {template.name}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {template.description}
            </p>
          </div>

          <div className="md:col-span-5 md:pt-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Monitor size={15} /> Responsive
                </span>
                <span className="h-3 w-px bg-border" />
                <span className="flex items-center gap-1.5">
                  <Smartphone size={15} /> Mobile-first
                </span>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Technologies
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {template.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium text-foreground/90"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Features
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href={`/#templates`}
                className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-transform duration-300 hover:scale-[1.02] active:scale-95"
              >
                Launch live demo
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-5 py-3">
            <span className="h-3 w-3 rounded-full bg-error/70" />
            <span className="h-3 w-3 rounded-full bg-warning/70" />
            <span className="h-3 w-3 rounded-full bg-success/70" />
            <span className="ml-3 truncate text-xs text-muted-foreground">
              {template.name} — preview
            </span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={template.preview}
            alt={`${template.name} preview`}
            className="aspect-[16/10] w-full object-cover"
          />
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            { title: 'Built to adapt', body: 'Every section is modular and themeable — swap content and colours without touching structure.' },
            { title: 'Production-ready', body: 'Clean, typed, component-driven code that ships to a real domain without rework.' },
            { title: 'Designed to convert', body: 'Hierarchy, motion, and CTAs tuned for the outcomes that matter to this category.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-serif text-lg font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
