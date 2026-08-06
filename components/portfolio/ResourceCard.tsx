'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Resource } from '@/data/resources';

interface ResourceCardProps {
  resource: Resource;
  index?: number;
}

const typeStyles = {
  article: {
    label: 'Article',
    color: 'bg-sky-500 text-white',
    cta: 'Read article',
  },
  guide: {
    label: 'Guide',
    color: 'bg-emerald-500 text-white',
    cta: 'Open guide',
  },
  tool: {
    label: 'Tool',
    color: 'bg-amber-400 text-black',
    cta: 'Launch tool',
  },
  link: {
    label: 'Resource',
    color: 'bg-violet-500 text-white',
    cta: 'Visit resource',
  },
} as const;

export function ResourceCard({
  resource,
  index = 0,
}: ResourceCardProps) {
  const style = typeStyles[resource.type];

  return (
    <motion.a
      href={resource.href}
      target={resource.external ? '_blank' : undefined}
      rel={resource.external ? 'noopener noreferrer' : undefined}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -6 }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card"
    >
      {resource.preview && (
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary">

          <img
            src={resource.preview}
            alt={resource.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-100"
          />

        </div>
      )}

      <div className="flex flex-1 flex-col p-7">        
         
        <h3 className="font-heading text-xl font-semibold leading-tight tracking-tight transition-colors duration-300 group-hover:text-primary">
          {resource.title}
        </h3>

        <p className="mt-4 line-clamp-3 flex-1 text-sm leading-7 text-muted-foreground">
          {resource.description}
        </p>

        <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium">

          <span>{style.cta}</span>

          <ArrowRight
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />

        </div>

      </div>
    </motion.a>
  );
}