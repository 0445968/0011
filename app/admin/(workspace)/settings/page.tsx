import {getStaffAccess,requireStaff} from '@/lib/admin/auth';
import {PersonalSettings} from '@/components/admin/settings/PersonalSettings';
import {StaffAccessSettings} from '@/components/admin/settings/StaffAccessSettings';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  await requireStaff();
  const access=await getStaffAccess();
  const role=access.allowed?await access.client.rpc('is_project_workflow_admin'):null;
  if(role?.error)throw new Error('Workspace permissions could not load.');
  return <div className="mx-auto max-w-3xl space-y-6">
    <div><h1 className="text-2xl font-semibold">Personal settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">Choose how your staff workspace looks and which in-app notifications you receive.</p>
    </div>
    <PersonalSettings />
    {role?.data===true&&<StaffAccessSettings/>}
  </div>;
}
