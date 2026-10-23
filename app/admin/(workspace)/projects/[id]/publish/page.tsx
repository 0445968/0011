import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { approvalUpdateVersion } from '@/lib/approvals/links';
import { ApprovalFocus } from '@/components/admin/approvals/ApprovalFocus';
import { ClientPublisher } from '@/components/admin/ClientPublisher';
import { requireStaff } from '@/lib/admin/auth';
import { getProject } from '@/lib/projects/data';
import { projectPublications, projectFeedback } from '@/lib/portal/data';
import {ProjectPageHeader} from '@/components/admin/projects/ProjectVisuals';

export default async function PublishPage({
  params, searchParams: p,
}: {
  params: { id: string };
  searchParams: Record<string, string | undefined>;
}) {
  const { client, user } = await requireStaff();
  if (!z.string().uuid().safeParse(params.id).success) notFound();
  const project = await getProject(client, params.id);
  if (!project.record) notFound();
  const [updates, feedback, preferences] = await Promise.all([
    projectPublications(client, params.id, approvalUpdateVersion(p.focus)),
    projectFeedback(client, params.id),
    client.from('staff_notification_preferences').select('timezone').eq('user_id', user.id).maybeSingle(),
  ]);
  if (preferences.error) throw new Error('Project timezone preferences could not load.');
  const record = project.record;
  const timezone = preferences.data?.timezone || 'America/Chicago';

  return <>
    <ApprovalFocus focus={p.focus} />
    <div className="space-y-3"><ProjectPageHeader eyebrow="Project workspace" title="Publishing" description={record.body.title} action={<Link href={`/projects/${params.id}`} className="rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted">Overview</Link>}/><p className="text-xs text-muted-foreground">Client progress, reviews and delivery. Assign client access from Access.</p></div>
    <section aria-label="Project record" className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
      <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">Project record</h2>
      <dl className="grid grid-cols-2 gap-3 p-4 text-xs sm:grid-cols-3">
        {[
          ['Accepted proposal', `Version ${record.proposal_version}`],
          ['Display timezone', timezone],
        ].map(([label, value]) => <div key={label}>
          <dt className="text-[11px] text-muted-foreground">{label}</dt>
          <dd className="mt-0.5 break-words font-medium">{value}</dd>
        </div>)}
      </dl>
      <div className="border-t border-border px-4 py-2">
        <Link href={`/leads/${params.id}`} className="inline-flex min-h-8 items-center text-xs font-medium hover:underline">Source inquiry</Link>
      </div>
    </section>
    <div className="mt-6">
      <ClientPublisher key={updates.map(item => `${item.version}:${item.withdrawn}`).join(',')}
        id={params.id} project={record.body} updates={updates} feedback={feedback} />
    </div>
  </>;
}
