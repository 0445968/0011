import type { Metadata } from 'next';

import { GrossMarginCalculator } from '@/components/resources/calculators/GrossMarginCalculator';

export const metadata: Metadata = {
  title: 'Gross Margin Calculator',
  description:
    'Calculate gross margin, gross profit, and cost of goods sold with a free gross margin calculator.',
};

export default function GrossMarginCalculatorPage() {
  return <GrossMarginCalculator />;
}