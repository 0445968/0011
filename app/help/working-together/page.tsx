import Link from 'next/link';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  MessagesSquare,
  PencilRuler,
  Repeat2,
} from 'lucide-react';

const collaborationTopics = [
  {
    title: 'Project scope',
    description:
      'Understand how deliverables, complexity, dependencies, and priorities shape the size of an engagement.',
    href: '/help/faq',
    icon: PencilRuler,
  },
  {
    title: 'Pricing',
    description:
      'Learn what can influence project investment and why pricing can vary between seemingly similar projects.',
    href: '/help/faq',
    icon: CircleDollarSign,
  },
  {
    title: 'Timelines',
    description:
      'See how scope, feedback, approvals, content, and dependencies can affect project schedules.',
    href: '/help/faq',
    icon: Clock3,
  },
  {
    title: 'Feedback',
    description:
      'Learn how clear, consolidated feedback helps projects move faster and keeps design decisions focused.',
    href: '/help/articles',
    icon: MessagesSquare,
  },
  {
    title: 'Revisions',
    description:
      'Understand the difference between refinement, revisions, and changes that may expand the original scope.',
    href: '/help/faq',
    icon: Repeat2,
  },
  {
    title: 'Delivery and handoff',
    description:
      'Learn what happens when a project is approved, including files, documentation, launch support, and next steps.',
    href: '/help/faq',
    icon: FileCheck2,
  },
];

const projectStages = [
  {
    number: '01',
    title: 'Discovery',
    description:
      'Define the problem, goals, context, priorities, constraints, and the decisions the project needs to support.',
  },
  {
    number: '02',
    title: 'Direction',
    description:
      'Establish the strategic and creative direction before moving too far into execution.',
  },
  {
    number: '03',
    title: 'Design',
    description:
      'Develop the selected direction into a cohesive system, experience, or set of deliverables.',
  },
  {
    number: '04',
    title: 'Refinement',
    description:
      'Review, test, refine, and resolve the details needed to make the work ready for real-world use.',
  },
  {
    number: '05',
    title: 'Delivery',
    description:
      'Prepare final assets, documentation, implementation support, or handoff based on the project scope.',
  },
];

const collaborationPrinciples = [
  {
    title: 'One clear point of contact',
    description:
      'A defined decision-maker or primary contact helps prevent conflicting direction and unnecessary delays.',
  },
  {
    title: 'Consolidated feedback',
    description:
      'Combining stakeholder feedback before sending it keeps revisions focused and easier to act on.',
  },
  {
    title: 'Context over preference',
    description:
      'Explaining why something is not working is more useful than giving isolated instructions without context.',
  },
  {
    title: 'Timely approvals',
    description:
      'Projects move best when review windows and approvals happen close to the agreed schedule.',
  },
];

export default function WorkingTogetherPage() {
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
              Working Together
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
              Know what to expect from
              the process.
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
              Learn how projects are
              scoped, organized, reviewed,
              refined, and delivered so
              everyone can make decisions
              with clearer expectations.
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
              Project essentials
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
              How collaboration works
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Explore the practical parts
              of working together, from
              initial scope through final
              delivery.
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
            {collaborationTopics.map(
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
      {/* Process                                                      */}
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
            lg:grid-cols-[0.68fr_1.32fr]
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
              Typical workflow
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
              Projects move from
              uncertainty to resolution.
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
              The exact workflow changes
              with the engagement, but
              most projects follow a
              progression from defining
              the problem to creating and
              delivering the solution.
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
            {projectStages.map(
              (stage, index) => (
                <div
                  key={stage.number}
                  className={`
                    grid
                    gap-4
                    p-6
                    sm:grid-cols-[54px_150px_1fr]
                    sm:items-start
                    sm:p-7
                    ${
                      index !== 0
                        ? 'border-t border-border'
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
                    {stage.number}
                  </span>

                  <h3
                    className="
                      text-base
                      font-semibold
                      tracking-[-0.02em]
                      text-foreground
                    "
                  >
                    {stage.title}
                  </h3>

                  <p
                    className="
                      text-sm
                      leading-6
                      text-muted-foreground
                    "
                  >
                    {stage.description}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Feedback                                                     */}
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
              Better collaboration
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
              What keeps projects moving
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Good collaboration is less
              about having fewer opinions
              and more about turning those
              opinions into clear,
              actionable decisions.
            </p>
          </div>

          <div
            className="
              mt-10
              grid
              gap-5
              md:grid-cols-2
            "
          >
            {collaborationPrinciples.map(
              (principle) => (
                <div
                  key={principle.title}
                  className="
                    rounded-3xl
                    border
                    border-border
                    bg-card
                    p-6
                    sm:p-7
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
                      bg-[#BBFF1B]
                      text-black
                    "
                  >
                    <CheckCircle2
                      size={17}
                      strokeWidth={2}
                    />
                  </div>

                  <h3
                    className="
                      mt-6
                      text-lg
                      font-semibold
                      tracking-[-0.025em]
                      text-foreground
                    "
                  >
                    {principle.title}
                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-muted-foreground
                    "
                  >
                    {
                      principle.description
                    }
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Scope guidance                                               */}
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
            lg:grid-cols-2
            lg:gap-8
          "
        >
          <div
            className="
              rounded-3xl
              border
              border-border
              bg-card
              p-6
              sm:p-8
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
              Inside the agreed scope
            </p>

            <h2
              className="
                mt-3
                font-serif
                text-2xl
                font-semibold
                tracking-[-0.03em]
                text-foreground
              "
            >
              Refinement
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Refinement improves an
              agreed direction: adjusting
              details, strengthening
              hierarchy, resolving
              inconsistencies, or
              responding to feedback
              within the original goal.
            </p>
          </div>

          <div
            className="
              rounded-3xl
              border
              border-border
              bg-card
              p-6
              sm:p-8
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
              Potential scope change
            </p>

            <h2
              className="
                mt-3
                font-serif
                text-2xl
                font-semibold
                tracking-[-0.03em]
                text-foreground
              "
            >
              New direction
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              A new direction introduces
              a different problem,
              deliverable, audience,
              concept, platform, or
              objective that was not part
              of the original project
              definition.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* FAQ shortcut                                                 */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          border-t
          border-border
          py-16
          sm:py-20
        "
      >
        <div className="container-page">
          <div
            className="
              flex
              flex-col
              gap-6
              rounded-3xl
              border
              border-border
              bg-card
              p-6
              sm:p-8
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
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-primary
                "
              >
                Have a specific question?
              </p>

              <h2
                className="
                  mt-2
                  font-serif
                  text-2xl
                  font-semibold
                  tracking-[-0.03em]
                  text-foreground
                "
              >
                Browse project FAQs.
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                Find answers about
                pricing, timelines,
                revisions, communication,
                deliverables, and other
                common project questions.
              </p>
            </div>

            <Link
              href="/help/faq"
              className="
                group
                inline-flex
                min-h-[46px]
                shrink-0
                items-center
                justify-center
                gap-2
                self-start
                rounded-[14px]
                bg-primary
                px-5
                py-3
                text-sm
                font-semibold
                text-primary-foreground
                md:self-auto
              "
            >
              Browse FAQs

              <ArrowRight
                size={15}
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

      {/* ------------------------------------------------------------ */}
      {/* Contact CTA                                                  */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          border-t
          border-border
          pb-20
          pt-4
          sm:pb-24
          lg:pb-28
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
                  Ready to work together?
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
                  Start with the project,
                  not the paperwork.
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
                  Share what you are
                  working on, what you
                  know so far, and what
                  you need help figuring
                  out.
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
                Request appointment

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