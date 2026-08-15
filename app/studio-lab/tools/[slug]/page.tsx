import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { labItems, getLabItemBySlug } from '@/data/studio-lab/registry';
import { ComingSoon } from '@/components/studio-lab/shared/ComingSoon';
import { toolComponents } from '@/components/studio-lab/tools';

export function generateStaticParams() {
  return labItems
    .filter((item) => item.href.includes('/tools/'))
    .map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const item = getLabItemBySlug(params.slug);
  if (!item) return { title: 'Tool not found' };
  return {
    title: `${item.title} — Studio Lab`,
    description: item.description,
  };
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const item = getLabItemBySlug(params.slug);
  if (!item || !item.href.includes('/tools/')) notFound();

  // Look up whether an implemented component exists for this slug.
  const ToolComponent = toolComponents[item.slug];

  if (ToolComponent) {
    return <ToolComponent item={item} />;
  }

  // No implementation yet — show the coming-soon placeholder.
  return <ComingSoon item={item} />;
}
