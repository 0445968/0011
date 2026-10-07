'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Check,
  Copy,
  KeyRound,
  Loader2,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Factor = {
  id: string;
  status: string;
  friendlyName: string;
  createdAt?: string;
  updatedAt?: string;
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

type Enrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
  uri: string;
};

export function ClientSecurity() {
  const [security, setSecurity] =
    useState<SecurityState | null>(
      null
    );

  const [
    enrollment,
    setEnrollment,
  ] = useState<Enrollment | null>(
    null
  );

  const [
    enrollmentCode,
    setEnrollmentCode,
  ] = useState('');

  const [
    challengeCode,
    setChallengeCode,
  ] = useState('');

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');

  const [copied, setCopied] =
    useState(false);

  const loadSecurity =
    useCallback(async () => {
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

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              'Security settings could not be loaded.'
          );
        }

        setSecurity(data);
      } catch (err) {
        setError(
          err instanceof Error &&
            err.name !==
              'TimeoutError'
            ? err.message
            : 'Security settings could not be loaded.'
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadSecurity();
  }, [loadSecurity]);

  const verifiedFactor =
    security?.factors.find(
      (factor) =>
        factor.status ===
        'verified'
    );

  const twoFactorEnabled =
    Boolean(verifiedFactor);

  const needsSecondFactor =
    Boolean(
      verifiedFactor &&
        security?.currentLevel !==
          'aal2'
    );

  async function command(
    body: Record<string, unknown>
  ) {
    const response = await fetch(
      '/api/client/mfa',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body:
          JSON.stringify(body),
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
          'The security change could not be completed.'
      );
    }

    return data;
  }

  async function startEnrollment() {
    if (busy) return;

    setBusy(true);
    setMessage('');
    setError('');
    setEnrollmentCode('');

    try {
      const data =
        await command({
          action: 'enroll',
        });

      setEnrollment({
        factorId:
          data.factorId,
        qrCode:
          data.qrCode,
        secret:
          data.secret,
        uri: data.uri,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Authenticator setup could not be started.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function verifyEnrollment() {
    if (
      !enrollment ||
      enrollmentCode.length !== 6 ||
      busy
    ) {
      return;
    }

    setBusy(true);
    setMessage('');
    setError('');

    try {
      await command({
        action:
          'verify-enrollment',
        factorId:
          enrollment.factorId,
        code:
          enrollmentCode,
      });

      setEnrollment(null);
      setEnrollmentCode('');

      setMessage(
        'Two-factor authentication is now enabled.'
      );

      await loadSecurity();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'The verification code was not accepted.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function verifySecondFactor() {
    if (
      !verifiedFactor ||
      challengeCode.length !== 6 ||
      busy
    ) {
      return;
    }

    setBusy(true);
    setMessage('');
    setError('');

    try {
      await command({
        action: 'challenge',
        factorId:
          verifiedFactor.id,
        code:
          challengeCode,
      });

      setChallengeCode('');

      setMessage(
        'Identity verified.'
      );

      await loadSecurity();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'The verification code was not accepted.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function disableTwoFactor() {
    if (
      !verifiedFactor ||
      busy
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        'Disable two-factor authentication for this account?'
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setMessage('');
    setError('');

    try {
      await command({
        action: 'unenroll',
        factorId:
          verifiedFactor.id,
      });

      setMessage(
        'Two-factor authentication has been disabled.'
      );

      await loadSecurity();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Two-factor authentication could not be disabled.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function copySecret() {
    if (!enrollment?.secret) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        enrollment.secret
      );

      setCopied(true);

      window.setTimeout(
        () => setCopied(false),
        1800
      );
    } catch {
      setError(
        'The secret could not be copied. Select and copy it manually.'
      );
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-border bg-card p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40">
            {twoFactorEnabled ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <KeyRound className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Account security
            </p>

            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
              Two-factor
              authentication
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Add an authenticator
              app to protect your
              Bivi client account
              with a second
              verification step.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium">
              <span
                className={`h-2 w-2 rounded-full ${
                  twoFactorEnabled
                    ? 'bg-foreground'
                    : 'bg-muted-foreground/40'
                }`}
              />

              {twoFactorEnabled
                ? '2FA enabled'
                : '2FA not enabled'}
            </div>
          </div>
        </div>
      </section>

      {!twoFactorEnabled &&
        !enrollment && (
          <section className="rounded-[24px] border border-border bg-card p-6 sm:p-7">
            <h3 className="font-heading text-xl font-semibold">
              Authenticator app
            </h3>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Use an authenticator
              app such as Google
              Authenticator, 1Password,
              Authy, Microsoft
              Authenticator, or Apple
              Passwords.
            </p>

            <Button
              type="button"
              onClick={
                startEnrollment
              }
              disabled={busy}
              className="mt-6 rounded-full"
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing…
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Enable 2FA
                </>
              )}
            </Button>
          </section>
        )}

      {enrollment && (
        <section className="rounded-[24px] border border-border bg-card p-6 sm:p-7">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Step 1
          </p>

          <h3 className="mt-2 font-heading text-xl font-semibold">
            Scan the QR code
          </h3>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Open your
            authenticator app and
            scan this code. Then
            enter the six-digit
            code it generates.
          </p>

          <div className="mt-6 flex justify-center rounded-2xl border border-border bg-white p-5 sm:justify-start">
            <img
              src={
                enrollment.qrCode
              }
              alt="Bivi two-factor authentication QR code"
              className="h-48 w-48"
            />
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium">
              Can’t scan the code?
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Enter this setup
              key manually in your
              authenticator app.
            </p>

            <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-3">
              <code className="min-w-0 flex-1 break-all font-mono text-xs">
                {enrollment.secret}
              </code>

              <button
                type="button"
                onClick={copySecret}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background"
                aria-label="Copy setup key"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-7 max-w-xs">
            <label
              htmlFor="enrollment-code"
              className="text-sm font-medium"
            >
              Verification code
            </label>

            <Input
              id="enrollment-code"
              value={
                enrollmentCode
              }
              onChange={(event) =>
                setEnrollmentCode(
                  event.target.value
                    .replace(
                      /\D/g,
                      ''
                    )
                    .slice(0, 6)
                )
              }
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              className="mt-2 h-12 rounded-xl font-mono text-lg tracking-[0.25em]"
            />

            <Button
              type="button"
              onClick={
                verifyEnrollment
              }
              disabled={
                busy ||
                enrollmentCode.length !==
                  6
              }
              className="mt-4 rounded-full"
            >
              {busy
                ? 'Verifying…'
                : 'Verify and enable'}
            </Button>
          </div>
        </section>
      )}

      {twoFactorEnabled &&
        needsSecondFactor && (
          <section className="rounded-[24px] border border-border bg-card p-6 sm:p-7">
            <h3 className="font-heading text-xl font-semibold">
              Verify your identity
            </h3>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Enter the current
              six-digit code from
              your authenticator
              app before making
              sensitive security
              changes.
            </p>

            <div className="mt-6 max-w-xs">
              <label
                htmlFor="challenge-code"
                className="text-sm font-medium"
              >
                Authentication code
              </label>

              <Input
                id="challenge-code"
                value={
                  challengeCode
                }
                onChange={(event) =>
                  setChallengeCode(
                    event.target.value
                      .replace(
                        /\D/g,
                        ''
                      )
                      .slice(0, 6)
                  )
                }
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                className="mt-2 h-12 rounded-xl font-mono text-lg tracking-[0.25em]"
              />

              <Button
                type="button"
                onClick={
                  verifySecondFactor
                }
                disabled={
                  busy ||
                  challengeCode.length !==
                    6
                }
                className="mt-4 rounded-full"
              >
                {busy
                  ? 'Verifying…'
                  : 'Verify'}
              </Button>
            </div>
          </section>
        )}

      {twoFactorEnabled &&
        !needsSecondFactor && (
          <section className="rounded-[24px] border border-border bg-card p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <ShieldOff className="mt-1 h-5 w-5 shrink-0" />

              <div>
                <h3 className="font-heading text-xl font-semibold">
                  Disable 2FA
                </h3>

                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Removing your
                  authenticator
                  makes the account
                  less secure. You
                  can enable it
                  again at any
                  time.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    disableTwoFactor
                  }
                  disabled={busy}
                  className="mt-5 rounded-full"
                >
                  Disable two-factor
                  authentication
                </Button>
              </div>
            </div>
          </section>
        )}

      {message && (
        <div
          role="status"
          className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </div>
      )}
    </div>
  );
}