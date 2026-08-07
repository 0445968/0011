'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  duration: number;
}

export function ProgressBar({
  progress,
  duration,
}: ProgressBarProps) {
  return (
    <div className="mt-10 h-[2px] overflow-hidden rounded-full bg-border">

      <motion.div
        className="h-full bg-accent"
        animate={{
          width: `${(progress / duration) * 100}%`,
        }}
        transition={{
          ease: 'linear',
        }}
      />

    </div>
  );
}