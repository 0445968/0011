'use client';

import { cn } from '@/lib/utils';
import type { DocumentTotals } from './financial-utils';
import { formatCurrency } from './financial-utils';

interface Props {
  totals: DocumentTotals;
  currency: string;
  discountPercent: number;
  taxPercent: number;
  onDiscountChange: (value: number) => void;
  onTaxChange: (value: number) => void;
}

export function FinancialSummary({
  totals, currency, discountPercent, taxPercent,
  onDiscountChange, onTaxChange,
}: Props) {
  return (
    <div className="space-y-4">
      <label className="text-sm font-semibold">Summary</label>

      {/* Discount + Tax inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Discount (%)</label>
          <input
            type="number"
            value={discountPercent || ''}
            min={0}
            max={100}
            step="0.5"
            onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
            placeholder="0"
            aria-label="Discount percentage"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Tax (%)</label>
          <input
            type="number"
            value={taxPercent || ''}
            min={0}
            step="0.5"
            onChange={(e) => onTaxChange(parseFloat(e.target.value) || 0)}
            placeholder="0"
            aria-label="Tax percentage"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Totals */}
      <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
        <SummaryRow label="Subtotal" value={formatCurrency(totals.subtotal, currency)} />
        {totals.discountAmount > 0 && (
          <SummaryRow
            label={`Discount (${discountPercent}%)`}
            value={`−${formatCurrency(totals.discountAmount, currency)}`}
            muted
          />
        )}
        {totals.taxAmount > 0 && (
          <SummaryRow
            label={`Tax (${taxPercent}%)`}
            value={formatCurrency(totals.taxAmount, currency)}
            muted
          />
        )}
        <div className="border-t border-border pt-2">
          <div className="flex items-center justify-between">
            <span className="font-heading font-semibold">Total</span>
            <span className="font-heading text-lg font-bold tabular-nums">
              {formatCurrency(totals.total, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={cn(muted ? 'text-muted-foreground' : '')}>{label}</span>
      <span className={cn('tabular-nums', muted ? 'text-muted-foreground' : 'font-medium')}>{value}</span>
    </div>
  );
}
