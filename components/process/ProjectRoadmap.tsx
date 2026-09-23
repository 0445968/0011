'use client';

import { motion } from 'framer-motion';

import { Reveal } from '@/components/portfolio/Reveal';

import { exampleRoadmap } from './processData';

const weeks = Array.from({ length: 10 }, (_, index) => index + 1);

export function ProjectRoadmap() {
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
              Example roadmap
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
              What a 10-week project can look like
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
              The stages don&apos;t always happen one at a time.
              Research can continue while strategy begins, and
              brand development often overlaps with the first
              real-world applications.
            </p>
          </div>
        </Reveal>

        {/* Roadmap */}

        <Reveal delay={0.08}>
          <div
            className="
              mt-12
              overflow-hidden
              rounded-[28px]
              bg-muted
              p-4
              sm:p-6
              lg:p-8
            "
          >
            <div
              className="
                overflow-x-auto
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              <div className="min-w-[820px]">
                {/* Week labels */}

                <div
                  className="
                    grid
                    grid-cols-[150px_repeat(10,minmax(0,1fr))]
                    items-end
                    gap-x-2
                    px-2
                  "
                >
                  <div>
                    <p
                      className="
                        font-mono
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.16em]
                        text-muted-foreground
                      "
                    >
                      Stage
                    </p>
                  </div>

                  {weeks.map((week) => (
                    <div
                      key={week}
                      className="text-center"
                    >
                      <p
                        className="
                          font-mono
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[0.12em]
                          text-muted-foreground
                        "
                      >
                        W{week}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Rows */}

                <div
                  className="
                    mt-5
                    space-y-3
                  "
                >
                  {exampleRoadmap.map((item, index) => {
                    const gridStart = item.start + 1;
                    const gridSpan = item.end - item.start + 1;

                    return (
                      <div
                        key={item.stage}
                        className="
                          grid
                          grid-cols-[150px_repeat(10,minmax(0,1fr))]
                          gap-x-2
                          rounded-[16px]
                          bg-background
                          px-2
                          py-3
                        "
                      >
                        {/* Stage label */}

                        <div
                          className="
                            flex
                            items-center
                            px-3
                          "
                        >
                          <div>
                            <p
                              className="
                                font-mono
                                text-[9px]
                                font-semibold
                                uppercase
                                tracking-[0.14em]
                                text-muted-foreground
                              "
                            >
                              {String(index + 1).padStart(2, '0')}
                            </p>

                            <p
                              className="
                                mt-1
                                font-heading
                                text-base
                                font-semibold
                                tracking-tight
                              "
                            >
                              {item.stage}
                            </p>
                          </div>
                        </div>

                        {/* Empty background week cells */}

                        {weeks.map((week) => (
                          <div
                            key={`${item.stage}-${week}`}
                            className="
                              col-auto
                              row-start-1
                              min-h-[52px]
                              rounded-[10px]
                              border
                              border-border/50
                              bg-muted/50
                            "
                            style={{
                              gridColumnStart: week + 1,
                            }}
                          />
                        ))}

                        {/* Animated bar */}

                        <motion.div
                          initial={{
                            scaleX: 0,
                            opacity: 0,
                          }}
                          whileInView={{
                            scaleX: 1,
                            opacity: 1,
                          }}
                          viewport={{
                            once: true,
                            amount: 0.4,
                          }}
                          transition={{
                            duration: 0.7,
                            delay: index * 0.08,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="
                            relative
                            row-start-1
                            z-10
                            flex
                            min-h-[52px]
                            origin-left
                            items-center
                            overflow-hidden
                            rounded-[10px]
                            bg-[#101010]
                            px-4
                            text-white
                          "
                          style={{
                            gridColumnStart: gridStart,
                            gridColumnEnd: `span ${gridSpan}`,
                          }}
                        >
                          {/* Lime progress accent */}

                          <div
                            aria-hidden="true"
                            className="
                              absolute
                              bottom-0
                              left-0
                              top-0
                              w-1
                              bg-[#BBFF1B]
                            "
                          />

                          <div
                            aria-hidden="true"
                            className="
                              pointer-events-none
                              absolute
                              -right-10
                              -top-10
                              h-24
                              w-24
                              rounded-full
                              bg-[#1D45FF]/20
                              blur-2xl
                            "
                          />

                          <div
                            className="
                              relative
                              z-10
                              flex
                              w-full
                              items-center
                              justify-between
                              gap-4
                            "
                          >
                            <span
                              className="
                                font-mono
                                text-[9px]
                                font-semibold
                                uppercase
                                tracking-[0.14em]
                                text-white/80
                              "
                            >
                              {item.stage}
                            </span>

                            <span
                              className="
                                font-mono
                                text-[8px]
                                font-semibold
                                uppercase
                                tracking-[0.12em]
                                text-white/35
                              "
                            >
                              {item.start === item.end
                                ? `Week ${item.start}`
                                : `Weeks ${item.start}–${item.end}`}
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom explanation */}

            <div
              className="
                mt-6
                border-t
                border-border
                px-2
                pt-6
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-4
                  sm:flex-row
                  sm:items-start
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
                  This is just one example. A smaller project
                  may move through these stages faster, while
                  projects that include a larger website,
                  multiple services, or more launch materials
                  may need additional time.
                </p>

                <span
                  className="
                    shrink-0
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
                  Example only
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}