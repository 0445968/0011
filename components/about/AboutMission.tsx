'use client';

import Image from 'next/image';

import {
  motion,
} from 'framer-motion';

const ease = [
  0.16,
  1,
  0.3,
  1,
] as const;

export function AboutMission() {
  return (
    <section
      className="
        relative
        isolate
        overflow-hidden
        bg-black
        pb-24
        pt-32
        text-white
        sm:pb-28
        sm:pt-36
        lg:pb-32
        lg:pt-40
      "
    >
      {/* ============================================================ */}
      {/* Background image                                             */}
      {/* ============================================================ */}

      <div
        className="
          absolute
          inset-0
          z-0
        "
      >
        <Image
          src="/images/about/about-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="
            object-cover
            object-center
          "
        />
      </div>

      {/* Dark overlay */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          bg-black/25
        "
      />

      {/* Main gradient */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          bg-gradient-to-b
          from-black/50
          via-black/70
          to-black/60
        "
      />

      {/* Bottom fade */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          z-10
          h-[45%]
          bg-gradient-to-b
          from-transparent
          via-black/70
          to-[black
        "
      />

      {/* ============================================================ */}
      {/* Content                                                      */}
      {/* ============================================================ */}

      <div
        className="
          container-page
          relative
          z-20
        "
      >
        <div
          className="
            mx-auto
            max-w-5xl
            text-center
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
              font-mono
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-[#BBFF1B]
              sm:text-xs
            "
          >
            About Bivi
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
              mx-auto
              mt-6
              max-w-[18ch]
              font-heading
              text-[2.35rem]
              font-medium
              leading-[0.98]
              tracking-[-0.045em]
              text-white
              sm:text-[3rem]
              md:text-[3.6rem]
              lg:text-[4.15rem]
            "
          >
            A trusted creative team,
            <br />
            whenever you need us
          </motion.h1>

          {/* Description */}

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
              delay: 0.18,
              ease,
            }}
            className="
              mx-auto
              mt-7
              max-w-2xl
              text-center
            "
          >
            <p
              className="
                text-balance
                text-base
                leading-7
                text-white/70
                sm:text-lg
                sm:leading-8
              "
            >
              Bivi exists to help you turn your ideas into
              a brand that feels clear, intentional, and
              unmistakably your own.
            </p>

            <p
              className="
                mt-5
                text-balance
                text-base
                leading-7
                text-white/70
                sm:text-lg
                sm:leading-8
              "
            >
              We bring brand strategy and graphic design
              together from the beginning, creating visual
              systems that give teams a stronger point of view
              and a foundation they can keep building on.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}