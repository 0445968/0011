'use client';

import type { PartyDetails } from './financial-utils';

interface Props {
  title: string;
  party: PartyDetails;
  onChange: (field: keyof PartyDetails, value: string) => void;
  showPhone?: boolean;
}

export function PartyDetailsForm({ title, party, onChange, showPhone = true }: Props) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold">{title}</label>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          value={party.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Name / Company"
          aria-label={`${title} name`}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          type="email"
          value={party.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="Email"
          aria-label={`${title} email`}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {showPhone && (
          <input
            type="tel"
            value={party.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="Phone"
            aria-label={`${title} phone`}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        )}
        <input
          type="text"
          value={party.address}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="Address"
          aria-label={`${title} address`}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  );
}
