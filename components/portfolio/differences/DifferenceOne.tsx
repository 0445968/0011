import { Reveal } from '../Reveal';

export function DifferenceOne() {
  return (
    <section
      className="
        grid
        gap-8
        border-b
        border-white/[.14]
        pb-10
        md:pb-12
        lg:grid-cols-12
        lg:items-center
        lg:gap-12
      "
    >
      {/* Copy */}
      <Reveal className="lg:col-span-5">
        <div className="max-w-lg">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#bbff1b]">
            Strategy first
          </p>

          <h3
            className="
              mt-4
              font-heading
              text-[clamp(1.75rem,3vw,3rem)]
              font-medium
              leading-[0.98]
              tracking-[-0.04em]
              text-[#f8f7f2]
            "
          >
            We design the system,{' '}
            <span className="text-[#FFFFFF]">
              not just the surface.
            </span>
          </h3>

          <p className="mt-5 max-w-md text-sm leading-6 text-white/65 sm:text-base">
            We define the logic behind the brand first, then build every
            touchpoint from the same foundation.
          </p>

          <a
            href="/services"
            className="
              mt-7
              inline-flex
              h-[40px]
              items-center
              justify-center
              rounded-[14px]
              bg-[#1600A2]
              px-4
              text-[14px]
              font-bold
              leading-none
              text-white
              transition-colors
              duration-200
              hover:bg-[#aeea19]
              hover:text-black
            "
          >
            Get started
          </a>
        </div>
      </Reveal>

      {/* Video */}
      <Reveal
        delay={0.1}
        className="lg:col-span-7"
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-[10px]
            bg-white/[0.06]
          "
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="
              block
              h-full
              w-full
              object-cover
            "
          >
            <source
              src="/videos/differences/strategy-first.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </Reveal>
    </section>
  );
}