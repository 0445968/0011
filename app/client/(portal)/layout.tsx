import Link from 'next/link';

import { requireClient } from '@/lib/portal/auth';
import { ClientLogout } from '@/components/portal/ClientLogout';

export const dynamic = 'force-dynamic';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireClient();

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <Link
            href="/client"
            className="font-heading text-xl font-semibold"
          >
            Bivi · Your projects
          </Link>

          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden max-w-xs truncate text-sm text-muted-foreground sm:block">
              {user.email}
            </span>

            <Link
              href="/client/security"
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Account & security
            </Link>

            <ClientLogout />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        {children}
      </main>
    </div>
  );
}