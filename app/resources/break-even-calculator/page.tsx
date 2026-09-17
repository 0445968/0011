import type { Metadata } from 'next';

import { BreakEvenCalculator } from '@/components/resources/calculators/BreakEvenCalculator';

export const metadata: Metadata = {
  title: 'Break-Even Calculator',
  description:
    'Calculate break-even units, contribution margin, and break-even revenue with a free business break-even calculator.',
};

export default function BreakEvenCalculatorPage() {
  return <BreakEvenCalculator />;
}