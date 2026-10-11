
import Link from 'next/link';

import { requireClient } from '@/lib/portal/auth';
import { clientProjectList } from '@/lib/portal/data';
import { clientWorkspaceSummaries } from '@/lib/portal/workspaces';

export default async function ClientProjectsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const { client } = await requireClient();

  const n = Number(searchParams.page || 1);
  const page =
    Number.isInteger(n) && n > 0 && n <= 10000 ? n : 1;

  const [{ projects, total }, workspaces] = await Promise.all([
    clientProjectList(client, page),
    clientWorkspaceSummaries(client),
  ]);

  const pages = Math.max(1, Math.ceil(total / 25));

  return (
    <>
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Client workspace
        </p>

        <h1 className="mt-2 font-heading text-3xl font-semibold">
          Your dashboard
        </h1>

        <p className="mt-4 text-sm text-muted-foreground">
          Onboarding actions, published project updates, reviews
          and deliveries from Bivi.
        </p>
      </header>

      <section className="mt-9">
        <h2 className="font-heading text-2xl font-semibold">
          Project setup
        </h2>

        {workspaces.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {workspaces.map((workspace) => {
              const completed =
                workspace.onboardingState === 'complete';

              const status =
                workspace.onboardingState === 'not_started'
                  ? 'Preparing onboarding'
                  : completed
                    ? 'Onboarding complete'
                    : 'Onboarding in progress';

              const description =
                workspace.clientActions > 0
                  ? `${
                      workspace.clientActions
                    } ${
                      workspace.clientActions === 1
                        ? 'item needs'
                        : 'items need'
                    } your attention.`
                  : completed
                    ? 'View your completed onboarding information and submitted files.'
                    : workspace.onboardingState === 'not_started'
                      ? 'Bivi is preparing your onboarding requirements.'
                      : 'Your submitted items are with Bivi for review.';

              return (
                <article
                  key={workspace.requestId}
                  className="rounded-[22px] border border-border bg-card p-6"
                >
                  <p className="text-xs text-muted-foreground">
                    {status}
                  </p>

                  <h3 className="mt-2 font-heading text-xl font-semibold">
                    {workspace.title}
                  </h3>

                  <p className="mt-3 text-sm text-muted-foreground">
                    {description}
                  </p>

                  <Link
                    href={`/onboarding/${workspace.requestId}`}
                    className="mt-5 inline-block text-sm font-medium underline underline-offset-4"
                  >
                    {completed
                      ? 'View onboarding'
                      : 'Open onboarding'}
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-border bg-card p-6">
            <p className="font-medium">
              No onboarding workspace available
            </p>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              No onboarding workspace is currently available to
              this account. Bivi may need to confirm your active
              client assignment and accepted project proposal.
            </p>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold">
          Published projects
        </h2>

        <div className="mt-4 space-y-4">
          {projects.map((project) => (
            <article
              key={project.request_id}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <Link
                href={`/projects/${project.request_id}`}
                className="font-heading text-xl font-semibold underline underline-offset-4"
              >
                {project.body.title}
              </Link>

              <p className="mt-3 text-sm">
                {project.body.progress}% published progress ·
                Update {project.version}
              </p>
            </article>
          ))}
        </div>

        {!projects.length && (
          <p className="mt-4 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            No client-facing project update has been published yet.
          </p>
        )}
      </section>

      <div className="mt-6 flex flex-wrap justify-between gap-4 text-sm">
        <p>
          Page {page} of {pages}
        </p>

        <div className="flex gap-4">
          {page > 1 && (
            <Link
              href={`/?page=${page - 1}`}
              className="underline"
            >
              Previous
            </Link>
          )}

          {page < pages && (
            <Link
              href={`/?page=${page + 1}`}
              className="underline"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
