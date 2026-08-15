'use client';

import {
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';

import type { BlogPost } from '@/data/blog';

import { BlogCoverImage } from '@/components/blog/BlogCoverImage';

interface JournalCategorySectionProps {
  category: string;
  posts: BlogPost[];
  onViewMore: () => void;
  showAll?: boolean;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
  });
}

/* =========================================================
   TEXT ARTICLE
========================================================= */

function TextArticle({
  post,
}: {
  post: BlogPost;
}) {
  return (
    <a
      href={`/blog/${post.slug}`}
      className="
        group
        block
        border-b
        border-border
        py-6
        first:pt-0
      "
    >
      <h3
        className="
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
          text-[15px]
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

        <span>
          {formatDate(post.date)}
        </span>
      </div>
    </a>
  );
}

/* =========================================================
   VISUAL FEATURE
========================================================= */

function VisualFeature({
  post,
}: {
  post: BlogPost;
}) {
  return (
    <a
      href={`/blog/${post.slug}`}
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
          aspect-[4/3]
          overflow-hidden
          bg-secondary
        "
      >
        <BlogCoverImage
          src={post.cover}
          alt={post.title}
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

      {/* Content */}
      <div className="p-5 sm:p-6">
        {/* Category + reading time */}
        <div
          className="
            flex
            items-center
            gap-2
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.16em]
            text-accent
          "
        >
          <span>
            {post.category}
          </span>

          <span className="text-muted-foreground/40">
            /
          </span>

          <span className="text-muted-foreground">
            {post.readingTime}
          </span>
        </div>

        {/* Title */}
        <h3
          className="
            mt-3
            text-balance
            font-serif
            text-2xl
            font-semibold
            leading-[1.1]
            tracking-[-0.025em]
            transition-colors
            duration-300
            group-hover:text-accent
          "
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p
          className="
            mt-3
            line-clamp-3
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          {post.excerpt}
        </p>

        {/* Footer */}
        <div
          className="
            mt-5
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <div
            className="
              text-xs
              leading-5
              text-muted-foreground
            "
          >
            <p>
              {post.author}
            </p>

            <p>
              {formatDate(post.date)}
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
            <ArrowUpRight
              size={15}
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

/* =========================================================
   CATEGORY SECTION
========================================================= */

export function JournalCategorySection({
  category,
  posts,
  onViewMore,
  showAll = false,
}: JournalCategorySectionProps) {
  if (!posts.length) {
    return null;
  }

  /*
   * Default homepage layout:
   *
   * 0–3 → text articles
   * 4   → visual feature
   *
   * If there are fewer than five posts,
   * reuse the first post for the visual feature.
   */

  const textPosts = showAll
    ? posts
    : posts.slice(0, 4);

  const visualPost = showAll
    ? null
    : posts[4] ?? posts[0];

  const leftColumn =
    textPosts.filter(
      (_, index) =>
        index % 2 === 0
    );

  const rightColumn =
    textPosts.filter(
      (_, index) =>
        index % 2 === 1
    );

  return (
    <section
      className="
        mt-24
        md:mt-32
      "
    >
      {/* =====================================================
          SECTION HEADING
      ====================================================== */}

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
          {showAll
            ? 'Back to all articles'
            : `See more ${category.toLowerCase()} articles`}

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

      {/* =====================================================
          MOBILE ACTION
      ====================================================== */}

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
        {showAll
          ? 'Back to all articles'
          : `See more ${category.toLowerCase()} articles`}

        <ArrowRight
          size={14}
          className="
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
        />
      </button>

      {/* =====================================================
          FILTERED CATEGORY VIEW
      ====================================================== */}

      {showAll ? (
        <div
          className="
            grid
            gap-x-10
            md:grid-cols-2
          "
        >
          {leftColumn.length > 0 && (
            <div>
              {leftColumn.map(
                (post) => (
                  <TextArticle
                    key={post.id}
                    post={post}
                  />
                )
              )}
            </div>
          )}

          {rightColumn.length > 0 && (
            <div>
              {rightColumn.map(
                (post) => (
                  <TextArticle
                    key={post.id}
                    post={post}
                  />
                )
              )}
            </div>
          )}
        </div>
      ) : (
        /* =====================================================
           HOMEPAGE CATEGORY SECTION
        ====================================================== */

        <div
          className="
            grid
            gap-10
            lg:grid-cols-[1fr_1fr_0.82fr]
            lg:gap-12
          "
        >
          {/* Left text column */}
          <div>
            {leftColumn.map(
              (post) => (
                <TextArticle
                  key={post.id}
                  post={post}
                />
              )
            )}
          </div>

          {/* Middle text column */}
          <div>
            {rightColumn.map(
              (post) => (
                <TextArticle
                  key={post.id}
                  post={post}
                />
              )
            )}
          </div>

          {/* Right visual feature */}
          {visualPost && (
            <VisualFeature
              post={visualPost}
            />
          )}
        </div>
      )}
    </section>
  );
}