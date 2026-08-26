'use client';

import { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import { ArrowUpRight } from 'lucide-react';

import { services } from '@/data/services';

import { ServiceCard } from './ServiceCard';

export function ServicesCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      dragFree: true,
      containScroll: false,
    },
    [
      AutoScroll({
        speed: 0.5,
        startDelay: 0,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    ]
  );

  const stopAutoScroll = useCallback(() => {
    const autoScroll =
      emblaApi?.plugins()?.autoScroll;

    if (autoScroll) {
      autoScroll.stop();
    }
  }, [emblaApi]);

  const startAutoScroll = useCallback(() => {
    const autoScroll =
      emblaApi?.plugins()?.autoScroll;

    if (autoScroll) {
      autoScroll.play();
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    startAutoScroll();

    return () => {
      stopAutoScroll();
    };
  }, [
    emblaApi,
    startAutoScroll,
    stopAutoScroll,
  ]);

  return (
    <section
      className="
        overflow-hidden
        pt-10
        pb-24
        sm:pt-12
        sm:pb-28
        lg:pt-32
        lg:pb-32
      "
    >
      {/* Header */}
      <div
        className="
          container-page
          mb-12
          text-center
          md:mb-14
        "
      >
        <p
          className="
            text-xs
            font-semibold
            uppercase
            tracking-[0.2em]
            text-primary
          "
        >
          Services
        </p>

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
      </div>

      {/* Carousel */}
      <div
        className="
          relative
          w-full
        "
        onMouseEnter={stopAutoScroll}
        onMouseLeave={startAutoScroll}
      >
        <div
          className="
            overflow-hidden
          "
          ref={emblaRef}
        >
          <div
            className="
              flex
              gap-6
              px-6
            "
          >
            {services.map((service) => (
              <div
                key={service.id}
                className="
                  shrink-0
                "
              >
                <ServiceCard
                  service={service}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Browse All Services */}
      <div
        className="
          container-page
          mt-12
          flex
          justify-center
          md:mt-14
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
            hover:bg-[#333333]
          "
        >
          Browse all services

          <ArrowUpRight
            size={17}
            className="shrink-0"
          />
        </a>
      </div>
    </section>
  );
}