// Centralized mock financial data for the Ledger finance-dashboard demo.

export type AccountType = 'checking' | 'savings' | 'credit' | 'investment';
export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'posted' | 'pending';
export type Frequency = 'weekly' | 'monthly' | 'quarterly' | 'annually';

export type Category =
  | 'Housing'
  | 'Food & Dining'
  | 'Transportation'
  | 'Shopping'
  | 'Entertainment'
  | 'Utilities'
  | 'Health'
  | 'Travel'
  | 'Income'
  | 'Other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  institution: string;
  maskedNumber: string; // •••• 4231
  balance: number;
  // baseBalance is the seed balance before current-month transactions are applied.
  // The live balance is derived: baseBalance + sum(current-month income) - sum(current-month expenses) for this account.
  baseBalance: number;
  trendPct: number; // vs last month
}

export interface Transaction {
  id: string;
  type: TransactionType;
  merchant: string;
  amount: number; // always positive; sign derived from type
  date: string; // ISO yyyy-mm-dd
  category: Category;
  accountId: string;
  status: TransactionStatus;
  note?: string;
}

export interface Budget {
  id: string;
  category: Category;
  limit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  targetDate: string; // ISO
  color: string;
}

export interface RecurringItem {
  id: string;
  name: string;
  type: TransactionType;
  amount: number;
  frequency: Frequency;
  nextDate: string; // ISO
  category: Category;
  accountId: string;
  active: boolean;
}

export interface NetWorthPoint {
  date: string; // ISO month start
  label: string; // "Jul"
  value: number;
}

// --- Seeded user ---
export const user = {
  name: 'Maya Brooks',
  email: 'maya.brooks@example.com',
  initials: 'MB',
};

// --- Months available in the period selector (newest first) ---
export const months = [
  { id: '2026-08', label: 'August 2026', short: 'Aug', year: 2026, month: 7 },
  { id: '2026-07', label: 'July 2026', short: 'Jul', year: 2026, month: 6 },
  { id: '2026-06', label: 'June 2026', short: 'Jun', year: 2026, month: 5 },
  { id: '2026-05', label: 'May 2026', short: 'May', year: 2026, month: 4 },
  { id: '2026-04', label: 'April 2026', short: 'Apr', year: 2026, month: 3 },
  { id: '2026-03', label: 'March 2026', short: 'Mar', year: 2026, month: 2 },
  { id: '2026-02', label: 'February 2026', short: 'Feb', year: 2026, month: 1 },
  { id: '2026-01', label: 'January 2026', short: 'Jan', year: 2026, month: 0 },
];

export const currentMonthId = '2026-08';

// --- Accounts ---
export const seedAccounts: Account[] = [
  {
    id: 'acc-checking',
    name: 'Everyday Checking',
    type: 'checking',
    institution: 'Northbridge Bank',
    maskedNumber: '•••• 4231',
    balance: 8426.14,
    baseBalance: 8000,
    trendPct: 2.1,
  },
  {
    id: 'acc-savings',
    name: 'High-Yield Savings',
    type: 'savings',
    institution: 'Northbridge Bank',
    maskedNumber: '•••• 8890',
    balance: 21780.5,
    baseBalance: 20000,
    trendPct: 4.2,
  },
  {
    id: 'acc-credit',
    name: 'Travel Rewards',
    type: 'credit',
    institution: 'Meridian Card',
    maskedNumber: '•••• 1102',
    balance: -1264.28,
    baseBalance: -900,
    trendPct: -8.3,
  },
  {
    id: 'acc-invest',
    name: 'Investment Portfolio',
    type: 'investment',
    institution: 'Vanguard & Co.',
    maskedNumber: '•••• 5573',
    balance: 18900.0,
    baseBalance: 18000,
    trendPct: 3.5,
  },
];

// --- Transactions (Aug 2026 = current month; some in prior months) ---
export const seedTransactions: Transaction[] = [
  // August 2026 (current)
  { id: 't1', type: 'income', merchant: 'Payroll — Northwind Studio', amount: 4850.0, date: '2026-08-01', category: 'Income', accountId: 'acc-checking', status: 'posted', note: 'Bi-weekly salary deposit' },
  { id: 't2', type: 'expense', merchant: 'Greenfield Apartments', amount: 2150.0, date: '2026-08-01', category: 'Housing', accountId: 'acc-checking', status: 'posted', note: 'August rent' },
  { id: 't3', type: 'expense', merchant: 'Whole Foods Market', amount: 87.32, date: '2026-08-02', category: 'Food & Dining', accountId: 'acc-credit', status: 'posted' },
  { id: 't4', type: 'expense', merchant: 'Uber', amount: 18.45, date: '2026-08-02', category: 'Transportation', accountId: 'acc-credit', status: 'posted' },
  { id: 't5', type: 'expense', merchant: 'Spotify', amount: 11.99, date: '2026-08-03', category: 'Entertainment', accountId: 'acc-checking', status: 'posted' },
  { id: 't6', type: 'expense', merchant: 'Electric Company', amount: 142.0, date: '2026-08-03', category: 'Utilities', accountId: 'acc-checking', status: 'posted' },
  { id: 't7', type: 'expense', merchant: 'Blue Bottle Coffee', amount: 6.75, date: '2026-08-04', category: 'Food & Dining', accountId: 'acc-credit', status: 'posted' },
  { id: 't8', type: 'expense', merchant: 'Amazon', amount: 64.99, date: '2026-08-05', category: 'Shopping', accountId: 'acc-credit', status: 'posted', note: 'Desk organizer' },
  { id: 't9', type: 'expense', merchant: 'CVS Pharmacy', amount: 28.4, date: '2026-08-05', category: 'Health', accountId: 'acc-credit', status: 'posted' },
  { id: 't10', type: 'expense', merchant: 'Shell Gas Station', amount: 52.18, date: '2026-08-06', category: 'Transportation', accountId: 'acc-checking', status: 'posted' },
  { id: 't11', type: 'expense', merchant: 'Netflix', amount: 15.49, date: '2026-08-07', category: 'Entertainment', accountId: 'acc-checking', status: 'posted' },
  { id: 't12', type: 'expense', merchant: 'Chipotle', amount: 14.85, date: '2026-08-08', category: 'Food & Dining', accountId: 'acc-credit', status: 'posted' },
  { id: 't13', type: 'expense', merchant: 'Airbnb', amount: 320.0, date: '2026-08-09', category: 'Travel', accountId: 'acc-credit', status: 'posted', note: 'Weekend in Portland' },
  { id: 't14', type: 'income', merchant: 'Payroll — Northwind Studio', amount: 4850.0, date: '2026-08-15', category: 'Income', accountId: 'acc-checking', status: 'posted', note: 'Bi-weekly salary deposit' },
  { id: 't15', type: 'expense', merchant: 'Whole Foods Market', amount: 73.21, date: '2026-08-10', category: 'Food & Dining', accountId: 'acc-credit', status: 'posted' },
  { id: 't16', type: 'expense', merchant: 'Lyft', amount: 22.6, date: '2026-08-11', category: 'Transportation', accountId: 'acc-credit', status: 'posted' },
  { id: 't17', type: 'expense', merchant: 'Apple Store', amount: 129.0, date: '2026-08-12', category: 'Shopping', accountId: 'acc-credit', status: 'posted', note: 'AirPods case' },
  { id: 't18', type: 'expense', merchant: 'Comcast Internet', amount: 79.99, date: '2026-08-12', category: 'Utilities', accountId: 'acc-checking', status: 'posted' },
  { id: 't19', type: 'expense', merchant: 'Verizon Wireless', amount: 65.0, date: '2026-08-13', category: 'Utilities', accountId: 'acc-checking', status: 'posted' },
  { id: 't20', type: 'expense', merchant: 'Trader Joes', amount: 41.87, date: '2026-08-14', category: 'Food & Dining', accountId: 'acc-credit', status: 'posted' },
  { id: 't21', type: 'expense', merchant: 'Delta Airlines', amount: 284.0, date: '2026-08-16', category: 'Travel', accountId: 'acc-credit', status: 'posted', note: 'Flight to visit family' },
  { id: 't22', type: 'expense', merchant: 'Equinox Gym', amount: 52.0, date: '2026-08-17', category: 'Health', accountId: 'acc-checking', status: 'posted' },
  { id: 't23', type: 'expense', merchant: 'Sweetgreen', amount: 13.95, date: '2026-08-17', category: 'Food & Dining', accountId: 'acc-credit', status: 'posted' },
  { id: 't24', type: 'expense', merchant: 'Target', amount: 38.74, date: '2026-08-18', category: 'Shopping', accountId: 'acc-credit', status: 'posted' },
  { id: 't25', type: 'expense', merchant: 'AMC Theatres', amount: 24.5, date: '2026-08-19', category: 'Entertainment', accountId: 'acc-credit', status: 'posted' },
  { id: 't26', type: 'expense', merchant: 'Whole Foods Market', amount: 95.34, date: '2026-08-19', category: 'Food & Dining', accountId: 'acc-credit', status: 'posted' },
  { id: 't27', type: 'expense', merchant: 'Allstate Insurance', amount: 148.0, date: '2026-08-20', category: 'Other', accountId: 'acc-checking', status: 'posted', note: 'Auto insurance' },
  { id: 't28', type: 'expense', merchant: 'Starbucks', amount: 7.25, date: '2026-08-21', category: 'Food & Dining', accountId: 'acc-credit', status: 'pending' },
  { id: 't29', type: 'expense', merchant: 'Uber', amount: 15.3, date: '2026-08-21', category: 'Transportation', accountId: 'acc-credit', status: 'pending' },
  { id: 't30', type: 'expense', merchant: 'Best Buy', amount: 89.99, date: '2026-08-22', category: 'Shopping', accountId: 'acc-credit', status: 'pending', note: 'USB-C hub' },

  // July 2026
  { id: 't31', type: 'income', merchant: 'Payroll — Northwind Studio', amount: 4850.0, date: '2026-07-01', category: 'Income', accountId: 'acc-checking', status: 'posted', note: 'Bi-weekly salary deposit' },
  { id: 't32', type: 'expense', merchant: 'Greenfield Apartments', amount: 2150.0, date: '2026-07-01', category: 'Housing', accountId: 'acc-checking', status: 'posted', note: 'July rent' },
  { id: 't33', type: 'expense', merchant: 'Whole Foods Market', amount: 112.4, date: '2026-07-05', category: 'Food & Dining', accountId: 'acc-credit', status: 'posted' },
  { id: 't34', type: 'expense', merchant: 'Amazon', amount: 156.0, date: '2026-07-08', category: 'Shopping', accountId: 'acc-credit', status: 'posted' },
  { id: 't35', type: 'income', merchant: 'Payroll — Northwind Studio', amount: 4850.0, date: '2026-07-15', category: 'Income', accountId: 'acc-checking', status: 'posted' },
  { id: 't36', type: 'expense', merchant: 'Shell Gas Station', amount: 58.2, date: '2026-07-10', category: 'Transportation', accountId: 'acc-checking', status: 'posted' },
  { id: 't37', type: 'expense', merchant: 'Netflix', amount: 15.49, date: '2026-07-07', category: 'Entertainment', accountId: 'acc-checking', status: 'posted' },
  { id: 't38', type: 'expense', merchant: 'Electric Company', amount: 138.0, date: '2026-07-03', category: 'Utilities', accountId: 'acc-checking', status: 'posted' },
  { id: 't39', type: 'expense', merchant: 'Chipotle', amount: 16.5, date: '2026-07-12', category: 'Food & Dining', accountId: 'acc-credit', status: 'posted' },
  { id: 't40', type: 'expense', merchant: 'Airbnb', amount: 240.0, date: '2026-07-18', category: 'Travel', accountId: 'acc-credit', status: 'posted' },
];

// --- Budgets ---
export const seedBudgets: Budget[] = [
  { id: 'b1', category: 'Food & Dining', limit: 650 },
  { id: 'b2', category: 'Shopping', limit: 400 },
  { id: 'b3', category: 'Entertainment', limit: 250 },
  { id: 'b4', category: 'Transportation', limit: 300 },
  { id: 'b5', category: 'Travel', limit: 700 },
  { id: 'b6', category: 'Utilities', limit: 350 },
];

// --- Savings Goals ---
export const seedGoals: SavingsGoal[] = [
  { id: 'g1', name: 'Emergency Fund', target: 30000, current: 21780, targetDate: '2026-12-31', color: '#2563eb' },
  { id: 'g2', name: 'Japan Trip', target: 6000, current: 3450, targetDate: '2027-03-15', color: '#0891b2' },
  { id: 'g3', name: 'New Laptop', target: 2500, current: 1900, targetDate: '2026-11-01', color: '#059669' },
];

// --- Recurring ---
export const seedRecurring: RecurringItem[] = [
  { id: 'r1', name: 'Greenfield Apartments', type: 'expense', amount: 2150, frequency: 'monthly', nextDate: '2026-09-01', category: 'Housing', accountId: 'acc-checking', active: true },
  { id: 'r2', name: 'Netflix', type: 'expense', amount: 15.49, frequency: 'monthly', nextDate: '2026-09-07', category: 'Entertainment', accountId: 'acc-checking', active: true },
  { id: 'r3', name: 'Spotify', type: 'expense', amount: 11.99, frequency: 'monthly', nextDate: '2026-09-03', category: 'Entertainment', accountId: 'acc-checking', active: true },
  { id: 'r4', name: 'Comcast Internet', type: 'expense', amount: 79.99, frequency: 'monthly', nextDate: '2026-09-12', category: 'Utilities', accountId: 'acc-checking', active: true },
  { id: 'r5', name: 'Verizon Wireless', type: 'expense', amount: 65.0, frequency: 'monthly', nextDate: '2026-09-13', category: 'Utilities', accountId: 'acc-checking', active: true },
  { id: 'r6', name: 'Equinox Gym', type: 'expense', amount: 52.0, frequency: 'monthly', nextDate: '2026-09-17', category: 'Health', accountId: 'acc-checking', active: true },
  { id: 'r7', name: 'Allstate Insurance', type: 'expense', amount: 148.0, frequency: 'monthly', nextDate: '2026-09-20', category: 'Other', accountId: 'acc-checking', active: true },
  { id: 'r8', name: 'Payroll — Northwind Studio', type: 'income', amount: 4850.0, frequency: 'weekly', nextDate: '2026-08-29', category: 'Income', accountId: 'acc-checking', active: true },
  { id: 'r9', name: 'Adobe Creative Cloud', type: 'expense', amount: 54.99, frequency: 'monthly', nextDate: '2026-09-05', category: 'Shopping', accountId: 'acc-credit', active: true },
  { id: 'r10', name: 'iCloud Storage', type: 'expense', amount: 9.99, frequency: 'monthly', nextDate: '2026-09-02', category: 'Utilities', accountId: 'acc-checking', active: true },
];

// --- Net worth history (last 8 months) ---
export const seedNetWorth: NetWorthPoint[] = [
  { date: '2026-01-01', label: 'Jan', value: 38200 },
  { date: '2026-02-01', label: 'Feb', value: 39850 },
  { date: '2026-03-01', label: 'Mar', value: 41200 },
  { date: '2026-04-01', label: 'Apr', value: 43600 },
  { date: '2026-05-01', label: 'May', value: 44100 },
  { date: '2026-06-01', label: 'Jun', value: 45200 },
  { date: '2026-07-01', label: 'Jul', value: 45650 },
  { date: '2026-08-01', label: 'Aug', value: 47842 },
];

// --- Cash-flow history (last 6 months, income vs spending) ---
export const seedCashFlow: { label: string; income: number; spending: number }[] = [
  { label: 'Mar', income: 9700, spending: 6100 },
  { label: 'Apr', income: 9700, spending: 6450 },
  { label: 'May', income: 9700, spending: 5900 },
  { label: 'Jun', income: 9700, spending: 6800 },
  { label: 'Jul', income: 9700, spending: 6230 },
  { label: 'Aug', income: 9700, spending: 5240 },
];

// --- Category metadata (icon key + color) ---
export const categoryMeta: Record<Category, { color: string; icon: string }> = {
  'Housing': { color: '#8b5cf6', icon: 'home' },
  'Food & Dining': { color: '#f59e0b', icon: 'utensils' },
  'Transportation': { color: '#3b82f6', icon: 'car' },
  'Shopping': { color: '#ec4899', icon: 'shopping' },
  'Entertainment': { color: '#ef4444', icon: 'film' },
  'Utilities': { color: '#06b6d4', icon: 'zap' },
  'Health': { color: '#10b981', icon: 'heart' },
  'Travel': { color: '#f97316', icon: 'plane' },
  'Income': { color: '#22c55e', icon: 'trending-up' },
  'Other': { color: '#64748b', icon: 'tag' },
};

export const allCategories: Category[] = [
  'Housing',
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Health',
  'Travel',
  'Income',
  'Other',
];

export const expenseCategories: Category[] = [
  'Housing',
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Health',
  'Travel',
  'Other',
];
