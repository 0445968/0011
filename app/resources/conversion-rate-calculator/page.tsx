import type { Metadata } from 'next';

import { ConversionRateCalculator } from '@/components/resources/calculators/ConversionRateCalculator';

export const metadata: Metadata = {
  title: 'Conversion Rate Calculator',
  description:
    'Calculate marketing, sales, signup, or ecommerce conversion rates from visitors and conversions.',
};

export default function ConversionRateCalculatorPage() {
  return <ConversionRateCalculator />;
}