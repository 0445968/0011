'use client';

import { CreditCard, Building2, LineChart, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercent } from '../utils';
import type { Account } from '@/data/demos/finance-dashboard';

interface Props {
  account: Account;
  onClick?: () => void;
}

const typeIcons = {
  checking: Wallet,
  savings: Building2,
  credit: CreditCard,
  investment: LineChart,
};

const typeLabels = {
  checking: 'Checking',
  savings: 'Savings',
  credit: 'Credit Card',
  investment: 'Investment',
};

export function AccountCard({ account, onClick }: Props) {
  const Icon = typeIcons[account.type];
  const isNegative = account.balance < 0;

  return (
    <button
      onClick={onClick}
      className="group flex flex-col rounded-xl border border-black/5 bg-white p-4 text-left transition-all hover:border-black/10 hover:shadow-sm dark:border-white/5 dark:bg-[#13161b] dark:hover:border-white/10"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f1f3] dark:bg-white/5">
            <Icon size={15} className="text-[#6b7280] dark:text-[#9ca3af]" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">{account.name}</p>
            <p className="text-xs text-[#9ca3af]">{typeLabels[account.type]}</p>
          </div>
        </div>
      </div>

      <p className="mt-3 font-mono text-lg font-semibold tabular-nums">
        {formatCurrency(account.balance)}
      </p>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-[#9ca3af]">{account.institution}</span>
        <span className="font-mono text-xs text-[#9ca3af]">{account.maskedNumber}</span>
      </div>

      <div className="mt-2 flex items-center gap-1 text-xs">
        {account.trendPct >= 0 ? (
          <TrendingUp size={12} className="text-[#22c55e]" />
        ) : (
          <TrendingDown size={12} className="text-[#ef4444]" />
        )}
        <span className={cn(
          account.trendPct >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
        )}>
          {formatPercent(account.trendPct)}
        </span>
        <span className="text-[#9ca3af]">vs last month</span>
      </div>
    </button>
  );
}
