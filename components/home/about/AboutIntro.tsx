'use client';

import { motion } from 'framer-motion';

const revealTransition = {
  duration: 0.7,
  ease: [0.16, 1, 0.3, 1],
} as const;

export function AboutIntro() {
  return (
    <div
      className="
        mx-auto
        max-w-5xl
        py-20
        text-center
        sm:py-28
        lg:py-36
      "
    >
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={revealTransition}
        className="
          text-xs
          font-semibold
          uppercase
          tracking-[0.2em]
          text-primary
        "
      >
        About Design Blade
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{
          ...revealTransition,
          delay: 0.08,
        }}
        className="
          mt-5
          text-balance
          font-serif
          text-4xl
          font-medium
          leading-[0.98]
          tracking-[-0.045em]
          sm:text-5xl
          md:text-6xl
          lg:text-7xl
        "
      >
        Brand strategy and digital design for businesses ready to move with
        intention.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{
          ...revealTransition,
          delay: 0.16,
        }}
        className="
          mx-auto
          mt-7
          max-w-2xl
          text-pretty
          text-base
          leading-7
          text-muted-foreground
          sm:text-lg
          sm:leading-8
        "
      >
        Design Blade turns ambitious ideas into clear, distinctive brands and
        digital experiences—combining strategy, design, and development into
        work that is as useful as it is memorable.
      </motion.p>
    </div>
  );
}