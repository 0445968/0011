'use client';

import type {
  MutableRefObject,
} from 'react';

import Link from 'next/link';

import {
  ArrowUpRight,
} from 'lucide-react';

import {
  megaPanels,
  navSections,
} from '@/data/site';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface MegaMenuProps {
  activeMega: string | null;

  closeTimer: MutableRefObject<
    ReturnType<typeof setTimeout> | null
  >;

  handleNav: () => void;

  onClose: () => void;
}

/* -------------------------------------------------------------------------- */
/* Mega menu                                                                  */
/* -------------------------------------------------------------------------- */

export function MegaMenu({
  activeMega,
  closeTimer,
  handleNav,
  onClose,
}: MegaMenuProps) {
  if (
    !activeMega ||
    !megaPanels[activeMega]
  ) {
    return null;
  }

  const panel =
    megaPanels[activeMega];

  const navItem =
    navSections.find(
      (item) =>
        item.id === activeMega
    );

  const isServices =
    activeMega === 'services';

  const isResources =
    activeMega === 'resources';

  return (
    <div
      onMouseEnter={() => {
        if (
          closeTimer.current
        ) {
          clearTimeout(
            closeTimer.current
          );
        }
      }}
      onMouseLeave={
        onClose
      }
      className="
        relative
        z-40
        hidden
        border-t
        border-border/70
        bg-background
        lg:block
      "
    >
      <div
        className="
          container-page
          py-6
          xl:py-7
        "
      >
        {isServices && (
          <ServicesMegaMenu
            panel={
              panel
            }
            navHref={
              navItem?.href ??
              '/services'
            }
            handleNav={
              handleNav
            }
          />
        )}

        {isResources && (
          <ResourcesMegaMenu
            panel={
              panel
            }
            handleNav={
              handleNav
            }
          />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Services mega menu                                                         */
/* -------------------------------------------------------------------------- */

function ServicesMegaMenu({
  panel,
  navHref,
  handleNav,
}: {
  panel: (typeof megaPanels)[string];

  navHref: string;

  handleNav: () => void;
}) {
  return (
    <div>
      <div
        className="
          grid
          grid-cols-3
          gap-8
          xl:gap-10
        "
      >
        {panel.groups.map(
          (group) => (
            <div
              key={
                group.id
              }
              className="
                min-w-0
              "
            >
              {/* ------------------------------------------------------ */}
              {/* Column heading                                        */}
              {/* ------------------------------------------------------ */}

              <div
                className="
                  mb-2.5
                  border-b
                  border-border/70
                  pb-2.5
                "
              >
                <h3
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-muted-foreground
                  "
                >
                  {
                    group.title
                  }
                </h3>
              </div>

              {/* ------------------------------------------------------ */}
              {/* Services                                              */}
              {/* ------------------------------------------------------ */}

              <ul
                className="
                  space-y-0.5
                "
              >
                {group.links.map(
                  (link) => (
                    <li
                      key={
                        link.label
                      }
                    >
                      <Link
                        href={
                          link.href
                        }
                        onClick={
                          handleNav
                        }
                        className="
                          group/service
                          flex
                          items-start
                          gap-3
                          rounded-2xl
                          border
                          border-dashed
                          border-transparent
                          px-3
                          py-2.5
                          transition-all
                          duration-200
                          hover:border-primary
                          hover:bg-primary/[0.03]
                        "
                      >
                        {/* ------------------------------------------ */}
                        {/* Service icon                               */}
                        {/* ------------------------------------------ */}

                        {link.icon && (
                          <div
                            className="
                              mt-0.5
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-secondary
                            "
                          >
                            <img
                              src={
                                link.icon
                              }
                              alt=""
                              aria-hidden="true"
                              onError={(
                                event
                              ) => {
                                event.currentTarget.style.display =
                                  'none';
                              }}
                              className="
                                h-5
                                w-5
                                object-contain
                              "
                            />
                          </div>
                        )}

                        {/* ------------------------------------------ */}
                        {/* Service text                               */}
                        {/* ------------------------------------------ */}

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              gap-1.5
                            "
                          >
                            <span
                              className="
                                text-[14px]
                                font-semibold
                                leading-tight
                                text-foreground
                                transition-colors
                                duration-200
                                group-hover/service:text-primary
                              "
                            >
                              {
                                link.label
                              }
                            </span>

                            <ArrowUpRight
                              size={13}
                              strokeWidth={
                                1.8
                              }
                              className="
                                text-muted-foreground
                                opacity-0
                                transition-all
                                duration-200
                                group-hover/service:-translate-y-0.5
                                group-hover/service:translate-x-0.5
                                group-hover/service:text-primary
                                group-hover/service:opacity-100
                              "
                            />
                          </div>

                          {link.description && (
                            <p
                              className="
                                mt-1
                                max-w-[270px]
                                text-[12px]
                                leading-[1.45]
                                text-muted-foreground
                              "
                            >
                              {
                                link.description
                              }
                            </p>
                          )}
                        </div>
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          )
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* View all services                                                  */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="
          mt-6
          border-t
          border-border/70
          pt-4
        "
      >
        <Link
          href={
            navHref
          }
          onClick={
            handleNav
          }
          className="
            group
            inline-flex
            items-center
            gap-2
            text-[13px]
            font-semibold
            text-foreground
            transition-colors
            duration-200
            hover:text-primary
          "
        >
          View all services

          <ArrowUpRight
            size={14}
            strokeWidth={
              1.8
            }
            className="
              text-muted-foreground
              transition-all
              duration-200
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
              group-hover:text-primary
            "
          />
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Resources mega menu                                                        */
/* -------------------------------------------------------------------------- */

function ResourcesMegaMenu({
  panel,
  handleNav,
}: {
  panel: (typeof megaPanels)[string];

  handleNav: () => void;
}) {
  const resourceLibrary =
    panel.groups.find(
      (group) =>
        group.id ===
        'resource-library'
    );

  const journal =
    panel.groups.find(
      (group) =>
        group.id ===
        'journal'
    );

  const previews =
    panel.previews ?? [];

  /*
   * Only six tools are featured
   * inside the mega menu.
   */
  const tools =
    (panel.tools ?? []).slice(
      0,
      6
    );

  /*
   * Preview order:
   *
   * 0 = Journal
   * 1+ = PDFs
   */
  const journalPreview =
    previews[0];

  const pdfPreviews =
    previews.slice(
      1,
      4
    );

  return (
    <div
      className="
        grid
        grid-cols-12
        gap-8
        xl:gap-10
      "
    >
      {/* ================================================================== */}
      {/* Left side                                                          */}
      {/* ================================================================== */}

      <div
        className="
          col-span-7
          min-w-0
        "
      >
        {/* ---------------------------------------------------------------- */}
        {/* Resource Library + Journal                                       */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="
            grid
            grid-cols-2
            gap-8
          "
        >
          {/* -------------------------------------------------------------- */}
          {/* Resource Library                                               */}
          {/* -------------------------------------------------------------- */}

          <div
            className="
              min-w-0
            "
          >
            {resourceLibrary && (
              <>
                <SectionHeadingLink
                  title={
                    resourceLibrary.title
                  }
                  href={
                    resourceLibrary.href ??
                    '/resources'
                  }
                  handleNav={
                    handleNav
                  }
                />

                <ul
                  className="
                    mt-2
                    space-y-0.5
                  "
                >
                  {resourceLibrary.links.map(
                    (link) => (
                      <li
                        key={
                          link.label
                        }
                      >
                        <DirectoryLink
                          label={
                            link.label
                          }
                          href={
                            link.href
                          }
                          handleNav={
                            handleNav
                          }
                        />
                      </li>
                    )
                  )}
                </ul>
              </>
            )}
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Journal                                                        */}
          {/* -------------------------------------------------------------- */}

          <div
            className="
              min-w-0
            "
          >
            {journal && (
              <SectionHeadingLink
                title={
                  journal.title
                }
                href={
                  journal.href ??
                  '/blog'
                }
                handleNav={
                  handleNav
                }
              />
            )}

            {/* ------------------------------------------------------------ */}
            {/* Journal preview                                              */}
            {/* ------------------------------------------------------------ */}

            {journalPreview && (
              <Link
                href={
                  journalPreview.href
                }
                onClick={
                  handleNav
                }
                className="
                  group/journal
                  mt-3
                  grid
                  grid-cols-[86px_minmax(0,1fr)]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-dashed
                  border-transparent
                  transition-all
                  duration-200
                  hover:border-primary
                  hover:bg-primary/[0.03]
                "
              >
                {journalPreview.image && (
                  <div
                    className="
                      relative
                      min-h-[92px]
                      overflow-hidden
                      bg-secondary
                    "
                  >
                    <img
                      src={
                        journalPreview.image
                      }
                      alt={
                        journalPreview.title
                      }
                      className="
                        absolute
                        inset-0
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-500
                        group-hover/journal:scale-[1.04]
                      "
                    />
                  </div>
                )}

                <div
                  className="
                    flex
                    min-w-0
                    flex-col
                    justify-center
                    p-3
                  "
                >
                  {journalPreview.badge && (
                    <p
                      className="
                        mb-1
                        text-[9px]
                        font-medium
                        uppercase
                        tracking-[0.08em]
                        text-muted-foreground
                      "
                    >
                      {
                        journalPreview.badge
                      }
                    </p>
                  )}

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-2
                    "
                  >
                    <h3
                      className="
                        line-clamp-2
                        text-[13px]
                        font-semibold
                        leading-snug
                        text-foreground
                        transition-colors
                        duration-200
                        group-hover/journal:text-primary
                      "
                    >
                      {
                        journalPreview.title
                      }
                    </h3>

                    <ArrowUpRight
                      size={13}
                      strokeWidth={
                        1.8
                      }
                      className="
                        mt-0.5
                        shrink-0
                        text-muted-foreground
                        transition-all
                        duration-200
                        group-hover/journal:-translate-y-0.5
                        group-hover/journal:translate-x-0.5
                        group-hover/journal:text-primary
                      "
                    />
                  </div>

                  {journalPreview.meta && (
                    <p
                      className="
                        mt-1.5
                        text-[10px]
                        text-muted-foreground
                      "
                    >
                      {
                        journalPreview.meta
                      }
                    </p>
                  )}
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Tools & Calculators                                              */}
        {/* ---------------------------------------------------------------- */}

        {tools.length > 0 && (
          <div
            className="
              mt-3
              border-t
              border-border/70
              pt-3
            "
          >
            <div
              className="
                mb-4
                flex
                items-center
                justify-between
              "
            >
              <p
                className="
    font-bivi-mono
    text-[11px]
    font-medium
    uppercase
    tracking-[0.12em]
    text-primary
  "
              >
                Tools & Calculators
              </p>

              <Link
                href="/resources?type=tool"
                onClick={
                  handleNav
                }
                className="
                  group
                  inline-flex
                  items-center
                  gap-1
                  text-[11px]
                  font-medium
                  text-muted-foreground
                  transition-colors
                  duration-200
                  hover:text-primary
                "
              >
                View all

                <ArrowUpRight
                  size={12}
                  strokeWidth={
                    1.8
                  }
                  className="
                    transition-transform
                    duration-200
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                  "
                />
              </Link>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Six featured calculators                                    */}
            {/* ------------------------------------------------------------ */}

            <div
              className="
                grid
                grid-cols-2
                gap-x-6
                gap-y-1
              "
            >
              {tools.map(
                (tool) => (
                  <Link
                    key={
                      tool.label
                    }
                    href={
                      tool.href
                    }
                    onClick={
                      handleNav
                    }
                    className="
                      py-0.5
                      text-[12px]
                      font-medium
                      leading-[1.15]
                      text-foreground
                      transition-colors
                      duration-200
                      hover:text-primary
                    "
                  >
                    {
                      tool.label
                    }
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* Guides & PDFs                                                      */}
      {/* ================================================================== */}

      <div
        className="
          col-span-5
          border-l
          border-border/70
          pl-7
        "
      >
        {/* ---------------------------------------------------------------- */}
        {/* PDF heading                                                      */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="
            mb-4
            flex
            items-center
            justify-between
          "
        >
          <p
            className="
    font-bivi-mono
    text-[11px]
    font-medium
    uppercase
    tracking-[0.12em]
    text-primary
  "
          >
            Guides & PDFs
          </p>

          <Link
            href="/guides"
            onClick={
              handleNav
            }
            className="
              group
              inline-flex
              items-center
              gap-1
              text-[11px]
              font-medium
              text-muted-foreground
              transition-colors
              duration-200
              hover:text-primary
            "
          >
            View all

            <ArrowUpRight
              size={12}
              strokeWidth={
                1.8
              }
              className="
                transition-transform
                duration-200
                group-hover:-translate-y-0.5
                group-hover:translate-x-0.5
              "
            />
          </Link>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* PDF previews                                                     */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="
            space-y-2
          "
        >
          {pdfPreviews.map(
            (preview) => (
              <PdfPreviewCard
                key={
                  preview.title
                }
                preview={
                  preview
                }
                handleNav={
                  handleNav
                }
              />
            )
          )}
        </div>
      </div>
    </div >
  );
}

/* -------------------------------------------------------------------------- */
/* PDF preview card                                                           */
/* -------------------------------------------------------------------------- */

function PdfPreviewCard({
  preview,
  handleNav,
}: {
  preview: {
    title: string;
    description: string;
    href: string;
    image?: string;
    badge?: string;
    meta?: string;
  };

  handleNav: () => void;
}) {
  return (
    <Link
      href={
        preview.href
      }
      onClick={
        handleNav
      }
      className="
        group/pdf
        grid
        min-h-[100px]
        grid-cols-[104px_minmax(0,1fr)]
        overflow-hidden
        rounded-2xl
        border
        border-dashed
        border-border
        bg-card
        transition-all
        duration-200
        hover:border-primary
        hover:bg-primary/[0.03]
      "
    >
      {/* ------------------------------------------------------------------ */}
      {/* Image                                                               */}
      {/* ------------------------------------------------------------------ */}

      {preview.image && (
        <div
          className="
            relative
            overflow-hidden
            bg-secondary
          "
        >
          <img
            src={
              preview.image
            }
            alt={
              preview.title
            }
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover/pdf:scale-[1.04]
            "
          />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Content                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="
          flex
          min-w-0
          flex-col
          justify-center
          p-3.5
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-3
          "
        >
          <div
            className="
              min-w-0
            "
          >
            {preview.badge && (
              <p
                className="
                  mb-1
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.08em]
                  text-muted-foreground
                "
              >
                {
                  preview.badge
                }
              </p>
            )}

            <h3
              className="
                line-clamp-2
                text-[13px]
                font-semibold
                leading-snug
                text-foreground
                transition-colors
                duration-200
                group-hover/pdf:text-primary
              "
            >
              {
                preview.title
              }
            </h3>
          </div>

          <ArrowUpRight
            size={13}
            strokeWidth={
              1.8
            }
            className="
              mt-0.5
              shrink-0
              text-muted-foreground
              transition-all
              duration-200
              group-hover/pdf:-translate-y-0.5
              group-hover/pdf:translate-x-0.5
              group-hover/pdf:text-primary
            "
          />
        </div>

        {preview.meta && (
          <p
            className="
              mt-1.5
              text-[10px]
              text-muted-foreground
            "
          >
            {
              preview.meta
            }
          </p>
        )}
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Clickable Resource Library / Journal heading                               */
/* -------------------------------------------------------------------------- */

function SectionHeadingLink({
  title,
  href,
  handleNav,
}: {
  title: string;
  href: string;

  handleNav: () => void;
}) {
  return (
    <Link
      href={
        href
      }
      onClick={
        handleNav
      }
      className="
        group
        flex
        items-center
        justify-between
        border-b
        border-border/70
        pb-2.5
      "
    >
      <span
        className="
          text-[14px]
          font-semibold
          text-foreground
          transition-colors
          duration-200
          group-hover:text-primary
        "
      >
        {
          title
        }
      </span>

      <ArrowUpRight
        size={15}
        strokeWidth={
          1.8
        }
        className="
          text-muted-foreground
          transition-all
          duration-200
          group-hover:-translate-y-0.5
          group-hover:translate-x-0.5
          group-hover:text-primary
        "
      />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Resource Library directory item                                            */
/* -------------------------------------------------------------------------- */

function DirectoryLink({
  label,
  href,
  handleNav,
}: {
  label: string;
  href: string;

  handleNav: () => void;
}) {
  return (
    <Link
      href={
        href
      }
      onClick={
        handleNav
      }
      className="
        group
        flex
        min-h-[32px]
        items-center
        justify-between
        py-1
        text-[13px]
        font-medium
        text-foreground
        transition-colors
        duration-200
        hover:text-primary
      "
    >
      <span>
        {
          label
        }
      </span>

      <ArrowUpRight
        size={11}
        strokeWidth={
          1.8
        }
        className="
          shrink-0
          text-muted-foreground
          opacity-0
          transition-all
          duration-200
          group-hover:-translate-y-0.5
          group-hover:translate-x-0.5
          group-hover:text-primary
          group-hover:opacity-100
        "
      />
    </Link>
  );
}