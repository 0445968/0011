'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

import { Reveal } from '@/components/portfolio/Reveal';

const reasons = [
  {
    icon: '/images/about/strategy.png',
    title: 'Strategy with direction',
    description:
      'We define what your brand needs to communicate before shaping how it looks.',
  },
  {
    icon: '/images/about/ideas.png',
    title: 'Ideas with character',
    description:
      'We build visual concepts with enough personality to feel distinct and memorable.',
  },
  {
    icon: '/images/about/cohesive.png',
    title: 'Design that feels cohesive',
    description:
      'From identity to campaigns, every touchpoint is designed to feel connected.',
  },
  {
    icon: '/images/about/growth.png',
    title: 'Systems built to grow',
    description:
      'We create flexible brand systems that can evolve with you as your business does.',
  },
];

export function AboutWhyUs() {
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
            <h2
              style={{
                lineHeight: '1.15',
              }}
              className="
                font-heading
                text-3xl
                font-semibold
                tracking-tight
                sm:text-4xl
                md:text-5xl
              "
            >
              Thoughtful design for brands that want to move forward
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
              We combine strategy, creative direction, and graphic design
              to help brands communicate more clearly and show up with
              confidence.
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
                gap-10
                lg:grid-cols-[0.8fr_1.2fr]
                lg:items-start
                lg:gap-16
              "
            >
              {/* Left content */}
              <div>
                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-primary
                  "
                >
                  Why Bivi
                </p>

                <h3
                  style={{
                    lineHeight: '1.1',
                  }}
                  className="
                    mt-4
                    max-w-xl
                    font-heading
                    text-2xl
                    font-semibold
                    tracking-tight
                    sm:text-3xl
                    lg:text-4xl
                  "
                >
                  Clear thinking.
                  <br />
                  Strong ideas.
                  <br />
                  Better design.
                </h3>

                <p
                  className="
                    mt-5
                    max-w-lg
                    text-base
                    leading-7
                    text-muted-foreground
                    sm:text-lg
                    sm:leading-8
                  "
                >
                  We bring strategy and design together so every decision
                  has a reason behind it and every part of your brand works
                  toward the same goal.
                </p>

                <a
                  href="/contact"
                  className="
                    mt-8
                    inline-flex
                    w-fit
                    items-center
                    justify-center
                    gap-2
                    rounded-[12px]
                    bg-black
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    transition-colors
                    hover:bg-[#333333]
                    dark:bg-white
                    dark:text-black
                    dark:hover:bg-white/85
                  "
                >
                  Start a project

                  <ArrowUpRight
                    size={16}
                    className="shrink-0"
                  />
                </a>
              </div>

              {/* Reasons */}
              <div
                className="
                  flex
                  flex-col
                  gap-3
                "
              >
                {reasons.map((item, index) => (
                  <Reveal
                    key={item.title}
                    delay={0.08 + index * 0.05}
                  >
                    <article
                      className="
                        flex
                        min-h-[104px]
                        items-center
                        gap-5
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
                      {/* Custom uploaded icon */}
                      <div
                        className="
                          flex
                          h-12
                          w-12
                          shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-[12px]
                        "
                      >
                        <Image
                          src={item.icon}
                          alt=""
                          width={48}
                          height={48}
                          className="
                            h-11
                            w-11
                            object-contain
                          "
                        />
                      </div>

                      <div className="min-w-0">
                        <h4
                          className="
                            font-heading
                            text-base
                            font-semibold
                            tracking-tight
                            sm:text-lg
                          "
                        >
                          {item.title}
                        </h4>

                        <p
                          className="
                            mt-1.5
                            max-w-xl
                            text-sm
                            leading-6
                            text-muted-foreground
                          "
                        >
                          {item.description}
                        </p>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}