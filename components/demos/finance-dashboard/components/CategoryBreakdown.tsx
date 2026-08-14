'use client';

import { motion } from 'framer-motion';
import type { FinanceState } from '../useFinanceState';
import type { View } from '../LedgerApp';
import { formatCurrency } from '../utils';
import { categoryIcon } from '../categoryIcon';
import { categoryMeta } from '@/data/demos/finance-dashboard';
import { cn } from '@/lib/utils';

interface Props {
  state: FinanceState;
  onNavigate: (v: View) => void;
}

export function CategoryBreakdown({ state, onNavigate }: Props) {
  const { derived } = state;
  const cats = derived.categoryTotals.slice(0, 7);
  const totalSpending = derived.spending;

  // Build donut chart data
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="rounded-xl border border-black/5 bg-white p-5 dark:border-white/5 dark:bg-[#13161b]">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">
        Spending by category
      </h2>

      {/* Donut */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="currentColor" strokeWidth="14" opacity="0.06" />
            {cats.map((c) => {
              const meta = categoryMeta[c.category];
              const dash = (c.pct / 100) * circumference;
              const seg = (
                <motion.circle
                  key={c.category}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={meta.color}
                  strokeWidth="14"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: `${dash} ${circumference - dash}` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <title>{c.category}: {formatCurrency(c.amount)} ({c.pct.toFixed(1)}%)</title>
                </motion.circle>
              );
              offset += dash;
              return seg;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-[#6b7280] dark:text-[#9ca3af]">Total</span>
            <span className="font-mono text-sm font-semibold tabular-nums">
              {formatCurrency(totalSpending, { compact: true })}
            </span>
          </div>
        </div>

        {/* Category list */}
        <div className="flex-1 space-y-2">
          {cats.map((c) => {
            const meta = categoryMeta[c.category];
            const Icon = categoryIcon(meta.icon);
            return (
              <button
                key={c.category}
                onClick={() => onNavigate('transactions')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${meta.color}15` }}
                >
                  <Icon size={12} style={{ color: meta.color }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium">{c.category}</span>
                    <span className="font-mono text-sm tabular-nums">{formatCurrency(c.amount)}</span>
                  </div>
                  <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-[#f0f1f3] dark:bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${c.pct}%`, backgroundColor: meta.color }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-xs text-[#9ca3af]">{c.pct.toFixed(0)}%</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
