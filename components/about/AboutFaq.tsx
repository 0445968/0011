'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import { Reveal } from '@/components/portfolio/Reveal';

const faqs = [
  {
    question: 'What does Bivi specialize in?',
    answer:
      'Bivi specializes in brand strategy, visual identity, graphic design, campaign creative, print, and supporting brand systems.',
  },
  {
    question: 'Do you only work with businesses in Houston?',
    answer:
      'No. Bivi is based in Houston, Texas, but we work with teams and businesses remotely as well.',
  },
  {
    question: 'Can Bivi work with an existing brand?',
    answer:
      'Yes. We can refine, extend, or strengthen an existing identity without requiring a complete rebrand.',
  },
  {
    question: 'What does a typical project process look like?',
    answer:
      'Most projects move through discovery, strategy, concept development, design, refinement, and final delivery.',
  },
  {
    question: 'Do you offer ongoing design support?',
    answer:
      'Yes. Depending on the project, Bivi can continue supporting your brand with campaigns, social design, print, and other ongoing creative needs.',
  },
  {
    question: 'How long does a branding project take?',
    answer:
      'Timelines depend on scope, but most branding projects are planned around clear phases so expectations and milestones stay easy to follow.',
  },
  {
    question: 'Can you help with both strategy and execution?',
    answer:
      'Yes. Strategy and design are developed together so the final work is visually strong and grounded in a clear reason for existing.',
  },
];

export function AboutFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const leftColumn = faqs.filter((_, index) => index % 2 === 0);
  const rightColumn = faqs.filter((_, index) => index % 2 !== 0);

  return (
    <section className="relative py-12 sm:py-16 lg:py-20">
      <div className="container-page">
        <Reveal>
          <div
            className="
              rounded-[28px]
              border
              border-border
              bg-card
              p-6
              sm:p-8
              lg:p-10
            "
          >
            {/* Header */}
            <div className="max-w-3xl">
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-border
                  bg-background
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                "
              >
                FAQ

                <span
                  className="
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-md
                    bg-[#0B65F3]
                    text-[11px]
                    font-bold
                    text-white
                  "
                >
                  ?
                </span>
              </div>

              <h2
                className="
                  mt-6
                  text-balance
                  font-heading
                  text-4xl
                  font-semibold
                  leading-tight
                  tracking-[-0.04em]
                  sm:text-5xl
                "
              >
                Common questions about working with Bivi.
              </h2>

              <p
                className="
                  mt-4
                  max-w-2xl
                  text-base
                  leading-relaxed
                  text-muted-foreground
                  sm:text-lg
                "
              >
                A few useful answers about our services, process, and how we
                work with teams near and far.
              </p>
            </div>

            {/* Accordion grid */}
            <div
              className="
                mt-12
                grid
                gap-4
                lg:grid-cols-2
                lg:gap-5
              "
            >
              <div className="space-y-4">
                {leftColumn.map((faq) => {
                  const index = faqs.indexOf(faq);

                  return (
                    <FaqItem
                      key={faq.question}
                      faq={faq}
                      index={index}
                      openIndex={openIndex}
                      setOpenIndex={setOpenIndex}
                    />
                  );
                })}
              </div>

              <div className="space-y-4">
                {rightColumn.map((faq) => {
                  const index = faqs.indexOf(faq);

                  return (
                    <FaqItem
                      key={faq.question}
                      faq={faq}
                      index={index}
                      openIndex={openIndex}
                      setOpenIndex={setOpenIndex}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FaqItem({
  faq,
  index,
  openIndex,
  setOpenIndex,
}: {
  faq: {
    question: string;
    answer: string;
  };
  index: number;
  openIndex: number | null;
  setOpenIndex: (index: number | null) => void;
}) {
  const isOpen = openIndex === index;

  return (
    <div
      className="
        rounded-[18px]
        border
        border-border
        bg-background
        px-5
        py-5
        sm:px-6
      "
    >
      <button
        type="button"
        onClick={() => setOpenIndex(isOpen ? null : index)}
        className="
          flex
          w-full
          items-center
          justify-between
          gap-5
          text-left
        "
        aria-expanded={isOpen}
      >
        <span
          className="
            font-heading
            text-lg
            font-semibold
            tracking-tight
            sm:text-xl
          "
        >
          {faq.question}
        </span>

        <span
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-border
            bg-card
          "
        >
          {isOpen ? (
            <Minus size={16} strokeWidth={1.8} />
          ) : (
            <Plus size={16} strokeWidth={1.8} />
          )}
        </span>
      </button>

      <div
        className={`
          grid
          transition-[grid-template-rows,opacity]
          duration-300
          ease-out
          ${
            isOpen
              ? 'grid-rows-[1fr] opacity-100'
              : 'grid-rows-[0fr] opacity-0'
          }
        `}
      >
        <div className="overflow-hidden">
          <p
            className="
              max-w-xl
              pt-5
              pr-10
              text-sm
              leading-relaxed
              text-muted-foreground
              sm:text-base
            "
          >
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}