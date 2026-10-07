import Link from 'next/link';

import { ClientSecurity } from '@/components/portal/ClientSecurity';
import { requireClient } from '@/lib/portal/auth';

export default async function ClientSecurityPage() {
  await requireClient();

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Client portal
          </p>

          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Security
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Manage two-factor authentication and protect access to your Bivi account.
          </p>
        </div>

        <Link
          href="/client"
          className="text-sm font-medium underline underline-offset-4"
        >
          Back to client portal
        </Link>
      </div>

      <div className="mt-8">
        <ClientSecurity />
      </div>
    </main>
  );
}