'use client';

import Link from 'next/link';

import {
  ArrowUpRight,
  BookOpen,
} from 'lucide-react';

import {
  resources,
} from '@/data/resources';

export function RecommendedGuides() {
  const guides = resources
    .filter(
      (resource) =>
        resource.type === 'guide'
    )
    .slice(0, 3);

  if (guides.length === 0) {
    return null;
  }

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
        {/* ------------------------------------------------------------ */}
        {/* Heading                                                      */}
        {/* ------------------------------------------------------------ */}

        <div
          className="
            flex
            flex-col
            gap-5
            md:flex-row
            md:items-end
            md:justify-between
          "
        >
          <div className="max-w-2xl">
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
              Popular guides
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
              Go deeper with practical
              resources.
            </h2>
          </div>

          <div
            className="
              flex
              flex-col
              gap-4
              md:items-end
            "
          >
            <p
              className="
                max-w-lg
                text-sm
                leading-6
                text-muted-foreground
                sm:text-[15px]
                sm:leading-7
                md:text-right
              "
            >
              Explore step-by-step guides
              covering brand identity,
              design systems, typography,
              launches, and more.
            </p>

            <Link
              href="/help/guides"
              className="
                group
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-primary
              "
            >
              View all guides

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
        </div>

        {/* ------------------------------------------------------------ */}
        {/* Guide cards                                                  */}
        {/* ------------------------------------------------------------ */}

        <div
          className="
            mt-12
            grid
            gap-5
            md:grid-cols-3
          "
        >
          {guides.map(
            (guide) => (
              <Link
                key={guide.id}
                href={guide.href}
                className="
                  group
                  relative
                  flex
                  min-h-[360px]
                  flex-col
                  overflow-hidden
                  rounded-3xl
                  border
                  border-border
                  bg-card
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-primary/35
                  hover:shadow-[0_18px_55px_rgba(0,0,0,0.08)]
                "
              >
                {/* ---------------------------------------------------- */}
                {/* Preview                                             */}
                {/* ---------------------------------------------------- */}

                <div
                  className="
                    relative
                    h-[180px]
                    overflow-hidden
                    bg-secondary
                  "
                >
                  {guide.preview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={guide.preview}
                      alt={guide.title}
                      className="
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-700
                        ease-[cubic-bezier(0.16,1,0.3,1)]
                        group-hover:scale-[1.035]
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center
                        bg-primary/10
                        text-primary
                      "
                    >
                      <BookOpen
                        size={38}
                        strokeWidth={1.7}
                      />
                    </div>
                  )}

                  {/* Type badge */}

                  <div
                    className="
                      absolute
                      left-4
                      top-4
                      rounded-full
                      bg-[#BBFF1B]
                      px-2.5
                      py-1
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-black
                    "
                  >
                    Guide
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* Content                                             */}
                {/* ---------------------------------------------------- */}

                <div
                  className="
                    flex
                    flex-1
                    flex-col
                    p-6
                  "
                >
                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                      text-[11px]
                      font-medium
                      text-muted-foreground
                    "
                  >
                    <span>
                      {guide.category}
                    </span>

                    {guide.badge && (
                      <>
                        <span
                          aria-hidden="true"
                          className="
                            h-1
                            w-1
                            rounded-full
                            bg-muted-foreground/35
                          "
                        />

                        <span>
                          {guide.badge}
                        </span>
                      </>
                    )}
                  </div>

                  <h3
                    className="
                      mt-3
                      text-xl
                      font-semibold
                      leading-tight
                      tracking-[-0.025em]
                      text-foreground
                    "
                  >
                    {guide.title}
                  </h3>

                  <p
                    className="
                      mt-3
                      line-clamp-3
                      text-sm
                      leading-6
                      text-muted-foreground
                    "
                  >
                    {guide.description}
                  </p>

                  <div
                    className="
                      mt-auto
                      pt-6
                    "
                  >
                    <div
                      className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-semibold
                        text-primary
                      "
                    >
                      Read guide

                      <ArrowUpRight
                        size={15}
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
            )
          )}
        </div>
      </div>
    </section>
  );
}