import Link from 'next/link';

import type {
  LabItem,
} from './HelpToolsPage';

/* -------------------------------------------------------------------------- */
/* Directory                                                                  */
/* -------------------------------------------------------------------------- */

export function ToolsDirectory({
  tools,
  assessments,
}: {
  tools: LabItem[];
  assessments: LabItem[];
}) {
  if (
    tools.length === 0 &&
    assessments.length === 0
  ) {
    return null;
  }

  return (
    <section
      className="
        py-14
        sm:py-16
        lg:py-20
      "
    >
      <div className="container-page">
        {/* ---------------------------------------------------------- */}
        {/* Heading                                                    */}
        {/* ---------------------------------------------------------- */}

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
            Directory
          </p>

          <h2
            className="
              mt-2
              font-serif
              text-3xl
              font-semibold
              tracking-[-0.035em]
              text-foreground
              sm:text-4xl
            "
          >
            All tools
          </h2>

          <p
            className="
              mt-3
              max-w-xl
              text-sm
              leading-6
              text-muted-foreground
            "
          >
            Browse everything
            currently available in
            the Studio Lab.
          </p>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Categories                                                 */}
        {/* ---------------------------------------------------------- */}

        <div
          className="
            mt-10
            grid
            gap-x-16
            gap-y-12
            lg:grid-cols-2
          "
        >
          {tools.length > 0 && (
            <DirectoryGroup
              title="Tools"
              items={tools}
            />
          )}

          {assessments.length >
            0 && (
            <DirectoryGroup
              title="Assessments"
              items={
                assessments
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Group                                                                      */
/* -------------------------------------------------------------------------- */

function DirectoryGroup({
  title,
  items,
}: {
  title: string;
  items: LabItem[];
}) {
  return (
    <div>
      {/* ------------------------------------------------------------ */}
      {/* Category                                                     */}
      {/* ------------------------------------------------------------ */}

      <div
        className="
          flex
          items-baseline
          gap-3
        "
      >
        <h3
          className="
            font-serif
            text-2xl
            font-semibold
            tracking-[-0.03em]
            text-foreground
          "
        >
          {title}
        </h3>

        <span
          className="
            text-xs
            text-muted-foreground
          "
        >
          {items.length}
        </span>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* List                                                         */}
      {/* ------------------------------------------------------------ */}

      <div
        className="
          mt-6
          flex
          flex-col
          items-start
          gap-3
        "
      >
        {items.map(
          (item) => (
            <Link
              key={item.id}
              href={item.href}
              className="
                text-[15px]
                font-medium
                tracking-[-0.015em]
                text-foreground
                transition-colors
                duration-150
                hover:text-primary
              "
            >
              {item.title}
            </Link>
          )
        )}
      </div>
    </div>
  );
}