'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface HeroActionsProps {
  getStartedHref: string;
  hasSelectedOptions: boolean;
}

const transitionEase = [
  0.16,
  1,
  0.3,
  1,
] as const;

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
          sm:w-auto
          sm:flex-row
        "
      >
        {/* Get Started */}
        <div className="relative w-full sm:w-auto">
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
                bg-[#0B65F3]
              "
            />
          )}

          <a
            href={getStartedHref}
            className="
              relative
              z-10
              inline-flex
              h-[52px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-[14px]
              bg-[#0B65F3]
              px-8
              text-[16px]
              font-bold
              leading-none
              text-white
              hover:bg-[#1600A2]
              sm:w-auto
            "
          >
            Get Started

            <ArrowUpRight
              size={17}
              className="shrink-0"
            />
          </a>
        </div>

        {/* Explore Resources */}
        <a
          href="/resources"
          className="
            inline-flex
            h-[52px]
            w-full
            items-center
            justify-center
            gap-2
            rounded-[14px]
            border
            border-[#0B65F3]
            bg-transparent
            px-8
            text-[16px]
            font-bold
            leading-none
            text-white
            hover:bg-[#1600A2]
            sm:w-auto
          "
        >
          Explore Resources

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
            top: -16px;
            right: -16px;
            bottom: -16px;
            left: -16px;
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