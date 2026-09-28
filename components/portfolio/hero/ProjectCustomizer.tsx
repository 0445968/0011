'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Check,
} from 'lucide-react';

interface ProjectOption {
  id: string;
  label: string;
}

interface ProjectCustomizerProps {
  options: ProjectOption[];
  selectedOptions: string[];
  onToggle: (id: string) => void;
}

export function ProjectCustomizer({
  options,
  selectedOptions,
  onToggle,
}: ProjectCustomizerProps) {
  const mobileScrollerRef =
    useRef<HTMLDivElement>(null);

  const [
    isIntroAnimating,
    setIsIntroAnimating,
  ] = useState(true);

  const mobileRows: ProjectOption[][] = [];

  for (
    let index = 0;
    index < options.length;
    index += 2
  ) {
    mobileRows.push(
      options.slice(index, index + 2)
    );
  }

  useEffect(() => {
    const scroller =
      mobileScrollerRef.current;

    if (!scroller) {
      return;
    }

    const isMobile =
      window.matchMedia(
        '(max-width: 639px)'
      ).matches;

    const prefersReducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    if (
      !isMobile ||
      prefersReducedMotion
    ) {
      setIsIntroAnimating(false);
      return;
    }

    let frameId = 0;
    let cancelled = false;
    let startTimer = 0;

    const animateScroll = (
      from: number,
      to: number,
      duration: number
    ) =>
      new Promise<void>(
        (resolve) => {
          const startTime =
            performance.now();

          const step = (
            currentTime: number
          ) => {
            if (cancelled) {
              resolve();
              return;
            }

            const progress =
              Math.min(
                (currentTime -
                  startTime) /
                  duration,
                1
              );

            const eased =
              0.5 -
              Math.cos(
                Math.PI *
                  progress
              ) /
                2;

            scroller.scrollTop =
              from +
              (to - from) *
                eased;

            if (progress < 1) {
              frameId =
                requestAnimationFrame(
                  step
                );
            } else {
              resolve();
            }
          };

          frameId =
            requestAnimationFrame(
              step
            );
        }
      );

    const runIntro =
      async () => {
        const maxScroll =
          scroller.scrollHeight -
          scroller.clientHeight;

        await animateScroll(
          0,
          maxScroll,
          4500
        );

        if (cancelled) {
          return;
        }

        await animateScroll(
          maxScroll,
          0,
          850
        );

        if (!cancelled) {
          setIsIntroAnimating(
            false
          );
        }
      };

    startTimer =
      window.setTimeout(() => {
        runIntro();
      }, 700);

    return () => {
      cancelled = true;

      window.clearTimeout(
        startTimer
      );

      cancelAnimationFrame(
        frameId
      );
    };
  }, []);

  const renderOption = (
    option: ProjectOption
  ) => {
    const isSelected =
      selectedOptions.includes(
        option.id
      );

    return (
      <button
        key={option.id}
        type="button"
        aria-pressed={isSelected}
        onClick={() =>
          onToggle(option.id)
        }
        className={`
          relative
          inline-flex
          h-[42px]
          min-w-0
          items-center
          justify-center
          rounded-full
          border
          px-3
          text-center
          text-[12px]
          font-medium
          leading-none
          transition-all
          duration-200
          active:scale-[0.98]
          sm:px-4
          sm:text-[13px]

          ${
            isSelected
              ? `
                border-white
                bg-white/20
                text-white
              `
              : `
                border-dashed
                border-white/30
                bg-white/[0.035]
                text-white/70
                hover:border-white/55
                hover:bg-white/[0.07]
                hover:text-white
              `
          }
        `}
      >
        <span
          className="
            truncate
            sm:overflow-visible
            sm:whitespace-normal
          "
        >
          {option.label}
        </span>

        {isSelected && (
          <span
            className="
              absolute
              -right-[5px]
              -top-[6px]
              flex
              h-[20px]
              w-[20px]
              items-center
              justify-center
              rounded-full
              border-2
              border-white
              bg-black
              text-white
            "
          >
            <Check
              size={12}
              strokeWidth={3}
            />
          </span>
        )}
      </button>
    );
  };

  return (
    <div
      className="
        mt-8
        flex
        w-full
        max-w-4xl
        flex-col
        items-center
      "
    >
      {/* Label */}

      <p
        className="
          mb-4
          font-mono
          text-[10px]
          font-medium
          uppercase
          tracking-[0.22em]
          text-white
          sm:text-[11px]
        "
      >
        Customize your project
      </p>

      {/* ============================================================ */}
      {/* Mobile                                                       */}
      {/* ============================================================ */}

      <div
        className="
          relative
          w-full
          max-w-[390px]
          sm:hidden
        "
      >
        <div
          ref={mobileScrollerRef}
          className={`
            project-customizer-scroll
            h-[96px]
            overflow-y-auto
            overscroll-contain
            px-1

            ${
              isIntroAnimating
                ? ''
                : `
                  snap-y
                  snap-mandatory
                  scroll-smooth
                `
            }
          `}
        >
          <div
            className="
              flex
              flex-col
              gap-3
            "
          >
            {mobileRows.map(
              (
                row,
                rowIndex
              ) => (
                <div
                  key={rowIndex}
                  className={`
                    grid
                    h-[42px]
                    shrink-0
                    grid-cols-2
                    gap-3

                    ${
                      isIntroAnimating
                        ? ''
                        : 'snap-start'
                    }
                  `}
                >
                  {row.map(
                    renderOption
                  )}

                  {row.length ===
                    1 && (
                    <div
                      aria-hidden="true"
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Tablet / Desktop                                             */}
      {/* ============================================================ */}

      <div
        className="
          hidden
          flex-wrap
          items-center
          justify-center
          gap-x-3
          gap-y-3
          sm:flex
        "
      >
        {options.map(
          renderOption
        )}
      </div>

      {/* ============================================================ */}
      {/* Scrollbar                                                    */}
      {/* ============================================================ */}

      <style jsx>{`
        .project-customizer-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .project-customizer-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  );
}