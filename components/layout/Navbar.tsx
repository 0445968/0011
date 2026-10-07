'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import Link from 'next/link';

import {
  usePathname,
} from 'next/navigation';

import {
  motion,
} from 'framer-motion';

import {
  cn,
} from '@/lib/utils';

import {
  ClientAuthModal,
  type ClientAuthMode,
} from '@/components/portal/ClientAuthModal';

import {
  NavbarMenu,
} from './NavbarMenu';

import {
  MegaMenu,
} from './MegaMenu';

import {
  NavbarBrand,
} from './navbar/NavbarBrand';

import {
  NavbarDesktopUtilities,
} from './navbar/NavbarDesktopUtilities';

import {
  NavbarMobileUtilities,
} from './navbar/NavbarMobileUtilities';

import {
  NavbarMobileMenu,
} from './navbar/NavbarMobileMenu';

import {
  NavbarUtilityPanel,
} from './navbar/NavbarUtilityPanel';

/* -------------------------------------------------------------------------- */
/* Help Center navigation                                                     */
/* -------------------------------------------------------------------------- */

const helpNavigation = [
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

/* -------------------------------------------------------------------------- */
/* Scroll thresholds                                                          */
/* -------------------------------------------------------------------------- */

const STICKY_START = 0;
const STICKY_SHOW = 0;

export function Navbar() {
  const pathname =
    usePathname();

  const [
    scrolled,
    setScrolled,
  ] = useState(false);

  const [
    stickyVisible,
    setStickyVisible,
  ] = useState(false);

  const [
    isMobileViewport,
    setIsMobileViewport,
  ] = useState(false);

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    activeMega,
    setActiveMega,
  ] =
    useState<
      string | null
    >(null);

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);

  const [
    authOpen,
    setAuthOpen,
  ] = useState(false);

  const [
    authMode,
    setAuthMode,
  ] =
    useState<ClientAuthMode>(
      'login'
    );

  const closeTimer =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  /* ---------------------------------------------------------------------- */
  /* Route state                                                            */
  /* ---------------------------------------------------------------------- */

  const isHelpCenter =
    pathname === '/help' ||
    pathname.startsWith(
      '/help/'
    );

  const allowTransparentNavbar =
    pathname === '/' ||
    pathname === '/help' ||
    pathname ===
      '/process' ||
    pathname ===
      '/services' ||
    pathname === '/about' ||
    pathname === '/demos';

  /* ---------------------------------------------------------------------- */
  /* Overlay / utility state                                                */
  /* ---------------------------------------------------------------------- */

  const megaOpen =
    Boolean(activeMega) ||
    settingsOpen;

  const utilityMode:
    | 'settings'
    | null =
    settingsOpen
      ? 'settings'
      : null;

  const navbarSurfaceActive =
    !allowTransparentNavbar ||
    scrolled ||
    Boolean(activeMega) ||
    settingsOpen ||
    open;

  const mobileNavbarSurfaceActive =
    scrolled ||
    open ||
    settingsOpen;

  const navbarIsFixed =
    !allowTransparentNavbar ||
    scrolled;

  const desktopNavbarShouldShow =
    !allowTransparentNavbar ||
    !scrolled ||
    stickyVisible;

  const navbarShouldShow =
    isMobileViewport
      ? true
      : desktopNavbarShouldShow;

  /* ---------------------------------------------------------------------- */
  /* Mobile viewport                                                        */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        '(max-width: 767px)'
      );

    const updateViewport =
      () => {
        setIsMobileViewport(
          mediaQuery.matches
        );
      };

    updateViewport();

    mediaQuery.addEventListener(
      'change',
      updateViewport
    );

    return () => {
      mediaQuery.removeEventListener(
        'change',
        updateViewport
      );
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Scroll state                                                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const onScroll = () => {
      const scrollY =
        window.scrollY;

      setScrolled(
        scrollY >
          STICKY_START
      );

      setStickyVisible(
        scrollY >
          STICKY_SHOW
      );
    };

    onScroll();

    window.addEventListener(
      'scroll',
      onScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        'scroll',
        onScroll
      );
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Route changes                                                          */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    setOpen(false);
    setActiveMega(null);
    setSettingsOpen(false);
    setAuthOpen(false);

    setScrolled(
      window.scrollY >
        STICKY_START
    );

    setStickyVisible(
      window.scrollY >
        STICKY_SHOW
    );
  }, [pathname]);

  /* ---------------------------------------------------------------------- */
  /* Mobile menu scroll lock                                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    document.body.style.overflow =
      open ? 'hidden' : '';

    return () => {
      document.body.style.overflow =
        '';
    };
  }, [open]);

  /* ---------------------------------------------------------------------- */
  /* Utility panel                                                          */
  /* ---------------------------------------------------------------------- */

  const closeUtilityPanel =
    () => {
      setSettingsOpen(false);
    };

  /* ---------------------------------------------------------------------- */
  /* Mega menu                                                              */
  /* ---------------------------------------------------------------------- */

  const openMega = (
    id: string
  ) => {
    if (
      closeTimer.current
    ) {
      clearTimeout(
        closeTimer.current
      );
    }

    setSettingsOpen(false);
    setAuthOpen(false);

    setActiveMega(id);
  };

  const closeMega = () => {
    if (
      closeTimer.current
    ) {
      clearTimeout(
        closeTimer.current
      );
    }

    setActiveMega(null);
  };

  /* ---------------------------------------------------------------------- */
  /* Navigation                                                             */
  /* ---------------------------------------------------------------------- */

  const handleNav = () => {
    setOpen(false);
    setActiveMega(null);
    setSettingsOpen(false);
  };

  /* ---------------------------------------------------------------------- */
  /* Settings                                                               */
  /* ---------------------------------------------------------------------- */

  const handleSettingsOpen =
    () => {
      setActiveMega(null);
      setAuthOpen(false);

      if (open) {
        setOpen(false);
      }
    };

  /* ---------------------------------------------------------------------- */
  /* Authentication                                                        */
  /* ---------------------------------------------------------------------- */

  const openAuth = (
    mode: ClientAuthMode
  ) => {
    setAuthMode(mode);

    setActiveMega(null);
    setSettingsOpen(false);
    setOpen(false);

    setAuthOpen(true);
  };

  const handleLogin = () => {
    openAuth('login');
  };

  const handleSignup = () => {
    openAuth('signup');
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Page overlay                                                       */}
      {/* ------------------------------------------------------------------ */}

      {megaOpen && (
        <div
          className="
            fixed
            inset-0
            z-40
            bg-black/30
            backdrop-blur-sm
          "
          onMouseEnter={() => {
            if (activeMega) {
              closeMega();
            }
          }}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Navbar                                                             */}
      {/* ------------------------------------------------------------------ */}

      <motion.header
        initial={{
          y: -80,
          opacity: 0,
        }}
        animate={{
          y: navbarShouldShow
            ? 0
            : -96,

          opacity:
            navbarShouldShow
              ? 1
              : 0,
        }}
        transition={{
          y: {
            duration: 0.45,
            ease: [
              0.16,
              1,
              0.3,
              1,
            ],
          },

          opacity: {
            duration: 0.25,
          },
        }}
        className={cn(
          `
            inset-x-0
            top-0
            z-50
            transition-[background-color,border-color,box-shadow]
            duration-50
          `,
          navbarIsFixed
            ? `
                fixed
              `
            : `
                absolute
              `,
          navbarSurfaceActive
            ? `
                bg-transparent
                text-foreground

                lg:border-b
                lg:border-border/60
                lg:bg-background
              `
            : `
                bg-transparent
                text-white

                lg:border-b
                lg:border-transparent
              `,
          navbarIsFixed &&
            navbarSurfaceActive &&
            `
              lg:shadow-sm
            `
        )}
      >
        <nav
          className="
            container-page
            relative
            z-[70]
            flex
            h-16
            items-center
            justify-between
            md:h-20
          "
        >
          {/* Brand */}

          <div className="hidden lg:block">
            <NavbarBrand
              surfaceActive={
                navbarSurfaceActive
              }
            />
          </div>

          {/* Desktop navigation */}

          {isHelpCenter ? (
            <HelpCenterNavigation
              pathname={
                pathname
              }
              surfaceActive={
                navbarSurfaceActive
              }
            />
          ) : (
            <NavbarMenu
              activeMega={
                activeMega
              }
              onHover={
                openMega
              }
              onStandaloneHover={
                closeMega
              }
              lightAtTop={
                !navbarSurfaceActive
              }
            />
          )}

          {/* Desktop utilities */}

          <NavbarDesktopUtilities
            surfaceActive={
              navbarSurfaceActive
            }
            onLogin={
              handleLogin
            }
            onSignup={
              handleSignup
            }
            settingsOpen={
              settingsOpen
            }
            setSettingsOpen={
              setSettingsOpen
            }
            onSettingsOpen={
              handleSettingsOpen
            }
          />

          {/* Mobile utilities */}

          <NavbarMobileUtilities
            surfaceActive={
              mobileNavbarSurfaceActive
            }
            open={open}
            setOpen={
              setOpen
            }
            settingsOpen={
              settingsOpen
            }
            onLogin={
              handleLogin
            }
            onSignup={
              handleSignup
            }
          />
        </nav>

        {/* Settings */}

        <NavbarUtilityPanel
          mode={
            utilityMode
          }
          onClose={
            closeUtilityPanel
          }
        />

        {/* Mega menu */}

        {!isHelpCenter && (
          <MegaMenu
            activeMega={
              activeMega
            }
            closeTimer={
              closeTimer
            }
            handleNav={
              handleNav
            }
            onClose={
              closeMega
            }
          />
        )}

        {/* Mobile menu */}

        <NavbarMobileMenu
          open={open}
          onNavigate={
            handleNav
          }
          onSettingsOpen={() => {
            setOpen(false);
            setActiveMega(null);
            setSettingsOpen(
              true
            );
          }}
        />
      </motion.header>

      {/* ------------------------------------------------------------------ */}
      {/* Client authentication popup                                        */}
      {/* ------------------------------------------------------------------ */}

      <ClientAuthModal
        open={authOpen}
        mode={authMode}
        configured
        onClose={() =>
          setAuthOpen(false)
        }
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Help Center desktop navigation                                             */
/* -------------------------------------------------------------------------- */

interface HelpCenterNavigationProps {
  pathname: string;
  surfaceActive: boolean;
}

function HelpCenterNavigation({
  pathname,
  surfaceActive,
}: HelpCenterNavigationProps) {
  return (
    <div
      className="
        absolute
        left-1/2
        hidden
        -translate-x-1/2
        items-center
        gap-1
        lg:flex
      "
    >
      {helpNavigation.map(
        (item) => {
          const active =
            pathname ===
              item.href ||
            pathname.startsWith(
              `${item.href}/`
            );

          return (
            <Link
              key={
                item.href
              }
              href={
                item.href
              }
              className={cn(
                `
                  relative
                  rounded-lg
                  px-3
                  py-2
                  text-[13px]
                  font-medium
                  transition-colors
                  duration-150
                `,
                surfaceActive
                  ? active
                    ? `
                        text-foreground
                      `
                    : `
                        text-muted-foreground
                        hover:text-foreground
                      `
                  : active
                    ? `
                        text-white
                      `
                    : `
                        text-white/75
                        hover:text-white
                      `
              )}
            >
              {item.label}

              <span
                className={cn(
                  `
                    absolute
                    -bottom-[1px]
                    left-3
                    right-3
                    h-[2px]
                    rounded-full
                    bg-[#BBFF1B]
                    transition-opacity
                    duration-150
                  `,
                  active
                    ? 'opacity-100'
                    : 'opacity-0'
                )}
              />
            </Link>
          );
        }
      )}
    </div>
  );
}