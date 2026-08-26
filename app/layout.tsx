import './globals.css';

import type {
  Metadata,
} from 'next';

import {
  Inter,
  Sora,
} from 'next/font/google';

import {
  ThemeProvider,
} from '@/components/layout/ThemeProvider';

import {
  SiteChrome,
} from '@/components/layout/SiteChrome';

import {
  I18nProvider,
} from '@/lib/i18n/context';

const inter = Inter({
  subsets: [
    'latin',
  ],
  variable:
    '--font-sans',
  display:
    'swap',
});

const sora = Sora({
  subsets: [
    'latin',
  ],
  variable:
    '--font-heading',
  display:
    'swap',
  weight: [
    '400',
    '500',
    '600',
    '700',
    '800',
  ],
});

export const metadata: Metadata = {
  metadataBase:
    new URL(
      'https://bivi.pro'
    ),

  title: {
    default:
      'Bivi | Creative Studio & Resource Library',

    template:
      '%s — Bivi',
  },

  description:
    'Bivi is an independent creative studio crafting premium websites, brand systems, and a free resource library of guides, tools, and curated links for designers and founders.',

  keywords: [
    'design studio',
    'web design',
    'frontend development',
    'branding',
    'resource library',
    'design guides',
    'color palette generator',
    'creative tools',
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
      'Bivi | Creative Studio & Resource Library',

    description:
      'An independent creative studio crafting premium websites, brand systems, and a free resource library of guides, tools, and curated links.',

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
          'Bivi | Creative Studio & Resource Library',
      },
    ],
  },

  twitter: {
    card:
      'summary_large_image',

    title:
      'Bivi — Creative Studio & Resource Library',

    description:
      'An independent creative studio crafting premium websites, brand systems, and a free resource library.',

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

export default function RootLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`
        ${inter.variable}
        ${sora.variable}
      `}
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