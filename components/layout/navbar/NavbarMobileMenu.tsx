'use client';

import {
  useState,
} from 'react';

import Link from 'next/link';

import {
  usePathname,
} from 'next/navigation';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';

import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
} from 'lucide-react';

import {
  megaPanels,
  navSections,
} from '@/data/site';

import {
  cn,
} from '@/lib/utils';

interface NavbarMobileMenuProps {
  open: boolean;
  onNavigate: () => void;
}

export function NavbarMobileMenu({
  open,
  onNavigate,
}: NavbarMobileMenuProps) {
  const pathname =
    usePathname();

  const isHelpCenter =
    pathname === '/help' ||
    pathname.startsWith('/help/');

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
            y: -8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -8,
          }}
          transition={{
            duration: 0.2,
            ease: 'easeOut',
          }}
          className="
            fixed
            inset-x-0
            top-16
            z-[60]
            h-[calc(100dvh-4rem)]
            overflow-y-auto
            border-t
            border-border
            bg-background
            md:top-20
            md:h-[calc(100dvh-5rem)]
            lg:hidden
          "
        >
          {isHelpCenter ? (
            <HelpCenterMobileMenu
              onNavigate={
                onNavigate
              }
            />
          ) : (
            <DefaultMobileMenu
              onNavigate={
                onNavigate
              }
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/* Default mobile menu                                                        */
/* -------------------------------------------------------------------------- */

function DefaultMobileMenu({
  onNavigate,
}: {
  onNavigate: () => void;
}) {
  const [
    openSection,
    setOpenSection,
  ] = useState<string | null>(
    null
  );

  return (
    <div
      className="
        container-page
        py-6
      "
    >
      <nav>
        <ul
          className="
            divide-y
            divide-border
          "
        >
          {navSections.map(
            (item) => {
              const panel =
                megaPanels[
                item.id
                ];

              const hasMegaMenu =
                Boolean(panel);

              const expanded =
                openSection ===
                item.id;

              if (
                !hasMegaMenu
              ) {
                return (
                  <li
                    key={
                      item.id
                    }
                  >
                    <Link
                      href={
                        item.href
                      }
                      onClick={
                        onNavigate
                      }
                      className="
                        flex
                        items-center
                        justify-between
                        py-5
                        text-[17px]
                        font-semibold
                        text-foreground
                      "
                    >
                      <span>
                        {
                          item.label
                        }
                      </span>

                      <ArrowRight
                        size={18}
                        strokeWidth={
                          1.8
                        }
                        className="
                          text-muted-foreground
                        "
                      />
                    </Link>
                  </li>
                );
              }

              return (
                <li
                  key={
                    item.id
                  }
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpenSection(
                        expanded
                          ? null
                          : item.id
                      );
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      py-5
                      text-left
                    "
                    aria-expanded={
                      expanded
                    }
                  >
                    <span
                      className="
                        text-[17px]
                        font-semibold
                        text-foreground
                      "
                    >
                      {
                        item.label
                      }
                    </span>

                    <ChevronDown
                      size={18}
                      strokeWidth={
                        1.8
                      }
                      className={cn(
                        `
                          text-muted-foreground
                          transition-transform
                          duration-200
                        `,
                        expanded
                          ? 'rotate-180'
                          : 'rotate-0'
                      )}
                    />
                  </button>

                  <AnimatePresence
                    initial={
                      false
                    }
                  >
                    {expanded && (
                      <motion.div
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height:
                            'auto',
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.22,
                          ease: 'easeOut',
                        }}
                        className="
                          overflow-hidden
                        "
                      >
                        {item.id ===
                          'resources' ? (
                          <ResourcesMobilePanel
                            onNavigate={
                              onNavigate
                            }
                          />
                        ) : (
                          <StandardMobilePanel
                            itemId={
                              item.id
                            }
                            itemHref={
                              item.href
                            }
                            onNavigate={
                              onNavigate
                            }
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            }
          )}
        </ul>
      </nav>

      <div
        className="
          mt-8
          border-t
          border-border
          pt-6
        "
      >
        <Link
          href="/contact"
          onClick={
            onNavigate
          }
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-full
            bg-foreground
            px-5
            py-3.5
            text-sm
            font-semibold
            text-background
          "
        >
          Start a project

          <ArrowRight
            size={16}
          />
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Standard panel                                                             */
/* -------------------------------------------------------------------------- */

function StandardMobilePanel({
  itemId,
  itemHref,
  onNavigate,
}: {
  itemId: string;
  itemHref: string;
  onNavigate: () => void;
}) {
  const panel =
    megaPanels[itemId];

  if (!panel) {
    return null;
  }

  return (
    <div
      className="
        pb-6
      "
    >
      {panel.groups.map(
        (group) => (
          <div
            key={
              group.id
            }
            className="
              mb-5
              last:mb-0
            "
          >
            <p
              className="
                mb-2
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-muted-foreground
              "
            >
              {
                group.title
              }
            </p>

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
                        onNavigate
                      }
                      className="
                        flex
                        items-start
                        gap-3
                        rounded-2xl
                        border
                        border-dashed
                        border-transparent
                        px-2.5
                        py-2.5
                        transition-all
                        hover:border-primary
                        hover:bg-primary/[0.03]
                      "
                    >
                      {link.icon && (
                        <div
                          className="
                            mt-0.5
                            flex
                            h-9
                            w-9
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
                            className="
                              h-[18px]
                              w-[18px]
                              object-contain
                            "
                          />
                        </div>
                      )}

                      <div
                        className="
                          min-w-0
                        "
                      >
                        <span
                          className="
                            block
                            text-sm
                            font-semibold
                            leading-snug
                            text-foreground
                          "
                        >
                          {
                            link.label
                          }
                        </span>

                        {link.description && (
                          <span
                            className="
                              mt-1
                              block
                              text-xs
                              leading-relaxed
                              text-muted-foreground
                            "
                          >
                            {
                              link.description
                            }
                          </span>
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

      <div
        className="
          mt-5
          border-t
          border-border
          pt-4
        "
      >
        <Link
          href={
            itemHref
          }
          onClick={
            onNavigate
          }
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-foreground
          "
        >
          View all

          <ArrowUpRight
            size={14}
          />
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Resources panel                                                            */
/* -------------------------------------------------------------------------- */

function ResourcesMobilePanel({
  onNavigate,
}: {
  onNavigate: () => void;
}) {
  const panel =
    megaPanels.resources;

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

  const tools =
    panel.tools ?? [];

  const previews =
    panel.previews ?? [];

  const journalPreview =
    previews[0];

  const pdfPreviews =
    previews.slice(1);

  return (
    <div
      className="
        pb-6
      "
    >
      {/* ------------------------------------------------------------------ */}
      {/* Resource Library                                                    */}
      {/* ------------------------------------------------------------------ */}

      {resourceLibrary && (
        <div>
          <MobileSectionHeading
            title={
              resourceLibrary.title
            }
            href={
              resourceLibrary.href ??
              '/resources'
            }
            onNavigate={
              onNavigate
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
                  <MobileDirectoryLink
                    label={
                      link.label
                    }
                    href={
                      link.href
                    }
                    onNavigate={
                      onNavigate
                    }
                  />
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Journal                                                             */}
      {/* ------------------------------------------------------------------ */}

      {journal && (
        <div
          className="
            mt-5
          "
        >
          <MobileSectionHeading
            title={
              journal.title
            }
            href={
              journal.href ??
              '/blog'
            }
            onNavigate={
              onNavigate
            }
          />

          {journalPreview && (
            <Link
              href={
                journalPreview.href
              }
              onClick={
                onNavigate
              }
              className="
                mt-2.5
                grid
                grid-cols-[82px_minmax(0,1fr)]
                overflow-hidden
                rounded-2xl
                border
                border-dashed
                border-transparent
                transition-all
                hover:border-primary
                hover:bg-primary/[0.03]
              "
            >
              {journalPreview.image && (
                <div
                  className="
                    relative
                    min-h-[88px]
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
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-2
                  "
                >
                  <p
                    className="
                      line-clamp-2
                      text-[13px]
                      font-semibold
                      leading-snug
                    "
                  >
                    {
                      journalPreview.title
                    }
                  </p>

                  <ArrowUpRight
                    size={12}
                    className="
                      shrink-0
                      text-muted-foreground
                    "
                  />
                </div>

                {journalPreview.meta && (
                  <span
                    className="
                      mt-1.5
                      text-[10px]
                      text-muted-foreground
                    "
                  >
                    {
                      journalPreview.meta
                    }
                  </span>
                )}
              </div>
            </Link>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Tools                                                               */}
      {/* ------------------------------------------------------------------ */}

      {tools.length > 0 && (
        <div
          className="
            mt-4
            border-t
            border-border
            pt-3
          "
        >
          <div
            className="
              mb-1.5
              flex
              items-center
              justify-between
            "
          >
            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-muted-foreground
              "
            >
              Tools &
              Calculators
            </p>

            <Link
              href="/resources?type=tool"
              onClick={
                onNavigate
              }
              className="
                inline-flex
                items-center
                gap-1
                text-[11px]
                text-muted-foreground
              "
            >
              View all

              <ArrowUpRight
                size={11}
              />
            </Link>
          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-1
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
                    onNavigate
                  }
                  className="
                    flex
                    min-h-[38px]
                    items-center
                    rounded-xl
                    border
                    border-dashed
                    border-transparent
                    px-2.5
                    py-1.5
                    text-[12px]
                    font-medium
                    leading-tight
                    text-foreground
                    transition-all
                    hover:border-primary
                    hover:bg-primary/[0.03]
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

      {/* ------------------------------------------------------------------ */}
      {/* PDF previews                                                        */}
      {/* ------------------------------------------------------------------ */}

      {pdfPreviews.length >
        0 && (
          <div
            className="
            mt-5
            border-t
            border-border
            pt-3
          "
          >
            <div
              className="
              mb-2
              flex
              items-center
              justify-between
            "
            >
              <p
                className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-muted-foreground
              "
              >
                Guides & PDFs
              </p>

              <Link
                href="/guides"
                onClick={
                  onNavigate
                }
                className="
                inline-flex
                items-center
                gap-1
                text-[11px]
                text-muted-foreground
              "
              >
                View all

                <ArrowUpRight
                  size={11}
                />
              </Link>
            </div>

            <div
              className="
              space-y-1
            "
            >
              {pdfPreviews.map(
                (preview) => (
                  <Link
                    key={
                      preview.title
                    }
                    href={
                      preview.href
                    }
                    onClick={
                      onNavigate
                    }
                    className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    border
                    border-dashed
                    border-transparent
                    px-3
                    py-2.5
                    transition-all
                    hover:border-primary
                    hover:bg-primary/[0.03]
                  "
                  >
                    <div
                      className="
                      min-w-0
                    "
                    >
                      <p
                        className="
                        truncate
                        text-[12px]
                        font-semibold
                        text-foreground
                      "
                      >
                        {
                          preview.title
                        }
                      </p>

                      {preview.meta && (
                        <p
                          className="
                          mt-0.5
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

                    <ArrowUpRight
                      size={12}
                      className="
                      shrink-0
                      text-muted-foreground
                    "
                    />
                  </Link>
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile heading                                                             */
/* -------------------------------------------------------------------------- */

function MobileSectionHeading({
  title,
  href,
  onNavigate,
}: {
  title: string;
  href: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={
        href
      }
      onClick={
        onNavigate
      }
      className="
        flex
        items-center
        justify-between
        border-b
        border-border
        pb-2.5
        text-sm
        font-semibold
        text-foreground
      "
    >
      {
        title
      }

      <ArrowUpRight
        size={14}
        className="
          text-muted-foreground
        "
      />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile directory link                                                      */
/* -------------------------------------------------------------------------- */

function MobileDirectoryLink({
  label,
  href,
  onNavigate,
}: {
  label: string;
  href: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={
        href
      }
      onClick={
        onNavigate
      }
      className="
        flex
        min-h-[36px]
        items-center
        justify-between
        rounded-xl
        border
        border-dashed
        border-transparent
        px-3
        py-1.5
        text-[13px]
        font-medium
        transition-all
        hover:border-primary
        hover:bg-primary/[0.03]
      "
    >
      {
        label
      }

      <ArrowUpRight
        size={11}
        className="
          text-muted-foreground
        "
      />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Help Center mobile menu                                                    */
/* -------------------------------------------------------------------------- */

const helpLinks = [
  {
    label: 'Help Home',
    href: '/help',
  },
  {
    label: 'Resources',
    href: '/help/resources',
  },
  {
    label: 'Guides',
    href: '/help/guides',
  },
  {
    label: 'FAQ',
    href: '/help/faq',
  },
  {
    label: 'Free Tools',
    href: '/help/tools',
  },
  {
    label: 'Contact Us',
    href: '/help/contact',
  },
];

function HelpCenterMobileMenu({
  onNavigate,
}: {
  onNavigate: () => void;
}) {
  const pathname =
    usePathname();

  return (
    <div
      className="
        container-page
        py-6
      "
    >
      <p
        className="
          mb-5
          text-[11px]
          font-semibold
          uppercase
          tracking-[0.12em]
          text-muted-foreground
        "
      >
        Help Center
      </p>

      <nav>
        <ul
          className="
            divide-y
            divide-border
          "
        >
          {helpLinks.map(
            (item) => {
              const active =
                pathname ===
                item.href ||
                pathname.startsWith(
                  `${item.href}/`
                );

              return (
                <li
                  key={
                    item.href
                  }
                >
                  <Link
                    href={
                      item.href
                    }
                    onClick={
                      onNavigate
                    }
                    className={cn(
                      `
                        flex
                        items-center
                        justify-between
                        py-4
                        text-[16px]
                        font-medium
                      `,
                      active
                        ? 'text-primary'
                        : 'text-foreground'
                    )}
                  >
                    {
                      item.label
                    }

                    <ArrowRight
                      size={17}
                      className="
                        text-muted-foreground
                      "
                    />
                  </Link>
                </li>
              );
            }
          )}
        </ul>
      </nav>

      <div
        className="
          mt-8
          border-t
          border-border
          pt-6
        "
      >
        <Link
          href="/contact"
          onClick={
            onNavigate
          }
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-full
            bg-foreground
            px-5
            py-3.5
            text-sm
            font-semibold
            text-background
          "
        >
          Contact Bivi

          <ArrowRight
            size={16}
          />
        </Link>
      </div>
    </div>
  );
}