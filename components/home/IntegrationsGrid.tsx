import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowUpRight,
} from 'lucide-react';

import {
  stacks,
} from '@/data/stacks';

type StackItem =
  (typeof stacks)[number];

function BrandIcon({
  path,
  logo,
  hex,
  name,
  monogram,
}: {
  path?: string;
  logo?: string;
  hex: string;
  name: string;
  monogram?: string;
}) {
  if (logo) {
    return (
      <div
        className="
          relative
          h-6
          w-6
        "
      >
        <Image
          src={logo}
          alt={`${name} logo`}
          fill
          sizes="24px"
          className="
            object-contain
            transition-transform
            duration-300
            group-hover:scale-110
          "
        />
      </div>
    );
  }

  if (path) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="
          h-6
          w-6
          transition-transform
          duration-300
          group-hover:scale-110
        "
        fill={`#${hex}`}
      >
        <path d={path} />
      </svg>
    );
  }

  return (
    <span
      className="
        flex
        h-7
        w-7
        items-center
        justify-center
        rounded-md
        text-[9px]
        font-bold
      "
      style={{
        backgroundColor:
          `#${hex}18`,
        color:
          `#${hex}`,
      }}
    >
      {monogram ??
        name
          .slice(
            0,
            2
          )
          .toUpperCase()}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

const featuredIntegrationSlugs = [
  'figma',
  'webflow',
  'shopify',
  'notion',
  'slack',
  'github',
  'affinitydesigner',
  'adobeillustrator',
  'wordpress',
  'adobe-creative-cloud',
  'mailchimp',
  'hubspot',
  'stripe',  
  'google-workspace',
];

/*
 * Resolve preferred integrations.
 * Any slug that doesn't exist in stacks
 * is safely skipped.
 */

const preferredIntegrations =
  featuredIntegrationSlugs
    .map((slug) =>
      stacks.find(
        (tool) =>
          tool.slug === slug
      )
    )
    .filter(
      (
        tool
      ): tool is StackItem =>
        Boolean(tool)
    );

/*
 * Fill any missing preferred integrations
 * with other available integrations.
 */

const fallbackIntegrations =
  stacks.filter(
    (tool) =>
      !preferredIntegrations.some(
        (featured) =>
          featured.slug ===
          tool.slug
      )
  );

/*
 * Keep 13 total featured integrations
 * for tablet / desktop.
 */

const featuredIntegrations = [
  ...preferredIntegrations,
  ...fallbackIntegrations,
].slice(0, 13);

/*
 * Mobile always gets the first 10
 * available integrations.
 */

const mobileFeaturedIntegrations =
  featuredIntegrations.slice(
    0,
    10
  );

/* -------------------------------------------------------------------------- */
/* Grid tile                                                                  */
/* -------------------------------------------------------------------------- */

function IntegrationTile({
  tool,
  showRightDivider,
  showBottomDivider,
  compact = false,
}: {
  tool: StackItem;
  showRightDivider: boolean;
  showBottomDivider: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`
        group
        relative
        flex
        items-center
        transition-colors
        duration-200
        hover:bg-muted/40

        ${
          compact
            ? `
              min-h-[92px]
              gap-2.5
              px-3
              py-4
            `
            : `
              min-h-[124px]
              gap-3
              px-5
              py-5
              lg:px-6
            `
        }
      `}
    >
      {/* Faded vertical divider */}

      {showRightDivider && (
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-0
            right-0
            top-0
            w-px
            bg-gradient-to-b
            from-transparent
            via-border
            to-transparent
          "
        />
      )}

      {/* Faded horizontal divider */}

      {showBottomDivider && (
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-0
            left-0
            right-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-border
            to-transparent
          "
        />
      )}

      <span
        className={`
          flex
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-muted

          ${
            compact
              ? `
                h-9
                w-9
              `
              : `
                h-10
                w-10
              `
          }
        `}
      >
        <BrandIcon
          path={
            tool.path
          }
          logo={
            tool.logo
          }
          hex={
            tool.hex
          }
          name={
            tool.name
          }
          monogram={
            tool.monogram
          }
        />
      </span>

      <div
        className="
          min-w-0
        "
      >
        <p
          className={`
            truncate
            font-medium
            leading-tight
            text-foreground

            ${
              compact
                ? 'text-[13px]'
                : 'text-[15px]'
            }
          `}
        >
          {tool.name}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Responsive desktop/tablet grid                                             */
/* -------------------------------------------------------------------------- */

function ResponsiveGrid({
  items,
  columns,
  remainingCount,
}: {
  items: StackItem[];
  columns: number;
  remainingCount: number;
}) {
  /*
   * The CTA fills however many columns remain
   * in the final row.
   *
   * 3 cols:
   * 13 items + CTA span 2 = 15
   *
   * 4 cols:
   * 13 items + CTA span 3 = 16
   *
   * 5 cols:
   * 13 items + CTA span 2 = 15
   */

  const remainder =
    items.length %
    columns;

  const ctaSpan =
    remainder === 0
      ? columns
      : columns -
        remainder;

  const totalUnits =
    items.length +
    ctaSpan;

  const totalRows =
    Math.ceil(
      totalUnits /
        columns
    );

  return (
    <div
      className="
        relative
        grid
      "
      style={{
        gridTemplateColumns:
          `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {items.map(
        (
          tool,
          index
        ) => {
          const columnIndex =
            index %
            columns;

          const rowIndex =
            Math.floor(
              index /
                columns
            );

          const isLastColumn =
            columnIndex ===
            columns - 1;

          const isLastRow =
            rowIndex ===
            totalRows - 1;

          return (
            <IntegrationTile
              key={
                tool.slug
              }
              tool={
                tool
              }
              showRightDivider={
                !isLastColumn
              }
              showBottomDivider={
                !isLastRow
              }
            />
          );
        }
      )}

      {/* CTA fills rest of final row */}

      <Link
        href="/integrations"
        className="
          group
          relative
          flex
          min-h-[124px]
          items-center
          justify-between
          gap-5
          px-6
          py-5
          transition-colors
          duration-200
          hover:bg-muted/40
          lg:px-8
        "
        style={{
          gridColumn:
            `span ${ctaSpan} / span ${ctaSpan}`,
        }}
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-4
          "
        >
          <span
            className="
              shrink-0
              font-heading
              text-3xl
              font-semibold
              tracking-[-0.04em]
              text-foreground
              lg:text-4xl
            "
          >
            {remainingCount}+
          </span>

          <span
            className="
              max-w-[190px]
              text-xs
              leading-5
              text-muted-foreground
              lg:text-sm
              
            "
          >
            more tools across
            the Bivi ecosystem
          </span>
        </div>

      </Link>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main section                                                               */
/* -------------------------------------------------------------------------- */

export function IntegrationsGrid() {
  const remainingCount =
    Math.max(
      stacks.length -
        featuredIntegrations.length,
      0
    );

  const mobileRemainingCount =
    Math.max(
      stacks.length -
        mobileFeaturedIntegrations.length,
      0
    );

  return (
    <section
      className="
        bg-background
        px-5
        pb-20
        pt-8
        sm:px-6
        sm:pb-24
        sm:pt-10
        lg:px-8
        lg:pb-28
        lg:pt-12
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
        "
      >
        {/* Header */}

        <div
          className="
            mx-auto
            max-w-4xl
            text-center
          "
        >
          <h2
            style={{
              lineHeight:
                1.15,
            }}
            className="
              text-balance
              font-heading
              text-[2.2rem]
              font-semibold
              tracking-[-0.035em]
              text-foreground
              sm:text-4xl
              lg:text-5xl
            "
          >
            We adapt to the tools
            <br />
            your business already uses
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-sm
              leading-6
              text-muted-foreground
              sm:text-base
              sm:leading-7
            "
          >
            From design and development
            to marketing and collaboration,
            Bivi works within the tools
            that keep your business moving.
          </p>
        </div>

        {/* Integrations */}

        <div
          className="
            mx-auto
            mt-12
            max-w-6xl
            sm:mt-16
          "
        >
          {/* ============================================================ */}
          {/* Mobile — 2 columns                                          */}
          {/* ============================================================ */}

          <div
            className="
              relative
              sm:hidden
            "
          >
            {/* Side fades */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-y-0
                left-0
                z-20
                w-6
                bg-gradient-to-r
                from-background
                to-transparent
              "
            />

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-y-0
                right-0
                z-20
                w-6
                bg-gradient-to-l
                from-background
                to-transparent
              "
            />

            <div
              className="
                grid
                grid-cols-2
              "
            >
              {mobileFeaturedIntegrations.map(
                (
                  tool,
                  index
                ) => {
                  const columnIndex =
                    index %
                    2;

                  const rowIndex =
                    Math.floor(
                      index /
                        2
                    );

                  const totalRows =
                    Math.ceil(
                      mobileFeaturedIntegrations.length /
                        2
                    );

                  const isLastColumn =
                    columnIndex ===
                    1;

                  const isLastRow =
                    rowIndex ===
                    totalRows -
                      1;

                  return (
                    <IntegrationTile
                      key={
                        tool.slug
                      }
                      tool={
                        tool
                      }
                      compact
                      showRightDivider={
                        !isLastColumn
                      }
                      showBottomDivider={
                        !isLastRow
                      }
                    />
                  );
                }
              )}
            </div>

            {/* Mobile CTA */}

            <Link
              href="/integrations"
              className="
                group
                relative
                flex
                min-h-[94px]
                w-full
                items-center
                justify-between
                gap-4
                px-4
                py-4
                transition-colors
                duration-200
                active:bg-muted/40
              "
            >
              {/* Divider above CTA */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-x-0
                  top-0
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  via-border
                  to-transparent
                "
              />

              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    shrink-0
                    font-heading
                    text-2xl
                    font-semibold
                    tracking-[-0.04em]
                    text-foreground
                  "
                >
                  {
                    mobileRemainingCount
                  }
                  +
                </span>

                <span
                  className="
                    min-w-0
                    text-[11px]
                    leading-4
                    text-muted-foreground
                  "
                >
                  more tools across
                  the Bivi ecosystem
                </span>
              </div>

              
            </Link>
          </div>

          {/* ============================================================ */}
          {/* Small screens — 3 columns                                   */}
          {/* 640px to 767px                                              */}
          {/* ============================================================ */}

          <div
            className="
              hidden
              sm:block
              md:hidden
            "
          >
            <ResponsiveGrid
              items={
                featuredIntegrations
              }
              columns={
                3
              }
              remainingCount={
                remainingCount
              }
            />
          </div>

          {/* ============================================================ */}
          {/* Medium screens — 4 columns                                  */}
          {/* 768px to 1023px                                             */}
          {/* ============================================================ */}

          <div
            className="
              hidden
              md:block
              lg:hidden
            "
          >
            <ResponsiveGrid
              items={
                featuredIntegrations
              }
              columns={
                4
              }
              remainingCount={
                remainingCount
              }
            />
          </div>

          {/* ============================================================ */}
          {/* Large screens — 5 columns                                   */}
          {/* 1024px+                                                     */}
          {/* ============================================================ */}

          <div
            className="
              hidden
              lg:block
            "
          >
            <ResponsiveGrid
              items={
                featuredIntegrations
              }
              columns={
                5
              }
              remainingCount={
                remainingCount
              }
            />
          </div>

{/* Bottom link */}

<div
  className="
    mt-2
    flex
    justify-center
    sm:mt-3
  "
>
  <Link
    href="/integrations"
    className="
      group
      inline-flex
      items-center
      gap-2
      rounded-[14px]
      bg-muted
      px-5
      py-3
      font-mono
      text-[15px]
      font-bold
      tracking-[0.06em]
      text-foreground
      transition-colors
      duration-200
      hover:bg-muted/70
    "
  >
    Explore all integrations

    <ArrowUpRight
      className="
        h-4
        w-4
        shrink-0
      "
      strokeWidth={2}
    />
  </Link>
</div>
        </div>
      </div>
    </section>
  );
}