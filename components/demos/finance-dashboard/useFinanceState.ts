'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  seedAccounts,
  seedBudgets,
  seedGoals,
  seedRecurring,
  seedTransactions,
  currentMonthId,
  months,
  type Account,
  type Budget,
  type Category,
  type RecurringItem,
  type SavingsGoal,
  type Transaction,
  type TransactionType,
  type Frequency,
} from '@/data/demos/finance-dashboard';
import {
  derivedAccountBalance,
  totalBalance,
  availableCash,
  monthlyIncome,
  monthlySpending,
  savingsRate,
  spendingByCategory,
  budgetUsage,
  recurringMonthlyTotal,
  recurringIncomeMonthly,
  annualSubscriptionCost,
} from './utils';

let idCounter = 1000;
const nextId = (prefix: string) => `${prefix}${idCounter++}`;

export interface NewTransactionInput {
  type: TransactionType;
  merchant: string;
  amount: number;
  date: string;
  category: Category;
  accountId: string;
  note?: string;
}

export interface NewBudgetInput {
  category: Category;
  limit: number;
}

export interface NewGoalInput {
  name: string;
  target: number;
  current: number;
  targetDate: string;
  color: string;
}

export interface NewRecurringInput {
  name: string;
  type: TransactionType;
  amount: number;
  frequency: Frequency;
  nextDate: string;
  category: Category;
  accountId: string;
}

export function useFinanceState() {
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(seedBudgets);
  const [goals, setGoals] = useState<SavingsGoal[]>(seedGoals);
  const [recurring, setRecurring] = useState<RecurringItem[]>(seedRecurring);
  const [activeMonthId, setActiveMonthId] = useState(currentMonthId);

  // --- Transaction CRUD ---
  const addTransaction = useCallback((input: NewTransactionInput) => {
    const txn: Transaction = {
      id: nextId('t'),
      type: input.type,
      merchant: input.merchant,
      amount: input.amount,
      date: input.date,
      category: input.category,
      accountId: input.accountId,
      status: 'posted',
      note: input.note,
    };
    setTransactions((prev) => [txn, ...prev]);
  }, []);

  const updateTransaction = useCallback((id: string, input: Partial<NewTransactionInput>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...input } : t))
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- Budget CRUD ---
  const addBudget = useCallback((input: NewBudgetInput) => {
    setBudgets((prev) => [...prev, { id: nextId('b'), ...input }]);
  }, []);

  const updateBudget = useCallback((id: string, limit: number) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, limit } : b)));
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // --- Goal CRUD ---
  const addGoal = useCallback((input: NewGoalInput) => {
    setGoals((prev) => [...prev, { id: nextId('g'), ...input }]);
  }, []);

  const updateGoal = useCallback((id: string, input: Partial<NewGoalInput>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...input } : g)));
  }, []);

  const contributeToGoal = useCallback((id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, current: Math.max(0, g.current + amount) } : g
      )
    );
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  // --- Recurring CRUD ---
  const addRecurring = useCallback((input: NewRecurringInput) => {
    setRecurring((prev) => [...prev, { id: nextId('r'), ...input, active: true }]);
  }, []);

  const updateRecurring = useCallback((id: string, input: Partial<NewRecurringInput>) => {
    setRecurring((prev) => prev.map((r) => (r.id === id ? { ...r, ...input } : r)));
  }, []);

  const deleteRecurring = useCallback((id: string) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleRecurringActive = useCallback((id: string) => {
    setRecurring((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  }, []);

  // --- Reset ---
  const reset = useCallback(() => {
    setTransactions(seedTransactions);
    setBudgets(seedBudgets);
    setGoals(seedGoals);
    setRecurring(seedRecurring);
    setActiveMonthId(currentMonthId);
  }, []);

  // --- Derived state ---
  const derived = useMemo(() => {
    const accounts = seedAccounts.map((acc) => ({
      ...acc,
      balance: derivedAccountBalance(acc, transactions, activeMonthId),
    }));

    const netWorth = totalBalance(seedAccounts, transactions, activeMonthId);
    const cash = availableCash(seedAccounts, transactions, activeMonthId);
    const income = monthlyIncome(transactions, activeMonthId);
    const spending = monthlySpending(transactions, activeMonthId);
    const savings = savingsRate(income, spending);
    const categoryTotals = spendingByCategory(transactions, activeMonthId);
    const budgetData = budgets.map((b) => ({
      ...b,
      ...budgetUsage(b, transactions, activeMonthId),
    }));
    const recurringMonthly = recurringMonthlyTotal(recurring);
    const recurringIncome = recurringIncomeMonthly(recurring);
    const annualSubs = annualSubscriptionCost(recurring);

    const prevMonthId = months.find((m) => {
      const idx = months.findIndex((mo) => mo.id === activeMonthId);
      return months.indexOf(months[idx + 1]) === idx + 1 && months[idx + 1]?.id;
    })?.id;
    const prevSpending = prevMonthId ? monthlySpending(seedTransactions, prevMonthId) : 0;
    const prevIncome = prevMonthId ? monthlyIncome(seedTransactions, prevMonthId) : 0;
    const prevSavings = savingsRate(prevIncome, prevSpending);

    const overBudgetCount = budgetData.filter((b) => b.status === 'exceeded').length;
    const totalBudgeted = budgets.reduce((s, b) => s + b.limit, 0);
    const totalBudgetSpent = budgetData.reduce((s, b) => s + b.spent, 0);

    return {
      accounts,
      netWorth,
      cash,
      income,
      spending,
      savings,
      prevSavings,
      categoryTotals,
      budgetData,
      recurringMonthly,
      recurringIncome,
      annualSubs,
      overBudgetCount,
      totalBudgeted,
      totalBudgetSpent,
      totalBudgetRemaining: totalBudgeted - totalBudgetSpent,
    };
  }, [transactions, budgets, recurring, activeMonthId]);

  return {
    user: { name: 'Maya Brooks', email: 'maya.brooks@example.com', initials: 'MB' },
    months,
    activeMonthId,
    setActiveMonthId,
    transactions,
    accounts: derived.accounts,
    budgets,
    goals,
    recurring,
    derived,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    contributeToGoal,
    deleteGoal,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    toggleRecurringActive,
    reset,
  };
}

export type FinanceState = ReturnType<typeof useFinanceState>;
