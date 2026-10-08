'use client';

import Link from 'next/link';

import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import {
  ArrowRight,
  LogIn,
  Sparkles,
} from 'lucide-react';

import { useRouter } from 'next/navigation';

import { ClientLogin } from '@/components/portal/ClientLogin';
import { Input } from '@/components/ui/input';
import { browserAccountOrigins } from '@/lib/site/origins';

export type ClientAuthMode =
  | 'login'
  | 'signup';

interface ClientAuthSwitcherProps {
  configured: boolean;
  initialMode?: ClientAuthMode;
}

export function ClientAuthSwitcher({
  configured,
  initialMode = 'login',
}: ClientAuthSwitcherProps) {
  const router = useRouter();

  const [mode, setMode] =
    useState<ClientAuthMode>(
      initialMode
    );

  const [email, setEmail] =
    useState('');

  const remoteLogin =
    typeof window !== 'undefined' &&
    browserAccountOrigins() !== null;

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  function startProject(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalized =
      email.trim();

    if (!normalized) {
      return;
    }

    router.push(
      `/get-started?email=${encodeURIComponent(
        normalized
      )}`
    );
  }

  return (
    <div
      className="
        mt-6
        h-[440px]
        w-full
      "
    >
      {/* ---------------------------------------------------------- */}
      {/* SWITCHER                                                   */}
      {/* ---------------------------------------------------------- */}

      <div
        className="
          relative
          grid
          h-[50px]
          grid-cols-2
          rounded-[14px]
          border
          border-white/[0.09]
          bg-white/[0.025]
          p-1
        "
      >
        <div
          aria-hidden="true"
          className={`
            absolute
            bottom-1
            top-1
            w-[calc(50%-4px)]
            rounded-[10px]
            bg-white
            shadow-sm
            transition-transform
            duration-300
            ease-[cubic-bezier(0.16,1,0.3,1)]

            ${
              mode === 'signup'
                ? 'translate-x-[calc(100%+4px)]'
                : 'translate-x-0'
            }
          `}
          style={{
            left: '4px',
          }}
        />

        <button
          type="button"
          onClick={() =>
            setMode('login')
          }
          className={`
            relative
            z-10
            flex
            items-center
            justify-center
            gap-2
            rounded-[10px]
            font-mono
            text-[11px]
            font-semibold
            transition-colors

            ${
              mode === 'login'
                ? 'text-black'
                : 'text-white/35 hover:text-white/70'
            }
          `}
        >
          <LogIn className="h-3.5 w-3.5" />

          Log in
        </button>

        <button
          type="button"
          onClick={() =>
            setMode('signup')
          }
          className={`
            relative
            z-10
            flex
            items-center
            justify-center
            gap-2
            rounded-[10px]
            font-mono
            text-[11px]
            font-semibold
            transition-colors

            ${
              mode === 'signup'
                ? 'text-black'
                : 'text-white/35 hover:text-white/70'
            }
          `}
        >
          <Sparkles className="h-3.5 w-3.5" />

          Sign up
        </button>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* FIXED AUTH STAGE                                           */}
      {/* Both states permanently occupy the same space.             */}
      {/* ---------------------------------------------------------- */}

      <div
        className="
          relative
          h-[390px]
          overflow-visible
        "
      >
        {/* LOGIN */}

        <div
          className={`
            absolute
            inset-0
            transition-opacity
            duration-150

            ${
              mode === 'login'
                ? 'pointer-events-auto opacity-100'
                : 'pointer-events-none opacity-0'
            }
          `}
          aria-hidden={
            mode !== 'login'
          }
        >
          {remoteLogin ? (
            <div className="pt-6">
              <p className="text-[12px] leading-5 text-white/45">
                Account sign-in now lives in the secure Bivi client app.
              </p>

              <Link
                href="/client/login"
                tabIndex={mode === 'login' ? 0 : -1}
                className="mt-5 flex h-11 w-full items-center justify-center rounded-[12px] bg-white px-4 font-mono text-[12px] font-semibold text-black transition hover:bg-white/90"
              >
                Continue to login
              </Link>
            </div>
          ) : (
            <>
              <ClientLogin
                configured={
                  configured
                }
              />

              <div className="mt-3 text-center">
                <Link
                  href="/client/recover"
                  tabIndex={
                    mode === 'login'
                      ? 0
                      : -1
                  }
                  className="
                    font-mono
                    text-[11px]
                    text-white/28
                    transition-colors
                    hover:text-white/70
                  "
                >
                  Forgot your password?
                </Link>
              </div>
            </>
          )}
        </div>

        {/* SIGN UP */}

        <form
          onSubmit={startProject}
          aria-hidden={
            mode !== 'signup'
          }
          className={`
            absolute
            inset-0
            pt-6
            transition-opacity
            duration-150

            ${
              mode === 'signup'
                ? 'pointer-events-auto opacity-100'
                : 'pointer-events-none opacity-0'
            }
          `}
        >
          <h3
            className="
              font-heading
              text-[19px]
              font-semibold
              tracking-[-0.025em]
              text-white
            "
          >
            Start something new.
          </h3>

          <p
            className="
              mt-1.5
              text-[12px]
              leading-5
              text-white/40
            "
          >
            Enter your email to
            begin your project
            request.
          </p>

          <div className="mt-5">
            <label
              htmlFor="signup-email"
              className="
                mb-1.5
                block
                font-mono
                text-[9px]
                text-white/55
              "
            >
              Email address
            </label>

            <Input
              id="signup-email"
              value={email}
              onChange={(
                event
              ) =>
                setEmail(
                  event.target
                    .value
                )
              }
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              placeholder="you@company.com"
              tabIndex={
                mode === 'signup'
                  ? 0
                  : -1
              }
              className="
                h-11
                rounded-[12px]
                border-white/[0.09]
                bg-white/[0.045]
                px-3.5
                text-sm
                text-white
                shadow-none
                placeholder:text-white/20
                focus-visible:ring-1
                focus-visible:ring-white/20
              "
            />
          </div>

          <button
            type="submit"
            tabIndex={
              mode === 'signup'
                ? 0
                : -1
            }
            className="
              mt-4
              flex
              h-11
              w-full
              items-center
              justify-center
              gap-2.5
              rounded-[14px]
              bg-white
              px-4
              font-mono
              text-[13px]
              font-semibold
              text-black
              transition
              hover:bg-white/90
            "
          >
            Start a project

            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <p
            className="
              mt-3
              text-center
              text-[10px]
              leading-4
              text-white/30
            "
          >
            No payment required to get started.
          </p>
        </form>
      </div>
    </div>
  );
}