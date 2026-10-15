import {WorkspaceNavigationGuard} from '@/components/admin/workspace/WorkspaceNavigationGuard';
import {ImageEditor} from '@/components/profile-images/ImageEditor';
import { ClientProfileForm } from '@/components/portal/ClientProfileForm';
import { requireClient } from '@/lib/portal/auth';
import { getClientProfileContext } from '@/lib/portal/profile';

export default async function ClientProfilePage() {
  const { client, user } = await requireClient();
  const { profile, organizations } = await getClientProfileContext(client, user);

  return (
    <WorkspaceNavigationGuard>
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Account</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">Profile</h1>
      </header>
      <div className="mb-6"><ImageEditor kind="client" subject={user.id} name={[profile.firstName,profile.lastName].filter(Boolean).join(" ")||user.email||"Client"} path={profile.avatarPath}/>{profile.publicId&&<p className="mt-2 font-mono text-xs text-muted-foreground">Client ID {profile.publicId}</p>}</div><ClientProfileForm initial={profile} email={user.email ?? ''} organizations={organizations} />
    </WorkspaceNavigationGuard>
  );
}
