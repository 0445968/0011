import Link from 'next/link';

import {
  ArrowLeft,
  ArrowUpRight,
  Beaker,
  Clock3,
  FlaskConical,
  Wrench,
} from 'lucide-react';

import {
  labItems,
} from '@/data/studio-lab/registry';

export default function HelpToolsPage() {
  const activeItems = labItems
    .filter(
      (item) =>
        item.status === 'active'
    )
    .sort((a, b) => {
      if (
        a.featured &&
        !b.featured
      ) {
        return -1;
      }

      if (
        !a.featured &&
        b.featured
      ) {
        return 1;
      }

      return a.title.localeCompare(
        b.title
      );
    });

  const tools = activeItems.filter(
    (item) =>
      item.type === 'tool'
  );

  const assessments =
    activeItems.filter(
      (item) =>
        item.type ===
        'assessment'
    );

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
              Free Tools
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
              Put strategy into
              practice.
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
              Explore practical tools and
              assessments designed to help
              you evaluate your brand,
              clarify decisions, and move
              projects forward.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Overview                                                     */}
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
            <StatItem
              value={
                activeItems.length
              }
              label="Available"
            />

            <StatItem
              value={
                tools.length
              }
              label="Tools"
            />

            <StatItem
              value={
                assessments.length
              }
              label="Assessments"
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Featured / all active items                                  */}
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
                Studio Lab
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
                Explore all tools
              </h2>
            </div>

            <p
              className="
                max-w-md
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              No account or sign-in
              required. Open any active
              tool and start using it
              immediately.
            </p>
          </div>

          {activeItems.length >
          0 ? (
            <div
              className="
                mt-10
                grid
                gap-5
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {activeItems.map(
                (item) => (
                  <ToolCard
                    key={item.id}
                    item={item}
                  />
                )
              )}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Tool category                                                */}
      {/* ------------------------------------------------------------ */}

      {tools.length > 0 && (
        <section
          className="
            border-t
            border-border
            bg-secondary/20
            py-16
            sm:py-20
          "
        >
          <div className="container-page">
            <div
              className="
                max-w-2xl
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
                  bg-primary
                  text-white
                "
              >
                <Wrench
                  size={19}
                  strokeWidth={2}
                />
              </div>

              <h2
                className="
                  mt-5
                  font-serif
                  text-3xl
                  font-semibold
                  tracking-[-0.035em]
                  text-foreground
                "
              >
                Tools
              </h2>

              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                Interactive utilities
                for creating, planning,
                evaluating, and making
                more confident creative
                decisions.
              </p>
            </div>

            <div
              className="
                mt-8
                grid
                gap-4
                md:grid-cols-2
              "
            >
              {tools.map(
                (item) => (
                  <CompactToolCard
                    key={item.id}
                    item={item}
                  />
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------ */}
      {/* Assessments                                                  */}
      {/* ------------------------------------------------------------ */}

      {assessments.length >
        0 && (
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
                max-w-2xl
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
                  bg-[#BBFF1B]
                  text-black
                "
              >
                <FlaskConical
                  size={19}
                  strokeWidth={2}
                />
              </div>

              <h2
                className="
                  mt-5
                  font-serif
                  text-3xl
                  font-semibold
                  tracking-[-0.035em]
                  text-foreground
                "
              >
                Assessments
              </h2>

              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                Structured assessments
                that help you evaluate
                brand clarity,
                readiness, direction,
                and opportunities.
              </p>
            </div>

            <div
              className="
                mt-8
                grid
                gap-4
                md:grid-cols-2
              "
            >
              {assessments.map(
                (item) => (
                  <CompactToolCard
                    key={item.id}
                    item={item}
                  />
                )
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Tool card                                                                  */
/* -------------------------------------------------------------------------- */

interface LabItem {
  id: string;
  title: string;
  description: string;
  href: string;
  type: string;
  status: string;
  featured?: boolean;
  estimatedTime?: string;
}

function ToolCard({
  item,
}: {
  item: LabItem;
}) {
  const isAssessment =
    item.type === 'assessment';

  const Icon = isAssessment
    ? FlaskConical
    : Beaker;

  return (
    <Link
      href={item.href}
      className="
        group
        relative
        flex
        min-h-[330px]
        flex-col
        overflow-hidden
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
        sm:p-7
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-48
          w-48
          rounded-full
          bg-primary/5
          blur-3xl
          transition-transform
          duration-500
          group-hover:scale-125
        "
      />

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

        {item.featured && (
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
            Featured
          </span>
        )}
      </div>

      <div
        className="
          relative
          z-10
          mt-8
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.15em]
            text-primary
          "
        >
          <span>
            {isAssessment
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
                  inline-flex
                  items-center
                  gap-1.5
                  normal-case
                  tracking-normal
                  text-muted-foreground
                "
              >
                <Clock3
                  size={12}
                  strokeWidth={2}
                />

                {item.estimatedTime}
              </span>
            </>
          )}
        </div>

        <h2
          className="
            mt-3
            text-2xl
            font-semibold
            leading-tight
            tracking-[-0.03em]
            text-foreground
          "
        >
          {item.title}
        </h2>

        <p
          className="
            mt-3
            line-clamp-3
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
          relative
          z-10
          mt-auto
          flex
          items-center
          justify-between
          gap-4
          border-t
          border-border
          pt-6
        "
      >
        <span
          className="
            text-sm
            font-semibold
            text-primary
          "
        >
          Open{' '}
          {isAssessment
            ? 'assessment'
            : 'tool'}
        </span>

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
            text-foreground
            transition-all
            duration-300
            group-hover:border-[#BBFF1B]
            group-hover:bg-[#BBFF1B]
            group-hover:text-black
          "
        >
          <ArrowUpRight
            size={16}
            strokeWidth={2}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-0.5
              group-hover:-translate-y-0.5
            "
          />
        </div>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Compact card                                                               */
/* -------------------------------------------------------------------------- */

function CompactToolCard({
  item,
}: {
  item: LabItem;
}) {
  const isAssessment =
    item.type === 'assessment';

  return (
    <Link
      href={item.href}
      className="
        group
        flex
        items-center
        justify-between
        gap-5
        rounded-2xl
        border
        border-border
        bg-background
        p-5
        transition-all
        duration-200
        hover:border-primary/35
        hover:bg-card
      "
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
            {isAssessment
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
                {item.estimatedTime}
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
        <ArrowUpRight
          size={15}
          strokeWidth={2}
        />
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat                                                                        */
/* -------------------------------------------------------------------------- */

function StatItem({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        rounded-2xl
        border
        border-border
        bg-card
        px-5
        py-4
      "
    >
      <span
        className="
          text-sm
          font-medium
          text-muted-foreground
        "
      >
        {label}
      </span>

      <span
        className="
          font-serif
          text-2xl
          font-semibold
          tracking-[-0.04em]
          text-foreground
        "
      >
        {value}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState() {
  return (
    <div
      className="
        mt-10
        rounded-3xl
        border
        border-border
        bg-card
        px-6
        py-16
        text-center
      "
    >
      <Beaker
        size={32}
        strokeWidth={1.7}
        className="
          mx-auto
          text-primary
        "
      />

      <h2
        className="
          mt-5
          text-xl
          font-semibold
          text-foreground
        "
      >
        No active tools yet.
      </h2>

      <p
        className="
          mx-auto
          mt-2
          max-w-md
          text-sm
          leading-6
          text-muted-foreground
        "
      >
        Active Studio Lab tools and
        assessments will automatically
        appear here when they become
        available.
      </p>
    </div>
  );
}