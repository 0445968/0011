'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft } from 'lucide-react';
import {
  resources,
  resourceTypes,
  resourceTopics,
  getResourcesByType,
} from '@/data/resources';
import { ResourceCard } from '@/components/resources/ResourceCard';

export function ResourceLibrary() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') ?? 'all';

  const [type, setType] = useState(
    resourceTypes.some((t) => t.id === initialType) ? initialType : 'all'
  );
  const [topic, setTopic] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = getResourcesByType(type);
    if (topic !== 'all') {
      const t = resourceTopics.find((tp) => tp.id === topic);
      if (t) {
        list = list.filter(
          (r) => r.category.toLowerCase() === t.name.toLowerCase()
        );
      }
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return list;
  }, [type, topic, query]);

  const tabs: { id: string; label: string }[] = [
    { id: 'all', label: 'All' },
    ...resourceTypes.map((t) => ({ id: t.id, label: t.label })),
  ];

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
            Resource Library
          </span>
          <h1 className="mt-6 text-balance font-heading text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
            Guides, tools &amp; curated links.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A free, growing library of downloadable guides, interactive tools,
            and hand-picked external resources for designers and founders —
            from color systems to trademarks.
          </p>
        </motion.div>

        {/* Search */}
        <div className="mt-12 max-w-xl">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources, tools, topics…"
              className="w-full rounded-full border border-input bg-background py-3 pl-12 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>

        {/* Type tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const count =
              tab.id === 'all'
                ? resources.length
                : resources.filter((r) => r.type === tab.id).length;
            const isActive = type === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setType(tab.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                }`}
              >
                {tab.label}
                <span
                  className={`ml-2 text-xs ${
                    isActive
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Topic filter */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Topic:
          </span>
          {[
            { id: 'all', name: 'All' },
            ...resourceTopics,
          ].map((tp) => (
            <button
              key={tp.id}
              onClick={() => setTopic(tp.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                topic === tp.id
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tp.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((resource, i) => (
              <ResourceCard key={resource.id} resource={resource} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center">
            <p className="font-heading text-xl text-muted-foreground">
              No resources match your filters.
            </p>
            <button
              onClick={() => {
                setType('all');
                setTopic('all');
                setQuery('');
              }}
              className="mt-4 text-sm font-medium text-accent"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
