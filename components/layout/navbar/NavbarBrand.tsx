'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

interface NavbarBrandProps {
  surfaceActive: boolean;
}

export function NavbarBrand({
  surfaceActive,
}: NavbarBrandProps) {
  return (
    <a
      href="/"
      className="
        flex
        items-center
      "
      aria-label="Design Blade home"
    >
      <Image
        src="/images/logo.png"
        alt="Design Blade"
        width={180}
        height={60}
        priority
        className={cn(
          `
            h-auto
            w-[70px]
          `,
          surfaceActive
            ? `
                brightness-100
                invert-0
              `
            : `
                brightness-0
                invert
              `
        )}
      />
    </a>
  );
}