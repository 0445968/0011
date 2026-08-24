'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import useEmblaCarousel from 'embla-carousel-react';

import {
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

import {
  demos,
} from '@/data/demos/registry';

import {
  DemoCard,
} from './DemoCard';

export function DemoCarousel() {
  const [
    emblaRef,
    emblaApi,
  ] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    dragFree: false,
  });

  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(0);

  /* ================================================================== */
  /* Selected slide                                                     */
  /* ================================================================== */

  const updateSelectedIndex =
    useCallback(() => {
      if (!emblaApi) {
        return;
      }

      setSelectedIndex(
        emblaApi.selectedScrollSnap()
      );
    }, [
      emblaApi,
    ]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    updateSelectedIndex();

    emblaApi.on(
      'select',
      updateSelectedIndex
    );

    emblaApi.on(
      'reInit',
      updateSelectedIndex
    );

    return () => {
      emblaApi.off(
        'select',
        updateSelectedIndex
      );

      emblaApi.off(
        'reInit',
        updateSelectedIndex
      );
    };
  }, [
    emblaApi,
    updateSelectedIndex,
  ]);

  /* ================================================================== */
  /* Navigation                                                         */
  /* ================================================================== */

  const previous =
    useCallback(() => {
      emblaApi?.scrollPrev();
    }, [
      emblaApi,
    ]);

  const next =
    useCallback(() => {
      emblaApi?.scrollNext();
    }, [
      emblaApi,
    ]);

  const scrollTo =
    useCallback(
      (
        index: number
      ) => {
        emblaApi?.scrollTo(
          index
        );
      },
      [
        emblaApi,
      ]
    );

  /* ================================================================== */
  /* Render                                                             */
  /* ================================================================== */

  return (
    <div
      id="demo-carousel"
      className="
        relative
        scroll-mt-28
      "
    >
      {/* ============================================================ */}
      {/* Carousel viewport                                            */}
      {/* ============================================================ */}

      <div
        ref={
          emblaRef
        }
        className="
          overflow-hidden
        "
      >
        <div
          className="
            flex
            touch-pan-y
            items-center
          "
        >
          {demos.map(
            (
              demo,
              index
            ) => {
              const isActive =
                index ===
                selectedIndex;

              return (
                <div
                  key={
                    demo.id
                  }
                  className="
                    relative
                    min-w-0

                    flex-[0_0_88%]

                    sm:flex-[0_0_68%]

                    lg:flex-[0_0_48%]
                    lg:-mr-[12%]

                    xl:flex-[0_0_46%]
                    xl:-mr-[11.5%]
                  "
                  style={{
                    zIndex:
                      isActive
                        ? 30
                        : 10,
                  }}
                >
                  {/* ------------------------------------------------ */}
                  {/* Card interaction wrapper                         */}
                  {/* ------------------------------------------------ */}

                  <div
                    role={
                      isActive
                        ? undefined
                        : 'button'
                    }
                    tabIndex={
                      isActive
                        ? undefined
                        : 0
                    }
                    onClick={() => {
                      if (
                        !isActive
                      ) {
                        scrollTo(
                          index
                        );
                      }
                    }}
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        isActive
                      ) {
                        return;
                      }

                      if (
                        event.key ===
                          'Enter' ||
                        event.key ===
                          ' '
                      ) {
                        event.preventDefault();

                        scrollTo(
                          index
                        );
                      }
                    }}
                    className={`
                      relative
                      mx-auto
                      h-full
                      w-full
                      max-w-[720px]
                      origin-center
                      transition-all
                      duration-500
                      ease-[cubic-bezier(0.16,1,0.3,1)]

                      ${
                        isActive
                          ? `
                            z-30
                            scale-100
                            opacity-100
                          `
                          : `
                            z-10
                            cursor-pointer
                            scale-[0.91]
                            opacity-30
                          `
                      }
                    `}
                  >
                    {/* ------------------------------------------------ */}
                    {/* Only the active card's links are clickable      */}
                    {/* ------------------------------------------------ */}

                    <div
                      className={`
                        h-full

                        ${
                          isActive
                            ? `
                              pointer-events-auto
                            `
                            : `
                              pointer-events-none
                            `
                        }
                      `}
                    >
                      <DemoCard
                        demo={
                          demo
                        }
                        index={
                          index
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* Controls                                                     */}
      {/* ============================================================ */}

      <div
        className="
          container-page
          mt-8
          flex
          items-center
          justify-between
          gap-6
          sm:mt-10
        "
      >
        {/* ---------------------------------------------------------- */}
        {/* Dots                                                       */}
        {/* ---------------------------------------------------------- */}

        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          {demos.map(
            (
              demo,
              index
            ) => {
              const active =
                index ===
                selectedIndex;

              return (
                <button
                  key={
                    demo.id
                  }
                  type="button"
                  onClick={() =>
                    scrollTo(
                      index
                    )
                  }
                  aria-label={`View ${demo.productName}`}
                  className={`
                    h-1.5
                    rounded-full
                    transition-all
                    duration-300

                    ${
                      active
                        ? `
                          w-8
                          bg-[#BBFF1B]
                        `
                        : `
                          w-1.5
                          bg-white/25
                          hover:bg-white/50
                        `
                    }
                  `}
                />
              );
            }
          )}
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Arrows                                                     */}
        {/* ---------------------------------------------------------- */}

        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <button
            type="button"
            onClick={
              previous
            }
            aria-label="Previous demo"
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              border
              border-white/20
              bg-white/10
              text-white
              backdrop-blur
              transition-colors
              hover:bg-white/15
            "
          >
            <ArrowLeft
              size={17}
            />
          </button>

          <button
            type="button"
            onClick={
              next
            }
            aria-label="Next demo"
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-[#BBFF1B]
              text-black
              transition-transform
              hover:scale-[1.03]
            "
          >
            <ArrowRight
              size={17}
            />
          </button>
        </div>
      </div>
    </div>
  );
}