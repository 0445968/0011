import Link from 'next/link';

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  FileText,
  Wrench,
} from 'lucide-react';

import {
  resources,
} from '@/data/resources';

const resourceSections = [
  {
    title: 'Guides',
    description:
      'Practical, in-depth resources for working through brand, design, and business decisions.',
    href: '/help/guides',
    icon: BookOpen,
  },
  {
    title: 'Articles',
    description:
      'Ideas, perspectives, and useful thinking from the Design Blade Journal.',
    href: '/help/articles',
    icon: FileText,
  },
  {
    title: 'Free tools',
    description:
      'Interactive tools and assessments for turning ideas into clearer decisions.',
    href: '/help/tools',
    icon: Wrench,
  },
];

export default function HelpResourcesPage() {
  const featuredResources =
    resources.slice(0, 6);

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
              Resources
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
              Learn, explore, and
              put ideas into practice.
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
              Browse Design Blade guides,
              articles, tools, and
              practical resources from
              one place.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Resource types                                               */}
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
              Browse by format
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
              Find the right kind of
              resource.
            </h2>
          </div>

          <div
            className="
              mt-10
              grid
              gap-5
              md:grid-cols-3
            "
          >
            {resourceSections.map(
              (section) => {
                const Icon =
                  section.icon;

                return (
                  <Link
                    key={section.title}
                    href={section.href}
                    className="
                      group
                      flex
                      min-h-[280px]
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
                        mt-8
                        text-xl
                        font-semibold
                        tracking-[-0.025em]
                        text-foreground
                      "
                    >
                      {section.title}
                    </h3>

                    <p
                      className="
                        mt-3
                        text-sm
                        leading-6
                        text-muted-foreground
                      "
                    >
                      {
                        section.description
                      }
                    </p>

                    <span
                      className="
                        mt-auto
                        pt-6
                        text-sm
                        font-semibold
                        text-primary
                      "
                    >
                      Browse{' '}
                      {section.title.toLowerCase()}
                    </span>
                  </Link>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Featured resources                                          */}
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
                Resource Library
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
                Explore resources
              </h2>
            </div>

            <Link
              href="/resources"
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
              Full Resource Library

              <ArrowUpRight
                size={14}
                strokeWidth={2}
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
              />
            </Link>
          </div>

          {featuredResources.length >
          0 ? (
            <div
              className="
                mt-10
                grid
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {featuredResources.map(
                (resource) => (
                  <Link
                    key={resource.id}
                    href={resource.href}
                    className="
                      group
                      flex
                      min-h-[230px]
                      flex-col
                      rounded-3xl
                      border
                      border-border
                      bg-background
                      p-6
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-primary/35
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                      "
                    >
                      <span
                        className="
                          rounded-full
                          bg-[#BBFF1B]
                          px-2.5
                          py-1
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-black
                        "
                      >
                        {resource.type}
                      </span>

                      <ArrowUpRight
                        size={16}
                        strokeWidth={2}
                        className="
                          text-muted-foreground
                          transition-transform
                          duration-200
                          group-hover:translate-x-0.5
                          group-hover:-translate-y-0.5
                          group-hover:text-primary
                        "
                      />
                    </div>

                    <h3
                      className="
                        mt-6
                        text-lg
                        font-semibold
                        leading-tight
                        tracking-[-0.025em]
                        text-foreground
                      "
                    >
                      {resource.title}
                    </h3>

                    <p
                      className="
                        mt-3
                        line-clamp-3
                        text-sm
                        leading-6
                        text-muted-foreground
                      "
                    >
                      {
                        resource.description
                      }
                    </p>
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
                px-6
                py-12
                text-center
              "
            >
              <p
                className="
                  text-sm
                  text-muted-foreground
                "
              >
                Resources will appear
                here as they are added
                to the library.
              </p>
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
              flex
              flex-col
              gap-7
              rounded-3xl
              bg-primary
              p-7
              text-white
              sm:p-9
              md:flex-row
              md:items-center
              md:justify-between
              lg:p-10
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
                Looking for an answer?
              </p>

              <h2
                className="
                  mt-3
                  font-serif
                  text-3xl
                  font-semibold
                  tracking-[-0.035em]
                "
              >
                Search the entire
                Help Center.
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
                Search FAQs, articles,
                guides, tools, and
                assessments together.
              </p>
            </div>

            <Link
              href="/help/search"
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
              Search Help Center

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
      </section>
    </main>
  );
}