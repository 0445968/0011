import type { Metadata } from 'next';

import { InterestCalculator } from '@/components/resources/calculators/InterestCalculator';

export const metadata: Metadata = {
  title: 'Interest Calculator',
  description:
    'Calculate simple and compound interest, ending balance, and interest earned with a free interest calculator.',
};

export default function InterestCalculatorPage() {
  return <InterestCalculator />;
}