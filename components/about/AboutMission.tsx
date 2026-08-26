'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Phone } from 'lucide-react';

import { Reveal } from '@/components/portfolio/Reveal';

export function AboutMission() {
  return (
    <section
      className="
        relative
        overflow-hidden
        pt-32
        sm:pt-36
        lg:pt-40
      "
    >
      <div className="container-page">
       

        {/* -------------------------------------------------------------- */}
        {/* Main content                                                   */}
        {/* -------------------------------------------------------------- */}

        <div className="mx-auto mt-10 max-w-5xl text-center">
        <Reveal delay={0.06}>
  <h1
    className="
      text-balance
      font-heading
      text-4xl
      font-semibold
      leading-tight
      tracking-tight
      sm:text-5xl
      md:text-6xl
    "
  >
    A trusted creative team,{' '}
    <span className="relative inline-block">
      whenever
      <span
        aria-hidden="true"
        className="
          absolute
          -bottom-1
          left-0
          h-[5px]
          w-full
          rounded-full
          bg-[#BBFF1B]
        "
      />
    </span>{' '}
    you need us.
  </h1>
</Reveal>

          <Reveal delay={0.12}>
            <div
              className="
                mx-auto
                mt-8
                max-w-2xl
                text-center
              "
            >
              <p
                className="
                  text-base
                  leading-relaxed
                  text-muted-foreground
                  sm:text-lg
                "
              >
                Bivi exists to help you turn your ideas into
                a brand that feels clear, intentional, and
                unmistakably your own.
              </p>

              <p
                className="
                  mt-5
                  text-base
                  leading-relaxed
                  text-muted-foreground
                  sm:text-lg
                "
              >
                We bring brand strategy and graphic design
                together from the beginning, creating visual
                systems that give teams a stronger point of view
                and a foundation they can keep building on.
              </p>
            </div>
          </Reveal>

          {/* ------------------------------------------------------------ */}
          {/* CTA                                                          */}
          {/* ------------------------------------------------------------ */}

          <Reveal delay={0.16}>
            <div className="mt-8 flex justify-center">
            <Link
  href="/contact"
  className="
    group
    inline-flex
    items-center
    gap-2.5
    rounded-[14px]
    bg-black
    px-6
    py-3.5
    text-[16px]
    font-bold
    text-white
    transition-opacity
    duration-200
    hover:opacity-90
    dark:bg-white
    dark:text-black
    sm:text-base
  "
>
  Book a Call

  <Phone
    size={17}
    strokeWidth={2}
  />
</Link>
            </div>
          </Reveal>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Mission graphic                                                */}
        {/* -------------------------------------------------------------- */}

        <Reveal
          delay={0.2}
          className="mt-12 sm:mt-14 lg:mt-16"
        >
          <div
            className="
              mx-auto
              flex
              w-full
              max-w-[900px]
              items-center
              justify-center
            "
          >
            <div
              className="
                relative
                aspect-[16/9]
                w-full
                max-w-[800px]
              "
            >
              <Image
                src="/images/about/about-mission.png"
                alt="Bivi brand strategy and graphic design"
                fill
                priority
                sizes="
                  (max-width: 640px) 90vw,
                  (max-width: 1024px) 80vw,
                  800px
                "
                className="object-contain"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}