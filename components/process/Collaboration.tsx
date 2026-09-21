import Image from 'next/image';

import { Reveal } from '@/components/portfolio/Reveal';

const collaborationItems = [
  {
    title: 'Work together',
    description:
      'You know your business better than anyone. We bring an outside perspective, allowing the strongest work to happen when both sides contribute.',
    image: '/images/process/collaboration-01.jpg',
  },
  {
    title: 'See the thinking',
    description:
      'We explain our recommendations instead of just showing you something and asking whether you like it, keeping the project grounded.',
    image: '/images/process/collaboration-02.jpg',
  },
  {
    title: 'Keep things moving',
    description:
      'We keep the feedback purposeful and the steps visible, so the project runs without becoming overwhelming or unnecessarily drawn out.',
    image: '/images/process/collaboration-03.jpg',
  },
];

export function Collaboration() {
  return (
    <section
      className="
        relative
        py-16
        sm:py-20
        lg:py-24
      "
    >
      <div className="container-page">
        {/* Intro */}

        <Reveal>
          <div className="max-w-3xl">
            <p
              className="
                font-mono
                text-xs
                font-semibold
                uppercase
                tracking-[0.2em]
                text-primary
              "
            >
              Working together
            </p>

            <h2
              style={{
                lineHeight: '1.15',
              }}
              className="
                mx-auto
                mt-4
                max-w-5xl
                font-heading
                text-3xl
                font-semibold
                tracking-tight
                sm:text-4xl
                md:text-5xl
              "
            >
              You won&apos;t disappear into a black box
            </h2>

            <p
              className="
                mt-6
                max-w-2xl
                text-base
                leading-relaxed
                text-muted-foreground
                sm:text-lg
              "
            >
              A brand project should feel collaborative without
              becoming complicated. We keep you involved in the
              decisions that matter while handling the process,
              research, strategy, and creative work behind them.
            </p>
          </div>
        </Reveal>

        {/* Main cards */}

        <div
          className="
            mt-12
            grid
            gap-4
            lg:grid-cols-3
          "
        >
          {collaborationItems.map((item, index) => (
            <Reveal
              key={item.title}
              delay={0.05 + index * 0.06}
            >
              <article
                className="
                  group
                  relative
                  min-h-[460px]
                  overflow-hidden
                  rounded-[22px]
                  bg-black
                  sm:min-h-[500px]
                  lg:min-h-[560px]
                "
              >
                {/* Background image */}

                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="
                    (max-width: 1024px) 100vw,
                    33vw
                  "
                  className="
                    object-cover
                  "
                />

                {/* Full dark overlay */}

                <div
                  aria-hidden="true"
                  className="
                    absolute
                    inset-0
                    bg-black/30
                  "
                />

                {/* Bottom fade */}

                <div
                  aria-hidden="true"
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-b
                    from-black/5
                    via-black/15
                    to-black
                  "
                />

                {/* Extra bottom depth */}

                <div
                  aria-hidden="true"
                  className="
                    absolute
                    inset-x-0
                    bottom-0
                    h-[60%]
                    bg-gradient-to-b
                    from-transparent
                    via-black/55
                    to-black
                  "
                />

                {/* Content */}

                <div
                  className="
                    absolute
                    inset-x-0
                    bottom-0
                    z-10
                    p-6
                    sm:p-7
                    lg:p-8
                  "
                >
                  <h3
                    className="
                      max-w-sm
                      font-heading
                      text-2xl
                      font-semibold
                      leading-tight
                      tracking-[-0.025em]
                      text-white
                      sm:text-2xl
                    "
                  >
                    {item.title}
                  </h3>

                  <p
                    className="
                      mt-4
                      max-w-sm
                      text-sm
                      leading-6
                      text-white/70
                    "
                  >
                    {item.description}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Expectations panel */}

        <Reveal delay={0.15}>
          <div
            className="
              mt-6
              overflow-hidden
              rounded-[28px]
              bg-[#101010]
              text-white
            "
          >
            <div
              className="
                grid
                lg:grid-cols-[0.9fr_1.1fr]
              "
            >
              {/* Left */}

              <div
                className="
                  relative
                  overflow-hidden
                  p-6
                  sm:p-8
                  lg:p-10
                "
              >
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    -left-20
                    -top-20
                    h-64
                    w-64
                    rounded-full
                    bg-[#1D45FF]/20
                    blur-3xl
                  "
                />

                <div className="relative z-10">
                  <p
                    className="
                      font-mono
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-white/40
                    "
                  >
                    What we need from you
                  </p>

                  <h3
                    className="
                      mt-4
                      max-w-lg
                      font-heading
                      text-3xl
                      font-semibold
                      leading-tight
                      tracking-[-0.03em]
                      sm:text-4xl
                    "
                  >
                    Your knowledge. Your perspective. Your decisions.
                  </h3>

                  <p
                    className="
                      mt-5
                      max-w-xl
                      text-sm
                      leading-7
                      text-white/60
                      sm:text-base
                    "
                  >
                    You don&apos;t need to know design language or
                    arrive with the answers. You just need to be open
                    about the business, share what you know, and help
                    us understand what feels right or wrong as the
                    work develops.
                  </p>
                </div>
              </div>

              {/* Right */}

              <div
                className="
                  border-t
                  border-white/10
                  p-6
                  sm:p-8
                  lg:border-l
                  lg:border-t-0
                  lg:p-10
                "
              >
                <p
                  className="
                    font-mono
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-white/40
                  "
                >
                  What you can expect from us
                </p>

                <div
                  className="
                    mt-6
                    grid
                    gap-3
                    sm:grid-cols-2
                  "
                >
                  {[
                    'Clear next steps',
                    'Straightforward communication',
                    'Reasoned recommendations',
                    'Focused feedback rounds',
                    'Organized files and handoff',
                    'No unnecessary complexity',
                  ].map((item) => (
                    <div
                      key={item}
                      className="
                        flex
                        items-start
                        gap-3
                        rounded-[14px]
                        border
                        border-white/10
                        bg-white/[0.05]
                        p-4
                      "
                    >
                      <span
                        aria-hidden="true"
                        className="
                          mt-[6px]
                          h-1.5
                          w-1.5
                          shrink-0
                          rounded-full
                          bg-[#BBFF1B]
                        "
                      />

                      <span
                        className="
                          text-sm
                          font-medium
                          leading-5
                          text-white/75
                        "
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}