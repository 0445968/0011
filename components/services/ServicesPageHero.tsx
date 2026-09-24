'use client';

import Link from 'next/link';

import {
  ArrowDown,
  ArrowUpRight,
} from 'lucide-react';

export function ServicesPageHero() {
  return (
    <section
      className="
        relative
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
      {/* Background image */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[url('/images/services/services-hero.jpg')]
          bg-cover
          bg-center
        "
      />

      {/* Black overlay */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-black/50
        "
      />

      {/* Black fade */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-b
          from-black/15
          via-black/35
          to-[#010008]
        "
      />

      {/* Strong lower fade */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-[55%]
          bg-gradient-to-b
          from-transparent
          via-black/55
          to-[#010008]
        "
      />

      {/* Content */}

      <div
        className="
          container-page
          relative
          z-10
        "
      >
        <div
          className="
            mx-auto
            max-w-3xl
            pt-8
            text-center
            sm:pt-10
            lg:pt-12
          "
        >
          <p
            className="
              font-mono
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-[#BBFF1B]
              sm:text-xs
            "
          >
            What we do
          </p>

          <h1
            className="
              mx-auto
              mt-4
              max-w-3xl
              text-balance
              font-heading
              text-3xl
              font-semibold
              leading-[1.08]
              tracking-[-0.04em]
              sm:text-4xl
              lg:text-5xl
              xl:text-[3.4rem]
            "
          >
            Built around where your business
            needs to go next
          </h1>

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-sm
              leading-6
              text-white/70
              sm:text-base
            "
          >
            Strategy, design, and digital
            work brought together under
            one creative partner.
          </p>

          {/* Buttons */}

          <div
            className="
              mt-8
              flex
              flex-wrap
              items-center
              justify-center
              gap-3
            "
          >
            <Link
              href="/contact"
              className="
                group
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-[14px]
                bg-white
                px-5
                text-sm
                font-bold
                text-black
                transition-colors
                duration-300
                hover:bg-[#BBFF1B]
              "
            >
              Start a project

              <ArrowUpRight
                className="
                  h-4
                  w-4
                  transition-transform
                  duration-300
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
              />
            </Link>

            <button
              type="button"
              onClick={() => {
                const firstService =
                  document.getElementById(
                    'branding-services'
                  );

                firstService?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }}
              className="
    group
    inline-flex
    h-11
    items-center
    justify-center
    gap-2
    rounded-[14px]
    bg-white/20
    px-5
    text-sm
    font-bold
    text-white
    backdrop-blur-sm
    transition-colors
    duration-300
    hover:bg-white/30
  "
            >
              Explore services

              <ArrowDown
                className="
      h-4
      w-4
      transition-transform
      duration-300
      group-hover:translate-y-0.5
    "
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}