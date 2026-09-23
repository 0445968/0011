import type { Metadata } from 'next';

import { MarkupCalculator } from '@/components/resources/calculators/MarkupCalculator';

export const metadata: Metadata = {
  title: 'Markup Calculator',
  description:
    'Calculate markup percentage, selling price, gross profit, and margin with a free markup calculator.',
};

export default function MarkupCalculatorPage() {
  return <MarkupCalculator />;
}