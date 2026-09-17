import type { Metadata } from 'next';

import { DiscountCalculator } from '@/components/resources/calculators/DiscountCalculator';

export const metadata: Metadata = {
  title: 'Discount Calculator',
  description:
    'Calculate sale prices, savings, percentage discounts, and fixed discounts with a free discount calculator.',
};

export default function DiscountCalculatorPage() {
  return <DiscountCalculator />;
}