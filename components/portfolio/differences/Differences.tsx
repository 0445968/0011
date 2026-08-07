import { DifferenceHeader } from './DifferenceHeader';
import { DifferenceOne } from './DifferenceOne';
import { DifferenceTwo } from './DifferenceTwo';
import { DifferenceThree } from './DifferenceThree';
import { DifferenceFour } from './DifferenceFour';
import { DifferenceFive } from './DifferenceFive';

export function Differences() {
  return (
    <section
      id="differences"
      className="
        relative
        overflow-hidden
        bg-[#1600a2]
        text-white
      "
    >
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
          py-16
          md:py-20
          lg:py-24
        "
      >
        <DifferenceHeader />

        <DifferenceOne />

        <DifferenceTwo />

        <DifferenceThree />

        <DifferenceFour />

        <DifferenceFive />
      </div>
    </section>
  );
}