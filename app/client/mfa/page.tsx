import Link from 'next/link';

import { requireClient } from '@/lib/portal/auth';
import { MfaChallenge } from '@/components/portal/MfaChallenge';

export default async function ClientMfaPage() {
  await requireClient({
    allowMfaPending: true,
  });

  return (
    <main className="mx-auto max-w-md px-5 py-16">
      <Link
        href="/"
        className="font-heading text-2xl font-semibold"
      >
        Bivi
      </Link>

      <section className="mt-8 rounded-[24px] border border-border bg-card p-6 sm:p-7">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Client security
        </p>

        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
          Verify it’s you
        </h1>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Enter the six-digit code from your authenticator app to finish signing in.
        </p>

        <MfaChallenge />
      </section>
    </main>
  );
}