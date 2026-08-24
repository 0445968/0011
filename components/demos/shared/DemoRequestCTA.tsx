import Link from 'next/link';

import {
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export function DemoRequestCTA() {
  return (
    <section
      className="
        bg-background
        py-20
        sm:py-24
        lg:py-28
      "
    >
      <div
        className="
          container-page
        "
      >
        <div
          className="
            relative
            isolate
            overflow-hidden
            rounded-[2rem]
            bg-[#BBFF1B]
            px-6
            py-20
            text-[#111111]
            sm:px-10
            sm:py-24
            md:px-16
            lg:px-20
            lg:py-28
          "
        >
          {/* ======================================================== */}
          {/* Background treatment                                    */}
          {/* ======================================================== */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              -z-20
              bg-gradient-to-br
              from-[#BBFF1B]
              via-[#BBFF1B]
              to-[#A8EE00]
            "
          />

          {/* Soft center glow */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              -z-10
              h-[520px]
              w-[520px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-white/20
              blur-[120px]
            "
          />

          {/* ======================================================== */}
          {/* Decorative top-right rings                              */}
          {/* ======================================================== */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-24
              -top-28
              -z-10
              h-[330px]
              w-[330px]
              rounded-full
              border-[18px]
              border-[#0B65F3]/16
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-12
              -top-40
              -z-10
              h-[370px]
              w-[370px]
              rounded-full
              border-[7px]
              border-[#0B65F3]/28
            "
          />

          {/* ======================================================== */}
          {/* Decorative bottom-left                                  */}
          {/* ======================================================== */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -bottom-28
              -left-28
              -z-10
              h-[310px]
              w-[310px]
              rounded-full
              border-[18px]
              border-black/10
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              bottom-16
              left-12
              -z-10
              h-3
              w-3
              rotate-45
              bg-[#0B65F3]
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              right-[18%]
              top-[22%]
              -z-10
              h-2.5
              w-2.5
              rotate-45
              bg-[#0B65F3]
            "
          />

          {/* ======================================================== */}
          {/* Content                                                 */}
          {/* ======================================================== */}

          <div
            className="
              relative
              z-10
              mx-auto
              flex
              max-w-5xl
              flex-col
              items-center
              text-center
            "
          >
            {/* Icon */}
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-[#0B65F3]
                text-white
              "
            >
              <Sparkles
                size={19}
              />
            </div>

            {/* Eyebrow */}
            <p
              className="
                mt-6
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.22em]
                text-[#0B65F3]
              "
            >
              Need something different?
            </p>

            {/* Heading */}
            <h2
              className="
                mt-5
                max-w-[14ch]
                text-balance
                font-heading
                text-4xl
                font-semibold
                leading-[0.98]
                tracking-[-0.05em]
                sm:text-3xl
                md:text-4xl
                lg:text-5xl
              "
            >
              Your idea could be the next demo.
            </h2>

            {/* Description */}
            <p
              className="
                mt-7
                max-w-2xl
                text-balance
                text-base
                leading-7
                text-black/65
                sm:text-lg
                sm:leading-8
              "
            >
              Tell us what you want to explore.
              We can help shape a demo around a
              product idea, workflow, interface,
              or digital experience that matters
              to you.
            </p>

            {/* CTA */}
            <Link
              href="/help/contact/demo"
              className="
                group
                mt-9
                inline-flex
                h-12
                items-center
                justify-center
                gap-2
                rounded-[14px]
                bg-[#0B65F3]
                px-6
                text-[16px]
                font-bold
                text-white
                transition-colors
                hover:bg-[#1600A2]
              "
            >
              Request a demo

              <ArrowUpRight
                size={15}
                className="
                  transition-transform
                  duration-300
                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5
                "
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}