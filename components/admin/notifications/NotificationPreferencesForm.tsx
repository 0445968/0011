'use client';

import {useEffect, useState} from 'react';
import type {NotificationPreferences} from '@/lib/notifications/types';
import {useWorkspaceUnsavedChanges} from '../workspace/WorkspaceNavigationGuard';
import {useNotifications} from './useNotifications';

const control = 'rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function NotificationPreferencesForm() {
  const {feed, error, busy, refresh, mutate} = useNotifications('limit=1');
  const [draft, setDraft] = useState<NotificationPreferences | null>(null);
  const [baseline, setBaseline] = useState<NotificationPreferences | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (feed && !draft) {
      setDraft(feed.preferences);
      setBaseline(feed.preferences);
    }
  }, [feed, draft]);
  const dirty = Boolean(draft && baseline && JSON.stringify(draft) !== JSON.stringify(baseline));
  async function save() {
    if (!draft || busy) return;
    setSaved(false);
    if (await mutate({action: 'preferences', ...draft})) {
      setBaseline(draft);
      setSaved(true);
    }
  }
  useWorkspaceUnsavedChanges(dirty, 'notification preferences', save);

  return <div className="space-y-3">
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {!draft && <><p role="status" className="text-sm text-muted-foreground">{error ? 'Preferences unavailable.' : 'Loading preferences…'}</p>
      {error && <button type="button" className={control} onClick={() => void refresh()}>Retry</button>}</>}
    {draft && <form className="space-y-4" onSubmit={event => {event.preventDefault(); void save();}}>
      <fieldset disabled={busy} className="space-y-3">
        <legend className="sr-only">Your in-app notifications</legend>
        {(['tasks', 'deadlines', 'approvals'] as const).map(key => <label key={key} className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" checked={draft[key]} onChange={event => {setSaved(false); setDraft({...draft, [key]: event.target.checked});}} />
          {({tasks: 'Assigned tasks', deadlines: 'Deadlines within 7 days and overdue tasks', approvals: 'Approvals needing staff action'})[key]}
        </label>)}
        <label className="block text-sm">Timezone
          <input required maxLength={100} className={`${control} mt-2 block w-full`} value={draft.timezone} onChange={event => {setSaved(false); setDraft({...draft, timezone: event.target.value});}} />
        </label>
        <p className="text-xs text-muted-foreground">Use an IANA timezone such as America/Chicago. These preferences are saved to your staff account and also set the calendar timezone.</p>
      </fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <button className={control} type="submit" disabled={busy || !dirty}>{busy ? 'Saving…' : 'Save notification preferences'}</button>
        {dirty && <button className={control} type="button" disabled={busy} onClick={() => {setDraft(baseline); setSaved(false);}}>Cancel edits</button>}
        {saved && <p role="status" className="text-sm">Preferences saved.</p>}
      </div>
    </form>}
  </div>;
}
