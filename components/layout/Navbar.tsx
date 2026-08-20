'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

import { NavbarMenu } from './NavbarMenu';
import { MegaMenu } from './MegaMenu';

import { NavbarBrand } from './navbar/NavbarBrand';
import { NavbarDesktopUtilities } from './navbar/NavbarDesktopUtilities';
import { NavbarMobileUtilities } from './navbar/NavbarMobileUtilities';
import { NavbarMobileMenu } from './navbar/NavbarMobileMenu';
import { NavbarUtilityPanel } from './navbar/NavbarUtilityPanel';

export function Navbar() {
  const pathname = usePathname();

  const [scrolled, setScrolled] =
    useState(false);

  const [open, setOpen] =
    useState(false);

  const [activeMega, setActiveMega] =
    useState<string | null>(null);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [settingsOpen, setSettingsOpen] =
    useState(false);

  const closeTimer =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const allowTransparentNavbar =
    pathname === '/';

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
   * - the page has been scrolled
   * - a main menu item is hovered
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
  /* Mobile scroll lock                                                     */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    document.body.style.overflow =
      open ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  /* ---------------------------------------------------------------------- */
  /* Utility panel                                                          */
  /* ---------------------------------------------------------------------- */

  const closeUtilityPanel = () => {
    setSearchOpen(false);
    setSettingsOpen(false);
  };

  /* ---------------------------------------------------------------------- */
  /* Mega menu                                                              */
  /* ---------------------------------------------------------------------- */

  const openMega = (
    id: string
  ) => {
    if (closeTimer.current) {
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
    if (closeTimer.current) {
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

  const handleSearchOpen = () => {
    /*
     * The Search trigger itself sets
     * searchOpen to true.
     *
     * We only need to close the other
     * possible navigation states here.
     */
    setActiveMega(null);
    setSettingsOpen(false);

    if (open) {
      setOpen(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Settings                                                               */
  /* ---------------------------------------------------------------------- */

  const handleSettingsOpen = () => {
    /*
     * The Settings trigger itself sets
     * settingsOpen to true.
     *
     * Search is closed here so the shared
     * panel simply swaps its content.
     */
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
             * mega menu is active.
             *
             * Search and Settings are handled
             * by the shared utility panel.
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
          {/* Logo */}
          <NavbarBrand
            surfaceActive={
              navbarSurfaceActive
            }
          />

          {/* Main desktop navigation */}
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

          {/* Desktop utilities */}
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

          {/* Mobile utilities */}
          <NavbarMobileUtilities
            surfaceActive={
              navbarSurfaceActive
            }
            open={open}
            setOpen={setOpen}
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
          mode={utilityMode}
          onClose={
            closeUtilityPanel
          }
        />

        {/* ------------------------------------------------------------- */}
        {/* Desktop mega menu                                            */}
        {/* ------------------------------------------------------------- */}

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