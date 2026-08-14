'use client';

import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LineItem } from './financial-utils';
import { lineItemAmount, formatCurrency } from './financial-utils';

interface Props {
  items: LineItem[];
  currency: string;
  onAdd: () => void;
  onUpdate: (id: string, field: keyof LineItem, value: string | number) => void;
  onRemove: (id: string) => void;
}

export function LineItemsEditor({ items, currency, onAdd, onUpdate, onRemove }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold">Line Items</label>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
        >
          <Plus size={14} />
          Add Item
        </button>
      </div>

      {/* Header row (desktop only) */}
      <div className="hidden grid-cols-[1fr_80px_100px_100px_28px] gap-2 text-xs font-medium text-muted-foreground sm:grid">
        <span>Description</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Rate</span>
        <span className="text-right">Amount</span>
        <span />
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_80px_100px_100px_28px] sm:items-center"
        >
          <input
            type="text"
            value={item.description}
            onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
            placeholder="Item description"
            aria-label={`Line item ${items.indexOf(item) + 1} description`}
            className="col-span-2 h-9 rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:col-span-1"
          />
          <input
            type="number"
            value={item.quantity}
            min={0}
            step={1}
            onChange={(e) => onUpdate(item.id, 'quantity', parseFloat(e.target.value) || 0)}
            aria-label="Quantity"
            className="h-9 rounded-md border border-input bg-background px-2 text-right text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            type="number"
            value={item.rate}
            min={0}
            step="0.01"
            onChange={(e) => onUpdate(item.id, 'rate', parseFloat(e.target.value) || 0)}
            aria-label="Rate"
            className="h-9 rounded-md border border-input bg-background px-2 text-right text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="flex items-center justify-end text-sm font-medium tabular-nums">
            {formatCurrency(lineItemAmount(item), currency)}
          </span>
          <button
            onClick={() => onRemove(item.id)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-error/10 hover:text-error"
            aria-label="Remove line item"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
          No items yet. Click "Add Item" to get started.
        </div>
      )}
    </div>
  );
}
