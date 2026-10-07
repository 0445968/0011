'use client';

import {
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Factor = {
  id: string;
  status: string;
  friendlyName: string;
};

type SecurityState = {
  factors: Factor[];
  currentLevel:
    | 'aal1'
    | 'aal2'
    | null;
  nextLevel:
    | 'aal1'
    | 'aal2'
    | null;
};

export function MfaChallenge() {
  const router = useRouter();

  const [factorId, setFactorId] =
    useState<string | null>(null);

  const [code, setCode] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          '/api/client/mfa',
          {
            method: 'GET',
            cache: 'no-store',
            signal:
              AbortSignal.timeout(
                15000
              ),
          }
        );

        const data: SecurityState & {
          error?: string;
        } =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              'Security settings could not be loaded.'
          );
        }

        if (cancelled) return;

        if (
          data.currentLevel ===
          'aal2'
        ) {
          router.replace('/client');
          router.refresh();
          return;
        }

        const factor =
          data.factors.find(
            (item) =>
              item.status ===
              'verified'
          );

        if (!factor) {
          router.replace('/client');
          router.refresh();
          return;
        }

        setFactorId(factor.id);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error &&
            err.name !==
              'TimeoutError'
            ? err.message
            : 'Two-factor verification could not be loaded.'
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [router]);

async function verifyCode(
  submittedCode: string
) {
  if (
    !factorId ||
    submittedCode.length !== 6 ||
    busy
  ) {
    return;
  }

  setBusy(true);
  setError('');

  try {
    const response = await fetch(
      '/api/client/mfa',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          action: 'challenge',
          factorId,
          code: submittedCode,
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
        throw new Error(
          data.error ||
            'The verification code was not accepted.'
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
          : 'Two-factor verification could not be confirmed.'
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-8 flex min-h-32 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <label
        htmlFor="mfa-code"
        className="text-sm font-medium"
      >
        Authentication code
      </label>

<Input
  id="mfa-code"
  value={code}
  onChange={(event) => {
    const nextCode = event.target.value
      .replace(/\D/g, '')
      .slice(0, 6);

    setCode(nextCode);

    if (
      nextCode.length === 6 &&
      factorId &&
      !busy
    ) {
      window.setTimeout(() => {
        void verifyCode(nextCode);
      }, 0);
    }
  }}
  inputMode="numeric"
  autoComplete="one-time-code"
  placeholder="000000"
  maxLength={6}
  autoFocus
  className="mt-2 h-12 rounded-xl font-mono text-lg tracking-[0.25em]"
/>

      <Button
        type="button"
        onClick={() => {
  void verifyCode(code);
}}
        disabled={
          busy ||
          !factorId ||
          code.length !== 6
        }
        className="mt-4 h-12 w-full rounded-[18px]"
      >
        {busy
          ? 'Verifying…'
          : 'Continue'}
      </Button>

      {error && (
        <p
          role="alert"
          className="mt-4 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}