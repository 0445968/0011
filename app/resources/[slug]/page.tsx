import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { resources, getResourceBySlug } from '@/data/resources';
import { ArrowLeft, Download, FileText, BookOpen } from 'lucide-react';

export function generateStaticParams() {
  return resources
    .filter((r) => r.type === 'guide' && !r.external)
    .map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const resource = getResourceBySlug(params.slug);
  if (!resource) return { title: 'Resource not found' };
  return {
    title: resource.title,
    description: resource.description,
    openGraph: {
      title: `${resource.title} — Design Blade`,
      description: resource.description,
    },
  };
}

export default function ResourceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const resource = getResourceBySlug(params.slug);
  if (!resource || resource.type !== 'guide') notFound();

  return (
    <article className="min-h-screen pt-28 md:pt-32">
      <div className="container-page">
        <a
          href="/resources"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft
            size={16}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          Back to resources
        </a>

        <div className="mx-auto mt-10 max-w-3xl">
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-widest text-accent">
              <FileText size={13} />
              Guide
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{resource.category}</span>
          </div>
          <h1 className="mt-5 text-balance font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            {resource.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {resource.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#download"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-transform duration-300 hover:scale-[1.02] active:scale-95"
            >
              <Download size={16} />
              {resource.badge ?? 'Download guide'}
            </a>
            <span className="text-sm text-muted-foreground">
              Free · No email required
            </span>
          </div>
        </div>

        {resource.preview && (
          <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border border-border bg-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resource.preview}
              alt={resource.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        )}

        <div className="mx-auto mt-16 max-w-3xl pb-8">
          {resource.body && (
            <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">
              {resource.body}
            </p>
          )}

          <div id="download" className="mt-12 rounded-2xl border border-border bg-card p-8">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Download the guide
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              This is a demo resource page. The download link would serve the PDF
              here in a production setup. Add the file to{' '}
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                /public/resources/{resource.slug}.pdf
              </code>{' '}
              and link to it.
            </p>
            <button
              disabled
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-muted px-6 py-3 text-sm font-medium text-muted-foreground"
            >
              <Download size={16} />
              {resource.badge ?? 'PDF'}
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-8">
            {resource.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
