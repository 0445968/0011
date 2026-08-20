'use client';

import { ArrowRight } from 'lucide-react';

import type { Resource } from '@/data/resources';

import { CarouselArrows } from './CarouselArrows';
import { CarouselViewport } from './CarouselViewport';
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
    scrollToPage,
    canScrollNext,
    canScrollPrevious,
    currentPage,
    pageCount,
  } = useCarousel();

  return (
    <div className="relative">
      {/* Top Controls */}
      <div className="container-page">
        <div
          className="
            mb-6
            grid
            grid-cols-[1fr_auto_1fr]
            items-center
            gap-4
          "
        >
          {/* Empty left column */}
          <div />

          {/* Centered arrows */}
          <CarouselArrows
            onPrevious={scrollPrevious}
            onNext={scrollNext}
            canScrollPrevious={
              canScrollPrevious
            }
            canScrollNext={
              canScrollNext
            }
          />

          {/* Browse all */}
          <div
            className="
              flex
              justify-end
            "
          >
            <a
              href="/resources"
              className="
                group
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-border
                bg-card
                px-5
                py-3
                text-sm
                font-medium
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-primary/40
              "
            >
              <span className="hidden sm:inline">
                Browse all resources
              </span>

              <span className="sm:hidden">
                Browse all
              </span>

              <ArrowRight
                size={15}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </a>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <CarouselViewport
        resources={resources}
        containerRef={containerRef}
      />

      {/* Pagination */}
      <div
        className="
          mt-7
          flex
          items-center
          justify-center
          gap-3
        "
      >
        {Array.from({
          length: pageCount,
        }).map((_, index) => {
          const isActive =
            index === currentPage;

          return (
            <button
              key={index}
              type="button"
              onClick={() =>
                scrollToPage(index)
              }
              aria-label={`Go to resource page ${
                index + 1
              }`}
              aria-current={
                isActive ? 'true' : undefined
              }
              className="
                flex
                h-6
                items-center
                justify-center
              "
            >
              <span
                className={`
                  block
                  h-2
                  rounded-full
                  transition-all
                  duration-500
                  ease-[cubic-bezier(0.16,1,0.3,1)]

                  ${
                    isActive
                      ? 'w-12 bg-foreground'
                      : 'w-2 bg-muted-foreground/30'
                  }
                `}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}