import Link from 'next/link';

import {
  ArrowLeft,
  ArrowRight,
  Brush,
  CircleDot,
  FileImage,
  Layers3,
  Palette,
  Shapes,
  Type,
} from 'lucide-react';

import {
  resources,
} from '@/data/resources';

import {
  labItems,
} from '@/data/studio-lab/registry';

const identityTopics = [
  {
    title: 'Logo systems',
    description:
      'Understand how primary marks, secondary marks, symbols, wordmarks, and responsive logo variations work together.',
    href: '/help/articles',
    icon: Shapes,
  },
  {
    title: 'Typography',
    description:
      'Explore how type choices influence tone, hierarchy, readability, personality, and consistency across a brand.',
    href: '/help/articles',
    icon: Type,
  },
  {
    title: 'Color',
    description:
      'Build a color system that is distinctive, flexible, accessible, and useful across digital and physical applications.',
    href: '/help/guides',
    icon: Palette,
  },
  {
    title: 'Art direction',
    description:
      'Define the visual language behind photography, illustration, graphics, composition, motion, and supporting imagery.',
    href: '/help/articles',
    icon: Brush,
  },
  {
    title: 'Design systems',
    description:
      'Turn visual decisions into reusable rules, components, patterns, and guidelines that can scale consistently.',
    href: '/help/guides',
    icon: Layers3,
  },
  {
    title: 'Identity rollout',
    description:
      'Apply a new identity across websites, social media, marketing, presentations, print, and other brand touchpoints.',
    href: '/help/working-together',
    icon: FileImage,
  },
];

export default function VisualIdentityHelpPage() {
  const identityResources = resources
    .filter((resource) => {
      const searchable = `
        ${resource.title}
        ${resource.description}
        ${resource.category ?? ''}
      `.toLowerCase();

      return (
        searchable.includes('identity') ||
        searchable.includes('logo') ||
        searchable.includes('typography') ||
        searchable.includes('color') ||
        searchable.includes('design system') ||
        searchable.includes('visual')
      );
    })
    .slice(0, 4);

  const identityTools = labItems
    .filter((item) => {
      if (item.status !== 'active') {
        return false;
      }

      const searchable = `
        ${item.title}
        ${item.description}
      `.toLowerCase();

      return (
        searchable.includes('color') ||
        searchable.includes('visual') ||
        searchable.includes('identity') ||
        searchable.includes('palette')
      );
    })
    .slice(0, 4);

  return (
    <main
      className="
        min-h-screen
        bg-background
      "
    >
      {/* ------------------------------------------------------------ */}
      {/* Hero                                                         */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          border-b
          border-border
          bg-secondary/20
          pb-14
          pt-28
          sm:pb-16
          sm:pt-32
          lg:pb-20
          lg:pt-36
        "
      >
        <div className="container-page">
          <Link
            href="/help"
            className="
              group
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-muted-foreground
              transition-colors
              hover:text-primary
            "
          >
            <ArrowLeft
              size={15}
              strokeWidth={2}
              className="
                transition-transform
                duration-200
                group-hover:-translate-x-1
              "
            />

            Help Center
          </Link>

          <div
            className="
              mt-8
              max-w-3xl
            "
          >
            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-primary
                sm:text-xs
              "
            >
              Visual Identity
            </p>

            <h1
              className="
                mt-4
                text-balance
                font-serif
                text-4xl
                font-semibold
                leading-[0.98]
                tracking-[-0.045em]
                sm:text-5xl
                md:text-6xl
              "
            >
              Build a visual system,
              not just a logo.
            </h1>

            <p
              className="
                mt-6
                max-w-2xl
                text-base
                leading-7
                text-muted-foreground
                sm:text-lg
                sm:leading-8
              "
            >
              Explore logos, typography,
              color, art direction, design
              systems, consistency, and the
              practical work of turning a
              brand strategy into a visual
              language.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Topic grid                                                   */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          py-16
          sm:py-20
          lg:py-24
        "
      >
        <div className="container-page">
          <div
            className="
              max-w-2xl
            "
          >
            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-primary
              "
            >
              Explore the system
            </p>

            <h2
              className="
                mt-2
                font-serif
                text-3xl
                font-semibold
                tracking-[-0.035em]
                text-foreground
              "
            >
              Visual identity topics
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Learn how the different parts
              of an identity work together
              to create a recognizable and
              flexible brand.
            </p>
          </div>

          <div
            className="
              mt-10
              grid
              gap-5
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {identityTopics.map(
              (topic) => {
                const Icon =
                  topic.icon;

                return (
                  <Link
                    key={topic.title}
                    href={topic.href}
                    className="
                      group
                      flex
                      min-h-[260px]
                      flex-col
                      rounded-3xl
                      border
                      border-border
                      bg-card
                      p-6
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-primary/35
                      hover:shadow-[0_18px_55px_rgba(0,0,0,0.08)]
                    "
                  >
                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-4
                      "
                    >
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-2xl
                          bg-primary/10
                          text-primary
                        "
                      >
                        <Icon
                          size={19}
                          strokeWidth={2}
                        />
                      </div>

                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-border
                          text-muted-foreground
                          transition-all
                          duration-300
                          group-hover:border-[#BBFF1B]
                          group-hover:bg-[#BBFF1B]
                          group-hover:text-black
                        "
                      >
                        <ArrowRight
                          size={15}
                          strokeWidth={2}
                          className="
                            transition-transform
                            duration-300
                            group-hover:translate-x-1
                          "
                        />
                      </div>
                    </div>

                    <h3
                      className="
                        mt-7
                        text-xl
                        font-semibold
                        tracking-[-0.025em]
                        text-foreground
                      "
                    >
                      {topic.title}
                    </h3>

                    <p
                      className="
                        mt-3
                        text-sm
                        leading-6
                        text-muted-foreground
                      "
                    >
                      {topic.description}
                    </p>
                  </Link>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Principles                                                   */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          border-t
          border-border
          bg-secondary/20
          py-16
          sm:py-20
          lg:py-24
        "
      >
        <div
          className="
            container-page
            grid
            gap-10
            lg:grid-cols-[0.72fr_1.28fr]
            lg:gap-16
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-primary
              "
            >
              What makes an identity work?
            </p>

            <h2
              className="
                mt-2
                max-w-md
                font-serif
                text-3xl
                font-semibold
                tracking-[-0.035em]
                text-foreground
              "
            >
              Consistency without
              becoming repetitive.
            </h2>

            <p
              className="
                mt-4
                max-w-md
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              A strong identity gives
              people enough consistency
              to recognize the brand while
              allowing enough flexibility
              to adapt across different
              contexts.
            </p>
          </div>

          <div
            className="
              overflow-hidden
              rounded-3xl
              border
              border-border
              bg-card
            "
          >
            <PrincipleRow
              number="01"
              title="Distinctive"
              description="The system should create recognizable visual cues that belong to the brand rather than the category in general."
            />

            <PrincipleRow
              number="02"
              title="Consistent"
              description="Core decisions should remain coherent across channels, formats, teams, and different pieces of communication."
            />

            <PrincipleRow
              number="03"
              title="Flexible"
              description="The identity needs enough range to handle different messages and environments without feeling like a rigid template."
            />

            <PrincipleRow
              number="04"
              title="Usable"
              description="A beautiful system is only valuable when the people responsible for using it can understand and apply it."
              last
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Recommended resources                                       */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          border-t
          border-border
          py-16
          sm:py-20
          lg:py-24
        "
      >
        <div className="container-page">
          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-primary
                "
              >
                Learn
              </p>

              <h2
                className="
                  mt-2
                  font-serif
                  text-3xl
                  font-semibold
                  tracking-[-0.035em]
                  text-foreground
                "
              >
                Recommended resources
              </h2>
            </div>

            <Link
              href="/help/guides"
              className="
                group
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-primary
              "
            >
              Browse all guides

              <ArrowRight
                size={14}
                strokeWidth={2}
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>

          {identityResources.length >
          0 ? (
            <div
              className="
                mt-10
                grid
                gap-4
                md:grid-cols-2
              "
            >
              {identityResources.map(
                (resource) => (
                  <Link
                    key={resource.id}
                    href={resource.href}
                    className="
                      group
                      flex
                      items-start
                      gap-4
                      rounded-2xl
                      border
                      border-border
                      bg-card
                      p-5
                      transition-all
                      duration-200
                      hover:border-primary/35
                    "
                  >
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-primary/10
                        text-primary
                      "
                    >
                      <FileImage
                        size={17}
                        strokeWidth={2}
                      />
                    </div>

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <p
                        className="
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[0.14em]
                          text-primary
                        "
                      >
                        {resource.type}
                      </p>

                      <h3
                        className="
                          mt-2
                          text-base
                          font-semibold
                          tracking-[-0.02em]
                          text-foreground
                        "
                      >
                        {resource.title}
                      </h3>

                      <p
                        className="
                          mt-2
                          line-clamp-2
                          text-sm
                          leading-6
                          text-muted-foreground
                        "
                      >
                        {
                          resource.description
                        }
                      </p>
                    </div>

                    <ArrowRight
                      size={15}
                      strokeWidth={2}
                      className="
                        mt-1
                        shrink-0
                        text-muted-foreground
                        transition-transform
                        duration-200
                        group-hover:translate-x-1
                        group-hover:text-primary
                      "
                    />
                  </Link>
                )
              )}
            </div>
          ) : (
            <div
              className="
                mt-10
                rounded-3xl
                border
                border-border
                bg-card
                p-8
                text-sm
                text-muted-foreground
              "
            >
              Visual identity resources
              will appear here as they
              are added to the Resource
              Library.
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Tools                                                        */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          border-t
          border-border
          bg-secondary/20
          py-16
          sm:py-20
          lg:py-24
        "
      >
        <div
          className="
            container-page
            grid
            gap-10
            lg:grid-cols-[0.7fr_1.3fr]
            lg:gap-16
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-primary
              "
            >
              Explore visually
            </p>

            <h2
              className="
                mt-2
                font-serif
                text-3xl
                font-semibold
                tracking-[-0.035em]
                text-foreground
              "
            >
              Identity tools
            </h2>

            <p
              className="
                mt-4
                max-w-md
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Use free Studio Lab tools
              to explore color and other
              visual decisions before
              moving into a larger identity
              project.
            </p>

            <Link
              href="/help/tools"
              className="
                group
                mt-6
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-primary
              "
            >
              Browse all tools

              <ArrowRight
                size={14}
                strokeWidth={2}
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>

          {identityTools.length >
          0 ? (
            <div
              className="
                overflow-hidden
                rounded-3xl
                border
                border-border
                bg-card
              "
            >
              {identityTools.map(
                (item, index) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`
                      group
                      flex
                      items-center
                      justify-between
                      gap-5
                      p-6
                      transition-colors
                      hover:bg-secondary/30
                      ${
                        index !== 0
                          ? 'border-t border-border'
                          : ''
                      }
                    `}
                  >
                    <div
                      className="
                        flex
                        min-w-0
                        items-start
                        gap-4
                      "
                    >
                      <div
                        className="
                          mt-0.5
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-primary/10
                          text-primary
                        "
                      >
                        <CircleDot
                          size={16}
                          strokeWidth={2}
                        />
                      </div>

                      <div
                        className="
                          min-w-0
                        "
                      >
                        <p
                          className="
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-[0.14em]
                            text-primary
                          "
                        >
                          {item.type ===
                          'assessment'
                            ? 'Assessment'
                            : 'Tool'}
                        </p>

                        <h3
                          className="
                            mt-2
                            text-base
                            font-semibold
                            tracking-[-0.02em]
                            text-foreground
                          "
                        >
                          {item.title}
                        </h3>

                        <p
                          className="
                            mt-1
                            line-clamp-2
                            text-sm
                            leading-6
                            text-muted-foreground
                          "
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <ArrowRight
                      size={15}
                      strokeWidth={2}
                      className="
                        shrink-0
                        text-muted-foreground
                        transition-transform
                        duration-200
                        group-hover:translate-x-1
                        group-hover:text-primary
                      "
                    />
                  </Link>
                )
              )}
            </div>
          ) : (
            <div
              className="
                rounded-3xl
                border
                border-border
                bg-card
                p-8
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Relevant Studio Lab tools
              will appear here as active
              visual identity tools are
              added.
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* CTA                                                          */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          border-t
          border-border
          py-16
          sm:py-20
          lg:py-24
        "
      >
        <div className="container-page">
          <div
            className="
              relative
              overflow-hidden
              rounded-3xl
              bg-[#1600A2]
              px-6
              py-10
              text-white
              sm:px-8
              sm:py-12
              lg:px-12
              lg:py-14
            "
          >
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -right-20
                -top-24
                h-64
                w-64
                rounded-full
                bg-primary/40
                blur-3xl
              "
            />

            <div
              className="
                relative
                z-10
                flex
                flex-col
                gap-8
                md:flex-row
                md:items-center
                md:justify-between
              "
            >
              <div
                className="
                  max-w-2xl
                "
              >
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-[#BBFF1B]
                  "
                >
                  Building or refreshing
                  an identity?
                </p>

                <h2
                  className="
                    mt-3
                    font-serif
                    text-3xl
                    font-semibold
                    tracking-[-0.035em]
                    sm:text-4xl
                  "
                >
                  Create a system that
                  can grow with the brand.
                </h2>

                <p
                  className="
                    mt-3
                    max-w-xl
                    text-sm
                    leading-6
                    text-white/75
                  "
                >
                  Tell Bivi what
                  is changing, what is
                  missing, and where your
                  current visual identity
                  is no longer doing
                  enough.
                </p>
              </div>

              <Link
                href="/help/contact/appointment"
                className="
                  group
                  inline-flex
                  min-h-[48px]
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  self-start
                  rounded-[14px]
                  bg-[#BBFF1B]
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-black
                  md:self-auto
                "
              >
                Talk with Bivi

                <ArrowRight
                  size={16}
                  strokeWidth={2}
                  className="
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Principle row                                                             */
/* -------------------------------------------------------------------------- */

interface PrincipleRowProps {
  number: string;
  title: string;
  description: string;
  last?: boolean;
}

function PrincipleRow({
  number,
  title,
  description,
  last = false,
}: PrincipleRowProps) {
  return (
    <div
      className={`
        grid
        gap-4
        p-6
        sm:grid-cols-[52px_150px_1fr]
        sm:items-start
        sm:p-7
        ${
          !last
            ? 'border-b border-border'
            : ''
        }
      `}
    >
      <span
        className="
          font-mono
          text-[10px]
          font-semibold
          tracking-[0.14em]
          text-primary
        "
      >
        {number}
      </span>

      <h3
        className="
          text-base
          font-semibold
          tracking-[-0.02em]
          text-foreground
        "
      >
        {title}
      </h3>

      <p
        className="
          text-sm
          leading-6
          text-muted-foreground
        "
      >
        {description}
      </p>
    </div>
  );
}