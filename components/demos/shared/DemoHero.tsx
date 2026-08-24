'use client';

import Link from 'next/link';

import {
  ArrowDown,
  ArrowUpRight,
} from 'lucide-react';

import {
  motion,
} from 'framer-motion';

import {
  DemoCarousel,
} from './DemoCarousel';

const ease = [
  0.16,
  1,
  0.3,
  1,
] as const;

export function DemoHero() {
  return (
    <section
      id="top"
      className="
        relative
        isolate
        overflow-hidden
        bg-[#1600A2]
        text-white
      "
    >
      {/* ========================================================== */}
      {/* Background                                                */}
      {/* ========================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          z-0
        "
      >
        <div
          className="
            absolute
            inset-0
            bg-[url('/images/demos/demos-hero.jpg')]
            bg-cover
            bg-center
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-[#1600A2]/75
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-black/50
            via-transparent
            to-[#08004c]
          "
        />

        {/* Glow */}
        <div
          className="
            absolute
            left-1/2
            top-[28%]
            h-[580px]
            w-[580px]
            -translate-x-1/2
            rounded-full
            bg-[#0B65F3]/35
            blur-[140px]
          "
        />
      </div>

      {/* ========================================================== */}
      {/* Hero content                                              */}
      {/* ========================================================== */}

      <div
        className="
          container-page
          relative
          z-20
          flex
          flex-col
          items-center
          px-5
          pt-32
          text-center
          sm:px-8
          sm:pt-36
          md:pt-40
          lg:pt-44
        "
      >
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
            ease,
          }}
          className="
            text-[11px]
            font-semibold
            uppercase
            tracking-[0.22em]
            text-[#BBFF1B]
            sm:text-xs
          "
        >
          Interactive demos
        </motion.p>

        {/* Heading */}
        <motion.h1
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.08,
            ease,
          }}
          className="
  mt-6
  max-w-[12ch]
  text-balance
  font-heading
  text-[2.35rem]
  font-medium
  leading-[0.98]
  tracking-[-0.045em]
  sm:text-[3rem]
  md:text-[3.6rem]
  lg:text-[4.15rem]
"
        >
          Ideas built to be experienced.
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.75,
            delay: 0.18,
            ease,
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
          Explore concepts and digital experiences built through thoughtful design
          that you can actually use.
        </motion.p>

        {/* ======================================================== */}
        {/* Actions                                                  */}
        {/* ======================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.75,
            delay: 0.28,
            ease,
          }}
          className="
            mt-9
            flex
            flex-wrap
            items-center
            justify-center
            gap-3
          "
        >
          <Link
            href="#demo-carousel"
            className="
              group
              inline-flex
              h-12
              items-center
              justify-center
              gap-2
              rounded-[14px]
              bg-[#0B65F3]
              px-6
              text-[16px]
              font-bold
              text-white
              transition-opacity
              hover:opacity-90
            "
          >
            Explore demos

            <ArrowDown
              size={15}
              className="
                transition-transform
                duration-300
                group-hover:translate-y-0.5
              "
            />
          </Link>

          <Link
            href="/help/contact/demo"
            className="
              group
              inline-flex
              h-12
              items-center
              justify-center
              gap-2
              rounded-[14px]
              border
              border-white/20
              bg-white/10
              px-6
              text-[16px]
              font-bold
              text-white
              backdrop-blur
              transition-colors
              hover:bg-white/15
            "
          >
            Request a demo

            <ArrowUpRight
              size={15}
              className="
                transition-transform
                duration-300
                group-hover:-translate-y-0.5
                group-hover:translate-x-0.5
              "
            />
          </Link>
        </motion.div>
      </div>

      {/* ========================================================== */}
      {/* Carousel                                                  */}
      {/* ========================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 36,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.9,
          delay: 0.38,
          ease,
        }}
        className="
          relative
          z-20
          mt-16
          sm:mt-20
          lg:mt-24
        "
      >
        <DemoCarousel />
      </motion.div>

      {/* Bottom breathing room */}
      <div
        className="
          h-20
          sm:h-24
          lg:h-28
        "
      />
    </section>
  );
}