'use client';

import { ChevronRight } from 'lucide-react';

import type { BlogPost } from '@/data/blog';

import { BlogCoverImage } from '@/components/blog/BlogCoverImage';

interface JournalTopicsProps {
  categories: string[];
  posts: BlogPost[];
  onSelect: (category: string) => void;
}

export function JournalTopics({
  categories,
  posts,
  onSelect,
}: JournalTopicsProps) {
  const visibleCategories = categories
    .filter((category) => category !== 'All')
    .slice(0, 3);

  return (
    <section
      className="
        mt-28
        border-t
        border-border
        pt-20
        md:mt-36
        md:pt-24
      "
    >
      {/* Heading */}
      <div className="text-center">
        <p
          className="
            text-[11px]
            font-semibold
            uppercase
            tracking-[0.2em]
            text-accent
          "
        >
          Browse the journal
        </p>

        <h2
          className="
            mt-3
            font-serif
            text-4xl
            font-medium
            tracking-[-0.04em]
            md:text-5xl
          "
        >
          Explore more topics
        </h2>

        <p
          className="
            mx-auto
            mt-4
            max-w-xl
            text-sm
            leading-6
            text-muted-foreground
            sm:text-base
          "
        >
          Explore more ideas across strategy, business,
          design, technology, and creative work.
        </p>
      </div>

      {/* Topics */}
      <div
        className="
          mx-auto
          mt-10
          grid
          max-w-5xl
          gap-6
          sm:grid-cols-2
          lg:grid-cols-3
        "
      >
        {visibleCategories.map((category) => {
          const representativePost = posts.find(
            (post) => post.category === category
          );

          if (!representativePost) {
            return null;
          }

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              className="
                group
                overflow-hidden
                rounded-2xl
                border
                border-border
                bg-card
                text-left
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-foreground/20
              "
            >
              {/* Image */}
<div
  className="
    relative
    aspect-[16/10]
    overflow-hidden
    bg-secondary
  "
>
  <BlogCoverImage
    src={representativePost.cover}
    alt={`${category} journal topic`}
    sizes="
      (max-width: 640px) 100vw,
      (max-width: 1024px) 50vw,
      33vw
    "
    className="
      object-cover
      object-center
      transition-transform
      duration-700
      ease-[cubic-bezier(0.16,1,0.3,1)]
      group-hover:scale-[1.04]
    "
  />
</div>

              {/* Label */}
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-5
                  px-5
                  py-4
                "
              >
                <div>
                  <p
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                      text-muted-foreground
                    "
                  >
                    Explore
                  </p>

                  <p
                    className="
                      mt-1
                      font-serif
                      text-xl
                      font-semibold
                      tracking-[-0.02em]
                    "
                  >
                    {category}
                  </p>
                </div>

                <span
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-border
                    transition-all
                    duration-300
                    group-hover:border-foreground
                    group-hover:bg-foreground
                    group-hover:text-background
                  "
                >
                  <ChevronRight
                    size={16}
                    strokeWidth={1.7}
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-0.5
                    "
                  />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}