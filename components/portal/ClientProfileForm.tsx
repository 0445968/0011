'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ClientOrganization, ClientProfile } from '@/lib/portal/profile';

export function ClientProfileForm({
  initial,
  email,
  organizations,
}: {
  initial: ClientProfile;
  email: string;
  organizations: ClientOrganization[];
}) {
  const browserTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch {
      return '';
    }
  }, []);

  const [profile, setProfile] = useState({
    ...initial,
    timezone: initial.timezone || browserTimezone,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [blocked, setBlocked] = useState(false);

  function field(key: keyof Omit<ClientProfile, 'revision'>, value: string) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (busy || blocked) return;
    setBusy(true);
    setMessage('');

    try {
      const response = await fetch('/api/client/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedRevision: profile.revision,
          firstName: profile.firstName,
          lastName: profile.lastName,
          jobTitle: profile.jobTitle,
          phone: profile.phone,
          timezone: profile.timezone,
        }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (response.status === 409) setBlocked(true);
      if (!response.ok) throw new Error(data.error || 'Your profile could not be saved.');
      setProfile((current) => ({ ...current, revision: data.revision }));
      setMessage('Profile saved.');
      window.dispatchEvent(new Event('bivi-account-changed'));
    } catch (error) {
      setMessage(
        error instanceof Error && error.name !== 'TimeoutError'
          ? error.message
          : 'The result could not be confirmed. Reload before retrying.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <form onSubmit={save} className="rounded-[24px] border border-border bg-card p-6 sm:p-7">
        <h2 className="font-heading text-2xl font-semibold">Your profile</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Keep your contact details current so project requests, approvals and handoff records identify the right person.
        </p>

        <fieldset disabled={busy || blocked} className="mt-7 grid gap-5 sm:grid-cols-2">
          <legend className="sr-only">Client profile</legend>

          <div>
            <label htmlFor="profile-first-name" className="mb-2 block text-sm font-medium">First name</label>
            <Input id="profile-first-name" maxLength={100} value={profile.firstName} onChange={(e) => field('firstName', e.target.value)} />
          </div>
          <div>
            <label htmlFor="profile-last-name" className="mb-2 block text-sm font-medium">Last name</label>
            <Input id="profile-last-name" maxLength={100} value={profile.lastName} onChange={(e) => field('lastName', e.target.value)} />
          </div>
          <div>
            <label htmlFor="profile-job-title" className="mb-2 block text-sm font-medium">Role / title</label>
            <Input id="profile-job-title" maxLength={160} value={profile.jobTitle} onChange={(e) => field('jobTitle', e.target.value)} />
          </div>
          <div>
            <label htmlFor="profile-phone" className="mb-2 block text-sm font-medium">Phone</label>
            <Input id="profile-phone" type="tel" maxLength={50} value={profile.phone} onChange={(e) => field('phone', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="profile-timezone" className="mb-2 block text-sm font-medium">Timezone</label>
            <Input id="profile-timezone" maxLength={80} value={profile.timezone} onChange={(e) => field('timezone', e.target.value)} placeholder="America/Chicago" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="profile-email" className="mb-2 block text-sm font-medium">Sign-in email</label>
            <Input id="profile-email" value={email} readOnly disabled />
            <p className="mt-2 text-xs text-muted-foreground">Your sign-in email is managed by your authentication account.</p>
          </div>
        </fieldset>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={busy || blocked}>{busy ? 'Saving…' : 'Save profile'}</Button>
          {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
          {blocked && <Button type="button" variant="outline" onClick={() => window.location.reload()}>Reload profile</Button>}
        </div>
      </form>

      <aside className="rounded-[24px] border border-border bg-card p-6 sm:p-7">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Organizations</p>
        <h2 className="mt-2 font-heading text-xl font-semibold">Your Bivi access</h2>
        <div className="mt-5 space-y-3">
          {organizations.map((organization) => (
            <div key={organization.id} className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
              {organization.name}
            </div>
          ))}
          {!organizations.length && <p className="text-sm text-muted-foreground">No active client organization is assigned.</p>}
        </div>
      </aside>
    </div>
  );
}
