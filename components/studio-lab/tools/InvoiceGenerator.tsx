'use client';

import { useState, useEffect, useCallback } from 'react';
import { Printer } from 'lucide-react';
import { LabShell } from '../shared/LabShell';
import { LineItemsEditor } from './shared/LineItemsEditor';
import { FinancialSummary } from './shared/FinancialSummary';
import { PartyDetailsForm } from './shared/PartyDetailsForm';
import { DocumentPreview } from './shared/DocumentPreview';
import { printDocument } from './shared/print';
import {
  type LineItem, type PartyDetails,
  createLineItem, calculateTotals, currencyOptions,
} from './shared/financial-utils';
import type { LabItem } from '@/data/studio-lab/registry';

const STORAGE_KEY = 'studio-lab-invoice-draft';

interface InvoiceData {
  sender: PartyDetails;
  recipient: PartyDetails;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  items: LineItem[];
  discountPercent: number;
  taxPercent: number;
  notes: string;
  terms: string;
}

const defaultData: InvoiceData = {
  sender: {
    name: 'Design Blade Studio',
    email: 'hello@designblade.studio',
    phone: '+1 (555) 123-4567',
    address: '123 Creative Ave, Suite 200, Portland, OR 97201',
  },
  recipient: {
    name: 'Acme Corporation',
    email: 'accounts@acme.com',
    phone: '',
    address: '500 Business Blvd, San Francisco, CA 94110',
  },
  invoiceNumber: 'INV-001',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  currency: 'USD',
  items: [
    createLineItem('Brand Strategy Workshop', 1, 1500),
    createLineItem('Website Design', 1, 3200),
  ],
  discountPercent: 0,
  taxPercent: 0,
  notes: 'Thank you for your business.',
  terms: 'Payment due within 14 days.',
};

function loadData(): InvoiceData {
  if (typeof window === 'undefined') return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultData, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultData;
}

export function InvoiceGenerator({ item }: { item: LabItem }) {
  const [data, setData] = useState<InvoiceData>(loadData);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, [data]);

  const totals = calculateTotals(data.items, data.discountPercent, data.taxPercent);

  const update = useCallback(<K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateSender = (field: keyof PartyDetails, value: string) =>
    setData((p) => ({ ...p, sender: { ...p.sender, [field]: value } }));
  const updateRecipient = (field: keyof PartyDetails, value: string) =>
    setData((p) => ({ ...p, recipient: { ...p.recipient, [field]: value } }));

  const addItem = () =>
    setData((p) => ({ ...p, items: [...p.items, createLineItem()] }));
  const updateItem = (id: string, field: keyof LineItem, value: string | number) =>
    setData((p) => ({
      ...p,
      items: p.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    }));
  const removeItem = (id: string) =>
    setData((p) => ({ ...p, items: p.items.filter((it) => it.id !== id) }));

  const handleReset = () => setData(defaultData);

  return (
    <LabShell item={item} onReset={handleReset}>
      {/* Print button */}
      <div className="mb-6 flex justify-end print:hidden">
        <button
          onClick={printDocument}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
        >
          <Printer size={16} />
          Print / Save as PDF
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] print:block">
        {/* Editor */}
        <div className="space-y-6 print:hidden">
          <div className="rounded-2xl border border-border bg-card p-5">
            <PartyDetailsForm title="From (Your Business)" party={data.sender} onChange={updateSender} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <PartyDetailsForm title="Bill To (Client)" party={data.recipient} onChange={updateRecipient} showPhone={false} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <label className="mb-3 block text-sm font-semibold">Invoice Details</label>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Invoice Number</label>
                <input
                  type="text"
                  value={data.invoiceNumber}
                  onChange={(e) => update('invoiceNumber', e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Currency</label>
                <select
                  value={data.currency}
                  onChange={(e) => update('currency', e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {currencyOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Issue Date</label>
                <input
                  type="date"
                  value={data.issueDate}
                  onChange={(e) => update('issueDate', e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Due Date</label>
                <input
                  type="date"
                  value={data.dueDate}
                  onChange={(e) => update('dueDate', e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <LineItemsEditor
              items={data.items}
              currency={data.currency}
              onAdd={addItem}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <FinancialSummary
              totals={totals}
              currency={data.currency}
              discountPercent={data.discountPercent}
              taxPercent={data.taxPercent}
              onDiscountChange={(v) => update('discountPercent', v)}
              onTaxChange={(v) => update('taxPercent', v)}
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <label className="text-sm font-semibold">Additional Details</label>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Notes</label>
              <textarea
                value={data.notes}
                onChange={(e) => update('notes', e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Payment Terms</label>
              <textarea
                value={data.terms}
                onChange={(e) => update('terms', e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-24 lg:self-start print:static">
          <div className="mb-2 text-xs font-medium text-muted-foreground print:hidden">Live Preview</div>
          <div className="rounded-2xl border border-border bg-muted/20 p-4 print:border-0 print:bg-white print:p-0">
            <DocumentPreview
              documentType="INVOICE"
              documentNumber={data.invoiceNumber}
              issueDate={data.issueDate}
              dueDate={data.dueDate}
              validUntil=""
              currency={data.currency}
              sender={data.sender}
              recipient={data.recipient}
              items={data.items}
              totals={totals}
              discountPercent={data.discountPercent}
              taxPercent={data.taxPercent}
              notes={data.notes}
              terms={data.terms}
            />
          </div>
        </div>
      </div>
    </LabShell>
  );
}
