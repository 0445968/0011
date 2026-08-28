import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { stacks } from '@/data/stacks';

function BrandIcon({
  path,
  hex,
  name,
  monogram,
}: {
  path?: string;
  hex: string;
  name: string;
  monogram?: string;
}) {
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
      {monogram ?? name.slice(0, 2).toUpperCase()}
    </span>
  );
}

const featuredIntegrations = stacks.slice(0, 13);

export function IntegrationsGrid() {
  const remainingCount = Math.max(
    stacks.length - featuredIntegrations.length,
    0
  );

  return (
    <section
  className="
    bg-background
    px-5
    pt-8
sm:pt-10
lg:pt-12
    pb-20
    sm:px-6
    sm:pb-24
    lg:px-8
    lg:pb-28
  "
>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <h2
            style={{
              lineHeight: '1.15',
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
            From design and development to marketing and collaboration,
            Bivi works within the tools that keep your business moving.
          </p>
        </div>

        {/* Integrations grid */}
        <div
          className="
            relative
            mx-auto
            mt-14
            max-w-6xl
            sm:mt-16
          "
        >
          {/* Horizontal fading separators */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-0
              right-0
              top-1/3
              z-10
              h-px
              bg-gradient-to-r
              from-transparent
              via-border
              to-transparent
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-0
              right-0
              top-2/3
              z-10
              h-px
              bg-gradient-to-r
              from-transparent
              via-border
              to-transparent
            "
          />

          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
            "
          >
            {featuredIntegrations.map((tool, index) => (
              <div
                key={tool.slug}
                className={`
                  group
                  flex
                  min-h-[112px]
                  items-center
                  gap-3
                  px-5
                  py-5
                  transition-colors
                  duration-200
                  hover:bg-muted/40
                  sm:min-h-[124px]
                  sm:px-6

                  lg:border-r
                  lg:border-border

                  ${
                    index % 5 === 4
                      ? 'lg:border-r-0'
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
                    path={tool.path}
                    hex={tool.hex}
                    name={tool.name}
                    monogram={tool.monogram}
                  />
                </span>

                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-sm
                      font-medium
                      text-foreground
                      sm:text-[15px]
                    "
                  >
                    {tool.name}
                  </p>
                </div>
              </div>
            ))}

            {/* Final stat / CTA tile */}
            <Link
              href="/integrations"
              className="
                group
                col-span-2
                flex
                min-h-[112px]
                items-center
                justify-between
                gap-5
                px-5
                py-5
                transition-colors
                duration-200
                hover:bg-muted/40
                sm:min-h-[124px]
                sm:px-7
                md:col-span-2
              "
            >
              <div className="flex items-baseline gap-3">
                <span
                  className="
                    font-heading
                    text-3xl
                    font-semibold
                    tracking-[-0.04em]
                    text-foreground
                    sm:text-4xl
                  "
                >
                  {remainingCount}+
                </span>

                <span
                  className="
                    max-w-[180px]
                    text-xs
                    leading-5
                    text-muted-foreground
                    sm:text-sm
                  "
                >
                  more tools across the Bivi ecosystem
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

          {/* Edge fades */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-y-0
              left-0
              z-20
              w-16
              bg-gradient-to-r
              from-background
              to-transparent
              sm:w-24
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
              w-16
              bg-gradient-to-l
              from-background
              to-transparent
              sm:w-24
            "
          />
        </div>

        {/* Bottom link */}
        <div className="mt-7 flex justify-center">
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
              className="h-4 w-4"
              strokeWidth={2}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}