'use client';

import {
  useEffect,
} from 'react';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';

import {
  X,
} from 'lucide-react';

import {
  ClientAuthSwitcher,
} from '@/components/portal/ClientAuthSwitcher';

export type ClientAuthMode =
  | 'login'
  | 'signup';

interface ClientAuthModalProps {
  open: boolean;
  mode: ClientAuthMode;
  configured: boolean;
  onClose: () => void;
}

export function ClientAuthModal({
  open,
  mode,
  configured,
  onClose,
}: ClientAuthModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      'hidden';

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, [
    open,
    onClose,
  ]);

  return (
    <AnimatePresence>
      {open && (
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
            duration: 0.18,
          }}
          className="
            fixed
            inset-0
            z-[200]
            flex
            items-center
            justify-center
            bg-black/75
            px-4
            py-8
            backdrop-blur-md
          "
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
              scale: 0.985,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 12,
              scale: 0.985,
            }}
            transition={{
              duration: 0.24,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Bivi account"
            className="
              relative
              w-full
              max-w-[420px]
              overflow-hidden
              rounded-[26px]
              border
              border-white/[0.08]
              bg-[#111111]
              p-6
              text-white
              shadow-[0_40px_120px_rgba(0,0,0,0.65)]
              sm:p-7
            "
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="
                absolute
                right-4
                top-4
                z-20
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-white/[0.06]
                bg-white/[0.04]
                text-white/45
                transition-colors
                hover:bg-white/[0.08]
                hover:text-white
              "
            >
              <X
                size={17}
                strokeWidth={2}
              />
            </button>

            <div className="pr-12">
              <p
                className="
                  font-mono
                  text-[9px]
                  uppercase
                  tracking-[0.2em]
                  text-white/30
                "
              >
                Bivi
              </p>

              <h2
                className="
                  mt-2
                  font-heading
                  text-2xl
                  font-semibold
                  tracking-[-0.035em]
                "
              >
                {mode ===
                'signup'
                  ? 'Start with Bivi.'
                  : 'Welcome back.'}
              </h2>

              <p
                className="
                  mt-2
                  max-w-[310px]
                  text-xs
                  leading-5
                  text-white/40
                "
              >
                {mode ===
                'signup'
                  ? 'Tell us where to reach you and begin your project.'
                  : 'Sign in to access your client workspace.'}
              </p>
            </div>

            <ClientAuthSwitcher
              configured={
                configured
              }
              initialMode={
                mode
              }
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
