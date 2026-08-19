import { DifferenceOne } from './DifferenceOne';
import { DifferenceTwo } from './DifferenceTwo';

export function Differences() {
  return (
    <section
      id="differences"
      className="
        relative
        overflow-hidden
        text-white
      "
    >
      {/* Background image */}
      <div
        className="
          absolute
          inset-0
          bg-[url('/images/differences/differences-background-4.jpg')]
          bg-cover
          bg-center
          bg-no-repeat
        "
      />

      {/* Blue overlay */}
      <div
        className="
          absolute
          inset-0
          bg-[#1600a2]/50
        "
      />

      {/* Subtle blue background accent */}
      <div
        className="
          pointer-events-none
          absolute
          -right-40
          top-[18%]
          h-[500px]
          w-[500px]
          rounded-full
          bg-[#0b65f3]/20
          blur-[150px]
        "
      />

      {/* Subtle lime accent */}
      <div
        className="
          pointer-events-none
          absolute
          -left-40
          bottom-[15%]
          h-[400px]
          w-[400px]
          rounded-full
          bg-[#bbff1b]/[0.035]
          blur-[140px]
        "
      />

      <div
        className="
          container-page
          relative
          z-10
          py-10
          md:py-12
          lg:py-16
        "
      >
        <DifferenceOne />
        <DifferenceTwo />
      </div>
    </section>
  );
}