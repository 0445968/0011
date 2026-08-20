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
        aspect-[4/5]
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
        className="
          relative
          block
          h-full
          w-full
        "
      >
        {/* Image */}
        <div
          className="
            absolute
            inset-0
            overflow-hidden
          "
        >
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
            pointer-events-none
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

            h-[118px]
            overflow-hidden

            rounded-t-3xl

            bg-gradient-to-b
            from-black
            via-[#071c49]
            to-[#0B65F3]

            px-5
            py-4
            text-white

            transition-[height]
            duration-500
            ease-[cubic-bezier(0.16,1,0.3,1)]

            group-hover:h-[218px]
          "
        >
          {/* Resource Type */}
          <span
            className="
              mb-2.5
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              border-[#BBFF1B]
              bg-transparent
              px-2.5
              py-1
              text-[9px]
              font-bold
              uppercase
              tracking-[0.13em]
              text-[#BBFF1B]
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
              overflow-hidden
              text-ellipsis
              whitespace-nowrap

              font-heading
              text-lg
              font-semibold
              leading-[1.15]
              tracking-tight
              text-white

              group-hover:overflow-visible
              group-hover:whitespace-normal
            "
          >
            {resource.title}
          </h3>

          {/* Hover Content */}
          <div
            className="
              max-h-0
              overflow-hidden
              opacity-0

              transition-all
              duration-300
              ease-out

              group-hover:max-h-[130px]
              group-hover:opacity-100
            "
          >
            {/* Description */}
            <p
              className="
                mt-3
                line-clamp-3
                text-sm
                leading-6
                text-white/70
              "
            >
              {resource.description}
            </p>

            {/* Footer */}
            <div
              className="
                mt-3
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
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#BBFF1B]
                  leading-none
                  text-black
                "
              >
                <ArrowUpRight
                  size={14}
                  strokeWidth={2}
                  className="
                    block
                    shrink-0
                  "
                />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}