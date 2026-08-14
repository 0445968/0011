'use client';

import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FinanceState } from '../useFinanceState';
import { formatCurrency, formatPercent } from '../utils';

export function Insights({ state }: { state: FinanceState }) {
  const { derived } = state;
  const insights: { icon: typeof Lightbulb; tone: 'positive' | 'warning' | 'neutral' | 'info'; text: string }[] = [];

  // 1. Top spending category vs total
  if (derived.categoryTotals.length > 0) {
    const top = derived.categoryTotals[0];
    insights.push({
      icon: top.category === 'Housing' ? PiggyBank : TrendingUp,
      tone: 'neutral',
      text: `${top.category} is your largest spending category at ${formatCurrency(top.amount)} (${top.pct.toFixed(0)}% of total).`,
    });
  }

  // 2. Budget approaching/exceeded
  const approaching = derived.budgetData.find((b) => b.status === 'approaching');
  const exceeded = derived.budgetData.find((b) => b.status === 'exceeded');
  if (exceeded) {
    insights.push({
      icon: AlertTriangle,
      tone: 'warning',
      text: `Your ${exceeded.category} budget is exceeded — ${formatCurrency(exceeded.spent)} spent of ${formatCurrency(exceeded.limit)} limit.`,
    });
  } else if (approaching) {
    insights.push({
      icon: AlertTriangle,
      tone: 'warning',
      text: `You've used ${approaching.pct.toFixed(0)}% of your ${approaching.category} budget — ${formatCurrency(approaching.limit - approaching.spent)} remaining.`,
    });
  }

  // 3. Savings rate change
  const savingsDelta = derived.savings - derived.prevSavings;
  if (Math.abs(savingsDelta) > 0.1) {
    insights.push({
      icon: savingsDelta > 0 ? TrendingUp : TrendingDown,
      tone: savingsDelta > 0 ? 'positive' : 'warning',
      text: `Your savings rate ${savingsDelta > 0 ? 'improved' : 'decreased'} by ${Math.abs(savingsDelta).toFixed(1)}% compared to last month.`,
    });
  }

  // 4. Recurring cost
  insights.push({
    icon: PiggyBank,
    tone: 'info',
    text: `You have ${formatCurrency(derived.recurringMonthly)} in recurring subscriptions and bills each month.`,
  });

  const toneStyles = {
    positive: 'border-[#22c55e]/20 bg-[#22c55e]/5 text-[#16a34a]',
    warning: 'border-[#f59e0b]/20 bg-[#f59e0b]/5 text-[#d97706]',
    neutral: 'border-black/5 bg-[#f7f8fa] text-[#6b7280] dark:border-white/5 dark:bg-white/[0.02] dark:text-[#9ca3af]',
    info: 'border-[#2563eb]/20 bg-[#2563eb]/5 text-[#2563eb]',
  };

  return (
    <section>
      <div className="mb-3 flex items-center gap-1.5">
        <Lightbulb size={15} className="text-[#f59e0b]" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">
          Insights
        </h2>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {insights.map((ins, i) => {
          const Icon = ins.icon;
          return (
            <div
              key={i}
              className={cn(
                'flex items-start gap-2.5 rounded-lg border px-3.5 py-3',
                toneStyles[ins.tone]
              )}
            >
              <Icon size={16} className="mt-0.5 shrink-0" />
              <p className="text-sm leading-snug">{ins.text}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[#9ca3af]">
        These are observations from your demo data, not financial advice.
      </p>
    </section>
  );
}
