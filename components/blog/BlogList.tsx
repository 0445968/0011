'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { blogPosts, blogCategories } from '@/data/blog';
import { BlogCard } from './BlogCard';

export function BlogList() {
  const [active, setActive] = useState('All');
  const filtered =
    active === 'All'
      ? blogPosts
      : blogPosts.filter((p) => p.category === active);

  return (
    <div className="min-h-screen pt-28 md:pt-32">
      <div className="container-page">
        <a
          href="/"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft
            size={16}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          Back home
        </a>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-3xl"
        >
          <span className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="h-px w-8 bg-accent" />
            Journal
          </span>
          <h1 className="mt-6 text-balance font-serif text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
            Notes on craft &amp; process.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Essays on design, engineering, and the details that separate work
            that endures from work that simply ships.
          </p>
        </motion.div>

        <div className="mt-12 flex flex-wrap gap-2">
          {blogCategories.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <motion.div layout className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center">
            <p className="font-serif text-xl text-muted-foreground">
              No articles in this category yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
