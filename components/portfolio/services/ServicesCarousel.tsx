'use client';

import {
  useEffect,
  useRef,
} from 'react';

import useEmblaCarousel from 'embla-carousel-react';
import type { ScrollBodyType } from 'embla-carousel';

import { ArrowUpRight } from 'lucide-react';

import { services } from '@/data/services';
import { ServiceCard } from './ServiceCard';

const NORMAL_SPEED = 0.5;
const HOVER_SPEED = 0.25;

/*
 * Controls how smoothly the carousel transitions
 * between normal and hover speed.
 *
 * Smaller = softer / slower transition
 * Larger = faster transition
 */
const SPEED_EASING = 0.06;

export function ServicesCarousel() {
  const targetSpeedRef = useRef(NORMAL_SPEED);
  const currentSpeedRef = useRef(NORMAL_SPEED);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    dragFree: true,
    containScroll: false,
  });

  useEffect(() => {
    if (!emblaApi) return;

    const engine = emblaApi.internalEngine();

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
        reachedMax,
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

    const noop = (): ScrollBodyType =>
      scrollBody;

    const seek = (): ScrollBodyType => {
      /*
       * Smoothly move the current speed toward
       * the requested speed.
       *
       * This happens inside Embla's existing
       * animation frame, so nothing restarts.
       */
      currentSpeedRef.current +=
        (
          targetSpeedRef.current -
          currentSpeedRef.current
        ) * SPEED_EASING;

      previousLocation.set(location);

      /*
       * Negative velocity moves the carousel
       * forward, matching Embla AutoScroll.
       */
      bodyVelocity =
        -currentSpeedRef.current;

      rawLocation += bodyVelocity;

      location.add(bodyVelocity);

      target.set(location);

      const directionDiff =
        rawLocation -
        rawLocationPrevious;

      scrollDirection =
        Math.sign(directionDiff);

      rawLocationPrevious =
        rawLocation;

      /*
       * Keep Embla's selected slide/index state
       * synchronized while continuously moving.
       */
      const currentIndex =
        scrollTarget.byDistance(
          0,
          false
        ).index;

      if (
        index.get() !== currentIndex
      ) {
        indexPrevious.set(
          index.get()
        );

        index.set(
          currentIndex
        );

        emblaApi.emit('select');
      }

      /*
       * Safety for non-loop mode.
       * You're using loop:true, but keeping this
       * makes the custom scroll body complete.
       */
      const reachedEnd =
        reachedMin(
          offsetLocation.get()
        );

      if (
        !loop &&
        reachedEnd
      ) {
        hasSettled = true;

        const constrainedLocation =
          constrain(
            location.get()
          );

        location.set(
          constrainedLocation
        );

        target.set(location);
      }

      return scrollBody;
    };

    const scrollBody: ScrollBodyType = {
      direction: () =>
        scrollDirection,

      duration: () => -1,

      velocity: () =>
        bodyVelocity,

      settled: () =>
        hasSettled,

      seek,

      useBaseFriction: noop,

      useBaseDuration: noop,

      useFriction: noop,

      useDuration: noop,
    };

    /*
     * Install our continuous scroll behavior
     * once.
     *
     * It is NOT recreated on hover.
     */
    engine.scrollBody =
      scrollBody;

    engine.animation.start();

    return () => {
      /*
       * Restore Embla's original scroll body
       * when this component unmounts.
       */
      engine.scrollBody =
        defaultScrollBody;
    };
  }, [emblaApi]);

  return (
    <section
      className="
        overflow-hidden
        pt-12
        pb-20
        sm:pt-14
        sm:pb-24
        lg:pt-16
        lg:pb-24
      "
    >
      {/* Header */}
      <div
        className="
          container-page
          mb-10
          text-center
          md:mb-12
        "
      >
        <h2
          className="
            mx-auto
            mt-4
            max-w-none
            whitespace-nowrap
            font-heading
            text-3xl
            font-semibold
            leading-[1]
            tracking-tight
            sm:text-4xl
            md:text-5xl
          "
        >
          Build a better brand with Bivi
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
          Make your brand stand out and grow
          with confidence.
        </p>
      </div>

      {/* Actions */}
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
            text-[16px]
            font-bold
            leading-none
            text-foreground
            transition-colors
            hover:bg-muted/70
          "
        >
          Learn more
        </a>
      </div>

      {/* Carousel */}
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
            overflow-hidden
          "
        >
          <div
            className="
              flex
              gap-6
              px-6
            "
          >
            {services.map(
              (service) => (
                <div
                  key={service.id}
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