import type { Metadata } from 'next';

import { SalesTaxCalculator } from '@/components/resources/calculators/SalesTaxCalculator';

export const metadata: Metadata = {
  title: 'Sales Tax Calculator',
  description:
    'Calculate sales tax using 2026 U.S. state-level tax presets, a local tax rate, or a custom sales tax rate.',
};

export default function SalesTaxCalculatorPage() {
  return <SalesTaxCalculator />;
}