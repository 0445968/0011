'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X, ArrowUpRight, Tag } from 'lucide-react';
import {
  searchIndex,
  allTags,
  searchTypeLabels,
  searchTypeOrder,
  type SearchResult,
  type SearchResultType,
} from '@/data/search';
import { Reveal } from '@/components/portfolio/Reveal';
import { cn } from '@/lib/utils';

const typeIconColor: Record<SearchResultType, string> = {
  service: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  project: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  template: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  blog: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  resource: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTypes, setActiveTypes] = useState<Set<SearchResultType>>(new Set());
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

  const toggleType = useCallback((type: SearchResultType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

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
    setActiveTypes(new Set());
    setActiveTags(new Set());
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return searchIndex.filter((r) => {
      if (activeTypes.size > 0 && !activeTypes.has(r.type)) return false;
      if (activeTags.size > 0) {
        const hasAllTags = Array.from(activeTags).every((t) =>
          r.tags.some((rt) => rt.toLowerCase() === t.toLowerCase())
        );
        if (!hasAllTags) return false;
      }
      if (q) {
        const haystack = (
          r.title +
          ' ' +
          r.description +
          ' ' +
          r.category +
          ' ' +
          r.tags.join(' ')
        ).toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [query, activeTypes, activeTags]);

  const groupedResults = useMemo(() => {
    const groups: Record<SearchResultType, SearchResult[]> = {
      service: [],
      project: [],
      template: [],
      blog: [],
      resource: [],
    };
    for (const r of results) {
      groups[r.type].push(r);
    }
    return groups;
  }, [results]);

  const hasFilters = query || activeTypes.size > 0 || activeTags.size > 0;
  const typeCounts = useMemo(() => {
    const counts: Record<SearchResultType, number> = {
      service: 0,
      project: 0,
      template: 0,
      blog: 0,
      resource: 0,
    };
    for (const r of searchIndex) counts[r.type]++;
    return counts;
  }, []);

  return (
    <section className="min-h-screen pt-32 md:pt-40">
      <div className="container-page pb-24">
        {/* Header */}
        <Reveal>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="h-px w-8 bg-primary" />
              Search
            </div>
            <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
              Find anything.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Search across projects, templates, articles, resources, and services. Filter by type, topic, or tag to narrow results.
            </p>
          </div>
        </Reveal>

        {/* Search Bar */}
        <Reveal delay={0.1}>
          <div className="relative mt-10 max-w-3xl">
            <SearchIcon
              size={20}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, articles, templates, services..."
              className="w-full rounded-2xl border border-border bg-card py-4 pl-14 pr-12 text-lg text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              autoFocus
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

        {/* Type Filters */}
        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Type
            </span>
            {searchTypeOrder.map((type) => {
              const active = activeTypes.has(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                  )}
                >
                  {searchTypeLabels[type]}
                  <span className={cn('ml-1.5 text-xs', active ? 'opacity-70' : 'opacity-50')}>
                    {typeCounts[type]}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Tag Filters */}
        <Reveal delay={0.2}>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Tag size={12} />
              Tags
            </span>
            {allTags.slice(0, 24).map((tag) => {
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
              {results.length} result{results.length === 1 ? '' : 's'}
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

        {/* Results */}
        <div className="mt-10">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <SearchIcon size={28} className="text-muted-foreground" />
              </div>
              <h3 className="mt-6 font-heading text-xl font-semibold">No results found</h3>
              <p className="mt-2 max-w-md text-muted-foreground">
                Try adjusting your search terms or clearing some filters to see more results.
              </p>
              <button
                onClick={clearAll}
                className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-16">
              {searchTypeOrder.map((type) => {
                const items = groupedResults[type];
                if (items.length === 0) return null;
                return (
                  <div key={type}>
                    <div className="mb-6 flex items-center gap-3">
                      <span className="h-px w-8 bg-primary" />
                      <h2 className="font-heading text-2xl font-semibold tracking-tight">
                        {searchTypeLabels[type]}
                      </h2>
                      <span className="text-sm text-muted-foreground">
                        {items.length}
                      </span>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((item) => (
                        <SearchResultCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SearchResultCard({ item }: { item: SearchResult }) {
  return (
    <motion.a
      href={item.href}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noopener noreferrer' : undefined}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-lg"
    >
      {item.image && (
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {item.badge && (
            <span
              className={cn(
                'absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm',
                typeIconColor[item.type]
              )}
            >
              {item.badge}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between">
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', typeIconColor[item.type])}>
            {searchTypeLabels[item.type]}
          </span>
          <ArrowUpRight
            size={16}
            className="text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
          />
        </div>
        <h3 className="mt-3 font-heading text-lg font-semibold leading-snug tracking-tight">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
        {item.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.a>
  );
}
