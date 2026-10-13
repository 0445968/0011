
import type { ReactNode } from 'react';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';

import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  FolderOpen,
  MessageSquare,
  Send,
  Users,
  type LucideIcon,
} from 'lucide-react';

import {
  ProjectBriefEditor,
} from '@/components/admin/ProjectBriefEditor';

import {
  ProjectDeliveryControls,
} from '@/components/admin/ProjectDeliveryControls';

import {
  ProjectLifecycleControls,
} from '@/components/admin/ProjectLifecycleControls';

import {
  ProjectWorkspace,
} from '@/components/admin/ProjectWorkspace';

import {
  WorkspaceStatusBadge,
} from '@/components/admin/WorkspaceStatusBadge';

import {
  requireStaff,
} from '@/lib/admin/auth';

import {
  formatDate,
  getInquiry,
} from '@/lib/admin/inquiries';

import {
  getChecklist,
} from '@/lib/onboarding/checklist-data';

import {
  getReadiness,
} from '@/lib/onboarding/data';

import {
  listProposals,
} from '@/lib/proposals/data';

import {
  getProjectBrief,
} from '@/lib/projects/brief-data';

import {
  getProject,
} from '@/lib/projects/data';

import {
  getProjectDelivery,
} from '@/lib/projects/delivery-data';

import {
  getProjectLifecycle,
} from '@/lib/projects/lifecycle-data';

import {
  projectProgress,
} from '@/lib/projects/schema';

/* =========================================================
   TABS
   ========================================================= */

type Tab =
  | 'overview'
  | 'plan'
  | 'lifecycle'
  | 'brief'
  | 'delivery';

const ALL_TABS: {
  id: Tab;
  label: string;
}[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'plan', label: 'Tasks & milestones' },
  { id: 'lifecycle', label: 'Lifecycle' },
  { id: 'brief', label: 'Brief' },
  { id: 'delivery', label: 'Delivery' },
];

/* =========================================================
   SUMMARY STAT
   ========================================================= */

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-3 sm:p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
        {value}
      </p>

      <p
        className="mt-1 truncate text-[11px] text-muted-foreground"
        title={detail}
      >
        {detail}
      </p>
    </div>
  );
}

/* =========================================================
   QUICK SHORTCUT
   ========================================================= */

function Shortcut({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        inline-flex
        items-center
        gap-2
        rounded-lg
        border
        border-border
        bg-card
        px-3
        py-2
        text-xs
        font-medium
        text-foreground
        transition-colors
        hover:bg-muted
      "
    >
      <Icon size={15} aria-hidden="true" />
      {children}
    </Link>
  );
}

/* =========================================================
   PROJECT PAGE
   ========================================================= */

export default async function ProjectPage({
  params,
  searchParams = {},
}: {
  params: { id: string };
  searchParams?: { tab?: string };
}) {
  const { client } = await requireStaff();

  if (
    !z.string().uuid().safeParse(params.id).success
  ) {
    notFound();
  }

  const inquiry = await getInquiry(
    client,
    params.id
  );

  if (!inquiry) {
    notFound();
  }

  /* =======================================================
     LOAD PROJECT FOUNDATION
     ======================================================= */

  const [
    proposals,
    gate,
    onboarding,
    data,
  ] = await Promise.all([
    listProposals(client, params.id),
    getReadiness(client, params.id),
    getChecklist(client, params.id),
    getProject(client, params.id),
  ]);

  /* =======================================================
     PRESERVE ACTIVATION REQUIREMENTS
     ======================================================= */

  const accepted = proposals.find(
    (proposal) =>
      proposal.status === 'accepted'
  );

  const gateReady =
    inquiry.status === 'qualified' &&
    Boolean(accepted) &&
    gate.record?.state === 'ready' &&
    onboarding.record?.state === 'complete' &&
    gate.record.proposal_version === accepted?.version &&
    onboarding.record.proposal_version === accepted?.version &&
    onboarding.record.completed_readiness_revision ===
      gate.record.revision &&
    (
      !data.record ||
      data.record.proposal_version === accepted?.version
    );

  /* =======================================================
     PROJECT SUMMARY
     ======================================================= */

  const record = data.record;

  const base = `/admin/projects/${params.id}`;

  const title =
    record?.body.title ||
    inquiry.payload.company ||
    inquiry.payload.name;

  const owner =
    record?.body.owner || 'Unassigned';

  const progress = record
    ? projectProgress(record.body)
    : null;

  const openTasks =
    record?.body.tasks
      .filter(
        (task) =>
          task.status !== 'done'
      )
      .sort((a, b) =>
        (
          a.dueOn ?? '9999-12-31'
        ).localeCompare(
          b.dueOn ?? '9999-12-31'
        )
      ) ?? [];

  const blocked = openTasks.filter(
    (task) => task.status === 'blocked'
  ).length;

  const milestoneDone =
    record?.body.milestones.filter(
      (milestone) =>
        milestone.status === 'done'
    ).length ?? 0;

  /* =======================================================
     SELECTED TAB
     ======================================================= */

  const defaultTab: Tab =
    record ? 'overview' : 'plan';

  const requested = ALL_TABS.find(
    (item) =>
      item.id === searchParams.tab
  )?.id;

  const tab: Tab =
    !record || !requested
      ? defaultTab
      : requested;

  const availableTabs = record
    ? ALL_TABS
    : ALL_TABS.filter(
        (item) => item.id === 'plan'
      );

  /* =======================================================
     CONDITIONAL SECTION DATA

     Load only the editor currently being viewed.
     ======================================================= */

  const lifecycle =
    record && tab === 'lifecycle'
      ? await getProjectLifecycle(
          client,
          params.id
        )
      : null;

  const brief =
    record && tab === 'brief'
      ? await getProjectBrief(
          client,
          params.id
        )
      : null;

  const delivery =
    record && tab === 'delivery'
      ? await getProjectDelivery(
          client,
          params.id
        )
      : null;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="min-w-0 space-y-4 pb-8">

      {/* ===================================================
          BACK NAVIGATION
          =================================================== */}

      <div className="flex items-center justify-between gap-3">

        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={15} />
          Projects
        </Link>

        <Link
          href={`/admin/leads/${params.id}/onboarding`}
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Onboarding & prerequisites
        </Link>
      </div>

      {/* ===================================================
          COMPACT PROJECT HEADER
          =================================================== */}

      <header className="rounded-xl border border-border bg-card px-4 py-4 sm:px-5">

        <div className="flex flex-wrap items-start justify-between gap-3">

          <div className="min-w-0">
            <h1 className="break-words font-heading text-xl font-semibold tracking-tight sm:text-2xl">
              {title}
            </h1>

            <p className="mt-1 text-xs text-muted-foreground">
              {record
                ? `Owner: ${owner}`
                : 'Awaiting activation'}

              {record && (
                <span>
                  {' '}· Updated{' '}
                  {formatDate(record.updated_at)}
                </span>
              )}
            </p>
          </div>

          {record ? (
            <WorkspaceStatusBadge
              kind="project"
              status={record.state}
            />
          ) : (
            <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-[11px] font-semibold text-foreground">
              Not activated
            </span>
          )}
        </div>

        {/* INLINE PROGRESS */}

        {record && progress && (
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3">

            <span className="text-xs font-semibold tabular-nums">
              {progress.percent}% complete
            </span>

            <div
              role="progressbar"
              aria-label="Project task progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress.percent}
              className="h-1.5 min-w-[90px] max-w-xs flex-1 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-foreground"
                style={{
                  width: `${progress.percent}%`,
                }}
              />
            </div>

            <span className="text-xs text-muted-foreground">
              {progress.done}/{progress.total} tasks
            </span>

            {blocked > 0 && (
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                {blocked} blocked
              </span>
            )}
          </div>
        )}
      </header>

      {/* ===================================================
          QUICK ACCESS
          =================================================== */}

      {record && (
        <div className="flex flex-wrap gap-2">

          <Shortcut
            href={`${base}/files`}
            icon={FolderOpen}
          >
            Files
          </Shortcut>

          <Shortcut
            href={`${base}/discussion`}
            icon={MessageSquare}
          >
            Discussion
          </Shortcut>

          <Shortcut
            href={`${base}/publish`}
            icon={Send}
          >
            Publishing
          </Shortcut>

          <Shortcut
            href={`${base}/access`}
            icon={Users}
          >
            Client access
          </Shortcut>
        </div>
      )}

      {/* ===================================================
          STICKY SECTION NAVIGATION
          =================================================== */}

      <nav
        aria-label="Project sections"
        className="
          sticky
          top-0
          z-20
          -mx-4
          border-b
          border-border
          bg-background/95
          px-4
          backdrop-blur-sm
          sm:-mx-6
          sm:px-6
          lg:-mx-8
          lg:px-8
        "
      >
        <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
          {availableTabs.map((item) => (
            <Link
              key={item.id}
              href={
                item.id === defaultTab
                  ? base
                  : `${base}?tab=${item.id}`
              }
              scroll={false}
              aria-current={
                tab === item.id
                  ? 'page'
                  : undefined
              }
              className={`
                shrink-0
                rounded-lg
                px-3
                py-2
                text-xs
                font-semibold
                transition-colors
                ${tab === item.id
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ===================================================
          OVERVIEW
          =================================================== */}

      {tab === 'overview' && record && progress && (
        <div className="space-y-4">

          {/* QUICK METRICS */}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <Stat
              label="Tasks completed"
              value={`${progress.done}/${progress.total}`}
              detail={`${progress.percent}% complete`}
            />

            <Stat
              label="Open tasks"
              value={String(openTasks.length)}
              detail={`${blocked} blocked`}
            />

            <Stat
              label="Milestones"
              value={`${milestoneDone}/${record.body.milestones.length}`}
              detail="Completed milestones"
            />

            <Stat
              label="Next action"
              value={openTasks[0]?.dueOn || '—'}
              detail={
                openTasks[0]?.title ||
                'No pending tasks'
              }
            />
          </div>

          {/* TASKS AND MILESTONES */}

          <div className="grid items-start gap-4 lg:grid-cols-2">

            <section className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold">
                  Open tasks
                </h2>

                <Link
                  href={`${base}?tab=plan`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Edit tasks
                  <ArrowUpRight size={13} />
                </Link>
              </div>

              {openTasks.length ? (
                <ul className="divide-y divide-border">
                  {openTasks.slice(0, 6).map(
                    (task) => (
                      <li
                        key={task.id}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-xs"
                      >
                        <span
                          className="min-w-0 truncate font-medium"
                          title={task.title}
                        >
                          {task.title}
                        </span>

                        <span className="shrink-0 text-muted-foreground">
                          {task.dueOn || 'No due date'}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="px-4 py-5 text-xs text-muted-foreground">
                  No open tasks.
                </p>
              )}
            </section>

            <section className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold">
                  Milestones
                </h2>

                <Link
                  href={`${base}?tab=plan`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Edit milestones
                  <ArrowUpRight size={13} />
                </Link>
              </div>

              {record.body.milestones.length ? (
                <ul className="divide-y divide-border">
                  {record.body.milestones
                    .slice(0, 6)
                    .map((milestone) => (
                      <li
                        key={milestone.id}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-xs"
                      >
                        <span
                          className="min-w-0 truncate font-medium"
                          title={milestone.title}
                        >
                          {milestone.title}
                        </span>

                        <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
                          {milestone.status === 'done' && (
                            <CheckCircle2 size={13} />
                          )}

                          {milestone.status.replace(
                            '_',
                            ' '
                          )}
                        </span>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="px-4 py-5 text-xs text-muted-foreground">
                  No milestones yet.
                </p>
              )}
            </section>
          </div>

          {/* SECONDARY INFORMATION */}

          {(record.body.notes ||
            data.history.length > 0) && (
            <div className="grid items-start gap-3 lg:grid-cols-2">

              {record.body.notes && (
                <details className="rounded-xl border border-border bg-card p-4">
                  <summary className="cursor-pointer text-xs font-semibold">
                    Project notes
                  </summary>

                  <p className="mt-3 whitespace-pre-wrap break-words text-xs text-muted-foreground">
                    {record.body.notes}
                  </p>
                </details>
              )}

              {data.history.length > 0 && (
                <details className="rounded-xl border border-border bg-card p-4">
                  <summary className="cursor-pointer text-xs font-semibold">
                    Recent project history
                  </summary>

                  <ul className="mt-3 divide-y divide-border">
                    {data.history
                      .slice(0, 5)
                      .map((event) => (
                        <li
                          key={event.id}
                          className="py-2 text-xs"
                        >
                          <span className="font-medium capitalize">
                            {event.action.replaceAll(
                              '_',
                              ' '
                            )}
                          </span>

                          <span className="ml-2 text-muted-foreground">
                            {formatDate(event.created_at)}
                          </span>
                        </li>
                      ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================
          TASKS & MILESTONES
          =================================================== */}

      {tab === 'plan' && (
        <div className="space-y-2">

          {record && (
            <p className="text-xs text-muted-foreground">
              Save changes to tasks or milestones
              before switching sections.
            </p>
          )}

          <ProjectWorkspace
            key={record?.revision ?? 0}
            id={params.id}
            record={record}
            history={data.history}
            gateReady={gateReady}
          />
        </div>
      )}

      {/* ===================================================
          LIFECYCLE
          =================================================== */}

      {tab === 'lifecycle' && record && (
        lifecycle?.lifecycle ? (
          <ProjectLifecycleControls
            id={params.id}
            lifecycle={lifecycle.lifecycle}
            controls={lifecycle.controls}
            tasks={record.body.tasks}
            events={lifecycle.events}
          />
        ) : (
          <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Lifecycle information is not available
            for this project.
          </p>
        )
      )}

      {/* ===================================================
          PROJECT BRIEF
          =================================================== */}

      {tab === 'brief' && record && (
        brief ? (
          <ProjectBriefEditor
            id={params.id}
            draft={brief.draft}
            versions={brief.versions}
          />
        ) : (
          <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            No project brief is available yet.
          </p>
        )
      )}

      {/* ===================================================
          DELIVERY
          =================================================== */}

      {tab === 'delivery' && record && (
        delivery ? (
          <ProjectDeliveryControls
            id={params.id}
            deliverables={delivery.deliverables}
            versions={delivery.versions}
            changes={delivery.changes}
            qaChecks={delivery.qaChecks}
            handoffItems={delivery.handoffItems}
            closeout={delivery.closeout}
          />
        ) : (
          <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Delivery details are not available
            for this project.
          </p>
        )
      )}
    </div>
  );
}
