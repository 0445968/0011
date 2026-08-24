import Link from 'next/link';

import {
  ArrowLeft,
} from 'lucide-react';

import {
  labItems,
} from '@/data/studio-lab/registry';

import {
  FeaturedTools,
} from './FeaturedTools';

import {
  ToolsDirectory,
} from './ToolsDirectory';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface LabItem {
  id: string;
  title: string;
  description: string;
  href: string;
  type: string;
  status: string;
  featured?: boolean;
  estimatedTime?: string;
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

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

  /* ------------------------------------------------------------------------ */
  /* Featured                                                                */
  /* ------------------------------------------------------------------------ */

  const featuredItems =
    activeItems.slice(0, 8);

  /* ------------------------------------------------------------------------ */
  /* Categories                                                              */
  /* ------------------------------------------------------------------------ */

  const tools = activeItems
    .filter(
      (item) =>
        item.type === 'tool'
    )
    .sort((a, b) =>
      a.title.localeCompare(
        b.title
      )
    );

  const assessments =
    activeItems
      .filter(
        (item) =>
          item.type ===
          'assessment'
      )
      .sort((a, b) =>
        a.title.localeCompare(
          b.title
        )
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
          py-7
        "
      >
        <div className="container-page">
          <div
            className="
              grid
              gap-4
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
      {/* Featured                                                     */}
      {/* ------------------------------------------------------------ */}

      <FeaturedTools
        items={featuredItems}
      />

      {/* ------------------------------------------------------------ */}
      {/* Directory                                                    */}
      {/* ------------------------------------------------------------ */}

      <ToolsDirectory
        tools={tools}
        assessments={
          assessments
        }
      />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat                                                                       */
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
        rounded-xl
        border
        border-border
        bg-card
        px-5
        py-3.5
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
          text-xl
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