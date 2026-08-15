import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { Reveal } from '@/components/portfolio/Reveal';
import { ArrowUpRight, Mail, Sparkles, Heart, Zap, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Join Design Blade — a remote-first creative studio looking for designers and engineers who sweat the details.',
};

const openRoles = [
  {
    title: 'Senior Product Designer',
    type: 'Full-time · Remote',
    description:
      'Lead end-to-end design for client projects — from research and wireframes to high-fidelity interfaces and design systems.',
    tags: ['Figma', 'Design Systems', 'Prototyping'],
  },
  {
    title: 'Frontend Engineer',
    type: 'Full-time · Remote',
    description:
      'Build polished, performant interfaces with Next.js, TypeScript, and Tailwind. Work closely with design to ship pixel-perfect products.',
    tags: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
  },
  {
    title: 'Creative Director',
    type: 'Contract · Remote',
    description:
      'Provide strategic creative leadership across multiple engagements — shaping visual direction, brand systems, and campaign concepts.',
    tags: ['Art Direction', 'Branding', 'Strategy'],
  },
];

const values = [
  {
    icon: Sparkles,
    title: 'Craft over output',
    description:
      'We believe the details others overlook are the details that matter most.',
  },
  {
    icon: Heart,
    title: 'Respect by default',
    description:
      'Great work happens in environments where people feel valued and trusted.',
  },
  {
    icon: Zap,
    title: 'Bias toward shipping',
    description:
      'We favor working software over endless deliberation. Ship, learn, refine.',
  },
  {
    icon: Users,
    title: 'Collaborative by nature',
    description:
      'Design and engineering are not separate disciplines here. Everyone participates in both.',
  },
];

export default function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Build things you're proud of."
        description="Design Blade is a remote-first creative studio looking for designers and engineers who sweat the details. We keep the team small, the work ambitious, and the process transparent."
      />

      {/* Values */}
      <section className="section-spacing">
        <div className="container-page">
          <Reveal>
            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              What we value
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {values.map((value, i) => (
              <Reveal key={value.title} delay={i * 0.06}>
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <value.icon size={24} className="text-primary" />
                  </div>
                  <h3 className="mt-5 font-heading text-lg font-semibold">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="section-spacing border-t border-border pt-20">
        <div className="container-page">
          <Reveal>
            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              Open roles
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Don't see a perfect fit? Send a note anyway — we're always
              interested in meeting talented people.
            </p>
          </Reveal>

          <div className="mt-10 space-y-4">
            {openRoles.map((role, i) => (
              <Reveal key={role.title} delay={i * 0.06}>
                <div className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-foreground/20 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <h3 className="font-heading text-lg font-semibold">
                      {role.title}
                    </h3>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {role.type}
                    </span>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {role.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {role.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <a
                    href="/contact"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors group-hover:border-foreground/20 group-hover:bg-muted"
                  >
                    Apply
                    <ArrowUpRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>

          {/* General application CTA */}
          <Reveal delay={0.15}>
            <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl bg-primary px-8 py-10 text-primary-foreground sm:flex-row">
              <div>
                <h3 className="font-heading text-xl font-semibold">
                  Don't see your role?
                </h3>
                <p className="mt-1 text-sm text-primary-foreground/80">
                  Tell us what you'd build. We'll find a way to work together.
                </p>
              </div>
              <a
                href="mailto:hello@designblade.pro"
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-medium text-primary transition-transform hover:scale-[1.03]"
              >
                <Mail size={16} />
                Get in touch
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
