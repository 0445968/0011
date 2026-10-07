import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getClientAccess } from '@/lib/portal/auth';
import { staffAuthConfigured } from '@/lib/admin/auth';
import { ClientLogin } from '@/components/portal/ClientLogin';

export default async function ClientLoginPage({
  searchParams,
}: {
  searchParams?: {
    password?: string;
    error?: string;
  };
}) {
  const access = await getClientAccess();

  if (access.allowed) {
    redirect('/client');
  }

  const passwordUpdated =
    searchParams?.password === 'updated';

  const authError =
    searchParams?.error;

  let authMessage = '';

  if (authError === 'not-authorized') {
    authMessage =
      'This account is not currently assigned to a Bivi client project.';
  } else if (authError === 'oauth') {
    authMessage =
      'Google sign-in could not be completed. Please try again.';
  }

  return (
    <main className="mx-auto max-w-md px-5 py-16">
      <Link
        href="/"
        className="font-heading text-2xl font-semibold"
      >
        Bivi
      </Link>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Client portal
        </p>

        <h1 className="mt-3 font-heading text-3xl font-semibold">
          Your project updates
        </h1>

        <p className="mt-4 text-sm text-muted-foreground">
          Sign in with the account Bivi assigned to your project.
        </p>

        {passwordUpdated && (
          <div className="mt-5 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">
            Password updated. Sign in with your new password.
          </div>
        )}

        {authMessage && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
          >
            {authMessage}
          </div>
        )}

        <ClientLogin
          configured={staffAuthConfigured()}
        />

        <Link
          href="/client/recover"
          className="mt-5 inline-block text-sm underline"
        >
          Forgot password?
        </Link>
      </section>
    </main>
  );
}