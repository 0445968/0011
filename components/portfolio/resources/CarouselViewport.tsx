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
      ref={containerRef}
      className="
        flex
        snap-x
        snap-mandatory
        gap-6
        overflow-x-auto
        scroll-smooth
        pb-6

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
            w-[85%]
            shrink-0
            snap-start

            sm:w-[65%]

            md:w-[46%]

            lg:w-[31%]

            xl:w-[calc((100%-72px)/4)]
          "
        >
          <ResourceCard resource={resource} />
        </div>
      ))}
    </div>
  );
}