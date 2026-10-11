import Link from 'next/link';

import { ClientLogout } from '@/components/portal/ClientLogout';
import { requireClient } from '@/lib/portal/auth';

export const dynamic = 'force-dynamic';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireClient();

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/" className="font-heading text-xl font-semibold">Bivi · Dashboard</Link>
            <nav aria-label="Client account" className="flex flex-wrap gap-4 text-sm">
              <Link href="/" className="underline underline-offset-4">Projects</Link>
              <Link href="/profile" className="underline underline-offset-4">Profile</Link>
              <Link href="/security" className="underline underline-offset-4">Security</Link>
            </nav>
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden max-w-xs truncate text-sm text-muted-foreground sm:block">{user.email}</span>
            <ClientLogout />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
    </div>
  );
}
