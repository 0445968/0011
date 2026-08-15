'use client';

import { useState, useRef, useEffect } from 'react';
import { RotateCcw, ChevronDown, Wallet } from 'lucide-react';
import type { FinanceState } from './useFinanceState';
import { monthLabel } from './utils';
import { cn } from '@/lib/utils';

interface Props {
  state: FinanceState;
  onReset: () => void;
}

export function TopBar({ state, onReset }: Props) {
  const { user, months, activeMonthId, setActiveMonthId } = state;
  const [monthOpen, setMonthOpen] = useState(false);
  const [resetFlash, setResetFlash] = useState(false);
  const monthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) {
        setMonthOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const activeMonth = months.find((m) => m.id === activeMonthId);

  return (
    <header className="border-b border-black/5 bg-white dark:border-white/5 dark:bg-[#13161b]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand + user */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a1d23] dark:bg-white/10">
            <Wallet size={18} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="font-semibold leading-tight">Ledger</p>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
              {user.name}
            </p>
          </div>
        </div>

        {/* Month selector */}
        <div className="relative" ref={monthRef}>
          <button
            onClick={() => setMonthOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/5"
            aria-label="Select month"
            aria-expanded={monthOpen}
          >
            <span className="hidden sm:inline">{activeMonth?.label}</span>
            <span className="sm:hidden">{activeMonth?.short}</span>
            <ChevronDown size={15} className={cn('transition-transform', monthOpen && 'rotate-180')} />
          </button>

          {monthOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-lg border border-black/10 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#1a1d23]">
              {months.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveMonthId(m.id);
                    setMonthOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-black/[0.03] dark:hover:bg-white/5',
                    m.id === activeMonthId && 'font-semibold text-[#2563eb] dark:text-[#60a5fa]'
                  )}
                >
                  {m.label}
                  {m.id === activeMonthId && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] dark:bg-[#60a5fa]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            onReset();
            setResetFlash(true);
            setTimeout(() => setResetFlash(false), 1200);
          }}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
            resetFlash
              ? 'bg-[#2563eb] text-white'
              : 'text-[#6b7280] hover:bg-black/[0.04] dark:text-[#9ca3af] dark:hover:bg-white/5'
          )}
          aria-label="Reset demo"
        >
          <RotateCcw size={14} className={cn(resetFlash && 'animate-spin')} />
          <span className="hidden sm:inline">{resetFlash ? 'Reset' : 'Reset demo'}</span>
        </button>
      </div>
    </header>
  );
}
