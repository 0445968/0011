'use client';

import { cn } from '@/lib/utils';
import type { TripState } from './useTripState';
import { Plus } from './icons';
import { ActivityTimelineCard } from './ActivityTimelineCard';

interface Props {
  state: TripState;
  onAdd: () => void;
}

export function ItineraryView({ state, onAdd }: Props) {
  const { days, activeDayId, setActiveDayId, dayActivities } = state;
  const activeDay = days.find((d) => d.id === activeDayId) ?? days[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      {/* Day selector — vertical sidebar on desktop, horizontal scroll on mobile */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <h2 className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-[#8a8276] lg:block dark:text-[#a59c8e]">
          Days
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0">
          {days.map((day) => {
            const active = day.id === activeDayId;
            return (
              <button
                key={day.id}
                onClick={() => setActiveDayId(day.id)}
                className={cn(
                  'shrink-0 rounded-xl border px-4 py-3 text-left transition-all lg:w-full',
                  active
                    ? 'border-[#c2876b] bg-[#c2876b]/10'
                    : 'border-black/5 bg-white/60 hover:border-black/10 dark:border-white/5 dark:bg-white/[0.03] dark:hover:border-white/10'
                )}
              >
                <div
                  className={cn(
                    'text-sm font-semibold',
                    active ? 'text-[#c2876b]' : 'text-[#2a2520] dark:text-[#ece6df]'
                  )}
                >
                  Day {day.index}
                </div>
                <div className="mt-0.5 text-xs text-[#8a8276] dark:text-[#a59c8e]">
                  {day.label}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Activity list */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight">
              Day {activeDay.index}
            </h2>
            <p className="text-sm text-[#8a8276] dark:text-[#a59c8e]">
              {activeDay.label} · {dayActivities.length} activities
            </p>
          </div>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-2 text-sm font-medium text-[#2a2520] transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:text-[#ece6df] dark:hover:bg-white/5 sm:hidden"
          >
            <Plus size={15} />
            Add
          </button>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-black/8 dark:bg-white/10" />

          <ol className="space-y-3">
            {dayActivities.map((a, i) => (
              <li key={a.id}>
                <ActivityTimelineCard
                  state={state}
                  activityId={a.id}
                  isFirst={i === 0}
                  isLast={i === dayActivities.length - 1}
                />
              </li>
            ))}
          </ol>

          {dayActivities.length === 0 && (
            <div className="ml-10 rounded-xl border border-dashed border-black/10 py-10 text-center dark:border-white/10">
              <p className="text-sm text-[#8a8276] dark:text-[#a59c8e]">
                No activities yet for this day.
              </p>
              <button
                onClick={onAdd}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#c2876b] px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
              >
                <Plus size={15} />
                Add the first activity
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
