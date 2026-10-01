'use client';

import Image from 'next/image';

import { Reveal } from '@/components/portfolio/Reveal';

const POINT_ICON = '/images/about/point-icon.png';

const reasons = [
  {
    title: 'Strategy with direction',
    description: 'Clear thinking behind every creative decision.',
  },
  {
    title: 'Ideas with character',
    description: 'Distinctive work designed to be remembered.',
  },
  {
    title: 'Systems built to grow',
    description: 'Flexible design that evolves with your business.',
  },
];

export function AboutWhyUs() {
  return (
    <section
      className="
        bg-background
        py-14
        sm:py-16
        lg:py-20
      "
    >
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-4xl text-center">
            <h2
              className="
                font-heading
                text-3xl
                font-semibold
                leading-[1.08]
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
                max-w-xl
                text-base
                leading-7
                text-muted-foreground
                sm:text-lg
              "
            >
              Strategy and design working together to make your business
              clearer, stronger, and easier to recognize.
            </p>
          </div>
        </Reveal>

        <div
          className="
            mx-auto
            mt-12
            max-w-3xl
            sm:mt-14
            lg:mt-16
          "
        >
          <Reveal delay={0.05}>
            <h3
              className="
                max-w-2xl
                font-heading
                text-2xl
                font-semibold
                leading-[1.12]
                tracking-tight
                sm:text-3xl
                md:text-4xl
              "
            >
              Why work with Bivi?
            </h3>
          </Reveal>

          <div
            className="
              mt-8
              flex
              flex-col
              gap-7
              sm:mt-10
              sm:gap-8
            "
          >
            {reasons.map((item, index) => (
              <Reveal
                key={item.title}
                delay={0.08 + index * 0.05}
              >
                <div
                  className="
                    flex
                    items-start
                    gap-4
                    sm:gap-5
                  "
                >
                  <div
                    className="
                      mt-0.5
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                    "
                  >
                    <Image
                      src={POINT_ICON}
                      alt=""
                      width={32}
                      height={32}
                      className="
                        h-8
                        w-8
                        object-contain
                      "
                    />
                  </div>

                  <div className="min-w-0">
                    <h4
                      className="
                        font-heading
                        text-lg
                        font-semibold
                        leading-tight
                        tracking-tight
                        sm:text-xl
                      "
                    >
                      {item.title}
                    </h4>

                    <p
                      className="
                        mt-1
                        text-base
                        leading-7
                        text-muted-foreground
                        sm:text-lg
                      "
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}