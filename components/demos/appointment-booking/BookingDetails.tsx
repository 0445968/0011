'use client';

import type { BookingGuest } from './types';

interface BookingDetailsProps {
  guest: BookingGuest;
  onChange: (
    field: keyof BookingGuest,
    value: string
  ) => void;
}

export function BookingDetails({
  guest,
  onChange,
}: BookingDetailsProps) {
  return (
    <div className="space-y-5">
      <Field
        label="Name"
        required
        value={guest.name}
        placeholder="Your name"
        onChange={(value) => onChange('name', value)}
      />

      <Field
        label="Email"
        required
        type="email"
        value={guest.email}
        placeholder="you@company.com"
        onChange={(value) => onChange('email', value)}
      />

      <Field
        label="Company"
        value={guest.company}
        placeholder="Company or organization"
        onChange={(value) => onChange('company', value)}
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-[#35383e] dark:text-[#d8dade]">
          Anything we should know?
        </label>

        <textarea
          value={guest.notes}
          onChange={(event) =>
            onChange('notes', event.target.value)
          }
          placeholder="Share context, goals, or questions..."
          rows={5}
          className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#17181b] outline-none transition placeholder:text-[#a5a8ae] focus:border-[#0B65F3]/50 focus:ring-4 focus:ring-[#0B65F3]/10 dark:border-white/10 dark:bg-[#181a1f] dark:text-white"
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  required = false,
  type = 'text',
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#35383e] dark:text-[#d8dade]">
        {label}
        {required ? (
          <span className="ml-1 text-[#0B65F3]">*</span>
        ) : null}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-[#17181b] outline-none transition placeholder:text-[#a5a8ae] focus:border-[#0B65F3]/50 focus:ring-4 focus:ring-[#0B65F3]/10 dark:border-white/10 dark:bg-[#181a1f] dark:text-white"
      />
    </div>
  );
}
