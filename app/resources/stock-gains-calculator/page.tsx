import type { Metadata } from 'next';

import { StockGainsCalculator } from '@/components/resources/calculators/StockGainsCalculator';

export const metadata: Metadata = {
  title: 'Stock Gains Calculator',
  description:
    'Calculate stock gains or losses, investment return, cost basis, proceeds, and break-even share price.',
};

export default function StockGainsCalculatorPage() {
  return <StockGainsCalculator />;
}