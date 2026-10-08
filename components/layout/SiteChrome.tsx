
'use client';

import {
  useSelectedLayoutSegments,
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
  const segments = useSelectedLayoutSegments();

  // Detect account routes using the Next.js
  // route tree rather than window.location.
  //
  // These correspond to the internal routes
  // used by the subdomain middleware:
  //
  // app.bivi.pro   -> /client/*
  // staff.bivi.pro -> /admin/*

  const isAccountRoute = segments.some(
    (segment) =>
      segment === 'client' ||
      segment === 'admin'
  );

  // Account pages have their own layouts
  // and must never render the public
  // navbar or footer.

  if (isAccountRoute) {
    return <>{children}</>;
  }

  // Embedded demos use a minimal layout.

  const isDemoEmbed = segments.includes(
    'embed'
  );

  if (isDemoEmbed) {
    return (
      <main>
        {children}
      </main>
    );
  }

  // Standard public website layout.

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
