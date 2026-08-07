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
          rounded-2xl
          border
          border-border
          px-4
          py-3
        "
      >
        <div>
          <p className="font-medium">
            Language
          </p>

          <p className="text-sm text-muted-foreground">
            Interface language
          </p>
        </div>

        <LanguageSwitcher compact />
      </div>
    </SettingsCard>
  );
}