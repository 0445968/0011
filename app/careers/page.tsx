import type { Metadata } from 'next';

import {
  FileUp,
  Heart,
  Sparkles,
  Upload,
  Users,
  Zap,
} from 'lucide-react';

import { Reveal } from '@/components/portfolio/Reveal';

import { Caveat } from 'next/font/google';

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Explore careers at Bivi. There are no open positions right now, but you can send us your résumé for future opportunities.',
};

const values = [
  {
    icon: Sparkles,
    title: 'Craft over output',
    description:
      'We believe the details others overlook are the details that matter most.',
    accent: 'bg-[#B7A7FF]',
  },
  {
    icon: Heart,
    title: 'Respect by default',
    description:
      'Great work happens in environments where people feel valued and trusted.',
    accent: 'bg-[#FF7A4A]',
  },
  {
    icon: Zap,
    title: 'Bias toward shipping',
    description:
      'We favor working software over endless deliberation. Ship, learn, refine.',
    accent: 'bg-[#BDF4B7]',
  },
  {
    icon: Users,
    title: 'Collaborative by nature',
    description:
      'Design and engineering are not separate disciplines here. Everyone participates in both.',
    accent: 'bg-black dark:bg-white',
    iconClass: 'text-white dark:text-black',
  },
];

export default function CareersPage() {
  return (
    <>
      {/* ------------------------------------------------------------ */}
      {/* Hero                                                         */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          relative
          flex
          min-h-[620px]
          items-center
          justify-center
          overflow-hidden
          bg-black
          px-6
          pb-20
          pt-32
          sm:min-h-[680px]
          sm:px-8
          sm:pt-36
          lg:min-h-[720px]
          lg:pt-40
        "
      >
        {/* Background image */}

        <div
          aria-hidden="true"
          className="
            absolute
            inset-0
            bg-[url('/images/careers/careers-hero.jpg')]
            bg-cover
            bg-center
          "
        />

        {/* Dark overlay */}

        <div
          aria-hidden="true"
          className="
            absolute
            inset-0
            bg-black/50
          "
        />

        {/* Subtle gradient */}

        <div
          aria-hidden="true"
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-black/15
            via-transparent
            to-black/45
          "
        />

        {/* Content */}

        <div
          className="
            container-page
            relative
            z-10
          "
        >
          <Reveal>
            <div
              className="
                mx-auto
                flex
                max-w-4xl
                flex-col
                items-center
                text-center
              "
            >

              {/* Title */}

              <h1
                className="
                  mt-7
                  max-w-4xl
                  text-balance
                  font-heading
                  text-3xl
                  font-medium
                  leading-[0.94]
                  tracking-[-0.05em]
                  text-white
                  sm:text-4xl
                  md:text-5xl
                  lg:text-[64px]
                "
              >
                Build things you&apos;re
                proud of.
              </h1>

              {/* Description */}

              <p
                className="
                  mt-7
                  max-w-2xl
                  text-balance
                  text-base
                  leading-7
                  text-white/75
                  sm:text-lg
                  sm:leading-8
                "
              >
                Bivi is a remote-first
                creative studio built
                around thoughtful
                collaboration, ambitious
                work, and attention to
                the details that make
                good ideas feel
                exceptional.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* What we value                                                */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          relative
          py-12
          sm:py-16
          lg:py-20
        "
      >
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
                    What we value

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
                    The principles behind
                    how we work.
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
                    We care about
                    thoughtful craft,
                    mutual respect,
                    momentum, and working
                    closely across
                    disciplines to make
                    better things
                    together.
                  </p>
                </div>

                {/* Value cards */}

                <div
                  className="
                    grid
                    gap-4
                    sm:grid-cols-2
                  "
                >
                  {values.map(
                    (value, index) => {
                      const Icon =
                        value.icon;

                      return (
                        <Reveal
                          key={value.title}
                          delay={
                            0.05 +
                            index * 0.06
                          }
                        >
                          <article
                            className="
                              flex
                              h-full
                              min-h-[200px]
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
                                ${value.accent}
                              `}
                            >
                              <Icon
                                size={19}
                                strokeWidth={1.8}
                                className={
                                  value.iconClass ??
                                  'text-black'
                                }
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
                                {value.title}
                              </h3>

                              <p
                                className="
                                  mt-3
                                  text-sm
                                  leading-relaxed
                                  text-muted-foreground
                                "
                              >
                                {
                                  value.description
                                }
                              </p>
                            </div>
                          </article>
                        </Reveal>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Bottom statement */}

              <Reveal delay={0.18}>
  <p
    className={`
      ${caveat.className}
      mx-auto
      mt-14
      max-w-4xl
      text-center
      text-3xl
      font-semibold
      leading-snug
      text-muted-foreground
      sm:text-4xl
    `}
  >
    Good work starts with
    good people.
  </p>
</Reveal>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Careers status                                               */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          pb-20
          pt-8
          sm:pb-24
          sm:pt-10
          lg:pb-28
          lg:pt-12
        "
      >
        <div className="container-page">
          <Reveal>
            <div
              className="
                relative
                overflow-hidden
                rounded-3xl
                bg-primary
                px-6
                py-12
                text-primary-foreground
                sm:px-10
                sm:py-14
                lg:px-14
                lg:py-16
              "
            >
              {/* Decorative background */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  -right-28
                  -top-28
                  h-72
                  w-72
                  rounded-full
                  bg-white/10
                  blur-3xl
                "
              />

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  -bottom-32
                  left-1/3
                  h-72
                  w-72
                  rounded-full
                  bg-[#BBFF1B]/10
                  blur-3xl
                "
              />

              <div
                className="
                  relative
                  z-10
                  grid
                  gap-10
                  lg:grid-cols-[1fr_auto]
                  lg:items-end
                "
              >
                {/* Left */}

                <div className="max-w-2xl">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-white/15
                      text-white
                    "
                  >
                    <FileUp
                      size={21}
                      strokeWidth={2}
                    />
                  </div>

                  <p
                    className="
                      mt-8
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.2em]
                      text-white/65
                      sm:text-xs
                    "
                  >
                    Current openings
                  </p>

                  <h2
                    className="
                      mt-3
                      max-w-xl
                      font-heading
                      text-3xl
                      font-semibold
                      tracking-[-0.035em]
                      text-white
                      sm:text-4xl
                      lg:text-5xl
                    "
                  >
                    No open positions
                    right now.
                  </h2>

                  <p
                    className="
                      mt-5
                      max-w-xl
                      text-sm
                      leading-7
                      text-white/75
                      sm:text-base
                    "
                  >
                    We&apos;re not
                    actively hiring at
                    the moment, but
                    we&apos;re always
                    interested in
                    meeting thoughtful,
                    talented people.
                    Send us your résumé
                    and a little about
                    yourself, and
                    we&apos;ll keep you
                    in mind when the
                    right opportunity
                    comes up.
                  </p>
                </div>

                {/* CTA */}

                <div
                  className="
                    flex
                    flex-col
                    items-start
                    gap-3
                    lg:items-end
                  "
                >
                  <a
                    href="/careers/resume"
                    className="
                      group
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-full
                      bg-[#BBFF1B]
                      px-6
                      py-3
                      text-sm
                      font-semibold
                      text-black
                      transition-transform
                      duration-200
                      hover:scale-[1.02]
                    "
                  >
                    <Upload
                      size={16}
                      strokeWidth={2}
                    />

                    Send us your résumé
                  </a>

                  <p
                    className="
                      max-w-[240px]
                      text-left
                      text-xs
                      leading-5
                      text-white/55
                      lg:text-right
                    "
                  >
                    We&apos;ll keep it on
                    file and reach out if
                    a relevant
                    opportunity opens.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}