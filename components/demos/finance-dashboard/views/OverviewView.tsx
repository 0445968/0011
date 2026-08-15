'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, ArrowDownLeft, ArrowUpRight, PiggyBank, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FinanceState } from '../useFinanceState';
import type { View } from '../LedgerApp';
import { formatCurrency, formatPercent } from '../utils';
import { AccountCard } from '../components/AccountCard';
import { NetWorthChart } from '../components/NetWorthChart';
import { CashFlowChart } from '../components/CashFlowChart';
import { CategoryBreakdown } from '../components/CategoryBreakdown';
import { RecentTransactions } from '../components/RecentTransactions';
import { Insights } from '../components/Insights';

interface Props {
  state: FinanceState;
  onAddTransaction: () => void;
  onNavigate: (v: View) => void;
}

export function OverviewView({ state, onNavigate }: Props) {
  const { derived, activeMonthId } = state;
  const netWorthChange = ((derived.netWorth - 45650) / 45650) * 100;

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryStat
          label="Net worth"
          value={formatCurrency(derived.netWorth)}
          change={netWorthChange}
          icon={Wallet}
          tone="neutral"
        />
        <SummaryStat
          label="Available cash"
          value={formatCurrency(derived.cash)}
          icon={PiggyBank}
          tone="neutral"
        />
        <SummaryStat
          label="Monthly income"
          value={formatCurrency(derived.income)}
          icon={ArrowDownLeft}
          tone="positive"
        />
        <SummaryStat
          label="Monthly spending"
          value={formatCurrency(derived.spending)}
          icon={ArrowUpRight}
          tone="negative"
        />
      </div>

      {/* Savings rate banner */}
      <div className="flex items-center justify-between rounded-xl border border-black/5 bg-white px-5 py-4 dark:border-white/5 dark:bg-[#13161b]">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">
            Savings rate · {state.months.find((m) => m.id === activeMonthId)?.label}
          </p>
          <p className="mt-0.5 font-mono text-2xl font-semibold tabular-nums">
            {derived.savings.toFixed(1)}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#6b7280] dark:text-[#9ca3af]">Saved this month</p>
          <p className="mt-0.5 font-mono text-lg font-semibold text-[#22c55e] tabular-nums">
            {formatCurrency(derived.income - derived.spending, { sign: true })}
          </p>
        </div>
      </div>

      {/* Accounts */}
      <section>
        <SectionHeader title="Accounts" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {derived.accounts.map((acc) => (
            <AccountCard key={acc.id} account={acc} onClick={() => onNavigate('transactions')} />
          ))}
        </div>
      </section>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <NetWorthChart state={state} />
        <CashFlowChart state={state} />
      </div>

      {/* Category + recent */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <CategoryBreakdown state={state} onNavigate={onNavigate} />
        <RecentTransactions state={state} onNavigate={onNavigate} />
      </div>

      {/* Insights */}
      <Insights state={state} />
    </div>
  );
}

function SummaryStat({
  label,
  value,
  change,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  change?: number;
  icon: typeof Wallet;
  tone: 'neutral' | 'positive' | 'negative';
}) {
  return (
    <div className="rounded-xl border border-black/5 bg-white p-4 dark:border-white/5 dark:bg-[#13161b]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">
          {label}
        </span>
        <Icon size={15} className={cn(
          tone === 'positive' && 'text-[#22c55e]',
          tone === 'negative' && 'text-[#ef4444]',
          tone === 'neutral' && 'text-[#6b7280] dark:text-[#9ca3af]'
        )} />
      </div>
      <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums sm:text-2xl">
        {value}
      </p>
      {change !== undefined && (
        <div className="mt-1 flex items-center gap-1 text-xs">
          {change >= 0 ? (
            <TrendingUp size={13} className="text-[#22c55e]" />
          ) : (
            <TrendingDown size={13} className="text-[#ef4444]" />
          )}
          <span className={change >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
            {formatPercent(change)}
          </span>
          <span className="text-[#9ca3af]">this month</span>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">
        {title}
      </h2>
      {action}
    </div>
  );
}
