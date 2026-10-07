'use client';

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';

import { useRouter } from 'next/navigation';

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
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
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
              logo_alignment?: 'left' | 'center';
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
  const router = useRouter();

  const googleButtonRef =
    useRef<HTMLDivElement>(null);

  const [busy, setBusy] =
    useState(false);

  const [googleBusy, setGoogleBusy] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    if (
      !configured ||
      !process.env
        .NEXT_PUBLIC_GOOGLE_CLIENT_ID
    ) {
      return;
    }

    function initializeGoogle() {
      if (
        !window.google ||
        !googleButtonRef.current
      ) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id:
          process.env
            .NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: async (response) => {
          if (!response.credential) {
            setError(
              'Google sign-in could not be completed.'
            );
            return;
          }

          setGoogleBusy(true);
          setError('');

          try {
            const result = await fetch(
              '/api/client/google-session',
              {
                method: 'POST',
                headers: {
                  'Content-Type':
                    'application/json',
                },
                body: JSON.stringify({
                  credential:
                    response.credential,
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
              throw new Error(
                data.error ||
                  'Google sign-in could not be completed.'
              );
            }

            router.replace('/client');
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
      });

      googleButtonRef.current.innerHTML =
        '';

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
          width: 350,
        }
      );
    }

    const existingScript =
      document.querySelector<HTMLScriptElement>(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

    if (existingScript) {
      if (window.google) {
        initializeGoogle();
      } else {
        existingScript.addEventListener(
          'load',
          initializeGoogle
        );
      }

      return () => {
        existingScript.removeEventListener(
          'load',
          initializeGoogle
        );
      };
    }

    const script =
      document.createElement('script');

    script.src =
      'https://accounts.google.com/gsi/client';

    script.async = true;
    script.defer = true;

    script.addEventListener(
      'load',
      initializeGoogle
    );

    document.head.appendChild(script);

    return () => {
      script.removeEventListener(
        'load',
        initializeGoogle
      );
    };
  }, [configured, router]);

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (busy) return;

    const form = new FormData(
      event.currentTarget
    );

    setBusy(true);
    setError('');

    try {
      const response = await fetch(
        '/api/client/session',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            email: form.get('email'),
            password:
              form.get('password'),
          }),
          signal:
            AbortSignal.timeout(20000),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Could not sign in.'
        );
      }

      router.replace('/client');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error &&
          err.name !== 'TimeoutError'
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
    <div className="mt-8">
      {/* Google renders its official
          button here, including logo */}
      <div className="relative flex min-h-11 w-full justify-center">
        <div ref={googleButtonRef} />

        {googleBusy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80 text-sm">
            Signing in…
          </div>
        )}
      </div>

      {!googleConfigured && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Google sign-in is not
          configured.
        </p>
      )}

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />

        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          or
        </span>

        <div className="h-px flex-1 bg-border" />
      </div>

      <form
        onSubmit={submit}
        className="space-y-5"
      >
        <fieldset
          disabled={
            busy ||
            googleBusy ||
            !configured
          }
          className="space-y-5"
        >
          <legend className="sr-only">
            Client sign-in
          </legend>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
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
              className="h-12 rounded-xl"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
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
              className="h-12 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-[18px] font-mono"
          >
            {busy
              ? 'Signing in…'
              : 'Sign in'}
          </Button>
        </fieldset>

        {!configured && (
          <p
            role="status"
            className="text-sm text-muted-foreground"
          >
            Client access has not been
            configured yet. Contact Bivi.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}
      </form>
    </div>
  );
}