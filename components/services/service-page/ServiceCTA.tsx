import Link from 'next/link';

import {
  ArrowRight,
} from 'lucide-react';

import type { ServicePage } from '@/data/servicePages';

type ServiceCTAProps = {
  service: ServicePage;
};

export function ServiceCTA({
  service,
}: ServiceCTAProps) {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#010008]
        px-4
        pb-8
        text-white
        sm:px-6
        sm:pb-10
        lg:px-8
        lg:pb-12
      "
    >
      <div
        className="
          container-page
          relative
        "
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-[28px]
            border
            border-white/10
            bg-[#071B34]
            px-6
            py-16
            shadow-[0_30px_100px_-45px_rgba(0,0,0,0.9)]
            sm:px-10
            sm:py-20
            lg:px-14
            lg:py-24
          "
        >
          {/* ------------------------------------------------------ */}
          {/* Background                                             */}
          {/* ------------------------------------------------------ */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-br
              from-[#071B34]
              via-[#071B34]
              to-[#010008]
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -left-28
              -top-28
              h-[420px]
              w-[420px]
              rounded-full
              bg-[#1600A2]/35
              blur-[120px]
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -bottom-40
              right-0
              h-[480px]
              w-[480px]
              rounded-full
              bg-[#1D45FF]/20
              blur-[140px]
            "
          />

          {/* Lime detail */}

          <div
            aria-hidden="true"
            className="
              absolute
              right-8
              top-8
              h-2
              w-2
              rounded-full
              bg-[#BBFF1B]
              sm:right-10
              sm:top-10
            "
          />

          {/* ------------------------------------------------------ */}
          {/* Content                                                */}
          {/* ------------------------------------------------------ */}

          <div
            className="
              relative
              z-10
              grid
              gap-10
              lg:grid-cols-[1.35fr_0.65fr]
              lg:items-end
              lg:gap-20
            "
          >
            <div>
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
                Start a project
              </p>

              <h2
                className="
                  mt-5
                  max-w-4xl
                  text-balance
                  font-heading
                  text-[2.8rem]
                  font-semibold
                  leading-[0.98]
                  tracking-[-0.05em]
                  text-white
                  sm:text-[3.8rem]
                  lg:text-[5rem]
                "
              >
                Make your next move
                count.
              </h2>

              <p
                className="
                  mt-6
                  max-w-2xl
                  text-base
                  leading-7
                  text-white/55
                  sm:text-lg
                  sm:leading-8
                "
              >
                Tell us what you're
                working on and where
                you want to go next.
                We’ll help you figure
                out the right way to
                approach it.
              </p>
            </div>

            {/* ---------------------------------------------------- */}
            {/* Action                                               */}
            {/* ---------------------------------------------------- */}

            <div
              className="
                flex
                lg:justify-end
              "
            >
              <Link
                href="/contact"
                className="
                  group
                  inline-flex
                  min-h-14
                  items-center
                  justify-center
                  gap-3
                  rounded-full
                  bg-white
                  px-6
                  text-sm
                  font-semibold
                  text-black
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#BBFF1B]
                "
              >
                Start a project

                <ArrowRight
                  className="
                    h-4
                    w-4
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </div>
          </div>

          {/* ------------------------------------------------------ */}
          {/* Bottom detail                                          */}
          {/* ------------------------------------------------------ */}

          <div
            className="
              relative
              z-10
              mt-16
              flex
              items-center
              gap-4
              border-t
              border-white/10
              pt-5
              sm:mt-20
            "
          >
            <span
              className="
                font-mono
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-white/25
              "
            >
              {service.title}
            </span>

            <div
              className="
                h-px
                flex-1
                bg-white/[0.06]
              "
            />

            <span
              className="
                font-mono
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-white/25
              "
            >
              Bivi
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}