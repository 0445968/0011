'use client';

import { motion } from 'framer-motion';

interface StrategyProblemCardProps {
  problem: {
    number: string;
    title: string;
    description: string;
  };
  index: number;
}

const transitionEase = [0.16, 1, 0.3, 1] as const;

export function StrategyProblemCard({
  problem,
  index,
}: StrategyProblemCardProps) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.45,
      }}
      transition={{
        duration: 0.6,
        delay: 0.08 * index,
        ease: transitionEase,
      }}
      className={`
        relative
        py-8
        md:px-8
        md:py-10
        lg:px-10
        lg:py-12
        ${
          index !== 0
            ? 'border-t border-border md:border-l md:border-t-0'
            : ''
        }
      `}
    >
      <span
        className="
          block
          font-mono
          text-[11px]
          font-semibold
          uppercase
          tracking-[0.18em]
          text-primary
        "
      >
        {problem.number}
      </span>

      <h3
        className="
          mt-5
          max-w-sm
          font-heading
          text-2xl
          font-semibold
          leading-[1.05]
          tracking-tight
          sm:text-3xl
        "
      >
        {problem.title}
      </h3>

      <p
        className="
          mt-4
          max-w-sm
          text-sm
          leading-6
          text-muted-foreground
          sm:text-base
          sm:leading-7
        "
      >
        {problem.description}
      </p>
    </motion.article>
  );
}