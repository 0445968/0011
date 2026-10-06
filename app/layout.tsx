import './globals.css';

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import '@fontsource/sora/400.css';
import '@fontsource/sora/500.css';
import '@fontsource/sora/600.css';
import '@fontsource/sora/700.css';
import '@fontsource/sora/800.css';

import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';

import type {
  CSSProperties,
} from 'react';

import type {
  Metadata,
} from 'next';

import {
  ThemeProvider,
} from '@/components/layout/ThemeProvider';

import {
  SiteChrome,
} from '@/components/layout/SiteChrome';

import {
  I18nProvider,
} from '@/lib/i18n/context';

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  metadataBase:
    new URL(
      'https://bivi.pro'
    ),

  title: {
    default:
      'Bivi | Brand Strategy and Design Studio',

    template:
      '%s — Bivi',
  },

  description:
    'Bivi is an independent creative studio helping businesses grow through brand strategy, visual identity, websites, and design.',

  keywords: [
    'design studio',
    'web design',
    'frontend development',
    'branding',
  ],

  authors: [
    {
      name:
        'Bivi',
    },
  ],

  openGraph: {
    type:
      'website',

    title:
      'Bivi | Brand Strategy and Design Studio',

    description:
      'An independent creative studio creating brand strategies, visual identities, websites, and digital experiences.',

    siteName:
      'Bivi',

    images: [
      {
        url:
          '/images/og-image.svg',

        width:
          1200,

        height:
          630,

        alt:
          'Bivi | Brand Strategy and Design Studio',
      },
    ],
  },

  twitter: {
    card:
      'summary_large_image',

    title:
      'Bivi — Brand Strategy and Design Studio',

    description:
      'An independent creative studio creating brand strategies, visual identities, and websites.',

    images: [
      '/images/og-image.svg',
    ],
  },

  robots: {
    index:
      true,

    follow:
      true,
  },
};

/* -------------------------------------------------------------------------- */
/* Root layout                                                                */
/* -------------------------------------------------------------------------- */

export default function RootLayout({
  children,
}: {
  children:
  React.ReactNode;
}) {
  const fontVariables = {
    '--font-sans':
      '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    '--font-heading':
      '"Sora", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    '--font-mono':
      '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  } as CSSProperties;

  return (
    <html
      lang="en"
      style={
        fontVariables
      }
      suppressHydrationWarning
    >
      <body
        className="
          min-h-screen
          bg-background
          font-sans
          text-foreground
          antialiased
        "
      >
        <ThemeProvider>
          <I18nProvider>
            <SiteChrome>
              {children}
            </SiteChrome>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}