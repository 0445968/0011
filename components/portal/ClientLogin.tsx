'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;

            callback: (response: {
              credential?: string;
            }) => void;
          }) => void;

          renderButton: (
            element: HTMLElement,
            options: {
              type?:
                | 'standard'
                | 'icon';

              theme?:
                | 'outline'
                | 'filled_blue'
                | 'filled_black';

              size?:
                | 'large'
                | 'medium'
                | 'small';

              text?:
                | 'signin_with'
                | 'signup_with'
                | 'continue_with'
                | 'signin';

              shape?:
                | 'rectangular'
                | 'pill'
                | 'circle'
                | 'square';

              logo_alignment?:
                | 'left'
                | 'center';

              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

export function ClientLogin({
  configured,
}: {
  configured: boolean;
}) {
  const router =
    useRouter();

  const googleButtonRef =
    useRef<HTMLDivElement>(
      null
    );

  const googleContainerRef =
    useRef<HTMLDivElement>(
      null
    );

  const [busy, setBusy] =
    useState(false);

  const [
    googleBusy,
    setGoogleBusy,
  ] = useState(false);

  const [error, setError] =
    useState('');

  const [
    accessDialogOpen,
    setAccessDialogOpen,
  ] = useState(false);

  function handleAuthFailure(
    status: number,
    message: string
  ) {
    if (status === 403) {
      setAccessDialogOpen(
        true
      );

      setError('');

      return;
    }

    setError(message);
  }

  const handleGoogleCredential =
    useCallback(
      async (
        credential:
          | string
          | undefined
      ) => {
        if (!credential) {
          setError(
            'Google sign-in could not be completed.'
          );

          return;
        }

        setGoogleBusy(true);
        setError('');

        try {
          const result =
            await fetch(
              '/api/client/google-session',
              {
                method:
                  'POST',

                headers: {
                  'Content-Type':
                    'application/json',
                },

                body:
                  JSON.stringify({
                    credential,
                  }),

                signal:
                  AbortSignal.timeout(
                    20000
                  ),
              }
            );

          const data =
            await result.json();

          if (!result.ok) {
            handleAuthFailure(
              result.status,

              data.error ||
                'Google sign-in could not be completed.'
            );

            return;
          }

          router.replace(
            data.redirect ||
              '/client'
          );

          router.refresh();
        } catch (err) {
          setError(
            err instanceof Error &&
              err.name !==
                'TimeoutError'
              ? err.message
              : 'Google sign-in could not be confirmed. Please try again.'
          );
        } finally {
          setGoogleBusy(false);
        }
      },
      [router]
    );

  const initializeGoogle =
    useCallback(() => {
      if (
        !window.google ||
        !googleButtonRef.current ||
        !googleContainerRef.current
      ) {
        return;
      }

      const measuredWidth =
        Math.floor(
          googleContainerRef.current
            .getBoundingClientRect()
            .width
        );

      if (
        measuredWidth <= 0
      ) {
        return;
      }

      /*
       * Leave a tiny amount of breathing
       * room around the Google iframe.
       */
      const buttonWidth =
        Math.max(
          200,
          Math.min(
            measuredWidth - 2,
            400
          )
        );

      window.google.accounts.id.initialize(
        {
          client_id:
            process.env
              .NEXT_PUBLIC_GOOGLE_CLIENT_ID!,

          callback: (
            response
          ) => {
            void handleGoogleCredential(
              response.credential
            );
          },
        }
      );

      googleButtonRef.current.innerHTML =
        '';

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape:
            'pill',
          logo_alignment:
            'left',
          width:
            buttonWidth,
        }
      );
    }, [
      handleGoogleCredential,
    ]);

  useEffect(() => {
    if (
      !configured ||
      !process.env
        .NEXT_PUBLIC_GOOGLE_CLIENT_ID
    ) {
      return;
    }

    const existingScript =
      document.querySelector<HTMLScriptElement>(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

    const handleLoaded =
      () => {
        window.requestAnimationFrame(
          initializeGoogle
        );
      };

    if (existingScript) {
      if (window.google) {
        handleLoaded();
      } else {
        existingScript.addEventListener(
          'load',
          handleLoaded
        );
      }

      return () => {
        existingScript.removeEventListener(
          'load',
          handleLoaded
        );
      };
    }

    const script =
      document.createElement(
        'script'
      );

    script.src =
      'https://accounts.google.com/gsi/client';

    script.async = true;
    script.defer = true;

    script.addEventListener(
      'load',
      handleLoaded
    );

    document.head.appendChild(
      script
    );

    return () => {
      script.removeEventListener(
        'load',
        handleLoaded
      );
    };
  }, [
    configured,
    initializeGoogle,
  ]);

  /*
   * Re-render Google's iframe whenever
   * its actual available width changes.
   */
  useEffect(() => {
    const container =
      googleContainerRef.current;

    if (!container) {
      return;
    }

    let frame:
      | number
      | null = null;

    const observer =
      new ResizeObserver(
        () => {
          if (!window.google) {
            return;
          }

          if (frame !== null) {
            window.cancelAnimationFrame(
              frame
            );
          }

          frame =
            window.requestAnimationFrame(
              initializeGoogle
            );
        }
      );

    observer.observe(
      container
    );

    return () => {
      observer.disconnect();

      if (frame !== null) {
        window.cancelAnimationFrame(
          frame
        );
      }
    };
  }, [
    initializeGoogle,
  ]);

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (busy) {
      return;
    }

    const form =
      new FormData(
        event.currentTarget
      );

    setBusy(true);
    setError('');

    try {
      const response =
        await fetch(
          '/api/client/session',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                email:
                  form.get(
                    'email'
                  ),

                password:
                  form.get(
                    'password'
                  ),
              }),

            signal:
              AbortSignal.timeout(
                20000
              ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        handleAuthFailure(
          response.status,

          data.error ||
            'Could not sign in.'
        );

        return;
      }

      router.replace(
        data.redirect ||
          '/client'
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error &&
          err.name !==
            'TimeoutError'
          ? err.message
          : 'Sign-in could not be confirmed. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  }

  const googleConfigured =
    Boolean(
      process.env
        .NEXT_PUBLIC_GOOGLE_CLIENT_ID
    );

  return (
    <>
      <div className="mt-5">
        {/* GOOGLE */}

        <div
          ref={
            googleContainerRef
          }
          className="
            relative
            flex
            min-h-[42px]
            w-full
            items-center
            justify-center
          "
        >
          <div
            ref={
              googleButtonRef
            }
            className="
              flex
              min-w-0
              max-w-full
              items-center
              justify-center
            "
          />

          {googleBusy && (
            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                rounded-[4px]
                bg-white
                font-mono
                text-[10px]
                font-semibold
                text-black
              "
            >
              Signing in…
            </div>
          )}
        </div>

        {!googleConfigured && (
          <p
            className="
              mt-2
              text-center
              text-[9px]
              text-white/25
            "
          >
            Google sign-in is
            not configured.
          </p>
        )}

        {/* DIVIDER */}

        <div
          className="
            my-4
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              h-px
              flex-1
              bg-white/[0.07]
            "
          />

          <span
            className="
              font-mono
              text-[8px]
              uppercase
              tracking-[0.18em]
              text-white/25
            "
          >
            or
          </span>

          <div
            className="
              h-px
              flex-1
              bg-white/[0.07]
            "
          />
        </div>

        {/* EMAIL / PASSWORD */}

        <form
          onSubmit={submit}
          className="space-y-3.5"
        >
          <fieldset
            disabled={
              busy ||
              googleBusy ||
              !configured
            }
            className="space-y-3.5"
          >
            <legend className="sr-only">
              Client sign-in
            </legend>

            <div>
              <label
                htmlFor="email"
                className="
                  mb-1.5
                  block
                  text-[10px]
                  font-medium
                  text-white/50
                "
              >
                Email
              </label>

              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                maxLength={254}
                required
                placeholder="you@company.com"
                className="
                  h-11
                  rounded-[12px]
                  border-white/[0.08]
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

            <div>
              <label
                htmlFor="password"
                className="
                  mb-1.5
                  block
                  text-[10px]
                  font-medium
                  text-white/50
                "
              >
                Password
              </label>

              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                maxLength={1024}
                required
                className="
                  h-11
                  rounded-[12px]
                  border-white/[0.08]
                  bg-white/[0.045]
                  px-3.5
                  text-sm
                  text-white
                  shadow-none
                  focus-visible:ring-1
                  focus-visible:ring-white/20
                "
              />
            </div>

            <Button
              type="submit"
              className="
                h-11
                w-full
                rounded-[12px]
                bg-[#BBFF1B]
                font-mono
                text-[13px]
                font-semibold
                text-black
                hover:bg-[#BBFF1B]/90
              "
            >
              {busy
                ? 'Signing in…'
                : 'Sign in'}
            </Button>
          </fieldset>

          {!configured && (
            <p
              role="status"
              className="
                text-[10px]
                leading-4
                text-white/35
              "
            >
              Client access has
              not been configured
              yet. Contact Bivi.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="
                text-[10px]
                leading-4
                text-red-300
              "
            >
              {error}
            </p>
          )}
        </form>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* UNAUTHORIZED USER                                         */}
      {/* ---------------------------------------------------------- */}

      {accessDialogOpen && (
        <div
          className="
            fixed
            inset-0
            z-[300]
            flex
            items-center
            justify-center
            bg-black/75
            px-5
            backdrop-blur-sm
          "
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-access-title"
            className="
              relative
              w-full
              max-w-md
              rounded-[22px]
              border
              border-white/10
              bg-[#151515]
              p-6
              text-white
              shadow-2xl
            "
          >
            <button
              type="button"
              onClick={() =>
                setAccessDialogOpen(
                  false
                )
              }
              aria-label="Close"
              className="
                absolute
                right-4
                top-4
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-white/[0.05]
                text-white/50
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              <X className="h-4 w-4" />
            </button>

            <p
              className="
                font-mono
                text-[9px]
                uppercase
                tracking-[0.17em]
                text-white/30
              "
            >
              Client portal
            </p>

            <h2
              id="client-access-title"
              className="
                mt-3
                pr-8
                font-heading
                text-2xl
                font-semibold
                tracking-tight
              "
            >
              This account
              doesn’t have portal
              access.
            </h2>

            <p
              className="
                mt-4
                text-sm
                leading-6
                text-white/50
              "
            >
              The Bivi client
              portal is available
              only to current
              clients and
              authorized members
              of their teams.
            </p>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-white/50
              "
            >
              If your organization
              already works with
              Bivi, contact your
              enterprise or
              project administrator
              and ask them to add
              this account to the
              appropriate project.
            </p>

            <div
              className="
                mt-6
                grid
                gap-2
                sm:grid-cols-2
              "
            >
              <Link
                href="/get-started"
                className="
                  flex
                  h-11
                  items-center
                  justify-center
                  rounded-[12px]
                  bg-white
                  px-4
                  font-mono
                  text-[10px]
                  font-semibold
                  text-black
                  transition
                  hover:bg-white/90
                "
              >
                Get started
              </Link>

              <Link
                href="/contact"
                className="
                  flex
                  h-11
                  items-center
                  justify-center
                  rounded-[12px]
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-4
                  font-mono
                  text-[10px]
                  font-medium
                  text-white
                  transition
                  hover:bg-white/[0.08]
                "
              >
                Contact us
              </Link>
            </div>

            <Link
              href="/help/contact"
              className="
                mt-4
                block
                text-center
                font-mono
                text-[9px]
                text-white/30
                transition
                hover:text-white/60
              "
            >
              Having trouble?
              Contact Bivi Support
            </Link>
          </div>
        </div>
      )}
    </>
  );
}