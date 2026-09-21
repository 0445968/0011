import Link from 'next/link';

import { Reveal } from '@/components/portfolio/Reveal';

export function ProcessCTA() {
  return (
    <section
      className="
        relative
        pb-14
        pt-10
        sm:pb-16
        sm:pt-12
        lg:pb-20
        lg:pt-14
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
            {/* Decorative glow */}

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
                Ready to give your brand some direction?
              </h2>

              <p
                className="
                  mt-5
                  max-w-2xl
                  text-sm
                  leading-7
                  text-white/75
                  sm:text-base
                "
              >
                Tell us where your business is today and where
                you want to take it. We&apos;ll help figure out
                what kind of process makes sense for what you
                actually need.
              </p>

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