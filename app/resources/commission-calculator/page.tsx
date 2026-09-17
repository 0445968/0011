import type { Metadata } from 'next';

import { CommissionCalculator } from '@/components/resources/calculators/CommissionCalculator';

export const metadata: Metadata = {
  title: 'Commission Calculator',
  description:
    'Calculate sales commission, base pay, and total earnings with a free commission calculator.',
};

export default function CommissionCalculatorPage() {
  return <CommissionCalculator />;
}