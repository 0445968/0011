
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';

import {
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

import {
  WorkspaceRecordDetails,
} from '@/components/admin/StaffWorkspaceShell';

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

import {
  getServiceBlueprint,
} from '@/data/serviceCatalog';

/* =========================================================
   PROJECT SECTIONS
   ========================================================= */

type Tab =
  | 'overview'
  | 'plan'
  | 'lifecycle'
  | 'brief'
  | 'delivery';

const ALL_TABS: Tab[] = [
  'overview',
  'plan',
  'lifecycle',
  'brief',
  'delivery',
];

/* =========================================================
   SUMMARY CARD
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
    <div
      className="
        min-w-0
        rounded-xl
        border
        border-border
        bg-card
        p-3
        sm:p-4
      "
    >
      <p
        className="
          font-mono
          text-[10px]
          uppercase
          tracking-wider
          text-muted-foreground
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          truncate
          text-xl
          font-semibold
          tabular-nums
          text-foreground
        "
        title={value}
      >
        {value}
      </p>

      <p
        className="
          mt-1
          truncate
          text-[11px]
          text-muted-foreground
        "
        title={detail}
      >
        {detail}
      </p>
    </div>
  );
}

/* =========================================================
   PROJECT DETAIL PAGE
   ========================================================= */

export default async function ProjectPage({
  params,
  searchParams = {},
}: {
  params: { id: string };
  searchParams?: { tab?: string;task?:string };
}) {
  /* =======================================================
     AUTHENTICATION
     ======================================================= */

  const { client } = await requireStaff();

  if (
    !z.string().uuid().safeParse(
      params.id
    ).success
  ) {
    notFound();
  }

  /* =======================================================
     ORIGINAL INQUIRY
     ======================================================= */

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
    listProposals(
      client,
      params.id
    ),
    getReadiness(
      client,
      params.id
    ),
    getChecklist(
      client,
      params.id
    ),
    getProject(
      client,
      params.id
    ),
  ]);

  /* =======================================================
     ACTIVATION REQUIREMENTS
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
    gate.record.proposal_version ===
      accepted?.version &&
    onboarding.record.proposal_version ===
      accepted?.version &&
    onboarding.record.completed_readiness_revision ===
      gate.record.revision &&
    (
      !data.record ||
      data.record.proposal_version ===
        accepted?.version
    );

  /* =======================================================
     PROJECT RECORD
     ======================================================= */

  const record = data.record;

  const base = `/projects/${params.id}`;

  const owner =
    record?.body.owner ||
    'Unassigned';

  const progress = record
    ? projectProgress(record.body)
    : null;

  /* =======================================================
     COMPANY NAME
     ======================================================= */

  /*
   * Use the company name for the workspace
   * tab and breadcrumbs.
   *
   * Never use the project UUID as the
   * display label.
   */

  const companyName =
    inquiry.payload.company?.trim() ||
    inquiry.payload.name?.trim() ||
    record?.body.title ||
    'Unnamed client';

  /* =======================================================
     PROJECT TYPE
     ======================================================= */

  /*
   * There is no separate project-type field
   * in the current project body schema.
   *
   * Derive the display type from the
   * requested service catalog.
   */

  const selectedServices =
    inquiry.payload.services;

  const primaryService =
    selectedServices[0];

  const primaryServiceName =
    primaryService
      ? (
          primaryService.serviceName?.trim() ||
          getServiceBlueprint(
            primaryService.serviceId
          )?.name ||
          'Custom Service'
        )
      : null;

  const projectType =
    selectedServices.length > 1
      ? 'Multi-service Project'
      : primaryServiceName
        ? `${primaryServiceName} Project`
        : 'Custom Project';

  /* =======================================================
     TASKS AND MILESTONES
     ======================================================= */

  const openTasks =
    record?.body.tasks
      .filter(
        (task) =>
          task.status !== 'done'
      )
      .sort(
        (a, b) =>
          (
            a.dueOn ??
            '9999-12-31'
          ).localeCompare(
            b.dueOn ??
            '9999-12-31'
          )
      ) ?? [];

  const blocked =
    openTasks.filter(
      (task) =>
        task.status === 'blocked'
    ).length;

  const milestoneDone =
    record?.body.milestones.filter(
      (milestone) =>
        milestone.status === 'done'
    ).length ?? 0;

  /* =======================================================
     SELECTED PROJECT SECTION
     ======================================================= */

  /*
   * The shared StaffWorkspaceShell now
   * renders the visual section navigation.
   *
   * This page only resolves the requested
   * section and renders its content.
   */

  const defaultTab: Tab =
    record
      ? 'overview'
      : 'plan';

  const requestedTask=searchParams.task;const selectedTask=requestedTask&&record?.body.tasks.some(task=>task.id===requestedTask)?requestedTask:undefined;
  const requestedTab =
    searchParams.tab;

  const requested =
    ALL_TABS.find(
      (item) =>
        item === requestedTab
    );

  const tab: Tab =
    !record || !requested
      ? defaultTab
      : requested;

  /* =======================================================
     LOAD ACTIVE SECTION DATA
     ======================================================= */

  /*
   * Only load the specific editor needed
   * by the currently selected section.
   */

  const lifecycle =
    record &&
    tab === 'lifecycle'
      ? await getProjectLifecycle(
          client,
          params.id
        )
      : null;

  const brief =
    record &&
    tab === 'brief'
      ? await getProjectBrief(
          client,
          params.id
        )
      : null;

  const delivery =
    record &&
    tab === 'delivery'
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
          REGISTER WORKSPACE TAB METADATA
          =================================================== */}

      <WorkspaceRecordDetails
        kind="project"
        id={params.id}
        title={companyName}
        recordType={projectType}
        status={
          record?.state ??
          'Not activated'
        }
      />

      {/* ===================================================
          OVERVIEW
          =================================================== */}

      {tab === 'overview' &&
        record &&
        progress && (
          <div className="space-y-4">

            {/* PROJECT METADATA */}

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-x-5
                gap-y-1.5
                text-[11px]
                text-muted-foreground
              "
            >
              <span>
                Project owner:{' '}
                <strong className="font-semibold text-foreground">
                  {owner}
                </strong>
              </span>

              <span>
                Last updated:{' '}
                {formatDate(
                  record.updated_at
                )}
              </span>
            </div>

            {/* SUMMARY METRICS */}

            <div
              className="
                grid
                gap-3
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              <Stat
                label="Tasks completed"
                value={`${progress.done}/${progress.total}`}
                detail={`${progress.percent}% complete`}
              />

              <Stat
                label="Open tasks"
                value={String(
                  openTasks.length
                )}
                detail={`${blocked} blocked`}
              />

              <Stat
                label="Milestones"
                value={`${milestoneDone}/${record.body.milestones.length}`}
                detail="Completed milestones"
              />

              <Stat
                label="Next action"
                value={
                  openTasks[0]?.dueOn ||
                  '—'
                }
                detail={
                  openTasks[0]?.title ||
                  'No pending tasks'
                }
              />
            </div>

            {/* TASKS + MILESTONES GRID */}

            <div
              className="
                grid
                items-start
                gap-4
                lg:grid-cols-2
              "
            >
              {/* OPEN TASKS */}

              <section
                className="
                  min-w-0
                  overflow-hidden
                  rounded-xl
                  border
                  border-border
                  bg-card
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    border-b
                    border-border
                    px-4
                    py-3
                  "
                >
                  <h2 className="text-sm font-semibold">
                    Open tasks
                  </h2>

                  <Link
                    href={`${base}?tab=plan`}
                    className="
                      inline-flex
                      shrink-0
                      items-center
                      gap-1
                      text-xs
                      font-medium
                      text-muted-foreground
                      hover:text-foreground
                    "
                  >
                    Edit tasks

                    <ArrowUpRight
                      size={13}
                    />
                  </Link>
                </div>

                {openTasks.length ? (
                  <ul className="divide-y divide-border">
                    {openTasks
                      .slice(0, 6)
                      .map(
                        (task) => (
                          <li
                            key={task.id}
                            className="
                              flex
                              items-center
                              justify-between
                              gap-3
                              px-4
                              py-3
                              text-xs
                            "
                          >
                            <span
                              title={
                                task.title
                              }
                              className="
                                min-w-0
                                truncate
                                font-medium
                              "
                            >
                              {
                                task.title
                              }
                            </span>

                            <span
                              className="
                                shrink-0
                                text-muted-foreground
                              "
                            >
                              {task.dueOn ||
                                'No due date'}
                            </span>
                          </li>
                        )
                      )}
                  </ul>
                ) : (
                  <p
                    className="
                      px-4
                      py-5
                      text-xs
                      text-muted-foreground
                    "
                  >
                    No open tasks.
                  </p>
                )}
              </section>

              {/* MILESTONES */}

              <section
                className="
                  min-w-0
                  overflow-hidden
                  rounded-xl
                  border
                  border-border
                  bg-card
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    border-b
                    border-border
                    px-4
                    py-3
                  "
                >
                  <h2 className="text-sm font-semibold">
                    Milestones
                  </h2>

                  <Link
                    href={`${base}?tab=plan`}
                    className="
                      inline-flex
                      shrink-0
                      items-center
                      gap-1
                      text-xs
                      font-medium
                      text-muted-foreground
                      hover:text-foreground
                    "
                  >
                    Edit milestones

                    <ArrowUpRight
                      size={13}
                    />
                  </Link>
                </div>

                {record.body.milestones.length ? (
                  <ul className="divide-y divide-border">
                    {record.body.milestones
                      .slice(0, 6)
                      .map(
                        (milestone) => (
                          <li
                            key={
                              milestone.id
                            }
                            className="
                              flex
                              items-center
                              justify-between
                              gap-3
                              px-4
                              py-3
                              text-xs
                            "
                          >
                            <span
                              title={
                                milestone.title
                              }
                              className="
                                min-w-0
                                truncate
                                font-medium
                              "
                            >
                              {
                                milestone.title
                              }
                            </span>

                            <span
                              className="
                                flex
                                shrink-0
                                items-center
                                gap-1
                                text-muted-foreground
                              "
                            >
                              {milestone.status ===
                                'done' && (
                                <CheckCircle2
                                  size={13}
                                />
                              )}

                              {milestone.status.replaceAll(
                                '_',
                                ' '
                              )}
                            </span>
                          </li>
                        )
                      )}
                  </ul>
                ) : (
                  <p className="px-4 py-5 text-xs text-muted-foreground">
                    No milestones yet.
                  </p>
                )}
              </section>
            </div>

            {/* PROJECT NOTES AND HISTORY */}

            {(
              record.body.notes ||
              data.history.length > 0
            ) && (
              <div
                className="
                  grid
                  items-start
                  gap-3
                  lg:grid-cols-2
                "
              >
                {record.body.notes && (
                  <details
                    className="
                      rounded-xl
                      border
                      border-border
                      bg-card
                      p-4
                    "
                  >
                    <summary
                      className="
                        cursor-pointer
                        text-xs
                        font-semibold
                      "
                    >
                      Project notes
                    </summary>

                    <p
                      className="
                        mt-3
                        whitespace-pre-wrap
                        break-words
                        text-xs
                        text-muted-foreground
                      "
                    >
                      {
                        record.body.notes
                      }
                    </p>
                  </details>
                )}

                {data.history.length > 0 && (
                  <details
                    className="
                      rounded-xl
                      border
                      border-border
                      bg-card
                      p-4
                    "
                  >
                    <summary
                      className="
                        cursor-pointer
                        text-xs
                        font-semibold
                      "
                    >
                      Recent project history
                    </summary>

                    <ul
                      className="
                        mt-3
                        divide-y
                        divide-border
                      "
                    >
                      {data.history
                        .slice(0, 5)
                        .map(
                          (event) => (
                            <li
                              key={
                                event.id
                              }
                              className="
                                py-2
                                text-xs
                              "
                            >
                              <span className="font-medium capitalize">
                                {event.action.replaceAll(
                                  '_',
                                  ' '
                                )}
                              </span>

                              <span className="ml-2 text-muted-foreground">
                                {formatDate(
                                  event.created_at
                                )}
                              </span>
                            </li>
                          )
                        )}
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

          {requestedTask&&!selectedTask&&<p role="status" className="rounded border p-4 text-sm">This task is no longer in the project. The current work plan remains available below.</p>}
          <ProjectWorkspace
            key={
              `${record?.revision??0}:${selectedTask||''}`
            }
            id={params.id}
            record={record}
            history={data.history}
            gateReady={gateReady}
            selectedTask={selectedTask}
          />
        </div>
      )}

      {/* ===================================================
          LIFECYCLE
          =================================================== */}

      {tab === 'lifecycle' &&
        record &&
        (
          lifecycle?.lifecycle ? (
            <ProjectLifecycleControls
              key={`${record.revision}:${selectedTask||''}`}
              selectedTask={selectedTask}
              id={params.id}
              lifecycle={
                lifecycle.lifecycle
              }
              controls={
                lifecycle.controls
              }
              tasks={
                record.body.tasks
              }
              events={
                lifecycle.events
              }
            />
          ) : (
            <p
              className="
                rounded-xl
                border
                border-border
                bg-card
                p-5
                text-sm
                text-muted-foreground
              "
            >
              Lifecycle information is not available
              for this project.
            </p>
          )
        )}

      {/* ===================================================
          BRIEF
          =================================================== */}

      {tab === 'brief' &&
        record &&
        (
          brief ? (
            <ProjectBriefEditor
              id={params.id}
              draft={brief.draft}
              versions={brief.versions}
            />
          ) : (
            <p
              className="
                rounded-xl
                border
                border-border
                bg-card
                p-5
                text-sm
                text-muted-foreground
              "
            >
              No project brief is available yet.
            </p>
          )
        )}

      {/* ===================================================
          DELIVERY
          =================================================== */}

      {tab === 'delivery' &&
        record &&
        (
          delivery ? (
            <ProjectDeliveryControls
              id={params.id}
              deliverables={
                delivery.deliverables
              }
              versions={
                delivery.versions
              }
              changes={
                delivery.changes
              }
              qaChecks={
                delivery.qaChecks
              }
              handoffItems={
                delivery.handoffItems
              }
              closeout={
                delivery.closeout
              }
            />
          ) : (
            <p
              className="
                rounded-xl
                border
                border-border
                bg-card
                p-5
                text-sm
                text-muted-foreground
              "
            >
              Delivery details are not available
              for this project.
            </p>
          )
        )}
    </div>
  );
}
