import type { Metadata } from 'next';

import { LoanCalculator } from '@/components/resources/calculators/LoanCalculator';

export const metadata: Metadata = {
  title: 'Loan Calculator',
  description:
    'Estimate loan payments, total interest, repayment cost, and the impact of extra monthly payments.',
};

export default function LoanCalculatorPage() {
  return <LoanCalculator />;
}