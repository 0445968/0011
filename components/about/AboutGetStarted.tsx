'use client';

import Link from 'next/link';

import { Reveal } from '@/components/portfolio/Reveal';

export function AboutGetStarted() {
  return (
    <section
      className="
        relative
        pb-10
        pt-6
        sm:pb-12
        sm:pt-8
        lg:pb-14
        lg:pt-10
      "
    >
      <div className="container-page">
        <Reveal>
          <div
            className="
              relative
              overflow-hidden
              rounded-3xl
              bg-primary
              px-6
              py-12
              text-primary-foreground
              sm:px-10
              sm:py-14
              lg:px-14
              lg:py-16
            "
          >
            {/* Decorative background glow */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -right-28
                -top-28
                h-72
                w-72
                rounded-full
                bg-white/10
                blur-3xl
              "
            />

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -bottom-32
                left-1/3
                h-72
                w-72
                rounded-full
                bg-[#BBFF1B]/10
                blur-3xl
              "
            />

            {/* Content */}

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

              <p
                className="
                  font-mono
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-white/65
                  sm:text-xs
                "
              >
                Start something
              </p>

              {/* Heading */}

              <h2
                className="
                  mt-3
                  max-w-3xl
                  text-balance
                  font-heading
                  text-3xl
                  font-semibold
                  leading-[1.08]
                  tracking-[-0.035em]
                  text-white
                  sm:text-4xl
                  md:text-5xl
                  lg:text-[3.25rem]
                "
              >
                Have something worth building?
              </h2>

              {/* Description */}

              <p
                className="
                  mt-5
                  max-w-2xl
                  font-body
                  text-sm
                  leading-7
                  text-white/75
                  sm:text-base
                "
              >
                Tell us what you&apos;re working on.
                We&apos;ll help turn the idea into a clear,
                distinctive brand built to move with your
                business.
              </p>

              {/* Buttons */}

              <div
                className="
                  mt-7
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-3
                  sm:flex-row
                  sm:gap-4
                "
              >
                <Link
                  href="/contact"
                  className="
                    inline-flex
                    h-11
                    min-w-[160px]
                    items-center
                    justify-center
                    rounded-[14px]
                    bg-[#BBFF1B]
                    px-6
                    py-2.5
                    text-sm
                    font-bold
                    text-black
                    transition-colors
                    duration-200
                    hover:bg-[#c7ff3e]
                  "
                >
                  Start a Project
                </Link>

                <Link
                  href="/work"
                  className="
                    inline-flex
                    h-11
                    min-w-[160px]
                    items-center
                    justify-center
                    rounded-[14px]
                    border
                    border-white/20
                    bg-white/10
                    px-6
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    transition-colors
                    duration-200
                    hover:border-white/30
                    hover:bg-white/15
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