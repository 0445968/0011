import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Bivi collects, uses, and protects your information.',
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="How we collect, use, and protect your information when you use our website and services."
      />
      <section className="section-spacing">
        <div className="container-page max-w-3xl">
          <div className="space-y-8">
            <section>
              <h2 className="font-heading text-xl font-semibold">
                1. Information we collect
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                We collect minimal information needed to operate this website.
                This may include contact form submissions (name, email, message
                content) and standard analytics data such as page views and
                approximate location. We do not sell or share your personal
                information with third parties.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold">
                2. How we use your information
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Information collected through contact forms is used solely to
                respond to your inquiry. Analytics data is used in aggregate to
                understand how visitors interact with the site and improve its
                content and structure.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold">
                3. Cookies
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                This site uses minimal cookies for essential functionality and
                optional analytics. We do not use cookies for targeted
                advertising. You can control cookie preferences through your
                browser settings.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold">
                4. Third-party services
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                We may use third-party tools for analytics and email
                communication. These providers have their own privacy policies
                governing the data they process.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold">
                5. Your rights
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                You may request access to, correction of, or deletion of your
                personal information at any time by contacting us at
                hello@bivi.pro.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold">
                6. Contact
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Questions about this policy can be sent to
                hello@bivi.pro. We will respond within a reasonable
                timeframe.
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
