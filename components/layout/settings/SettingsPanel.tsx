'use client';

import { X } from 'lucide-react';

import { AppearanceSection } from './AppearanceSection';
import { LanguageSection } from './LanguageSection';
import { NewsletterSection } from './NewsletterSection';
import { SupportSection } from './SupportSection';
import { AboutSection } from './AboutSection';

export function SettingsPanel({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div
      className="
        container-page
        relative
        py-10
      "
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close preferences"
        className="
          absolute
          right-8
          top-10
          z-20
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          text-muted-foreground
          transition-colors
          hover:bg-muted
          hover:text-foreground
        "
      >
        <X size={20} />
      </button>


      {/* Header */}
      <div className="mb-10 max-w-2xl">
        <p
          className="
            text-xs
            font-semibold
            uppercase
            tracking-[0.2em]
            text-primary
          "
        >
          Preferences
        </p>

        <h2
          className="
            mt-3
            font-heading
            text-3xl
            font-semibold
            tracking-tight
          "
        >
          Customize your experience
        </h2>

        <p className="mt-3 text-muted-foreground">
          Personalize the website, manage your preferences,
          stay informed about new templates, and send us
          feedback.
        </p>
      </div>


      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        <AppearanceSection />

        <LanguageSection />

        <NewsletterSection />

        <SupportSection />
      </div>


      {/* Bottom */}
      <div className="mt-10">
        <AboutSection />
      </div>

    </div>
  );
}