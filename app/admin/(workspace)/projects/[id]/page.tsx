import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';

import { ProjectBriefEditor } from '@/components/admin/ProjectBriefEditor';
import { ProjectDeliveryControls } from '@/components/admin/ProjectDeliveryControls';
import { ProjectLifecycleControls } from '@/components/admin/ProjectLifecycleControls';
import { ProjectWorkspace } from '@/components/admin/ProjectWorkspace';
import { requireStaff } from '@/lib/admin/auth';
import { getInquiry } from '@/lib/admin/inquiries';
import { getChecklist } from '@/lib/onboarding/checklist-data';
import { getReadiness } from '@/lib/onboarding/data';
import { listProposals } from '@/lib/proposals/data';
import { getProjectBrief } from '@/lib/projects/brief-data';
import { getProject } from '@/lib/projects/data';
import { getProjectDelivery } from '@/lib/projects/delivery-data';
import { getProjectLifecycle } from '@/lib/projects/lifecycle-data';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const { client } = await requireStaff();
  if (!z.string().uuid().safeParse(params.id).success) notFound();

  const inquiry = await getInquiry(client, params.id);
  if (!inquiry) notFound();

  const [proposals, gate, onboarding, data] = await Promise.all([
    listProposals(client, params.id),
    getReadiness(client, params.id),
    getChecklist(client, params.id),
    getProject(client, params.id),
  ]);

  const accepted = proposals.find((proposal) => proposal.status === 'accepted');
  const gateReady =
    inquiry.status === 'qualified' &&
    Boolean(accepted) &&
    gate.record?.state === 'ready' &&
    onboarding.record?.state === 'complete' &&
    gate.record.proposal_version === accepted?.version &&
    onboarding.record.proposal_version === accepted?.version &&
    onboarding.record.completed_readiness_revision === gate.record.revision &&
    (!data.record || data.record.proposal_version === accepted?.version);

  const [lifecycle, brief, delivery] = data.record
    ? await Promise.all([
        getProjectLifecycle(client, params.id),
        getProjectBrief(client, params.id),
        getProjectDelivery(client, params.id),
      ])
    : [null, null, null];

  return (
    <>
      <div className="flex flex-wrap gap-5 text-sm underline underline-offset-4">
        <Link href="/admin/projects">All projects</Link>
        <Link href={`/admin/leads/${params.id}/onboarding`}>Review onboarding and prerequisites</Link>
      </div>

      <header className="mt-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Project workspace</p>
        <h1 className="mt-3 font-heading text-3xl font-semibold">
          {data.record?.body.title || inquiry.payload.company || inquiry.payload.name}
        </h1>
      </header>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/admin/projects/${params.id}/publish`} className="inline-block rounded-xl border border-border px-4 py-3 text-sm">Publish client progress and delivery</Link>
        <Link href={`/admin/projects/${params.id}/files`} className="inline-block rounded-xl border border-border px-4 py-3 text-sm">Manage project files</Link>
        <Link href={`/admin/projects/${params.id}/discussion`} className="inline-block rounded-xl border border-border px-4 py-3 text-sm">Discussion and activity</Link>
        <Link href={`/admin/projects/${params.id}/access`} className="inline-block rounded-xl border border-border px-4 py-3 text-sm">Manage client access</Link>
      </div>

      {data.record && lifecycle?.lifecycle && brief && (
        <>
          <ProjectLifecycleControls
            id={params.id}
            lifecycle={lifecycle.lifecycle}
            controls={lifecycle.controls}
            tasks={data.record.body.tasks}
            events={lifecycle.events}
          />
          <ProjectBriefEditor id={params.id} draft={brief.draft} versions={brief.versions} />
          {delivery && (
            <ProjectDeliveryControls
              id={params.id}
              deliverables={delivery.deliverables}
              versions={delivery.versions}
              changes={delivery.changes}
              qaChecks={delivery.qaChecks}
              handoffItems={delivery.handoffItems}
              closeout={delivery.closeout}
            />
          )}
        </>
      )}

      <ProjectWorkspace
        key={data.record?.revision ?? 0}
        id={params.id}
        record={data.record}
        history={data.history}
        gateReady={gateReady}
      />
    </>
  );
}
