import Link from 'next/link';
import { requireStaff } from '@/lib/admin/auth';
import { StaffLogout } from '@/components/admin/StaffLogout';

export const dynamic = 'force-dynamic';
export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireStaff();
  return <div className="min-h-screen bg-muted/20">
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <div className="flex items-center gap-5"><Link href="/admin" className="font-heading text-xl font-semibold">Bivi</Link><span className="border-l border-border pl-5 font-mono text-xs uppercase tracking-widest text-muted-foreground">Workspace</span></div>
        <div className="flex min-w-0 items-center gap-4"><span className="hidden max-w-xs truncate text-sm text-muted-foreground sm:block">{user.email}</span><StaffLogout /></div>
      </div>
    </header>
    <nav aria-label="Workspace navigation" className="mx-auto flex max-w-7xl gap-5 px-5 pt-6 text-sm sm:px-8"><Link href="/admin" className="underline underline-offset-4">Inquiries</Link><Link href="/admin/projects" className="underline underline-offset-4">Projects</Link></nav>
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">{children}</main>
  </div>;
}
