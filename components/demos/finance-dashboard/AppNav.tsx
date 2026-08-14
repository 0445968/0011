'use client';

import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Target,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { View } from './LedgerApp';

interface Props {
  view: View;
  onChange: (v: View) => void;
  onAddTransaction: () => void;
}

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budgets', label: 'Budgets', icon: PiggyBank },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'recurring', label: 'Recurring', icon: RefreshCw },
];

export function AppNav({ view, onChange, onAddTransaction }: Props) {
  return (
    <nav className="border-b border-black/5 bg-white dark:border-white/5 dark:bg-[#13161b]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-0.5 overflow-x-auto">
          {navItems.map((item) => {
            const active = view === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={cn(
                  'relative flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'text-[#2563eb] dark:text-[#60a5fa]'
                    : 'text-[#6b7280] hover:text-[#1a1d23] dark:text-[#9ca3af] dark:hover:text-[#e4e7ec]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={16} className="shrink-0" />
                <span className="hidden sm:inline">{item.label}</span>
                {active && (
                  <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-[#2563eb] dark:bg-[#60a5fa]" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onAddTransaction}
          className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-[#2563eb] px-3 py-1.5 text-sm font-medium text-white transition-transform hover:scale-[1.03] sm:flex"
        >
          <Plus size={15} />
          Transaction
        </button>
      </div>
    </nav>
  );
}
