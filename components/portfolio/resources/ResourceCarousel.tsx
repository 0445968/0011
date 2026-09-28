'use client';

import {
  ArrowUpRight,
} from 'lucide-react';

import type {
  Resource,
} from '@/data/resources';

import {
  CarouselArrows,
} from './CarouselArrows';

import {
  CarouselViewport,
} from './CarouselViewport';

import {
  useCarousel,
} from './useCarousel';

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
      {/* ============================================================ */}
      {/* Desktop controls                                             */}
      {/* ============================================================ */}

      <div
        className="
          container-page
          hidden
          sm:block
        "
      >
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
            onPrevious={
              scrollPrevious
            }
            onNext={
              scrollNext
            }
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
                border-b
                border-foreground
                pb-1
                text-sm
                font-semibold
                text-foreground
                transition-colors
                duration-200
                hover:border-[#0B65F3]
                hover:text-[#0B65F3]
              "
            >
              Browse all resources

              <ArrowUpRight
                className="
                  h-4
                  w-4
                  shrink-0
                "
                strokeWidth={2}
              />
            </a>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Carousel                                                     */}
      {/* ============================================================ */}

      <CarouselViewport
        resources={
          resources
        }
        containerRef={
          containerRef
        }
      />

      {/* ============================================================ */}
      {/* Pagination                                                   */}
      {/* ============================================================ */}

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
          length:
            pageCount,
        }).map(
          (
            _,
            index
          ) => {
            const isActive =
              index ===
              currentPage;

            return (
              <button
                key={
                  index
                }
                type="button"
                onClick={() =>
                  scrollToPage(
                    index
                  )
                }
                aria-label={`Go to resource page ${
                  index + 1
                }`}
                aria-current={
                  isActive
                    ? 'true'
                    : undefined
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
                        ? `
                          w-12
                          bg-foreground
                        `
                        : `
                          w-2
                          bg-muted-foreground/30
                        `
                    }
                  `}
                />
              </button>
            );
          }
        )}
      </div>

      {/* ============================================================ */}
      {/* Mobile browse all                                            */}
      {/* ============================================================ */}

      <div
        className="
          mt-8
          flex
          justify-center
          sm:hidden
        "
      >
        <a
          href="/resources"
          className="
            group
            inline-flex
            items-center
            gap-2
            border-b
            border-foreground
            pb-1
            text-sm
            font-semibold
            text-foreground
            transition-colors
            duration-200
            active:border-[#0B65F3]
            active:text-[#0B65F3]
          "
        >
          Browse all resources

          <ArrowUpRight
            className="
              h-4
              w-4
              shrink-0
            "
            strokeWidth={
              2
            }
          />
        </a>
      </div>
    </div>
  );
}