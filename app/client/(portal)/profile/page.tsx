import { ClientProfileForm } from '@/components/portal/ClientProfileForm';
import { requireClient } from '@/lib/portal/auth';
import { getClientProfileContext } from '@/lib/portal/profile';

export default async function ClientProfilePage() {
  const { client, user } = await requireClient();
  const { profile, organizations } = await getClientProfileContext(client, user);

  return (
    <>
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Account</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">Profile</h1>
      </header>
      <ClientProfileForm initial={profile} email={user.email ?? ''} organizations={organizations} />
    </>
  );
}
