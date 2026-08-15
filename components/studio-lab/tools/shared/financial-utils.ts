// Shared financial document types and calculation utilities.
// Used by both InvoiceGenerator and EstimateBuilder.

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface PartyDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface DocumentTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

let lineItemIdCounter = 0;
export function createLineItem(description = '', quantity = 1, rate = 0): LineItem {
  return {
    id: `li-${Date.now()}-${lineItemIdCounter++}`,
    description,
    quantity,
    rate,
  };
}

export function lineItemAmount(item: LineItem): number {
  return item.quantity * item.rate;
}

export function calculateTotals(
  items: LineItem[],
  discountPercent: number,
  taxPercent: number
): DocumentTotals {
  const subtotal = items.reduce((sum, item) => sum + lineItemAmount(item), 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
  const taxableBase = subtotal - discountAmount;
  const taxAmount = Math.round(taxableBase * (taxPercent / 100) * 100) / 100;
  const total = taxableBase + taxAmount;
  return { subtotal, discountAmount, taxAmount, total };
}

const currencyLocales: Record<string, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  CAD: 'en-CA',
  AUD: 'en-AU',
  JPY: 'ja-JP',
  INR: 'en-IN',
};

export function formatCurrency(amount: number, currency: string): string {
  const locale = currencyLocales[currency] ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(amount);
}

export const currencyOptions = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'];
