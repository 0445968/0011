'use client';

import Link from 'next/link';

import {
  ArrowRight,
  BookOpen,
  FileText,
  HelpCircle,
  Wrench,
} from 'lucide-react';

import {
  popularHelpItems,
} from '@/data/help-center/categories';

function getItemIcon(
  type: 'FAQ' | 'Guide' | 'Article' | 'Tool'
) {
  switch (type) {
    case 'Guide':
      return BookOpen;

    case 'Article':
      return FileText;

    case 'Tool':
      return Wrench;

    case 'FAQ':
    default:
      return HelpCircle;
  }
}

export function PopularHelp() {
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
            gap-5
            md:flex-row
            md:items-end
            md:justify-between
          "
        >
          <div
            className="
              max-w-2xl
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
              Popular help
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
              Start with the questions
              people ask most.
            </h2>
          </div>

          <p
            className="
              max-w-lg
              text-sm
              leading-6
              text-muted-foreground
              sm:text-[15px]
              sm:leading-7
            "
          >
            Find quick answers, practical
            guides, and useful resources
            before reaching out to the
            Design Blade team.
          </p>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* Popular items                                                */}
        {/* ------------------------------------------------------------ */}

        <div
          className="
            mt-12
            overflow-hidden
            rounded-3xl
            border
            border-border
            bg-background
          "
        >
          {popularHelpItems.map(
            (item, index) => {
              const Icon =
                getItemIcon(item.type);

              const isLast =
                index ===
                popularHelpItems.length - 1;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`
                    group
                    grid
                    gap-4
                    px-5
                    py-5
                    transition-colors
                    duration-200
                    hover:bg-secondary/50
                    sm:px-6
                    sm:py-6
                    md:grid-cols-[auto_1fr_auto]
                    md:items-center
                    md:gap-6
                    ${
                      isLast
                        ? ''
                        : 'border-b border-border'
                    }
                  `}
                >
                  {/* -------------------------------------------------- */}
                  {/* Icon                                               */}
                  {/* -------------------------------------------------- */}

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
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
                    <Icon
                      size={19}
                      strokeWidth={2}
                    />
                  </div>

                  {/* -------------------------------------------------- */}
                  {/* Main content                                       */}
                  {/* -------------------------------------------------- */}

                  <div
                    className="
                      min-w-0
                    "
                  >
                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                      "
                    >
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
                        {item.type}
                      </span>

                      <span
                        className="
                          text-[11px]
                          font-medium
                          text-muted-foreground
                        "
                      >
                        {item.category}
                      </span>
                    </div>

                    <h3
                      className="
                        mt-2.5
                        text-base
                        font-semibold
                        leading-snug
                        tracking-[-0.015em]
                        text-foreground
                        sm:text-lg
                      "
                    >
                      {item.title}
                    </h3>
                  </div>

                  {/* -------------------------------------------------- */}
                  {/* Arrow                                              */}
                  {/* -------------------------------------------------- */}

                  <div
                    className="
                      hidden
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-border
                      text-muted-foreground
                      transition-all
                      duration-300
                      group-hover:border-[#BBFF1B]
                      group-hover:bg-[#BBFF1B]
                      group-hover:text-black
                      md:flex
                    "
                  >
                    <ArrowRight
                      size={16}
                      strokeWidth={2}
                      className="
                        transition-transform
                        duration-300
                        group-hover:translate-x-0.5
                      "
                    />
                  </div>
                </Link>
              );
            }
          )}
        </div>

        {/* ------------------------------------------------------------ */}
        {/* Bottom links                                                 */}
        {/* ------------------------------------------------------------ */}

        <div
          className="
            mt-7
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p
            className="
              text-sm
              text-muted-foreground
            "
          >
            Can&apos;t find what you&apos;re
            looking for?
          </p>

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-4
            "
          >
            <Link
              href="/help/faq"
              className="
                group
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-foreground
                transition-colors
                hover:text-primary
              "
            >
              View all FAQs

              <ArrowRight
                size={15}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </Link>

            <Link
              href="/help/contact"
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
              Contact us

              <ArrowRight
                size={15}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}