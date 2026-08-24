'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { Reveal } from '@/components/portfolio/Reveal';

export function AboutGetStarted() {
  return (
    <section
      className="
        relative
        pt-8
        sm:pt-12
        lg:pt-16
      "
    >
      <div className="container-page">
        <Reveal>
          <div
            className="
              relative
              min-h-[520px]
              overflow-hidden
              rounded-t-[2rem]
              bg-[#1600A2]
              text-white
              sm:min-h-[560px]
              lg:min-h-[620px]
            "
          >
            {/* ---------------------------------------------------------- */}
            {/* Background treatment                                       */}
            {/* ---------------------------------------------------------- */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                opacity-[0.18]
              "
              style={{
                backgroundImage: `
                  linear-gradient(
                    rgba(255,255,255,0.12) 1px,
                    transparent 1px
                  ),
                  linear-gradient(
                    90deg,
                    rgba(255,255,255,0.12) 1px,
                    transparent 1px
                  )
                `,
                backgroundSize: '56px 56px',
              }}
            />

            {/* Blue glow */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -left-40
                -top-40
                h-[520px]
                w-[520px]
                rounded-full
                bg-[#0B65F3]
                opacity-60
                blur-[120px]
              "
            />

            {/* Green glow */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -bottom-40
                right-[5%]
                h-[380px]
                w-[380px]
                rounded-full
                bg-[#BBFF1B]
                opacity-[0.12]
                blur-[110px]
              "
            />

            {/* ---------------------------------------------------------- */}
            {/* Content                                                     */}
            {/* ---------------------------------------------------------- */}

            <div
              className="
                relative
                z-10
                grid
                min-h-[520px]
                gap-14
                p-7
                sm:min-h-[560px]
                sm:p-10
                md:p-12
                lg:min-h-[620px]
                lg:grid-cols-12
                lg:items-center
                lg:gap-12
                lg:p-16
              "
            >
              {/* -------------------------------------------------------- */}
              {/* Left content                                              */}
              {/* -------------------------------------------------------- */}

              <div className="lg:col-span-7">
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-white/65
                  "
                >
                  <span className="h-px w-8 bg-[#BBFF1B]" />

                  Get Started
                </div>

                <h2
                  className="
                    mt-8
                    max-w-4xl
                    text-balance
                    font-heading
                    text-5xl
                    font-semibold
                    leading-[0.92]
                    tracking-[-0.045em]
                    sm:text-6xl
                    md:text-7xl
                    lg:text-[5.5rem]
                  "
                >
                  Have something
                  <br />
                  worth building?
                </h2>

                <p
                  className="
                    mt-7
                    max-w-xl
                    text-base
                    leading-relaxed
                    text-white/70
                    sm:text-lg
                  "
                >
                  Tell us what you&apos;re working on. We&apos;ll help
                  turn the idea into a clear, distinctive brand built
                  to move with your business.
                </p>

                <Link
                  href="/contact"
                  className="
                    group
                    mt-9
                    inline-flex
                    items-center
                    gap-3
                    rounded-xl
                    bg-[#BBFF1B]
                    px-6
                    py-3.5
                    text-sm
                    font-semibold
                    text-black
                    transition-opacity
                    duration-200
                    hover:opacity-90
                    sm:text-base
                  "
                >
                  Start a Project

                  <ArrowUpRight
                    size={18}
                    strokeWidth={2}
                    className="
                      transition-transform
                      duration-200
                      group-hover:-translate-y-0.5
                      group-hover:translate-x-0.5
                    "
                  />
                </Link>
              </div>

              {/* -------------------------------------------------------- */}
              {/* Right graphic                                             */}
              {/* -------------------------------------------------------- */}

              <div
                className="
                  relative
                  flex
                  min-h-[300px]
                  items-center
                  justify-center
                  lg:col-span-5
                  lg:min-h-[430px]
                "
              >
                <BiviGraphic />
              </div>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* Bottom line                                                 */}
            {/* ---------------------------------------------------------- */}

            <div
              className="
                absolute
                inset-x-0
                bottom-0
                z-20
                h-px
                bg-white/10
              "
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Abstract Bivi graphic                                                  */
/* ---------------------------------------------------------------------- */

function BiviGraphic() {
  return (
    <div
      aria-hidden="true"
      className="
        relative
        aspect-square
        w-full
        max-w-[420px]
      "
    >
      {/* Outer orbit */}
      <div
        className="
          absolute
          inset-[5%]
          rounded-full
          border
          border-white/15
        "
      />

      {/* Second orbit */}
      <div
        className="
          absolute
          inset-[16%]
          rotate-12
          rounded-[30%]
          border
          border-white/10
        "
      />

      {/* Main blue shape */}
      <div
        className="
          absolute
          left-[13%]
          top-[18%]
          h-[58%]
          w-[58%]
          rotate-[-14deg]
          rounded-[28%]
          bg-[#0B65F3]
          shadow-2xl
        "
      />

      {/* Green blade */}
      <div
        className="
          absolute
          right-[12%]
          top-[13%]
          h-[66%]
          w-[24%]
          rotate-[24deg]
          rounded-full
          bg-[#BBFF1B]
        "
      />

      {/* Front violet card */}
      <div
        className="
          absolute
          bottom-[10%]
          left-[20%]
          flex
          h-[44%]
          w-[58%]
          rotate-[7deg]
          items-center
          justify-center
          rounded-[24%]
          border
          border-white/15
          bg-white/10
          shadow-2xl
          backdrop-blur-md
        "
      >
        <span
          className="
            font-heading
            text-[clamp(4rem,8vw,7rem)]
            font-semibold
            leading-none
            tracking-[-0.08em]
            text-white
          "
        >
          B
        </span>
      </div>

      {/* Small accent dot */}
      <div
        className="
          absolute
          bottom-[15%]
          right-[7%]
          h-5
          w-5
          rounded-full
          bg-[#BBFF1B]
          shadow-lg
          sm:h-6
          sm:w-6
        "
      />
    </div>
  );
}