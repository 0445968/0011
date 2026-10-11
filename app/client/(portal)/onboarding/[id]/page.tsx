import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';

import { ProjectFiles } from '@/components/files/ProjectFiles';
import { ClientOnboardingWorkspace } from '@/components/portal/ClientOnboardingWorkspace';
import { projectFiles } from '@/lib/files/data';
import { getOnboardingItems } from '@/lib/onboarding/item-data';
import { requireClient } from '@/lib/portal/auth';
import { getClientOnboardingHeader } from '@/lib/portal/onboarding';
import { clientWorkspaceSummaries } from '@/lib/portal/workspaces';

export default async function ClientOnboardingPage({ params }: { params: { id: string } }) {
  if (!z.string().uuid().safeParse(params.id).success) notFound();
  const { client, user } = await requireClient();
  const summaries = await clientWorkspaceSummaries(client);
  const summary = summaries.find((item) => item.requestId === params.id);
  if (!summary) notFound();

  const header = await getClientOnboardingHeader(client, params.id);
  if (!header) {
    return (
      <>
        <Link href="/" className="text-sm underline underline-offset-4">Back to dashboard</Link>
        <section className="mt-8 rounded-[24px] border border-border bg-card p-7">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Onboarding</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold">{summary.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">Your access is ready. Bivi is preparing the personalized onboarding checklist for this project.</p>
        </section>
      </>
    );
  }

  const [items, files] = await Promise.all([
    getOnboardingItems(client, params.id),
    projectFiles(client, params.id),
  ]);

  return (
    <>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="text-sm underline underline-offset-4">Back to dashboard</Link>
        <Link href="/profile" className="text-sm underline underline-offset-4">Update your profile</Link>
      </div>
      <ClientOnboardingWorkspace title={summary.title} state={header.state} items={items} />
      <div className="mt-8">
        <ProjectFiles id={params.id} files={files} userId={user.id} />
      </div>
    </>
  );
}
