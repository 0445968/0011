import type { Metadata } from 'next';

import { RevenueGrowthCalculator } from '@/components/resources/calculators/RevenueGrowthCalculator';

export const metadata: Metadata = {
  title: 'Revenue Growth Calculator',
  description:
    'Calculate revenue growth percentage and revenue change between two periods.',
};

export default function RevenueGrowthCalculatorPage() {
  return <RevenueGrowthCalculator />;
}