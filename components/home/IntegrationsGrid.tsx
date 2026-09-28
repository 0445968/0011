import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowUpRight,
} from 'lucide-react';

import {
  stacks,
} from '@/data/stacks';

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
        backgroundColor: `#${hex}18`,
        color: `#${hex}`,
      }}
    >
      {
        monogram ??
        name
          .slice(0, 2)
          .toUpperCase()
      }
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Integration sets                                                           */
/* -------------------------------------------------------------------------- */

const featuredIntegrations =
  stacks.slice(0, 13);

const mobileFeaturedIntegrations =
  featuredIntegrations.slice(
    0,
    10
  );

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
                '1.15',
            }}
            className="
              text-balance
              font-heading
              text-3xl
              font-semibold
              tracking-[-0.04em]
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

        {/* Integrations area */}

        <div
          className="
            mx-auto
            mt-12
            max-w-6xl
            sm:mt-16
          "
        >
{/* ============================================================ */}
{/* Mobile                                                       */}
{/* ============================================================ */}

<div
  className="
    relative
    sm:hidden
  "
>
  {/* Integration grid only */}
  <div
    className="
      relative
    "
  >
    {/* Soft side fades */}

    <div
      aria-hidden="true"
      className="
        pointer-events-none
        absolute
        inset-y-0
        left-0
        z-20
        w-8
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
        w-8
        bg-gradient-to-l
        from-background
        to-transparent
      "
    />

    {/* Center divider — only over integration tiles */}

    <div
      aria-hidden="true"
      className="
        pointer-events-none
        absolute
        bottom-0
        left-1/2
        top-0
        z-10
        w-px
        -translate-x-1/2
        bg-gradient-to-b
        from-transparent
        via-border
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
          tool
        ) => (
          <div
            key={
              tool.slug
            }
            className="
              group
              relative
              flex
              min-h-[92px]
              items-center
              gap-2.5
              px-3
              py-4
            "
          >
            {/* Row divider */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-0
                bottom-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-border
                to-transparent
              "
            />

            <span
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-muted
              "
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
                className="
                  truncate
                  text-[13px]
                  font-medium
                  leading-tight
                  text-foreground
                "
              >
                {
                  tool.name
                }
              </p>
            </div>
          </div>
        )
      )}
    </div>
  </div>

  {/* Full-width CTA — no center divider */}

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
    {/* Top divider */}

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
        more tools across the Bivi ecosystem
      </span>
    </div>

    <ArrowUpRight
      className="
        h-4
        w-4
        shrink-0
        text-muted-foreground
      "
    />
  </Link>

  {/* Bottom fade */}

  <div
    aria-hidden="true"
    className="
      pointer-events-none
      absolute
      inset-x-0
      bottom-0
      z-20
      h-7
      bg-gradient-to-t
      from-background
      to-transparent
    "
  />
</div>

{/* ============================================================ */}
{/* Tablet / Desktop                                             */}
{/* ============================================================ */}

          <div
            className="
              relative
              hidden
              sm:block
            "
          >
            {/* Horizontal separator 1 */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-0
                right-0
                top-1/3
                z-10
                hidden
                h-px
                bg-gradient-to-r
                from-transparent
                via-border
                to-transparent
                lg:block
              "
            />

            {/* Horizontal separator 2 */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-0
                right-0
                top-2/3
                z-10
                hidden
                h-px
                bg-gradient-to-r
                from-transparent
                via-border
                to-transparent
                lg:block
              "
            />

            <div
              className="
                grid
                sm:grid-cols-3
                md:grid-cols-4
                lg:grid-cols-5
              "
            >
              {featuredIntegrations.map(
                (
                  tool,
                  index
                ) => {
                  const hasRightDivider =
                    index %
                      5 !==
                    4;

                  return (
                    <div
                      key={
                        tool.slug
                      }
                      className={`
                        group
                        relative
                        flex
                        min-h-[124px]
                        items-center
                        gap-3
                        px-6
                        py-5
                        transition-colors
                        duration-200
                        hover:bg-muted/40

                        ${
                          hasRightDivider
                            ? `
                              lg:after:pointer-events-none
                              lg:after:absolute
                              lg:after:right-0
                              lg:after:top-0
                              lg:after:h-full
                              lg:after:w-px
                              lg:after:bg-gradient-to-b
                              lg:after:from-transparent
                              lg:after:via-border
                              lg:after:to-transparent
                              lg:after:content-['']
                            `
                            : ''
                        }
                      `}
                    >
                      <span
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-muted
                        "
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
                          className="
                            truncate
                            text-[15px]
                            font-medium
                            text-foreground
                          "
                        >
                          {
                            tool.name
                          }
                        </p>
                      </div>
                    </div>
                  );
                }
              )}

              {/* Desktop CTA */}

              <Link
                href="/integrations"
                className="
                  group
                  relative
                  col-span-2
                  flex
                  min-h-[124px]
                  items-center
                  justify-between
                  gap-5
                  px-8
                  py-5
                  transition-colors
                  duration-200
                  hover:bg-muted/40
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-4
                  "
                >
                  <span
                    className="
                      shrink-0
                      font-heading
                      text-4xl
                      font-semibold
                      tracking-[-0.04em]
                      text-foreground
                    "
                  >
                    {
                      remainingCount
                    }
                    +
                  </span>

                  <span
                    className="
                      max-w-[190px]
                      text-sm
                      leading-5
                      text-muted-foreground
                    "
                  >
                    more tools across
                    the Bivi ecosystem
                  </span>
                </div>

                <ArrowUpRight
                  className="
                    h-5
                    w-5
                    shrink-0
                    text-muted-foreground
                    transition-colors
                    duration-200
                    group-hover:text-foreground
                  "
                />
              </Link>
            </div>
          </div>

          {/* Bottom link */}

          <div
            className="
              mt-8
              flex
              justify-center
              sm:mt-9
            "
          >
            <Link
              href="/integrations"
              className="
                group
                inline-flex
                items-center
                gap-2
                border-b
                border-foreground
                pb-1
                text-sm
                font-semibold
                text-foreground
                transition-colors
                duration-200
                hover:border-[#0B65F3]
                hover:text-[#0B65F3]
              "
            >
              Explore all integrations

              <ArrowUpRight
                className="
                  h-4
                  w-4
                "
                strokeWidth={
                  2
                }
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}