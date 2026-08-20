'use client';

import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

import { SearchCommand } from '../SearchCommand';
import { NavbarSettings } from '../settings/NavbarSettings';

interface NavbarDesktopUtilitiesProps {
  surfaceActive: boolean;

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

export function NavbarDesktopUtilities({
  surfaceActive,
  searchOpen,
  setSearchOpen,
  settingsOpen,
  setSettingsOpen,
  onSearchOpen,
  onSettingsOpen,
}: NavbarDesktopUtilitiesProps) {
  const { t } = useI18n();

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
        hidden
        items-center
        gap-2
        lg:flex
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

      {/* CTA group */}
      <div
        className="
          ml-2
          flex
          items-center
          gap-2
        "
      >
        {/* Get a Demo */}
        <a
          href="/demos"
          className={cn(
            `
              inline-flex
              h-10
              items-center
              justify-center
              px-3
              text-[14px]
              font-semibold
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
          Get a Demo
        </a>

        {/* Start a Project */}
        <a
          href="/contact"
          className="
            inline-flex
            h-10
            items-center
            justify-center
            rounded-[14px]
            bg-primary
            px-4
            text-[14px]
            font-bold
            text-primary-foreground
          "
        >
          {t('nav.startProject')}
        </a>
      </div>
    </div>
  );
}