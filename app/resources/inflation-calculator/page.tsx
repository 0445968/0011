import type { Metadata } from 'next';

import { InflationCalculator } from '@/components/resources/calculators/InflationCalculator';

export const metadata: Metadata = {
  title: 'Inflation Calculator',
  description:
    'Estimate future prices and purchasing power using an annual inflation rate and time period.',
};

export default function InflationCalculatorPage() {
  return <InflationCalculator />;
}