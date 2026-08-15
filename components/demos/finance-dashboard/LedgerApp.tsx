'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useFinanceState } from './useFinanceState';
import { TopBar } from './TopBar';
import { AppNav } from './AppNav';
import { OverviewView } from './views/OverviewView';
import { TransactionsView } from './views/TransactionsView';
import { BudgetsView } from './views/BudgetsView';
import { GoalsView } from './views/GoalsView';
import { RecurringView } from './views/RecurringView';
import { TransactionModal } from './TransactionModal';

export type View = 'overview' | 'transactions' | 'budgets' | 'goals' | 'recurring';

export function LedgerApp() {
  const state = useFinanceState();
  const [view, setView] = useState<View>('overview');
  const [txModalOpen, setTxModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1a1d23] dark:bg-[#0f1115] dark:text-[#e4e7ec]">
      <TopBar state={state} onReset={state.reset} />
      <AppNav view={view} onChange={setView} onAddTransaction={() => setTxModalOpen(true)} />

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {view === 'overview' && (
              <OverviewView state={state} onAddTransaction={() => setTxModalOpen(true)} onNavigate={setView} />
            )}
            {view === 'transactions' && (
              <TransactionsView state={state} onAddTransaction={() => setTxModalOpen(true)} />
            )}
            {view === 'budgets' && <BudgetsView state={state} onNavigate={setView} />}
            {view === 'goals' && <GoalsView state={state} />}
            {view === 'recurring' && <RecurringView state={state} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <TransactionModal
        open={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        state={state}
      />
    </div>
  );
}
