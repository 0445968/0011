'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Pencil, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FinanceState } from './useFinanceState';
import type { Category } from '@/data/demos/finance-dashboard';
import { categoryIcon } from './categoryIcon';
import { categoryMeta } from '@/data/demos/finance-dashboard';
import { formatCurrency, formatSignedCurrency, formatDate } from './utils';

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
  transaction: {
    id: string;
    type: 'income' | 'expense';
    merchant: string;
    amount: number;
    date: string;
    category: string;
    accountId: string;
    status: 'posted' | 'pending';
    note?: string;
  } | null;
  state: FinanceState;
  onClose: () => void;
  onEdit: (tx: EditTxData) => void;
}

export function TransactionDetailDrawer({ transaction, state, onClose, onEdit }: Props) {
  const account = state.accounts.find((a) => a.id === transaction?.accountId);
  const meta = transaction ? categoryMeta[transaction.category as keyof typeof categoryMeta] : null;
  const Icon = meta ? categoryIcon(meta.icon) : null;

  return (
    <AnimatePresence>
      {transaction && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/30"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-[85] flex h-full w-full max-w-sm flex-col bg-white shadow-2xl dark:bg-[#1a1d23]"
            role="dialog"
            aria-modal="true"
            aria-label="Transaction details"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-3.5 dark:border-white/5">
              <h2 className="font-semibold">Transaction details</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-black/5 dark:text-[#9ca3af] dark:hover:bg-white/5"
                aria-label="Close drawer"
              >
                <X size={17} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* Amount */}
              <div className="mb-5 text-center">
                {meta && Icon && (
                  <div
                    className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${meta.color}15` }}
                  >
                    <Icon size={22} style={{ color: meta.color }} />
                  </div>
                )}
                <p
                  className={cn(
                    'font-mono text-2xl font-semibold tabular-nums',
                    transaction.type === 'income' ? 'text-[#22c55e]' : 'text-[#1a1d23] dark:text-[#e4e7ec]'
                  )}
                >
                  {formatSignedCurrency(transaction.amount, transaction.type)}
                </p>
                <p className="mt-1 text-sm text-[#6b7280] dark:text-[#9ca3af]">
                  {transaction.merchant}
                </p>
              </div>

              {/* Details */}
              <dl className="space-y-3">
                <DetailRow label="Status">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                    {transaction.status === 'posted' ? (
                      <>
                        <CheckCircle2 size={15} className="text-[#22c55e]" />
                        Posted
                      </>
                    ) : (
                      <>
                        <Clock size={15} className="text-[#f59e0b]" />
                        Pending
                      </>
                    )}
                  </span>
                </DetailRow>
                <DetailRow label="Date">
                  <span className="text-sm">{formatDate(transaction.date)}</span>
                </DetailRow>
                <DetailRow label="Category">
                  <span className="text-sm">{transaction.category}</span>
                </DetailRow>
                <DetailRow label="Account">
                  <span className="text-sm">{account?.name ?? '—'}</span>
                </DetailRow>
                <DetailRow label="Amount">
                  <span className="font-mono text-sm tabular-nums">
                    {formatCurrency(transaction.amount)}
                  </span>
                </DetailRow>
                {transaction.note && (
                  <div className="border-t border-black/5 pt-3 dark:border-white/5">
                    <dt className="mb-1 text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Note</dt>
                    <dd className="text-sm">{transaction.note}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Footer actions */}
            <div className="flex gap-2 border-t border-black/5 px-5 py-3.5 dark:border-white/5">
              <button
                onClick={() => {
                  if (transaction) {
                    onEdit({
                      id: transaction.id,
                      type: transaction.type,
                      merchant: transaction.merchant,
                      amount: transaction.amount,
                      date: transaction.date,
                      category: transaction.category as Category,
                      accountId: transaction.accountId,
                      note: transaction.note,
                    });
                  }
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-black/10 py-2 text-sm font-medium transition-colors hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/5"
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                onClick={() => {
                  state.deleteTransaction(transaction.id);
                  onClose();
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#ef4444]/30 py-2 text-sm font-medium text-[#ef4444] transition-colors hover:bg-[#ef4444]/5"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
