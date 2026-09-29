'use client';

import {
  useEffect,
  useRef,
} from 'react';

import useEmblaCarousel from 'embla-carousel-react';

import type {
  ScrollBodyType,
} from 'embla-carousel';

import {
  ArrowUpRight,
} from 'lucide-react';

import {
  services,
} from '@/data/services';

import {
  ServiceCard,
} from './ServiceCard';

const NORMAL_SPEED = 0.5;
const HOVER_SPEED = 0.25;

const SPEED_EASING = 0.06;

export function ServicesCarousel() {
  const targetSpeedRef =
    useRef(NORMAL_SPEED);

  const currentSpeedRef =
    useRef(NORMAL_SPEED);

  const [
    emblaRef,
    emblaApi,
  ] = useEmblaCarousel({
    loop: true,
    align: 'start',
    dragFree: true,
    containScroll: false,
    watchDrag: true,
  });

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const engine =
      emblaApi.internalEngine();

    /*
     * Save Embla's native scroll body.
     *
     * We use our custom body for continuous
     * auto-scroll, but restore Embla's native
     * body while the user is physically dragging.
     */

    const defaultScrollBody =
      engine.scrollBody;

    const {
      location,
      previousLocation,
      offsetLocation,
      target,
      scrollTarget,
      index,
      indexPrevious,

      limit: {
        reachedMin,
        constrain,
      },

      options: {
        loop,
      },
    } = engine;

    let bodyVelocity = 0;
    let scrollDirection = 0;

    let rawLocation =
      location.get();

    let rawLocationPrevious =
      rawLocation;

    let hasSettled = false;

    let isDragging =
      false;

    const noop =
      (): ScrollBodyType =>
        scrollBody;

    /* ========================================================== */
    /* Continuous auto-scroll body                                */
    /* ========================================================== */

    const seek =
      (): ScrollBodyType => {
        /*
         * While dragging we should not push
         * the carousel ourselves.
         *
         * Embla's native scroll body handles
         * the physical pointer movement.
         */

        if (isDragging) {
          return scrollBody;
        }

        currentSpeedRef.current +=
          (
            targetSpeedRef.current -
            currentSpeedRef.current
          ) *
          SPEED_EASING;

        previousLocation.set(
          location
        );

        bodyVelocity =
          -currentSpeedRef.current;

        rawLocation +=
          bodyVelocity;

        location.add(
          bodyVelocity
        );

        target.set(
          location
        );

        const directionDiff =
          rawLocation -
          rawLocationPrevious;

        scrollDirection =
          Math.sign(
            directionDiff
          );

        rawLocationPrevious =
          rawLocation;

        const currentIndex =
          scrollTarget.byDistance(
            0,
            false
          ).index;

        if (
          index.get() !==
          currentIndex
        ) {
          indexPrevious.set(
            index.get()
          );

          index.set(
            currentIndex
          );

          emblaApi.emit(
            'select'
          );
        }

        const reachedEnd =
          reachedMin(
            offsetLocation.get()
          );

        if (
          !loop &&
          reachedEnd
        ) {
          hasSettled =
            true;

          const constrainedLocation =
            constrain(
              location.get()
            );

          location.set(
            constrainedLocation
          );

          target.set(
            location
          );
        }

        return scrollBody;
      };

    const scrollBody:
      ScrollBodyType = {
      direction: () =>
        scrollDirection,

      duration: () => -1,

      velocity: () =>
        bodyVelocity,

      settled: () =>
        hasSettled,

      seek,

      useBaseFriction:
        noop,

      useBaseDuration:
        noop,

      useFriction:
        noop,

      useDuration:
        noop,
    };

    /* ========================================================== */
    /* Drag handling                                              */
    /* ========================================================== */

    const handlePointerDown =
      () => {
        isDragging =
          true;

        /*
         * Give full control back to Embla.
         *
         * This is what makes mobile touch dragging
         * follow the user's finger instead of
         * fighting against auto-scroll.
         */

        engine.scrollBody =
          defaultScrollBody;
      };

    const handlePointerUp =
      () => {
        /*
         * Synchronize our continuous-scroll position
         * with wherever the user finished dragging.
         */

        rawLocation =
          location.get();

        rawLocationPrevious =
          rawLocation;

        previousLocation.set(
          location
        );

        target.set(
          location
        );

        bodyVelocity = 0;

        isDragging =
          false;

        /*
         * Resume continuous movement.
         */

        engine.scrollBody =
          scrollBody;

        engine.animation.start();
      };

    emblaApi.on(
      'pointerDown',
      handlePointerDown
    );

    emblaApi.on(
      'pointerUp',
      handlePointerUp
    );

    /* ========================================================== */
    /* Start auto-scroll                                          */
    /* ========================================================== */

    engine.scrollBody =
      scrollBody;

    engine.animation.start();

    return () => {
      emblaApi.off(
        'pointerDown',
        handlePointerDown
      );

      emblaApi.off(
        'pointerUp',
        handlePointerUp
      );

      engine.scrollBody =
        defaultScrollBody;
    };
  }, [emblaApi]);

  return (
    <section
      className="
        overflow-hidden
        pb-20
        pt-12
        sm:pb-24
        sm:pt-14
        lg:pb-24
        lg:pt-16
      "
    >
      {/* ========================================================== */}
      {/* Header                                                     */}
      {/* ========================================================== */}

      <div
        className="
          container-page
          mb-10
          text-center
          md:mb-12
        "
      >
        <h2
          style={{
            lineHeight: 1.15,
          }}
          className="
            mx-auto
            mt-4
            max-w-[11ch]
            text-balance
            font-heading
            text-[2.2rem]
            font-semibold
            tracking-[-0.035em]
            sm:max-w-none
            sm:whitespace-nowrap
            sm:text-4xl
            md:text-5xl
          "
        >
          Build a better brand
          with Bivi
        </h2>

        <p
          className="
            mx-auto
            mt-5
            max-w-2xl
            text-base
            leading-7
            text-muted-foreground
            sm:text-lg
            sm:leading-8
          "
        >
          Make your brand stand out
          and grow with confidence.
        </p>
      </div>

      {/* ========================================================== */}
      {/* Actions                                                    */}
      {/* ========================================================== */}

      <div
        className="
          container-page
          mb-12
          flex
          flex-col
          items-center
          justify-center
          gap-3
          sm:flex-row
          md:mb-14
        "
      >
        <a
          href="/services"
          className="
            inline-flex
            h-[52px]
            items-center
            justify-center
            gap-2
            rounded-[14px]
            bg-black
            px-7
            font-mono
            text-[16px]
            font-bold
            leading-none
            text-white
            transition-colors
            hover:bg-[#333333]
          "
        >
          Browse all services

          <ArrowUpRight
            size={17}
            className="shrink-0"
          />
        </a>

        <a
          href="/about"
          className="
            inline-flex
            h-[52px]
            items-center
            justify-center
            rounded-[14px]
            bg-[#eaeaea]
            px-7
            font-mono
            text-[16px]
            font-bold
            leading-none
            text-foreground
            transition-colors
            hover:bg-muted/70
          "
        >
          Get to know us
        </a>
      </div>

      {/* ========================================================== */}
      {/* Carousel                                                   */}
      {/* ========================================================== */}

      <div
        className="
          relative
          w-full
        "
        onMouseEnter={() => {
          targetSpeedRef.current =
            HOVER_SPEED;
        }}
        onMouseLeave={() => {
          targetSpeedRef.current =
            NORMAL_SPEED;
        }}
      >
        <div
          ref={emblaRef}
          className="
            cursor-grab
            touch-pan-y
            overflow-hidden
            active:cursor-grabbing
          "
        >
          <div
            className="
              flex
              gap-3
              px-3
              sm:gap-6
              sm:px-6
            "
          >
            {services.map(
              (
                service
              ) => (
                <div
                  key={
                    service.id
                  }
                  className="
                    shrink-0
                  "
                >
                  <ServiceCard
                    service={
                      service
                    }
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}