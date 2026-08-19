'use client';

import type { RefObject } from 'react';
import type { Resource } from '@/data/resources';

import { ResourceCard } from './ResourceCard';

interface CarouselViewportProps {
  resources: Resource[];
  containerRef: RefObject<HTMLDivElement | null>;
}

export function CarouselViewport({
  resources,
  containerRef,
}: CarouselViewportProps) {
  return (
    <div
      ref={containerRef as RefObject<HTMLDivElement>}
      className="
        flex
        w-full
        snap-x
        snap-mandatory
        gap-5
        overflow-x-auto
        scroll-smooth

        pl-6
        pr-0
        pb-5

        scroll-pl-6

        md:gap-6
        md:pl-[max(2.5rem,calc((100vw-88rem)/2+2.5rem))]
        md:scroll-pl-[max(2.5rem,calc((100vw-88rem)/2+2.5rem))]

        [scrollbar-width:auto]

        [&::-webkit-scrollbar]:h-2
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-border
        [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40
      "
    >
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="
            w-[82vw]
            shrink-0
            snap-start

            sm:w-[58vw]

            md:w-[42vw]

            lg:w-[300px]

            xl:w-[280px]

            2xl:w-[300px]
          "
        >
          <ResourceCard resource={resource} />
        </div>
      ))}

      {/* Small breathing room after final card */}
      <div
        aria-hidden="true"
        className="
          w-6
          shrink-0
          md:w-10
        "
      />
    </div>
  );
}