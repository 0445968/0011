'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface HeroActionsProps {
  getStartedHref: string;
  hasSelectedOptions: boolean;
}

const transitionEase = [0.16, 1, 0.3, 1] as const;

export function HeroActions({
  getStartedHref,
  hasSelectedOptions,
}: HeroActionsProps) {
  return (
    <>
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
          duration: 1,
          delay: 0.76,
          ease: transitionEase,
        }}
        className="
          mt-7
          flex
          w-full
          flex-col
          items-center
          justify-center
          gap-3
          px-1

          sm:w-auto
          sm:flex-row
          sm:px-0
        "
      >
        {/* Get Started */}
        <div
          className="
            relative
            w-full

            sm:w-auto
          "
        >
          {/* Pulse */}
          {hasSelectedOptions && (
            <span
              aria-hidden="true"
              className="
                hero-get-started-pulse
                pointer-events-none
                absolute
                inset-0
                rounded-[14px]
                bg-[#BBFF1B]
              "
            />
          )}

          <a
            href={getStartedHref}
            className="
              relative
              z-10
              flex
              h-12
              w-full
              items-center
              justify-center
              gap-2
              rounded-[18px]
              bg-[#BBFF1B]
              px-6
              text-[15px]
              font-mono
              font-bold
              leading-none
              text-black
              transition-colors
              hover:bg-[#BBFF1B]/90

              sm:w-auto
              sm:px-8
            "
          >
            Get Started

            <ArrowUpRight
              size={17}
              className="shrink-0"
            />
          </a>
        </div>

        {/* View our work */}
        <a
          href="/work"
          className="
            group
            flex
            h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-[18px]
            bg-white/20
            px-6
            text-[15px]
            font-mono
            font-bold
            text-white
            backdrop-blur
            transition-colors
            hover:bg-white/30

            sm:w-auto
          "
        >
          View our work

          <ArrowUpRight
            size={17}
            className="shrink-0"
          />
        </a>
      </motion.div>

      <style jsx>{`
        .hero-get-started-pulse {
          animation: hero-get-started-pulse 1.5s linear infinite;
          transform-origin: center;
        }

        @keyframes hero-get-started-pulse {
          0% {
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            border-radius: 14px;
            opacity: 0.75;
          }

          100% {
            top: -10px;
            right: -10px;
            bottom: -10px;
            left: -10px;
            border-radius: 26px;
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-get-started-pulse {
            animation: none;
            opacity: 0.2;
          }
        }
      `}</style>
    </>
  );
}