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

export function Navbar() {
  const pathname =
    usePathname();

  const [
    scrolled,
    setScrolled,
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

  /* ---------------------------------------------------------------------- */
  /* Route state                                                            */
  /* ---------------------------------------------------------------------- */

  const isHelpCenter =
    pathname === '/help' ||
    pathname.startsWith(
      '/help/'
    );

  /*
   * Homepage and the main Help Center
   * landing page can use the transparent
   * navbar over their hero images.
   *
   * Inner Help Center pages use the
   * normal theme navbar immediately.
   */
  const allowTransparentNavbar =
    pathname === '/' ||
    pathname === '/help' ||
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

  const navbarSurfaceActive =
    !allowTransparentNavbar ||
    scrolled ||
    Boolean(activeMega) ||
    searchOpen ||
    settingsOpen ||
    open;

  /*
   * Normal theme navbar appears when:
   *
   * - the page does not support a transparent navbar
   * - the page has been scrolled
   * - a main site menu is hovered
   * - Search is open
   * - Settings is open
   * - mobile navigation is open
   */

  /* ---------------------------------------------------------------------- */
  /* Scroll state                                                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const onScroll = () => {
      setScrolled(
        window.scrollY > 24
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
  /* Close route-specific navigation when pathname changes                  */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    setOpen(false);
    setActiveMega(null);
    setSearchOpen(false);
    setSettingsOpen(false);
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

    /*
     * Opening a main mega menu closes
     * Search and Settings.
     */

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
            /*
             * Only close when a regular
             * site mega menu is active.
             *
             * Search and Settings use
             * the shared utility panel.
             */
            if (activeMega) {
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
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.7,
          ease: [
            0.16,
            1,
            0.3,
            1,
          ],
          delay: 0.1,
        }}
        className={cn(
          `
            fixed
            inset-x-0
            top-0
            z-50
          `,
          navbarSurfaceActive
            ? `
                border-b
                border-border/60
                bg-background
                text-foreground
              `
            : `
                border-b
                border-transparent
                bg-transparent
                text-white
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

          <NavbarBrand
            surfaceActive={
              navbarSurfaceActive
            }
          />

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
            open={open}
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
        </nav>

        {/* ------------------------------------------------------------- */}
        {/* Shared Search / Settings panel                               */}
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
        {/* Desktop mega menu                                            */}
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
          open={open}
          onNavigate={
            handleNav
          }
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
              key={item.href}
              href={item.href}
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

              {/* Active indicator */}

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