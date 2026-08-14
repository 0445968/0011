'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { labItems, featuredLabItems, labCategories, labTypeMeta, type LabType, type LabCategory } from '@/data/studio-lab/registry';
import { LabCard } from './shared/LabCard';

type FilterType = 'all' | LabType;

export function StudioLabLanding() {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<FilterType>('all');
  const [activeCategory, setActiveCategory] = useState<LabCategory | 'all'>('all');

  const filtered = useMemo(() => {
    let result = labItems;
    if (activeType !== 'all') {
      result = result.filter((item) => item.type === activeType);
    }
    if (activeCategory !== 'all') {
      result = result.filter((item) => item.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [search, activeType, activeCategory]);

  const featured = featuredLabItems.filter(
    (item) => activeType === 'all' || item.type === activeType
  );

  const hasActiveFilters = search || activeType !== 'all' || activeCategory !== 'all';

  return (
    <>
      {/* Page Header */}
      <section className="relative border-b border-border pt-32 md:pt-40">
        <div className="container-page pb-16 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="h-px w-8 bg-primary" />
              Studio Lab
            </div>
            <h1 className="mt-6 text-balance font-heading text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
              Interactive tools & brand assessments.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Practical tools and strategy assessments you can use right now. Generate invoices, preview social cards, test your typing speed, or evaluate your brand's health — all in your browser.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="container-page py-12 md:py-16">
        {/* Controls */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative max-w-xs flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools & assessments..."
              className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-9 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label="All"
              active={activeType === 'all'}
              onClick={() => setActiveType('all')}
            />
            {(Object.keys(labTypeMeta) as LabType[]).map((type) => (
              <FilterChip
                key={type}
                label={labTypeMeta[type].pluralLabel}
                active={activeType === type}
                onClick={() => setActiveType(type)}
              />
            ))}
          </div>
        </div>

        {/* Category filter row */}
        <div className="mb-10 flex flex-wrap gap-2">
          <FilterChip
            label="All Categories"
            active={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
            small
          />
          {labCategories.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              small
            />
          ))}
          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(''); setActiveType('all'); setActiveCategory('all'); }}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <X size={12} />
              Clear filters
            </button>
          )}
        </div>

        {/* Featured section (only when no filters active) */}
        {!hasActiveFilters && featured.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-5 flex items-center gap-2 font-heading text-xl font-semibold tracking-tight">
              <FlaskConical size={18} className="text-primary" />
              Featured
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item) => (
                <LabCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Category sections (when no search/type filter) */}
        {!hasActiveFilters && activeCategory === 'all' ? (
          <>
            {labCategories.map((cat) => {
              const items = labItems.filter((item) => item.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} className="mb-12">
                  <h2 className="mb-5 font-heading text-xl font-semibold tracking-tight">{cat}</h2>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <LabCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          /* Filtered results */
          <div>
            <p className="mb-5 text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            </p>
            {filtered.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item) => (
                  <LabCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-16 text-center">
                <p className="font-heading text-lg font-semibold">No results found</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}

function FilterChip({ label, active, onClick, small }: { label: string; active: boolean; onClick: () => void; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full font-medium transition-colors',
        small ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm',
        active
          ? 'bg-primary text-primary-foreground'
          : 'border border-border bg-card text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  );
}
