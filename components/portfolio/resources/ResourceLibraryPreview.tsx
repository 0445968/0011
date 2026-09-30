'use client';

import {
  resources,
  type Resource,
} from '@/data/resources';

import { Reveal } from '../Reveal';
import { ResourceCarousel } from './ResourceCarousel';

/* ====================================================== */
/* HOMEPAGE RESOURCE SELECTION                            */
/* ====================================================== */

/*
 * The order below is the exact order shown
 * in the homepage carousel.
 *
 * Recommended mix:
 * - 3 articles
 * - 3 guides
 * - 2 tools
 */

const featuredResourceSlugs = [
  'brand-identity-guide',
  'design-that-feels-inevitable',  
  'typography-is-the-interface',
  'color-systems-handbook',
  'color-palette-generator',
  'building-a-template-library',
  'typography-playbook',
] as const;

const featuredResources: Resource[] =
  featuredResourceSlugs
    .map((slug) =>
      resources.find(
        (resource) =>
          resource.slug === slug
      )
    )
    .filter(
      (resource): resource is Resource =>
        Boolean(resource)
    );

export function ResourceLibraryPreview() {
  return (
    <section
      id="resources"
      className="
        relative
        overflow-hidden
        bg-black
        pb-24
        pt-20
        text-white

        md:pb-28
        md:pt-24

        lg:pb-32
        lg:pt-28
      "
    >
      {/* ====================================================== */}
      {/* HEADING                                                */}
      {/* ====================================================== */}

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
              style={{
                lineHeight: 1.15,
              }}
              className="
                mt-4
                text-balance
                font-heading
                text-[2.2rem]
                font-semibold
                tracking-[-0.035em]

                sm:text-4xl
                md:text-5xl
              "
            >
              Resources for your next move
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
                text-white/60

                sm:text-[17px]
                sm:leading-[29px]
              "
            >
              Explore a growing collection of
              resources designed for founders,
              designers, and creative teams doing
              their best work.
            </p>
          </Reveal>
        </div>
      </div>

      {/* ====================================================== */}
      {/* CAROUSEL                                               */}
      {/* ====================================================== */}

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