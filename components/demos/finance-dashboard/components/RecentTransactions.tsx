'use client';

import { ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FinanceState } from '../useFinanceState';
import type { View } from '../LedgerApp';
import { formatSignedCurrency, formatDateShort } from '../utils';
import { categoryIcon } from '../categoryIcon';
import { categoryMeta } from '@/data/demos/finance-dashboard';

interface Props {
  state: FinanceState;
  onNavigate: (v: View) => void;
}

export function RecentTransactions({ state, onNavigate }: Props) {
  const recent = [...state.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <div className="rounded-xl border border-black/5 bg-white dark:border-white/5 dark:bg-[#13161b]">
      <div className="flex items-center justify-between border-b border-black/5 px-5 py-3 dark:border-white/5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">
          Recent transactions
        </h2>
        <button
          onClick={() => onNavigate('transactions')}
          className="flex items-center gap-0.5 text-xs font-medium text-[#2563eb] transition-colors hover:text-[#1d4ed8] dark:text-[#60a5fa]"
        >
          View all
          <ChevronRight size={14} />
        </button>
      </div>

      <ul className="divide-y divide-black/5 dark:divide-white/5">
        {recent.map((t) => {
          const meta = categoryMeta[t.category];
          const Icon = categoryIcon(meta.icon);
          return (
            <li key={t.id} className="flex items-center gap-3 px-5 py-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${meta.color}15` }}
              >
                <Icon size={14} style={{ color: meta.color }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.merchant}</p>
                <p className="text-xs text-[#9ca3af]">
                  {formatDateShort(t.date)} · {t.category}
                  {t.status === 'pending' && (
                    <span className="ml-1 inline-flex items-center gap-0.5 text-[#f59e0b]">
                      <Clock size={10} /> pending
                    </span>
                  )}
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 font-mono text-sm font-medium tabular-nums',
                  t.type === 'income' ? 'text-[#22c55e]' : 'text-[#1a1d23] dark:text-[#e4e7ec]'
                )}
              >
                {formatSignedCurrency(t.amount, t.type)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
