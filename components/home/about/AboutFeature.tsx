'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

import { Reveal } from '../Reveal';

export function AboutFeature() {
  return (
    <div
      className="
        grid
        items-center
        gap-12
        border-t
        border-border
        pt-16
        sm:pt-20
        lg:grid-cols-[0.8fr_1.2fr]
        lg:gap-20
        lg:pt-24
      "
    >
      <Reveal className="max-w-xl">
        <p
          className="
            text-xs
            font-semibold
            uppercase
            tracking-[0.2em]
            text-primary
          "
        >
          Built for momentum
        </p>

        <h3
          className="
            mt-5
            text-balance
            font-serif
            text-4xl
            font-medium
            leading-[0.98]
            tracking-[-0.045em]
            sm:text-5xl
            lg:text-6xl
          "
        >
          Strategy that gives every creative decision a reason to exist.
        </h3>

        <p
          className="
            mt-7
            max-w-md
            text-base
            leading-7
            text-muted-foreground
            sm:text-lg
            sm:leading-8
          "
        >
          From the first positioning conversation to a polished site launch,
          Design Blade helps you create a cohesive brand that is easier to
          understand, choose, and grow.
        </p>

        <a
          href="/about"
          className="
            group
            mt-9
            inline-flex
            h-[52px]
            items-center
            gap-2
            rounded-full
            bg-primary
            px-7
            text-sm
            font-medium
            text-primary-foreground
            transition-transform
            duration-300
            hover:scale-[1.03]
            active:scale-[0.98]
          "
        >
          More about Design Blade

          <ArrowUpRight
            size={17}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-0.5
              group-hover:-translate-y-0.5
            "
          />
        </a>
      </Reveal>

      <Reveal delay={0.12}>
        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            bg-secondary
            aspect-[4/3]
            sm:aspect-[16/10]
          "
        >
          <Image
            src="/images/about/design-philosophy-2.jpg"
            alt="A Design Blade brand strategy and design project"
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="
              object-cover
              transition-transform
              duration-700
              ease-[cubic-bezier(0.16,1,0.3,1)]
              hover:scale-[1.025]
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/30
              via-transparent
              to-transparent
            "
          />

          <div
            className="
              absolute
              bottom-5
              left-5
              rounded-full
              border
              border-white/25
              bg-black/20
              px-4
              py-2
              text-xs
              font-medium
              uppercase
              tracking-[0.16em]
              text-white
              backdrop-blur-md
              sm:bottom-7
              sm:left-7
            "
          >
            Strategy · Identity · Digital
          </div>
        </div>
      </Reveal>
    </div>
  );
}