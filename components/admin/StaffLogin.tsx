'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function StaffLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not sign in.');
      router.replace('/admin'); router.refresh();
    } catch (err) { setError(err instanceof Error && err.name !== 'TimeoutError' ? err.message : 'Sign-in could not be confirmed. Please try again.'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="mt-8 space-y-5">
    <fieldset disabled={busy || !configured} className="space-y-5">
      <legend className="sr-only">Staff sign-in</legend>
      <div><label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label><Input id="email" name="email" type="email" autoComplete="username" maxLength={254} required className="h-12 rounded-xl" /></div>
      <div><label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label><Input id="password" name="password" type="password" autoComplete="current-password" maxLength={1024} required className="h-12 rounded-xl" /></div>
      <Button type="submit" className="h-12 w-full rounded-[18px] font-mono">{busy ? 'Signing in…' : 'Sign in'}</Button>
    </fieldset>
    {!configured && <p role="status" className="text-sm text-muted-foreground">Staff access hasn’t been configured yet. Complete the workspace setup to sign in.</p>}
    {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
  </form>;
}
