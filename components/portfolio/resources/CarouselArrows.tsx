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
        gap-3
      "
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canScrollPrevious}
        aria-label="Previous resources"
        className="
          group
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          border
          border-border
          bg-card
          transition-all
          duration-300

          hover:-translate-x-0.5
          hover:border-primary/40

          disabled:pointer-events-none
          disabled:opacity-30
        "
      >
        <ChevronLeft
          size={18}
          className="
            transition-transform
            duration-300
            group-hover:-translate-x-0.5
          "
        />
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canScrollNext}
        aria-label="Next resources"
        className="
          group
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          border
          border-border
          bg-card
          transition-all
          duration-300

          hover:translate-x-0.5
          hover:border-primary/40

          disabled:pointer-events-none
          disabled:opacity-30
        "
      >
        <ChevronRight
          size={18}
          className="
            transition-transform
            duration-300
            group-hover:translate-x-0.5
          "
        />
      </button>
    </div>
  );
}