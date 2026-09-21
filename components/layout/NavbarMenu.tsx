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
  onStandaloneHover: () => void;
  lightAtTop?: boolean;
}

export function NavbarMenu({
  activeMega,
  onHover,
  onStandaloneHover,
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

          const label =
            link.id ===
            'helpCenter'
              ? link.label
              : t(
                  `nav.${link.id}`
                );

          return (
            <li
              key={
                link.id
              }
              onMouseEnter={() => {
                if (
                  hasMegaMenu
                ) {
                  onHover(
                    link.id
                  );

                  return;
                }

                /*
                 * Plain navbar links
                 * immediately close any
                 * previously open mega menu.
                 */
                onStandaloneHover();
              }}
            >
              <Link
                href={
                  link.href
                }
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
                {/* -------------------------------------------------- */}
                {/* Menu title                                         */}
                {/* -------------------------------------------------- */}

                <span
                  className={cn(
                    `
                      transition-colors
                      duration-200
                    `,
                    lightAtTop
                      ? `
                          !text-white/75
                          group-hover:!text-white
                        `
                      : `
                          !text-foreground
                          group-hover:!text-primary
                        `
                  )}
                >
                  {
                    label
                  }
                </span>

                {/* -------------------------------------------------- */}
                {/* Dropdown arrow                                     */}
                {/* -------------------------------------------------- */}

                {hasMegaMenu && (
                  <ChevronDown
                    size={
                      14
                    }
                    strokeWidth={
                      2.25
                    }
                    className={cn(
                      `
                        shrink-0
                        transition-all
                        duration-200
                      `,
                      isActive
                        ? 'rotate-180'
                        : 'rotate-0',
                      lightAtTop
                        ? `
                            !text-white/60
                            group-hover:!text-white
                          `
                        : `
                            !text-muted-foreground
                            group-hover:!text-primary
                          `
                    )}
                  />
                )}

                {/* -------------------------------------------------- */}
                {/* Active / hover underline                           */}
                {/* -------------------------------------------------- */}

                <span
                  className={cn(
                    `
                      absolute
                      inset-x-3.5
                      -bottom-0.5
                      h-px
                      origin-left
                      bg-primary
                      transition-transform
                      duration-200
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