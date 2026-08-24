'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { Reveal } from '@/components/portfolio/Reveal';

const faqs = [
  {
    question: 'What does Bivi specialize in?',
    answer:
      'Bivi focuses on graphic design and brand strategy, including visual identity, logo design, campaign creative, print design, social media design, and supporting brand systems.',
  },
  {
    question: 'Do you only work with businesses in Houston?',
    answer:
      'No. Bivi is based in Houston, Texas, but we work with businesses and teams remotely as well. Most projects can be handled collaboratively regardless of location.',
  },
  {
    question: 'Can Bivi work with an existing brand?',
    answer:
      'Yes. Not every project needs a complete rebrand. We can refine, extend, or strengthen an existing visual identity while preserving the parts that are already working.',
  },
  {
    question: 'What does a typical project process look like?',
    answer:
      'Most projects move through discovery, strategy, concept development, design, refinement, and final delivery. The exact process can shift depending on the scope and needs of the project.',
  },
];

function AboutFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-spacing relative">
      <div className="container-page">
        <div className="border-t border-border pt-10 sm:pt-12 lg:pt-16">
          {/* ------------------------------------------------------------ */}
          {/* Heading                                                      */}
          {/* ------------------------------------------------------------ */}

          <Reveal>
            <div
              className="
                flex
                items-center
                gap-3
                text-xs
                font-semibold
                uppercase
                tracking-[0.18em]
                text-muted-foreground
              "
            >
              <span className="h-px w-8 bg-secondary" />
              FAQ
            </div>
          </Reveal>

          <div
            className="
              mt-10
              grid
              gap-10
              lg:grid-cols-12
              lg:gap-16
            "
          >
            <Reveal
              delay={0.06}
              className="lg:col-span-5"
            >
              <h2
                className="
                  max-w-xl
                  text-balance
                  font-heading
                  text-4xl
                  font-semibold
                  leading-[0.98]
                  tracking-[-0.04em]
                  sm:text-5xl
                  md:text-6xl
                "
              >
                A few things you might be wondering.
              </h2>
            </Reveal>

            {/* ---------------------------------------------------------- */}
            {/* Accordion                                                  */}
            {/* ---------------------------------------------------------- */}

            <Reveal
              delay={0.12}
              className="lg:col-span-7"
            >
              <div className="border-t border-border">
                {faqs.map((faq, index) => {
                  const isOpen = openIndex === index;

                  return (
                    <div
                      key={faq.question}
                      className="border-b border-border"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenIndex(isOpen ? null : index)
                        }
                        className="
                          flex
                          w-full
                          items-center
                          justify-between
                          gap-6
                          py-6
                          text-left
                          sm:py-7
                        "
                        aria-expanded={isOpen}
                      >
                        <span
                          className="
                            font-heading
                            text-xl
                            font-semibold
                            leading-tight
                            tracking-tight
                            sm:text-2xl
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
                            rounded-full
                            border
                            border-border
                            bg-card
                          "
                        >
                          <ChevronDown
                            size={17}
                            strokeWidth={1.8}
                            className={`
                              transition-transform
                              duration-200
                              ${
                                isOpen
                                  ? 'rotate-180'
                                  : 'rotate-0'
                              }
                            `}
                          />
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
                              max-w-2xl
                              pb-7
                              pr-12
                              text-base
                              leading-relaxed
                              text-muted-foreground
                              sm:text-lg
                            "
                          >
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export { AboutFaq };