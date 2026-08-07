import { Reveal } from '../Reveal';

const scopeItems = [
  {
    label: 'Strategy',
    status: 'Core',
  },
  {
    label: 'Identity',
    status: 'Core',
  },
  {
    label: 'Website',
    status: 'Optional',
  },
  {
    label: 'Development',
    status: 'Optional',
  },
  {
    label: 'Campaigns',
    status: 'Flexible',
  },
  {
    label: 'Support',
    status: 'Flexible',
  },
];

export function DifferenceThree() {
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
      {/* Copy */}
      <Reveal className="lg:col-span-5">
        <div className="max-w-lg">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#bbff1b]">
            03 · Flexible by design
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
            Built around what the project{' '}
            <span className="text-[#bbff1b]">
              actually needs.
            </span>
          </h3>

          <p className="mt-5 max-w-md text-sm leading-6 text-white/65 sm:text-base">
            No inflated packages. We shape the engagement around the work and
            adjust it as priorities evolve.
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
          <div className="flex items-end justify-between gap-4 border-b border-white/15 pb-4">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/45">
                Project configuration
              </p>

              <p className="mt-1 font-heading text-xl font-semibold text-white">
                Scope without the filler.
              </p>
            </div>

            <span className="h-2 w-2 rounded-full bg-[#ffd400]" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {scopeItems.map((item, index) => (
              <div
                key={item.label}
                className="
                  rounded-xl
                  border
                  border-white/15
                  bg-[#0b65f3]
                  p-3
                "
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-semibold text-white/40">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span
                    className="
                      rounded-full
                      bg-[#bbff1b]
                      px-2
                      py-0.5
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.1em]
                      text-[#1600a2]
                    "
                  >
                    {item.status}
                  </span>
                </div>

                <p className="mt-5 font-heading text-base font-semibold text-white">
                  {item.label}
                </p>

                <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-[#bbff1b]"
                    style={{
                      width: `${90 - index * 8}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-end justify-between gap-4 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">
                Project philosophy
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                Only what moves the work forward.
              </p>
            </div>

            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">
                Bloat
              </p>

              <p className="mt-1 font-heading text-2xl font-semibold text-[#bbff1b]">
                0%
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}