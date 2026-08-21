'use client';

import Link from 'next/link';

import {
  ChevronDown,
} from 'lucide-react';

import {
  cn,
} from '@/lib/utils';

import {
  megaPanels,
  navSections,
} from '@/data/site';

import {
  useI18n,
} from '@/lib/i18n/context';

interface NavbarMenuProps {
  activeMega: string | null;
  onHover: (id: string) => void;
  lightAtTop?: boolean;
}

export function NavbarMenu({
  activeMega,
  onHover,
  lightAtTop = false,
}: NavbarMenuProps) {
  const {
    t,
  } = useI18n();

  return (
    <ul
      className="
        hidden
        items-center
        gap-1
        lg:flex
      "
    >
      {navSections.map(
        (link) => {
          const hasMegaMenu =
            Boolean(
              megaPanels[
                link.id
              ]
            );

          const isActive =
            activeMega ===
            link.id;

          /*
           * Help Center is currently
           * intentionally not part of
           * the translation dictionary.
           *
           * All existing site navigation
           * continues using i18n.
           */
          const label =
            link.id ===
            'helpCenter'
              ? link.label
              : t(
                  `nav.${link.id}`
                );

          return (
            <li
              key={link.id}
              onMouseEnter={() => {
                if (
                  hasMegaMenu
                ) {
                  onHover(
                    link.id
                  );
                }
              }}
            >
              <Link
                href={link.href}
                className="
                  group
                  relative
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  px-3.5
                  py-2
                  text-[14px]
                  font-medium
                "
              >
                {/* Menu title */}

                <span
                  className={cn(
                    lightAtTop
                      ? '!text-white/70'
                      : '!text-foreground'
                  )}
                >
                  {label}
                </span>

                {/* Down arrow only for mega menus */}

                {hasMegaMenu && (
                  <ChevronDown
                    size={15}
                    strokeWidth={
                      2.5
                    }
                    className={cn(
                      `
                        shrink-0
                      `,
                      lightAtTop
                        ? '!text-white/70'
                        : '!text-foreground'
                    )}
                  />
                )}

                {/* Underline */}

                <span
                  className={cn(
                    `
                      absolute
                      inset-x-3.5
                      -bottom-0.5
                      h-px
                      origin-left
                      bg-primary
                    `,
                    isActive
                      ? 'scale-x-100'
                      : `
                          scale-x-0
                          group-hover:scale-x-100
                        `
                  )}
                />
              </Link>
            </li>
          );
        }
      )}
    </ul>
  );
}