import { Reveal } from '../Reveal';

const growthItems = [
  {
    number: '02',
    title: 'Components',
    detail: 'Reusable pieces',
  },
  {
    number: '03',
    title: 'Content',
    detail: 'Easy to extend',
  },
  {
    number: '04',
    title: 'Campaigns',
    detail: 'Built to adapt',
  },
  {
    number: '05',
    title: 'Growth',
    detail: 'Ready for more',
  },
];

export function DifferenceFive() {
  return (
    <section
      className="
        grid
        gap-8
        py-10
        md:py-12
        lg:grid-cols-12
        lg:items-center
        lg:gap-12
      "
    >
      {/* Copy */}
      <Reveal className="lg:col-span-5">
        <div className="max-w-lg">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#bbff1b]">
            05 · Built to last
          </p>

          <h3
            className="
              mt-4
              font-heading
              text-[clamp(2.25rem,4vw,4rem)]
              font-semibold
              leading-[0.94]
              tracking-[-0.05em]
              text-[#f8f7f2]
            "
          >
            Made to keep working{' '}
            <span className="text-[#bbff1b]">
              after launch.
            </span>
          </h3>

          <p className="mt-5 max-w-md text-sm leading-6 text-white/65 sm:text-base">
            We build flexible foundations your team can keep using and
            extending as new ideas, products, and campaigns appear.
          </p>
        </div>
      </Reveal>

      {/* Visual */}
      <Reveal
        delay={0.1}
        className="lg:col-span-7"
      >
        <div
          className="
            overflow-hidden
            rounded-[22px]
            border
            border-white/15
            bg-white/[0.06]
            p-4
            sm:p-5
          "
        >
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/45">
                System growth
              </p>

              <p className="mt-1 font-heading text-xl font-semibold text-white">
                Designed for what comes next.
              </p>
            </div>

            <span
              className="
                hidden
                rounded-full
                border
                border-[#bbff1b]/50
                px-3
                py-1.5
                text-[9px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-[#bbff1b]
                sm:block
              "
            >
              Scalable
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[0.8fr_1.2fr]">
            {/* Main foundation */}
            <div
              className="
                flex
                min-h-[190px]
                flex-col
                justify-between
                rounded-xl
                bg-[#0b65f3]
                p-4
              "
            >
              <div>
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-[#bbff1b]
                    text-[10px]
                    font-bold
                    text-[#1600a2]
                  "
                >
                  01
                </div>

                <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  Foundation
                </p>

                <p className="mt-1 max-w-[210px] font-heading text-xl font-semibold leading-tight text-white">
                  One strong system at the center.
                </p>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ffd400]" />
                <span className="h-px flex-1 bg-white/20" />
              </div>
            </div>

            {/* Expansion */}
            <div className="grid grid-cols-2 gap-2">
              {growthItems.map((item, index) => (
                <div
                  key={item.title}
                  className={`
                    rounded-xl
                    border
                    p-3
                    ${
                      index === growthItems.length - 1
                        ? 'border-[#bbff1b] bg-[#bbff1b] text-[#1600a2]'
                        : 'border-white/15 bg-[#0b65f3] text-white'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`
                        text-[9px]
                        font-semibold
                        ${
                          index === growthItems.length - 1
                            ? 'text-[#1600a2]/60'
                            : 'text-white/40'
                        }
                      `}
                    >
                      {item.number}
                    </span>

                    {index === 2 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ffd400]" />
                    )}
                  </div>

                  <p className="mt-5 font-heading text-base font-semibold">
                    {item.title}
                  </p>

                  <p
                    className={`
                      mt-1
                      text-xs
                      ${
                        index === growthItems.length - 1
                          ? 'text-[#1600a2]/65'
                          : 'text-white/50'
                      }
                    `}
                  >
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">
                  Long-term value
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  Launch is the start, not the finish.
                </p>
              </div>

              <div className="text-right">
                <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">
                  Growth ready
                </p>

                <p className="mt-1 font-heading text-xl font-semibold text-[#bbff1b]">
                  Always
                </p>
              </div>
            </div>

            {/* Mini growth chart */}
            <div className="mt-4 flex h-10 items-end gap-2">
              <div className="h-[25%] flex-1 rounded-t bg-white/15" />
              <div className="h-[40%] flex-1 rounded-t bg-white/20" />
              <div className="h-[58%] flex-1 rounded-t bg-[#0b65f3]" />
              <div className="h-[76%] flex-1 rounded-t bg-[#0b65f3]" />
              <div className="h-full flex-1 rounded-t bg-[#bbff1b]" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}