'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowUpRight,
} from 'lucide-react';

export function HomepageCTA() {
  return (
    <section
      className="
        relative
        w-full
        bg-black
      "
    >
      {/* ================================================== */}
      {/* CTA                                                */}
      {/* ================================================== */}

      <div
        className="
          relative
          min-h-[600px]
          w-full
          overflow-hidden

          sm:min-h-[630px]
          lg:min-h-[660px]
        "
      >
        {/* ================================================== */}
        {/* BACKGROUND IMAGE                                  */}
        {/* ================================================== */}

        <Image
          src="/images/cta/cta-background.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="
            object-cover
            object-center
          "
        />

        {/* ================================================== */}
        {/* BACKGROUND OVERLAY                                */}
        {/* ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-10
            bg-black/50
          "
        />

        {/* ================================================== */}
        {/* CTA CONTENT                                       */}
        {/* ================================================== */}

        <div
          className="
            relative
            z-20

            mx-auto
            flex
            max-w-4xl
            flex-col
            items-center

            px-6
            pt-12

            text-center

            sm:px-10
            sm:pt-14

            lg:px-16
            lg:pt-16
          "
        >
          {/* Label */}

          <p
            className="
              font-mono
              text-[11px]
              font-medium
              uppercase
              tracking-[0.14em]
              text-white/60

              sm:text-[12px]
            "
          >
            Let&apos;s work together
          </p>

          {/* Heading */}

          <h2
            className="
              mt-5
              max-w-2xl

              text-balance
              font-heading
              text-[2.6rem]
              font-semibold
              leading-[1.05]
              tracking-[-0.035em]
              text-white

              sm:text-[3.25rem]
md:text-[3.75rem]
lg:text-[4.25rem]
            "
          >
            Let the journey begin
          </h2>

          {/* CTA Button */}

          <Link
            href="/contact"
            className="
              group

              mt-7
              inline-flex
              h-[50px]

              items-center
              justify-center
              gap-2.5

              rounded-[14px]

              bg-white
              px-6

              font-mono
              text-[13px]
              font-medium
              text-black

              transition-all
              duration-300

              hover:scale-[1.02]
              hover:bg-white/90

              active:scale-[0.98]
            "
          >
            Let&apos;s have a chat

            <ArrowUpRight
              className="
                h-4
                w-4

                transition-transform
                duration-300

                group-hover:-translate-y-0.5
                group-hover:translate-x-0.5
              "
              strokeWidth={2}
            />
          </Link>
        </div>

{/* ================================================== */}
{/* FOREGROUND IMAGE                                  */}
{/* ================================================== */}

<div
  className="
    absolute
    bottom-0
    right-[calc(50%-50vw)]
    z-30

    w-[72%]

    sm:w-[60%]
    lg:w-[54%]
  "
>
  <Image
    src="/images/cta/cta-image.png"
    alt=""
    width={1200}
    height={800}
    priority
    sizes="
      (max-width: 640px) 72vw,
      (max-width: 1024px) 60vw,
      54vw
    "
    className="
      block
      h-auto
      w-full
    "
  />
</div>
      </div>
    </section>
  );
}