'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function ClientLogout() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function signOut() {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/client/session', { method: 'DELETE', signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('Could not sign out. Please try again.');
      router.replace('/client/login'); router.refresh();
    } catch { setError('Could not sign out. Please try again.'); }
    finally { setBusy(false); }
  }
  return <div><Button type="button" variant="outline" disabled={busy} className="rounded-xl font-mono" onClick={signOut}>{busy ? 'Signing out…' : 'Sign out'}</Button>{error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}</div>;
}
