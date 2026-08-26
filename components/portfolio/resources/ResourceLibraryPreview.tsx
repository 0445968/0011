'use client';

import { ArrowRight } from 'lucide-react';

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
        pt-20
        pb-24
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
          <Reveal
            className="
              flex
              items-center
              justify-center
              gap-3
              text-xs
              font-semibold
              uppercase
              tracking-[0.24em]
              text-primary
            "
          >
            Resource Library
          </Reveal>

          <Reveal delay={0.1}>
            <h2
              className="
                mt-4
                text-balance
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
          </Reveal>

          <Reveal delay={0.2}>
            <p
              className="
                mx-auto
                mt-6
                max-w-2xl
                text-[16px]
                leading-[28px]
                text-muted-foreground
                sm:text-[17px]
                sm:leading-[29px]
              "
            >
              Explore a growing collection of thoughtful articles,
              downloadable guides, interactive tools, and curated
              resources designed to help founders, designers,
              and creative teams do their best work.
            </p>
          </Reveal>
        </div>
      </div>

            {/* Carousel */}
            <Reveal delay={0.25}>
        <div className="mt-10 md:mt-12">
          <ResourceCarousel
            resources={featuredResources}
          />
        </div>
      </Reveal>
    </section>
  );
}