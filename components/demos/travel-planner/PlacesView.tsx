'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TripState } from './useTripState';
import { placeCategories } from './useTripState';
import type { PlaceCategory, SavedPlace } from '@/data/demos/travel-planner';
import { Heart, Star, Plus, Filter } from './icons';

interface Props {
  state: TripState;
}

const priceSymbols = ['€', '€€', '€€€'];

export function PlacesView({ state }: Props) {
  const { places } = state;
  const [filter, setFilter] = useState<PlaceCategory | 'all'>('all');
  const [addToDay, setToAddToDay] = useState<SavedPlace | null>(null);

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? places
        : places.filter((p) => p.category === filter),
    [places, filter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: places.length };
    for (const cat of placeCategories) {
      c[cat] = places.filter((p) => p.category === cat).length;
    }
    return c;
  }, [places]);

  return (
    <div>
      {/* Category filter */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#8a8276] dark:text-[#a59c8e]">
          <Filter size={12} />
          Filter
        </span>
        <FilterPill
          label="All"
          active={filter === 'all'}
          count={counts.all}
          onClick={() => setFilter('all')}
        />
        {placeCategories.map((cat) => (
          <FilterPill
            key={cat}
            label={cat}
            active={filter === cat}
            count={counts[cat] ?? 0}
            onClick={() => setFilter(cat)}
          />
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            onFav={() => state.togglePlaceFavorite(place.id)}
            onAdd={() => setToAddToDay(place)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-black/10 py-12 text-center dark:border-white/10">
          <p className="text-sm text-[#8a8276] dark:text-[#a59c8e]">
            No saved places in this category yet.
          </p>
        </div>
      )}

      {/* Add-to-day picker */}
      <AnimatePresence>
        {addToDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
            onClick={() => setToAddToDay(null)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-sm rounded-t-2xl bg-[#faf7f2] p-5 shadow-xl dark:bg-[#221d17] sm:rounded-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Add ${addToDay.name} to itinerary`}
            >
              <h3 className="font-serif text-lg font-semibold">
                Add to itinerary
              </h3>
              <p className="mt-1 text-sm text-[#6b6356] dark:text-[#b8aea0]">
                {addToDay.name}
              </p>
              <div className="mt-4 space-y-1.5">
                {state.days.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      state.addPlaceToItinerary(addToDay.id, d.id);
                      setToAddToDay(null);
                    }}
                    className="flex w-full items-center justify-between rounded-lg border border-black/5 bg-white px-4 py-3 text-left text-sm transition-colors hover:border-[#c2876b] hover:bg-[#c2876b]/5 dark:border-white/5 dark:bg-white/[0.03]"
                  >
                    <span className="font-medium">Day {d.index}</span>
                    <span className="text-xs text-[#8a8276] dark:text-[#a59c8e]">
                      {d.label}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setToAddToDay(null)}
                className="mt-4 w-full rounded-full py-2 text-sm font-medium text-[#6b6356] transition-colors hover:bg-black/5 dark:text-[#b8aea0] dark:hover:bg-white/5"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterPill({
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
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
        active
          ? 'border-[#c2876b] bg-[#c2876b] text-white'
          : 'border-black/10 text-[#6b6356] hover:border-[#c2876b]/50 dark:border-white/10 dark:text-[#b8aea0]'
      )}
    >
      {label}
      <span className={cn('ml-1.5 text-xs', active ? 'opacity-80' : 'opacity-50')}>
        {count}
      </span>
    </button>
  );
}

function PlaceCard({
  place,
  onFav,
  onAdd,
}: {
  place: SavedPlace;
  onFav: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white transition-all hover:border-black/10 hover:shadow-sm dark:border-white/5 dark:bg-[#221d17] dark:hover:border-white/10">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f0e9df] dark:bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={place.image}
          alt={place.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur">
          {place.category}
        </span>
        <button
          onClick={onFav}
          className={cn(
            'absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition-colors',
            place.favorite
              ? 'bg-white/90 text-[#c2876b]'
              : 'bg-black/40 text-white hover:bg-white/90 hover:text-[#c2876b]'
          )}
          aria-label={place.favorite ? 'Unfavorite place' : 'Favorite place'}
          aria-pressed={place.favorite}
        >
          <Heart
            size={15}
            fill={place.favorite ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-base font-semibold leading-snug">
            {place.name}
          </h3>
          <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-[#6b6356] dark:text-[#b8aea0]">
            <Star size={12} className="fill-[#d9a86c] text-[#d9a86c]" />
            {place.rating.toFixed(1)}
          </span>
        </div>

        <p className="mt-1 text-xs text-[#8a8276] dark:text-[#a59c8e]">
          {place.address}
        </p>

        <p className="mt-2 flex-1 text-sm leading-relaxed text-[#6b6356] dark:text-[#b8aea0]">
          {place.note}
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 dark:border-white/5">
          <span className="text-xs font-medium text-[#c2876b]">
            {priceSymbols[place.priceLevel - 1]}
          </span>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium transition-colors hover:border-[#c2876b] hover:bg-[#c2876b]/5 dark:border-white/10"
          >
            <Plus size={13} />
            Add to trip
          </button>
        </div>
      </div>
    </div>
  );
}
