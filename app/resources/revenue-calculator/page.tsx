import type { Metadata } from 'next';

import { RevenueCalculator } from '@/components/resources/calculators/RevenueCalculator';

export const metadata: Metadata = {
  title: 'Revenue Calculator',
  description:
    'Estimate revenue from units sold, price, customer count, and average revenue per customer.',
};

export default function RevenueCalculatorPage() {
  return <RevenueCalculator />;
}