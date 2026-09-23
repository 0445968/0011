import type { Metadata } from 'next';

import { SalaryCalculator } from '@/components/resources/calculators/SalaryCalculator';

export const metadata: Metadata = {
  title: 'Salary Calculator',
  description:
    'Convert hourly, daily, weekly, monthly, and yearly income with a free salary calculator.',
};

export default function SalaryCalculatorPage() {
  return <SalaryCalculator />;
}