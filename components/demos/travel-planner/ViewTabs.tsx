'use client';

import { cn } from '@/lib/utils';
import { Plus } from './icons';

type View = 'itinerary' | 'map' | 'places' | 'budget';

const tabs: { id: View; label: string }[] = [
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'map', label: 'Map' },
  { id: 'places', label: 'Places' },
  { id: 'budget', label: 'Budget' },
];

interface Props {
  view: View;
  onChange: (v: View) => void;
  onAdd: () => void;
}

export function ViewTabs({ view, onChange, onAdd }: Props) {
  return (
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
      <nav
        role="tablist"
        aria-label="Trip views"
        className="flex gap-1 overflow-x-auto py-2"
      >
        {tabs.map((tab) => {
          const active = view === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors sm:px-4',
                active
                  ? 'text-[#2a2520] dark:text-[#ece6df]'
                  : 'text-[#8a8276] hover:text-[#2a2520] dark:text-[#a59c8e] dark:hover:text-[#ece6df]'
              )}
            >
              {tab.label}
              {active && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#c2876b]" />
              )}
            </button>
          );
        })}
      </nav>

      <button
        onClick={onAdd}
        className="hidden shrink-0 items-center gap-1.5 rounded-full bg-[#c2876b] px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c2876b] sm:flex"
      >
        <Plus size={15} />
        Add activity
      </button>
    </div>
  );
}
