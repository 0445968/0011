import { Reveal } from '../Reveal';

const steps = [
  {
    number: '01',
    title: 'Direction',
  },
  {
    number: '02',
    title: 'Design',
  },
  {
    number: '03',
    title: 'Refine',
  },
  {
    number: '04',
    title: 'Build',
  },
];

const checks = [
  'Responsive',
  'Accessible',
  'Consistent',
  'Ready',
];

export function DifferenceFour() {
  return (
    <section
      className="
        grid
        gap-8
        border-b
        border-white/15
        py-10
        md:py-12
        lg:grid-cols-12
        lg:items-center
        lg:gap-12
      "
    >
      {/* Visual */}
      <Reveal
        delay={0.08}
        className="order-2 lg:order-1 lg:col-span-7"
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
                Delivery system
              </p>

              <p className="mt-1 font-heading text-xl font-semibold text-white">
                Momentum without shortcuts.
              </p>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#ffd400]" />
              <span className="text-[9px] uppercase tracking-[0.16em] text-white/50">
                Live
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {steps.map((item, index) => (
              <div
                key={item.number}
                className="
                  rounded-xl
                  border
                  border-white/15
                  bg-[#0b65f3]
                  p-3
                "
              >
                <div
                  className={`
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    text-[9px]
                    font-bold
                    ${
                      index === steps.length - 1
                        ? 'bg-[#bbff1b] text-[#1600a2]'
                        : 'border border-white/20 text-white'
                    }
                  `}
                >
                  {item.number}
                </div>

                <p className="mt-5 text-sm font-semibold text-white">
                  {item.title}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-white/15 bg-white/[0.05] p-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">
                  Delivery progress
                </p>

                <p className="mt-1 font-heading text-3xl font-semibold text-white">
                  94
                  <span className="ml-1 text-lg text-[#bbff1b]">
                    %
                  </span>
                </p>
              </div>

              <p className="max-w-[220px] text-right text-xs leading-5 text-white/50">
                Speed comes from clarity, not skipped details.
              </p>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[94%] rounded-full bg-[#bbff1b]" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {checks.map((item, index) => (
              <div
                key={item}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/15
                  bg-[#0b65f3]
                  px-3
                  py-3
                "
              >
                <span
                  className={`
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    text-[9px]
                    font-bold
                    ${
                      index === checks.length - 1
                        ? 'bg-[#ffd400] text-[#1600a2]'
                        : 'bg-[#bbff1b] text-[#1600a2]'
                    }
                  `}
                >
                  ✓
                </span>

                <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/70">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Copy */}
      <Reveal className="order-1 lg:order-2 lg:col-span-5">
        <div className="max-w-lg lg:pl-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#bbff1b]">
            04 · Craft + speed
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
            Fast doesn&apos;t have to{' '}
            <span className="text-[#bbff1b]">
              look rushed.
            </span>
          </h3>

          <p className="mt-5 max-w-md text-sm leading-6 text-white/65 sm:text-base">
            A focused process keeps decisions moving while protecting the
            details that make the final work feel considered and complete.
          </p>
        </div>
      </Reveal>
    </section>
  );
}