'use client';

import { motion } from 'framer-motion';

const transitionEase = [
  0.16,
  1,
  0.3,
  1,
] as const;

export function HeroHeading() {
  return (
    <>
      {/* Eyebrow */}

      <motion.p
        initial={{
          opacity: 0,
          y: 14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.65,
          ease: transitionEase,
        }}
        className="
          font-mono
          text-[11px]
          font-semibold
          uppercase
          tracking-[0.22em]
          text-[#BBFF1B]
          sm:text-xs
        "
      >
        Brand strategy & design
      </motion.p>

      {/* Heading */}

      <h1
        className="
          mt-6
          max-w-[14ch]
          text-balance
          font-heading
          text-[2.35rem]
          font-medium
          leading-[0.98]
          tracking-[-0.045em]
          text-white
          sm:text-[3rem]
          md:text-[3.6rem]
          lg:text-[4.15rem]
          xl:max-w-none
          xl:whitespace-nowrap
        "
      >
        <motion.span
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.75,
            delay: 0.2,
            ease: transitionEase,
          }}
          className="inline"
        >
          Strategy that{' '}
        </motion.span>

        <motion.span
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.75,
            delay: 0.32,
            ease: transitionEase,
          }}
          className="inline"
        >
          takes you{' '}
        </motion.span>

        <motion.span
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.75,
            delay: 0.44,
            ease: transitionEase,
          }}
          className="inline"
        >
          onward
        </motion.span>
      </h1>

      {/* Description */}

      <motion.p
        initial={{
          opacity: 0,
          y: 22,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.7,
          delay: 0.58,
          ease: transitionEase,
        }}
        className="
          mt-7
          max-w-2xl
          text-balance
          text-base
          leading-7
          text-white/70
          sm:text-lg
          sm:leading-8
        "
      >
        From helpful brand systems to thoughtful digital tools,{' '}
        <br className="hidden sm:block" />
        we build the pieces that help your brand grow with confidence.
      </motion.p>
    </>
  );
}