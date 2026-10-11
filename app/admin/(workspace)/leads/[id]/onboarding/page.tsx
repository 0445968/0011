import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';

import { ClientOnboarding } from '@/components/admin/ClientOnboarding';
import { PersonalizedOnboarding } from '@/components/admin/PersonalizedOnboarding';
import { ProjectFiles } from '@/components/files/ProjectFiles';
import { requireStaff } from '@/lib/admin/auth';
import { getInquiry } from '@/lib/admin/inquiries';
import { fileHistory, projectFiles } from '@/lib/files/data';
import { getChecklist } from '@/lib/onboarding/checklist-data';
import { getOnboardingItems } from '@/lib/onboarding/item-data';
import { getReadiness } from '@/lib/onboarding/data';
import { listProposals } from '@/lib/proposals/data';

export default async function OnboardingPage({ params }: { params: { id: string } }) {
  if (!z.string().uuid().safeParse(params.id).success) notFound();
  const { client, user } = await requireStaff();
  const inquiry = await getInquiry(client, params.id);
  if (!inquiry) notFound();

  const [proposals, gate, data, items, files, history] = await Promise.all([
    listProposals(client, params.id),
    getReadiness(client, params.id),
    getChecklist(client, params.id),
    getOnboardingItems(client, params.id),
    projectFiles(client, params.id),
    fileHistory(client, params.id),
  ]);
  const accepted = proposals.find((proposal) => proposal.status === 'accepted');
  const gateReady = inquiry.status === 'qualified' && gate.record?.state === 'ready' && Boolean(accepted) && gate.record?.proposal_version === accepted?.version;

  return (
    <>
      <Link href={`/admin/leads/${params.id}/readiness`} className="text-sm underline underline-offset-4">Back to agreement and deposit gate</Link>
      <header className="mt-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Client onboarding</p>
        <h1 className="mt-3 font-heading text-3xl font-semibold">{inquiry.payload.company || inquiry.payload.name}</h1>
      </header>

      {accepted && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading text-xl font-semibold">Agreed client inputs · scope version {accepted.version}</h2>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed">{accepted.body.clientInputs}</p>
          <Link href={`/admin/leads/${params.id}/proposals`} className="mt-4 inline-block text-sm underline">Review full accepted scope</Link>
        </section>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/admin/leads/${params.id}/access`} className="inline-block rounded-xl border border-border px-4 py-3 text-sm">Manage client workspace access</Link>
        <Link href={`/admin/projects/${params.id}`} className="inline-block rounded-xl border border-border px-4 py-3 text-sm">Open project workspace / activation</Link>
      </div>

      <ClientOnboarding key={data.record?.revision ?? 0} id={params.id} record={data.record} history={data.history} gateReady={gateReady} gateRevision={gate.record?.revision ?? null} />
      <PersonalizedOnboarding id={params.id} items={items} locked={data.record?.state === 'complete'} />

      {data.record && (
        <section className="mt-8">
          <div className="mb-4">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Onboarding uploads</p>
            <p className="mt-2 text-sm text-muted-foreground">Review files submitted by the client before accepting the related onboarding requirement.</p>
          </div>
          <ProjectFiles id={params.id} files={files} history={history} staff userId={user.id} />
        </section>
      )}
    </>
  );
}
