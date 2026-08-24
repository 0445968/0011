import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = {
  title: 'Accessibility',
  description:
    'Bivi\'s commitment to making the web accessible to everyone, including our conformance goals and how to report issues.',
};

export default function AccessibilityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Commitment"
        title="Accessibility."
        description="We believe the web should be usable by everyone. Here's what we're doing to make that real — and how to let us know when we fall short."
      />
      <section className="section-spacing">
        <div className="container-page max-w-3xl">
          <div className="space-y-8">
            <section>
              <h2 className="font-heading text-xl font-semibold">
                Our commitment
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Bivi is committed to making its website accessible to
                all visitors, regardless of ability. We aim to conform to the
                Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
                wherever possible.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold">
                What we do
              </h2>
              <ul className="mt-3 space-y-3 text-muted-foreground leading-relaxed">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Use semantic HTML and ARIA attributes to ensure screen reader
                  compatibility.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Maintain color contrast ratios that meet or exceed WCAG AA
                  standards for all text and interactive elements.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Ensure all interactive elements are keyboard-navigable with
                  visible focus states.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Provide alt text for meaningful images and decorative element
                  labeling where appropriate.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Test across a range of devices, viewport sizes, and assistive
                  technologies.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold">
                Known limitations
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                While we strive for full accessibility, some third-party
                content or embedded media may not fully conform. We continuously
                work to improve these areas as we become aware of them.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold">
                Report an issue
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                If you encounter an accessibility barrier on this site, please
                let us know. Email hello@designblade.pro with a description of
                the issue and the page where it occurred. We take all reports
                seriously and will work to resolve them promptly.
              </p>
            </section>

            <p className="border-t border-border pt-6 text-sm text-muted-foreground/70">
              Last updated: August 2026
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
