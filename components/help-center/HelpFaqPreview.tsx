'use client';

import Link from 'next/link';

import {
  ArrowRight,
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

const MAX_FAQS = 6;

export function HelpFaqPreview() {
  const faqItems =
    faqCategories
      .flatMap(
        (category) =>
          category.items.map(
            (item, index) => ({
              id: `${category.id}-${index}`,
              categoryId:
                category.id,
              categoryLabel:
                category.label,
              question:
                item.question,
              answer:
                item.answer,
            })
          )
      )
      .slice(
        0,
        MAX_FAQS
      );

  if (
    faqItems.length === 0
  ) {
    return null;
  }

  return (
    <section
      className="
        border-t
        border-border
        bg-secondary/20
        py-20
        sm:py-24
        lg:py-28
      "
    >
      <div className="container-page">
        {/* ------------------------------------------------------------ */}
        {/* Header                                                       */}
        {/* ------------------------------------------------------------ */}

        <div
          className="
            grid
            gap-8
            lg:grid-cols-[0.8fr_1.2fr]
            lg:gap-16
          "
        >
          {/* ---------------------------------------------------------- */}
          {/* Intro                                                      */}
          {/* ---------------------------------------------------------- */}

          <div
            className="
              lg:sticky
              lg:top-32
              lg:self-start
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

            <h2
              className="
                mt-4
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
              Quick answers to
              common questions.
            </h2>

            <p
              className="
                mt-5
                max-w-lg
                text-sm
                leading-6
                text-muted-foreground
                sm:text-[15px]
                sm:leading-7
              "
            >
              Find straightforward
              answers about projects,
              timelines, pricing,
              deliverables, ownership,
              revisions, and working
              with Design Blade.
            </p>

            <Link
              href="/help/faq"
              className="
                group
                mt-7
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-primary
              "
            >
              View all FAQs

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

          {/* ---------------------------------------------------------- */}
          {/* Accordion                                                  */}
          {/* ---------------------------------------------------------- */}

          <div
            className="
              overflow-hidden
              rounded-3xl
              border
              border-border
              bg-background
            "
          >
            <Accordion
              type="single"
              collapsible
              className="w-full"
            >
              {faqItems.map(
                (
                  item,
                  index
                ) => (
                  <AccordionItem
                    key={
                      item.id
                    }
                    value={
                      item.id
                    }
                    className={`
                      px-5
                      sm:px-6
                      ${
                        index ===
                        faqItems.length -
                          1
                          ? 'border-b-0'
                          : ''
                      }
                    `}
                  >
                    <AccordionTrigger
                      className="
                        py-5
                        text-left
                        hover:no-underline
                        sm:py-6
                      "
                    >
                      <div
                        className="
                          pr-4
                        "
                      >
                        <span
                          className="
                            block
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.14em]
                            text-primary
                          "
                        >
                          {
                            item.categoryLabel
                          }
                        </span>

                        <span
                          className="
                            mt-1.5
                            block
                            font-heading
                            text-base
                            font-semibold
                            leading-6
                            tracking-[-0.015em]
                            text-foreground
                            sm:text-lg
                          "
                        >
                          {
                            item.question
                          }
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent
                      className="
                        pb-6
                        pr-8
                        text-sm
                        leading-7
                        text-muted-foreground
                        sm:text-[15px]
                      "
                    >
                      <p>
                        {
                          item.answer
                        }
                      </p>

                      <Link
                        href={`/help/faq#${item.categoryId}`}
                        className="
                          group
                          mt-4
                          inline-flex
                          items-center
                          gap-2
                          text-sm
                          font-semibold
                          text-primary
                        "
                      >
                        More in this
                        topic

                        <ArrowRight
                          size={14}
                          strokeWidth={2}
                          className="
                            transition-transform
                            duration-300
                            group-hover:translate-x-1
                          "
                        />
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                )
              )}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}