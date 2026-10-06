import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getStaffAccess, staffAuthConfigured } from '@/lib/admin/auth';
import { StaffLogin } from '@/components/admin/StaffLogin';

export default async function AdminLoginPage() {
  const access = await getStaffAccess();
  if (access.allowed) redirect('/admin');
  return <main className="flex min-h-screen items-center justify-center bg-muted/30 px-5 py-16">
    <div className="w-full max-w-md rounded-[28px] border border-border bg-card p-7 sm:p-10">
      <Link href="/" className="font-heading text-2xl font-semibold">Bivi</Link>
      <p className="mt-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">Staff workspace</p>
      <h1 className="mt-3 font-heading text-3xl font-semibold">Welcome back.</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Sign in to review project inquiries and prepare the next steps.</p>
      <StaffLogin configured={staffAuthConfigured()} />
      <Link href="/" className="mt-7 inline-block text-sm text-muted-foreground underline underline-offset-4">Back to the website</Link>
    </div>
  </main>;
}
