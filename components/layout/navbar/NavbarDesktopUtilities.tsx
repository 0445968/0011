'use client';

import Link from 'next/link';

import {
  SlidersHorizontal,
} from 'lucide-react';

import {
  cn,
} from '@/lib/utils';

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
  const handleSettings =
    () => {
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
      <button
        type="button"
        onClick={
          handleSettings
        }
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

      <Link
        href="/client/login"
        className={cn(
          `
            inline-flex
            h-10
            items-center
            justify-center
            rounded-[12px]
            px-4
            font-mono
            text-[11px]
            font-semibold
            transition-colors
          `,
          surfaceActive
            ? `
                text-foreground
                hover:bg-muted
              `
            : `
                text-white
                hover:bg-white/[0.08]
              `
        )}
      >
        Log in
      </Link>

      <button
        type="button"
        onClick={onSignup}
        className={cn(
          `
            inline-flex
            h-10
            items-center
            justify-center
            rounded-[12px]
            px-4
            font-mono
            text-[11px]
            font-semibold
            transition-colors
          `,
          surfaceActive
            ? `
                bg-black
                text-white
                dark:bg-white
                dark:text-black
              `
            : `
                bg-white
                text-black
              `
        )}
      >
        Sign up
      </button>
    </div>
  );
}