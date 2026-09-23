'use client';

import { motion } from 'framer-motion';

import { Reveal } from '@/components/portfolio/Reveal';

const deliverables = [
  {
    title: 'Brand strategy',
    description:
      'The foundation behind the brand—positioning, value, audience focus, personality, and the decisions that guide everything else.',
    label: 'Strategy',
  },
  {
    title: 'Messaging',
    description:
      'Clear language for explaining what you do, why it matters, and how to talk about the business consistently.',
    label: 'Words',
  },
  {
    title: 'Visual identity',
    description:
      'Logo, typography, color, graphic style, and the visual rules that make the brand recognizable.',
    label: 'Identity',
  },
  {
    title: 'Brand guidelines',
    description:
      'A practical reference for using the brand correctly without having to guess every time.',
    label: 'Guide',
  },
  {
    title: 'Templates',
    description:
      'Reusable layouts for the places you work most often, such as social media, presentations, or marketing materials.',
    label: 'Templates',
  },
  {
    title: 'Launch assets',
    description:
      'The final files and materials needed to put the new brand into use across the business.',
    label: 'Launch',
  },
];

export function Deliverables() {
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
                text-muted-foreground
              "
            >
              What you leave with
            </p>

            <h2
              className="
                mt-4
                max-w-3xl
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
              More than a logo folder.
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
              The goal is to leave you with a brand you can
              actually use—not a collection of files that only
              makes sense to a designer.
            </p>
          </div>
        </Reveal>

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
                grid
                gap-4
                lg:grid-cols-[0.9fr_1.1fr]
              "
            >
              {/* Animated stack */}

              <div
                className="
                  relative
                  min-h-[520px]
                  overflow-hidden
                  rounded-[22px]
                  bg-[#101010]
                  p-6
                  text-white
                  sm:p-8
                "
              >
                {/* Grid */}

                <div
                  aria-hidden="true"
                  className="
                    absolute
                    inset-0
                    opacity-[0.05]
                    [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]
                    [background-size:48px_48px]
                  "
                />

                {/* Glow */}

                <div
                  aria-hidden="true"
                  className="
                    absolute
                    left-1/2
                    top-1/2
                    h-[420px]
                    w-[420px]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-[#1D45FF]/20
                    blur-[120px]
                  "
                />

                {/* Stack */}

                <div
                  className="
                    absolute
                    left-1/2
                    top-1/2
                    h-[350px]
                    w-[260px]
                    -translate-x-1/2
                    -translate-y-1/2
                    sm:w-[300px]
                  "
                >
                  <motion.div
                    animate={{
                      x: [0, -6, 0],
                      y: [0, 5, 0],
                      rotate: [-8, -6, -8],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="
                      absolute
                      left-1/2
                      top-1/2
                      flex
                      h-[190px]
                      w-[230px]
                      -translate-x-1/2
                      -translate-y-1/2
                      items-end
                      rounded-[22px]
                      border
                      border-white/10
                      bg-[#1D45FF]
                      p-5
                      shadow-2xl
                    "
                  >
                    <div>
                      <p
                        className="
                          font-mono
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-[0.16em]
                          text-white/50
                        "
                      >
                        Brand
                      </p>

                      <p
                        className="
                          mt-1
                          font-heading
                          text-3xl
                          font-semibold
                          tracking-[-0.04em]
                        "
                      >
                        Strategy
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{
                      x: [0, 5, 0],
                      y: [0, -4, 0],
                      rotate: [6, 8, 6],
                    }}
                    transition={{
                      duration: 6.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="
                      absolute
                      left-1/2
                      top-1/2
                      flex
                      h-[190px]
                      w-[230px]
                      -translate-x-1/2
                      -translate-y-1/2
                      items-end
                      rounded-[22px]
                      bg-white
                      p-5
                      text-black
                      shadow-2xl
                    "
                  >
                    <div>
                      <p
                        className="
                          font-mono
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-[0.16em]
                          text-black/40
                        "
                      >
                        Visual
                      </p>

                      <p
                        className="
                          mt-1
                          font-heading
                          text-3xl
                          font-semibold
                          tracking-[-0.04em]
                        "
                      >
                        Identity
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, 1.5, -1.5, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="
                      absolute
                      left-1/2
                      top-1/2
                      flex
                      h-[190px]
                      w-[230px]
                      -translate-x-1/2
                      -translate-y-1/2
                      items-end
                      rounded-[22px]
                      bg-[#BBFF1B]
                      p-5
                      text-black
                      shadow-2xl
                    "
                  >
                    <div>
                      <p
                        className="
                          font-mono
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-[0.16em]
                          text-black/45
                        "
                      >
                        Brand
                      </p>

                      <p
                        className="
                          mt-1
                          font-heading
                          text-3xl
                          font-semibold
                          tracking-[-0.04em]
                        "
                      >
                        Toolkit
                      </p>
                    </div>
                  </motion.div>
                </div>

                <div
                  className="
                    absolute
                    bottom-6
                    left-6
                  "
                >
                  <p
                    className="
                      font-mono
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                      text-white/30
                    "
                  >
                    Built to be used
                  </p>
                </div>
              </div>

              {/* Deliverables list */}

              <div
                className="
                  grid
                  gap-3
                  sm:grid-cols-2
                "
              >
                {deliverables.map((item, index) => (
                  <Reveal
                    key={item.title}
                    delay={0.04 + index * 0.04}
                  >
                    <article
                      className="
                        flex
                        h-full
                        min-h-[210px]
                        flex-col
                        justify-between
                        rounded-[18px]
                        border
                        border-border/70
                        bg-background
                        p-5
                        sm:p-6
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
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-[0.16em]
                            text-muted-foreground
                          "
                        >
                          {item.label}
                        </span>

                        <span
                          className="
                            font-mono
                            text-[9px]
                            font-semibold
                            text-muted-foreground/50
                          "
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="mt-10">
                        <h3
                          className="
                            font-heading
                            text-xl
                            font-semibold
                            leading-tight
                            tracking-[-0.025em]
                            sm:text-2xl
                          "
                        >
                          {item.title}
                        </h3>

                        <p
                          className="
                            mt-3
                            text-sm
                            leading-6
                            text-muted-foreground
                          "
                        >
                          {item.description}
                        </p>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Bottom message */}

            <div
              className="
                mt-4
                rounded-[20px]
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
                  Not every project needs every item above.
                  The final deliverables depend on what your
                  business actually needs to move forward.
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
                  Built around the business
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}