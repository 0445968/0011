'use client';

import { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';

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
        speed: 2,
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
        py-24
      "
    >

      {/* Header */}
      <div
        className="
          container-page
          mb-12
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
            mt-4
            max-w-3xl
            font-heading
            text-4xl
            font-semibold
            tracking-tight
            md:text-5xl
          "
        >
          Creative solutions built for ambitious brands.
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

    </section>
  );
}