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
    <div className="container-page">
      <div
        ref={
          containerRef as RefObject<HTMLDivElement>
        }
        className="
          flex
          w-full
          snap-x
          snap-mandatory
          gap-5

          overflow-x-auto
          overflow-y-hidden

          scroll-smooth

          sm:gap-5
          md:gap-6

          [scrollbar-width:none]
          [-ms-overflow-style:none]

          [&::-webkit-scrollbar]:hidden
        "
      >
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="
              w-[82%]
              shrink-0
              snap-start

              sm:w-[48%]

              lg:w-[calc((100%_-_4.5rem)/4)]
            "
          >
            <ResourceCard
              resource={resource}
            />
          </div>
        ))}
      </div>
    </div>
  );
}