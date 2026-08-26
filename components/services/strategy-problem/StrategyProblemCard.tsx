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

        md:self-start
        md:px-8
        md:pt-10
        md:pb-0

        lg:px-8
        lg:pt-6
        lg:pb-0

        ${
          index !== 0
            ? 'border-t border-border md:border-l md:border-t-0'
            : ''
        }
      `}
    >

      <h3
  className="
    mt-1
    max-w-sm
    font-heading
    text-lg
    font-semibold
    leading-[1.05]
    tracking-tight
    sm:text-xl
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
          sm:leading-5
        "
      >
        {problem.description}
      </p>
    </motion.article>
  );
}