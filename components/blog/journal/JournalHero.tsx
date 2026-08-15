'use client';

import { motion } from 'framer-motion';

import type { BlogPost } from '@/data/blog';

import { BlogCoverImage } from '@/components/blog/BlogCoverImage';

interface JournalHeroProps {
  leadPost: BlogPost;
  featuredPosts: BlogPost[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
  });
}

export function JournalHero({
  leadPost,
  featuredPosts,
}: JournalHeroProps) {
  return (
    <section
      className="
        grid
        gap-10
        pt-10
        lg:grid-cols-[1.18fr_0.88fr]
        lg:gap-12
      "
    >
      {/* ------------------------------------------------------------------ */}
      {/* Main feature                                                       */}
      {/* ------------------------------------------------------------------ */}

      <motion.a
        href={`/blog/${leadPost.slug}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.7,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="
          group
          block
          overflow-hidden
          rounded-2xl
          bg-secondary/45
        "
      >
        {/* Image */}
<div
  className="
    relative
    aspect-[16/9]
    overflow-hidden
    bg-secondary
  "
>
  <BlogCoverImage
    src={leadPost.cover}
    alt={leadPost.title}
    priority
    sizes="
      (max-width: 1024px) 100vw,
      58vw
    "
    className="
      object-cover
      object-center
      transition-transform
      duration-700
      ease-[cubic-bezier(0.16,1,0.3,1)]
      group-hover:scale-[1.025]
    "
  />
</div>

        {/* Content */}
        <div
          className="
            px-6
            py-7
            sm:px-7
            sm:py-8
            md:px-8
          "
        >
          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-accent
            "
          >
            <span>{leadPost.category}</span>

            <span className="text-muted-foreground/40">
              /
            </span>

            <span className="text-muted-foreground">
              {leadPost.readingTime}
            </span>
          </div>

          <h2
            className="
              mt-4
              max-w-3xl
              text-balance
              font-serif
              text-2xl
              font-semibold
              leading-[1.08]
              tracking-[-0.03em]
              sm:text-3xl
              md:text-[2rem]
              lg:text-[2.15rem]
            "
          >
            {leadPost.title}
          </h2>

          <p
            className="
              mt-4
              max-w-2xl
              text-sm
              leading-6
              text-muted-foreground
              sm:text-[15px]
              sm:leading-7
            "
          >
            {leadPost.excerpt}
          </p>

          <div
            className="
              mt-7
              flex
              flex-wrap
              items-center
              gap-x-5
              gap-y-2
              text-sm
              text-muted-foreground
            "
          >
            <span>{leadPost.author}</span>

            <span
              aria-hidden="true"
              className="
                h-1
                w-1
                rounded-full
                bg-muted-foreground/35
              "
            />

            <span>{formatDate(leadPost.date)}</span>
          </div>
        </div>
      </motion.a>

      {/* ------------------------------------------------------------------ */}
      {/* Featured posts                                                     */}
      {/* ------------------------------------------------------------------ */}

      <motion.aside
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.7,
          delay: 0.08,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/* Heading */}
        <div
          className="
            flex
            items-center
            justify-between
            gap-5
            border-b-2
            border-accent
            pb-3
          "
        >
          <h2
            className="
              text-base
              font-semibold
              tracking-[-0.015em]
              sm:text-lg
            "
          >
            Featured Posts
          </h2>

          <span
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-[0.16em]
              text-muted-foreground
            "
          >
            Editor&apos;s picks
          </span>
        </div>

        {/* Posts */}
        <div>
          {featuredPosts.map((post, index) => (
            <a
              key={post.id}
              href={`/blog/${post.slug}`}
              className="
                group
                grid
                grid-cols-[24px_1fr]
                gap-3
                border-b
                border-border
                py-5
                transition-colors
                duration-300
                hover:bg-secondary/20
                sm:grid-cols-[28px_1fr]
                sm:gap-4
              "
            >
              {/* Number */}
              <span
                className="
                  pt-[3px]
                  text-[10px]
                  font-medium
                  tabular-nums
                  text-muted-foreground/55
                "
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Article */}
              <div className="min-w-0">
                <h3
                  className="
                    max-w-xl
                    text-[14px]
                    font-semibold
                    leading-[1.4]
                    tracking-[-0.012em]
                    transition-colors
                    duration-300
                    group-hover:text-accent
                    sm:text-[15px]
                  "
                >
                  {post.title}
                </h3>

                <div
                  className="
                    mt-3
                    flex
                    items-center
                    justify-between
                    gap-5
                    text-xs
                    text-muted-foreground
                  "
                >
                  <span className="truncate">
                    {post.author}
                  </span>

                  <span className="shrink-0">
                    {formatDate(post.date)}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Fallback */}
        {featuredPosts.length === 0 && (
          <div
            className="
              border-b
              border-border
              py-10
            "
          >
            <p
              className="
                text-sm
                text-muted-foreground
              "
            >
              More featured articles coming soon.
            </p>
          </div>
        )}
      </motion.aside>
    </section>
  );
}