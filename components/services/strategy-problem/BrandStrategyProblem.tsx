'use client';

import { motion } from 'framer-motion';

import { StrategyDiagram } from './StrategyDiagram';
import { StrategyProblemCard } from './StrategyProblemCard';

const problems = [
  {
    number: '01',
    title: 'Confusing',
    description:
      'Unclear messaging turns potential customers into cold leads',
  },
  {
    number: '02',
    title: 'Forgettable',
    description:
      'Inconsistent storytelling leads to low recognition and trust',
  },
  {
    number: '03',
    title: 'Inconsistent',
    description:
      'Visual decisions become disorganized choices instead of part of a system',
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
        pt-20
        pb-14
        sm:pt-24
        sm:pb-16
        lg:pt-28
        lg:pb-20
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

        {/* Diagram + Problems */}

        <div className="mx-auto max-w-6xl">
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
      </div>
    </section>
  );
}