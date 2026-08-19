'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const BACKGROUND_IMAGE =
  '/images/hero/hero-background-10.jpg';

const FOREGROUND_IMAGE =
  '/images/hero/hero-foreground.png';

const transitionEase = [
  0.16,
  1,
  0.3,
  1,
] as const;

export function Hero() {
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
      {/* -------------------------------------------------------------- */}
      {/* Background image                                               */}
      {/* -------------------------------------------------------------- */}

      <div className="absolute inset-0 -z-30">
        <Image
          src={BACKGROUND_IMAGE}
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

      {/* -------------------------------------------------------------- */}
      {/* Background color overlay                                       */}
      {/* -------------------------------------------------------------- */}

      <div
        className="
          absolute
          inset-0
          -z-20
          bg-[#1600A2]/90
          mix-blend-multiply
        "
      />

      {/* -------------------------------------------------------------- */}
      {/* Background gradient                                            */}
      {/* -------------------------------------------------------------- */}

      <div
        className="
          absolute
          inset-0
          -z-10
          bg-gradient-to-b
          from-[#0B65F3]/35
          via-[#0B65F3]/50
          to-[#0B65F3]/95
        "
      />

      {/* -------------------------------------------------------------- */}
      {/* Subtle texture                                                 */}
      {/* -------------------------------------------------------------- */}

      <div
        className="
          grid-noise
          pointer-events-none
          absolute
          inset-0
          -z-10
          opacity-20
        "
      />

      {/* -------------------------------------------------------------- */}
      {/* Hero content                                                   */}
      {/* -------------------------------------------------------------- */}

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
        {/* Heading */}

        <h1
          className="
            max-w-none
            text-balance
            font-serif
            text-[clamp(2.75rem,4.8vw,6rem)]
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
    Design that{' '}
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
    feels{' '}
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
      text-white/70
    "
  >
    inevitable.
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
            text-[16px]
            leading-7
            text-white/75
            sm:text-[18px]
            sm:leading-8
          "
          >
          From powerful brand systems to meticulously crafted tools
          <br className="hidden sm:block" />
          and resources, we have your back.
        </motion.p>

        {/* Actions */}

        <motion.div
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
            delay: 0.7,
            ease: transitionEase,
          }}
          className="
            mt-8
            flex
            w-full
            flex-col
            items-center
            justify-center
            gap-3
            sm:w-auto
            sm:flex-row
          "
        >
          {/* View Projects */}

          <a
            href="/work"
            className="
              group
              inline-flex
              h-[52px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              bg-[#BBFF1B]
              px-8
              text-sm
              font-medium
              leading-none
              text-black
              shadow-[0_14px_45px_rgba(0,0,0,0.16)]
              transition-all
              duration-300
              hover:scale-[1.03]
              hover:bg-[#D4FF70]
              active:scale-[0.98]
              sm:w-auto
            "
          >
            View Projects

            <ArrowUpRight
              size={17}
              className="
                shrink-0
                transition-transform
                duration-300
                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
              "
            />
          </a>

          {/* Explore Resources */}

          <a
            href="/resources"
            className="
              group
              inline-flex
              h-[52px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-[#BBFF1B]
              bg-transparent
              px-8
              text-sm
              font-medium
              leading-none
              text-[#BBFF1B]
              backdrop-blur-md
              transition-all
              duration-300
              hover:scale-[1.03]
              hover:bg-[#BBFF1B]
              hover:text-black
              active:scale-[0.98]
              sm:w-auto
            "
          >
            Explore Resources

            <ArrowUpRight
              size={17}
              className="
                shrink-0
                transition-transform
                duration-300
                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
              "
            />
          </a>
        </motion.div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Foreground showcase image                                      */}
      {/* -------------------------------------------------------------- */}

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
          delay: 0.82,
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
            max-w-[1200px]
          "
        >
          {/* Glow behind image */}

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

          <Image
            src={FOREGROUND_IMAGE}
            alt="A preview of Design Blade's creative work"
            width={1600}
            height={1000}
            priority
            sizes="
              (max-width: 640px) 100vw,
              (max-width: 1280px) 92vw,
              1200px
            "
            className="
              block
              h-auto
              w-full
              object-contain
              object-bottom
              drop-shadow-[0_30px_70px_rgba(0,0,0,0.3)]
            "
          />
        </div>
      </motion.div>
    </section>
  );
}