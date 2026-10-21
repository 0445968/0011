import {ApprovalFocus} from '@/components/admin/approvals/ApprovalFocus';

import { notFound } from 'next/navigation';
import { z } from 'zod';


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
  ProjectWorkspace,
} from '@/components/admin/ProjectWorkspace';

import {
  requireStaff,
} from '@/lib/admin/auth';

import {
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

import { ProjectOverview } from '@/components/admin/projects/ProjectOverview';
import { ProjectCalendar } from '@/components/admin/projects/ProjectCalendar';
import { ProjectTaskResponseReview } from '@/components/admin/projects/ProjectTaskResponseReview';
import { getProjectDirectoryContext } from '@/lib/projects/directory-context';
import { getProjectOverviewExtras } from '@/lib/projects/overview-data';
import { taskToday } from '@/lib/tasks/links';
import { getProjectTaskSchedule } from '@/lib/projects/schedule-data';
import { projectPhaseStatesSchema } from '@/lib/projects/phase-status';

import {
  getServiceBlueprint,
} from '@/data/serviceCatalog';

/* =========================================================
   PROJECT SECTIONS
   ========================================================= */

type Tab =
  | 'overview'
  | 'plan'
  | 'calendar'
  | 'brief'
  | 'delivery';

const ALL_TABS: Tab[] = [
  'overview',
  'plan',
  'calendar',
  'brief',
  'delivery',
];

/* =========================================================
   PROJECT DETAIL PAGE
   ========================================================= */

export default async function ProjectPage({
  params,
  searchParams = {},
}: {
  params: { id: string };
  searchParams?: { tab?: string;task?:string;focus?:string;milestone?:string };
}) {
  /* =======================================================
     AUTHENTICATION
     ======================================================= */

  const { client, user } = await requireStaff();

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
  const requestedMilestone = searchParams.milestone;
  const selectedMilestone = requestedMilestone && record?.body.milestones.some(item => item.id === requestedMilestone) ? requestedMilestone : undefined;
  const requestedTab =
    searchParams.tab;

  const canonicalRequestedTab = requestedTab === 'lifecycle' ? 'calendar' : requestedTab;
  const requested =
    ALL_TABS.find(
      (item) =>
        item === canonicalRequestedTab
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
    tab === 'calendar'
      ? await getProjectLifecycle(
          client,
          params.id
        )
      : null;

  const [calendarExtras, scheduleRows, phaseStatesResult] = record && tab === 'calendar'
    ? await Promise.all([
        getProjectOverviewExtras(client, params.id),
        getProjectTaskSchedule(client, params.id),
        client.rpc('staff_project_phase_states', { p_request: params.id }),
      ])
    : [null, null, null] as const;
  if (phaseStatesResult?.error) throw new Error('Project phase schedule could not load. Check migration 035.');
  const phaseStates = phaseStatesResult ? projectPhaseStatesSchema.parse(phaseStatesResult.data).states : [];
  const calendarToday = record && tab === 'calendar'
    ? taskToday((await client.from('staff_notification_preferences').select('timezone').eq('user_id', user.id).maybeSingle()).data?.timezone || 'America/Chicago').today
    : '';

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

  // Read-only enrichment is loaded for Overview only. Editors keep their existing
  // source data, keys, revision checks and action handlers.
  let overview = null;
  if (record && tab === 'overview') {
    const [contexts, preferences, extras, formalPhasesResult] = await Promise.all([
      getProjectDirectoryContext(client, [params.id]),
      client.from('staff_notification_preferences').select('timezone').eq('user_id', user.id).maybeSingle(),
      getProjectOverviewExtras(client, params.id),
      client.rpc('staff_project_phase_states', { p_request: params.id }),
    ]);
    if (preferences.error) throw new Error('Project timezone preferences could not load.');
    if (formalPhasesResult.error) throw new Error('Saved project phase statuses could not load. Check migration 035.');
    const formalPhases = projectPhaseStatesSchema.parse(formalPhasesResult.data).states;
    const day = taskToday(preferences.data?.timezone || 'America/Chicago');
    overview = { context: contexts[params.id], ...day, ...extras, phaseStates: formalPhases };
  }

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
        recordType={record?.body.title || projectType}
        status={
          record?.state ??
          'Not activated'
        }
      />

      {/* ===================================================
          OVERVIEW
          =================================================== */}

      {tab === 'overview' && record && overview && (
        <ProjectOverview
          record={record}
          history={data.history}
          context={overview.context}
          today={overview.today}
          timezone={overview.timezone}
          members={overview.members}
          milestonePhases={overview.milestonePhases}
          phaseStates={overview.phaseStates}
        />
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
          {requestedMilestone && !selectedMilestone && <p role="status" className="rounded border p-4 text-sm">This milestone is no longer in the project. The current work plan remains available below.</p>}
          <ProjectWorkspace
            key={
              `${record?.revision??0}:${selectedTask||''}:${selectedMilestone||''}`
            }
            id={params.id}
            userId={user.id}
            record={record}
            history={data.history}
            gateReady={gateReady}
            selectedTask={selectedTask}
            selectedMilestone={selectedMilestone}
          />
          {record && <ProjectTaskResponseReview id={params.id} tasks={record.body.tasks.map(task => ({ id:task.id, title:task.title }))} />}
        </div>
      )}

      {/* ===================================================
          LIFECYCLE
          =================================================== */}

      {tab === 'calendar' && record && lifecycle?.lifecycle && calendarExtras && scheduleRows && (
        <ProjectCalendar
          id={params.id}
          body={record.body}
          projectRevision={record.revision}
          controls={lifecycle.controls}
          events={lifecycle.events}
          lifecycle={lifecycle.lifecycle}
          phaseStates={phaseStates}
          schedule={scheduleRows}
          members={calendarExtras.members}
          milestonePhases={calendarExtras.milestonePhases}
          today={calendarToday}
        />
      )}

      {/* ===================================================
          BRIEF
          =================================================== */}

      {tab === 'brief' &&
        record &&
        (
          brief ? (
            <><ApprovalFocus focus={searchParams.focus}/><ProjectBriefEditor
              id={params.id}
              draft={brief.draft}
              versions={brief.versions}
            /></>
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
            <><ApprovalFocus focus={searchParams.focus}/><ProjectDeliveryControls
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
            /></>
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
