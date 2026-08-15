import type {
  Account,
  Budget,
  Category,
  Transaction,
  TransactionType,
} from '@/data/demos/finance-dashboard';

// --- Number formatting ---

export function formatCurrency(amount: number, opts?: { sign?: boolean; compact?: boolean }): string {
  const abs = Math.abs(amount);
  if (opts?.compact && abs >= 1000) {
    const v = abs / 1000;
    const str = v >= 10 ? v.toFixed(0) : v.toFixed(1);
    const prefix = amount < 0 ? '-$' : opts?.sign ? '+$' : '$';
    return `${prefix}${str}k`;
  }
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (amount < 0) return `-$${formatted}`;
  if (opts?.sign && amount > 0) return `+$${formatted}`;
  return `$${formatted}`;
}

export function formatSignedCurrency(amount: number, type: TransactionType): string {
  return type === 'income' ? `+${formatCurrency(amount)}` : `-${formatCurrency(amount)}`;
}

export function formatPercent(pct: number, decimals = 1): string {
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(decimals)}%`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// --- Date helpers ---

export function isMonth(iso: string, monthId: string): boolean {
  return iso.startsWith(monthId);
}

export function monthLabel(monthId: string): string {
  const [y, m] = monthId.split('-').map(Number);
  return new Date(y, m, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

// --- Derived financial calculations ---

export function monthlyIncome(transactions: Transaction[], monthId: string): number {
  return transactions
    .filter((t) => t.type === 'income' && isMonth(t.date, monthId))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function monthlySpending(transactions: Transaction[], monthId: string): number {
  return transactions
    .filter((t) => t.type === 'expense' && isMonth(t.date, monthId))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function savingsRate(income: number, spending: number): number {
  if (income <= 0) return 0;
  return ((income - spending) / income) * 100;
}

export interface CategoryTotal {
  category: Category;
  amount: number;
  pct: number;
  count: number;
}

export function spendingByCategory(
  transactions: Transaction[],
  monthId: string
): CategoryTotal[] {
  const totals = new Map<Category, { amount: number; count: number }>();
  for (const t of transactions) {
    if (t.type !== 'expense' || !isMonth(t.date, monthId)) continue;
    const existing = totals.get(t.category) ?? { amount: 0, count: 0 };
    totals.set(t.category, {
      amount: existing.amount + t.amount,
      count: existing.count + 1,
    });
  }
  const totalSpending = monthlySpending(transactions, monthId);
  return Array.from(totals.entries())
    .map(([category, { amount, count }]) => ({
      category,
      amount,
      count,
      pct: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function budgetUsage(
  budget: Budget,
  transactions: Transaction[],
  monthId: string
): { spent: number; remaining: number; pct: number; status: 'healthy' | 'approaching' | 'exceeded' } {
  const spent = transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.category === budget.category &&
        isMonth(t.date, monthId)
    )
    .reduce((sum, t) => sum + t.amount, 0);
  const remaining = budget.limit - spent;
  const pct = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
  let status: 'healthy' | 'approaching' | 'exceeded' = 'healthy';
  if (pct >= 100) status = 'exceeded';
  else if (pct >= 80) status = 'approaching';
  return { spent, remaining, pct, status };
}

// Account balances are derived from baseBalance + current-month net for that account.
export function derivedAccountBalance(
  account: Account,
  transactions: Transaction[],
  monthId: string
): number {
  const monthTxns = transactions.filter((t) => isMonth(t.date, monthId) && t.accountId === account.id);
  const net = monthTxns.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);
  return account.baseBalance + net;
}

export function totalBalance(accounts: Account[], transactions: Transaction[], monthId: string): number {
  return accounts.reduce(
    (sum, acc) => sum + derivedAccountBalance(acc, transactions, monthId),
    0
  );
}

export function availableCash(
  accounts: Account[],
  transactions: Transaction[],
  monthId: string
): number {
  return accounts
    .filter((a) => a.type === 'checking' || a.type === 'savings')
    .reduce(
      (sum, acc) => sum + derivedAccountBalance(acc, transactions, monthId),
      0
    );
}

export function recurringMonthlyTotal(
  items: { type: TransactionType; amount: number; frequency: string; active: boolean }[]
): number {
  const monthlyMultiplier: Record<string, number> = {
    weekly: 4.33,
    monthly: 1,
    quarterly: 1 / 3,
    annually: 1 / 12,
  };
  return items
    .filter((i) => i.active && i.type === 'expense')
    .reduce((sum, i) => sum + i.amount * (monthlyMultiplier[i.frequency] ?? 1), 0);
}

export function recurringIncomeMonthly(
  items: { type: TransactionType; amount: number; frequency: string; active: boolean }[]
): number {
  const monthlyMultiplier: Record<string, number> = {
    weekly: 4.33,
    monthly: 1,
    quarterly: 1 / 3,
    annually: 1 / 12,
  };
  return items
    .filter((i) => i.active && i.type === 'income')
    .reduce((sum, i) => sum + i.amount * (monthlyMultiplier[i.frequency] ?? 1), 0);
}

export function annualSubscriptionCost(
  items: { type: TransactionType; amount: number; frequency: string; active: boolean }[]
): number {
  const annualMultiplier: Record<string, number> = {
    weekly: 52,
    monthly: 12,
    quarterly: 4,
    annually: 1,
  };
  return items
    .filter((i) => i.active && i.type === 'expense')
    .reduce((sum, i) => sum + i.amount * (annualMultiplier[i.frequency] ?? 12), 0);
}
