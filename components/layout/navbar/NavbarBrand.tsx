'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  usePathname,
} from 'next/navigation';

import {
  cn,
} from '@/lib/utils';

interface NavbarBrandProps {
  surfaceActive: boolean;
}

export function NavbarBrand({
  surfaceActive,
}: NavbarBrandProps) {
  const pathname =
    usePathname();

  const isHelpCenter =
    pathname === '/help' ||
    pathname.startsWith(
      '/help/'
    );

  return (
    <div
      className="
        flex
        shrink-0
        items-end
      "
    >
      {/* ------------------------------------------------------------ */}
      {/* Design Blade logo                                            */}
      {/* ------------------------------------------------------------ */}

      <Link
        href={
          isHelpCenter
            ? '/help'
            : '/'
        }
        className="
          flex
          shrink-0
          items-center
        "
        aria-label={
          isHelpCenter
            ? 'Design Blade Help Center'
            : 'Design Blade home'
        }
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
              shrink-0
              md:w-[74px]
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
      </Link>

      {/* ------------------------------------------------------------ */}
      {/* Help Center identity                                         */}
      {/* ------------------------------------------------------------ */}

      {isHelpCenter && (
        <Link
          href="/help"
          className={cn(
            `
              mb-[2px]
              ml-4
              whitespace-nowrap
              text-[19px]
              font-semibold
              leading-none
              tracking-[-0.035em]
              transition-opacity
              duration-200
              hover:opacity-70
              sm:ml-5
              sm:text-[21px]
              md:mb-[3px]
              md:ml-6
              md:text-[24px]
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
          Help Center
        </Link>
      )}
    </div>
  );
}