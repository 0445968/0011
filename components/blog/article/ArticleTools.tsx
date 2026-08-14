'use client';

import { journalConfig } from '@/data/blog/journal-config';

import { ArticleShareButton } from './ArticleShareButton';
import { GoogleFollowButton } from './GoogleFollowButton';

interface ArticleToolsProps {
  title: string;
  excerpt: string;
}

export function ArticleTools({
  title,
  excerpt,
}: ArticleToolsProps) {
  return (
    <div
      className="
        overflow-visible
        rounded-2xl
        border
        border-border
        bg-background
        p-2
      "
    >
      <div
        className="
          px-3
          pb-3
          pt-2
        "
      >
        <p
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.2em]
            text-muted-foreground
          "
        >
          Article tools
        </p>
      </div>

      <div
        className="
          border-t
          border-border
          pt-1
        "
      >
        <ArticleShareButton
          title={title}
          excerpt={excerpt}
        />

        <div
          className="
            mx-3
            h-px
            bg-border
          "
        />

        <GoogleFollowButton
          href={
            journalConfig.googleFollowUrl
          }
        />
      </div>
    </div>
  );
}