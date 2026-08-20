'use client';

import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface CarouselArrowsProps {
  onPrevious: () => void;
  onNext: () => void;
  canScrollPrevious: boolean;
  canScrollNext: boolean;
}

export function CarouselArrows({
  onPrevious,
  onNext,
  canScrollPrevious,
  canScrollNext,
}: CarouselArrowsProps) {
  return (
    <div
      className="
        flex
        items-center
        justify-center
        gap-2
      "
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canScrollPrevious}
        aria-label="Previous resources"
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          border
          border-[#0B65F3]
          bg-[#0B65F3]
          text-white
          transition-all
          duration-300
          hover:scale-[1.04]
          hover:bg-[#095BE0]
          disabled:pointer-events-none
          disabled:opacity-30
        "
      >
        <ChevronLeft
          size={18}
          strokeWidth={2}
        />
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canScrollNext}
        aria-label="Next resources"
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          border
          border-[#0B65F3]
          bg-[#0B65F3]
          text-white
          transition-all
          duration-300
          hover:scale-[1.04]
          hover:bg-[#095BE0]
          disabled:pointer-events-none
          disabled:opacity-30
        "
      >
        <ChevronRight
          size={18}
          strokeWidth={2}
        />
      </button>
    </div>
  );
}