'use client';

import { ArrowUpRight } from 'lucide-react';

const newsletterOptions = [
  {
    title: 'Studio Notes',
    description:
      'Design, process, and observations from inside the studio.',
  },
  {
    title: 'Business Brief',
    description:
      'Practical thinking for building clearer, stronger businesses.',
  },
  {
    title: 'Brand Signals',
    description:
      'Ideas on positioning, identity, strategy, and differentiation.',
  },
  {
    title: 'Digital Culture',
    description:
      'Technology, creativity, and the changing digital landscape.',
  },
];

export function JournalNewsletter() {
  return (
    <section
      className="
        relative
        left-1/2
        mt-28
        w-screen
        -translate-x-1/2
        border-t
        border-border
        bg-secondary/35
        py-20
        md:mt-36
        md:py-24
      "
    >
      <div className="container-page">
        {/* Heading */}
        <div
          className="
            mx-auto
            max-w-2xl
            text-center
          "
        >
          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-accent
            "
          >
            Stay in the loop
          </p>

          <h2
            className="
              mt-3
              text-balance
              font-serif
              text-4xl
              font-medium
              leading-[1.05]
              tracking-[-0.04em]
              sm:text-5xl
              md:text-6xl
            "
          >
            Ideas worth keeping.
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-xl
              text-sm
              leading-6
              text-muted-foreground
              sm:text-base
            "
          >
            Choose the topics you&apos;re interested in and
            stay connected to new essays, observations,
            and studio thinking.
          </p>
        </div>

        {/* Newsletter options */}
        <div
          className="
            mx-auto
            mt-12
            grid
            max-w-5xl
            gap-4
            md:grid-cols-2
          "
        >
          {newsletterOptions.map((option) => (
            <button
              key={option.title}
              type="button"
              className="
                group
                flex
                min-h-[150px]
                items-start
                justify-between
                gap-8
                rounded-2xl
                border
                border-border
                bg-background
                p-6
                text-left
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-foreground/20
                sm:p-7
              "
            >
              <div>
                <h3
                  className="
                    font-serif
                    text-xl
                    font-semibold
                    tracking-[-0.02em]
                    sm:text-2xl
                  "
                >
                  {option.title}
                </h3>

                <p
                  className="
                    mt-3
                    max-w-sm
                    text-sm
                    leading-6
                    text-muted-foreground
                  "
                >
                  {option.description}
                </p>
              </div>

              <span
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
                  transition-all
                  duration-300
                  group-hover:border-foreground
                  group-hover:bg-foreground
                  group-hover:text-background
                "
              >
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.6}
                  className="
                    transition-transform
                    duration-300
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                  "
                />
              </span>
            </button>
          ))}
        </div>

        {/* Bottom note */}
        <div
          className="
            mx-auto
            mt-10
            flex
            max-w-5xl
            flex-col
            gap-3
            border-t
            border-border
            pt-5
            text-xs
            text-muted-foreground
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p>
            Occasional updates. No noise.
          </p>

          <p>
            Unsubscribe whenever you like.
          </p>
        </div>
      </div>
    </section>
  );
}