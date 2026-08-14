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
            Theme
          </p>

          <p
            className="
              mt-0.5
              text-xs
              text-muted-foreground
            "
          >
            Light or Dark mode
          </p>
        </div>

        <ThemeToggle />
      </div>
    </SettingsCard>
  );
}