import Link from 'next/link';

import {
  ArrowLeft,
  ArrowUpRight,
} from 'lucide-react';

import type {
  Demo,
} from '@/data/demos/registry';

interface DemoLandingProps {
  demo: Demo;
}

export function DemoLanding({
  demo,
}: DemoLandingProps) {
  const {
    presentation,
  } = demo;

  return (
    <section
      className={`
        relative
        min-h-screen
        overflow-hidden
        pt-24
        md:pt-28
        ${presentation.background}
        ${presentation.foreground}
      `}
    >
      {/* ------------------------------------------------------------ */}
      {/* Decorative background                                       */}
      {/* ------------------------------------------------------------ */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            -right-40
            top-20
            h-[34rem]
            w-[34rem]
            rounded-full
            bg-current
            opacity-[0.025]
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-48
            -left-40
            h-[32rem]
            w-[32rem]
            rounded-full
            bg-current
            opacity-[0.025]
            blur-3xl
          "
        />
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Main hero                                                    */}
      {/* ------------------------------------------------------------ */}

      <div
        className="
          container-page
          relative
          z-10
        "
      >
        <div
          className="
            grid
            min-h-[calc(100vh-7rem)]
            items-center
            gap-14
            py-12
            lg:grid-cols-[0.86fr_1.14fr]
            lg:gap-16
            lg:py-16
          "
        >
          {/* -------------------------------------------------------- */}
          {/* Copy                                                     */}
          {/* -------------------------------------------------------- */}

          <div
            className="
              max-w-2xl
            "
          >
            <Link
              href="/demos"
              className={`
                group
                inline-flex
                items-center
                gap-2
                text-sm
                font-medium
                transition-opacity
                hover:opacity-65
                ${presentation.muted}
              `}
            >
              <ArrowLeft
                size={15}
                className="
                  transition-transform
                  duration-300
                  group-hover:-translate-x-1
                "
              />

              All demos
            </Link>

            <div
              className="
                mt-10
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <span
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                "
              >
                {
                  presentation.eyebrow
                }
              </span>

              <span
                aria-hidden="true"
                className="
                  h-1
                  w-1
                  rounded-full
                  bg-current
                  opacity-35
                "
              />

              <span
                className={`
                  text-xs
                  font-medium
                  ${presentation.muted}
                `}
              >
                Interactive demo
              </span>
            </div>

            <h1
              className="
                mt-6
                max-w-[11ch]
                font-heading
                text-[3.25rem]
                font-semibold
                leading-[0.96]
                tracking-[-0.055em]
                sm:text-[4rem]
                md:text-[4.6rem]
                lg:text-[5.25rem]
              "
            >
              {
                presentation.headline
              }
            </h1>

            <p
              className={`
                mt-7
                max-w-xl
                text-base
                leading-7
                sm:text-lg
                sm:leading-8
                ${presentation.muted}
              `}
            >
              {
                presentation.description
              }
            </p>

            {/* ------------------------------------------------------ */}
            {/* Actions                                                */}
            {/* ------------------------------------------------------ */}

            <div
              className="
                mt-9
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <Link
                href={`/demos/${demo.slug}/demo`}
                className={`
                  group
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  gap-2.5
                  rounded-xl
                  px-6
                  text-sm
                  font-semibold
                  transition-colors
                  ${presentation.accent}
                  ${presentation.accentHover}
                  ${presentation.accentText}
                `}
              >
                Enter demo

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

              <Link
                href={`/help/contact/demo?from=${encodeURIComponent(
                  demo.slug
                )}`}
                className={`
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  px-6
                  text-sm
                  font-semibold
                  transition-colors
                  ${presentation.secondaryButton}
                `}
              >
                Request another demo
              </Link>
            </div>

            {/* ------------------------------------------------------ */}
            {/* Meta                                                   */}
            {/* ------------------------------------------------------ */}

            <div
              className={`
                mt-9
                flex
                flex-wrap
                items-center
                gap-x-4
                gap-y-2
                text-xs
                ${presentation.muted}
              `}
            >
              <span>
                {
                  demo.productName
                }
              </span>

              <span
                aria-hidden="true"
                className="
                  h-1
                  w-1
                  rounded-full
                  bg-current
                  opacity-30
                "
              />

              <span>
                {
                  demo.category
                }
              </span>

              <span
                aria-hidden="true"
                className="
                  h-1
                  w-1
                  rounded-full
                  bg-current
                  opacity-30
                "
              />

              <span>
                {
                  demo.technologies.join(
                    ' · '
                  )
                }
              </span>
            </div>
          </div>

          {/* -------------------------------------------------------- */}
          {/* Product preview                                         */}
          {/* -------------------------------------------------------- */}

          <div
            className="
              relative
              lg:pl-6
            "
          >
            <div
              aria-hidden="true"
              className="
                absolute
                inset-x-[8%]
                bottom-[-6%]
                h-24
                rounded-full
                bg-black/15
                blur-3xl
                dark:bg-black/35
              "
            />

            <div
              className={`
                relative
                overflow-hidden
                rounded-[2rem]
                border
                border-black/[0.07]
                p-3
                shadow-[0_30px_90px_rgba(0,0,0,0.14)]
                dark:border-white/[0.08]
                sm:p-4
                ${presentation.surface}
              `}
            >
              {/* Browser rail */}
              <div
                className="
                  flex
                  h-9
                  items-center
                  justify-between
                  px-2
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-1.5
                  "
                >
                  <span
                    className="
                      h-2
                      w-2
                      rounded-full
                      bg-current
                      opacity-20
                    "
                  />

                  <span
                    className="
                      h-2
                      w-2
                      rounded-full
                      bg-current
                      opacity-15
                    "
                  />

                  <span
                    className="
                      h-2
                      w-2
                      rounded-full
                      bg-current
                      opacity-10
                    "
                  />
                </div>

                <span
                  className={`
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    ${presentation.muted}
                  `}
                >
                  {
                    demo.productName
                  }
                </span>
              </div>

              {/* Preview image */}
              <div
                className="
                  relative
                  aspect-[4/3]
                  overflow-hidden
                  rounded-[1.35rem]
                  border
                  border-black/[0.06]
                  bg-black/[0.025]
                  dark:border-white/[0.06]
                  dark:bg-white/[0.025]
                "
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    demo.thumbnail
                  }
                  alt={`${demo.productName} demo preview`}
                  className="
                    h-full
                    w-full
                    object-cover
                    object-top
                  "
                />

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/[0.06]
                    via-transparent
                    to-white/[0.03]
                  "
                />
              </div>
            </div>

            {/* Floating label */}
            <div
              className={`
                absolute
                -bottom-5
                right-5
                hidden
                rounded-xl
                border
                border-black/[0.07]
                px-4
                py-3
                text-xs
                font-medium
                shadow-xl
                backdrop-blur-xl
                dark:border-white/[0.08]
                sm:block
                ${presentation.surface}
              `}
            >
              <span
                className={
                  presentation.muted
                }
              >
                Explore the prototype
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}