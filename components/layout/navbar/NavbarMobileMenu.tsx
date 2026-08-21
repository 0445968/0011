'use client';

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
  BookOpen,
  FileText,
  HelpCircle,
  Home,
  MessageSquareText,
  Wrench,
} from 'lucide-react';

import {
  navSections,
} from '@/data/site';

import {
  useI18n,
} from '@/lib/i18n/context';

/* -------------------------------------------------------------------------- */
/* Help Center navigation                                                     */
/* -------------------------------------------------------------------------- */

const helpNavigation = [
  {
    label: 'Help Home',
    href: '/help',
    icon: Home,
  },
  {
    label: 'Resources',
    href: '/help/resources',
    icon: FileText,
  },
  {
    label: 'Guides',
    href: '/help/guides',
    icon: BookOpen,
  },
  {
    label: 'FAQ',
    href: '/help/faq',
    icon: HelpCircle,
  },
  {
    label: 'Free Tools',
    href: '/help/tools',
    icon: Wrench,
  },
  {
    label: 'Contact Us',
    href: '/help/contact',
    icon: MessageSquareText,
  },
];

interface NavbarMobileMenuProps {
  open: boolean;
  onNavigate: () => void;
}

export function NavbarMobileMenu({
  open,
  onNavigate,
}: NavbarMobileMenuProps) {
  const {
    t,
  } = useI18n();

  const pathname =
    usePathname();

  const isHelpCenter =
    pathname === '/help' ||
    pathname.startsWith(
      '/help/'
    );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
            height: 0,
          }}
          animate={{
            opacity: 1,
            height: 'auto',
          }}
          exit={{
            opacity: 0,
            height: 0,
          }}
          transition={{
            duration: 0.3,
            ease: [
              0.16,
              1,
              0.3,
              1,
            ],
          }}
          className="
            relative
            z-40
            border-t
            border-border
            bg-background
            lg:hidden
          "
        >
          <div
            className="
              container-page
              max-h-[80vh]
              overflow-y-auto
              py-4
            "
          >
            {isHelpCenter ? (
              <HelpCenterMobileMenu
                pathname={
                  pathname
                }
                onNavigate={
                  onNavigate
                }
              />
            ) : (
              <DefaultMobileMenu
                onNavigate={
                  onNavigate
                }
                t={t}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/* Help Center mobile menu                                                    */
/* -------------------------------------------------------------------------- */

interface HelpCenterMobileMenuProps {
  pathname: string;
  onNavigate: () => void;
}

function HelpCenterMobileMenu({
  pathname,
  onNavigate,
}: HelpCenterMobileMenuProps) {
  return (
    <>
      {/* ------------------------------------------------------------ */}
      {/* Header                                                       */}
      {/* ------------------------------------------------------------ */}

      <div
        className="
          px-4
          pb-4
          pt-1
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
          Help Center
        </p>

        <p
          className="
            mt-2
            max-w-sm
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          Browse resources, guides,
          FAQs, tools, or contact
          Design Blade directly.
        </p>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Navigation                                                   */}
      {/* ------------------------------------------------------------ */}

      <div
        className="
          mt-1
          flex
          flex-col
          gap-1
        "
      >
        {helpNavigation.map(
          (item) => {
            const Icon =
              item.icon;

            const active =
              pathname ===
                item.href ||
              (
                item.href !==
                  '/help' &&
                pathname.startsWith(
                  `${item.href}/`
                )
              );

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={
                  onNavigate
                }
                className={`
                  group
                  flex
                  items-center
                  justify-between
                  gap-4
                  rounded-xl
                  px-4
                  py-3.5
                  transition-colors
                  duration-150
                  ${
                    active
                      ? `
                          bg-primary/10
                          text-foreground
                        `
                      : `
                          text-foreground
                          hover:bg-muted
                        `
                  }
                `}
              >
                <div
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-3
                  "
                >
                  <div
                    className={`
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      transition-colors
                      duration-150
                      ${
                        active
                          ? `
                              bg-primary
                              text-white
                            `
                          : `
                              bg-secondary
                              text-muted-foreground
                              group-hover:text-primary
                            `
                      }
                    `}
                  >
                    <Icon
                      size={16}
                      strokeWidth={2}
                    />
                  </div>

                  <span
                    className="
                      truncate
                      text-base
                      font-semibold
                    "
                  >
                    {item.label}
                  </span>
                </div>

                <ArrowRight
                  size={15}
                  strokeWidth={2}
                  className={`
                    shrink-0
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                    ${
                      active
                        ? `
                            text-primary
                          `
                        : `
                            text-muted-foreground
                          `
                    }
                  `}
                />
              </Link>
            );
          }
        )}
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Divider                                                      */}
      {/* ------------------------------------------------------------ */}

      <div
        className="
          my-5
          h-px
          bg-border
        "
      />

      {/* ------------------------------------------------------------ */}
      {/* Contact CTA                                                  */}
      {/* ------------------------------------------------------------ */}

      <div
        className="
          px-1
        "
      >
        <Link
          href="/help/contact"
          onClick={
            onNavigate
          }
          className="
            group
            flex
            items-center
            justify-between
            gap-4
            rounded-[14px]
            bg-primary
            px-5
            py-4
            text-white
          "
        >
          <div>
            <p
              className="
                text-sm
                font-semibold
              "
            >
              Contact Design Blade
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-white/70
              "
            >
              Bug, feature, demo,
              or appointment request
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
              bg-[#BBFF1B]
              text-black
            "
          >
            <ArrowRight
              size={15}
              strokeWidth={2}
              className="
                transition-transform
                duration-200
                group-hover:translate-x-1
              "
            />
          </div>
        </Link>

        <p
          className="
            px-3
            pb-1
            pt-4
            text-center
            text-[11px]
            leading-5
            text-muted-foreground
          "
        >
          No account or sign-in
          required.
        </p>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Standard website mobile menu                                               */
/* -------------------------------------------------------------------------- */

interface DefaultMobileMenuProps {
  onNavigate: () => void;
  t: (key: string) => string;
}

function DefaultMobileMenu({
  onNavigate,
  t,
}: DefaultMobileMenuProps) {
  return (
    <>
      {navSections.map(
        (link) => (
          <a
            key={link.id}
            href={link.href}
            onClick={
              onNavigate
            }
            className="
              block
              rounded-lg
              px-4
              py-3
              text-base
              font-semibold
              text-foreground
              hover:bg-muted
            "
          >
            {link.id === 'helpCenter'
  ? link.label
  : t(
      `nav.${link.id}`
    )}
          </a>
        )
      )}

      {/* Get a Demo */}

      <a
        href="/demos"
        onClick={
          onNavigate
        }
        className="
          mt-3
          block
          px-4
          py-3
          text-center
          text-base
          font-semibold
          text-foreground
        "
      >
        Get a Demo
      </a>

      {/* Start a Project */}

      <a
        href="/contact"
        onClick={
          onNavigate
        }
        className="
          mt-2
          block
          rounded-[14px]
          bg-primary
          px-4
          py-3
          text-center
          text-base
          font-bold
          text-primary-foreground
        "
      >
        {t(
          'nav.startProject'
        )}
      </a>
    </>
  );
}