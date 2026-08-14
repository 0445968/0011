'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TripState, NewActivityInput } from './useTripState';
import { activityTypeLabels } from './useTripState';
import type { ActivityType } from '@/data/demos/travel-planner';
import { X, Check, Euro } from './icons';

interface Props {
  open: boolean;
  onClose: () => void;
  state: TripState;
}

const typeOptions: ActivityType[] = [
  'breakfast',
  'lunch',
  'dinner',
  'landmark',
  'museum',
  'walk',
  'viewpoint',
  'shopping',
  'transport',
  'nightlife',
];

const emptyDraft = (dayId: string) => ({
  dayId,
  time: '14:00',
  endTime: '',
  type: 'landmark' as ActivityType,
  title: '',
  location: '',
  description: '',
  cost: '0',
});

export function ActivityModal({ open, onClose, state }: Props) {
  const [draft, setDraft] = useState(emptyDraft(state.activeDayId));

  useEffect(() => {
    if (open) setDraft(emptyDraft(state.activeDayId));
  }, [open, state.activeDayId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const canSave = draft.title.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const input: NewActivityInput = {
      time: draft.time,
      endTime: draft.endTime || undefined,
      type: draft.type,
      title: draft.title.trim(),
      location: draft.location.trim(),
      description: draft.description.trim(),
      cost: Number(draft.cost) || 0,
    };
    state.addActivity(draft.dayId, input);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg overflow-hidden rounded-t-2xl bg-[#faf7f2] shadow-xl dark:bg-[#221d17] sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-activity-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4 dark:border-white/5">
              <h2
                id="add-activity-title"
                className="font-serif text-lg font-semibold"
              >
                Add activity
              </h2>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#8a8276] transition-colors hover:bg-black/5 dark:text-[#a59c8e] dark:hover:bg-white/5"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-5">
              {/* Day + time */}
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="mb-1 block text-xs font-medium text-[#8a8276] dark:text-[#a59c8e]">
                    Day
                  </span>
                  <select
                    value={draft.dayId}
                    onChange={(e) =>
                      setDraft({ ...draft, dayId: e.target.value })
                    }
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#c2876b] focus:outline-none dark:border-white/10 dark:bg-[#2a1610] dark:text-[#ece6df]"
                  >
                    {state.days.map((d) => (
                      <option key={d.id} value={d.id}>
                        Day {d.index} · {d.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="text-sm">
                    <span className="mb-1 block text-xs font-medium text-[#8a8276] dark:text-[#a59c8e]">
                      Start
                    </span>
                    <input
                      type="time"
                      value={draft.time}
                      onChange={(e) =>
                        setDraft({ ...draft, time: e.target.value })
                      }
                      className="w-full rounded-lg border border-black/10 bg-white px-2.5 py-2 text-sm focus:border-[#c2876b] focus:outline-none dark:border-white/10 dark:bg-[#2a1610] dark:text-[#ece6df]"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block text-xs font-medium text-[#8a8276] dark:text-[#a59c8e]">
                      End
                    </span>
                    <input
                      type="time"
                      value={draft.endTime}
                      onChange={(e) =>
                        setDraft({ ...draft, endTime: e.target.value })
                      }
                      className="w-full rounded-lg border border-black/10 bg-white px-2.5 py-2 text-sm focus:border-[#c2876b] focus:outline-none dark:border-white/10 dark:bg-[#2a1610] dark:text-[#ece6df]"
                    />
                  </label>
                </div>
              </div>

              {/* Type */}
              <div>
                <span className="mb-1.5 block text-xs font-medium text-[#8a8276] dark:text-[#a59c8e]">
                  Type
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {typeOptions.map((t) => (
                    <button
                      key={t}
                      onClick={() => setDraft({ ...draft, type: t })}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                        draft.type === t
                          ? 'border-[#c2876b] bg-[#c2876b] text-white'
                          : 'border-black/10 text-[#6b6356] hover:border-[#c2876b]/50 dark:border-white/10 dark:text-[#b8aea0]'
                      )}
                    >
                      {activityTypeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-medium text-[#8a8276] dark:text-[#a59c8e]">
                  Activity name
                </span>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                  placeholder="e.g. Sunset at Miradouro da Senhora do Monte"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#c2876b] focus:outline-none dark:border-white/10 dark:bg-[#2a1610] dark:text-[#ece6df] dark:placeholder:text-[#6b6356]"
                />
              </label>

              {/* Location */}
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-medium text-[#8a8276] dark:text-[#a59c8e]">
                  Location
                </span>
                <input
                  type="text"
                  value={draft.location}
                  onChange={(e) =>
                    setDraft({ ...draft, location: e.target.value })
                  }
                  placeholder="Address or neighborhood"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#c2876b] focus:outline-none dark:border-white/10 dark:bg-[#2a1610] dark:text-[#ece6df] dark:placeholder:text-[#6b6356]"
                />
              </label>

              {/* Notes */}
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-medium text-[#8a8276] dark:text-[#a59c8e]">
                  Notes
                </span>
                <textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                  placeholder="Short description or booking notes"
                  rows={2}
                  className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#c2876b] focus:outline-none dark:border-white/10 dark:bg-[#2a1610] dark:text-[#ece6df] dark:placeholder:text-[#6b6356]"
                />
              </label>

              {/* Cost */}
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-medium text-[#8a8276] dark:text-[#a59c8e]">
                  Estimated cost (EUR)
                </span>
                <div className="flex items-center gap-2">
                  <Euro size={16} className="text-[#c2876b]" />
                  <input
                    type="number"
                    min={0}
                    value={draft.cost}
                    onChange={(e) =>
                      setDraft({ ...draft, cost: e.target.value })
                    }
                    className="w-28 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#c2876b] focus:outline-none dark:border-white/10 dark:bg-[#2a1610] dark:text-[#ece6df]"
                  />
                  <span className="text-xs text-[#8a8276] dark:text-[#a59c8e]">
                    0 = free
                  </span>
                </div>
              </label>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t border-black/5 px-5 py-4 dark:border-white/5">
              <button
                onClick={onClose}
                className="rounded-full px-4 py-2 text-sm font-medium text-[#6b6356] transition-colors hover:bg-black/5 dark:text-[#b8aea0] dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#c2876b] px-5 py-2 text-sm font-medium text-white transition-transform enabled:hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Check size={15} />
                Add to itinerary
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
