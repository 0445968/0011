'use client';

import Link from 'next/link';

import {
  ArrowUpRight,
} from 'lucide-react';

import {
  helpCategories,
} from '@/data/help-center/categories';

export function HelpCategoryGrid() {
  return (
    <section
      className="
        border-b
        border-border
        bg-background
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
            mx-auto
            max-w-3xl
            text-center
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
            Browse the Help Center
          </p>

          <h2
            className="
              mt-4
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
            Find help by topic.
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-sm
              leading-6
              text-muted-foreground
              sm:text-base
              sm:leading-7
            "
          >
            Explore project guidance,
            brand strategy resources,
            visual identity help, and
            everything you need to know
            about working with Design Blade.
          </p>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* Category grid                                                */}
        {/* ------------------------------------------------------------ */}

        <div
          className="
            mt-12
            grid
            gap-4
            sm:mt-14
            md:grid-cols-2
            lg:gap-5
          "
        >
          {helpCategories.map(
            (category) => {
              const Icon =
                category.icon;

              return (
                <Link
                  key={category.id}
                  href={category.href}
                  className="
                    group
                    relative
                    min-h-[300px]
                    overflow-hidden
                    rounded-3xl
                    border
                    border-border
                    bg-card
                    p-7
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-primary/40
                    hover:shadow-[0_18px_60px_rgba(0,0,0,0.08)]
                    sm:p-8
                    lg:min-h-[330px]
                    lg:p-9
                  "
                >
                  {/* -------------------------------------------------- */}
                  {/* Background accent                                  */}
                  {/* -------------------------------------------------- */}

                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      -right-16
                      -top-16
                      h-44
                      w-44
                      rounded-full
                      bg-primary/5
                      blur-3xl
                      transition-transform
                      duration-500
                      group-hover:scale-125
                    "
                  />

                  {/* -------------------------------------------------- */}
                  {/* Top row                                            */}
                  {/* -------------------------------------------------- */}

                  <div
                    className="
                      relative
                      z-10
                      flex
                      items-start
                      justify-between
                      gap-6
                    "
                  >
                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        bg-primary
                        text-white
                        shadow-sm
                      "
                    >
                      <Icon
                        size={22}
                        strokeWidth={2}
                      />
                    </div>

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-border
                        bg-background
                        text-foreground
                        transition-all
                        duration-300
                        group-hover:border-[#BBFF1B]
                        group-hover:bg-[#BBFF1B]
                        group-hover:text-black
                      "
                    >
                      <ArrowUpRight
                        size={18}
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

                  {/* -------------------------------------------------- */}
                  {/* Content                                            */}
                  {/* -------------------------------------------------- */}

                  <div
                    className="
                      relative
                      z-10
                      mt-10
                    "
                  >
                    <h3
                      className="
                        font-heading
                        text-2xl
                        font-semibold
                        tracking-[-0.025em]
                        sm:text-[1.7rem]
                      "
                    >
                      {category.title}
                    </h3>

                    <p
                      className="
                        mt-3
                        max-w-xl
                        text-sm
                        leading-6
                        text-muted-foreground
                        sm:text-[15px]
                        sm:leading-7
                      "
                    >
                      {category.description}
                    </p>
                  </div>

                  {/* -------------------------------------------------- */}
                  {/* Topic links                                        */}
                  {/* -------------------------------------------------- */}

                  <div
                    className="
                      relative
                      z-10
                      mt-7
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {category.topics.map(
                      (topic) => (
                        <span
                          key={topic}
                          className="
                            rounded-full
                            border
                            border-border
                            bg-background/70
                            px-3
                            py-1.5
                            text-[11px]
                            font-medium
                            text-muted-foreground
                            transition-colors
                            duration-300
                            group-hover:border-primary/20
                            group-hover:text-foreground
                          "
                        >
                          {topic}
                        </span>
                      )
                    )}
                  </div>
                </Link>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}