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
      {/* Heading */}
      <h1
        className="
          max-w-none
          text-balance
          font-serif
          text-[clamp(2.4rem,4.2vw,5.25rem)]
          font-medium
          leading-[0.94]
          tracking-[-0.055em]
          text-white
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
          className="
            inline
            font-normal
            italic
            text-[#BBFF1B]
          "
        >
          forward.
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
          text-[15px]
          leading-7
          text-white/90
          sm:text-[17px]
          sm:leading-8
        "
        >
        From strategic brand systems to thoughtful digital tools,
        <br className="hidden sm:block" />
        we build the pieces that help your brand{' '}
        <span className="font-bold">
          grow with confidence.
        </span>
      </motion.p>
    </>
  );
}