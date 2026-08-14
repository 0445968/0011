import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms and conditions for using the Design Blade website and services.',
};

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        description="The terms and conditions governing your use of this website and any services provided by Design Blade."
      />
      <section className="section-spacing">
        <div className="container-page max-w-3xl">
          <div className="space-y-8">
            <section>
              <h2 className="font-heading text-xl font-semibold">
                1. Acceptance of terms
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                By accessing and using this website, you accept and agree to be
                bound by these terms. If you do not agree, please do not use the
                site.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold">
                2. Use of the website
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                You agree to use this website for lawful purposes only. You may
                not use the site in any way that could damage, disable, or
                impair the site or interfere with any other party's use.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold">
                3. Intellectual property
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                All content on this website — including text, graphics, logos,
                design templates, and code — is the property of Design Blade
                unless otherwise stated. You may not reproduce or distribute
                content without written permission.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold">
                4. Free resources
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Downloadable guides and free tools are provided for personal and
                professional development. You may not resell, redistribute, or
                claim authorship of these resources.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold">
                5. Service engagements
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Any professional services provided by Design Blade are governed
                by a separate written agreement. These terms do not override
                any signed contract or statement of work.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold">
                6. Limitation of liability
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Design Blade is not liable for any indirect, incidental, or
                consequential damages arising from your use of the website or
                free resources.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold">
                7. Changes to these terms
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                We may update these terms from time to time. Continued use of
                the site after changes constitutes acceptance of the revised
                terms.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold">
                8. Contact
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Questions about these terms can be sent to
                hello@designblade.pro.
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
