'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check, AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FinanceState } from '../useFinanceState';
import type { View } from '../LedgerApp';
import { formatCurrency } from '../utils';
import { categoryIcon } from '../categoryIcon';
import { categoryMeta, expenseCategories } from '@/data/demos/finance-dashboard';
import type { Category } from '@/data/demos/finance-dashboard';

interface Props {
  state: FinanceState;
  onNavigate: (v: View) => void;
}

export function BudgetsView({ state, onNavigate }: Props) {
  const { derived } = state;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState('');
  const [adding, setAdding] = useState(false);
  const [newCategory, setNewCategory] = useState<Category>('Health');
  const [newLimit, setNewLimit] = useState('');
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);

  const startEdit = (id: string, limit: number) => {
    setEditingId(id);
    setEditLimit(String(limit));
  };

  const saveEdit = () => {
    if (editingId) state.updateBudget(editingId, Number(editLimit) || 0);
    setEditingId(null);
  };

  const handleAdd = () => {
    const limit = Number(newLimit);
    if (limit > 0) {
      state.addBudget({ category: newCategory, limit });
      setAdding(false);
      setNewLimit('');
    }
  };

  const availableCategories = expenseCategories.filter(
    (c) => !state.budgets.some((b) => b.category === c)
  );

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryBlock label="Total budgeted" value={formatCurrency(derived.totalBudgeted)} />
        <SummaryBlock label="Total spent" value={formatCurrency(derived.totalBudgetSpent)} />
        <SummaryBlock
          label="Remaining"
          value={formatCurrency(derived.totalBudgetRemaining)}
          tone={derived.totalBudgetRemaining < 0 ? 'negative' : 'positive'}
        />
        <SummaryBlock
          label="Over budget"
          value={String(derived.overBudgetCount)}
          tone={derived.overBudgetCount > 0 ? 'warning' : 'neutral'}
        />
      </div>

      {/* Budget list */}
      <div className="rounded-xl border border-black/5 bg-white dark:border-white/5 dark:bg-[#13161b]">
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-3 dark:border-white/5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">
            Monthly budgets
          </h2>
          <button
            onClick={() => setAdding(true)}
            disabled={availableCategories.length === 0}
            className="flex items-center gap-1 rounded-lg bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white transition-transform enabled:hover:scale-[1.03] disabled:opacity-40"
          >
            <Plus size={14} />
            Add budget
          </button>
        </div>

        <div className="divide-y divide-black/5 dark:divide-white/5">
          {/* Add new budget row */}
          <AnimatePresence>
            {adding && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Category)}
                    className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm dark:border-white/10 dark:bg-[#0f1115]"
                  >
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-[#6b7280]">$</span>
                    <input
                      type="number"
                      min={0}
                      value={newLimit}
                      onChange={(e) => setNewLimit(e.target.value)}
                      placeholder="Limit"
                      className="w-24 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm dark:border-white/10 dark:bg-[#0f1115]"
                    />
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => setAdding(false)} className="rounded-lg p-1.5 text-[#6b7280] hover:bg-black/5 dark:hover:bg-white/5">
                      <X size={15} />
                    </button>
                    <button onClick={handleAdd} className="rounded-lg bg-[#2563eb] p-1.5 text-white">
                      <Check size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {derived.budgetData.map((b) => {
            const meta = categoryMeta[b.category];
            const Icon = categoryIcon(meta.icon);
            return (
              <div key={b.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${meta.color}15` }}
                    >
                      <Icon size={14} style={{ color: meta.color }} />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{b.category}</p>
                      <p className="text-xs text-[#9ca3af]">
                        {formatCurrency(b.spent)} of {formatCurrency(b.limit)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status badge */}
                    <BudgetStatusBadge status={b.status} pct={b.pct} />

                    {/* Edit inline */}
                    {editingId === b.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          value={editLimit}
                          onChange={(e) => setEditLimit(e.target.value)}
                          className="w-20 rounded-lg border border-black/10 bg-white px-2 py-1 text-sm dark:border-white/10 dark:bg-[#0f1115]"
                          autoFocus
                        />
                        <button onClick={saveEdit} className="rounded-md bg-[#2563eb] p-1 text-white">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="rounded-md p-1 text-[#6b7280] hover:bg-black/5 dark:hover:bg-white/5">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setViewingCategory(b.category)}
                          className="rounded-md p-1.5 text-[#6b7280] transition-colors hover:bg-black/5 dark:text-[#9ca3af] dark:hover:bg-white/5"
                          aria-label="View contributing transactions"
                          title="View transactions"
                        >
                          <ChevronRight size={15} />
                        </button>
                        <button
                          onClick={() => startEdit(b.id, b.limit)}
                          className="rounded-md p-1.5 text-[#6b7280] transition-colors hover:bg-black/5 dark:text-[#9ca3af] dark:hover:bg-white/5"
                          aria-label="Edit budget"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => state.deleteBudget(b.id)}
                          className="rounded-md p-1.5 text-[#6b7280] transition-colors hover:bg-[#ef4444]/5 hover:text-[#ef4444] dark:text-[#9ca3af]"
                          aria-label="Delete budget"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f0f1f3] dark:bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(b.pct, 100)}%` }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className={cn(
                        'h-full rounded-full',
                        b.status === 'exceeded' ? 'bg-[#ef4444]' : b.status === 'approaching' ? 'bg-[#f59e0b]' : 'bg-[#22c55e]'
                      )}
                    />
                  </div>
                  <span className="shrink-0 font-mono text-xs font-medium tabular-nums">
                    {b.pct.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}

          {state.budgets.length === 0 && !adding && (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-[#9ca3af]">No budgets set. Create one to start tracking.</p>
            </div>
          )}
        </div>
      </div>

      {/* Category transactions drawer */}
      <AnimatePresence>
        {viewingCategory && (
          <CategoryTransactionsDrawer
            category={viewingCategory}
            state={state}
            onClose={() => setViewingCategory(null)}
            onNavigate={onNavigate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BudgetStatusBadge({ status, pct }: { status: 'healthy' | 'approaching' | 'exceeded'; pct: number }) {
  if (status === 'exceeded') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#ef4444]/10 px-2 py-0.5 text-xs font-medium text-[#ef4444]">
        <AlertTriangle size={11} />
        Exceeded
      </span>
    );
  }
  if (status === 'approaching') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#f59e0b]/10 px-2 py-0.5 text-xs font-medium text-[#d97706]">
        {pct.toFixed(0)}% used
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#22c55e]/10 px-2 py-0.5 text-xs font-medium text-[#16a34a]">
      Healthy
    </span>
  );
}

function SummaryBlock({ label, value, tone }: { label: string; value: string; tone?: 'positive' | 'negative' | 'warning' | 'neutral' }) {
  return (
    <div className="rounded-lg border border-black/5 bg-white p-3 dark:border-white/5 dark:bg-[#13161b]">
      <p className="text-xs font-medium uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">{label}</p>
      <p className={cn(
        'mt-1 font-mono text-lg font-semibold tabular-nums',
        tone === 'negative' && 'text-[#ef4444]',
        tone === 'positive' && 'text-[#22c55e]',
        tone === 'warning' && 'text-[#f59e0b]'
      )}>
        {value}
      </p>
    </div>
  );
}

function CategoryTransactionsDrawer({
  category,
  state,
  onClose,
  onNavigate,
}: {
  category: Category;
  state: FinanceState;
  onClose: () => void;
  onNavigate: (v: View) => void;
}) {
  const txns = state.transactions
    .filter((t) => t.category === category && t.type === 'expense' && t.date.startsWith(state.activeMonthId))
    .sort((a, b) => b.date.localeCompare(a.date));
  const meta = categoryMeta[category];
  const Icon = categoryIcon(meta.icon);
  const total = txns.reduce((s, t) => s + t.amount, 0);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-black/30" onClick={onClose} />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="fixed right-0 top-0 z-[85] flex h-full w-full max-w-sm flex-col bg-white shadow-2xl dark:bg-[#1a1d23]"
        role="dialog"
        aria-modal="true"
        aria-label={`${category} transactions`}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-3.5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${meta.color}15` }}>
              <Icon size={14} style={{ color: meta.color }} />
            </span>
            <h2 className="font-semibold">{category}</h2>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] hover:bg-black/5 dark:text-[#9ca3af] dark:hover:bg-white/5" aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-black/5 px-5 py-3 dark:border-white/5">
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af]">Total this month</p>
            <p className="font-mono text-xl font-semibold tabular-nums">{formatCurrency(total)}</p>
            <p className="text-xs text-[#9ca3af]">{txns.length} transactions</p>
          </div>
          <ul className="divide-y divide-black/5 dark:divide-white/5">
            {txns.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-5 py-2.5">
                <div>
                  <p className="text-sm font-medium">{t.merchant}</p>
                  <p className="text-xs text-[#9ca3af]">{formatDateShortSafe(t.date)}</p>
                </div>
                <span className="font-mono text-sm tabular-nums">{formatCurrency(t.amount)}</span>
              </li>
            ))}
          </ul>
          {txns.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-[#9ca3af]">
              No transactions in this category this month.
            </div>
          )}
        </div>

        <div className="border-t border-black/5 px-5 py-3 dark:border-white/5">
          <button
            onClick={() => { onClose(); onNavigate('transactions'); }}
            className="w-full rounded-lg border border-black/10 py-2 text-sm font-medium transition-colors hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/5"
          >
            View all transactions
          </button>
        </div>
      </motion.aside>
    </>
  );
}

function formatDateShortSafe(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
