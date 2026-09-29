'use client';

import { resources } from '@/data/resources';

import { Reveal } from '../Reveal';
import { ResourceCarousel } from './ResourceCarousel';

const featuredResources = resources.slice(0, 12);

export function ResourceLibraryPreview() {
  return (
    <section
  id="resources"
  className="
    relative
    overflow-hidden
    bg-black
    pt-16
    pb-20
    text-white
    md:pt-24
    md:pb-28
    lg:pt-28
    lg:pb-32
  "
>
      {/* Heading */}
      <div className="container-page">
        <div
          className="
            mx-auto
            flex
            max-w-4xl
            flex-col
            items-center
            text-center
          "
        >
          <Reveal delay={0.1}>
            <h2
              className="
                mt-4
                max-w-[22rem]
                text-balance
                font-heading
                text-[2.2rem]
                font-semibold
                leading-[1.08]
                tracking-[-0.035em]
                sm:max-w-none
                sm:text-4xl
                md:text-5xl
                md:leading-[1.15]
              "
            >
              Resources for your next move
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <p
              className="
                mx-auto
                mt-5
                max-w-[22rem]
                text-[15px]
                leading-[25px]
                text-white/60
                sm:mt-6
                sm:max-w-2xl
                sm:text-[17px]
                sm:leading-[29px]
              "
            >
              Explore a growing collection of resources designed for
              founders, designers, and creative teams doing the best work.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Carousel */}
      <Reveal delay={0.25}>
        <div className="mt-9 md:mt-12">
          <ResourceCarousel resources={featuredResources} />
        </div>
      </Reveal>
    </section>
  );
}