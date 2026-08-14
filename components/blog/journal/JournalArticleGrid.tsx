'use client';

import { motion } from 'framer-motion';

import type { BlogPost } from '@/data/blog';

import { BlogCoverImage } from '@/components/blog/BlogCoverImage';

interface JournalArticleGridProps {
  posts: BlogPost[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
  });
}

export function JournalArticleGrid({
  posts,
}: JournalArticleGridProps) {
  if (!posts.length) return null;

  return (
    <section
      className="
        mt-10
        grid
        gap-x-5
        gap-y-10
        sm:grid-cols-2
        lg:grid-cols-4
      "
    >
      {posts.map((post, index) => (
        <motion.a
          key={post.id}
          href={`/blog/${post.slug}`}
          initial={{
            opacity: 0,
            y: 18,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: '-60px',
          }}
          transition={{
            duration: 0.55,
            delay: Math.min(index * 0.06, 0.18),
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            group
            block
          "
        >
          {/* Image preview */}
          <div
  className="
    relative
    aspect-[16/10]
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

          {/* Article info */}
          <div className="pt-4">
            <h3
              className="
                line-clamp-2
                text-balance
                text-[16px]
                font-semibold
                leading-[1.35]
                tracking-[-0.015em]
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
                line-clamp-3
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
                space-y-1
                text-xs
                text-muted-foreground
              "
            >
              <p>{post.author}</p>

              <p>{formatDate(post.date)}</p>
            </div>
          </div>
        </motion.a>
      ))}
    </section>
  );
}