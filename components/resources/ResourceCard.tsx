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
      transition={{
        duration: 0.6,
        delay: (index % 6) * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="
        group
        flex
        flex-col
        overflow-hidden
        rounded-2xl
        bg-[#BBFF1B]
        text-black
      "
    >
      {/* Preview */}
      {resource.preview && (
        <div
          className="
            relative
            aspect-[16/9]
            w-full
            overflow-hidden
            bg-black/10
          "
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resource.preview}
            alt={resource.title}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-700
              ease-out
              group-hover:scale-[1.04]
            "
          />
        </div>
      )}

      {/* Content */}
      <div
        className="
          flex
          flex-1
          flex-col
          p-6
        "
      >
        {/* Resource type */}
        <div className="flex items-center justify-between gap-3">
          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-black
              px-3
              py-1.5
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-[#BBFF1B]
            "
          >
            <Icon size={13} />
            {cfg.label}
          </span>
        </div>

        {/* Title */}
        <h3
          className="
            mt-4
            font-heading
            text-lg
            font-semibold
            leading-tight
            tracking-tight
            text-black
          "
        >
          {resource.title}
        </h3>

        {/* Description */}
        <p
          className="
            mt-2
            flex-1
            text-sm
            leading-relaxed
            text-black/70
          "
        >
          {resource.description}
        </p>

        {/* Tags */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {resource.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="
                rounded-full
                bg-black/10
                px-2.5
                py-1
                text-xs
                font-medium
                text-black/75
              "
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div
          className="
            mt-6
            flex
            items-center
            justify-between
            border-t
            border-black/15
            pt-5
          "
        >
          <span className="text-xs text-black/60">
            {resource.category}
          </span>

          <span
            className="
              inline-flex
              items-center
              gap-1.5
              text-sm
              font-semibold
              text-black
              transition-transform
              duration-300
              group-hover:translate-x-0.5
            "
          >
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