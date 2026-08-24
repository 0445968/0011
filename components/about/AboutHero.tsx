'use client';

import Image from 'next/image';
import { MapPin } from 'lucide-react';

import { Reveal } from '@/components/portfolio/Reveal';

export function AboutHero() {
  return (
    <section
      className="
        relative
        overflow-hidden
        pt-32
        sm:pt-36
        lg:pt-40
      "
    >
      <div className="container-page">
        {/* -------------------------------------------------------------- */}
        {/* Eyebrow                                                        */}
        {/* -------------------------------------------------------------- */}

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

            About Bivi
          </div>
        </Reveal>

        {/* -------------------------------------------------------------- */}
        {/* Main heading                                                   */}
        {/* -------------------------------------------------------------- */}

        <div
          className="
            mt-10
            grid
            gap-8
            lg:grid-cols-[1.35fr_0.65fr]
            lg:items-end
            lg:gap-16
          "
        >
          <Reveal delay={0.06}>
            <h1
              className="
                max-w-[1050px]
                text-balance
                font-heading
                text-[clamp(3.75rem,8vw,8.5rem)]
                font-semibold
                leading-[0.88]
                tracking-[-0.055em]
              "
            >
              We build brands
              <br />
              with something
              <br />
              to say.
            </h1>
          </Reveal>

          <Reveal
            delay={0.12}
            className="lg:pb-3"
          >
            <div className="max-w-md">
              <p
                className="
                  text-base
                  leading-relaxed
                  text-muted-foreground
                  sm:text-lg
                "
              >
                Bivi is a graphic design and brand strategy studio
                helping ambitious businesses turn ideas into clear,
                distinctive visual identities and systems.
              </p>

              <div
                className="
                  mt-6
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  text-foreground
                "
              >
                <MapPin
                  size={16}
                  strokeWidth={1.8}
                  className="text-secondary"
                />

                Houston, Texas
              </div>
            </div>
          </Reveal>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Hero visual                                                    */}
        {/* -------------------------------------------------------------- */}

        <Reveal
          delay={0.18}
          className="mt-14 sm:mt-16 lg:mt-20"
        >
          <div
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-border
              bg-card
            "
          >
            <div
              className="
                relative
                aspect-[16/8.5]
                min-h-[360px]
                w-full
                overflow-hidden
                sm:min-h-[440px]
                lg:min-h-[580px]
              "
            >
              <Image
                src="/images/about/design-philosophy-2.jpg"
                alt="Bivi creative studio"
                fill
                priority
                sizes="100vw"
                className="
                  object-cover
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-[1.015]
                "
              />

              {/* Soft image treatment */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/40
                  via-black/5
                  to-transparent
                "
              />

              {/* -------------------------------------------------------- */}
              {/* Bottom overlay content                                   */}
              {/* -------------------------------------------------------- */}

              <div
                className="
                  absolute
                  inset-x-0
                  bottom-0
                  z-10
                  flex
                  flex-col
                  gap-5
                  p-6
                  sm:p-8
                  md:flex-row
                  md:items-end
                  md:justify-between
                  lg:p-10
                "
              >
                <div className="max-w-xl">
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-white/70
                    "
                  >
                    Independent creative studio
                  </p>

                  <p
                    className="
                      mt-3
                      max-w-lg
                      font-heading
                      text-2xl
                      font-semibold
                      leading-tight
                      tracking-tight
                      text-white
                      sm:text-3xl
                      lg:text-4xl
                    "
                  >
                    Strategy gives the work direction.
                    Design gives it a voice.
                  </p>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    md:justify-end
                  "
                >
                  <span
                    className="
                      h-2
                      w-2
                      rounded-full
                      bg-secondary
                    "
                  />

                  <span
                    className="
                      text-sm
                      font-medium
                      text-white/80
                    "
                  >
                    Graphic Design · Brand Strategy
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}