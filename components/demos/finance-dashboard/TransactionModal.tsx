'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FinanceState, NewTransactionInput } from './useFinanceState';
import { expenseCategories } from '@/data/demos/finance-dashboard';
import type { Category, TransactionType } from '@/data/demos/finance-dashboard';

interface Props {
  open: boolean;
  onClose: () => void;
  state: FinanceState;
  editTransaction?: { id: string; type: TransactionType; merchant: string; amount: number; date: string; category: Category; accountId: string; note?: string } | null;
}

const todayISO = () => {
  const d = new Date('2026-08-22T00:00:00');
  return d.toISOString().split('T')[0];
};

const emptyDraft = () => ({
  type: 'expense' as TransactionType,
  merchant: '',
  amount: '',
  date: todayISO(),
  category: 'Food & Dining' as Category,
  accountId: 'acc-checking',
  note: '',
});

export function TransactionModal({ open, onClose, state, editTransaction }: Props) {
  const [draft, setDraft] = useState(emptyDraft());

  useEffect(() => {
    if (open) {
      if (editTransaction) {
        setDraft({
          type: editTransaction.type,
          merchant: editTransaction.merchant,
          amount: String(editTransaction.amount),
          date: editTransaction.date,
          category: editTransaction.category,
          accountId: editTransaction.accountId,
          note: editTransaction.note ?? '',
        });
      } else {
        setDraft(emptyDraft());
      }
    }
  }, [open, editTransaction]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const canSave = draft.merchant.trim().length > 0 && Number(draft.amount) > 0;

  const handleSave = () => {
    if (!canSave) return;
    const input: NewTransactionInput = {
      type: draft.type,
      merchant: draft.merchant.trim(),
      amount: Number(draft.amount),
      date: draft.date,
      category: draft.type === 'income' ? 'Income' : draft.category,
      accountId: draft.accountId,
      note: draft.note.trim() || undefined,
    };
    if (editTransaction) {
      state.updateTransaction(editTransaction.id, input);
    } else {
      state.addTransaction(input);
    }
    onClose();
  };

  const categories = draft.type === 'income' ? ['Income' as Category] : expenseCategories;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md overflow-hidden rounded-t-xl bg-white shadow-xl dark:bg-[#1a1d23] sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tx-modal-title"
          >
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-3.5 dark:border-white/5">
              <h2 id="tx-modal-title" className="font-semibold">
                {editTransaction ? 'Edit transaction' : 'Add transaction'}
              </h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-black/5 dark:text-[#9ca3af] dark:hover:bg-white/5"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
              {/* Type toggle */}
              <div className="flex gap-1 rounded-lg bg-[#f0f1f3] p-1 dark:bg-white/5">
                {(['expense', 'income'] as TransactionType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setDraft({ ...draft, type: t, category: t === 'income' ? 'Income' : 'Food & Dining' })}
                    className={cn(
                      'flex-1 rounded-md py-2 text-sm font-medium capitalize transition-colors',
                      draft.type === t
                        ? t === 'income'
                          ? 'bg-white text-[#22c55e] shadow-sm dark:bg-[#1a1d23]'
                          : 'bg-white text-[#ef4444] shadow-sm dark:bg-[#1a1d23]'
                        : 'text-[#6b7280] dark:text-[#9ca3af]'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Merchant */}
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Description</span>
                <input
                  type="text"
                  value={draft.merchant}
                  onChange={(e) => setDraft({ ...draft, merchant: e.target.value })}
                  placeholder="e.g. Whole Foods Market"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#2563eb] focus:outline-none dark:border-white/10 dark:bg-[#13161b] dark:text-[#e4e7ec]"
                />
              </label>

              {/* Amount + Date */}
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Amount</span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6b7280]">$</span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={draft.amount}
                      onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-black/10 bg-white py-2 pl-7 pr-3 text-sm focus:border-[#2563eb] focus:outline-none dark:border-white/10 dark:bg-[#13161b] dark:text-[#e4e7ec]"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Date</span>
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#2563eb] focus:outline-none dark:border-white/10 dark:bg-[#13161b] dark:text-[#e4e7ec]"
                  />
                </label>
              </div>

              {/* Account + Category */}
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Account</span>
                  <select
                    value={draft.accountId}
                    onChange={(e) => setDraft({ ...draft, accountId: e.target.value })}
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#2563eb] focus:outline-none dark:border-white/10 dark:bg-[#13161b] dark:text-[#e4e7ec]"
                  >
                    {state.accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Category</span>
                  <select
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}
                    disabled={draft.type === 'income'}
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#2563eb] focus:outline-none disabled:opacity-60 dark:border-white/10 dark:bg-[#13161b] dark:text-[#e4e7ec]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Note */}
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Note (optional)</span>
                <input
                  type="text"
                  value={draft.note}
                  onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                  placeholder="Add a note"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-[#2563eb] focus:outline-none dark:border-white/10 dark:bg-[#13161b] dark:text-[#e4e7ec]"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-black/5 px-5 py-3.5 dark:border-white/5">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#6b7280] transition-colors hover:bg-black/5 dark:text-[#9ca3af] dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition-transform enabled:hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Check size={15} />
                {editTransaction ? 'Save changes' : 'Add transaction'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
