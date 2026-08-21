'use client';

import Link from 'next/link';

import {
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';

import {
  helpContactOptions,
} from '@/data/help-center/categories';

export function HelpContactCTA() {
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
            overflow-hidden
            rounded-[2rem]
            bg-[#0B65F3]
            px-6
            py-10
            text-white
            sm:px-8
            sm:py-12
            lg:px-12
            lg:py-14
          "
        >
          {/* ---------------------------------------------------------- */}
          {/* Decorative background                                     */}
          {/* ---------------------------------------------------------- */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
            "
          >
            <div
              className="
                absolute
                -right-24
                -top-24
                h-[360px]
                w-[360px]
                rounded-full
                bg-[#BBFF1B]/12
                blur-[100px]
              "
            />

            <div
              className="
                absolute
                -bottom-28
                -left-20
                h-[340px]
                w-[340px]
                rounded-full
                bg-[#1600A2]/45
                blur-[110px]
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-br
                from-transparent
                via-transparent
                to-[#1600A2]/30
              "
            />
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Header                                                     */}
          {/* ---------------------------------------------------------- */}

          <div
            className="
              relative
              z-10
              grid
              gap-8
              lg:grid-cols-[0.85fr_1.15fr]
              lg:items-end
              lg:gap-16
            "
          >
            <div>
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-[#BBFF1B]
                  sm:text-xs
                "
              >
                Contact Design Blade
              </p>

              <h2
                className="
                  mt-4
                  max-w-xl
                  text-balance
                  font-serif
                  text-3xl
                  font-semibold
                  leading-[1.02]
                  tracking-[-0.04em]
                  sm:text-4xl
                  md:text-5xl
                "
              >
                Still need help?
              </h2>

              <p
                className="
                  mt-5
                  max-w-xl
                  text-sm
                  leading-6
                  text-white/75
                  sm:text-base
                  sm:leading-7
                "
              >
                Tell us what you need
                help with and we&apos;ll
                route you to the right
                form instead of making
                you work through one
                generic contact page.
              </p>

              <Link
                href="/help/contact"
                className="
                  group
                  mt-7
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-[#BBFF1B]
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-black
                  transition-transform
                  duration-300
                  hover:scale-[1.02]
                  active:scale-[0.98]
                "
              >
                View contact options

                <ArrowRight
                  size={16}
                  strokeWidth={2}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </div>

            <p
              className="
                max-w-xl
                text-sm
                leading-6
                text-white/65
                sm:text-[15px]
                sm:leading-7
                lg:justify-self-end
              "
            >
              You don&apos;t need an
              account or sign-in to
              contact Design Blade.
              Choose the option that
              best matches what you
              need and we&apos;ll only
              ask for information that
              is relevant to that
              request.
            </p>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Contact options                                            */}
          {/* ---------------------------------------------------------- */}

          <div
            className="
              relative
              z-10
              mt-10
              grid
              gap-3
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >
            {helpContactOptions.map(
              (option) => {
                const Icon =
                  option.icon;

                return (
                  <Link
                    key={option.id}
                    href={option.href}
                    className="
                      group
                      flex
                      min-h-[230px]
                      flex-col
                      rounded-2xl
                      border
                      border-white/15
                      bg-white/[0.08]
                      p-5
                      backdrop-blur-sm
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-[#BBFF1B]/70
                      hover:bg-white/[0.12]
                    "
                  >
                    {/* Icon */}

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-white/10
                        text-white
                        transition-colors
                        duration-300
                        group-hover:bg-[#BBFF1B]
                        group-hover:text-black
                      "
                    >
                      <Icon
                        size={18}
                        strokeWidth={2}
                      />
                    </div>

                    {/* Content */}

                    <div
                      className="
                        mt-7
                      "
                    >
                      <h3
                        className="
                          text-lg
                          font-semibold
                          tracking-[-0.02em]
                          text-white
                        "
                      >
                        {option.title}
                      </h3>

                      <p
                        className="
                          mt-2
                          text-sm
                          leading-6
                          text-white/65
                        "
                      >
                        {
                          option.description
                        }
                      </p>
                    </div>

                    {/* Footer */}

                    <div
                      className="
                        mt-auto
                        flex
                        items-center
                        justify-between
                        gap-4
                        pt-7
                      "
                    >
                      <span
                        className="
                          text-sm
                          font-semibold
                          text-white
                        "
                      >
                        Get started
                      </span>

                      <div
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-white/20
                          text-white
                          transition-all
                          duration-300
                          group-hover:border-[#BBFF1B]
                          group-hover:bg-[#BBFF1B]
                          group-hover:text-black
                        "
                      >
                        <ArrowUpRight
                          size={14}
                          strokeWidth={2}
                          className="
                            transition-transform
                            duration-300
                            group-hover:translate-x-0.5
                            group-hover:-translate-y-0.5
                          "
                        />
                      </div>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        </div>
      </div>
    </section>
  );
}