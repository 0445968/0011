import type { Metadata } from 'next';

import { InvestmentCalculator } from '@/components/resources/calculators/InvestmentCalculator';

export const metadata: Metadata = {
  title: 'Investment Calculator',
  description:
    'Project investment growth using an initial investment, recurring contributions, expected return, and time.',
};

export default function InvestmentCalculatorPage() {
  return <InvestmentCalculator />;
}