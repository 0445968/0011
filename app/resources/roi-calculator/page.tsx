import type { Metadata } from 'next';

import { ROICalculator } from '@/components/resources/calculators/ROICalculator';

export const metadata: Metadata = {
  title: 'ROI Calculator',
  description:
    'Calculate return on investment, net return, and investment return multiple with a free ROI calculator.',
};

export default function ROICalculatorPage() {
  return <ROICalculator />;
}