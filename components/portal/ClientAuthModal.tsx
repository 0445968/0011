
'use client';

import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { clientOrigin } from '@/lib/site/origins';

export type ClientAuthMode = 'login' | 'signup';

interface ClientAuthModalProps {
  open: boolean;
  mode: ClientAuthMode;
  configured: boolean;
  onClose: () => void;
}

export function ClientAuthModal({
  open,
  mode,
  onClose,
}: ClientAuthModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const loginUrl = `${clientOrigin()}/login`;
  const signupOpen = open && mode === 'signup';

  // Old login-popup requests now go to the app.
  useEffect(() => {
    if (open && mode === 'login') {
      window.location.assign(loginUrl);
    }
  }, [open, mode, loginUrl]);

  // Lock scrolling while signup is open.
  useEffect(() => {
    if (!signupOpen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [signupOpen, onClose]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) return;

    onClose();

    router.push(
      `/get-started?email=${encodeURIComponent(
        normalizedEmail
      )}`
    );
  }

  return (
    <AnimatePresence>
      {signupOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="
            fixed
            inset-0
            z-[200]
            flex
            items-center
            justify-center
            overflow-y-auto
            bg-black/75
            px-4
            py-8
            backdrop-blur-md
          "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
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
              ease: [0.16, 1, 0.3, 1],
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bivi-signup-title"
            className="
              relative
              my-auto
              w-full
              max-w-[420px]
              rounded-[18px]
              border
              border-white/10
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
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-white/10
                text-white/50
                transition-colors
                hover:text-white
              "
            >
              <X size={17} strokeWidth={2} />
            </button>

            <div className="pr-10">
              <p
                className="
                  font-mono
                  text-[9px]
                  uppercase
                  tracking-[0.2em]
                  text-white/40
                "
              >
                Bivi
              </p>

              <h2
                id="bivi-signup-title"
                className="
                  mt-2
                  font-heading
                  text-2xl
                  font-semibold
                  tracking-tight
                "
              >
                Let&apos;s create something great.              </h2>

              <p
                className="
                  mt-2
                  text-[12px]
                  leading-5
                  text-white/50
                "
              >
                Get ready to bring your ideas to life. Start your project request and collaborate with our team.
              </p>
            </div>

            <form
              onSubmit={submit}
              className="mt-7"
            >


              <div className="mt-5">
                <label
                  htmlFor="bivi-signup-email"
                  className="
                    mb-2
                    block
                    font-mono
                    text-[10px]
                    text-white/60
                  "
                >
                  Email address
                </label>

                <Input
                  id="bivi-signup-email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@company.com"
                  className="
                    h-11
                    rounded-[12px]
                    border-white/10
                    bg-white/10
                    px-3.5
                    text-sm
                    text-white
                    shadow-none
                    placeholder:text-white/30
                    focus-visible:ring-1
                    focus-visible:ring-white/20
                  "
                />
              </div>

              <button
                type="submit"
                className="
                  mt-4
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-[12px]
                  bg-[#BBFF1B]
                  px-4
                  font-mono
                  text-[13px]
                  font-semibold
                  text-black
                  transition-colors
                  hover:bg-[#BBFF1B]/90
                "
              >
                Start a project
                <ArrowRight size={16} />
              </button>

              <p
                className="
                  mt-3
                  text-center
                  text-[10px]
                  text-white/40
                "
              >
                No payment required to get started.
              </p>
            </form>

            <div
              className="
                mt-7
                border-t
                border-white/10
                pt-5
                text-center
              "
            >
              <p className="text-[12px] text-white/50">
                Already have an account?{' '}
                <a
                  href={loginUrl}
                  className="
                    font-semibold
                    text-white
                    underline
                    underline-offset-4
                    transition-colors
                    hover:text-white/70
                  "
                >
                  Log in
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
