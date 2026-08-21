import {
  notFound,
} from 'next/navigation';

import type {
  Metadata,
} from 'next';

import {
  demos,
  getDemoBySlug,
} from '@/data/demos/registry';

import {
  DemoLanding,
} from '@/components/demos/shared/DemoLanding';

export function generateStaticParams() {
  return demos.map((demo) => ({
    slug: demo.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: {
    slug: string;
  };
}): Promise<Metadata> {
  const demo =
    getDemoBySlug(
      params.slug
    );

  if (!demo) {
    return {
      title:
        'Demo not found',
    };
  }

  return {
    title: `${demo.productName} — Interactive Demo`,

    description:
      demo.shortDescription,

    openGraph: {
      title: `${demo.productName} — Interactive Demo`,

      description:
        demo.shortDescription,

      images: [
        {
          url:
            demo.thumbnail,

          alt:
            `${demo.productName} demo`,
        },
      ],
    },
  };
}

export default function DemoLandingPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const demo =
    getDemoBySlug(
      params.slug
    );

  if (!demo) {
    notFound();
  }

  return (
    <DemoLanding
      demo={demo}
    />
  );
}