'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import type { Resource } from '@/data/resources';

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({
  resource,
}: ResourceCardProps) {
  return (
    <article
      className="
        group
        h-full
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
          flex
          h-full
          flex-col
        "
      >
        {/* Image */}
        <div
          className="
            relative
            aspect-[16/10]
            overflow-hidden
            bg-muted
          "
        >
          {resource.image ? (
            <Image
              src={resource.image}
              alt={resource.title}
              fill
              sizes="
                (max-width: 768px) 90vw,
                (max-width: 1280px) 45vw,
                25vw
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
                text-sm
                text-muted-foreground
              "
            >
              Resource Preview
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className="
            flex
            flex-1
            flex-col
            p-6
          "
        >
          {/* Category */}
          {resource.category && (
            <span
              className="
                mb-4
                w-fit
                rounded-full
                bg-muted
                px-3
                py-1
                text-xs
                font-medium
                text-muted-foreground
              "
            >
              {resource.category}
            </span>
          )}

          {/* Title */}
          <h3
            className="
              font-heading
              text-xl
              font-semibold
              leading-tight
              tracking-tight
            "
          >
            {resource.title}
          </h3>

          {/* Description */}
          {resource.description && (
            <p
              className="
                mt-3
                line-clamp-3
                text-sm
                leading-7
                text-muted-foreground
              "
            >
              {resource.description}
            </p>
          )}

          {/* Footer */}
          <div
            className="
              mt-auto
              flex
              items-center
              justify-between
              pt-8
            "
          >
            <span
              className="
                text-sm
                font-medium
                text-muted-foreground
                transition-colors
                duration-300
                group-hover:text-foreground
              "
            >
              View resource
            </span>

            <span
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-border
                transition-all
                duration-300

                group-hover:border-primary/40
                group-hover:bg-primary
                group-hover:text-primary-foreground
              "
            >
              <ArrowUpRight
                size={16}
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