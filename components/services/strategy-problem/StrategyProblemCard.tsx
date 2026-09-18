'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

type Problem = {
  number: string;
  icon: string;
  title: string;
  description: string;
};

type StrategyProblemCardProps = {
  problem: Problem;
  index: number;
};

const transitionEase = [0.16, 1, 0.3, 1] as const;

export function StrategyProblemCard({
  problem,
  index,
}: StrategyProblemCardProps) {
  return (
    <motion.article
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
        amount: 0.35,
      }}
      transition={{
        duration: 0.6,
        delay: 0.08 + index * 0.08,
        ease: transitionEase,
      }}
      className={`
        relative
        py-7
        md:px-7
        md:py-8
        lg:px-8
        ${index > 0
          ? `
                border-t
                border-border
                md:border-t-0
                md:border-l
              `
          : ''
        }
      `}
    >
      {/* Icon + Title */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            overflow-hidden
          "
        >
          <Image
            src={problem.icon}
            alt=""
            width={40}
            height={40}
            className="
              h-9
              w-9
              object-contain
            "
          />
        </div>

        <h3
          className="
            font-heading
            text-xl
            font-semibold
            leading-[1.05]
            tracking-tight
            sm:text-2xl
          "
        >
          {problem.title}
        </h3>
      </div>

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