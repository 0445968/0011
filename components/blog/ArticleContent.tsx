'use client';

import { motion } from 'framer-motion';
import type { BlogBlock } from '@/data/blog';

export function ArticleContent({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <motion.h2
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="pt-4 font-serif text-2xl font-semibold leading-tight tracking-tight sm:text-3xl"
            >
              {block.text}
            </motion.h2>
          );
        }
        if (block.type === 'quote') {
          return (
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="border-l-2 border-accent py-2 pl-6"
            >
              <p className="font-serif text-xl italic leading-relaxed text-foreground/90 sm:text-2xl">
                &ldquo;{block.text}&rdquo;
              </p>
            </motion.blockquote>
          );
        }
        if (block.type === 'list') {
          return (
            <motion.ul
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3 pl-1"
            >
              {block.items?.map((item, j) => (
                <li key={j} className="flex gap-3 text-base leading-relaxed text-foreground/90">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </motion.ul>
          );
        }
        return (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-base leading-relaxed text-foreground/90 sm:text-lg"
          >
            {block.text}
          </motion.p>
        );
      })}
    </div>
  );
}
