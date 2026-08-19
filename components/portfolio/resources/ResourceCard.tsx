'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowUpRight,
  BookOpen,
  ExternalLink,
  FileText,
  Wrench,
} from 'lucide-react';

import type { Resource } from '@/data/resources';

interface ResourceCardProps {
  resource: Resource;
}

const typeConfig: Record<
  Resource['type'],
  {
    label: string;
    icon: typeof FileText;
  }
> = {
  article: {
    label: 'Article',
    icon: BookOpen,
  },
  guide: {
    label: 'Guide',
    icon: FileText,
  },
  tool: {
    label: 'Tool',
    icon: Wrench,
  },
  link: {
    label: 'Link',
    icon: ExternalLink,
  },
};

export function ResourceCard({
  resource,
}: ResourceCardProps) {
  const preview =
    resource.previewVertical ??
    resource.previewHorizontal ??
    resource.preview;

  const type = typeConfig[resource.type];
  const TypeIcon = type.icon;

  return (
    <article
      className="
        group
        relative
        aspect-[3/4]
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-card
        transition-all
        duration-500
        hover:-translate-y-1
        hover:border-primary/30
      "
    >
      <Link
        href={resource.href}
        className="block h-full"
      >
        {/* Image */}
        <div className="absolute inset-0">
          {preview ? (
            <Image
              src={preview}
              alt={resource.title}
              fill
              sizes="
                (max-width: 640px) 82vw,
                (max-width: 768px) 58vw,
                (max-width: 1024px) 42vw,
                300px
              "
              className="
                object-cover
                transition-transform
                duration-700
                group-hover:scale-105
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                items-center
                justify-center
                bg-muted
                text-sm
                text-muted-foreground
              "
            >
              Resource Preview
            </div>
          )}
        </div>

        {/* Bottom image gradient */}
        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-1/2
            bg-gradient-to-t
            from-black/60
            via-black/20
            to-transparent
          "
        />

        {/* Content Panel */}
        <div
          className="
            absolute
            inset-x-0
            bottom-0

            h-[200px]
            translate-y-[64px]

            overflow-hidden
            rounded-t-3xl

            bg-gradient-to-br
            from-[#0B65F3]
            to-[#1600A2]

            p-5
            text-white

            transition-all
            duration-500
            ease-out

            group-hover:h-[275px]
            group-hover:translate-y-0
          "
        >
          {/* Resource Type */}
          <span
            className="
              mb-3
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-[#BBFF1B]
              px-2.5
              py-1
              text-[9px]
              font-bold
              uppercase
              tracking-[0.13em]
              text-black
            "
          >
            <TypeIcon
              size={11}
              strokeWidth={2}
            />

            {type.label}
          </span>

          {/* Title */}
          <h3
            className="
              font-heading
              text-lg
              font-semibold
              leading-[1.15]
              tracking-tight
              text-white
            "
          >
            {resource.title}
          </h3>

          {/* Description */}
          <p
            className="
              mt-3
              line-clamp-3
              text-sm
              leading-6
              text-white/70

              opacity-0

              transition-opacity
              duration-300
              delay-100

              group-hover:opacity-100
            "
          >
            {resource.description}
          </p>

          {/* Footer */}
          <div
            className="
              mt-4
              flex
              items-center
              justify-between
            "
          >
            <span
              className="
                text-xs
                font-medium
                text-white/70
              "
            >
              View resource
            </span>

            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-[#BBFF1B]
                text-black

                transition-transform
                duration-300

                group-hover:scale-105
              "
            >
              <ArrowUpRight
                size={14}
                className="
                  transition-transform
                  duration-300
                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5
                "
              />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}