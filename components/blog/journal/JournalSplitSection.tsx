'use client';

import { ArrowRight, ArrowUpRight } from 'lucide-react';

import type { BlogPost } from '@/data/blog';

import { BlogCoverImage } from '@/components/blog/BlogCoverImage';

interface JournalSplitSectionProps {
  category: string;
  posts: BlogPost[];
  onViewMore: () => void;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
  });
}

function FeaturedArticle({
  post,
}: {
  post: BlogPost;
}) {
  return (
    <a
      href={`/blog/${post.slug}`}
      className="group block"
    >
      {/* Image */}
<div
  className="
    relative
    aspect-[16/10]
    overflow-hidden
    rounded-2xl
    bg-secondary
  "
>
  <BlogCoverImage
    src={post.cover}
    alt={post.title}
    sizes="
      (max-width: 768px) 100vw,
      50vw
    "
    className="
      object-cover
      object-center
      transition-transform
      duration-700
      ease-[cubic-bezier(0.16,1,0.3,1)]
      group-hover:scale-[1.035]
    "
  />
</div>

      {/* Content */}
      <div className="pt-5">
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.16em]
            text-accent
          "
        >
          <span>{post.category}</span>

          <span className="text-muted-foreground/40">
            /
          </span>

          <span className="text-muted-foreground">
            {post.readingTime}
          </span>
        </div>

        <h3
          className="
            mt-3
            max-w-2xl
            text-balance
            font-serif
            text-2xl
            font-semibold
            leading-[1.08]
            tracking-[-0.03em]
            transition-colors
            duration-300
            group-hover:text-accent
            sm:text-3xl
          "
        >
          {post.title}
        </h3>

        <p
          className="
            mt-4
            max-w-2xl
            text-[15px]
            leading-6
            text-muted-foreground
          "
        >
          {post.excerpt}
        </p>

        <div
          className="
            mt-5
            flex
            items-center
            justify-between
            gap-6
          "
        >
          <div
            className="
              flex
              flex-wrap
              items-center
              gap-x-3
              gap-y-1
              text-xs
              text-muted-foreground
            "
          >
            <span>{post.author}</span>

            <span
              aria-hidden="true"
              className="
                h-1
                w-1
                rounded-full
                bg-muted-foreground/30
              "
            />

            <span>{formatDate(post.date)}</span>
          </div>

          <span
            className="
              flex
              h-10
              w-10
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
            <ArrowUpRight
              size={16}
              strokeWidth={1.6}
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
    </a>
  );
}

function ArticleRow({
  post,
  index,
}: {
  post: BlogPost;
  index: number;
}) {
  return (
    <a
      href={`/blog/${post.slug}`}
      className="
        group
        grid
        grid-cols-[30px_1fr_auto]
        gap-4
        border-b
        border-border
        py-6
        first:pt-0
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

      {/* Article info */}
      <div className="min-w-0">
        <h3
          className="
            max-w-xl
            text-[16px]
            font-semibold
            leading-[1.4]
            tracking-[-0.01em]
            transition-colors
            duration-300
            group-hover:text-accent
          "
        >
          {post.title}
        </h3>

        <p
          className="
            mt-3
            line-clamp-2
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          {post.excerpt}
        </p>

        <div
          className="
            mt-4
            flex
            flex-wrap
            items-center
            gap-x-3
            gap-y-1
            text-xs
            text-muted-foreground
          "
        >
          <span>{post.author}</span>

          <span
            aria-hidden="true"
            className="
              h-1
              w-1
              rounded-full
              bg-muted-foreground/30
            "
          />

          <span>{post.readingTime}</span>

          <span
            aria-hidden="true"
            className="
              h-1
              w-1
              rounded-full
              bg-muted-foreground/30
            "
          />

          <span>{formatDate(post.date)}</span>
        </div>
      </div>

      {/* Arrow */}
      <ArrowUpRight
        size={16}
        strokeWidth={1.5}
        className="
          mt-1
          text-muted-foreground
          transition-all
          duration-300
          group-hover:-translate-y-0.5
          group-hover:translate-x-0.5
          group-hover:text-foreground
        "
      />
    </a>
  );
}

export function JournalSplitSection({
  category,
  posts,
  onViewMore,
}: JournalSplitSectionProps) {
  if (!posts.length) {
    return null;
  }

  const feature = posts[0];
  const listPosts = posts.slice(1, 6);

  return (
    <section
      className="
        mt-24
        md:mt-32
      "
    >
      {/* Heading */}
      <div
        className="
          mb-8
          flex
          items-end
          gap-5
        "
      >
        <h2
          className="
            shrink-0
            font-serif
            text-4xl
            font-medium
            leading-none
            tracking-[-0.04em]
            md:text-5xl
          "
        >
          {category}
        </h2>

        <span
          aria-hidden="true"
          className="
            mb-2
            hidden
            h-[2px]
            flex-1
            bg-accent
            md:block
          "
        />

        <button
          type="button"
          onClick={onViewMore}
          className="
            group
            mb-1
            ml-auto
            hidden
            shrink-0
            items-center
            gap-2
            border-b-2
            border-accent
            pb-1
            text-sm
            font-semibold
            transition-colors
            duration-300
            hover:text-accent
            sm:inline-flex
          "
        >
          See more {category.toLowerCase()} articles

          <ArrowRight
            size={14}
            strokeWidth={1.7}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        </button>
      </div>

      {/* Mobile action */}
      <button
        type="button"
        onClick={onViewMore}
        className="
          group
          mb-7
          inline-flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-muted-foreground
          transition-colors
          hover:text-foreground
          sm:hidden
        "
      >
        See more {category.toLowerCase()} articles

        <ArrowRight
          size={14}
          className="
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
        />
      </button>

      {/* Content */}
      <div
        className="
          grid
          gap-12
          lg:grid-cols-[1.08fr_0.92fr]
          lg:gap-14
        "
      >
        {/* Large feature */}
        <FeaturedArticle post={feature} />

        {/* Article list */}
        <div>
          {listPosts.length > 0 ? (
            listPosts.map((post, index) => (
              <ArticleRow
                key={post.id}
                post={post}
                index={index}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              More articles coming soon.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}