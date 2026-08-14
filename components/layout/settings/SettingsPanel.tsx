'use client';

import { X } from 'lucide-react';

import { AppearanceSection } from './AppearanceSection';
import { LanguageSection } from './LanguageSection';
import { NewsletterSection } from './NewsletterSection';
import { SupportSection } from './SupportSection';
import { AboutSection } from './AboutSection';

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({
  onClose,
}: SettingsPanelProps) {
  return (
    <div
      className="
        container-page
        relative
        min-h-full
        py-5
        pb-8
      "
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preferences"
        className="
          absolute
          right-8
          top-5
          z-20
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-full
          text-muted-foreground
          transition-colors
          hover:bg-muted
          hover:text-foreground
        "
      >
        <X size={17} />
      </button>

      {/* Header */}
      <div
        className="
          mb-4
          max-w-xl
          pr-14
        "
      >
        <p
          className="
            text-[10px]
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
            mt-1.5
            font-heading
            text-xl
            font-semibold
            tracking-tight
          "
        >
          Customize your experience
        </h2>

        <p
          className="
            mt-1.5
            text-xs
            leading-5
            text-muted-foreground
          "
        >
          Personalize the website, manage your preferences,
          stay informed about new templates, and send us
          feedback.
        </p>
      </div>

      {/* Settings grid */}
      <div
        className="
          grid
          grid-cols-1
          gap-4
          lg:grid-cols-2
        "
      >
        <AppearanceSection />

        <LanguageSection />

        <NewsletterSection />

        <SupportSection />
      </div>

      {/* Footer */}
      <div
        className="
          mt-4
          border-t
          border-border
          pt-3
        "
      >
        <AboutSection />
      </div>
    </div>
  );
}