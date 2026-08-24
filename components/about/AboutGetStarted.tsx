'use client';

import {
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { Reveal } from '@/components/portfolio/Reveal';

export function AboutGetStarted() {
  const ctaRef = useRef<HTMLDivElement>(null);

  const [glowPosition, setGlowPosition] = useState({
    x: 50,
    y: 50,
  });

  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    const element = ctaRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) / rect.width) * 100;

    const y =
      ((event.clientY - rect.top) / rect.height) * 100;

    setGlowPosition({
      x,
      y,
    });
  };

  return (
    <section
      className="
        relative
        pt-4
        pb-10
        sm:pt-6
        sm:pb-12
        lg:pt-8
        lg:pb-16
      "
    >
      <div className="container-page">
        <Reveal>
          <div
            ref={ctaRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="
              relative
              overflow-hidden
              rounded-[28px]
              bg-[#BBFF1B]
              px-6
              py-16
              text-black
              sm:px-10
              sm:py-20
              lg:px-16
              lg:py-24
            "
          >



            
            {/* ---------------------------------------------------------- */}
            {/* Mouse-following glow                                       */}
            {/* ---------------------------------------------------------- */}

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
                opacity: isHovering ? 1 : 0.45,
                background: `
                  radial-gradient(
                    circle 280px at ${glowPosition.x}% ${glowPosition.y}%,
                    rgba(255,255,255,0.38) 0%,
                    rgba(255,255,255,0.20) 28%,
                    rgba(255,255,255,0.08) 48%,
                    transparent 72%
                  )
                `,
              }}
            />

            {/* ---------------------------------------------------------- */}
            {/* Permanent subtle glow                                      */}
            {/* ---------------------------------------------------------- */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.14),transparent_42%)]
              "
            />

            {/* ---------------------------------------------------------- */}
            {/* Content                                                     */}
            {/* ---------------------------------------------------------- */}

            <div
              className="
                relative
                z-10
                mx-auto
                flex
                max-w-4xl
                flex-col
                items-center
                text-center
              "
            >
              {/* Eyebrow */}

              <div
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-black/60
                "
              >
                Start something
              </div>

              {/* Heading */}

              <h2
                className="
                  mt-5
                  text-balance
                  font-heading
                  text-4xl
                  font-semibold
                  leading-tight
                  tracking-tight
                  text-black
                  sm:text-5xl
                  md:text-6xl
                "
              >
                Have something worth building?
              </h2>

              {/* Description */}

              <p
                className="
                  mt-6
                  max-w-2xl
                  text-base
                  leading-relaxed
                  text-black
                  sm:text-lg
                "
              >
                Tell us what you&apos;re working on. We&apos;ll help
                turn the idea into a clear, distinctive brand built
                to move with your business.
              </p>

              {/* CTA */}

              <Link
                href="/contact"
                className="
                  group
                  mt-8
                  inline-flex
                  h-11
                  items-center
                  gap-2.5
                  rounded-[14px]
                  bg-black
                  px-5
                  text-sm
                  font-bold
                  text-white
                  transition-opacity
                  duration-200
                  hover:opacity-85
                "
              >
                Start a Project

                <ArrowUpRight
                  size={17}
                  strokeWidth={2}
                />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}