'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import type { BlogPost } from '@/data/blog';

export function BlogCard({
  post,
  index = 0,
  featured = false,
}: {
  post: BlogPost;
  index?: number;
  featured?: boolean;
}) {
  return (
    <motion.a
      href={`/blog/${post.slug}`}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card ${
        featured ? 'md:col-span-2 md:flex-row' : ''
      }`}
    >
      <div
        className={`relative w-full overflow-hidden bg-secondary ${
          featured ? 'aspect-[16/10] md:aspect-auto md:w-1/2' : 'aspect-[16/10]'
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.cover}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <div className={`flex flex-1 flex-col p-6 md:p-8 ${featured ? 'md:justify-center' : ''}`}>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold uppercase tracking-widest text-accent">
            {post.category}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{post.readingTime}</span>
        </div>
        <h3
          className={`mt-4 text-balance font-serif font-semibold leading-tight tracking-tight ${
            featured ? 'text-2xl md:text-3xl' : 'text-xl'
          }`}
        >
          {post.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <span className="text-xs text-muted-foreground">
            {new Date(post.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors group-hover:text-accent">
            Read
            {featured ? <ArrowRight size={14} /> : <ArrowUpRight size={14} />}
          </span>
        </div>
      </div>
    </motion.a>
  );
}
