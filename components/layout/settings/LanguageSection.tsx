'use client';

import { LanguageSwitcher } from '../LanguageSwitcher';
import { SettingsCard } from './SettingsCard';

export function LanguageSection() {
  return (
    <SettingsCard
      title="Language"
      description="Choose your preferred language."
    >
      <div
        className="
          flex
          items-center
          justify-between
          rounded-xl
          border
          border-border
          px-3
          py-2.5
        "
      >
        <div>
          <p
            className="
              text-sm
              font-medium
            "
          >
            Language
          </p>

          <p
            className="
              mt-0.5
              text-xs
              text-muted-foreground
            "
          >
            Interface language
          </p>
        </div>

        <LanguageSwitcher compact />
      </div>
    </SettingsCard>
  );
}