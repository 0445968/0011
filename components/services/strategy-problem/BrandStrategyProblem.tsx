'use client';

import { motion } from 'framer-motion';

import { StrategyDiagram } from './StrategyDiagram';
import { StrategyProblemCard } from './StrategyProblemCard';

const problems = [
  {
    number: '01',
    icon: '/images/brand-strategy/confusing.png',
    title: 'Confusing',
    description:
      'Unclear messaging turns potential customers into cold leads',
  },
  {
    number: '02',
    icon: '/images/brand-strategy/forgettable.png',
    title: 'Forgettable',
    description:
      'Inconsistent storytelling leads to low recognition and trust',
  },
  {
    number: '03',
    icon: '/images/brand-strategy/inconsistent.png',
    title: 'Inconsistent',
    description:
      'Visual decisions become disorganized choices instead of part of a system',
  },
];

const transitionEase = [
  0.16,
  1,
  0.3,
  1,
] as const;

export function BrandStrategyProblem() {
  return (
    <section
      className="
        relative
        overflow-hidden
        border-t
        border-border
        bg-background
        pb-14
        pt-20
        sm:pb-16
        sm:pt-24
        lg:pb-20
        lg:pt-28
      "
    >
      <div className="container-page">
        {/* Header */}

        <div
          className="
            mx-auto
            max-w-5xl
            text-center
          "
        >
          <motion.h2
  initial={{
    opacity: 0,
    y: 18,
  }}
  whileInView={{
    opacity: 1,
    y: 0,
  }}
  viewport={{
    once: true,
    amount: 0.5,
  }}
  transition={{
    duration: 0.65,
    delay: 0.08,
    ease: transitionEase,
  }}
  style={{
    lineHeight: 1.15,
  }}
  className="
    mx-auto
    mt-4
    max-w-5xl
    font-heading
    text-[2.2rem]
    font-semibold
    tracking-[-0.035em]
    sm:text-4xl
    md:text-5xl
  "
>
  94% of brands fail to make
  <br />
  their value unmistakable
</motion.h2>

          <motion.p
            initial={{
              opacity: 0,
              y: 16,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.5,
            }}
            transition={{
              duration: 0.6,
              delay: 0.16,
              ease: transitionEase,
            }}
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-base
              leading-7
              text-muted-foreground
              sm:text-lg
              sm:leading-8
            "
          >
            A weak identity makes it difficult for people to connect.
          </motion.p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Diagram + Problems                                           */}
      {/* Mobile: horizontal 3-column track                            */}
      {/* Desktop: normal full-width layout                            */}
      {/* ============================================================ */}

      <div
        className="
          mt-16
          overflow-x-auto
          overscroll-x-contain
          scroll-smooth
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
          sm:mt-20
          lg:mt-24
          lg:overflow-visible
        "
      >
        <div
          className="
            mx-auto
            grid
            w-[270vw]
            grid-cols-3
            px-5

            sm:w-auto
            sm:max-w-6xl
            sm:px-0
          "
        >
          {/* Diagram */}

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
              amount: 0.25,
            }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: transitionEase,
            }}
            className="
              col-span-3
              min-w-0
            "
          >
            <StrategyDiagram />
          </motion.div>

          {/* Problems */}

          <div
            className="
              col-span-3
              mt-10
              grid
              grid-cols-3
              border-t
              border-border
            "
          >
            {problems.map(
              (
                problem,
                index
              ) => (
                <div
                  key={problem.number}
                  className="
                    min-w-0
                    snap-start
                  "
                >
                  <StrategyProblemCard
                    problem={problem}
                    index={index}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}