'use client';

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
  SlidersHorizontal,
  X,
} from 'lucide-react';

import { SettingsPanel } from './SettingsPanel';

export function NavbarSettings({
  onOpen,
}: {
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const panelRef =
    useRef<HTMLDivElement>(null);


  /*
   * Lock page scrolling while open
   */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);


  /*
   * Close when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };


    if (open) {
      document.addEventListener(
        'mousedown',
        handleClickOutside
      );
    }


    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };

  }, [open]);


  /*
   * Close with Escape
   */
  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };


    window.addEventListener(
      'keydown',
      handleEscape
    );


    return () =>
      window.removeEventListener(
        'keydown',
        handleEscape
      );

  }, []);


  const closeSettings = () => {
    setOpen(false);
  };


  return (
    <div
      ref={panelRef}
      className="relative"
    >

      {/* Trigger */}
      <button
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
        <SlidersHorizontal size={18} />
      </button>


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
              duration: 0.22,
              ease: [0.16, 1, 0.3, 1],
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



            <SettingsPanel onClose={closeSettings} />

          </motion.div>

        )}
      </AnimatePresence>

    </div>
  );
}