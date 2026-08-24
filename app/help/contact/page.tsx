'use client';

import Link from 'next/link';

import {
  ArrowLeft,
  ArrowRight,
  Bug,
  CalendarDays,
  Lightbulb,
  Search,
} from 'lucide-react';

const contactOptions = [
  {
    id: 'bug',
    title: 'Report a bug',
    description:
      'Something on the Bivi website, one of our tools, or a resource is not working as expected.',
    href: '/help/contact/bug',
    icon: Bug,
    detail:
      'Share what happened, where you found it, and what you expected to happen instead.',
  },
  {
    id: 'feature',
    title: 'Request a feature',
    description:
      'Suggest a new feature, tool, assessment, resource, or improvement you would like to see.',
    href: '/help/contact/feature',
    icon: Lightbulb,
    detail:
      'Tell us what you would like to add and what problem it would help solve.',
  },
  {
    id: 'demo',
    title: 'Request a demo',
    description:
      'See relevant capabilities, work examples, services, or how Bivi could approach your needs.',
    href: '/help/contact/demo',
    icon: Search,
    detail:
      'Best for exploring capabilities before deciding whether to start a project.',
  },
  {
    id: 'appointment',
    title: 'Request an appointment',
    description:
      'Talk with Bivi about a new project, consultation, or an existing engagement.',
    href: '/help/contact/appointment',
    icon: CalendarDays,
    detail:
      'Share a little about what you need so we can make the conversation useful from the start.',
  },
];

export default function HelpContactPage() {
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
              Contact Bivi
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
              What can we help you with?
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
              Choose the option that best
              matches your request. We&apos;ll
              take you to a focused form and
              only ask for information that
              is relevant to what you need.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Contact options                                              */}
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
              grid
              gap-5
              md:grid-cols-2
            "
          >
            {contactOptions.map(
              (option) => {
                const Icon =
                  option.icon;

                return (
                  <Link
                    key={option.id}
                    href={option.href}
                    className="
                      group
                      relative
                      flex
                      min-h-[320px]
                      flex-col
                      overflow-hidden
                      rounded-3xl
                      border
                      border-border
                      bg-card
                      p-7
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-primary/40
                      hover:shadow-[0_18px_60px_rgba(0,0,0,0.08)]
                      sm:p-8
                    "
                  >
                    {/* Decorative accent */}

                    <div
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        -right-16
                        -top-16
                        h-40
                        w-40
                        rounded-full
                        bg-primary/5
                        blur-3xl
                        transition-transform
                        duration-500
                        group-hover:scale-125
                      "
                    />

                    {/* Top */}

                    <div
                      className="
                        relative
                        z-10
                        flex
                        items-start
                        justify-between
                        gap-5
                      "
                    >
                      <div
                        className="
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-2xl
                          bg-primary
                          text-white
                        "
                      >
                        <Icon
                          size={21}
                          strokeWidth={2}
                        />
                      </div>

                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
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
                          size={16}
                          strokeWidth={2}
                          className="
                            transition-transform
                            duration-300
                            group-hover:translate-x-1
                          "
                        />
                      </div>
                    </div>

                    {/* Content */}

                    <div
                      className="
                        relative
                        z-10
                        mt-9
                      "
                    >
                      <h2
                        className="
                          font-heading
                          text-2xl
                          font-semibold
                          tracking-[-0.025em]
                          text-foreground
                        "
                      >
                        {option.title}
                      </h2>

                      <p
                        className="
                          mt-3
                          max-w-xl
                          text-sm
                          leading-6
                          text-muted-foreground
                          sm:text-[15px]
                          sm:leading-7
                        "
                      >
                        {option.description}
                      </p>
                    </div>

                    {/* Footer */}

                    <div
                      className="
                        relative
                        z-10
                        mt-auto
                        border-t
                        border-border
                        pt-6
                      "
                    >
                      <p
                        className="
                          text-xs
                          leading-5
                          text-muted-foreground
                        "
                      >
                        {option.detail}
                      </p>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Supporting information                                       */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          border-t
          border-border
          bg-secondary/20
          py-14
          sm:py-16
        "
      >
        <div className="container-page">
          <div
            className="
              grid
              gap-8
              md:grid-cols-3
              md:gap-10
            "
          >
            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                No account required
              </p>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                You do not need to sign
                in or create an account
                before contacting
                Bivi.
              </p>
            </div>

            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                Focused forms
              </p>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                Each request type has
                different questions so
                you do not have to fill
                out irrelevant fields.
              </p>
            </div>

            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                Prefer self-service?
              </p>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                Browse FAQs, guides,
                articles, and free tools
                from the Help Center
                before submitting a
                request.
              </p>

              <Link
                href="/help"
                className="
                  group
                  mt-3
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-primary
                "
              >
                Browse Help Center

                <ArrowRight
                  size={14}
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