'use client';

import {WorkRecoverySettings} from './WorkRecoverySettings';
import {recordDefinitions,type WorkspaceRecordKind} from '@/lib/admin/workspace/navigation';
import {useTheme} from 'next-themes';
import {NotificationPreferencesForm} from '../notifications/NotificationPreferencesForm';
import {useWorkspacePreferences} from '../workspace/WorkspacePreferences';

const section = 'space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6';
const control = 'min-h-11 rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function PersonalSettings() {
  const {theme, setTheme} = useTheme();
  const {density, changeDensity, collapsed, toggleSidebar, showTabs, changeShowTabs,showMenuBar,changeShowMenuBar,showRecordNavigation,changeShowRecordNavigation,sidebarRecords,changeSidebarRecords} = useWorkspacePreferences();
  return <div className="space-y-6">
    <section className={section} aria-labelledby="appearance-heading">
      <h2 id="appearance-heading" className="text-lg font-semibold">Appearance</h2>
      <p className="text-sm text-muted-foreground">Changes apply immediately in this browser. If browser storage is unavailable, workspace changes last for this session.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm"><span className="block">Color theme</span>
          <select className={`${control} w-full`} value={theme === 'dark' ? 'dark' : 'light'} onChange={event => setTheme(event.target.value)}>
            <option value="light">Light</option><option value="dark">Dark</option>
          </select>
        </label>
        <label className="space-y-2 text-sm"><span className="block">Workspace density</span>
          <select className={`${control} w-full`} value={density} onChange={event => changeDensity(event.target.value === 'compact' ? 'compact' : 'comfortable')}>
            <option value="comfortable">Comfortable</option><option value="compact">Compact</option>
          </select>
        </label>
      </div>
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={collapsed} onChange={toggleSidebar} />Collapse sidebar to icons</label>
    </section>
    <section className={section} aria-labelledby="tabs-heading">
      <h2 id="tabs-heading" className="text-lg font-semibold">Workspace bars</h2>
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={showMenuBar} onChange={event=>changeShowMenuBar(event.target.checked)}/>Show the File / Edit / View menu bar</label>
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={showRecordNavigation} onChange={event=>changeShowRecordNavigation(event.target.checked)}/>Show the record section bar</label>
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={showTabs} onChange={event => changeShowTabs(event.target.checked)} />Show the record tab bar</label>
      <p className="text-sm text-muted-foreground">Saved for your staff account in this browser. Hiding the bar preserves open records, pins, bookmarks, and tab order. Records remain available through the sidebar and Workspace menu.</p>
    </section>
    <section className={section} aria-labelledby="sidebar-records-heading"><h2 id="sidebar-records-heading" className="text-lg font-semibold">Sidebar records</h2><p className="text-sm text-muted-foreground">Choose which open, pinned and bookmarked records appear under their sidebar directory. Open tabs remain available in the tab bar and Window menu.</p>{(['project','task','inquiry','contact','company'] as WorkspaceRecordKind[]).map(kind=><label key={kind} className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={sidebarRecords[kind]!==false} onChange={event=>changeSidebarRecords(kind,event.target.checked)}/>Show {recordDefinitions[kind].label.toLowerCase()} records</label>)}</section>
    <WorkRecoverySettings/>
    <section className={section} aria-labelledby="notifications-heading">
      <h2 id="notifications-heading" className="text-lg font-semibold">In-app notifications</h2>
      <NotificationPreferencesForm />
    </section>
    <section className={section} aria-labelledby="organization-heading">
      <h2 id="organization-heading" className="text-lg font-semibold">Organization settings</h2>
      <p className="text-sm text-muted-foreground">This page manages your personal workspace preferences. Organization configuration, billing, and staff permissions are managed separately.</p>
    </section>
  </div>;
}
