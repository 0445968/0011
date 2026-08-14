'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Reveal } from '@/components/portfolio/Reveal';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  backHref = '/',
  backLabel = 'Back home',
}: PageHeaderProps) {
  return (
    <section className="relative border-b border-border pt-32 md:pt-40">
      <div className="container-page pb-16 md:pb-20">
        <a
          href={backHref}
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft
            size={16}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          {backLabel}
        </a>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-3xl"
        >
          <Reveal className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="h-px w-8 bg-primary" />
            {eyebrow}
          </Reveal>
          <h1 className="mt-6 text-balance font-heading text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
            {title}
          </h1>
          {description && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
