import {requireStaff} from '@/lib/admin/auth';
import {PersonalSettings} from '@/components/admin/settings/PersonalSettings';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  await requireStaff();
  return <div className="mx-auto max-w-3xl space-y-6">
    <div><h1 className="text-2xl font-semibold">Personal settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">Choose how your staff workspace looks and which in-app notifications you receive.</p>
    </div>
    <PersonalSettings />
  </div>;
}
