import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { labItems, getLabItemBySlug } from '@/data/studio-lab/registry';
import { getAssessmentDefinition } from '@/data/studio-lab/assessments';
import { ComingSoon } from '@/components/studio-lab/shared/ComingSoon';
import { AssessmentView } from '@/components/studio-lab/shared/AssessmentView';

export function generateStaticParams() {
  return labItems
    .filter((item) => item.href.includes('/assessments/'))
    .map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const item = getLabItemBySlug(params.slug);
  if (!item) return { title: 'Assessment not found' };
  return {
    title: `${item.title} — Studio Lab`,
    description: item.description,
  };
}

export default function AssessmentPage({ params }: { params: { slug: string } }) {
  const item = getLabItemBySlug(params.slug);
  if (!item || !item.href.includes('/assessments/')) notFound();

  // Look up whether an assessment definition exists for this slug.
  const definition = getAssessmentDefinition(params.slug);

  if (definition) {
    return <AssessmentView item={item} definition={definition} />;
  }

  // No implementation yet — show the coming-soon placeholder.
  return <ComingSoon item={item} />;
}
