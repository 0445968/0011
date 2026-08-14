'use client';

import type { Resource } from '@/data/resources';

import { CarouselViewport } from './CarouselViewport';
import { CarouselArrows } from './CarouselArrows';
import { useCarousel } from './useCarousel';

interface ResourceCarouselProps {
  resources: Resource[];
}

export function ResourceCarousel({
  resources,
}: ResourceCarouselProps) {
  const {
    containerRef,
    scrollNext,
    scrollPrevious,
    canScrollNext,
    canScrollPrevious,
  } = useCarousel();

  return (
    <div className="relative">
      {/* Controls */}
      <div className="mb-8 flex justify-end">
        <CarouselArrows
          onPrevious={scrollPrevious}
          onNext={scrollNext}
          canScrollPrevious={canScrollPrevious}
          canScrollNext={canScrollNext}
        />
      </div>

      {/* Cards */}
      <CarouselViewport
        resources={resources}
        containerRef={containerRef}
      />
    </div>
  );
}