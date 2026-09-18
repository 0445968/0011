'use client';

import {
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import Link from 'next/link';

import { Reveal } from '@/components/portfolio/Reveal';

export function AboutGetStarted() {
  const ctaRef = useRef<HTMLDivElement>(null);

  const [glowPosition, setGlowPosition] = useState({
    x: 50,
    y: 50,
  });

  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const element = ctaRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setGlowPosition({ x, y });
  };

  return (
    <section className="relative pt-4 pb-10 sm:pt-6 sm:pb-12 lg:pt-8 lg:pb-16">
      <div className="container-page">
        <Reveal>
          <div
            ref={ctaRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            /* Replicates reference cutouts: top-right notch & bottom-left diagonal cut */
            style={{
              clipPath:
                'polygon(0% 0%, calc(100% - 48px) 0%, 100% 48px, 100% 100%, 72px 100%, 0% calc(100% - 72px))',
            }}
            className="
              relative
              overflow-hidden
              rounded-[28px]
              bg-[#1D45FF]
              px-6
              py-16
              text-center
              text-white
              shadow-2xl
              sm:px-12
              sm:py-20
              lg:px-20
              lg:py-24
            "
          >
            {/* Ambient Mouse Glow */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                transition-opacity
                duration-500
                ease-out
              "
              style={{
                opacity: isHovering ? 1 : 0.35,
                background: `
                  radial-gradient(
                    600px circle at ${glowPosition.x}% ${glowPosition.y}%,
                    rgba(255, 255, 255, 0.15),
                    transparent 60%
                  )
                `,
              }}
            />

            {/* Content Container */}
            <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#72FF52]">
                Start something
              </div>

              <h2 className="mt-5 max-w-3xl text-balance font-heading text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl lg:text-[4rem]">
                Have something worth building?
              </h2>

              <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-white/78 sm:text-lg">
                Tell us what you&apos;re working on. We&apos;ll help turn the idea into a clear, distinctive brand built to move with your business.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/contact"
                  className="
                    inline-flex
                    h-12
                    min-w-[160px]
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#72FF52]
                    px-6
                    text-base
                    font-bold
                    text-black
                    shadow-sm
                    transition-all
                    duration-200
                    hover:bg-[#60f040]
                    hover:shadow-md
                    active:scale-95
                  "
                >
                  Start a Project
                </Link>

                <Link
                  href="/work"
                  className="
                    inline-flex
                    h-12
                    min-w-[160px]
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-white/80
                    bg-transparent
                    px-6
                    text-base
                    font-semibold
                    text-white
                    transition-all
                    duration-200
                    hover:bg-white/10
                    active:scale-95
                  "
                >
                  See our work
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}