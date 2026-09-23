import type { Metadata } from 'next';

import { PaymentCalculator } from '@/components/resources/calculators/PaymentCalculator';

export const metadata: Metadata = {
  title: 'Payment Calculator',
  description:
    'Estimate monthly, biweekly, or weekly financing payments, total interest, and total repayment cost.',
};

export default function PaymentCalculatorPage() {
  return <PaymentCalculator />;
}