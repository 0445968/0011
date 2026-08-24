import Link from 'next/link';

import {
  ArrowLeft,
  ArrowRight,
  Compass,
  FileText,
  Lightbulb,
  MessageSquareText,
  RefreshCw,
  Search,
  Target,
  Users,
} from 'lucide-react';

import {
  resources,
} from '@/data/resources';

import {
  labItems,
} from '@/data/studio-lab/registry';

const strategyTopics = [
  {
    title: 'Positioning',
    description:
      'Clarify where your brand fits in the market, who it is for, and why people should choose it over alternatives.',
    href: '/help/articles',
    icon: Target,
  },
  {
    title: 'Messaging',
    description:
      'Turn your strategy into language that is clear, memorable, differentiated, and useful across channels.',
    href: '/help/articles',
    icon: MessageSquareText,
  },
  {
    title: 'Audience',
    description:
      'Understand who you are trying to reach, what matters to them, and how that should influence your brand decisions.',
    href: '/help/articles',
    icon: Users,
  },
  {
    title: 'Differentiation',
    description:
      'Identify the meaningful differences that help your brand stand out without relying on generic claims.',
    href: '/help/articles',
    icon: Compass,
  },
  {
    title: 'Rebranding',
    description:
      'Learn when a rebrand may be useful, what should change, and what should remain familiar.',
    href: '/help/articles',
    icon: RefreshCw,
  },
  {
    title: 'Brand direction',
    description:
      'Connect business goals, brand strategy, creative direction, and execution into one coherent foundation.',
    href: '/help/guides',
    icon: Lightbulb,
  },
];

export default function BrandStrategyHelpPage() {
  const strategyResources = resources
    .filter((resource) => {
      const searchable = `
        ${resource.title}
        ${resource.description}
        ${resource.category ?? ''}
      `.toLowerCase();

      return (
        searchable.includes('brand') ||
        searchable.includes('strategy') ||
        searchable.includes('position') ||
        searchable.includes('message')
      );
    })
    .slice(0, 4);

  const strategyTools = labItems
    .filter((item) => {
      if (item.status !== 'active') {
        return false;
      }

      const searchable = `
        ${item.title}
        ${item.description}
      `.toLowerCase();

      return (
        searchable.includes('brand') ||
        searchable.includes('position') ||
        searchable.includes('clarity') ||
        searchable.includes('personality') ||
        searchable.includes('rebrand')
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
              Brand Strategy
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
              Build the thinking behind
              the brand.
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
              Explore positioning,
              messaging, audience,
              differentiation, rebranding,
              and the strategic decisions
              that give creative work a
              clear direction.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Strategy topics                                              */}
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
              Explore the fundamentals
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
              Brand strategy topics
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Start with the strategic
              question you are trying to
              answer, then explore related
              resources and tools.
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
            {strategyTopics.map(
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
      {/* Resources                                                    */}
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

          {strategyResources.length >
          0 ? (
            <div
              className="
                mt-10
                grid
                gap-4
                md:grid-cols-2
              "
            >
              {strategyResources.map(
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
                      bg-background
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
                      <FileText
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
                bg-background
                p-8
                text-sm
                text-muted-foreground
              "
            >
              Brand strategy resources
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
          py-16
          sm:py-20
          lg:py-24
        "
      >
        <div className="container-page">
          <div
            className="
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
                Put it into practice
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
                Strategy tools and
                assessments
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
                Use Studio Lab tools to
                explore brand clarity,
                positioning, personality,
                readiness, and other
                strategic questions.
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

            {strategyTools.length >
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
                {strategyTools.map(
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
                          min-w-0
                        "
                      >
                        <div
                          className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
                          "
                        >
                          <span
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
                          </span>

                          {item.estimatedTime && (
                            <>
                              <span
                                aria-hidden="true"
                                className="
                                  h-1
                                  w-1
                                  rounded-full
                                  bg-muted-foreground/35
                                "
                              />

                              <span
                                className="
                                  text-[11px]
                                  text-muted-foreground
                                "
                              >
                                {
                                  item.estimatedTime
                                }
                              </span>
                            </>
                          )}
                        </div>

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

                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-border
                          text-muted-foreground
                          transition-all
                          duration-200
                          group-hover:border-[#BBFF1B]
                          group-hover:bg-[#BBFF1B]
                          group-hover:text-black
                        "
                      >
                        <ArrowRight
                          size={15}
                          strokeWidth={2}
                        />
                      </div>
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
                Relevant Studio Lab
                tools will appear here
                as active items are
                added.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Final CTA                                                    */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          border-t
          border-border
          pb-20
          pt-16
          sm:pb-24
          sm:pt-20
          lg:pb-28
        "
      >
        <div className="container-page">
          <div
            className="
              relative
              overflow-hidden
              rounded-3xl
              bg-primary
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
                  Need strategic direction?
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
                  Turn uncertainty into a
                  clearer direction.
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
                  If the challenge goes
                  beyond a quick answer,
                  tell Bivi what
                  you are trying to solve
                  and where your brand
                  feels unclear.
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