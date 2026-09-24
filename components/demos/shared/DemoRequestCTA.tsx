import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowUpRight,
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
      <div className="container-page">
        <div
          className="
            relative
            isolate
            overflow-hidden
            rounded-[32px]
            border
            border-border
            bg-muted
            px-6
            py-16
            text-foreground
            sm:px-10
            sm:py-20
            md:px-16
            lg:px-20
            lg:py-24
          "
        >
          {/* ======================================================== */}
          {/* Background shapes                                       */}
          {/* ======================================================== */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              -z-20
            "
          >
            {/* Top left circle */}
            <div
              className="
                absolute
                -left-24
                -top-28
                h-[260px]
                w-[260px]
                rounded-full
                bg-foreground/[0.035]
              "
            />

            {/* Top center block */}
            <div
              className="
                absolute
                left-[32%]
                top-0
                h-[32%]
                w-[34%]
                bg-foreground/[0.025]
              "
            />

            {/* Top right block */}
            <div
              className="
                absolute
                right-0
                top-0
                h-[32%]
                w-[18%]
                bg-foreground/[0.035]
              "
            />

            {/* Bottom left block */}
            <div
              className="
                absolute
                bottom-0
                left-0
                h-[34%]
                w-[17%]
                bg-foreground/[0.03]
              "
            />

            {/* Bottom center circle */}
            <div
              className="
                absolute
                -bottom-36
                left-[32%]
                h-[300px]
                w-[300px]
                rounded-full
                bg-foreground/[0.025]
              "
            />

            {/* Bottom right circle */}
            <div
              className="
                absolute
                -bottom-40
                -right-28
                h-[340px]
                w-[340px]
                rounded-full
                bg-foreground/[0.035]
              "
            />
          </div>

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
            {/* Custom PNG icon */}

            <div
              className="
                relative
                h-14
                w-14
                overflow-hidden
              "
            >
              <Image
                src="/images/demos/cta-icon.png"
                alt=""
                fill
                sizes="56px"
                className="
                  object-contain
                "
              />
            </div>

            {/* Eyebrow */}

            <p
              className="
                mt-6
                font-mono
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-muted-foreground
              "
            >
              Need something different?
            </p>

            {/* ====================================================== */}
            {/* Headline                                               */}
            {/* ====================================================== */}

            <div
              className="
                mt-5
                flex
                flex-col
                items-center
              "
            >
              {/* First line */}

              <h2
                className="
  whitespace-nowrap
  font-heading
  text-[1.85rem]
  font-medium
  leading-[1.2]
  tracking-[-0.04em]
  sm:text-[2.2rem]
  md:text-[2.65rem]
  lg:text-[3rem]
"
              >
                Your idea could be
              </h2>

              {/* Second line + button */}

              <div
                className="
                  mt-1
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-4
                  sm:flex-row
                  sm:gap-5
                "
              >
                <h2
                  className="
  whitespace-nowrap
  font-heading
  text-[1.85rem]
  font-medium
  leading-[1.2]
  tracking-[-0.04em]
  sm:text-[2.2rem]
  md:text-[2.65rem]
  lg:text-[3rem]
"
                >
                  the next demo
                </h2>

                <Link
                  href="/help/contact/demo"
                  className="
                    group
                    inline-flex
                    h-12
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-[14px]
                    border
                    border-border
                    bg-black                  
                    px-6
                    text-[15px]
                    font-semibold
                    text-white
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:shadow-md
                    dark:bg-white
                    dark:text-black
                    dark:hover:bg-white/90
                  "
                >
                  Request a demo

                  <ArrowUpRight
                    size={16}
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
        </div>
      </div>
    </section>
  );
}