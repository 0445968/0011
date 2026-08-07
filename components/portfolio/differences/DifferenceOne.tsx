import { Reveal } from '../Reveal';

const systemItems = [
  {
    label: 'Positioning',
    value: 'Clear direction',
  },
  {
    label: 'Identity',
    value: 'Recognizable',
  },
  {
    label: 'Digital',
    value: 'Consistent',
  },
  {
    label: 'Growth',
    value: 'Built to scale',
  },
];

export function DifferenceOne() {
  return (
    <section
      className="
        grid
        gap-8
        border-b
        border-white/10
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
            01 · Strategy first
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
            We design the system,{' '}
            <span className="text-[#bbff1b]">
              not just the surface.
            </span>
          </h3>

          <p className="mt-5 max-w-md text-sm leading-6 text-white/65 sm:text-base">
            We define the logic behind the brand first, then build every
            touchpoint from the same foundation.
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
          <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-4">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/45">
                Brand architecture
              </p>

              <p className="mt-1 font-heading text-xl font-semibold text-white">
                One idea. Every touchpoint.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#ffd400]" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/60">
                Connected
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {systemItems.map((item, index) => (
              <div
                key={item.label}
                className="
                  rounded-xl
                  border
                  border-white/15
                  bg-[#0b65f3]
                  p-4
                  transition-colors
                  duration-300
                  hover:bg-[#126df6]
                "
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold tracking-[0.18em] text-[#bbff1b]">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className="h-1.5 w-1.5 rounded-full bg-[#ffd400]" />
                </div>

                <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55">
                  {item.label}
                </p>

                <p className="mt-1 font-heading text-lg font-semibold text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div
            className="
              mt-3
              flex
              items-center
              justify-between
              gap-4
              rounded-xl
              border
              border-white/15
              bg-white/[0.05]
              px-4
              py-3
            "
          >
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">
                Starting point
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                Strategy
              </p>
            </div>

            <div className="flex flex-1 items-center gap-2">
              <span className="h-px flex-1 bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-[#0b65f3]" />
              <span className="h-2 w-2 rounded-full bg-[#bbff1b]" />
              <span className="h-2 w-2 rounded-full bg-[#ffd400]" />
              <span className="h-px flex-1 bg-white/15" />
            </div>

            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">
                Result
              </p>

              <p className="mt-1 text-sm font-semibold text-[#bbff1b]">
                Consistency
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}