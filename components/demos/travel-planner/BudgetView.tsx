'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TripState } from './useTripState';
import { computeBudget, activityTypeLabels } from './useTripState';
import { activityIcons } from './icons';
import { Euro, BedDouble, Check } from './icons';

interface Props {
  state: TripState;
}

export function BudgetView({ state }: Props) {
  const { trip, activities, days, activeDayId } = state;
  const budget = useMemo(
    () => computeBudget(trip, activities),
    [trip, activities]
  );

  const activeDay = days.find((d) => d.id === activeDayId);
  const dayExpenses = activities
    .filter((a) => a.dayId === activeDayId && a.cost > 0)
    .sort((a, b) => a.time.localeCompare(b.time));

  const allExpenses = activities
    .filter((a) => a.cost > 0)
    .sort((a, b) => {
      const dayA = days.find((d) => d.id === a.dayId)?.index ?? 0;
      const dayB = days.find((d) => d.id === b.dayId)?.index ?? 0;
      if (dayA !== dayB) return dayA - dayB;
      return a.time.localeCompare(b.time);
    });

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Total budget"
          value={`€${trip.budgetTotal.toLocaleString()}`}
          muted
        />
        <SummaryCard
          label="Spent / planned"
          value={`€${budget.totalSpent.toLocaleString()}`}
          sub={`${Math.round(budget.pct)}% of total`}
        />
        <SummaryCard
          label="Remaining"
          value={`€${budget.remaining.toLocaleString()}`}
          sub={budget.remaining < 0 ? 'Over budget' : 'Available to spend'}
          tone={budget.remaining < 0 ? 'danger' : 'good'}
        />
      </div>

      {/* Progress bar + category breakdown */}
      <div className="rounded-xl border border-black/5 bg-white p-5 dark:border-white/5 dark:bg-[#221d17]">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Budget progress</span>
          <span className="text-[#8a8276] dark:text-[#a59c8e]">
            €{budget.totalSpent.toLocaleString()} / €{trip.budgetTotal.toLocaleString()}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[#f0e9df] dark:bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(budget.pct, 100)}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'h-full rounded-full',
              budget.pct > 100 ? 'bg-[#c25b5b]' : 'bg-[#c2876b]'
            )}
          />
        </div>

        {/* Category breakdown */}
        <div className="mt-5 space-y-3">
          {budget.breakdown.map((line) => {
            const pctOfTotal = (line.amount / trip.budgetTotal) * 100;
            return (
              <div key={line.category}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#2a2520] dark:text-[#ece6df]">
                    {line.label}
                  </span>
                  <span className="text-[#6b6356] dark:text-[#b8aea0]">
                    €{line.amount.toLocaleString()}
                    <span className="ml-1.5 text-xs text-[#8a8276] dark:text-[#a59c8e]">
                      {pctOfTotal.toFixed(0)}%
                    </span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#f0e9df] dark:bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pctOfTotal}%` }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: line.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* Accommodation card */}
        <div className="overflow-hidden rounded-xl border border-black/5 bg-white dark:border-white/5 dark:bg-[#221d17]">
          <div className="relative aspect-[16/9] overflow-hidden bg-[#f0e9df] dark:bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={trip.accommodation.image}
              alt={trip.accommodation.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#3a8a5c] px-2.5 py-1 text-xs font-medium text-white">
              <Check size={12} />
              {trip.accommodation.status}
            </span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2">
              <BedDouble size={16} className="text-[#c2876b]" />
              <h3 className="font-serif text-base font-semibold">
                {trip.accommodation.name}
              </h3>
            </div>
            <p className="mt-1 text-xs text-[#8a8276] dark:text-[#a59c8e]">
              {trip.accommodation.address}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-[#f0e9df] py-2 dark:bg-white/5">
                <div className="text-xs text-[#8a8276] dark:text-[#a59c8e]">Check-in</div>
                <div className="mt-0.5 text-sm font-semibold">
                  {trip.accommodation.checkIn}
                </div>
              </div>
              <div className="rounded-lg bg-[#f0e9df] py-2 dark:bg-white/5">
                <div className="text-xs text-[#8a8276] dark:text-[#a59c8e]">Check-out</div>
                <div className="mt-0.5 text-sm font-semibold">
                  {trip.accommodation.checkOut}
                </div>
              </div>
              <div className="rounded-lg bg-[#f0e9df] py-2 dark:bg-white/5">
                <div className="text-xs text-[#8a8276] dark:text-[#a59c8e]">Nights</div>
                <div className="mt-0.5 text-sm font-semibold">
                  {trip.accommodation.nights}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 dark:border-white/5">
              <span className="text-sm text-[#6b6356] dark:text-[#b8aea0]">
                €{trip.accommodation.nightlyCost} / night
              </span>
              <span className="inline-flex items-center gap-1 font-semibold">
                <Euro size={13} className="text-[#c2876b]" />
                {(trip.accommodation.nightlyCost * trip.accommodation.nights).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Day expenses */}
        <div className="rounded-xl border border-black/5 bg-white p-4 dark:border-white/5 dark:bg-[#221d17]">
          <h3 className="font-serif text-base font-semibold">
            Day {activeDay?.index} expenses
          </h3>
          <p className="text-xs text-[#8a8276] dark:text-[#a59c8e]">
            {dayExpenses.length} items
          </p>
          <ul className="mt-3 space-y-2">
            {dayExpenses.map((a) => {
              const Icon = activityIcons[a.type];
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c2876b]/10 text-[#c2876b]">
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{a.title}</div>
                    <div className="text-xs text-[#8a8276] dark:text-[#a59c8e]">
                      {a.time} · {activityTypeLabels[a.type]}
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">
                    €{a.cost}
                  </span>
                </li>
              );
            })}
          </ul>
          {dayExpenses.length === 0 && (
            <p className="mt-4 text-sm text-[#8a8276] dark:text-[#a59c8e]">
              No paid activities on this day.
            </p>
          )}
          {dayExpenses.length > 0 && (
            <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 text-sm dark:border-white/5">
              <span className="font-medium">Day total</span>
              <span className="font-semibold">
                €{dayExpenses.reduce((s, a) => s + a.cost, 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Full expense list */}
      <div className="rounded-xl border border-black/5 bg-white p-4 dark:border-white/5 dark:bg-[#221d17]">
        <h3 className="font-serif text-base font-semibold">
          All expenses by day
        </h3>
        <div className="mt-3 divide-y divide-black/5 dark:divide-white/5">
          {allExpenses.map((a) => {
            const day = days.find((d) => d.id === a.dayId);
            return (
              <div
                key={a.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 rounded bg-[#f0e9df] px-1.5 py-0.5 text-xs font-medium text-[#6b6356] dark:bg-white/5 dark:text-[#b8aea0]">
                    D{day?.index}
                  </span>
                  <span className="truncate">{a.title}</span>
                </div>
                <span className="shrink-0 font-medium">€{a.cost}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 dark:border-white/5">
          <span className="text-sm font-medium">Total (excl. accommodation)</span>
          <span className="font-semibold">
            €{(budget.totalSpent - budget.lines.accommodation).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  tone,
  muted,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'good' | 'danger';
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        muted
          ? 'border-black/5 bg-white/60 dark:border-white/5 dark:bg-white/[0.03]'
          : 'border-black/5 bg-white dark:border-white/5 dark:bg-[#221d17]'
      )}
    >
      <div className="text-xs font-medium uppercase tracking-[0.15em] text-[#8a8276] dark:text-[#a59c8e]">
        {label}
      </div>
      <div
        className={cn(
          'mt-1.5 font-serif text-2xl font-semibold',
          tone === 'danger' && 'text-[#c25b5b]',
          tone === 'good' && 'text-[#3a8a5c]'
        )}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-0.5 text-xs text-[#8a8276] dark:text-[#a59c8e]">
          {sub}
        </div>
      )}
    </div>
  );
}
