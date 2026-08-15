import type { ReactNode } from 'react';

import type { BlogPost } from '@/data/blog';

import { ArticleMeta } from './ArticleMeta';
import { ArticleTools } from './ArticleTools';
import { ArticleAdRail } from './ArticleAdRail';

interface ArticleBodyLayoutProps {
  post: BlogPost;
  children: ReactNode;
}

export function ArticleBodyLayout({
  post,
  children,
}: ArticleBodyLayoutProps) {
  return (
    <section
      className="
        grid
        gap-12
        border-b
        border-border
        py-16
        md:py-20
        lg:grid-cols-12
        lg:gap-x-8
        lg:py-28
        xl:gap-x-10
      "
    >
      {/* ===================================================
          LEFT META RAIL
      ==================================================== */}

      <aside
        className="
          lg:col-span-2
        "
      >
        <div
          className="
            lg:sticky
            lg:top-28
          "
        >
          <ArticleMeta post={post} />
        </div>
      </aside>

      {/* ===================================================
          ARTICLE
      ==================================================== */}

      <div
        className="
          min-w-0
          lg:col-span-7
        "
      >
        {children}

        <ArticleTags tags={post.tags} />
      </div>

      {/* ===================================================
          RIGHT RAIL
      ==================================================== */}

      <aside
        className="
          lg:col-span-3
        "
      >
        <div className="space-y-10">
          {/* Sticky article tools */}
          <div
            className="
              lg:sticky
              lg:top-28
              lg:z-10
            "
          >
            <ArticleTools
              title={post.title}
              excerpt={post.excerpt}
            />
          </div>

          {/* Ads scroll naturally */}
          <ArticleAdRail />
        </div>
      </aside>
    </section>
  );
}

/* =========================================================
   TAGS
========================================================= */

function ArticleTags({
  tags,
}: {
  tags: string[];
}) {
  if (!tags?.length) {
    return null;
  }

  return (
    <div
      className="
        mx-auto
        mt-20
        max-w-[760px]
        border-t
        border-border
        pt-7
        md:mt-24
      "
    >
      <p
        className="
          mb-5
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.2em]
          text-muted-foreground
        "
      >
        Filed under
      </p>

      <div
        className="
          flex
          flex-wrap
          gap-2
        "
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="
              rounded-full
              border
              border-border
              px-4
              py-2
              text-xs
              font-medium
              text-muted-foreground
              transition-colors
              duration-300
              hover:border-foreground
              hover:text-foreground
            "
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}