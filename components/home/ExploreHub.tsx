'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  CircleHelp,
  FolderKanban,
  MonitorPlay,
} from 'lucide-react';

const exploreItems = [
  {
    title: 'Demos',
    description: 'Interactive experiments and digital concepts.',
    href: '/demos',
    icon: MonitorPlay,
  },
  {
    title: 'Journal',
    description: 'Ideas on brands, business, design, and growth.',
    href: '/blog',
    icon: BookOpen,
  },
  {
    title: 'Case Studies',
    description: 'Selected projects, outcomes, and creative work.',
    href: '/portfolio',
    icon: FolderKanban,
  },
  {
    title: 'FAQ',
    description: 'Answers about projects, process, and working together.',
    href: '/faq',
    icon: CircleHelp,
  },
];

export function ExploreHub() {
  return (
    <section
      aria-label="Explore Bivi"
      className="
        relative
        pt-12
        pb-0
        sm:pt-16
        lg:pt-20
      "
    >
      {/* Full-width background */}
      <div
        className="
          relative
          w-full
          border-y
          border-[#0B65F3]
          bg-background
      "
      >
        {/* Content aligned to website margins */}
        <div className="container-page">
          <div
            className="
              grid
              min-h-[500px]
              lg:grid-cols-[1.15fr_0.85fr]
            "
          >
            {/* Left side */}
            <div
              className="
                relative
                flex
                min-h-[380px]
                items-end
                overflow-hidden
                py-10
                pr-8
                sm:py-12
                sm:pr-10
                lg:min-h-0
                lg:py-14
                lg:pr-14
              "
            >
              {/* Decorative background */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  overflow-hidden
                "
              >
                <div
                  className="
                    absolute
                    -right-[8%]
                    -top-[25%]
                    h-[620px]
                    w-[620px]
                    rounded-full
                    bg-[#0B65F3]/[0.07]
                    blur-3xl
                    dark:bg-[#0B65F3]/[0.12]
                  "
                />

                <div
                  className="
                    absolute
                    -bottom-[45%]
                    left-[30%]
                    h-[500px]
                    w-[500px]
                    rounded-full
                    bg-[#1600A2]/[0.06]
                    blur-3xl
                    dark:bg-[#1600A2]/[0.16]
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    opacity-[0.35]
                    [background-image:linear-gradient(to_right,rgba(11,101,243,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,101,243,0.08)_1px,transparent_1px)]
                    [background-size:48px_48px]
                    dark:opacity-[0.2]
                  "
                />

                <div
                  className="
                    absolute
                    left-0
                    top-0
                    h-[4px]
                    w-[38%]
                    bg-[#0B65F3]
                  "
                />
              </div>

              {/* Copy */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 24,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  margin: '-80px',
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="
                  relative
                  z-10
                  max-w-2xl
                "
              >
                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-[#0B65F3]
                  "
                >
                  Explore Bivi
                </p>

                <h2
                  className="
                    mt-5
                    max-w-xl
                    text-balance
                    font-heading
                    text-4xl
                    font-semibold
                    leading-[0.96]
                    tracking-[-0.04em]
                    text-foreground
                    sm:text-5xl
                    md:text-[3.4rem]
                  "
                >
                  More than a studio.
                  <span className="block text-[#0B65F3]">
                    Explore what we&apos;re building.
                  </span>
                </h2>

                <p
                  className="
                    mt-6
                    max-w-lg
                    text-base
                    leading-7
                    text-muted-foreground
                    sm:text-lg
                    sm:leading-8
                  "
                >
                  Explore ideas, experiments, tools, and resources
                  created to help ambitious businesses think more
                  clearly and build stronger brands.
                </p>

                <Link
                  href="/studio-lab"
                  className="
                    group
                    mt-8
                    inline-flex
                    h-12
                    items-center
                    gap-2
                    rounded-full
                    bg-[#0B65F3]
                    px-6
                    text-sm
                    font-semibold
                    text-white
                    transition-all
                    duration-300
                    hover:scale-[1.025]
                    hover:bg-[#1600A2]
                    active:scale-[0.98]
                  "
                >
                  Explore Studio Lab

                  <ArrowUpRight
                    size={17}
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                    "
                  />
                </Link>
              </motion.div>
            </div>

            {/* Right navigation */}
            <div
              className="
                relative
                flex
                flex-col
                border-t
                border-[#0B65F3]/25
                lg:border-l
                lg:border-t-0
              "
            >
              {exploreItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    initial={{
                      opacity: 0,
                      x: 20,
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                    }}
                    viewport={{
                      once: true,
                      margin: '-60px',
                    }}
                    transition={{
                      duration: 0.55,
                      delay: index * 0.07,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="flex-1"
                  >
                    <Link
                      href={item.href}
                      className="
                        group
                        relative
                        flex
                        h-full
                        min-h-[126px]
                        items-center
                        gap-5
                        px-7
                        py-6
                        transition-colors
                        duration-300
                        hover:bg-[#0B65F3]/[0.05]
                        sm:px-8
                        lg:min-h-0
                        lg:px-10
                      "
                    >
                      {index < exploreItems.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="
                            absolute
                            inset-x-7
                            bottom-0
                            h-px
                            bg-[#0B65F3]/20
                            sm:inset-x-8
                            lg:inset-x-10
                          "
                        />
                      )}

                      <span
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-[#0B65F3]/10
                          text-[#0B65F3]
                          transition-all
                          duration-300
                          group-hover:bg-[#0B65F3]
                          group-hover:text-white
                        "
                      >
                        <Icon size={19} strokeWidth={1.8} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3
                          className="
                            font-heading
                            text-lg
                            font-semibold
                            tracking-tight
                            text-foreground
                            sm:text-xl
                          "
                        >
                          {item.title}
                        </h3>

                        <p
                          className="
                            mt-1
                            max-w-sm
                            text-sm
                            leading-6
                            text-muted-foreground
                          "
                        >
                          {item.description}
                        </p>
                      </div>

                      <span
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          text-foreground
                          transition-all
                          duration-300
                          group-hover:translate-x-1
                          group-hover:bg-[#0B65F3]
                          group-hover:text-white
                        "
                      >
                        <ChevronRight
                          size={19}
                          strokeWidth={1.8}
                        />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}