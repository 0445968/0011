'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AccountSetup({
  mode,
  tokenHash = '',
  type = 'recovery',
}: {
  mode: 'recover' | 'confirm' | 'password';
  tokenHash?: string;
  type?: 'invite' | 'recovery';
}) {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (mode === 'confirm') {
      window.history.replaceState(null, '', '/client/confirm');
    }
  }, [mode]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (mode === 'password' && password !== repeat) {
      setMessage('Passwords must match.');
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      const response = await fetch(
        `/api/client/${
          mode === 'recover'
            ? 'recovery'
            : mode
        }`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            mode === 'recover'
              ? { email }
              : mode === 'confirm'
                ? { tokenHash, type }
                : { password }
          ),
          signal: AbortSignal.timeout(25000),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Request could not be completed.'
        );
      }

      if (mode === 'confirm') {
        router.replace('/client/password');
        return;
      }

      if (mode === 'password') {
        setPassword('');
        setRepeat('');

        router.replace(
          '/client/login?password=updated'
        );

        router.refresh();
        return;
      }

      setDone(true);
      setMessage(data.message);
    } catch (error) {
      setMessage(
        error instanceof Error &&
          error.name !== 'TimeoutError'
          ? error.message
          : 'The result could not be confirmed. For password changes, try signing in before requesting another reset.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form
        onSubmit={submit}
        className="mt-6 space-y-4"
      >
        <fieldset
          disabled={busy || done}
          className="space-y-4"
        >
          <legend className="sr-only">
            Account setup
          </legend>

          {mode === 'recover' && (
            <div>
              <label
                htmlFor="recovery-email"
                className="block text-sm"
              >
                Email address
              </label>

              <Input
                id="recovery-email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className="mt-2"
              />
            </div>
          )}

          {mode === 'password' && (
            <>
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm"
                >
                  New password
                </label>

                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  maxLength={128}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  className="mt-2"
                />

                <p className="mt-2 text-xs text-muted-foreground">
                  Use at least 12 characters.
                </p>
              </div>

              <div>
                <label
                  htmlFor="repeat-password"
                  className="block text-sm"
                >
                  Confirm password
                </label>

                <Input
                  id="repeat-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  maxLength={128}
                  value={repeat}
                  onChange={(event) =>
                    setRepeat(event.target.value)
                  }
                  className="mt-2"
                />
              </div>
            </>
          )}

          {mode === 'confirm' && (
            <p className="text-sm text-muted-foreground">
              Continue to verify this private
              link and choose your password.
              Links can be used once.
            </p>
          )}

          <Button
            type="submit"
            disabled={
              mode === 'confirm' &&
              !tokenHash
            }
          >
            {busy
              ? 'Please wait…'
              : mode === 'recover'
                ? 'Request reset link'
                : mode === 'confirm'
                  ? 'Continue to password setup'
                  : 'Save password'}
          </Button>
        </fieldset>
      </form>

      {message && (
        <p
          role="status"
          className="mt-5 break-words text-sm"
        >
          {message}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-4 text-sm underline">
        <Link href="/client/login">
          Sign in
        </Link>

        {mode !== 'recover' && (
          <Link href="/client/recover">
            Request a new reset link
          </Link>
        )}
      </div>
    </>
  );
}