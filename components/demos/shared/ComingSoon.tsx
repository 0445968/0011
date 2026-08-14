'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Hammer } from 'lucide-react';
import type { Demo } from '@/data/demos/registry';

interface ComingSoonProps {
  demo: Demo;
}

export function ComingSoon({ demo }: ComingSoonProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10"
      >
        <Hammer size={36} className="text-primary" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        {demo.productName} is coming soon
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground"
      >
        {demo.longDescription}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-2"
      >
        {demo.technologies.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            {tech}
          </span>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mt-8 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Sparkles size={16} className="text-primary" />
        <span>
          This demo is tagged as{' '}
          <strong className="text-foreground">{demo.difficulty}</strong>{' '}
          difficulty
        </span>
      </motion.div>

      <motion.a
        href="/demos"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-10 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/20 hover:bg-muted"
      >
        <ArrowLeft size={16} />
        Back to all demos
      </motion.a>
    </div>
  );
}
