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
    <section
      className="
        relative
        overflow-hidden
        bg-background
        pt-12
        pb-14
        sm:pt-14
        sm:pb-16
        lg:pt-16
        lg:pb-20
      "
    >
      <div className="container-page">
        {/* Header */}
        <Reveal>
          <div
            className="
              mx-auto
              max-w-4xl
              text-center
            "
          >
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.2em]
                text-primary
              "
            >
              FAQ
            </p>

            <h2
              style={{
                lineHeight: '1.15',
              }}
              className="
                mt-4
                font-heading
                text-3xl
                font-semibold
                tracking-tight
                sm:text-4xl
                md:text-5xl
              "
            >
              Common questions about working with Bivi
            </h2>

            <p
              className="
                mx-auto
                mt-5
                max-w-2xl
                text-base
                leading-7
                text-muted-foreground
                sm:text-lg
                sm:leading-8
              "
            >
              A few useful answers about our services, process, and how we
              work with teams near and far.
            </p>
          </div>
        </Reveal>

        {/* Main panel */}
        <Reveal delay={0.05}>
          <div
            className="
              mt-10
              rounded-[28px]
              bg-muted
              p-6
              sm:mt-12
              sm:p-8
              lg:p-12
            "
          >
            <div
              className="
                grid
                gap-3
                lg:grid-cols-2
                lg:gap-4
              "
            >
              {/* Left column */}
              <div className="space-y-3">
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

              {/* Right column */}
              <div className="space-y-3">
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
        rounded-[16px]
        border
        border-border/60
        bg-background
        px-5
        py-5
        shadow-sm
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
            text-base
            font-semibold
            tracking-tight
            sm:text-lg
          "
        >
          {faq.question}
        </span>

        <span
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-muted
            transition-colors
            duration-200
          "
        >
          {isOpen ? (
            <Minus size={15} strokeWidth={1.8} />
          ) : (
            <Plus size={15} strokeWidth={1.8} />
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
              pt-4
              pr-10
              text-sm
              leading-6
              text-muted-foreground
              sm:text-base
              sm:leading-7
            "
          >
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}