'use client';

import { ThemeToggle } from '../ThemeToggle';
import { SettingsCard } from './SettingsCard';

export function AppearanceSection() {
  return (
    <SettingsCard
      title="Appearance"
      description="Customize how the website looks."
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
            Theme
          </p>

          <p className="text-sm text-muted-foreground">
            Light or Dark mode
          </p>
        </div>

        <ThemeToggle />
      </div>
    </SettingsCard>
  );
}