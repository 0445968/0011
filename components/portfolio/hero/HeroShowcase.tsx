'use client';

import { motion } from 'framer-motion';

const FOREGROUND_VIDEO =
  '/images/hero/hero-placeholder.mp4';

const transitionEase = [
  0.16,
  1,
  0.3,
  1,
] as const;

export function HeroShowcase() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 55,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 1,
        delay: 0.88,
        ease: transitionEase,
      }}
      className="
        container-page
        relative
        z-20
        mt-10
        px-4
        sm:mt-12
        sm:px-8
        lg:mt-14
      "
    >
      <div
        className="
          relative
          mx-auto
          w-full
          max-w-[900px]
          overflow-hidden
        rounded-t-[20px]
        "
      >
        {/* Glow */}
        <div
          className="
            absolute
            inset-x-[8%]
            bottom-0
            top-[15%]
            -z-10
            rounded-[50%]
            bg-white/25
            blur-[100px]
          "
        />

        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="
            block
            h-auto
            w-full
            object-contain
            object-bottom
            drop-shadow-[0_30px_70px_rgba(0,0,0,0.3)]
          "
        >
          <source
            src={FOREGROUND_VIDEO}
            type="video/mp4"
          />
        </video>
      </div>
    </motion.div>
  );
}