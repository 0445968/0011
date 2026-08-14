'use client';

import { SettingsCard } from './SettingsCard';

export function NewsletterSection() {
  return (
    <SettingsCard
      title="Newsletter"
      description="Get new templates and design articles."
    >
      <div
        className="
          relative
          overflow-hidden
          rounded-xl
        "
      >
        {/* Background image */}
        <img
          src="/images/newsletter-background.jpg"
          alt=""
          aria-hidden="true"
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
        />

        {/* Subtle dark overlay for contrast */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-black/15
          "
        />

        {/* Form */}
        <div
          className="
            relative
            z-10
            space-y-2
            p-3
          "
        >
          <input
            type="email"
            placeholder="Email address"
            className="
              w-full
              rounded-xl
              border
              border-white/30
              bg-white/90
              px-3
              py-2.5
              text-sm
              text-foreground
              outline-none
              backdrop-blur-sm
              placeholder:text-muted-foreground
              focus:border-white/60
            "
          />

          <button
            type="button"
            className="
              w-full
              rounded-xl
              bg-primary
              px-3
              py-2.5
              text-sm
              font-medium
              text-primary-foreground
              transition-opacity
              hover:opacity-90
            "
          >
            Subscribe
          </button>
        </div>
      </div>
    </SettingsCard>
  );
}