import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import type { BlogPost } from '@/data/blog';

import { BlogCoverImage } from '@/components/blog/BlogCoverImage';

interface RelatedArticleCardProps {
  post: BlogPost;
  index: number;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function RelatedArticleCard({
  post,
  index,
}: RelatedArticleCardProps) {
  return (
    <article className="group min-w-0">
      <Link
        href={`/blog/${post.slug}`}
        className="block min-w-0"
      >
        {/* IMAGE */}
        <div
          className="
            relative
            aspect-[16/9]
            w-full
            overflow-hidden
            rounded-2xl
            bg-secondary
          "
        >
          <BlogCoverImage
  src={post.cover}
  alt={post.title}
  sizes="
    (max-width: 640px) 88vw,
    (max-width: 768px) 48vw,
    (max-width: 1024px) 32vw,
    25vw
  "
  className="
    object-cover
    object-center
    transition-transform
    duration-700
    ease-out
    group-hover:scale-[1.03]
  "
/>

          {/* Number */}
          <div
            className="
              absolute
              left-3
              top-3
              rounded-full
              border
              border-white/25
              bg-black/20
              px-2.5
              py-1
              text-[8px]
              font-medium
              tracking-[0.15em]
              text-white
              backdrop-blur-md
            "
          >
            {String(index + 1).padStart(2, '0')}
          </div>

          {/* Arrow */}
          <div
            className="
              absolute
              right-3
              top-3
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-background/90
              text-foreground
              backdrop-blur-md
              transition-all
              duration-300
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
            "
          >
            <ArrowUpRight
              size={15}
              strokeWidth={1.6}
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="pt-4">
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <span
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-[#0B65F3]
              "
            >
              {post.category}
            </span>

            <span
              className="
                shrink-0
                text-[10px]
                text-muted-foreground
              "
            >
              {post.readingTime}
            </span>
          </div>

          {/* Smaller headline */}
          <h3
            className="
              mt-2.5
              max-w-[95%]
              text-balance
              font-serif
              text-[1.2rem]
              font-semibold
              leading-[1.08]
              tracking-[-0.025em]
              text-foreground
              transition-colors
              duration-300
              group-hover:text-[#0B65F3]
              md:text-[1.3rem]
              xl:text-[1.4rem]
            "
          >
            {post.title}
          </h3>

          {/* Shorter description */}
          <p
            className="
              mt-3
              line-clamp-2
              text-[13px]
              leading-5
              text-muted-foreground
            "
          >
            {post.excerpt}
          </p>

          {/* Footer */}
          <div
            className="
              mt-4
              flex
              items-center
              gap-2.5
              text-[10px]
              text-muted-foreground
            "
          >
            <span>
              {formatDate(post.date)}
            </span>

            <span
              aria-hidden="true"
              className="
                h-[3px]
                w-[3px]
                rounded-full
                bg-muted-foreground/40
              "
            />

            <span>
              {post.author}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}