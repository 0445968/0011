import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { Reveal } from '@/components/portfolio/Reveal';
import { FileText, Download, ArrowUpRight } from 'lucide-react';
import { resources } from '@/data/resources';

export const metadata: Metadata = {
  title: 'Guides & PDFs',
  description:
    'Downloadable handbooks on brand identity, color systems, typography, and SaaS launches — free resources from Bivi.',
};

const guides = resources.filter((r) => r.type === 'guide');

export default function GuidesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Guides & PDFs"
        title="Free downloadable handbooks."
        description="Practical, well-researched guides on branding, color, typography, and launching SaaS products — written for designers and founders who want to go deeper."
      />

      <section className="section-spacing">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-2">
            {guides.map((guide, i) => (
              <Reveal key={guide.id} delay={i * 0.06}>
                <a
                  href={guide.href}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-lg"
                >
                  {/* Preview */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                    {guide.preview && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={guide.preview}
                        alt={guide.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    {guide.badge && (
                      <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                        {guide.badge}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                      <FileText size={14} />
                      Guide
                    </div>
                    <h3 className="mt-3 font-heading text-xl font-semibold leading-snug">
                      {guide.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {guide.description}
                    </p>

                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {guide.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <Download size={14} />
                        Download
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                        Read more
                        <ArrowUpRight
                          size={14}
                          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </span>
                    </div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>

          {guides.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <p className="font-heading text-xl text-muted-foreground">
                New guides are on the way.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Check back soon — or browse the full resource library.
              </p>
              <a
                href="/resources"
                className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                Browse all resources
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
