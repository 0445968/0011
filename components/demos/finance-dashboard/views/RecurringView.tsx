'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check, Calendar, Ban, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FinanceState, NewRecurringInput } from '../useFinanceState';
import { formatCurrency, formatDate, formatDateShort } from '../utils';
import { categoryIcon } from '../categoryIcon';
import { categoryMeta, allCategories, expenseCategories } from '@/data/demos/finance-dashboard';
import type { Category, TransactionType, Frequency } from '@/data/demos/finance-dashboard';

const frequencies: Frequency[] = ['weekly', 'monthly', 'quarterly', 'annually'];
const frequencyLabels: Record<Frequency, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
};

export function RecurringView({ state }: { state: FinanceState }) {
  const { recurring, accounts, derived } = state;
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<NewRecurringInput>({
    name: '',
    type: 'expense',
    amount: 0,
    frequency: 'monthly',
    nextDate: '2026-09-01',
    category: 'Entertainment',
    accountId: 'acc-checking',
  });

  const filtered = useMemo(
    () => recurring.filter((r) => filter === 'all' || r.type === filter),
    [recurring, filter]
  );

  // Upcoming bills (next 5 active expenses sorted by date)
  const upcoming = useMemo(
    () =>
      recurring
        .filter((r) => r.active && r.type === 'expense')
        .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
        .slice(0, 5),
    [recurring]
  );

  const handleAdd = () => {
    if (draft.name.trim() && draft.amount > 0) {
      state.addRecurring({ ...draft, name: draft.name.trim() });
      setAdding(false);
      setDraft({ name: '', type: 'expense', amount: 0, frequency: 'monthly', nextDate: '2026-09-01', category: 'Entertainment', accountId: 'acc-checking' });
    }
  };

  const startEdit = (id: string) => {
    const item = recurring.find((r) => r.id === id);
    if (item) {
      setEditingId(id);
      setDraft({ name: item.name, type: item.type, amount: item.amount, frequency: item.frequency, nextDate: item.nextDate, category: item.category, accountId: item.accountId });
    }
  };

  const handleSaveEdit = () => {
    if (editingId && draft.name.trim() && draft.amount > 0) {
      state.updateRecurring(editingId, { ...draft, name: draft.name.trim() });
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryBlock label="Monthly expenses" value={formatCurrency(derived.recurringMonthly)} tone="negative" />
        <SummaryBlock label="Recurring income" value={formatCurrency(derived.recurringIncome)} tone="positive" />
        <SummaryBlock label="Annual cost" value={formatCurrency(derived.annualSubs)} />
        <SummaryBlock label="Active items" value={String(recurring.filter((r) => r.active).length)} />
      </div>

      {/* Upcoming bills */}
      <div className="rounded-xl border border-black/5 bg-white p-4 dark:border-white/5 dark:bg-[#13161b]">
        <div className="mb-3 flex items-center gap-1.5">
          <Calendar size={15} className="text-[#2563eb] dark:text-[#60a5fa]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">
            Upcoming bills
          </h2>
        </div>
        <div className="space-y-1.5">
          {upcoming.map((item) => {
            const meta = categoryMeta[item.category];
            const Icon = categoryIcon(meta.icon);
            const account = accounts.find((a) => a.id === item.accountId);
            return (
              <div key={item.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.02]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${meta.color}15` }}>
                  <Icon size={12} style={{ color: meta.color }} />
                </span>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate text-sm font-medium">{item.name}</span>
                  <span className="hidden text-xs text-[#9ca3af] sm:inline">· {account?.name}</span>
                </div>
                <span className="shrink-0 text-xs text-[#6b7280] dark:text-[#9ca3af]">{formatDateShort(item.nextDate)}</span>
                <span className="shrink-0 font-mono text-sm font-medium tabular-nums">{formatCurrency(item.amount)}</span>
              </div>
            );
          })}
          {upcoming.length === 0 && (
            <p className="py-4 text-center text-sm text-[#9ca3af]">No upcoming bills.</p>
          )}
        </div>
      </div>

      {/* Filter + add */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 rounded-lg bg-[#f0f1f3] p-0.5 dark:bg-white/5">
          {(['all', 'expense', 'income'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                filter === f
                  ? 'bg-white text-[#1a1d23] shadow-sm dark:bg-[#1a1d23] dark:text-[#e4e7ec]'
                  : 'text-[#6b7280] dark:text-[#9ca3af]'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setAdding(true); setEditingId(null); }}
          className="flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-3 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Add recurring</span>
        </button>
      </div>

      {/* Add/Edit form */}
      <AnimatePresence>
        {(adding || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-black/5 bg-white p-4 dark:border-white/5 dark:bg-[#13161b]">
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Type */}
                <div className="flex gap-1 rounded-lg bg-[#f0f1f3] p-1 dark:bg-white/5 sm:col-span-2">
                  {(['expense', 'income'] as TransactionType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setDraft({ ...draft, type: t, category: t === 'income' ? 'Income' : draft.category })}
                      className={cn(
                        'flex-1 rounded-md py-1.5 text-sm font-medium capitalize',
                        draft.type === t ? (t === 'income' ? 'bg-white text-[#22c55e] shadow-sm dark:bg-[#1a1d23]' : 'bg-white text-[#ef4444] shadow-sm dark:bg-[#1a1d23]') : 'text-[#6b7280] dark:text-[#9ca3af]'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Name</span>
                  <input type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Gym membership" className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1115]" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Amount</span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6b7280]">$</span>
                    <input type="number" min={0} value={draft.amount || ''} onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })} placeholder="0.00" className="w-full rounded-lg border border-black/10 bg-white py-2 pl-7 pr-3 text-sm dark:border-white/10 dark:bg-[#0f1115]" />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Frequency</span>
                  <select value={draft.frequency} onChange={(e) => setDraft({ ...draft, frequency: e.target.value as Frequency })} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1115]">
                    {frequencies.map((f) => <option key={f} value={f}>{frequencyLabels[f]}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Next payment</span>
                  <input type="date" value={draft.nextDate} onChange={(e) => setDraft({ ...draft, nextDate: e.target.value })} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1115]" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Category</span>
                  <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })} disabled={draft.type === 'income'} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm disabled:opacity-60 dark:border-white/10 dark:bg-[#0f1115]">
                    {(draft.type === 'income' ? ['Income'] : expenseCategories).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Account</span>
                  <select value={draft.accountId} onChange={(e) => setDraft({ ...draft, accountId: e.target.value })} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1115]">
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </label>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button onClick={() => { setAdding(false); setEditingId(null); }} className="rounded-lg px-4 py-2 text-sm font-medium text-[#6b7280] hover:bg-black/5 dark:text-[#9ca3af] dark:hover:bg-white/5">
                  Cancel
                </button>
                <button onClick={editingId ? handleSaveEdit : handleAdd} disabled={!draft.name.trim() || draft.amount <= 0} className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
                  <Check size={15} />
                  {editingId ? 'Save' : 'Add'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recurring list */}
      <div className="rounded-xl border border-black/5 bg-white dark:border-white/5 dark:bg-[#13161b]">
        <div className="divide-y divide-black/5 dark:divide-white/5">
          {filtered.map((item) => {
            const meta = categoryMeta[item.category];
            const Icon = categoryIcon(meta.icon);
            const account = accounts.find((a) => a.id === item.accountId);
            return (
              <div key={item.id} className={cn('flex items-center gap-3 px-4 py-3', !item.active && 'opacity-50')}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${meta.color}15` }}>
                  <Icon size={14} style={{ color: meta.color }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    {!item.active && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-[#6b7280]/10 px-1.5 py-0.5 text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">
                        <Ban size={10} /> Cancelled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9ca3af]">
                    {frequencyLabels[item.frequency]} · {item.category} · {account?.name}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-[#9ca3af]">Next: {formatDateShort(item.nextDate)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    'flex items-center gap-0.5 font-mono text-sm font-medium tabular-nums',
                    item.type === 'income' ? 'text-[#22c55e]' : 'text-[#1a1d23] dark:text-[#e4e7ec]'
                  )}>
                    {item.type === 'income' ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="flex gap-0.5">
                  {item.active && (
                    <button
                      onClick={() => state.toggleRecurringActive(item.id)}
                      className="rounded-md p-1 text-[#6b7280] hover:bg-[#f59e0b]/10 hover:text-[#d97706] dark:text-[#9ca3af]"
                      aria-label="Cancel subscription"
                      title="Cancel"
                    >
                      <Ban size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(item.id)}
                    className="rounded-md p-1 text-[#6b7280] hover:bg-black/5 dark:text-[#9ca3af] dark:hover:bg-white/5"
                    aria-label="Edit"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => state.deleteRecurring(item.id)}
                    className="rounded-md p-1 text-[#6b7280] hover:bg-[#ef4444]/5 hover:text-[#ef4444] dark:text-[#9ca3af]"
                    aria-label="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-[#9ca3af]">
                {filter === 'all' ? 'No recurring payments.' : `No recurring ${filter} payments.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryBlock({ label, value, tone }: { label: string; value: string; tone?: 'positive' | 'negative' }) {
  return (
    <div className="rounded-lg border border-black/5 bg-white p-3 dark:border-white/5 dark:bg-[#13161b]">
      <p className="text-xs font-medium uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">{label}</p>
      <p className={cn(
        'mt-1 font-mono text-lg font-semibold tabular-nums',
        tone === 'positive' && 'text-[#22c55e]',
        tone === 'negative' && 'text-[#ef4444]'
      )}>
        {value}
      </p>
    </div>
  );
}
