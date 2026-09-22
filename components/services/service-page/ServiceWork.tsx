import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowUpRight,
} from 'lucide-react';

import type { ServicePage } from '@/data/servicePages';
import { projects } from '@/data/projects';

type ServiceWorkProps = {
  service: ServicePage;
};

type WorkMapping = {
  projectSlugs: string[];
};

const serviceWork: Record<
  string,
  WorkMapping
> = {
  'branding-services': {
    projectSlugs: [
      'verdant-studio',
      'maison-fleur',
    ],
  },

  'creative-direction': {
    projectSlugs: [
      'arc-architecture',
      'verdant-studio',
    ],
  },

  'packaging-merch-design': {
    projectSlugs: [
      'maison-fleur',
      'verdant-studio',
    ],
  },

  'presentation-design': {
    projectSlugs: [
      'lumen-analytics',
      'harbor-finance',
    ],
  },

  'print-design': {
    projectSlugs: [
      'nomad-journal',
      'verdant-studio',
    ],
  },

  'web-design': {
    projectSlugs: [
      'arc-architecture',
      'maison-fleur',
    ],
  },

  'mobile-app-design': {
    projectSlugs: [
      'harbor-finance',
      'lumen-analytics',
    ],
  },

  'campaign-strategy': {
    projectSlugs: [
      'maison-fleur',
      'verdant-studio',
    ],
  },

  'social-media-creative': {
    projectSlugs: [
      'verdant-studio',
      'maison-fleur',
    ],
  },

  'email-design': {
    projectSlugs: [
      'maison-fleur',
      'lumen-analytics',
    ],
  },
};

export function ServiceWork({
  service,
}: ServiceWorkProps) {
  const mapping =
    serviceWork[service.slug] ??
    serviceWork['branding-services'];

  const selectedProjects =
    mapping.projectSlugs
      .map((slug) =>
        projects.find(
          (project) =>
            project.slug === slug
        )
      )
      .filter(
        (
          project
        ): project is (typeof projects)[number] =>
          Boolean(project)
      );

  if (
    selectedProjects.length === 0
  ) {
    return null;
  }

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#010008]
        py-24
        text-white
        sm:py-28
        lg:py-36
      "
    >
      <div className="container-page">
        {/* -------------------------------------------------------- */}
        {/* Intro                                                    */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            grid
            gap-8
            lg:grid-cols-[0.7fr_1.35fr]
            lg:items-end
            lg:gap-20
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <span
                aria-hidden="true"
                className="
                  h-px
                  w-8
                  bg-[#BBFF1B]
                "
              />

              <p
                className="
                  font-mono
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-white/45
                  sm:text-xs
                "
              >
                Selected work
              </p>
            </div>
          </div>

          <div>
            <h2
              className="
                max-w-3xl
                text-balance
                font-heading
                text-3xl
                font-semibold
                leading-[1.02]
                tracking-[-0.04em]
                text-white
                sm:text-4xl
                lg:text-5xl
              "
            >
              See the thinking put into
              practice.
            </h2>

            <p
              className="
                mt-5
                max-w-xl
                text-sm
                leading-6
                text-white/45
                sm:text-base
                sm:leading-7
              "
            >
              A few examples of how
              strategy, design, and
              execution come together
              across real projects.
            </p>
          </div>
        </div>

        {/* -------------------------------------------------------- */}
        {/* Projects                                                 */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            mt-14
            grid
            gap-5
            lg:mt-20
            lg:grid-cols-2
          "
        >
          {selectedProjects.map(
            (project, index) => (
              <Link
                key={project.slug}
                href={`/work/${project.slug}`}
                className="
                  group
                  block
                  min-w-0
                "
              >
                {/* Image */}

                <div
                  className={`
                    relative
                    overflow-hidden
                    rounded-[26px]
                    bg-[#071B34]

                    ${
                      index === 0
                        ? `
                            aspect-[4/5]
                            lg:aspect-[1.08/1]
                          `
                        : `
                            aspect-[4/5]
                            lg:mt-24
                            lg:aspect-[0.88/1]
                          `
                    }
                  `}
                >
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    sizes="
                      (max-width: 1024px) 100vw,
                      50vw
                    "
                    className="
                      object-cover
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-[1.025]
                    "
                  />

                  {/* Dark overlay */}

                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/70
                      via-black/5
                      to-transparent
                    "
                  />

                  {/* Blue wash */}

                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-[#071B34]/5
                    "
                  />

                  {/* Number */}

                  <div
                    className="
                      absolute
                      left-5
                      top-5
                      flex
                      h-9
                      min-w-9
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/15
                      bg-black/20
                      px-3
                      backdrop-blur-md
                    "
                  >
                    <span
                      className="
                        font-mono
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.14em]
                        text-white/70
                      "
                    >
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        '0'
                      )}
                    </span>
                  </div>

                  {/* Arrow */}

                  <div
                    className="
                      absolute
                      right-5
                      top-5
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/15
                      bg-black/20
                      text-white
                      backdrop-blur-md
                      transition-all
                      duration-300
                      group-hover:bg-white
                      group-hover:text-black
                    "
                  >
                    <ArrowUpRight
                      className="
                        h-4
                        w-4
                        transition-transform
                        duration-300
                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                      "
                    />
                  </div>

                  {/* Bottom info */}

                  <div
                    className="
                      absolute
                      inset-x-0
                      bottom-0
                      p-6
                      sm:p-7
                    "
                  >
                    <p
                      className="
                        font-mono
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.16em]
                        text-white/50
                      "
                    >
                      {project.category}
                    </p>

                    <h3
                      className="
                        mt-3
                        max-w-xl
                        text-balance
                        font-heading
                        text-2xl
                        font-semibold
                        leading-[1.02]
                        tracking-[-0.03em]
                        text-white
                        sm:text-3xl
                      "
                    >
                      {project.name}
                    </h3>
                  </div>
                </div>

                {/* Project metadata */}

                <div
                  className="
                    mt-5
                    flex
                    items-start
                    justify-between
                    gap-8
                    px-1
                  "
                >
                  <p
                    className="
                      max-w-lg
                      text-sm
                      leading-6
                      text-white/42
                      sm:text-[15px]
                      sm:leading-7
                    "
                  >
                    {project.description}
                  </p>

                  <div
                    className="
                      hidden
                      shrink-0
                      text-right
                      sm:block
                    "
                  >
                    <p
                      className="
                        font-mono
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.14em]
                        text-white/25
                      "
                    >
                      {project.year}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-white/40
                      "
                    >
                      {project.role}
                    </p>
                  </div>
                </div>
              </Link>
            )
          )}
        </div>

        {/* -------------------------------------------------------- */}
        {/* View all                                                 */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            mt-12
            flex
            justify-end
            border-t
            border-white/10
            pt-7
            lg:mt-16
          "
        >
          <Link
            href="/work"
            className="
              group
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-white
            "
          >
            View all work

            <ArrowUpRight
              className="
                h-4
                w-4
                transition-transform
                duration-300
                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
              "
            />
          </Link>
        </div>
      </div>
    </section>
  );
}