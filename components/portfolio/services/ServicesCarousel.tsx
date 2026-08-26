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
    Make your brand
    stand out and grow with confidence.
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
    </section>
  );
}