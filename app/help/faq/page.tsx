'use client';

import Link from 'next/link';

import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Search,
} from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import {
  faqCategories,
} from '@/data/faq';

export default function HelpFaqPage() {
  const totalQuestions =
    faqCategories.reduce(
      (total, category) =>
        total +
        category.items.length,
      0
    );

  return (
    <main
      className="
        min-h-screen
        bg-background
      "
    >
      {/* ------------------------------------------------------------ */}
      {/* Hero                                                         */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          border-b
          border-border
          bg-secondary/20
          pb-14
          pt-28
          sm:pb-16
          sm:pt-32
          lg:pb-20
          lg:pt-36
        "
      >
        <div className="container-page">
          <Link
            href="/help"
            className="
              group
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-muted-foreground
              transition-colors
              hover:text-primary
            "
          >
            <ArrowLeft
              size={15}
              strokeWidth={2}
              className="
                transition-transform
                duration-200
                group-hover:-translate-x-1
              "
            />

            Help Center
          </Link>

          <div
            className="
              mt-8
              grid
              gap-8
              lg:grid-cols-[1fr_auto]
              lg:items-end
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
                Frequently asked
                questions
              </p>

              <h1
                className="
                  mt-4
                  text-balance
                  font-serif
                  text-4xl
                  font-semibold
                  leading-[0.98]
                  tracking-[-0.045em]
                  sm:text-5xl
                  md:text-6xl
                "
              >
                Answers to common
                questions.
              </h1>

              <p
                className="
                  mt-6
                  max-w-2xl
                  text-base
                  leading-7
                  text-muted-foreground
                  sm:text-lg
                  sm:leading-8
                "
              >
                Learn more about
                Bivi projects,
                strategy, design,
                pricing, timelines,
                deliverables, and
                working together.
              </p>
            </div>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-border
                bg-background
                px-5
                py-4
              "
            >
              <HelpCircle
                size={20}
                strokeWidth={2}
                className="
                  text-primary
                "
              />

              <div>
                <p
                  className="
                    text-xs
                    font-medium
                    text-muted-foreground
                  "
                >
                  Available answers
                </p>

                <p
                  className="
                    mt-0.5
                    text-lg
                    font-semibold
                    text-foreground
                  "
                >
                  {totalQuestions}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Category navigation                                          */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          border-b
          border-border
          bg-background
        "
      >
        <div
          className="
            container-page
            overflow-x-auto
          "
        >
          <div
            className="
              flex
              min-w-max
              items-center
              gap-2
              py-4
            "
          >
            {faqCategories.map(
              (category) => (
                <a
                  key={
                    category.id
                  }
                  href={`#${category.id}`}
                  className="
                    rounded-full
                    border
                    border-border
                    bg-card
                    px-4
                    py-2
                    text-xs
                    font-semibold
                    text-muted-foreground
                    transition-all
                    duration-200
                    hover:border-primary/40
                    hover:bg-primary/5
                    hover:text-primary
                  "
                >
                  {
                    category.label
                  }
                </a>
              )
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* FAQ content                                                   */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          py-16
          sm:py-20
          lg:py-24
        "
      >
        <div
          className="
            container-page
            grid
            gap-12
            lg:grid-cols-[260px_1fr]
            lg:gap-16
          "
        >
          {/* ---------------------------------------------------------- */}
          {/* Desktop sidebar                                           */}
          {/* ---------------------------------------------------------- */}

          <aside
            className="
              hidden
              lg:block
            "
          >
            <div
              className="
                sticky
                top-28
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-muted-foreground
                "
              >
                On this page
              </p>

              <div
                className="
                  mt-4
                  flex
                  flex-col
                  border-l
                  border-border
                "
              >
                {faqCategories.map(
                  (category) => (
                    <a
                      key={
                        category.id
                      }
                      href={`#${category.id}`}
                      className="
                        border-l-2
                        border-transparent
                        py-2
                        pl-4
                        text-sm
                        font-medium
                        text-muted-foreground
                        transition-all
                        duration-200
                        hover:border-primary
                        hover:text-primary
                      "
                    >
                      {
                        category.label
                      }
                    </a>
                  )
                )}
              </div>

              <div
                className="
                  mt-8
                  rounded-2xl
                  border
                  border-border
                  bg-secondary/30
                  p-5
                "
              >
                <Search
                  size={18}
                  strokeWidth={2}
                  className="
                    text-primary
                  "
                />

                <h3
                  className="
                    mt-4
                    text-sm
                    font-semibold
                    text-foreground
                  "
                >
                  Still looking?
                </h3>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-muted-foreground
                  "
                >
                  Search the full Help
                  Center or contact
                  Bivi directly.
                </p>

                <Link
                  href="/help"
                  className="
                    group
                    mt-4
                    inline-flex
                    items-center
                    gap-2
                    text-xs
                    font-semibold
                    text-primary
                  "
                >
                  Search Help Center

                  <ArrowRight
                    size={13}
                    className="
                      transition-transform
                      duration-200
                      group-hover:translate-x-1
                    "
                  />
                </Link>
              </div>
            </div>
          </aside>

          {/* ---------------------------------------------------------- */}
          {/* FAQ groups                                                */}
          {/* ---------------------------------------------------------- */}

          <div
            className="
              min-w-0
            "
          >
            {faqCategories.map(
              (
                category,
                categoryIndex
              ) => (
                <section
                  key={
                    category.id
                  }
                  id={
                    category.id
                  }
                  className={`
                    scroll-mt-28
                    ${
                      categoryIndex ===
                      0
                        ? ''
                        : `
                            mt-16
                            border-t
                            border-border
                            pt-16
                          `
                    }
                  `}
                >
                  <div
                    className="
                      mb-7
                      flex
                      items-end
                      justify-between
                      gap-6
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.16em]
                          text-primary
                        "
                      >
                        FAQ category
                      </p>

                      <h2
                        className="
                          mt-2
                          font-serif
                          text-2xl
                          font-semibold
                          tracking-[-0.03em]
                          text-foreground
                          sm:text-3xl
                        "
                      >
                        {
                          category.label
                        }
                      </h2>
                    </div>

                    <span
                      className="
                        hidden
                        text-xs
                        font-medium
                        text-muted-foreground
                        sm:block
                      "
                    >
                      {
                        category
                          .items
                          .length
                      }{' '}
                      questions
                    </span>
                  </div>

                  <div
                    className="
                      overflow-hidden
                      rounded-3xl
                      border
                      border-border
                      bg-card
                    "
                  >
                    <Accordion
                      type="single"
                      collapsible
                      className="w-full"
                    >
                      {category.items.map(
                        (
                          item,
                          index
                        ) => (
                          <AccordionItem
                            key={`${category.id}-${index}`}
                            value={`${category.id}-${index}`}
                            className="
                              px-5
                              sm:px-6
                            "
                          >
                            <AccordionTrigger
                              className="
                                py-5
                                text-left
                                hover:no-underline
                                sm:py-6
                              "
                            >
                              <span
                                className="
                                  pr-5
                                  text-[15px]
                                  font-semibold
                                  leading-6
                                  tracking-[-0.015em]
                                  text-foreground
                                  sm:text-base
                                "
                              >
                                {
                                  item.question
                                }
                              </span>
                            </AccordionTrigger>

                            <AccordionContent
                              className="
                                max-w-3xl
                                pb-6
                                pr-8
                                text-sm
                                leading-7
                                text-muted-foreground
                                sm:text-[15px]
                              "
                            >
                              {
                                item.answer
                              }
                            </AccordionContent>
                          </AccordionItem>
                        )
                      )}
                    </Accordion>
                  </div>
                </section>
              )
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Contact CTA                                                   */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          pb-20
          sm:pb-24
          lg:pb-28
        "
      >
        <div className="container-page">
          <div
            className="
              flex
              flex-col
              gap-7
              rounded-3xl
              bg-[#0B65F3]
              px-6
              py-8
              text-white
              sm:px-8
              sm:py-10
              md:flex-row
              md:items-center
              md:justify-between
              lg:px-10
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#BBFF1B]
                "
              >
                Need more help?
              </p>

              <h2
                className="
                  mt-2
                  font-serif
                  text-2xl
                  font-semibold
                  tracking-[-0.03em]
                  sm:text-3xl
                "
              >
                Ask Bivi directly.
              </h2>

              <p
                className="
                  mt-2
                  max-w-xl
                  text-sm
                  leading-6
                  text-white/70
                "
              >
                Report a bug, request a
                feature, request a demo,
                or schedule an appointment.
              </p>
            </div>

            <Link
              href="/help/contact"
              className="
                group
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-full
                bg-[#BBFF1B]
                px-5
                py-3
                text-sm
                font-semibold
                text-black
              "
            >
              Contact us

              <ArrowRight
                size={15}
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}