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

/*
 * Small movements are ignored on mobile
 * so the navbar does not flicker while
 * the user is resting their finger.
 */
const MOBILE_SCROLL_THRESHOLD = 5;

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
    mobileNavbarVisible,
    setMobileNavbarVisible,
  ] = useState(true);

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
  ] = useState<string | null>(
    null
  );

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);

  const closeTimer =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  const lastScrollY =
    useRef(0);

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
    pathname === '/process' ||
    pathname === '/services' ||
    pathname === '/about' ||
    pathname === '/demos';

  /* ---------------------------------------------------------------------- */
  /* Overlay / utility state                                                */
  /* ---------------------------------------------------------------------- */

  const megaOpen =
    Boolean(activeMega) ||
    searchOpen ||
    settingsOpen;

  const utilityMode:
    | 'search'
    | 'settings'
    | null =
    searchOpen
      ? 'search'
      : settingsOpen
        ? 'settings'
        : null;

  /*
   * On pages with transparent headers:
   * - transparent at the top
   * - solid after entering sticky mode
   *
   * Opening a menu/search/settings also activates the solid surface.
   */
  const navbarSurfaceActive =
    !allowTransparentNavbar ||
    scrolled ||
    Boolean(activeMega) ||
    searchOpen ||
    settingsOpen ||
    open;

  /*
   * Normal pages retain their fixed navbar.
   *
   * Transparent pages begin as an absolute navbar
   * and become fixed after scrolling.
   */
  const navbarIsFixed =
    !allowTransparentNavbar ||
    scrolled;

  /*
   * Existing desktop behavior.
   */
  const desktopNavbarShouldShow =
    !allowTransparentNavbar ||
    !scrolled ||
    stickyVisible;

  /*
   * Mobile behavior:
   *
   * - visible at the top
   * - hidden while scrolling down
   * - visible while scrolling up
   * - forced visible whenever a mobile overlay is open
   *
   * Desktop continues using the original behavior.
   */
  const navbarShouldShow =
    isMobileViewport
      ? (
          mobileNavbarVisible ||
          open ||
          searchOpen ||
          settingsOpen
        )
      : desktopNavbarShouldShow;

  /* ---------------------------------------------------------------------- */
  /* Mobile viewport                                                        */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        '(max-width: 767px)'
      );

    const updateViewport = () => {
      const mobile =
        mediaQuery.matches;

      setIsMobileViewport(
        mobile
      );

      /*
       * When moving from mobile back
       * to desktop, make sure mobile
       * visibility state cannot leave
       * the navbar hidden.
       */
      if (!mobile) {
        setMobileNavbarVisible(
          true
        );
      }
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
    lastScrollY.current =
      window.scrollY;

    const onScroll = () => {
      const scrollY =
        window.scrollY;

      const previousScrollY =
        lastScrollY.current;

      const scrollDifference =
        scrollY -
        previousScrollY;

      /*
       * Keep the existing desktop
       * sticky behavior unchanged.
       */
      setScrolled(
        scrollY > STICKY_START
      );

      setStickyVisible(
        scrollY > STICKY_SHOW
      );

      /*
       * Mobile:
       *
       * Scroll down  -> hide
       * Scroll up    -> show
       * Near top     -> always show
       */
      if (
        window.innerWidth <
        768
      ) {
        if (scrollY <= 8) {
          setMobileNavbarVisible(
            true
          );
        } else if (
          scrollDifference >
          MOBILE_SCROLL_THRESHOLD
        ) {
          setMobileNavbarVisible(
            false
          );
        } else if (
          scrollDifference <
          -MOBILE_SCROLL_THRESHOLD
        ) {
          setMobileNavbarVisible(
            true
          );
        }
      }

      lastScrollY.current =
        scrollY;
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
  /* Reset navigation on route change                                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    setOpen(false);
    setActiveMega(null);
    setSearchOpen(false);
    setSettingsOpen(false);

    setMobileNavbarVisible(
      true
    );

    lastScrollY.current =
      window.scrollY;
  }, [pathname]);

  /* ---------------------------------------------------------------------- */
  /* Mobile scroll lock                                                     */
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
      setSearchOpen(false);
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

    setSearchOpen(false);
    setSettingsOpen(false);

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
    setSearchOpen(false);
    setSettingsOpen(false);
  };

  /* ---------------------------------------------------------------------- */
  /* Search                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleSearchOpen =
    () => {
      setActiveMega(null);
      setSettingsOpen(false);

      if (open) {
        setOpen(false);
      }
    };

  /* ---------------------------------------------------------------------- */
  /* Settings                                                               */
  /* ---------------------------------------------------------------------- */

  const handleSettingsOpen =
    () => {
      setActiveMega(null);
      setSearchOpen(false);

      if (open) {
        setOpen(false);
      }
    };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      {/* --------------------------------------------------------------- */}
      {/* Page overlay                                                    */}
      {/* --------------------------------------------------------------- */}

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
            if (
              activeMega
            ) {
              closeMega();
            }
          }}
        />
      )}

      {/* --------------------------------------------------------------- */}
      {/* Navbar                                                          */}
      {/* --------------------------------------------------------------- */}

      <motion.header
        initial={{
          y: -80,
          opacity: 0,
        }}
        animate={{
          y:
            navbarShouldShow
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
              shadow-sm
            `
        )}
      >
        {/* ------------------------------------------------------------- */}
        {/* Navigation bar                                               */}
        {/* ------------------------------------------------------------- */}

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
          {/* ----------------------------------------------------------- */}
          {/* Brand                                                       */}
          {/* ----------------------------------------------------------- */}

<div className="hidden lg:block">
  <NavbarBrand
    surfaceActive={
      navbarSurfaceActive
    }
  />
</div>

          {/* ----------------------------------------------------------- */}
          {/* Desktop navigation                                         */}
          {/* ----------------------------------------------------------- */}

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

          {/* ----------------------------------------------------------- */}
          {/* Desktop utilities                                          */}
          {/* ----------------------------------------------------------- */}

          <NavbarDesktopUtilities
            surfaceActive={
              navbarSurfaceActive
            }
            searchOpen={
              searchOpen
            }
            setSearchOpen={
              setSearchOpen
            }
            settingsOpen={
              settingsOpen
            }
            setSettingsOpen={
              setSettingsOpen
            }
            onSearchOpen={
              handleSearchOpen
            }
            onSettingsOpen={
              handleSettingsOpen
            }
          />

          {/* ----------------------------------------------------------- */}
          {/* Mobile utilities                                           */}
          {/* ----------------------------------------------------------- */}

<NavbarMobileUtilities
  surfaceActive={
    navbarSurfaceActive
  }
  open={
    open
  }
  setOpen={
    setOpen
  }
  searchOpen={
    searchOpen
  }
  setSearchOpen={
    setSearchOpen
  }
  settingsOpen={
    settingsOpen
  }
  onSearchOpen={
    handleSearchOpen
  }
/>
        </nav>

        {/* ------------------------------------------------------------- */}
        {/* Search / Settings                                             */}
        {/* ------------------------------------------------------------- */}

        <NavbarUtilityPanel
          mode={
            utilityMode
          }
          onClose={
            closeUtilityPanel
          }
        />

        {/* ------------------------------------------------------------- */}
        {/* Mega menu                                                     */}
        {/* ------------------------------------------------------------- */}

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

        {/* ------------------------------------------------------------- */}
        {/* Mobile menu                                                   */}
        {/* ------------------------------------------------------------- */}

<NavbarMobileMenu
  open={
    open
  }
  onNavigate={
    handleNav
  }
  onSettingsOpen={() => {
    setOpen(false);
    setSearchOpen(false);
    setActiveMega(null);

    setSettingsOpen(true);
  }}
/>
      </motion.header>
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
              {
                item.label
              }

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