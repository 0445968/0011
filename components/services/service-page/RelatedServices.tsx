import Link from 'next/link';

import {
  ArrowUpRight,
} from 'lucide-react';

import type { ServicePage } from '@/data/servicePages';
import { services } from '@/data/services';

type RelatedServicesProps = {
  service: ServicePage;
};

export function RelatedServices({
  service,
}: RelatedServicesProps) {
  const related = service.relatedServices
    .map((slug) =>
      services.find(
        (item) =>
          item.id === slug
      )
    )
    .filter(Boolean);

  if (related.length === 0) {
    return null;
  }

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#010008]
        py-24
        text-white
        sm:py-28
        lg:py-36
      "
    >
      {/* ---------------------------------------------------------- */}
      {/* Background atmosphere                                      */}
      {/* ---------------------------------------------------------- */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-56
          top-1/2
          h-[520px]
          w-[520px]
          -translate-y-1/2
          rounded-full
          bg-[#1600A2]/12
          blur-[150px]
        "
      />

      <div
        className="
          container-page
          relative
          z-10
        "
      >
        {/* -------------------------------------------------------- */}
        {/* Intro                                                    */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            grid
            gap-8
            lg:grid-cols-[0.7fr_1.35fr]
            lg:gap-20
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <span
                aria-hidden="true"
                className="
                  h-px
                  w-8
                  bg-[#BBFF1B]
                "
              />

              <p
                className="
                  font-mono
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-white/45
                  sm:text-xs
                "
              >
                Related services
              </p>
            </div>
          </div>

          <div>
            <h2
              className="
                max-w-3xl
                text-balance
                font-heading
                text-3xl
                font-semibold
                leading-[1.02]
                tracking-[-0.04em]
                text-white
                sm:text-4xl
                lg:text-5xl
              "
            >
              Keep building from here.
            </h2>

            <p
              className="
                mt-5
                max-w-xl
                text-sm
                leading-6
                text-white/45
                sm:text-base
                sm:leading-7
              "
            >
              Many projects combine more
              than one service. These are
              the areas that most naturally
              connect with this work.
            </p>
          </div>
        </div>

        {/* -------------------------------------------------------- */}
        {/* Links                                                    */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            mt-14
            border-t
            border-white/10
            lg:mt-20
          "
        >
          {related.map(
            (item, index) => (
              <Link
                key={item!.id}
                href={item!.href}
                className="
                  group
                  relative
                  grid
                  gap-5
                  border-b
                  border-white/10
                  py-7
                  transition-colors
                  duration-300
                  hover:bg-white/[0.025]
                  sm:grid-cols-[70px_1fr_auto]
                  sm:items-center
                  sm:gap-8
                  sm:px-3
                  sm:py-9
                "
              >
                {/* Number */}

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
                  {String(
                    index + 1
                  ).padStart(
                    2,
                    '0'
                  )}
                </span>

                {/* Title + description */}

                <div>
                  <h3
                    className="
                      max-w-3xl
                      font-heading
                      text-2xl
                      font-semibold
                      leading-[1.02]
                      tracking-[-0.035em]
                      text-white
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                      sm:text-3xl
                      lg:text-[2.35rem]
                    "
                  >
                    {item!.title}
                  </h3>

                  <p
                    className="
                      mt-3
                      max-w-xl
                      text-sm
                      leading-6
                      text-white/40
                    "
                  >
                    {item!.description}
                  </p>
                </div>

                {/* Arrow */}

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/15
                    text-white
                    transition-all
                    duration-300
                    group-hover:border-white
                    group-hover:bg-white
                    group-hover:text-black
                  "
                >
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
                </div>
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  );
}