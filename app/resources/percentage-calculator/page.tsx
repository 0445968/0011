import type { Metadata } from 'next';

import { PercentageCalculator } from '@/components/resources/calculators/PercentageCalculator';

export const metadata: Metadata = {
  title: 'Percentage Calculator',
  description:
    'Free percentage calculator for percentage amounts, percentage increases, decreases, and percentage comparisons.',
};

export default function PercentageCalculatorPage() {
  return <PercentageCalculator />;
}