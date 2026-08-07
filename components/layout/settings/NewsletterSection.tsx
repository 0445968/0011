'use client';

import { SettingsCard } from './SettingsCard';

export function NewsletterSection() {
  return (
    <SettingsCard
      title="Newsletter"
      description="Get new templates and design articles."
    >
      <div className="space-y-3">
        <input
          type="email"
          placeholder="Email address"
          className="
            w-full
            rounded-xl
            border
            border-border
            bg-background
            px-4
            py-3
            outline-none
            focus:border-primary
          "
        />

        <button
          className="
            w-full
            rounded-xl
            bg-primary
            py-3
            font-medium
            text-primary-foreground
            transition
            hover:opacity-90
          "
        >
          Subscribe
        </button>
      </div>
    </SettingsCard>
  );
}