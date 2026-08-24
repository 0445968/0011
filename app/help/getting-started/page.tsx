import Link from 'next/link';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  FolderOpen,
  MessageSquareText,
  Rocket,
  Search,
} from 'lucide-react';

const gettingStartedTopics = [
  {
    title: 'Understand the process',
    description:
      'Learn how a Bivi project typically moves from discovery and strategy through design, delivery, and launch.',
    href: '/help/working-together',
    icon: Rocket,
  },
  {
    title: 'Explore services',
    description:
      'See which services may fit your project, from brand strategy and identity to design and digital execution.',
    href: '/services',
    icon: Search,
  },
  {
    title: 'Plan your scope',
    description:
      'Get clearer on what you need, what can be phased, and what information is useful before reaching out.',
    href: '/help/working-together',
    icon: FolderOpen,
  },
  {
    title: 'Understand pricing',
    description:
      'Learn how scope, complexity, timeline, and deliverables can affect project investment.',
    href: '/help/faq',
    icon: CircleDollarSign,
  },
  {
    title: 'Prepare for kickoff',
    description:
      'Understand what materials, decisions, references, and stakeholder input can help a project start smoothly.',
    href: '/help/working-together',
    icon: CheckCircle2,
  },
  {
    title: 'Start a conversation',
    description:
      'Request a demo or appointment when you are ready to discuss a specific project, challenge, or opportunity.',
    href: '/help/contact',
    icon: MessageSquareText,
  },
];

const quickAnswers = [
  {
    question: 'What should I prepare before reaching out?',
    answer:
      'A clear project goal, any known timeline or budget constraints, examples or references, and a short description of what is not working today are usually enough to begin.',
  },
  {
    question: 'Do I need a complete brief?',
    answer:
      'No. A polished brief is helpful but not required. Early conversations can help clarify scope, priorities, and the right starting point.',
  },
  {
    question: 'Can a project be split into phases?',
    answer:
      'Yes. Larger engagements can often be structured into phases so strategy, identity, design, and implementation happen in a logical sequence.',
  },
  {
    question: 'What if I am not sure which service I need?',
    answer:
      'Start with the problem you are trying to solve rather than the service name. The project can be shaped around the outcome you need.',
  },
];

export default function GettingStartedPage() {
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
              Getting Started
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
              Start with clarity.
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
              Learn what to expect before
              beginning a project, how to
              prepare, and where to find
              answers about scope, process,
              timing, pricing, and next
              steps.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Quick overview                                               */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          border-b
          border-border
          py-8
        "
      >
        <div className="container-page">
          <div
            className="
              grid
              gap-5
              sm:grid-cols-3
            "
          >
            <OverviewItem
              icon={FileText}
              title="No formal brief required"
              description="A clear problem and goal are enough to start."
            />

            <OverviewItem
              icon={Clock3}
              title="Projects can be phased"
              description="Scope can be structured around priorities and timing."
            />

            <OverviewItem
              icon={MessageSquareText}
              title="Start with a conversation"
              description="You do not need every detail figured out first."
            />
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
              Before you begin
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
              Everything you need to
              get oriented.
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Use these topics to find the
              right information before
              starting a new project or
              reaching out.
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
            {gettingStartedTopics.map(
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
      {/* Quick answers                                                */}
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
              Quick answers
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
              Common questions before
              starting.
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
              These are some of the most
              useful things to understand
              before beginning a project.
            </p>

            <Link
              href="/help/faq"
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
              Browse all FAQs

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

          <div
            className="
              overflow-hidden
              rounded-3xl
              border
              border-border
              bg-card
            "
          >
            {quickAnswers.map(
              (item, index) => (
                <div
                  key={item.question}
                  className={`
                    p-6
                    sm:p-7
                    ${
                      index !== 0
                        ? 'border-t border-border'
                        : ''
                    }
                  `}
                >
                  <h3
                    className="
                      text-base
                      font-semibold
                      tracking-[-0.02em]
                      text-foreground
                    "
                  >
                    {item.question}
                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-muted-foreground
                    "
                  >
                    {item.answer}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Final CTA                                                    */}
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
                  Ready to talk?
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
                  Tell us what you’re
                  working on.
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
                  You do not need a
                  finished brief. Share
                  what you know, what you
                  are trying to solve, and
                  where you need help.
                </p>
              </div>

              <Link
                href="/help/contact"
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
                Contact Bivi

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
/* Overview item                                                              */
/* -------------------------------------------------------------------------- */

interface OverviewItemProps {
  icon: typeof FileText;
  title: string;
  description: string;
}

function OverviewItem({
  icon: Icon,
  title,
  description,
}: OverviewItemProps) {
  return (
    <div
      className="
        flex
        items-start
        gap-4
        rounded-2xl
        border
        border-border
        bg-card
        p-5
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
        <Icon
          size={17}
          strokeWidth={2}
        />
      </div>

      <div>
        <h2
          className="
            text-sm
            font-semibold
            text-foreground
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-1
            text-xs
            leading-5
            text-muted-foreground
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}