'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, X, ArrowUpDown, Plus, Filter, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FinanceState } from '../useFinanceState';
import { formatSignedCurrency, formatDate, formatDateShort } from '../utils';
import { categoryIcon } from '../categoryIcon';
import { categoryMeta, expenseCategories, allCategories } from '@/data/demos/finance-dashboard';
import type { Category } from '@/data/demos/finance-dashboard';
import { TransactionDetailDrawer } from '../TransactionDetailDrawer';
import { TransactionModal } from '../TransactionModal';

type SortKey = 'date' | 'amount' | 'merchant';
type TypeFilter = 'all' | 'income' | 'expense';

interface EditTxData {
  id: string;
  type: 'income' | 'expense';
  merchant: string;
  amount: number;
  date: string;
  category: Category;
  accountId: string;
  note?: string;
}

interface Props {
  state: FinanceState;
  onAddTransaction: () => void;
}

export function TransactionsView({ state, onAddTransaction }: Props) {
  const { transactions, accounts, activeMonthId } = state;
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [accountFilter, setAccountFilter] = useState<string | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [editTx, setEditTx] = useState<EditTxData | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const monthTransactions = useMemo(
    () => transactions.filter((t) => t.date.startsWith(activeMonthId)),
    [transactions, activeMonthId]
  );

  const filtered = useMemo(() => {
    let result = monthTransactions;
    if (typeFilter !== 'all') result = result.filter((t) => t.type === typeFilter);
    if (categoryFilter !== 'all') result = result.filter((t) => t.category === categoryFilter);
    if (accountFilter !== 'all') result = result.filter((t) => t.accountId === accountFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.merchant.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.note?.toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = a.date.localeCompare(b.date);
      else if (sortKey === 'amount') cmp = a.amount - b.amount;
      else if (sortKey === 'merchant') cmp = a.merchant.localeCompare(b.merchant);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [monthTransactions, typeFilter, categoryFilter, accountFilter, query, sortKey, sortDir]);

  const hasFilters = query.length > 0 || categoryFilter !== 'all' || accountFilter !== 'all' || typeFilter !== 'all';

  const clearFilters = useCallback(() => {
    setQuery('');
    setCategoryFilter('all');
    setAccountFilter('all');
    setTypeFilter('all');
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const selectedTx = transactions.find((t) => t.id === selectedTxId) ?? null;

  const handleEditFromDrawer = (tx: EditTxData) => {
    setEditTx(tx);
    setEditModalOpen(true);
    setSelectedTxId(null);
  };

  return (
    <div className="space-y-4">
      {/* Search + filters bar */}
      <div className="rounded-xl border border-black/5 bg-white p-4 dark:border-white/5 dark:bg-[#13161b]">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full rounded-lg border border-black/10 bg-white py-2 pl-9 pr-3 text-sm focus:border-[#2563eb] focus:outline-none dark:border-white/10 dark:bg-[#0f1115] dark:text-[#e4e7ec]"
            />
          </div>
          <button
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-2 text-sm font-medium lg:hidden dark:border-white/10"
            aria-label="Toggle filters"
          >
            <Filter size={15} />
            <span className="text-xs">{hasFilters ? 'Filtered' : 'Filter'}</span>
          </button>
          <button
            onClick={onAddTransaction}
            className="flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-3 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        {/* Desktop filters */}
        <div className="mt-3 hidden flex-wrap items-center gap-2 lg:flex">
          <FilterSelect
            label="Type"
            value={typeFilter}
            onChange={(v) => setTypeFilter(v as TypeFilter)}
            options={[
              { value: 'all', label: 'All types' },
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' },
            ]}
          />
          <FilterSelect
            label="Category"
            value={categoryFilter}
            onChange={(v) => setCategoryFilter(v as Category | 'all')}
            options={[
              { value: 'all', label: 'All categories' },
              ...allCategories.map((c) => ({ value: c, label: c })),
            ]}
          />
          <FilterSelect
            label="Account"
            value={accountFilter}
            onChange={(v) => setAccountFilter(v)}
            options={[
              { value: 'all', label: 'All accounts' },
              ...accounts.map((a) => ({ value: a.id, label: a.name })),
            ]}
          />
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#ef4444] transition-colors hover:bg-[#ef4444]/5"
            >
              <X size={13} />
              Clear filters
            </button>
          )}
          <span className="ml-auto text-xs text-[#9ca3af]">
            {filtered.length} of {monthTransactions.length} transactions
          </span>
        </div>

        {/* Mobile filters drawer */}
        {mobileFiltersOpen && (
          <div className="mt-3 space-y-2 lg:hidden">
            <FilterSelect
              label="Type"
              value={typeFilter}
              onChange={(v) => setTypeFilter(v as TypeFilter)}
              options={[
                { value: 'all', label: 'All types' },
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' },
              ]}
            />
            <FilterSelect
              label="Category"
              value={categoryFilter}
              onChange={(v) => setCategoryFilter(v as Category | 'all')}
              options={[
                { value: 'all', label: 'All categories' },
                ...allCategories.map((c) => ({ value: c, label: c })),
              ]}
            />
            <FilterSelect
              label="Account"
              value={accountFilter}
              onChange={(v) => setAccountFilter(v)}
              options={[
                { value: 'all', label: 'All accounts' },
                ...accounts.map((a) => ({ value: a.id, label: a.name })),
              ]}
            />
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex w-full items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#ef4444]"
              >
                <X size={13} />
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-black/5 bg-white dark:border-white/5 dark:bg-[#13161b] lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/5 text-left dark:border-white/5">
              <SortableHeader label="Merchant" sortKey="merchant" current={sortKey} dir={sortDir} onClick={toggleSort} />
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">Category</th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">Account</th>
              <SortableHeader label="Date" sortKey="date" current={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortableHeader label="Amount" sortKey="amount" current={sortKey} dir={sortDir} onClick={toggleSort} align="right" />
              <th className="w-8 px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {filtered.map((t) => {
              const meta = categoryMeta[t.category];
              const Icon = categoryIcon(meta.icon);
              const account = accounts.find((a) => a.id === t.accountId);
              return (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTxId(t.id)}
                  className="cursor-pointer transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${meta.color}15` }}
                      >
                        <Icon size={13} style={{ color: meta.color }} />
                      </span>
                      <span className="text-sm font-medium">{t.merchant}</span>
                      {t.status === 'pending' && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-[#f59e0b]">
                          <Clock size={10} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-[#6b7280] dark:text-[#9ca3af]">{t.category}</td>
                  <td className="px-4 py-2.5 text-sm text-[#6b7280] dark:text-[#9ca3af]">{account?.name ?? '—'}</td>
                  <td className="px-4 py-2.5 text-sm text-[#6b7280] dark:text-[#9ca3af]">{formatDate(t.date)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span
                      className={cn(
                        'font-mono text-sm font-medium tabular-nums',
                        t.type === 'income' ? 'text-[#22c55e]' : 'text-[#1a1d23] dark:text-[#e4e7ec]'
                      )}
                    >
                      {formatSignedCurrency(t.amount, t.type)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <ChevronRight size={15} className="text-[#d1d5db] dark:text-[#4b5563]" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && <EmptyState hasFilters={hasFilters} onClear={clearFilters} />}
      </div>

      {/* Mobile list */}
      <div className="space-y-2 lg:hidden">
        {filtered.map((t) => {
          const meta = categoryMeta[t.category];
          const Icon = categoryIcon(meta.icon);
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTxId(t.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-black/5 bg-white p-3 text-left transition-colors dark:border-white/5 dark:bg-[#13161b]"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${meta.color}15` }}
              >
                <Icon size={15} style={{ color: meta.color }} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-medium">{t.merchant}</p>
                  {t.status === 'pending' && <Clock size={11} className="shrink-0 text-[#f59e0b]" />}
                </div>
                <p className="text-xs text-[#9ca3af]">
                  {formatDateShort(t.date)} · {t.category}
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
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-black/5 bg-white p-6 dark:border-white/5 dark:bg-[#13161b]">
            <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
          </div>
        )}
      </div>

      <TransactionDetailDrawer
        transaction={selectedTx}
        state={state}
        onClose={() => setSelectedTxId(null)}
        onEdit={handleEditFromDrawer}
      />
      <TransactionModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        state={state}
        editTransaction={editTx}
      />
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  current,
  dir,
  onClick,
  align = 'left',
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: 'asc' | 'desc';
  onClick: (k: SortKey) => void;
  align?: 'left' | 'right';
}) {
  const active = current === sortKey;
  return (
    <th className={cn('px-4 py-2.5', align === 'right' && 'text-right')}>
      <button
        onClick={() => onClick(sortKey)}
        className={cn(
          'inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors',
          active ? 'text-[#2563eb] dark:text-[#60a5fa]' : 'text-[#6b7280] hover:text-[#1a1d23] dark:text-[#9ca3af]'
        )}
      >
        {label}
        <ArrowUpDown size={12} className={cn(active && dir === 'asc' && 'rotate-180', !active && 'opacity-40')} />
      </button>
    </th>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm focus:border-[#2563eb] focus:outline-none dark:border-white/10 dark:bg-[#0f1115] dark:text-[#e4e7ec]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm font-medium">No transactions found</p>
      <p className="mt-1 text-sm text-[#9ca3af]">
        {hasFilters ? 'No transactions match these filters.' : 'No transactions for this month yet.'}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="mt-3 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
