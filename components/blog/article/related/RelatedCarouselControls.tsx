'use client';

import {
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

interface RelatedCarouselControlsProps {
  currentIndex: number;
  total: number;
  canScrollPrevious: boolean;
  canScrollNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function RelatedCarouselControls({
  currentIndex,
  total,
  canScrollPrevious,
  canScrollNext,
  onPrevious,
  onNext,
}: RelatedCarouselControlsProps) {
  const currentLabel = String(
    Math.min(currentIndex + 1, total)
  ).padStart(2, '0');

  const totalLabel = String(total).padStart(
    2,
    '0'
  );

  return (
    <div
      className="
        flex
        shrink-0
        items-center
        gap-4
      "
    >
      {/* Counter */}
      <div
        className="
          min-w-[64px]
          text-right
          font-mono
          text-[11px]
          tabular-nums
          tracking-[0.08em]
          text-muted-foreground
        "
      >
        <span className="text-foreground">
          {currentLabel}
        </span>

        <span className="mx-1.5 text-muted-foreground/50">
          /
        </span>

        <span>{totalLabel}</span>
      </div>

      {/* Arrows */}
      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        <CarouselArrow
          direction="previous"
          disabled={!canScrollPrevious}
          onClick={onPrevious}
        />

        <CarouselArrow
          direction="next"
          disabled={!canScrollNext}
          onClick={onNext}
        />
      </div>
    </div>
  );
}

function CarouselArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: 'previous' | 'next';
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrevious =
    direction === 'previous';

  const label = isPrevious
    ? 'Previous articles'
    : 'Next articles';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
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
        bg-background
        text-foreground
        transition-all
        duration-300
        hover:border-foreground
        hover:bg-foreground
        hover:text-background
        active:scale-95
        disabled:cursor-not-allowed
        disabled:opacity-30
        disabled:hover:border-border
        disabled:hover:bg-background
        disabled:hover:text-foreground
      "
    >
      {isPrevious ? (
        <ArrowLeft
          size={16}
          strokeWidth={1.6}
          className="
            transition-transform
            duration-300
            group-hover:-translate-x-0.5
            group-disabled:translate-x-0
          "
        />
      ) : (
        <ArrowRight
          size={16}
          strokeWidth={1.6}
          className="
            transition-transform
            duration-300
            group-hover:translate-x-0.5
            group-disabled:translate-x-0
          "
        />
      )}
    </button>
  );
}