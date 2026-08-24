'use client';

import Link from 'next/link';

import {
  ArrowLeft,
  ArrowRight,
  Bug,
  CalendarDays,
  CircleHelp,
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
  },
  {
    id: 'feature',
    title: 'Request a feature',
    description:
      'Suggest a new feature, tool, assessment, resource, or improvement you would like to see.',
    href: '/help/contact/feature',
    icon: Lightbulb,
  },
  {
    id: 'demo',
    title: 'Request a demo',
    description:
      'See relevant capabilities, work examples, services, or how Bivi could approach your needs.',
    href: '/help/contact/demo',
    icon: Search,
  },
  {
    id: 'appointment',
    title: 'Request an appointment',
    description:
      'Talk with Bivi about a new project, consultation, or an existing engagement.',
    href: '/help/contact/appointment',
    icon: CalendarDays,
  },
];

const otherOption = {
  id: 'other',
  title: 'Something else',
  description:
    'Have a question or request that does not fit any of the options? Tell us what you need and we’ll point you in the right direction.',
  href: '/help/contact/other',
  icon: CircleHelp,
};

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
          pb-10
          pt-24
          sm:pb-12
          sm:pt-28
          lg:pb-14
          lg:pt-32
        "
      >
        <div className="container-page">

          <div
            className="
              mt-6
              max-w-3xl
            "
          >

            <h1
              className="
                mt-3
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
              We're here for you.
            </h1>

            <p
              className="
                mt-5
                max-w-2xl
                text-base
                leading-7
                text-muted-foreground
                sm:text-lg
                sm:leading-8
              "
            >
              Choose the option that best
              matches your request. We 
              only ask for information that
              is relevant to your needs.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Contact options                                              */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          py-10
          sm:py-12
          lg:py-14
        "
      >
        <div className="container-page">
          <div
            className="
              grid
              gap-4
              md:grid-cols-2
              xl:grid-cols-3
              xl:grid-rows-2
            "
          >
            {/* ------------------------------------------------------ */}
            {/* Regular cards                                          */}
            {/* ------------------------------------------------------ */}

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
                      min-h-[200px]
                      flex-col
                      overflow-hidden
                      rounded-2xl
                      border
                      border-border
                      bg-card
                      p-5
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-primary/40
                      hover:shadow-[0_14px_40px_rgba(0,0,0,0.07)]
                      sm:p-6
                    "
                  >
                    {/* Decorative accent */}

                    <div
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        -right-14
                        -top-14
                        h-32
                        w-32
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
                        gap-4
                      "
                    >
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          bg-primary
                          text-white
                        "
                      >
                        <Icon
                          size={18}
                          strokeWidth={2}
                        />
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

                    {/* Content */}

                    <div
                      className="
                        relative
                        z-10
                        mt-auto
                        pt-6
                      "
                    >
                      <h2
                        className="
                          font-heading
                          text-xl
                          font-semibold
                          tracking-[-0.025em]
                          text-foreground
                        "
                      >
                        {option.title}
                      </h2>

                      <p
                        className="
                          mt-2
                          max-w-xl
                          text-sm
                          leading-6
                          text-muted-foreground
                        "
                      >
                        {option.description}
                      </p>
                    </div>
                  </Link>
                );
              }
            )}

            {/* ------------------------------------------------------ */}
            {/* Something else                                         */}
            {/* ------------------------------------------------------ */}

            <SomethingElseCard />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Supporting information                                      */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          border-t
          border-border
          bg-secondary/20
          py-10
          sm:py-12
        "
      >
        <div className="container-page">
          <div
            className="
              grid
              gap-7
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
                before contacting Bivi.
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

/* -------------------------------------------------------------------------- */
/* Something else                                                             */
/* -------------------------------------------------------------------------- */

function SomethingElseCard() {
  const Icon =
    otherOption.icon;

  return (
    <Link
      href={otherOption.href}
      className="
        group
        relative
        flex
        min-h-[200px]
        flex-col
        overflow-hidden
        rounded-2xl
        bg-[#0B65F3]
        p-5
        text-white
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_18px_55px_rgba(11,101,243,0.22)]
        sm:p-6
        md:col-span-2
        xl:col-span-1
        xl:col-start-3
        xl:row-span-2
        xl:row-start-1
      "
    >
      {/* Glow */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-56
          w-56
          rounded-full
          bg-white/15
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
          gap-4
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-white/15
            text-white
            backdrop-blur-sm
          "
        >
          <Icon
            size={18}
            strokeWidth={2}
          />
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
            bg-white
            text-black
            transition-all
            duration-300
            group-hover:bg-[#BBFF1B]
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

      {/* Content */}

      <div
        className="
          relative
          z-10
          mt-auto
          max-w-sm
          pt-10
        "
      >
        <p
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-white/65
          "
        >
          General inquiry
        </p>

        <h2
          className="
            mt-2
            font-heading
            text-2xl
            font-semibold
            tracking-[-0.03em]
            text-white
            sm:text-3xl
          "
        >
          {otherOption.title}
        </h2>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-white/75
          "
        >
          {otherOption.description}
        </p>
      </div>
    </Link>
  );
}