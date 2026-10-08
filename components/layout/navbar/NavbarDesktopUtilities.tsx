'use client';

import { SlidersHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';

import { NavbarAccountControls } from './NavbarAccountControls';

interface NavbarDesktopUtilitiesProps {
  surfaceActive: boolean;

  onLogin: () => void;
  onSignup: () => void;

  settingsOpen: boolean;

  setSettingsOpen: (
    value: boolean
  ) => void;

  onSettingsOpen: () => void;
}

export function NavbarDesktopUtilities({
  surfaceActive,
  onSignup,
  settingsOpen,
  setSettingsOpen,
  onSettingsOpen,
}: NavbarDesktopUtilitiesProps) {
  const handleSettings = () => {
    if (settingsOpen) {
      setSettingsOpen(false);
      return;
    }

    onSettingsOpen();
    setSettingsOpen(true);
  };

  return (
    <div
      className="
        hidden
        items-center
        gap-2
        lg:flex
      "
    >
      {/* SETTINGS */}

      <button
        type="button"
        onClick={handleSettings}
        aria-label="Preferences"
        className={cn(
          `
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            transition-colors
          `,
          surfaceActive
            ? `
                text-muted-foreground
                hover:text-foreground
              `
            : `
                text-white/70
                hover:text-white
              `
        )}
      >
        <SlidersHorizontal
          size={18}
          strokeWidth={2}
        />
      </button>

      {/* ACCOUNT CONTROLS */}

      <NavbarAccountControls
        surfaceActive={surfaceActive}
        onSignup={onSignup}
      />
    </div>
  );
}