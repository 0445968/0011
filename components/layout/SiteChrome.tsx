'use client';

import {
  usePathname,
} from 'next/navigation';

import {
  Navbar,
} from '@/components/layout/Navbar';

import {
  Footer,
} from '@/components/layout/Footer';

interface SiteChromeProps {
  children: React.ReactNode;
}

export function SiteChrome({
  children,
}: SiteChromeProps) {
  const pathname =
    usePathname();

  const isDemoEmbed =
    pathname.includes(
      '/embed'
    );

  if (isDemoEmbed) {
    return (
      <main>
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar />

      <main>
        {children}
      </main>

      <Footer />
    </>
  );
}