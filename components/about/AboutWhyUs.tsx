'use client';

import { Reveal } from '@/components/portfolio/Reveal';

const reasons = [
  {
    number: '01',
    title: 'Strategy before styling',
    description:
      'Every project starts by defining what the brand needs to communicate, who it needs to reach, and what should make it distinct.',
  },
  {
    number: '02',
    title: 'Built to be recognizable',
    description:
      'We create visual systems with enough character to stand apart while staying clear, usable, and consistent across every touchpoint.',
  },
  {
    number: '03',
    title: 'Designed to keep growing',
    description:
      'Your brand should work beyond launch day. We build systems that can extend into campaigns, social, print, digital experiences, and future ideas.',
  },
  {
    number: '04',
    title: 'Direct collaboration',
    description:
      'Bivi keeps the process focused and collaborative, so the people thinking through the strategy are closely connected to the people shaping the design.',
  },
];

export function AboutWhyUs() {
  return (
    <section className="section-spacing relative">
      <div className="container-page">
        <div className="border-t border-border pt-10 sm:pt-12 lg:pt-16">
          {/* ------------------------------------------------------------ */}
          {/* Section heading                                              */}
          {/* ------------------------------------------------------------ */}

          <Reveal>
            <div
              className="
                flex
                items-center
                gap-3
                text-xs
                font-semibold
                uppercase
                tracking-[0.18em]
                text-muted-foreground
              "
            >
              <span className="h-px w-8 bg-secondary" />
              Why Bivi
            </div>
          </Reveal>

          <div
            className="
              mt-10
              grid
              gap-8
              lg:grid-cols-12
              lg:gap-16
            "
          >
            <Reveal
              delay={0.06}
              className="lg:col-span-8"
            >
              <h2
                className="
                  max-w-4xl
                  text-balance
                  font-heading
                  text-4xl
                  font-semibold
                  leading-[0.98]
                  tracking-[-0.04em]
                  sm:text-5xl
                  md:text-6xl
                  lg:text-7xl
                "
              >
                Thoughtful work,
                built around what matters.
              </h2>
            </Reveal>

            <Reveal
              delay={0.12}
              className="
                lg:col-span-4
                lg:flex
                lg:items-end
              "
            >
              <p
                className="
                  max-w-lg
                  text-base
                  leading-relaxed
                  text-muted-foreground
                  sm:text-lg
                "
              >
                Good design is not just about making a strong first
                impression. It is about creating a system that stays
                useful, recognizable, and relevant as the business
                grows.
              </p>
            </Reveal>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Reasons grid                                                 */}
          {/* ------------------------------------------------------------ */}

          <div
            className="
              mt-16
              grid
              gap-5
              md:grid-cols-2
              lg:mt-20
            "
          >
            {reasons.map((reason, index) => (
              <Reveal
                key={reason.number}
                delay={0.05 + index * 0.06}
              >
                <article
                  className="
                    group
                    flex
                    min-h-[330px]
                    h-full
                    flex-col
                    justify-between
                    rounded-2xl
                    border
                    border-border
                    bg-card
                    p-6
                    transition-colors
                    duration-200
                    hover:border-foreground/20
                    sm:p-8
                    lg:min-h-[370px]
                    lg:p-10
                  "
                >
                  {/* Number */}
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <span
                      className="
                        text-xs
                        font-semibold
                        tracking-[0.18em]
                        text-secondary
                      "
                    >
                      {reason.number}
                    </span>

                    <span
                      className="
                        h-2
                        w-2
                        rounded-full
                        bg-secondary
                        opacity-70
                        transition-opacity
                        duration-200
                        group-hover:opacity-100
                      "
                    />
                  </div>

                  {/* Content */}
                  <div className="mt-20 max-w-xl">
                    <h3
                      className="
                        font-heading
                        text-3xl
                        font-semibold
                        leading-tight
                        tracking-[-0.025em]
                        sm:text-4xl
                      "
                    >
                      {reason.title}
                    </h3>

                    <p
                      className="
                        mt-5
                        max-w-lg
                        text-base
                        leading-relaxed
                        text-muted-foreground
                      "
                    >
                      {reason.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}