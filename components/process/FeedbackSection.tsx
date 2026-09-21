import { Reveal } from '@/components/portfolio/Reveal';

const feedbackExamples = [
  {
    bad: 'I don’t like blue.',
    better:
      'The blue feels too established and corporate for the personality we want.',
  },
  {
    bad: 'Make it pop.',
    better:
      'The main message isn’t standing out enough compared with everything around it.',
  },
  {
    bad: 'Can we make the logo bigger?',
    better:
      'The business name feels too easy to miss when I look at the page quickly.',
  },
];

export function FeedbackSection() {
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
                text-muted-foreground
              "
            >
              Giving feedback
            </p>

            <h2
              className="
                mt-4
                max-w-3xl
                text-balance
                font-heading
                text-4xl
                font-semibold
                leading-[1.02]
                tracking-[-0.04em]
                sm:text-5xl
                lg:text-6xl
              "
            >
              Good feedback makes better work.
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
              You don&apos;t need to know design terms.
              The most useful feedback tells us what feels
              unclear, what doesn&apos;t fit the business, or
              what isn&apos;t communicating the right thing.
            </p>
          </div>
        </Reveal>

        {/* Examples */}

        <div
          className="
            mt-12
            grid
            gap-4
            lg:grid-cols-3
          "
        >
          {feedbackExamples.map((example, index) => (
            <Reveal
              key={example.bad}
              delay={0.05 + index * 0.06}
            >
              <article
                className="
                  flex
                  h-full
                  flex-col
                  overflow-hidden
                  rounded-[22px]
                  border
                  border-border/70
                  bg-muted
                "
              >
                {/* Instead of */}

                <div
                  className="
                    border-b
                    border-border
                    p-6
                    sm:p-7
                  "
                >
                  <p
                    className="
                      font-mono
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                      text-muted-foreground
                    "
                  >
                    Instead of
                  </p>

                  <p
                    className="
                      mt-5
                      font-heading
                      text-2xl
                      font-semibold
                      leading-tight
                      tracking-[-0.025em]
                      text-muted-foreground
                    "
                  >
                    “{example.bad}”
                  </p>
                </div>

                {/* Better */}

                <div
                  className="
                    relative
                    flex
                    flex-1
                    flex-col
                    justify-between
                    bg-background
                    p-6
                    sm:p-7
                  "
                >
                  <div>
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <span
                        className="
                          h-2
                          w-2
                          rounded-full
                          bg-[#BBFF1B]
                        "
                      />

                      <p
                        className="
                          font-mono
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[0.16em]
                          text-muted-foreground
                        "
                      >
                        Try this
                      </p>
                    </div>

                    <p
                      className="
                        mt-5
                        font-heading
                        text-xl
                        font-semibold
                        leading-snug
                        tracking-[-0.02em]
                        sm:text-2xl
                      "
                    >
                      “{example.better}”
                    </p>
                  </div>

                  <div
                    className="
                      mt-8
                      h-px
                      w-10
                      bg-[#BBFF1B]
                    "
                  />
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Guidance panel */}

        <Reveal delay={0.18}>
          <div
            className="
              mt-6
              rounded-[28px]
              bg-[#101010]
              p-6
              text-white
              sm:p-8
              lg:p-10
            "
          >
            <div
              className="
                grid
                gap-10
                lg:grid-cols-[0.9fr_1.1fr]
                lg:items-start
              "
            >
              <div>
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
                  A simple rule
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
                  Tell us the problem you&apos;re noticing,
                  not the design solution you think we should use.
                </h3>
              </div>

              <div
                className="
                  grid
                  gap-3
                  sm:grid-cols-2
                "
              >
                {[
                  {
                    title: 'What feels unclear?',
                    description:
                      'Tell us where the message becomes confusing or hard to understand.',
                  },
                  {
                    title: 'What feels wrong?',
                    description:
                      'Explain what seems out of character for your business or customers.',
                  },
                  {
                    title: 'What feels missing?',
                    description:
                      'Point out information, personality, or emphasis you expected to see.',
                  },
                  {
                    title: 'What should matter more?',
                    description:
                      'Tell us what customers should notice or understand first.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="
                      rounded-[16px]
                      border
                      border-white/10
                      bg-white/[0.05]
                      p-5
                    "
                  >
                    <h4
                      className="
                        font-heading
                        text-lg
                        font-semibold
                        tracking-tight
                      "
                    >
                      {item.title}
                    </h4>

                    <p
                      className="
                        mt-3
                        text-sm
                        leading-6
                        text-white/55
                      "
                    >
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}