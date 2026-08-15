'use client';

import { cn } from '@/lib/utils';
import { navSections } from '@/data/site';
import { useI18n } from '@/lib/i18n/context';

interface NavbarMenuProps {
  activeMega: string | null;
  onHover: (id: string) => void;
}

export function NavbarMenu({
  activeMega,
  onHover,
}: NavbarMenuProps) {
  const { t } = useI18n();

  return (
    <ul className="hidden items-center gap-1 lg:flex">
      {navSections.map((link) => (
        <li
          key={link.id}
          onMouseEnter={() => onHover(link.id)}
        >
          <a
            href={link.href}
            className={cn(
              'group relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
              activeMega === link.id
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t(`nav.${link.id}`)}

            <span
              className={cn(
                `
                absolute
                inset-x-4
                -bottom-0.5
                h-px
                origin-left
                bg-primary
                transition-transform
                duration-300
                `,
                activeMega === link.id
                  ? 'scale-x-100'
                  : 'scale-x-0 group-hover:scale-x-100'
              )}
            />
          </a>
        </li>
      ))}
    </ul>
  );
}