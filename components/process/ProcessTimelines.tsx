'use client';

import { motion } from 'framer-motion';

import { Reveal } from '@/components/portfolio/Reveal';

import {
  timelineOptions,
} from './processData';

export function ProcessTimelines() {
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
        {/* Intro */}

        <Reveal>
          <div
            className="
              max-w-3xl
            "
          >
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
              Typical timelines
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
              How long does a brand project take?
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
              It depends on how much your business needs.
              A focused project can move quickly, while a
              full strategy, identity, website, and launch
              naturally take more time.
            </p>
          </div>
        </Reveal>

        {/* Timeline cards */}

        <div
          className="
            mt-12
            grid
            gap-4
            lg:grid-cols-3
          "
        >
          {timelineOptions.map((option, index) => (
            <Reveal
              key={option.id}
              delay={0.05 + index * 0.06}
            >
              <motion.article
                whileHover={{
                  y: -4,
                }}
                transition={{
                  duration: 0.2,
                  ease: 'easeOut',
                }}
                className={`
                  relative
                  flex
                  h-full
                  flex-col
                  overflow-hidden
                  rounded-[24px]
                  border
                  p-6
                  sm:p-7
                  ${option.featured
                    ? 'border-[#BBFF1B]/60 bg-[#101010] text-white'
                    : 'border-border bg-muted'
                  }
                `}
              >
                {/* Featured glow */}

                {option.featured && (
                  <>
                    <div
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        -right-20
                        -top-20
                        h-52
                        w-52
                        rounded-full
                        bg-[#1D45FF]/20
                        blur-3xl
                      "
                    />

                    <div
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        -bottom-20
                        -left-16
                        h-44
                        w-44
                        rounded-full
                        bg-[#BBFF1B]/10
                        blur-3xl
                      "
                    />
                  </>
                )}

                <div className="relative z-10">
                  {/* Top */}

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    "
                  >
                    <div>
                      <p
                        className={`
                          font-mono
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.18em]
                          ${option.featured
                            ? 'text-white/45'
                            : 'text-muted-foreground'
                          }
                        `}
                      >
                        {option.label}
                      </p>

                      <p
                        className={`
                          mt-3
                          font-heading
                          text-3xl
                          font-semibold
                          tracking-[-0.035em]
                          sm:text-4xl
                          ${option.featured
                            ? 'text-white'
                            : 'text-foreground'
                          }
                        `}
                      >
                        {option.duration}
                      </p>
                    </div>

                    {option.featured && (
                      <span
                        className="
                          rounded-full
                          bg-[#BBFF1B]
                          px-3
                          py-1.5
                          font-mono
                          text-[8px]
                          font-bold
                          uppercase
                          tracking-[0.14em]
                          text-black
                        "
                      >
                        Most common
                      </span>
                    )}
                  </div>

                  {/* Title */}

                  <h3
                    className={`
                      mt-8
                      max-w-sm
                      font-heading
                      text-2xl
                      font-semibold
                      leading-tight
                      tracking-[-0.025em]
                      ${option.featured
                        ? 'text-white'
                        : 'text-foreground'
                      }
                    `}
                  >
                    {option.title}
                  </h3>

                  {/* Description */}

                  <p
                    className={`
                      mt-4
                      text-sm
                      leading-6
                      ${option.featured
                        ? 'text-white/65'
                        : 'text-muted-foreground'
                      }
                    `}
                  >
                    {option.description}
                  </p>

                  {/* Best for */}

                  <div
                    className={`
                      mt-7
                      rounded-[16px]
                      border
                      p-4
                      ${option.featured
                        ? 'border-white/10 bg-white/[0.05]'
                        : 'border-border bg-background'
                      }
                    `}
                  >
                    <p
                      className={`
                        font-mono
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.16em]
                        ${option.featured
                          ? 'text-white/35'
                          : 'text-muted-foreground'
                        }
                      `}
                    >
                      Best for
                    </p>

                    <p
                      className={`
                        mt-2
                        text-sm
                        font-medium
                        leading-6
                        ${option.featured
                          ? 'text-white/85'
                          : 'text-foreground'
                        }
                      `}
                    >
                      {option.bestFor}
                    </p>
                  </div>

                  {/* Includes */}

                  <div className="mt-8">
                    <p
                      className={`
                        font-mono
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.16em]
                        ${option.featured
                          ? 'text-white/35'
                          : 'text-muted-foreground'
                        }
                      `}
                    >
                      Often includes
                    </p>

                    <ul
                      className="
                        mt-4
                        space-y-2.5
                      "
                    >
                      {option.includes.map((item) => (
                        <li
                          key={item}
                          className="
                            flex
                            items-start
                            gap-3
                          "
                        >
                          <span
                            aria-hidden="true"
                            className="
                              mt-[7px]
                              h-1.5
                              w-1.5
                              shrink-0
                              rounded-full
                              bg-[#BBFF1B]
                            "
                          />

                          <span
                            className={`
                              text-sm
                              leading-5
                              ${option.featured
                                ? 'text-white/70'
                                : 'text-muted-foreground'
                              }
                            `}
                          >
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>

        {/* Bottom note */}

        <Reveal delay={0.15}>
          <div
            className="
              mt-6
              rounded-[20px]
              border
              border-border
              bg-background
              px-5
              py-5
              sm:px-6
            "
          >
            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <p
                className="
                  max-w-2xl
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                These aren&apos;t fixed packages. They&apos;re
                examples of how the size of a project can affect
                timing. We shape the process around what your
                business actually needs.
              </p>

              <span
                className="
                  shrink-0
                  font-mono
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-muted-foreground
                "
              >
                Scope determines timing
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}