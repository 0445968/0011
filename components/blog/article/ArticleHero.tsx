import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

import type { BlogPost } from '@/data/blog';

import { BlogCoverImage } from '@/components/blog/BlogCoverImage';

import { ArticleListenBar } from './ArticleListenBar';

interface ArticleHeroProps {
  post: BlogPost;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ArticleHero({
  post,
}: ArticleHeroProps) {
  return (
    <section
      className="
        relative
        left-1/2
        w-screen
        -translate-x-1/2
      "
    >
      {/* =====================================================
          BLUE HERO
      ====================================================== */}

      <div className="relative">
        {/* Blue ends roughly 75% down the image */}
        <div
          aria-hidden="true"
          className="
            absolute
            inset-x-0
            top-0
            bottom-[60px]
            bg-[#1600a2]
            sm:bottom-[70px]
            md:bottom-[80px]
            lg:bottom-[88px]
            xl:bottom-[95px]
          "
        />

        <div
          className="
            container-page
            relative
            z-10
            pt-7
            sm:pt-8
            md:pt-10
            lg:pt-12
          "
        >
          {/* Top row */}
          <div
            className="
              flex
              items-center
              justify-between
              gap-6
            "
          >
            <Link
              href="/blog"
              className="
                group
                inline-flex
                items-center
                gap-2
                !text-white
                opacity-70
                transition-opacity
                duration-300
                hover:opacity-100
              "
            >
              <ArrowLeft
                size={15}
                strokeWidth={1.7}
                className="
                  transition-transform
                  duration-300
                  group-hover:-translate-x-1
                "
              />

              <span className="text-xs font-medium">
                Journal
              </span>
            </Link>

            <span
              className="
                !text-white
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.22em]
                opacity-65
              "
            >
              {post.category}
            </span>
          </div>

          {/* =================================================
              TITLE + DESCRIPTION
          ================================================== */}

          <div
            className="
              mt-10
              grid
              gap-8
              md:mt-12
              md:grid-cols-12
              md:items-end
              md:gap-10
            "
          >
            {/* Title */}
            <div className="md:col-span-8">
              <h1
                className="
                  max-w-[900px]
                  !text-white
                  text-balance
                  font-serif
                  text-[clamp(2.5rem,4.25vw,4.75rem)]
                  font-semibold
                  leading-[0.94]
                  tracking-[-0.05em]
                "
              >
                {post.title}
              </h1>
            </div>

            {/* Right column */}
            <div className="md:col-span-4">
              <p
                className="
                  max-w-md
                  !text-white
                  text-sm
                  leading-[1.65]
                  opacity-70
                  sm:text-[15px]
                "
              >
                {post.excerpt}
              </p>

              {/* Metadata */}
              <div
                className="
                  mt-6
                  grid
                  grid-cols-3
                  gap-x-5
                  border-t
                  border-white/25
                  pt-5
                "
              >
                <div className="min-w-0">
                  <MetaLabel>
                    Written by
                  </MetaLabel>

                  <MetaValue>
                    {post.author}
                  </MetaValue>
                </div>

                <div className="min-w-0">
                  <MetaLabel>
                    Published
                  </MetaLabel>

                  <MetaValue>
                    {formatDate(post.date)}
                  </MetaValue>
                </div>

                <div className="min-w-0">
                  <MetaLabel>
                    Reading
                  </MetaLabel>

                  <MetaValue>
                    {post.readingTime}
                  </MetaValue>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              IMAGE
          ================================================== */}

          <div
            className="
              relative
              mt-8
              h-[240px]
              w-full
              overflow-hidden
              rounded-2xl
              bg-white/10
              shadow-[0_18px_45px_rgba(0,0,0,0.12)]
              sm:h-[280px]
              md:mt-10
              md:h-[320px]
              md:rounded-3xl
              lg:h-[350px]
              xl:h-[380px]
            "
          >
            <BlogCoverImage
  src={post.cover}
  alt={post.title}
  priority
  sizes="100vw"
  className="
    object-cover
    object-center
  "
/>
          </div>
        </div>
      </div>

      {/* =====================================================
          AUDIO PLAYER
      ====================================================== */}

      <div
        className="
          container-page
          pt-3
        "
      >
        <ArticleListenBar
          title={post.title}
          excerpt={post.excerpt}
          content={post.content}
        />
      </div>
    </section>
  );
}

function MetaLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p
      className="
        whitespace-nowrap
        !text-white
        text-[8px]
        font-semibold
        uppercase
        tracking-[0.17em]
        opacity-55
        sm:text-[9px]
      "
    >
      {children}
    </p>
  );
}

function MetaValue({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p
      className="
        mt-1.5
        whitespace-nowrap
        !text-white
        text-[12px]
        font-medium
        leading-5
        sm:text-[13px]
      "
    >
      {children}
    </p>
  );
}