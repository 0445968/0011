import Image from 'next/image';

import { Reveal } from '@/components/portfolio/Reveal';

import { timelineFactors } from './processData';

const factorIcons = [
  '/images/process/factors/factor-01.png',
  '/images/process/factors/factor-02.png',
  '/images/process/factors/factor-03.png',
  '/images/process/factors/factor-04.png',
  '/images/process/factors/factor-05.png',
  '/images/process/factors/factor-06.png',
];

export function TimelineFactors() {
  return (
    <section
      className="
        relative
        py-16
        sm:py-20
        lg:py-24
      "
    >
      <div className="container-page">
        <Reveal>
          <div className="max-w-3xl">
            <p
              className="
                font-mono
                text-xs
                font-semibold
                uppercase
                tracking-[0.2em]
                text-primary
              "
            >
              What affects timing
            </p>

            <h2
              style={{
                lineHeight: '1.15',
              }}
              className="
                mx-auto
                mt-4
                max-w-5xl
                font-heading
                text-3xl
                font-semibold
                tracking-tight
                sm:text-4xl
                md:text-5xl
              "
            >
              Things that affect the length of a project
            </h2>

            <p
              className="
                mt-6
                max-w-2xl
                text-base
                leading-relaxed
                text-muted-foreground
                sm:text-lg
              "
            >
              A simple service business with one clear offer
              can move much faster than a business with several
              services, an outdated website, and years of
              inconsistent branding to untangle.
            </p>
          </div>
        </Reveal>

        <div
          className="
            mt-12
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          {timelineFactors.map((factor, index) => (
            <Reveal
              key={factor.title}
              delay={0.04 + index * 0.05}
            >
              <article
                className="
                  flex
                  h-full
                  min-h-[240px]
                  flex-col
                  rounded-[20px]
                  border
                  border-border/70
                  bg-muted
                  p-6
                  sm:p-7
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >
                  <span
                    className="
                      font-mono
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                      text-muted-foreground
                    "
                  >
                    Factor
                  </span>

                  <span
                    className="
                      font-heading
                      text-sm
                      font-semibold
                      tracking-[-0.02em]
                      text-muted-foreground/60
                    "
                  >
                    {String(index + 1).padStart(
                      2,
                      '0'
                    )}
                  </span>
                </div>

                <div className="mt-auto pt-10">
                  <div
                    className="
                      relative
                      mb-5
                      h-11
                      w-11
                    "
                  >
                    <Image
                      src={
                        factorIcons[
                        index %
                        factorIcons.length
                        ]
                      }
                      alt=""
                      fill
                      sizes="44px"
                      className="
                        object-contain
                        object-left
                      "
                    />
                  </div>

                  <h3
                    className="
                      max-w-sm
                      font-heading
                      text-xl
                      font-semibold
                      leading-tight
                      tracking-[-0.025em]
                      sm:text-xl
                    "
                  >
                    {factor.title}
                  </h3>

                  <p
                    className="
                      mt-4
                      max-w-sm
                      text-sm
                      leading-6
                      text-muted-foreground
                    "
                  >
                    {factor.description}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.18}>
          <div
            className="
              mt-6
              rounded-[20px]
              bg-[#101010]
              px-6
              py-7
              text-white
              sm:px-8
              sm:py-8
              lg:flex
              lg:items-center
              lg:justify-between
              lg:gap-10
            "
          >
            <div className="max-w-2xl">
              <p
                className="
                  font-mono
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-white/40
                "
              >
                The important part
              </p>

              <p
                className="
                  mt-3
                  font-heading
                  text-2xl
                  font-semibold
                  leading-tight
                  tracking-[-0.025em]
                  sm:text-3xl
                "
              >
                We don&apos;t add work just to make the process
                feel bigger.
              </p>
            </div>

            <p
              className="
                mt-5
                max-w-md
                text-sm
                leading-6
                text-white/60
                lg:mt-0
              "
            >
              The goal is to do enough research, strategy, and
              design to solve the problem properly—without
              turning a small business project into an
              unnecessary corporate exercise.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}