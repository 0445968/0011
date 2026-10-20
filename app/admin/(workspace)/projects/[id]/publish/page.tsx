import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { approvalUpdateVersion } from '@/lib/approvals/links';
import { ApprovalFocus } from '@/components/admin/approvals/ApprovalFocus';
import { WorkspaceRecordDetails } from '@/components/admin/StaffWorkspaceShell';
import { ClientPublisher } from '@/components/admin/ClientPublisher';
import { requireStaff } from '@/lib/admin/auth';
import { getProject } from '@/lib/projects/data';
import { projectPublications, projectFeedback } from '@/lib/portal/data';

function dateStamp(value: string | null, timezone: string) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not recorded' : new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZone: timezone, timeZoneName: 'short',
  }).format(date);
}

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
  const date = (value: string | null) => dateStamp(value, timezone);

  return <>
    <WorkspaceRecordDetails kind="project" id={params.id}
      title={record.body.title} recordType="Project" status={record.state} />
    <ApprovalFocus focus={p.focus} />
    <Link href={`/projects/${params.id}`} className="text-sm underline underline-offset-4">Back to project workspace</Link>
    <header className="mt-6">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Client progress, reviews and delivery</p>
      <h1 className="mt-3 font-heading text-3xl font-semibold">{record.body.title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">Client portal: /client/login. Assign client access using the portal setup instructions.</p>
    </header>
    <section aria-label="Project record" className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
      <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">Project record</h2>
      <dl className="grid grid-cols-2 gap-3 p-4 text-xs sm:grid-cols-3">
        {[
          ['Owner (legacy label)', record.body.owner || 'Unassigned'],
          ['Activated', date(record.activated_at)],
          ['Last updated', date(record.updated_at)],
          ['Project revision', String(record.revision)],
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
