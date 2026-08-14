'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTripState } from './useTripState';
import { TopBar } from './TopBar';
import { ViewTabs } from './ViewTabs';
import { ItineraryView } from './ItineraryView';
import { PlacesView } from './PlacesView';
import { MapView } from './MapView';
import { BudgetView } from './BudgetView';
import { ActivityModal } from './ActivityModal';

type View = 'itinerary' | 'map' | 'places' | 'budget';

export function RoamlyApp() {
  const state = useTripState();
  const [view, setView] = useState<View>('itinerary');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="bg-[#faf7f2] text-[#2a2520] dark:bg-[#1a1612] dark:text-[#ece6df]">
      <TopBar state={state} />

      <div className="sticky top-0 z-30 border-b border-black/5 bg-[#faf7f2]/95 backdrop-blur dark:border-white/5 dark:bg-[#1a1612]/95">
        <ViewTabs view={view} onChange={setView} onAdd={() => setModalOpen(true)} />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {view === 'itinerary' && (
              <ItineraryView state={state} onAdd={() => setModalOpen(true)} />
            )}
            {view === 'map' && <MapView state={state} />}
            {view === 'places' && <PlacesView state={state} />}
            {view === 'budget' && <BudgetView state={state} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <ActivityModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        state={state}
      />
    </div>
  );
}
