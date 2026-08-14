'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

import type { BlogPost } from '@/data/blog';

import { BlogCoverImage } from '@/components/blog/BlogCoverImage';

interface BlogCardProps {
  post: BlogPost;
  index?: number;
  featured?: boolean;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

export function BlogCard({
  post,
  index = 0,
  featured = false,
}: BlogCardProps) {
  if (featured) {
    return (
      <motion.a
        href={`/blog/${post.slug}`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{
          duration: 0.75,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="
          group
          grid
          gap-7
          border-b
          border-border
          pb-12
          md:grid-cols-12
          md:gap-10
          md:pb-16
        "
      >
        {/* Image */}
        <div
          className="
            relative
            overflow-hidden
            bg-secondary
            md:col-span-7
            lg:col-span-8
          "
        >
          <div className="aspect-[16/10] overflow-hidden md:aspect-[16/11]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <BlogCoverImage
              src={post.cover}
              alt={post.title}
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-[900ms]
                ease-[cubic-bezier(0.16,1,0.3,1)]
                group-hover:scale-[1.025]
              "
            />
          </div>

          <span
            className="
              absolute
              left-4
              top-4
              bg-background/95
              px-3
              py-2
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
              backdrop-blur
              md:left-5
              md:top-5
            "
          >
            {post.category}
          </span>
        </div>

        {/* Content */}
        <div
          className="
            flex
            flex-col
            md:col-span-5
            md:py-1
            lg:col-span-4
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-5
              text-xs
              uppercase
              tracking-[0.14em]
              text-muted-foreground
            "
          >
            <span>{formatDate(post.date)}</span>
            <span>{post.readingTime}</span>
          </div>

          <h2
            className="
              mt-6
              text-balance
              font-serif
              text-3xl
              font-semibold
              leading-[1.02]
              tracking-[-0.035em]
              sm:text-4xl
              md:text-[2.6rem]
              lg:text-[3rem]
            "
          >
            {post.title}
          </h2>

          <p
            className="
              mt-5
              max-w-md
              text-[15px]
              leading-7
              text-muted-foreground
            "
          >
            {post.excerpt}
          </p>

          <div
            className="
              mt-8
              flex
              items-end
              justify-between
              gap-6
              md:mt-auto
              md:pt-10
            "
          >
            <span
              className="
                text-sm
                font-medium
                underline-offset-4
                transition-colors
                duration-300
                group-hover:text-accent
              "
            >
              Read article
            </span>

            <span
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
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
                size={17}
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
      </motion.a>
    );
  }

  return (
    <motion.a
      href={`/blog/${post.slug}`}
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{
        duration: 0.55,
        delay: Math.min(index * 0.04, 0.2),
        ease: [0.16, 1, 0.3, 1],
      }}
      className="
        group
        grid
        gap-5
        border-b
        border-border
        py-8
        md:grid-cols-12
        md:items-start
        md:gap-6
        md:py-10
      "
    >
      {/* Number */}
      <div className="md:col-span-1">
        <span
          className="
            text-xs
            tabular-nums
            text-muted-foreground
          "
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Category + date */}
      <div className="md:col-span-2">
        <p
          className="
            text-[11px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-accent
          "
        >
          {post.category}
        </p>

        <p
          className="
            mt-2
            text-xs
            text-muted-foreground
          "
        >
          {formatDate(post.date)}
        </p>
      </div>

      {/* Article info */}
      <div className="md:col-span-6">
        <h3
          className="
            max-w-2xl
            text-balance
            font-serif
            text-2xl
            font-semibold
            leading-[1.08]
            tracking-[-0.025em]
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
            mt-3
            max-w-2xl
            text-sm
            leading-6
            text-muted-foreground
            md:pr-8
          "
        >
          {post.excerpt}
        </p>
      </div>

      {/* Read time + arrow */}
      <div
        className="
          flex
          items-center
          justify-between
          md:col-span-3
          md:h-full
          md:justify-end
          md:gap-8
        "
      >
        <span
          className="
            text-xs
            uppercase
            tracking-[0.14em]
            text-muted-foreground
          "
        >
          {post.readingTime}
        </span>

        <span
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
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
    </motion.a>
  );
}