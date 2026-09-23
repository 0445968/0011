import type { Metadata } from 'next';

import { ProfitCalculator } from '@/components/resources/calculators/ProfitCalculator';

export const metadata: Metadata = {
  title: 'Profit Calculator',
  description:
    'Calculate business profit, profit margin, costs, and cost ratio with a free profit calculator.',
};

export default function ProfitCalculatorPage() {
  return <ProfitCalculator />;
}