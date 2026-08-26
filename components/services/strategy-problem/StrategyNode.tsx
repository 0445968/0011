'use client';

import { motion } from 'framer-motion';

interface StrategyNodeProps {
  label: string;
  className?: string;
  delay?: number;
}

const transitionEase = [0.16, 1, 0.3, 1] as const;

export function StrategyNode({
  label,
  className = '',
  delay = 0,
}: StrategyNodeProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.92,
        y: 8,
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.6,
      }}
      transition={{
        duration: 0.5,
        delay,
        ease: transitionEase,
      }}
      className={`
        absolute
        z-10
        ${className}
      `}
    >
      <div
        className="
          flex
          items-center
          justify-center
          rounded-full
          border
          border-border
          bg-background/95
          px-4
          py-2
          shadow-sm
          backdrop-blur-sm
        "
      >
        <span
          className="
            whitespace-nowrap
            text-xs
            font-semibold
            tracking-tight
            text-foreground
            sm:text-sm
          "
        >
          {label}
        </span>
      </div>
    </motion.div>
  );
}