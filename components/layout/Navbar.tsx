'use client';

import Image from 'next/image';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';

import {
  Menu,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { navSections } from '@/data/site';
import { useI18n } from '@/lib/i18n/context';

import { SearchCommand } from './SearchCommand';
import { NavbarSettings } from './settings/NavbarSettings';
import { NavbarMenu } from './NavbarMenu';
import { MegaMenu } from './MegaMenu';

export function Navbar() {
  const { t } = useI18n();

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

  const megaOpen =
    Boolean(activeMega) ||
    searchOpen ||
    settingsOpen;

  const utilityMenuOpen =
    searchOpen ||
    settingsOpen;

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
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        'scroll',
        onScroll
      );
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Lock page while mobile menu is open                                    */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    document.body.style.overflow =
      open ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  /* ---------------------------------------------------------------------- */
  /* Open desktop mega menu                                                 */
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
     * Hovering a main navbar item closes
     * Search and Settings.
     */
    setSearchOpen(false);
    setSettingsOpen(false);

    setActiveMega(id);
  };

  /* ---------------------------------------------------------------------- */
  /* Close desktop mega menu                                                */
  /* ---------------------------------------------------------------------- */

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

  return (
    <>
      {/* --------------------------------------------------------------- */}
      {/* Background blur                                                 */}
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
             * Only regular mega menus close
             * when moving onto the page.
             *
             * Search and Settings remain open.
             */
            if (activeMega) {
              closeMega();
            }
          }}
        />
      )}

      {/* --------------------------------------------------------------- */}
      {/* Header                                                          */}
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
        className="
  fixed
  inset-x-0
  top-0
  z-50
  border-b
  border-border/60
  bg-background
  text-foreground
  backdrop-blur-xl
  transition-colors
  duration-500
"
      >
        {/* ------------------------------------------------------------- */}
        {/* Darken navbar while Search OR Settings is open                */}
        {/* ------------------------------------------------------------- */}

        <AnimatePresence>
          {utilityMenuOpen && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.2,
                ease: [
                  0.16,
                  1,
                  0.3,
                  1,
                ],
              }}
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                z-[60]
                h-16
                bg-black/30
                md:h-20
              "
            />
          )}
        </AnimatePresence>

        {/* ------------------------------------------------------------- */}
        {/* Navigation bar                                                */}
        {/* ------------------------------------------------------------- */}

        <nav
          className="
            container-page
            flex
            h-16
            items-center
            justify-between
            md:h-20
          "
        >
          {/* Logo */}
          <a
            href="/"
            className="
              group
              flex
              items-center
            "
            aria-label="Design Blade home"
          >
            <Image
              src="/images/logo.png"
              alt="Design Blade"
              width={180}
              height={60}
              priority
              className="
                h-auto
                w-[70px]
                transition-opacity
                duration-300
                group-hover:opacity-80
              "
            />
          </a>

          {/* ----------------------------------------------------------- */}
          {/* Desktop navigation                                         */}
          {/* ----------------------------------------------------------- */}

          <NavbarMenu
            activeMega={
              activeMega
            }
            onHover={(
              id
            ) => {
              openMega(id);
            }}
          />

          {/* ----------------------------------------------------------- */}
          {/* Desktop utilities                                          */}
          {/* ----------------------------------------------------------- */}

          <div
            className="
              hidden
              items-center
              gap-3
              lg:flex
            "
          >
            <SearchCommand
              open={
                searchOpen
              }
              setOpen={
                setSearchOpen
              }
              onOpen={() => {
                setActiveMega(
                  null
                );

                setSettingsOpen(
                  false
                );
              }}
            />

            <NavbarSettings
              open={
                settingsOpen
              }
              setOpen={
                setSettingsOpen
              }
              onOpen={() => {
                setActiveMega(
                  null
                );

                setSearchOpen(
                  false
                );
              }}
            />

            <a
              href="/contact"
              className="
                rounded-full
                bg-primary
                px-5
                py-2.5
                text-sm
                font-medium
                text-primary-foreground
                transition-transform
                duration-300
                hover:scale-[1.03]
                active:scale-95
              "
            >
              {t(
                'nav.startProject'
              )}
            </a>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* Mobile utilities                                           */}
          {/* ----------------------------------------------------------- */}

          <div
            className="
              flex
              items-center
              gap-2
              lg:hidden
            "
          >
            <SearchCommand
              open={
                searchOpen
              }
              setOpen={
                setSearchOpen
              }
              onOpen={() => {
                setActiveMega(
                  null
                );

                setSettingsOpen(
                  false
                );

                setOpen(false);
              }}
            />

            <NavbarSettings
              open={
                settingsOpen
              }
              setOpen={
                setSettingsOpen
              }
              onOpen={() => {
                setActiveMega(
                  null
                );

                setSearchOpen(
                  false
                );

                setOpen(false);
              }}
            />

            <button
              type="button"
              onClick={() => {
                setSearchOpen(
                  false
                );

                setSettingsOpen(
                  false
                );

                setOpen(
                  (
                    value
                  ) =>
                    !value
                );
              }}
              aria-label={
                open
                  ? 'Close menu'
                  : 'Open menu'
              }
              aria-expanded={
                open
              }
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-lg
                text-foreground
              "
            >
              {open ? (
                <X
                  size={20}
                />
              ) : (
                <Menu
                  size={20}
                />
              )}
            </button>
          </div>
        </nav>

        {/* ------------------------------------------------------------- */}
        {/* Desktop Mega Menu                                            */}
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

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height:
                  'auto',
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
                bg-background/95
                backdrop-blur-xl
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
                {navSections.map(
                  (
                    link
                  ) => (
                    <a
                      key={
                        link.id
                      }
                      href={
                        link.href
                      }
                      onClick={
                        handleNav
                      }
                      className="
                        block
                        rounded-lg
                        px-4
                        py-3
                        text-base
                        font-medium
                        text-muted-foreground
                        transition-colors
                        hover:bg-muted
                        hover:text-foreground
                      "
                    >
                      {t(
                        `nav.${link.id}`
                      )}
                    </a>
                  )
                )}

                <a
                  href="/contact"
                  onClick={
                    handleNav
                  }
                  className="
                    mt-3
                    block
                    rounded-lg
                    bg-primary
                    px-4
                    py-3
                    text-center
                    text-base
                    font-medium
                    text-primary-foreground
                  "
                >
                  {t(
                    'nav.startProject'
                  )}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}