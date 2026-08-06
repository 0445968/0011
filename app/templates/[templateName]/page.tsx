import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { templates, getTemplateBySlug } from '@/data/templates';
import { TemplatePreview } from '@/components/templates/TemplatePreview';

export function generateStaticParams() {
  return templates.map((t) => ({ templateName: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { templateName: string };
}): Promise<Metadata> {
  const template = getTemplateBySlug(params.templateName);
  if (!template) return { title: 'Template not found' };
  return {
    title: `${template.name} — Template`,
    description: template.description,
    openGraph: {
      title: `${template.name} — Atelier Template`,
      description: template.description,
      images: [{ url: template.preview, alt: template.name }],
    },
  };
}

export default function TemplatePage({
  params,
}: {
  params: { templateName: string };
}) {
  const template = getTemplateBySlug(params.templateName);
  if (!template) notFound();
  return <TemplatePreview template={template} />;
}
