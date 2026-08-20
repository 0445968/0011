'use client';

import {
  ChevronDown,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { navSections } from '@/data/site';
import { useI18n } from '@/lib/i18n/context';

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
  const { t } = useI18n();

  return (
    <ul
      className="
        hidden
        items-center
        gap-1
        lg:flex
      "
    >
      {navSections.map((link) => {
        const isActive =
          activeMega === link.id;

        return (
          <li
            key={link.id}
            onMouseEnter={() =>
              onHover(link.id)
            }
          >
            <a
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
                {t(
                  `nav.${link.id}`
                )}
              </span>

              {/* Down arrow */}
              <ChevronDown
                size={15}
                strokeWidth={2.5}
                className={cn(
                  `
                    shrink-0
                  `,
                  lightAtTop
                    ? '!text-white/70'
                    : '!text-foreground'
                )}
              />

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
            </a>
          </li>
        );
      })}
    </ul>
  );
}