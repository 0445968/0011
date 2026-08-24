'use client';

import type { BlogPost } from '@/data/blog';

import { RelatedArticleCard } from './RelatedArticleCard';
import { RelatedCarouselControls } from './RelatedCarouselControls';
import { getRelatedArticles } from './related-utils';
import { useRelatedCarousel } from './useRelatedCarousel';

interface RelatedArticlesCarouselProps {
  currentPost: BlogPost;
  posts: BlogPost[];
}

export function RelatedArticlesCarousel({
  currentPost,
  posts,
}: RelatedArticlesCarouselProps) {
  const relatedArticles =
    getRelatedArticles({
      currentPost,
      posts,
      limit: 20,
    });

  const {
    viewportRef,
    currentIndex,
    canScrollPrevious,
    canScrollNext,
    scrollPrevious,
    scrollNext,
  } = useRelatedCarousel(
    relatedArticles.length
  );

  if (!relatedArticles.length) {
    return null;
  }

  return (
    <section
      className="
        w-full
        py-16
        md:py-20
        lg:py-24
      "
    >
      {/* Header */}
      <div
        className="
          flex
          items-end
          justify-between
          gap-8
          border-b
          border-border
          pb-6
        "
      >
        <div>
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-muted-foreground
            "
          >
            Keep exploring
          </p>

          <h2
            className="
              mt-3
              max-w-4xl
              font-serif
              text-4xl
              font-semibold
              leading-[0.98]
              tracking-[-0.045em]
              text-foreground
              sm:text-5xl
              lg:text-6xl
            "
          >
            You may also like these
          </h2>
        </div>

        <div className="hidden sm:block">
          <RelatedCarouselControls
            currentIndex={
              currentIndex
            }
            total={
              relatedArticles.length
            }
            canScrollPrevious={
              canScrollPrevious
            }
            canScrollNext={
              canScrollNext
            }
            onPrevious={
              scrollPrevious
            }
            onNext={
              scrollNext
            }
          />
        </div>
      </div>

      {/* Mobile controls */}
      <div
        className="
          mt-5
          flex
          justify-end
          sm:hidden
        "
      >
        <RelatedCarouselControls
          currentIndex={
            currentIndex
          }
          total={
            relatedArticles.length
          }
          canScrollPrevious={
            canScrollPrevious
          }
          canScrollNext={
            canScrollNext
          }
          onPrevious={
            scrollPrevious
          }
          onNext={
            scrollNext
          }
        />
      </div>

      {/* Carousel */}
      <div
  ref={viewportRef}
  className="
    related-carousel-scrollbar
    mt-8
    flex
    w-full
    snap-x
    snap-mandatory
    gap-5
    overflow-x-auto
    overflow-y-hidden
    scroll-smooth
    pb-6
    pr-[12%]
    sm:pr-0
  "
>
        {relatedArticles.map(
          (
            relatedPost,
            index
          ) => (
            <div
              key={
                relatedPost.slug
              }
              data-related-card
              className="
                w-[88%]
                min-w-[88%]
                shrink-0
                snap-start

                sm:w-[calc(50%-0.625rem)]
                sm:min-w-[calc(50%-0.625rem)]

                lg:w-[calc(33.333%-0.875rem)]
                lg:min-w-[calc(33.333%-0.875rem)]

                xl:w-[calc(25%-0.9375rem)]
                xl:min-w-[calc(25%-0.9375rem)]
              "
            >
              <RelatedArticleCard
                post={
                  relatedPost
                }
                index={
                  index
                }
              />
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <div
        className="
          mt-3
          flex
          items-center
          justify-between
          gap-6
          border-t
          border-border
          pt-5
        "
      >
        <p
          className="
            text-xs
            text-muted-foreground
          "
        >
          More stories from across
          the Bivi Journal.
        </p>

        <p
          className="
            hidden
            text-[10px]
            font-medium
            uppercase
            tracking-[0.18em]
            text-muted-foreground
            md:block
          "
        >
          Swipe or scroll to explore
        </p>
      </div>
    </section>
  );
}