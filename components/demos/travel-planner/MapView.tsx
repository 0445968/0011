'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TripState } from './useTripState';
import { activityIcons } from './icons';
import { MapPin, Navigation, Star, X } from './icons';
import type { SavedPlace } from '@/data/demos/travel-planner';

interface Props {
  state: TripState;
}

export function MapView({ state }: Props) {
  const { trip, places, dayActivities, days, activeDayId } = state;
  const [selectedId, setSelectedId] = useState<string | null>(
    places[0]?.id ?? null
  );
  const [showItinerary, setShowItinerary] = useState(true);

  const activeDay = days.find((d) => d.id === activeDayId);

  const itineraryStops = useMemo(() => {
    const count = dayActivities.length;
    return dayActivities.map((a, i) => ({
      id: a.id,
      title: a.title,
      time: a.time,
      type: a.type,
      n: i + 1,
      x: 30 + ((i * 38) / Math.max(count - 1, 1)),
      y: 28 + (i % 3) * 22 + (i / Math.max(count, 1)) * 6,
    }));
  }, [dayActivities]);

  const selected = places.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      {/* Map canvas */}
      <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-[#efe8db] dark:border-white/5 dark:bg-[#232019]">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
          {/* Stylized map background */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {/* River */}
            <path
              d="M 0 58 Q 20 52 35 60 T 70 68 T 100 72"
              fill="none"
              stroke="#8aa6c0"
              strokeWidth="9"
              strokeLinecap="round"
              opacity="0.35"
            />
            {/* Parks */}
            <ellipse cx="72" cy="30" rx="11" ry="8" fill="#9bb89a" opacity="0.28" />
            <ellipse cx="28" cy="72" rx="9" ry="6" fill="#9bb89a" opacity="0.28" />
            {/* Grid streets */}
            <g stroke="#c9bca8" strokeWidth="0.4" opacity="0.5">
              {[20, 35, 50, 65, 80].map((y) => (
                <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} />
              ))}
              {[15, 30, 45, 60, 75, 90].map((x) => (
                <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100" />
              ))}
            </g>
            {/* Diagonal avenues */}
            <g stroke="#c9bca8" strokeWidth="0.8" opacity="0.6">
              <line x1="10" y1="20" x2="90" y2="78" />
              <line x1="85" y1="15" x2="15" y2="85" />
            </g>
          </svg>

          {/* Itinerary stop connectors */}
          {showItinerary && itineraryStops.length > 1 && (
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <path
                d={itineraryStops
                  .map((s, i) => `${i === 0 ? 'M' : 'L'} ${s.x} ${s.y}`)
                  .join(' ')}
                fill="none"
                stroke="#c2876b"
                strokeWidth="0.8"
                strokeDasharray="2 1.5"
                opacity="0.7"
              />
            </svg>
          )}

          {/* Place markers */}
          {places.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              aria-label={`${p.name}, ${p.category}`}
            >
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm transition-all',
                  selectedId === p.id
                    ? 'scale-110 border-[#c2876b] bg-[#c2876b] text-white'
                    : 'border-white bg-white/95 text-[#c2876b] hover:scale-105'
                )}
              >
                <MapPin size={13} fill="currentColor" />
              </span>
            </button>
          ))}

          {/* Itinerary numbered stops */}
          {showItinerary &&
            itineraryStops.map((s) => (
              <div
                key={s.id}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#2a2520] text-[10px] font-bold text-white shadow-md">
                  {s.n}
                </span>
              </div>
            ))}

          {/* Legend toggle */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 text-xs shadow-sm backdrop-blur dark:bg-[#221d17]/90">
            <button
              onClick={() => setShowItinerary((v) => !v)}
              className="inline-flex items-center gap-1.5 font-medium text-[#2a2520] dark:text-[#ece6df]"
              aria-pressed={showItinerary}
            >
              <span
                className={cn(
                  'flex h-3.5 w-3.5 items-center justify-center rounded-full border',
                  showItinerary
                    ? 'border-[#c2876b] bg-[#c2876b]'
                    : 'border-black/20 dark:border-white/30'
                )}
              >
                {showItinerary && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
              Itinerary route
            </button>
          </div>
        </div>
      </div>

      {/* Side panel */}
      <div className="space-y-3">
        {/* Destination summary */}
        <div className="rounded-xl border border-black/5 bg-white p-4 dark:border-white/5 dark:bg-[#221d17]">
          <h2 className="font-serif text-lg font-semibold">
            {trip.destination}
          </h2>
          <p className="text-sm text-[#8a8276] dark:text-[#a59c8e]">
            {trip.country} · {places.length} saved places
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-[#6b6356] dark:text-[#b8aea0]">
            <Navigation size={13} className="text-[#c2876b]" />
            {itineraryStops.length} stops on Day {activeDay?.index}
          </div>
        </div>

        {/* Selected place detail */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="overflow-hidden rounded-xl border border-black/5 bg-white dark:border-white/5 dark:bg-[#221d17]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#f0e9df] dark:bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <button
                  onClick={() => setSelectedId(null)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
                  aria-label="Deselect place"
                >
                  <X size={14} />
                </button>
              </div>
              <SelectedDetail place={selected} state={state} />
            </motion.div>
          ) : (
            <div className="rounded-xl border border-dashed border-black/10 p-5 text-center text-sm text-[#8a8276] dark:border-white/10 dark:text-[#a59c8e]">
              Select a marker to see details.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SelectedDetail({
  place,
  state,
}: {
  place: SavedPlace;
  state: TripState;
}) {
  const Icon = activityIcons[place.category === 'Food' ? 'lunch' : 'landmark'];
  const activeDay = state.days.find((d) => d.id === state.activeDayId);
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c2876b]/10 text-[#c2876b]">
            <Icon size={15} />
          </span>
          <h3 className="font-serif text-base font-semibold">{place.name}</h3>
        </div>
        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-[#6b6356] dark:text-[#b8aea0]">
          <Star size={12} className="fill-[#d9a86c] text-[#d9a86c]" />
          {place.rating.toFixed(1)}
        </span>
      </div>
      <p className="mt-2 text-xs text-[#8a8276] dark:text-[#a59c8e]">
        {place.address}
      </p>
      <p className="mt-2 text-sm text-[#6b6356] dark:text-[#b8aea0]">
        {place.note}
      </p>
      <button
        onClick={() => state.addPlaceToItinerary(place.id, state.activeDayId)}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#c2876b] px-3 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
      >
        Add to Day {activeDay?.index}
      </button>
    </div>
  );
}
