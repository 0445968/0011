'use client';

import { motion } from 'framer-motion';

import { StrategyDiagram } from './StrategyDiagram';
import { StrategyProblemCard } from './StrategyProblemCard';

const problems = [
  {
    number: '01',
    title: 'Hard to understand.',
    description:
      'If your difference is not clear, customers default to comparing features, price, or familiarity.',
  },
  {
    number: '02',
    title: 'Hard to remember.',
    description:
      'When every channel tells the story differently, recognition and trust become harder to build.',
  },
  {
    number: '03',
    title: 'Hard to recognize.',
    description:
      'Without a strategic foundation, visual decisions become isolated choices instead of part of a system.',
  },
];

const transitionEase = [0.16, 1, 0.3, 1] as const;

export function BrandStrategyProblem() {
  return (
    <section
      className="
        relative
        overflow-hidden
        border-t
        border-border
        bg-background
        py-24
        sm:py-28
        lg:py-32
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
          <motion.p
            initial={{
              opacity: 0,
              y: 14,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.6,
            }}
            transition={{
              duration: 0.55,
              ease: transitionEase,
            }}
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.2em]
              text-primary
            "
          >
            Why strategy matters
          </motion.p>

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
            className="
              mx-auto
              mt-4
              max-w-4xl
              text-balance
              font-heading
              text-3xl
              font-semibold
              leading-[1]
              tracking-tight
              sm:text-4xl
              md:text-5xl
            "
          >
            Clarity is what turns design into a brand.
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
            Without it, positioning drifts, messaging
            loses focus, and design becomes a collection
            of disconnected decisions.
          </motion.p>
        </div>

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
            mt-16
            sm:mt-20
            lg:mt-24
          "
        >
          <StrategyDiagram />
        </motion.div>

        {/* Problems */}
        <div
          className="
            mt-10
            grid
            border-t
            border-border
            md:grid-cols-3
          "
        >
          {problems.map((problem, index) => (
            <StrategyProblemCard
              key={problem.number}
              problem={problem}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}