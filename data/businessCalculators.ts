export type BusinessCalculatorId =
  | 'percentage'
  | 'paycheck'
  | 'stock-gains'
  | 'salary'
  | 'roi'
  | 'interest'
  | 'investment'
  | 'payment'
  | 'loan'
  | 'inflation'
  | 'conversion-rate'
  | 'revenue-growth'
  | 'sales-tax'
  | 'discount'
  | 'profit'
  | 'revenue'
  | 'markup'
  | 'break-even'
  | 'gross-margin'
  | 'commission';

export interface BusinessCalculator {
  id: BusinessCalculatorId;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  category: 'Business & Finance';
  tags: string[];
  featured?: boolean;
}

export const businessCalculators: BusinessCalculator[] = [
  {
    id: 'percentage',
    slug: 'percentage-calculator',
    title: 'Percentage Calculator',
    shortTitle: 'Percentage',
    description:
      'Calculate percentages, percentage differences, and percentage increases or decreases.',
    category: 'Business & Finance',
    tags: ['Percentage', 'Math', 'Business'],
    featured: true,
  },
  {
    id: 'paycheck',
    slug: 'paycheck-calculator',
    title: 'Paycheck Calculator',
    shortTitle: 'Paycheck',
    description:
      'Estimate take-home pay from gross earnings, deductions, and withholding.',
    category: 'Business & Finance',
    tags: ['Paycheck', 'Income', 'Payroll'],
  },
  {
    id: 'stock-gains',
    slug: 'stock-gains-calculator',
    title: 'Stock Gains Calculator',
    shortTitle: 'Stock Gains',
    description:
      'Calculate investment gains or losses from purchase price, sale price, shares, and fees.',
    category: 'Business & Finance',
    tags: ['Stocks', 'Investing', 'Returns'],
  },
  {
    id: 'salary',
    slug: 'salary-calculator',
    title: 'Salary Calculator',
    shortTitle: 'Salary',
    description:
      'Convert income between hourly, daily, weekly, monthly, and annual pay.',
    category: 'Business & Finance',
    tags: ['Salary', 'Income', 'Hourly Rate'],
    featured: true,
  },
  {
    id: 'roi',
    slug: 'roi-calculator',
    title: 'ROI Calculator',
    shortTitle: 'ROI',
    description:
      'Measure return on investment using your initial cost and final return.',
    category: 'Business & Finance',
    tags: ['ROI', 'Investment', 'Returns'],
    featured: true,
  },
  {
    id: 'interest',
    slug: 'interest-calculator',
    title: 'Interest Calculator',
    shortTitle: 'Interest',
    description:
      'Calculate simple or compound interest over a selected period of time.',
    category: 'Business & Finance',
    tags: ['Interest', 'Finance', 'Compound Interest'],
  },
  {
    id: 'investment',
    slug: 'investment-calculator',
    title: 'Investment Calculator',
    shortTitle: 'Investment',
    description:
      'Project investment growth using an initial balance, contributions, return rate, and time.',
    category: 'Business & Finance',
    tags: ['Investment', 'Growth', 'Compound Returns'],
    featured: true,
  },
  {
    id: 'payment',
    slug: 'payment-calculator',
    title: 'Payment Calculator',
    shortTitle: 'Payment',
    description:
      'Estimate recurring payments for a financed amount over a fixed period.',
    category: 'Business & Finance',
    tags: ['Payments', 'Finance', 'Installments'],
  },
  {
    id: 'loan',
    slug: 'loan-calculator',
    title: 'Loan Calculator',
    shortTitle: 'Loan',
    description:
      'Estimate loan payments, total interest, and total repayment cost.',
    category: 'Business & Finance',
    tags: ['Loan', 'APR', 'Payments'],
    featured: true,
  },
  {
    id: 'inflation',
    slug: 'inflation-calculator',
    title: 'Inflation Calculator',
    shortTitle: 'Inflation',
    description:
      'Estimate how inflation changes the future value and purchasing power of money.',
    category: 'Business & Finance',
    tags: ['Inflation', 'Purchasing Power', 'Finance'],
  },
  {
    id: 'conversion-rate',
    slug: 'conversion-rate-calculator',
    title: 'Conversion Rate Calculator',
    shortTitle: 'Conversion Rate',
    description:
      'Calculate the percentage of visitors, leads, or users who complete a desired action.',
    category: 'Business & Finance',
    tags: ['Conversion Rate', 'Marketing', 'Sales'],
    featured: true,
  },
  {
    id: 'revenue-growth',
    slug: 'revenue-growth-calculator',
    title: 'Revenue Growth Calculator',
    shortTitle: 'Revenue Growth',
    description:
      'Measure the percentage increase or decrease in revenue between two periods.',
    category: 'Business & Finance',
    tags: ['Revenue', 'Growth', 'Business'],
  },
  {
    id: 'sales-tax',
    slug: 'sales-tax-calculator',
    title: 'Sales Tax Calculator',
    shortTitle: 'Sales Tax',
    description:
      'Calculate sales tax using a U.S. state preset or your own custom tax rate.',
    category: 'Business & Finance',
    tags: ['Sales Tax', 'Tax', 'Business'],
    featured: true,
  },
  {
    id: 'discount',
    slug: 'discount-calculator',
    title: 'Discount Calculator',
    shortTitle: 'Discount',
    description:
      'Calculate the final price and total savings after a percentage or fixed discount.',
    category: 'Business & Finance',
    tags: ['Discount', 'Pricing', 'Savings'],
  },
  {
    id: 'profit',
    slug: 'profit-calculator',
    title: 'Profit Calculator',
    shortTitle: 'Profit',
    description:
      'Calculate profit, costs, revenue, and profit margin from your business numbers.',
    category: 'Business & Finance',
    tags: ['Profit', 'Revenue', 'Margin'],
    featured: true,
  },
  {
    id: 'revenue',
    slug: 'revenue-calculator',
    title: 'Revenue Calculator',
    shortTitle: 'Revenue',
    description:
      'Estimate total revenue from units sold, price, and optional recurring periods.',
    category: 'Business & Finance',
    tags: ['Revenue', 'Sales', 'Business'],
  },
  {
    id: 'markup',
    slug: 'markup-calculator',
    title: 'Markup Calculator',
    shortTitle: 'Markup',
    description:
      'Calculate markup percentage, selling price, cost, or gross profit.',
    category: 'Business & Finance',
    tags: ['Markup', 'Pricing', 'Profit'],
  },
  {
    id: 'break-even',
    slug: 'break-even-calculator',
    title: 'Break-Even Calculator',
    shortTitle: 'Break-Even',
    description:
      'Find how many units you need to sell to cover fixed and variable costs.',
    category: 'Business & Finance',
    tags: ['Break-Even', 'Costs', 'Pricing'],
  },
  {
    id: 'gross-margin',
    slug: 'gross-margin-calculator',
    title: 'Gross Margin Calculator',
    shortTitle: 'Gross Margin',
    description:
      'Calculate gross profit and gross margin from revenue and cost of goods sold.',
    category: 'Business & Finance',
    tags: ['Gross Margin', 'Profit', 'COGS'],
  },
  {
    id: 'commission',
    slug: 'commission-calculator',
    title: 'Commission Calculator',
    shortTitle: 'Commission',
    description:
      'Calculate commission earnings from sales, commission rate, and optional base pay.',
    category: 'Business & Finance',
    tags: ['Commission', 'Sales', 'Income'],
  },
];

export const featuredBusinessCalculators =
  businessCalculators.filter((calculator) => calculator.featured);

export function getBusinessCalculatorBySlug(
  slug: string
): BusinessCalculator | undefined {
  return businessCalculators.find(
    (calculator) => calculator.slug === slug
  );
}

export function isBusinessCalculatorSlug(
  slug: string
): boolean {
  return businessCalculators.some(
    (calculator) => calculator.slug === slug
  );
}