'use client';

import type { LineItem, PartyDetails, DocumentTotals } from './financial-utils';
import { lineItemAmount, formatCurrency } from './financial-utils';

interface Props {
  documentType: 'INVOICE' | 'ESTIMATE';
  documentNumber: string;
  issueDate: string;
  dueDate: string;
  validUntil: string;
  currency: string;
  sender: PartyDetails;
  recipient: PartyDetails;
  items: LineItem[];
  totals: DocumentTotals;
  discountPercent: number;
  taxPercent: number;
  notes: string;
  terms: string;
  projectTitle?: string;
  timeline?: string;
}

export function DocumentPreview({
  documentType,
  documentNumber,
  issueDate,
  dueDate,
  validUntil,
  currency,
  sender,
  recipient,
  items,
  totals,
  discountPercent,
  taxPercent,
  notes,
  terms,
  projectTitle,
  timeline,
}: Props) {
  const dateLabel = documentType === 'INVOICE' ? 'Due Date' : 'Valid Until';
  const dateValue = documentType === 'INVOICE' ? dueDate : validUntil;

  return (
    <div
      id="printable-document"
      className="mx-auto max-w-[640px] rounded-xl border border-border bg-white p-8 text-foreground shadow-sm print:max-w-none print:border-0 print:shadow-none print:p-10"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border pb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            {documentType === 'INVOICE' ? 'INVOICE' : 'ESTIMATE'}
          </h2>
          {projectTitle && (
            <p className="mt-1 text-sm text-muted-foreground">{projectTitle}</p>
          )}
          <p className="mt-2 font-mono text-sm text-muted-foreground">#{documentNumber}</p>
        </div>
        <div className="text-right text-sm">
          <div className="space-y-1">
            <div>
              <span className="text-muted-foreground">Date: </span>
              <span className="font-medium">{issueDate || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{dateLabel}: </span>
              <span className="font-medium">{dateValue || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* From / To */}
      <div className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">From</p>
          <p className="font-semibold text-foreground">{sender.name || 'Your Business'}</p>
          {sender.email && <p className="text-sm text-muted-foreground">{sender.email}</p>}
          {sender.phone && <p className="text-sm text-muted-foreground">{sender.phone}</p>}
          {sender.address && <p className="text-sm text-muted-foreground">{sender.address}</p>}
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {documentType === 'INVOICE' ? 'Bill To' : 'Prepared For'}
          </p>
          <p className="font-semibold text-foreground">{recipient.name || 'Client Name'}</p>
          {recipient.email && <p className="text-sm text-muted-foreground">{recipient.email}</p>}
          {recipient.phone && <p className="text-sm text-muted-foreground">{recipient.phone}</p>}
          {recipient.address && <p className="text-sm text-muted-foreground">{recipient.address}</p>}
        </div>
      </div>

      {/* Line items table */}
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <th className="pb-2 text-left font-semibold">Description</th>
            <th className="pb-2 text-right font-semibold">Qty</th>
            <th className="pb-2 text-right font-semibold">Rate</th>
            <th className="pb-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border/50">
              <td className="py-3 text-foreground">{item.description || '—'}</td>
              <td className="py-3 text-right tabular-nums text-foreground">{item.quantity}</td>
              <td className="py-3 text-right tabular-nums text-foreground">{formatCurrency(item.rate, currency)}</td>
              <td className="py-3 text-right font-medium tabular-nums text-foreground">
                {formatCurrency(lineItemAmount(item), currency)}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-muted-foreground">
                No items
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-[240px] space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatCurrency(totals.subtotal, currency)}</span>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount ({discountPercent}%)</span>
              <span className="tabular-nums">−{formatCurrency(totals.discountAmount, currency)}</span>
            </div>
          )}
          {totals.taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({taxPercent}%)</span>
              <span className="tabular-nums">{formatCurrency(totals.taxAmount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2">
            <span className="font-heading font-bold">Total</span>
            <span className="font-heading text-lg font-bold tabular-nums">
              {formatCurrency(totals.total, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline (estimate only) */}
      {timeline && documentType === 'ESTIMATE' && (
        <div className="mt-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Estimated Timeline</p>
          <p className="text-sm text-foreground">{timeline}</p>
        </div>
      )}

      {/* Notes + Terms */}
      {(notes || terms) && (
        <div className="mt-8 space-y-4 border-t border-border pt-6">
          {notes && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Notes</p>
              <p className="text-sm text-foreground">{notes}</p>
            </div>
          )}
          {terms && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Terms</p>
              <p className="text-sm text-foreground">{terms}</p>
            </div>
          )}
        </div>
      )}

      {/* Estimate disclaimer */}
      {documentType === 'ESTIMATE' && (
        <p className="mt-6 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          This estimate is not an invoice. Final pricing may vary based on project scope.
        </p>
      )}
    </div>
  );
}
