import { Reveal } from '../Reveal';

export function DifferenceHeader() {
  return (
    <div className="border-b border-white/15 pb-10 md:pb-12">
      <Reveal>
        <div className="max-w-5xl">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#bbff1b]">
            Why work with us
          </p>

          <h2
            className="
              max-w-[900px]
              font-heading
              text-[clamp(3rem,6vw,6.25rem)]
              font-semibold
              leading-[0.9]
              tracking-[-0.06em]
              text-[#f8f7f2]
            "
          >
            Five things we do{' '}
            <span className="text-[#bbff1b]">
              differently.
            </span>
          </h2>

          <p
            className="
              mt-5
              max-w-xl
              text-sm
              leading-6
              text-white/65
              sm:text-base
            "
          >
            Not another services grid. Five principles that shape how we
            approach brands, products, and digital experiences.
          </p>
        </div>
      </Reveal>
    </div>
  );
}