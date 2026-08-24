'use client';

import {
  ArrowUpRight,
  Layers3,
  Palette,
  Sparkles,
  Target,
} from 'lucide-react';

import { Reveal } from '@/components/portfolio/Reveal';

const reasons = [
  {
    icon: Target,
    title: 'Strategy with direction',
    description:
      'We define what your brand needs to communicate before shaping how it looks.',
    accent: 'bg-[#B7A7FF]',
  },
  {
    icon: Sparkles,
    title: 'Ideas with character',
    description:
      'We build visual concepts with enough personality to feel distinct and memorable.',
    accent: 'bg-[#FF7A4A]',
  },
  {
    icon: Palette,
    title: 'Design that feels cohesive',
    description:
      'From identity to campaigns, every touchpoint is designed to feel connected.',
    accent: 'bg-[#BDF4B7]',
  },
  {
    icon: Layers3,
    title: 'Systems built to grow',
    description:
      'We create flexible brand systems that can evolve as your business does.',
    accent: 'bg-black dark:bg-white',
    iconClass: 'text-white dark:text-black',
  },
];

export function AboutWhyUs() {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20">
      <div className="container-page">
        <Reveal>
          <div
            className="
              rounded-[28px]
              border
              border-border
              bg-card
              p-6
              sm:p-8
              lg:p-10
            "
          >
            {/* Main layout */}
            <div
              className="
                grid
                gap-12
                lg:grid-cols-[0.9fr_1.1fr]
                lg:gap-14
              "
            >
              {/* Left */}
              <div>
                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-border
                    bg-background
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    text-foreground
                  "
                >
                  Why choose us

                  <span
                    className="
                      flex
                      h-5
                      w-5
                      items-center
                      justify-center
                      rounded-md
                      bg-[#B7A7FF]
                      text-[11px]
                      font-bold
                      text-black
                    "
                  >
                    ✦
                  </span>
                </div>

                <h2
                  className="
                    mt-6
                    max-w-xl
                    text-balance
                    font-heading
                    text-4xl
                    font-semibold
                    leading-[1.02]
                    tracking-[-0.04em]
                    sm:text-5xl
                    lg:text-6xl
                  "
                >
                  Thoughtful design for brands that want to move forward.
                </h2>

                <p
                  className="
                    mt-6
                    max-w-lg
                    text-base
                    leading-relaxed
                    text-muted-foreground
                    sm:text-lg
                  "
                >
                  We combine strategy, creative direction, and graphic design
                  to help brands communicate more clearly and show up with
                  confidence.
                </p>

                <div
                  className="
                    mt-8
                    flex
                    flex-wrap
                    items-center
                    gap-4
                  "
                >
                  <a
                    href="/contact"
                    className="
                      inline-flex
                      h-11
                      items-center
                      gap-2
                      rounded-[14px]
                      bg-black
                      px-5
                      text-[16px]
                      font-bold
                      text-white
                      transition-opacity
                      hover:opacity-85
                      dark:bg-white
                      dark:text-black
                    "
                  >
                    Start a Project
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              </div>

              {/* Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                {reasons.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <Reveal
                      key={item.title}
                      delay={0.05 + index * 0.06}
                    >
                      <article
                        className="
                          flex
                          min-h-[200px]
                          h-full
                          flex-col
                          justify-between
                          rounded-[20px]
                          border
                          border-border
                          bg-background
                          p-5
                          sm:p-6
                        "
                      >
                        <div
                          className={`
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            ${item.accent}
                          `}
                        >
                          <Icon
                            size={19}
                            strokeWidth={1.8}
                            className={item.iconClass ?? 'text-black'}
                          />
                        </div>

                        <div className="mt-12">
                          <h3
                            className="
                              font-heading
                              text-lg
                              font-semibold
                              tracking-tight
                            "
                          >
                            {item.title}
                          </h3>

                          <p
                            className="
                              mt-3
                              text-sm
                              leading-relaxed
                              text-muted-foreground
                            "
                          >
                            {item.description}
                          </p>
                        </div>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            </div>

            {/* Bottom statement */}
            <Reveal delay={0.18}>
              <p
                className="
                  mx-auto
                  mt-14
                  max-w-4xl
                  text-center
                  font-heading
                  text-2xl
                  font-semibold
                  leading-snug
                  tracking-[-0.03em]
                  sm:text-3xl
                "
              >
                We build Bivi around clarity, collaboration, and work that
                actually helps brands move forward.
              </p>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}