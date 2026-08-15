'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, Settings2, Users, CalendarDays } from './icons';
import type { TripState } from './useTripState';

export function TopBar({ state }: { state: TripState }) {
  const { trip } = state;
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <header className="relative">
      {/* Hero image */}
      <div className="relative h-44 w-full overflow-hidden sm:h-56 md:h-64">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trip.heroImage}
          alt={`${trip.destination}, ${trip.country}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Settings + reset */}
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Trip settings"
            aria-expanded={menuOpen}
          >
            <Settings2 size={18} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-52 overflow-hidden rounded-xl border border-white/15 bg-[#2a2520] shadow-xl"
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmReset(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-white/90 transition-colors hover:bg-white/10"
                >
                  <RotateCcw size={15} />
                  Reset demo
                </button>
                <div className="border-t border-white/10 px-4 py-3 text-xs text-white/50">
                  Roamly · Portfolio demo
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Title block */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-12 flex flex-col gap-4 rounded-2xl border border-black/5 bg-[#faf7f2] p-5 shadow-sm dark:border-white/5 dark:bg-[#221d17] sm:-mt-16 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#c2876b]">
              Roamly
            </p>
            <h1 className="mt-1.5 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {trip.destination}
              <span className="ml-2 align-middle text-base font-normal text-[#8a8276] dark:text-[#a59c8e]">
                {trip.country}
              </span>
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#6b6356] dark:text-[#b8aea0]">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={15} className="text-[#c2876b]" />
                Oct 6 – Oct 10, 2026
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users size={15} className="text-[#c2876b]" />
                {trip.travelers.length} travelers
              </span>
            </div>
          </div>

          {/* Traveler avatars */}
          <div className="flex -space-x-2.5">
            {trip.travelers.map((t) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={t.id}
                src={t.avatar}
                alt={t.name}
                title={t.name}
                className="h-10 w-10 rounded-full border-2 border-[#faf7f2] object-cover dark:border-[#221d17] sm:h-11 sm:w-11"
              />
            ))}
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#faf7f2] bg-[#e8e0d5] text-xs font-semibold text-[#6b6356] dark:border-[#221d17] dark:bg-[#2e2822] dark:text-[#b8aea0] sm:h-11 sm:w-11">
              +2
            </div>
          </div>
        </div>
      </div>

      {/* Reset confirm */}
      <AnimatePresence>
        {confirmReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4"
            onClick={() => setConfirmReset(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-[#faf7f2] p-6 shadow-xl dark:bg-[#221d17]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif text-lg font-semibold">
                Reset this demo?
              </h3>
              <p className="mt-2 text-sm text-[#6b6356] dark:text-[#b8aea0]">
                All itinerary changes, saved places, and favorites will be
                restored to the original Lisbon trip.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="rounded-full px-4 py-2 text-sm font-medium text-[#6b6356] transition-colors hover:bg-black/5 dark:text-[#b8aea0] dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    state.reset();
                    setConfirmReset(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#c2876b] px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
