'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { templates, templateCategories, getTemplatesByCategory } from '@/data/templates';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { Reveal } from '../portfolio/Reveal';

export function TemplatesGallery() {
  const [active, setActive] = useState('all');
  const filtered = getTemplatesByCategory(active);

  return (
    <section id="templates" className="section-spacing relative">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="h-px w-8 bg-accent" />
              Resource Library
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-8 max-w-2xl text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                A growing library of production-ready resources and templates.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
              Each resource is a complete, standalone website. Drop in a new one
              and it appears here automatically.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="mt-12 flex flex-wrap gap-2">
            {templateCategories.map((cat) => {
              const count =
                cat.id === 'all'
                  ? templates.length
                  : templates.filter(
                      (t) => t.category.toLowerCase() === cat.id
                    ).length;
              const isActive = active === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActive(cat.id)}
                  className={`group relative rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  {cat.name}
                  <span
                    className={`ml-2 text-xs ${
                      isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/60'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center">
            <p className="font-serif text-xl text-muted-foreground">
              No resources in this category yet.
            </p>
            <p className="mt-2 text-sm text-muted-foreground/80">
              Add one and it will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
