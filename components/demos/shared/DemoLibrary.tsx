'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search as SearchIcon, X, Tag, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/portfolio/Reveal';
import { DemoCard } from './DemoCard';
import {
  demos as allDemos,
  demoCategories,
  allDemoTags,
  type DemoCategory,
} from '@/data/demos/registry';

type FilterCategory = 'all' | DemoCategory;

export function DemoLibrary() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] =
    useState<FilterCategory>('all');
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setQuery('');
    setActiveCategory('all');
    setActiveTags(new Set());
  }, []);

  const filteredDemos = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allDemos.filter((d) => {
      if (
        activeCategory !== 'all' &&
        d.category !== activeCategory
      ) {
        return false;
      }
      if (activeTags.size > 0) {
        const hasAllTags = Array.from(activeTags).every((t) =>
          d.tags.some(
            (dt) => dt.toLowerCase() === t.toLowerCase()
          )
        );
        if (!hasAllTags) return false;
      }
      if (q) {
        const haystack = (
          d.title +
          ' ' +
          d.productName +
          ' ' +
          d.shortDescription +
          ' ' +
          d.category +
          ' ' +
          d.tags.join(' ') +
          ' ' +
          d.technologies.join(' ')
        ).toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [query, activeCategory, activeTags]);

  const hasFilters =
    query ||
    activeCategory !== 'all' ||
    activeTags.size > 0;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allDemos.length };
    for (const cat of demoCategories) {
      counts[cat] = allDemos.filter(
        (d) => d.category === cat
      ).length;
    }
    return counts;
  }, []);

  return (
    <section className="section-spacing relative">
      <div className="container-page">
        {/* Search bar */}
        <Reveal>
          <div className="relative max-w-2xl">
            <SearchIcon
              size={20}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search demos by name, tag, or technology..."
              className="w-full rounded-2xl border border-border bg-card py-4 pl-14 pr-12 text-lg text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </Reveal>

        {/* Category filters */}
        <Reveal delay={0.08}>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="mr-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Filter size={12} />
              Category
            </span>
            <CategoryPill
              label="All"
              active={activeCategory === 'all'}
              count={categoryCounts.all}
              onClick={() => setActiveCategory('all')}
            />
            {demoCategories.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                active={activeCategory === cat}
                count={categoryCounts[cat] ?? 0}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>
        </Reveal>

        {/* Tag filters */}
        <Reveal delay={0.12}>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Tag size={12} />
              Tags
            </span>
            {allDemoTags.map((tag) => {
              const active = activeTags.has(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200',
                    active
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-border text-muted-foreground/70 hover:border-foreground/20 hover:text-foreground'
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Active filters + clear */}
        {hasFilters && (
          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {filteredDemos.length} demo
              {filteredDemos.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-sm font-medium text-primary transition-opacity hover:opacity-70"
            >
              <X size={14} />
              Clear all
            </button>
          </div>
        )}

        {/* Demo grid */}
        <div className="mt-10">
          {filteredDemos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <SearchIcon
                  size={28}
                  className="text-muted-foreground"
                />
              </div>
              <h3 className="mt-6 font-heading text-xl font-semibold">
                No demos found
              </h3>
              <p className="mt-2 max-w-md text-muted-foreground">
                Try adjusting your search terms or clearing some
                filters to see more demos.
              </p>
              <button
                onClick={clearAll}
                className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDemos.map((demo, i) => (
                <DemoCard key={demo.id} demo={demo} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CategoryPill({
  label,
  active,
  count,
  onClick,
}: {
  label: string;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
      )}
    >
      {label}
      <span
        className={cn(
          'ml-1.5 text-xs',
          active ? 'opacity-70' : 'opacity-50'
        )}
      >
        {count}
      </span>
    </button>
  );
}
