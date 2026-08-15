'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TripState } from './useTripState';
import { activityTypeLabels } from './useTripState';
import { activityIcons } from './icons';
import {
  Heart,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  MapPin,
  Euro,
  Plus,
  Check,
  X,
} from './icons';

interface Props {
  state: TripState;
  activityId: string;
  isFirst: boolean;
  isLast: boolean;
}

export function ActivityTimelineCard({
  state,
  activityId,
  isFirst,
  isLast,
}: Props) {
  const activity = state.activities.find((a) => a.id === activityId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    time: activity?.time ?? '',
    endTime: activity?.endTime ?? '',
    title: activity?.title ?? '',
    location: activity?.location ?? '',
    description: activity?.description ?? '',
    cost: String(activity?.cost ?? 0),
  });

  if (!activity) return null;

  const Icon = activityIcons[activity.type];

  const saveEdit = () => {
    state.updateActivity(activity.id, {
      time: draft.time,
      endTime: draft.endTime || undefined,
      title: draft.title,
      location: draft.location,
      description: draft.description,
      cost: Number(draft.cost) || 0,
    });
    setEditing(false);
  };

  return (
    <div className="relative pl-10">
      {/* Timeline dot */}
      <div className="absolute left-0 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-black/8 bg-white shadow-sm dark:border-white/10 dark:bg-[#221d17]">
        <Icon size={17} className="text-[#c2876b]" />
      </div>

      <motion.div
        layout
        className="group rounded-xl border border-black/5 bg-white p-4 transition-all hover:border-black/10 hover:shadow-sm dark:border-white/5 dark:bg-[#221d17] dark:hover:border-white/10 sm:p-5"
      >
        {!editing ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#8a8276] dark:text-[#a59c8e]">
                  <span className="inline-flex items-center gap-1 font-medium text-[#2a2520] dark:text-[#ece6df]">
                    <Clock size={12} />
                    {activity.time}
                    {activity.endTime && ` – ${activity.endTime}`}
                  </span>
                  <span className="rounded-full bg-[#f0e9df] px-2 py-0.5 font-medium text-[#6b6356] dark:bg-white/5 dark:text-[#b8aea0]">
                    {activityTypeLabels[activity.type]}
                  </span>
                </div>

                <h3 className="mt-1.5 font-serif text-lg font-semibold leading-snug">
                  {activity.title}
                </h3>

                <p className="mt-1 flex items-start gap-1.5 text-sm text-[#6b6356] dark:text-[#b8aea0]">
                  <MapPin size={13} className="mt-0.5 shrink-0 text-[#c2876b]" />
                  {activity.location}
                </p>

                <p className="mt-2 text-sm leading-relaxed text-[#6b6356] dark:text-[#b8aea0]">
                  {activity.description}
                </p>
              </div>

              {/* Favorite */}
              <button
                onClick={() => state.toggleFavorite(activity.id)}
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
                  activity.favorite
                    ? 'text-[#c2876b]'
                    : 'text-[#bdb3a4] hover:text-[#c2876b]'
                )}
                aria-label={
                  activity.favorite ? 'Unfavorite activity' : 'Favorite activity'
                }
                aria-pressed={activity.favorite}
              >
                <Heart
                  size={18}
                  fill={activity.favorite ? 'currentColor' : 'none'}
                />
              </button>
            </div>

            {/* Footer: cost + travel + actions */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-3 dark:border-white/5">
              <div className="flex items-center gap-3 text-sm">
                {activity.cost > 0 && (
                  <span className="inline-flex items-center gap-1 font-medium text-[#2a2520] dark:text-[#ece6df]">
                    <Euro size={13} className="text-[#c2876b]" />
                    {activity.cost}
                  </span>
                )}
                {activity.travelTimeToNext && !isLast && (
                  <span className="text-xs text-[#8a8276] dark:text-[#a59c8e]">
                    ↓ {activity.travelTimeToNext}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <button
                  onClick={() => state.moveActivity(activity.id, -1)}
                  disabled={isFirst}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8a8276] transition-colors hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent dark:text-[#a59c8e] dark:hover:bg-white/5"
                  aria-label="Move activity earlier"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => state.moveActivity(activity.id, 1)}
                  disabled={isLast}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8a8276] transition-colors hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent dark:text-[#a59c8e] dark:hover:bg-white/5"
                  aria-label="Move activity later"
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  onClick={() => {
                    setDraft({
                      time: activity.time,
                      endTime: activity.endTime ?? '',
                      title: activity.title,
                      location: activity.location,
                      description: activity.description,
                      cost: String(activity.cost),
                    });
                    setEditing(true);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8a8276] transition-colors hover:bg-black/5 dark:text-[#a59c8e] dark:hover:bg-white/5"
                  aria-label="Edit activity"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8a8276] transition-colors hover:bg-[#c25b5b]/10 hover:text-[#c25b5b] dark:text-[#a59c8e]"
                  aria-label="Delete activity"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {confirmDelete && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-[#c25b5b]/8 px-3 py-2 text-sm dark:bg-[#c25b5b]/15">
                    <span className="text-[#8a3a3a] dark:text-[#e0a0a0]">
                      Delete this activity?
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="rounded-md px-2.5 py-1 text-xs font-medium text-[#6b6356] hover:bg-black/5 dark:text-[#b8aea0] dark:hover:bg-white/5"
                      >
                        No
                      </button>
                      <button
                        onClick={() => state.deleteActivity(activity.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-[#c25b5b] px-2.5 py-1 text-xs font-medium text-white"
                      >
                        <Check size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <EditForm
            draft={draft}
            setDraft={setDraft}
            onCancel={() => setEditing(false)}
            onSave={saveEdit}
          />
        )}
      </motion.div>
    </div>
  );
}

function EditForm({
  draft,
  setDraft,
  onCancel,
  onSave,
}: {
  draft: {
    time: string;
    endTime: string;
    title: string;
    location: string;
    description: string;
    cost: string;
  };
  setDraft: (v: typeof draft) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <label className="flex-1 text-xs">
          <span className="mb-1 block text-[#8a8276] dark:text-[#a59c8e]">Start</span>
          <input
            type="time"
            value={draft.time}
            onChange={(e) => setDraft({ ...draft, time: e.target.value })}
            className="w-full rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm text-[#2a2520] focus:border-[#c2876b] focus:outline-none dark:border-white/10 dark:bg-[#2a1610] dark:text-[#ece6df]"
          />
        </label>
        <label className="flex-1 text-xs">
          <span className="mb-1 block text-[#8a8276] dark:text-[#a59c8e]">End</span>
          <input
            type="time"
            value={draft.endTime}
            onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
            className="w-full rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm text-[#2a2520] focus:border-[#c2876b] focus:outline-none dark:border-white/10 dark:bg-[#2a1610] dark:text-[#ece6df]"
          />
        </label>
      </div>
      <input
        type="text"
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        placeholder="Activity name"
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium focus:border-[#c2876b] focus:outline-none dark:border-white/10 dark:bg-[#2a1610]"
      />
      <input
        type="text"
        value={draft.location}
        onChange={(e) => setDraft({ ...draft, location: e.target.value })}
        placeholder="Location"
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#c2876b] focus:outline-none dark:border-white/10 dark:bg-[#2a1610]"
      />
      <textarea
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        placeholder="Notes"
        rows={2}
        className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#c2876b] focus:outline-none dark:border-white/10 dark:bg-[#2a1610]"
      />
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-sm">
          <Euro size={14} className="text-[#c2876b]" />
          <input
            type="number"
            min={0}
            value={draft.cost}
            onChange={(e) => setDraft({ ...draft, cost: e.target.value })}
            className="w-20 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm focus:border-[#c2876b] focus:outline-none dark:border-white/10 dark:bg-[#2a1610]"
          />
        </label>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-[#6b6356] hover:bg-black/5 dark:text-[#b8aea0] dark:hover:bg-white/5"
          >
            <X size={14} />
            Cancel
          </button>
          <button
            onClick={onSave}
            className="inline-flex items-center gap-1 rounded-lg bg-[#c2876b] px-3 py-1.5 text-sm font-medium text-white"
          >
            <Check size={14} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
