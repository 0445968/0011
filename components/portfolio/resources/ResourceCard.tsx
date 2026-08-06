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
        className="block h-full"
      >
        {/* Image */}
        <div className="absolute inset-0">
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
                bg-muted
                text-sm
                text-muted-foreground
              "
            >
              Resource Preview
            </div>
          )}
        </div>


        {/* Bottom Gradient */}
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

    h-[220px]

    translate-y-[72px]

    rounded-t-3xl
    bg-background/95
    p-6
    backdrop-blur-md
    overflow-hidden

    transition-all
    duration-500
    ease-out

    group-hover:h-[290px]
    group-hover:translate-y-0
  "
>

          {/* Category */}
          {resource.category && (
            <span
              className="
                mb-3
                inline-flex
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
          <p
            className="
              mt-4
              line-clamp-3
              text-sm
              leading-7
              text-muted-foreground

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
              mt-5
              flex
              items-center
              justify-between
            "
          >
            <span
              className="
                text-sm
                font-medium
                text-muted-foreground
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