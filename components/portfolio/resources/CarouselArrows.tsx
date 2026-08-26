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
          rounded-full
          border
          border-border
          p-3
          transition
          hover:bg-secondary
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
          rounded-full
          border
          border-border
          p-3
          transition
          hover:bg-secondary
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