'use client';

import {
  useEffect,
  useRef,
} from 'react';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';

import {
  SlidersHorizontal,
} from 'lucide-react';

import { SettingsPanel } from './SettingsPanel';

export function NavbarSettings({
  open,
  setOpen,
  onOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  onOpen?: () => void;
}) {
  const panelRef =
    useRef<HTMLDivElement>(null);

  /* ---------------------------------------------------------------------- */
  /* Close when clicking outside Settings                                   */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target =
        event.target as HTMLElement | null;

      if (!target) {
        return;
      }

      /*
       * Desktop and mobile NavbarSettings
       * instances can both exist in the DOM.
       *
       * Treat clicks inside either instance
       * as inside Settings.
       */
      const insideSettings =
        target.closest(
          '[data-navbar-settings]'
        );

      if (insideSettings) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, [open, setOpen]);

  /* ---------------------------------------------------------------------- */
  /* Close with Escape                                                      */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === 'Escape' &&
        open
      ) {
        setOpen(false);
      }
    };

    window.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, [open, setOpen]);

  /* ---------------------------------------------------------------------- */
  /* Close Settings                                                         */
  /* ---------------------------------------------------------------------- */

  const closeSettings = () => {
    setOpen(false);
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div
      ref={panelRef}
      data-navbar-settings
      className="relative"
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          const next = !open;

          setOpen(next);

          if (next) {
            onOpen?.();
          }
        }}
        aria-label="Preferences"
        aria-expanded={open}
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          text-muted-foreground
          transition-colors
          hover:text-foreground
        "
      >
        <SlidersHorizontal
          size={18}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            data-navbar-settings
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: 640,
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.25,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
            className="
              fixed
              left-0
              right-0
              top-16
              z-50
              overflow-hidden
              border-t
              border-border
              bg-background
              shadow-xl
              lg:top-20
            "
          >
            <SettingsPanel
              onClose={
                closeSettings
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}