'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselArrowsProps {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function CarouselArrows({
  canScrollLeft,
  canScrollRight,
  onPrevious,
  onNext,
}: CarouselArrowsProps) {
  const buttonClass = `
    flex h-11 w-11 items-center justify-center
    rounded-full
    border border-border
    bg-background/90
    backdrop-blur
    transition-all
    duration-300
    hover:border-primary/40
    hover:bg-card
    disabled:pointer-events-none
    disabled:opacity-35
  `;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Previous resources"
        onClick={onPrevious}
        disabled={!canScrollLeft}
        className={buttonClass}
      >
        <ChevronLeft size={18} />
      </button>

      <button
        type="button"
        aria-label="Next resources"
        onClick={onNext}
        disabled={!canScrollRight}
        className={buttonClass}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}