import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';

import { ProjectFiles } from '@/components/files/ProjectFiles';
import { ClientDeliveryControls } from '@/components/portal/ClientDeliveryControls';
import { ClientProjectBrief } from '@/components/portal/ClientProjectBrief';
import { ClientProjectTasks } from '@/components/portal/ClientProjectTasks';
import { ClientProjectManagement } from '@/components/portal/ClientProjectManagement';
import { ClientReview } from '@/components/portal/ClientReview';
import { PublishedUpdate } from '@/components/portal/PublishedUpdate';
import { projectFiles } from '@/lib/files/data';
import { requireClient } from '@/lib/portal/auth';
import { projectFeedback, projectPublications } from '@/lib/portal/data';
import { getClientBriefVersions } from '@/lib/projects/brief-data';
import { getProjectDelivery } from '@/lib/projects/delivery-data';
import { clientProjectWork } from '@/lib/projects/lifecycle-data';
import { clientProjectAssignmentWorkspaceSchema } from '@/lib/projects/client-team-schema';

export default async function ClientProjectPage({ params }: { params: { id: string } }) {
  const { client, user } = await requireClient();
  if (!z.string().uuid().safeParse(params.id).success) notFound();

  const work = await clientProjectWork(client, params.id);
  if (!work) notFound();

  const teamResult = await client.rpc('client_project_assignment_workspace', { p_request: params.id });
  const teamParsed = teamResult.error ? null : clientProjectAssignmentWorkspaceSchema.safeParse(teamResult.data);
  const team = teamParsed && teamParsed.success ? teamParsed.data : null;

  const [updatesRaw, files, feedback, briefVersions, review, delivery] = await Promise.all([
    projectPublications(client, params.id),
    projectFiles(client, params.id),
    projectFeedback(client, params.id),
    getClientBriefVersions(client, params.id),
    client.rpc('can_review_project', { p_id: params.id }),
    getProjectDelivery(client, params.id),
  ]);
  if (review.error) throw new Error('Review access could not be checked.');

  const updates = updatesRaw.filter((publication) => !publication.withdrawn);
  const latest = updates[0] ?? null;
  const latestBrief = briefVersions[0] ?? null;
  const own = feedback.filter((item) => item.user_id === user.id);
  const decision = latest ? own.find((item) => item.version === latest.version) : null;
  const canReview = review.data === true;

  return (
    <>
      <Link href="/" className="text-sm underline underline-offset-4">Back to dashboard</Link>

      <header className="mt-6">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Project workspace</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">{work.title}</h1>
      </header>

      <div className="mt-8 space-y-7">
        <ClientProjectTasks id={params.id} work={work} />
        <ClientProjectManagement id={params.id} work={work} team={team} />
        <ClientProjectBrief id={params.id} version={latestBrief} canReview={canReview} />
        <ClientDeliveryControls
          id={params.id}
          deliverables={delivery.deliverables}
          versions={delivery.versions}
          changes={delivery.changes}
          handoffItems={delivery.handoffItems}
          closeout={delivery.closeout}
          canReview={canReview}
        />

        <section className="rounded-[22px] border border-border bg-card p-6 sm:p-7">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Project updates</p>
          {latest ? (
            <>
              <p className="mb-5 mt-3 text-xs text-muted-foreground">Update version {latest.version} · Published {new Date(latest.created_at).toISOString().slice(0, 10)}</p>
              <PublishedUpdate body={latest.body} />
              <div className="mt-6">
                {decision ? (
                  <section className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="font-heading text-xl font-semibold">Your review: {decision.decision === 'approved' ? 'Approved' : 'Changes requested'}</h2>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm">{decision.note || 'No additional notes.'}</p>
                    <p className="mt-3 text-xs text-muted-foreground">Your decision is saved for update {decision.version}.</p>
                  </section>
                ) : latest.body.reviewRequested && canReview ? (
                  <ClientReview id={params.id} version={latest.version} />
                ) : (
                  <p className="text-sm text-muted-foreground">{latest.body.reviewRequested ? 'Review is assigned to an authorized project approver.' : 'No review is requested for this update.'}</p>
                )}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">No progress update has been published yet. Your brief and assigned tasks remain available above while Bivi prepares the first update.</p>
          )}
        </section>

        <ProjectFiles id={params.id} files={files} userId={user.id} />

        {updates.length > 1 && (
          <section>
            <h2 className="font-heading text-xl font-semibold">Previous updates</h2>
            <div className="mt-4 space-y-4">
              {updates.slice(1).map((publication) => (
                <details key={publication.version} className="rounded-2xl border border-border bg-card p-5">
                  <summary className="cursor-pointer text-sm">Version {publication.version} · {new Date(publication.created_at).toISOString().slice(0, 10)}</summary>
                  <div className="mt-5">
                    <PublishedUpdate body={publication.body} />
                    {own.find((item) => item.version === publication.version) && (
                      <p className="mt-4 text-sm">Your decision: {own.find((item) => item.version === publication.version)?.decision === 'approved' ? 'Approved' : 'Changes requested'}</p>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
