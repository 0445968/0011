'use client';

import Link from 'next/link';

import {
  ArrowRight,
} from 'lucide-react';

import {
  helpTopicGroups,
} from '@/data/help-center/categories';

export function HelpTopicGrid() {
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
    max-w-3xl
    text-left
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
              text-2xl
              font-semibold
              leading-[1.03]
              tracking-[-0.04em]
              sm:text-3xl
              md:text-4xl
            "
          >
            Find help by topic.
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
            Browse guidance by subject,
            from starting a project to
            strategy, visual identity,
            pricing, collaboration, and
            self-service resources.
          </p>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* Topic groups                                                 */}
        {/* ------------------------------------------------------------ */}

        <div
          className="
            mt-14
            grid
            gap-x-8
            gap-y-12
            md:grid-cols-2
            lg:grid-cols-3
            lg:gap-x-10
            lg:gap-y-14
          "
        >
          {helpTopicGroups.map(
            (group) => {
              const Icon =
                group.icon;

              return (
                <div
                  key={group.id}
                  className="
                    border-t
                    border-border
                    pt-6
                  "
                >
                  {/* -------------------------------------------------- */}
                  {/* Group heading                                      */}
                  {/* -------------------------------------------------- */}

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-primary/10
                        text-primary
                      "
                    >
                      <Icon
                        size={18}
                        strokeWidth={2}
                      />
                    </div>

                    <h3
                      className="
                        text-lg
                        font-semibold
                        tracking-[-0.02em]
                        text-foreground
                      "
                    >
                      {group.title}
                    </h3>
                  </div>

                  {/* -------------------------------------------------- */}
                  {/* Links                                              */}
                  {/* -------------------------------------------------- */}

                  <div
                    className="
                      mt-5
                      flex
                      flex-col
                    "
                  >
                    {group.links.map(
                      (link) => (
                        <Link
                          key={
                            link.label
                          }
                          href={
                            link.href
                          }
                          className="
                            group/link
                            flex
                            items-start
                            justify-between
                            gap-4
                            border-b
                            border-border/70
                            py-3.5
                            text-sm
                            font-medium
                            leading-6
                            text-foreground
                            transition-colors
                            duration-200
                            hover:text-primary
                          "
                        >
                          <span>
                            {
                              link.label
                            }
                          </span>

                          <ArrowRight
                            size={15}
                            strokeWidth={2}
                            className="
                              mt-1
                              shrink-0
                              text-muted-foreground
                              transition-all
                              duration-300
                              group-hover/link:translate-x-1
                              group-hover/link:text-primary
                            "
                          />
                        </Link>
                      )
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}