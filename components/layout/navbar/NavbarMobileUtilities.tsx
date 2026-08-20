'use client';

import {
  Menu,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { SearchCommand } from '../SearchCommand';
import { NavbarSettings } from '../settings/NavbarSettings';

interface NavbarMobileUtilitiesProps {
  surfaceActive: boolean;

  open: boolean;
  setOpen: (
    value: boolean
  ) => void;

  searchOpen: boolean;
  setSearchOpen: (
    value: boolean
  ) => void;

  settingsOpen: boolean;
  setSettingsOpen: (
    value: boolean
  ) => void;

  onSearchOpen: () => void;
  onSettingsOpen: () => void;
}

export function NavbarMobileUtilities({
  surfaceActive,
  open,
  setOpen,
  searchOpen,
  setSearchOpen,
  settingsOpen,
  setSettingsOpen,
  onSearchOpen,
  onSettingsOpen,
}: NavbarMobileUtilitiesProps) {
  const utilityColor = surfaceActive
    ? `
        [&_button]:!text-foreground
      `
    : `
        [&_button]:!text-white
      `;

  return (
    <div
      className="
        flex
        items-center
        gap-1
        lg:hidden
      "
    >
      {/* Search */}
      <div
        className={cn(
          `
            [&_button]:!transition-none
          `,
          utilityColor
        )}
      >
        <SearchCommand
          open={searchOpen}
          setOpen={setSearchOpen}
          onOpen={onSearchOpen}
        />
      </div>

      {/* Settings */}
      <div
        className={cn(
          `
            [&_button]:!transition-none
          `,
          utilityColor
        )}
      >
        <NavbarSettings
          open={settingsOpen}
          setOpen={setSettingsOpen}
          onOpen={onSettingsOpen}
        />
      </div>

      {/* Mobile navigation toggle */}
      <button
        type="button"
        onClick={() => {
          setSearchOpen(false);
          setSettingsOpen(false);

          setOpen(!open);
        }}
        aria-label={
          open
            ? 'Close menu'
            : 'Open menu'
        }
        aria-expanded={open}
        className={cn(
          `
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-lg
          `,
          surfaceActive
            ? `
                text-foreground
              `
            : `
                text-white
              `
        )}
      >
        {open ? (
          <X
            size={21}
            strokeWidth={2.4}
          />
        ) : (
          <Menu
            size={21}
            strokeWidth={2.4}
          />
        )}
      </button>
    </div>
  );
}