'use client';

import Link from 'next/link';

import {
  ArrowUpRight,
  Clock3,
  Sparkles,
  Wrench,
} from 'lucide-react';

import {
  labItems,
} from '@/data/studio-lab/registry';

export function RecommendedTools() {
  const recommendedItems =
    labItems
      .filter(
        (item) =>
          item.status ===
            'active' &&
          (
            item.type ===
              'tool' ||
            item.type ===
              'assessment'
          )
      )
      .sort(
        (a, b) =>
          Number(b.featured) -
          Number(a.featured)
      )
      .slice(0, 4);

  if (
    recommendedItems.length === 0
  ) {
    return null;
  }

  return (
    <section
      className="
        border-y
        border-border
        bg-secondary/20
        py-20
        sm:py-24
        lg:py-28
      "
    >
      <div className="container-page">
        {/* ------------------------------------------------------------ */}
        {/* Heading                                                      */}
        {/* ------------------------------------------------------------ */}

        <div
          className="
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div
            className="
              max-w-3xl
            "
          >
            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-primary
                sm:text-xs
              "
            >
              Free tools
            </p>

            <h2
              className="
                mt-3
                text-balance
                font-serif
                text-3xl
                font-semibold
                leading-[1.03]
                tracking-[-0.04em]
                sm:text-4xl
                md:text-5xl
              "
            >
              Solve it yourself.
            </h2>

            <p
              className="
                mt-5
                max-w-2xl
                text-sm
                leading-6
                text-muted-foreground
                sm:text-[15px]
                sm:leading-7
              "
            >
              Use free Bivi
              tools and assessments to
              explore your brand,
              clarify decisions, and
              handle practical tasks
              before you ever need to
              contact us.
            </p>
          </div>

          <Link
            href="/help/tools"
            className="
              group
              inline-flex
              w-fit
              items-center
              gap-2
              text-sm
              font-semibold
              text-primary
            "
          >
            Explore all free tools

            <ArrowUpRight
              size={16}
              strokeWidth={2}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
              "
            />
          </Link>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* Tools grid                                                   */}
        {/* ------------------------------------------------------------ */}

        <div
          className="
            mt-12
            grid
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          {recommendedItems.map(
            (item) => {
              const isAssessment =
                item.type ===
                'assessment';

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="
                    group
                    relative
                    flex
                    min-h-[310px]
                    flex-col
                    overflow-hidden
                    rounded-3xl
                    border
                    border-border
                    bg-background
                    p-6
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-primary/40
                    hover:shadow-[0_18px_55px_rgba(0,0,0,0.08)]
                  "
                >
                  {/* -------------------------------------------------- */}
                  {/* Decorative glow                                    */}
                  {/* -------------------------------------------------- */}

                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      -right-14
                      -top-14
                      h-36
                      w-36
                      rounded-full
                      bg-primary/5
                      blur-3xl
                      transition-transform
                      duration-500
                      group-hover:scale-125
                    "
                  />

                  {/* -------------------------------------------------- */}
                  {/* Top                                                */}
                  {/* -------------------------------------------------- */}

                  <div
                    className="
                      relative
                      z-10
                      flex
                      items-start
                      justify-between
                      gap-4
                    "
                  >
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-primary/10
                        text-primary
                        transition-colors
                        duration-300
                        group-hover:bg-primary
                        group-hover:text-white
                      "
                    >
                      {isAssessment ? (
                        <Sparkles
                          size={20}
                          strokeWidth={2}
                        />
                      ) : (
                        <Wrench
                          size={20}
                          strokeWidth={2}
                        />
                      )}
                    </div>

                    <span
                      className="
                        rounded-full
                        bg-[#BBFF1B]
                        px-2.5
                        py-1
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.11em]
                        text-black
                      "
                    >
                      {isAssessment
                        ? 'Assessment'
                        : 'Tool'}
                    </span>
                  </div>

                  {/* -------------------------------------------------- */}
                  {/* Content                                            */}
                  {/* -------------------------------------------------- */}

                  <div
                    className="
                      relative
                      z-10
                      mt-8
                    "
                  >
                    <h3
                      className="
                        text-xl
                        font-semibold
                        leading-tight
                        tracking-[-0.025em]
                        text-foreground
                      "
                    >
                      {item.title}
                    </h3>

                    <p
                      className="
                        mt-3
                        line-clamp-4
                        text-sm
                        leading-6
                        text-muted-foreground
                      "
                    >
                      {item.description}
                    </p>
                  </div>

                  {/* -------------------------------------------------- */}
                  {/* Footer                                             */}
                  {/* -------------------------------------------------- */}

                  <div
                    className="
                      relative
                      z-10
                      mt-auto
                      pt-8
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          text-xs
                          font-medium
                          text-muted-foreground
                        "
                      >
                        <Clock3
                          size={14}
                          strokeWidth={2}
                        />

                        <span>
                          {
                            item.estimatedTime
                          }
                        </span>
                      </div>

                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-border
                          text-foreground
                          transition-all
                          duration-300
                          group-hover:border-[#BBFF1B]
                          group-hover:bg-[#BBFF1B]
                          group-hover:text-black
                        "
                      >
                        <ArrowUpRight
                          size={16}
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
                  </div>
                </Link>
              );
            }
          )}
        </div>

        {/* ------------------------------------------------------------ */}
        {/* Supporting note                                              */}
        {/* ------------------------------------------------------------ */}

        <div
          className="
            mt-7
            flex
            flex-col
            gap-2
            text-sm
            text-muted-foreground
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p>
            No account or sign-in is
            required to use Bivi
            free tools.
          </p>

          <Link
            href="/studio-lab"
            className="
              group
              inline-flex
              items-center
              gap-2
              font-semibold
              text-foreground
              transition-colors
              hover:text-primary
            "
          >
            Visit Studio Lab

            <ArrowUpRight
              size={15}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
              "
            />
          </Link>
        </div>
      </div>
    </section>
  );
}