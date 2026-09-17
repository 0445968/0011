import type { Metadata } from 'next';

import { PaycheckCalculator } from '@/components/resources/calculators/PaycheckCalculator';

export const metadata: Metadata = {
  title: 'Paycheck Calculator',
  description:
    'Estimate gross pay and take-home pay from hourly or salary income, deductions, overtime, and withholding.',
};

export default function PaycheckCalculatorPage() {
  return <PaycheckCalculator />;
}