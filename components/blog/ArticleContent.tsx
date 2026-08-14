'use client';

import { motion } from 'framer-motion';

import type { BlogBlock } from '@/data/blog';

interface ArticleContentProps {
  content?: BlogBlock[];
}

export function ArticleContent({
  content = [],
}: ArticleContentProps) {
  if (content.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-[760px]">
      <div className="space-y-7 md:space-y-8">
        {content.map((block, index) => (
          <ArticleBlock
            key={`${block.type}-${index}`}
            block={block}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

function ArticleBlock({
  block,
  index,
}: {
  block: BlogBlock;
  index: number;
}) {
  const animationProps = {
    initial: {
      opacity: 0,
      y: 16,
    },
    whileInView: {
      opacity: 1,
      y: 0,
    },
    viewport: {
      once: true,
      amount: 0.15,
    },
    transition: {
      duration: 0.55,
      delay: Math.min(index * 0.015, 0.12),
      ease: [0.16, 1, 0.3, 1] as const,
    },
  };

  switch (block.type) {
    case 'heading':
      return (
        <motion.h2
          {...animationProps}
          className="
            pt-8
            font-serif
            text-[2rem]
            font-medium
            leading-[1.08]
            tracking-[-0.035em]
            text-foreground
            sm:text-[2.35rem]
            md:pt-12
            md:text-[2.7rem]
          "
        >
          {block.text}
        </motion.h2>
      );

    case 'quote':
      return (
        <motion.blockquote
          {...animationProps}
          className="
            my-10
            border-l-2
            border-primary
            pl-6
            sm:my-12
            sm:pl-8
          "
        >
          <p
            className="
              font-serif
              text-[1.65rem]
              font-medium
              leading-[1.25]
              tracking-[-0.025em]
              text-foreground
              sm:text-[1.9rem]
              md:text-[2.1rem]
            "
          >
            {block.text}
          </p>
        </motion.blockquote>
      );

    case 'list':
      return (
        <motion.ul
          {...animationProps}
          className="
            my-8
            space-y-4
            border-y
            border-border
            py-7
            sm:my-10
            sm:py-8
          "
        >
          {block.items.map((item, itemIndex) => (
            <li
              key={`${item}-${itemIndex}`}
              className="
                grid
                grid-cols-[28px_1fr]
                gap-3
                text-[1.05rem]
                leading-[1.75]
                text-foreground/80
                sm:grid-cols-[32px_1fr]
                sm:text-[1.1rem]
              "
            >
              <span
                aria-hidden="true"
                className="
                  pt-[2px]
                  font-mono
                  text-xs
                  text-muted-foreground
                "
              >
                {String(itemIndex + 1).padStart(2, '0')}
              </span>

              <span>{item}</span>
            </li>
          ))}
        </motion.ul>
      );

    case 'paragraph':
    default:
      return (
        <motion.p
          {...animationProps}
          className="
            text-[1.075rem]
            leading-[1.82]
            tracking-[-0.008em]
            text-foreground/80
            sm:text-[1.125rem]
            md:text-[1.16rem]
          "
        >
          {block.text}
        </motion.p>
      );
  }
}