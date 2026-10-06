'use client';
import Link from 'next/link';
export default function AdminError({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-xl px-6 py-24"><h1 className="font-heading text-3xl font-semibold">The workspace is temporarily unavailable.</h1><p className="mt-5 text-muted-foreground">Please try again. If this continues, check the staff migration and authentication setup.</p><button onClick={reset} className="mt-6 rounded-xl border border-border px-5 py-3">Try again</button><Link href="/admin/login" className="ml-5 text-sm underline">Sign in</Link></main>;
}
