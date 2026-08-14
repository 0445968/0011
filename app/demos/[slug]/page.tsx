import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { demos, getDemoBySlug } from '@/data/demos/registry';
import { DemoRunner } from '@/components/demos/shared/DemoRunner';

export function generateStaticParams() {
  return demos.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const demo = getDemoBySlug(params.slug);
  if (!demo) return { title: 'Demo not found' };
  return {
    title: `${demo.productName} — Demo`,
    description: demo.shortDescription,
    openGraph: {
      title: `${demo.productName} — Interactive Demo`,
      description: demo.shortDescription,
      images: [{ url: demo.thumbnail, alt: demo.productName }],
    },
  };
}

export default function DemoPage({
  params,
}: {
  params: { slug: string };
}) {
  const demo = getDemoBySlug(params.slug);
  if (!demo) notFound();
  return <DemoRunner demo={demo} />;
}
