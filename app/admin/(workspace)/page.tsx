
import Link from 'next/link';

import {
  ArrowUpRight,
  FolderKanban,
  Inbox,
} from 'lucide-react';

import { requireStaff } from '@/lib/admin/auth';

import {
  formatDate,
  listInquiries,
  statusLabels,
  type InquiryStatus,
} from '@/lib/admin/inquiries';

import { WorkspaceStatusBadge } from '@/components/admin/WorkspaceStatusBadge';

import { listProjects } from '@/lib/projects/data';
import {DirectoryStatus} from '@/components/admin/projects/DirectoryIndicators';

import {
  projectProgress,
  projectStates,
} from '@/lib/projects/schema';

/* =========================================================
   DASHBOARD PREVIEW CONFIGURATION
   ========================================================= */

const PREVIEW_LIMIT = 5;

const inquiryStatusStyles: Record<InquiryStatus, string> = {
  new: `
    border-violet-200
    bg-violet-50
    text-violet-700
    dark:border-violet-500/30
    dark:bg-violet-500/15
    dark:text-violet-300
  `,

  qualified: `
    border-blue-200
    bg-blue-50
    text-blue-700
    dark:border-blue-500/30
    dark:bg-blue-500/15
    dark:text-blue-300
  `,

  declined: `
    border-slate-200
    bg-slate-100
    text-slate-700
    dark:border-slate-500/30
    dark:bg-slate-500/15
    dark:text-slate-300
  `,
};

const projectStatusStyles = {
  active: `
    border-emerald-200
    bg-emerald-50
    text-emerald-700
    dark:border-emerald-500/30
    dark:bg-emerald-500/15
    dark:text-emerald-300
  `,

  on_hold: `
    border-amber-200
    bg-amber-50
    text-amber-700
    dark:border-amber-500/30
    dark:bg-amber-500/15
    dark:text-amber-300
  `,

  completed: `
    border-blue-200
    bg-blue-50
    text-blue-700
    dark:border-blue-500/30
    dark:bg-blue-500/15
    dark:text-blue-300
  `,
};

/* =========================================================
   DASHBOARD
   ========================================================= */

export default async function StaffDashboardPage() {
  const { client } = await requireStaff();

  // Reuse existing data services.
  // No new database queries or API endpoints.

  const [
    inquiryResult,
    projectResult,
  ] = await Promise.all([
    listInquiries(client, null, 1),
    listProjects(client, null, 1),
  ]);

  const inquiries = inquiryResult.inquiries.slice(
    0,
    PREVIEW_LIMIT
  );

  const projects = projectResult.projects.slice(
    0,
    PREVIEW_LIMIT
  );

  return (
    <div className="space-y-6">

      {/* ===============================================
          DASHBOARD HEADER
          =============================================== */}

      <header
        className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-4
        "
      >
        <div>
          <p
            className="
              font-mono
              text-[11px]
              font-medium
              uppercase
              tracking-[0.12em]
              text-primary
            "
          >
            Staff workspace
          </p>

          <h1
            className="
              mt-2
              font-heading
              text-2xl
              font-semibold
              tracking-tight
              sm:text-3xl
            "
          >
            Dashboard
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-muted-foreground
            "
          >
            A quick overview of recent inquiries and
            ongoing projects.
          </p>
        </div>
      </header>

      {/* ===============================================
          PREVIEW GRID
          =============================================== */}

      <div
        className="
          grid
          min-w-0
          gap-5
          lg:grid-cols-2
        "
      >
        {/* ===========================================
            RECENT INQUIRIES
            =========================================== */}

        <section
          aria-labelledby="recent-inquiries-title"
          className="
            flex
            min-h-0
            min-w-0
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-border
            bg-card
            lg:max-h-[calc(100dvh-225px)]
          "
        >
          {/* Section heading */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              gap-3
              border-b
              border-border
              px-5
              py-4
            "
          >
            <div className="flex items-center gap-3">
              <span
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-500/10
                  text-violet-600
                  dark:text-violet-400
                "
              >
                <Inbox size={18} />
              </span>

              <div>
                <h2
                  id="recent-inquiries-title"
                  className="
                    font-heading
                    text-sm
                    font-semibold
                  "
                >
                  Recent inquiries
                </h2>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-muted-foreground
                  "
                >
                  {inquiryResult.total}{' '}
                  {inquiryResult.total === 1
                    ? 'inquiry'
                    : 'inquiries'}{' '}
                  total
                </p>
              </div>
            </div>

<Link
  href="/admin/inquiries"
  className="
    inline-flex
    items-center
    gap-1
    text-xs
    font-semibold
    text-primary
    transition-opacity
    hover:opacity-70
  "
>
  View all
  <ArrowUpRight size={14} />
</Link>
          </div>

          {/* Inquiry preview */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              scrollbar-transparent
            "
          >
            {inquiries.length > 0 ? (
              <div className="divide-y divide-border">
                {inquiries.map((inquiry) => (
                  <Link
                    key={inquiry.request_id}
                    href={`/admin/leads/${inquiry.request_id}`}
                    className="
                      group
                      flex
                      items-center
                      justify-between
                      gap-3
                      px-5
                      py-4
                      transition-colors
                      hover:bg-muted/40
                    "
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className="
                          truncate
                          text-sm
                          font-semibold
                          transition-colors
                          group-hover:text-primary
                        "
                      >
                        {inquiry.payload.name}
                      </p>

                      <p
                        className="
                          mt-1
                          truncate
                          text-xs
                          text-muted-foreground
                        "
                      >
                        {inquiry.payload.company ||
                          inquiry.payload.email}
                      </p>

                      <p
                        className="
                          mt-1.5
                          text-[11px]
                          text-muted-foreground
                        "
                      >
                        {formatDate(inquiry.created_at)}
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        shrink-0
                        items-center
                        gap-2
                      "
                    >
<WorkspaceStatusBadge
  kind="inquiry"
  status={inquiry.status}
/>

                      <ArrowUpRight
                        size={15}
                        className="
                          text-muted-foreground
                          transition-colors
                          group-hover:text-primary
                        "
                      />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div
                className="
                  px-6
                  py-12
                  text-center
                  text-sm
                  text-muted-foreground
                "
              >
                No inquiries yet.
              </div>
            )}
          </div>
        </section>

        {/* ===========================================
            RECENT PROJECTS
            =========================================== */}

        <section
          aria-labelledby="recent-projects-title"
          className="
            flex
            min-h-0
            min-w-0
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-border
            bg-card
            lg:max-h-[calc(100dvh-225px)]
          "
        >
          {/* Section heading */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              gap-3
              border-b
              border-border
              px-5
              py-4
            "
          >
            <div className="flex items-center gap-3">
              <span
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-500/10
                  text-blue-600
                  dark:text-blue-400
                "
              >
                <FolderKanban size={18} />
              </span>

              <div>
                <h2
                  id="recent-projects-title"
                  className="
                    font-heading
                    text-sm
                    font-semibold
                  "
                >
                  Recent projects
                </h2>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-muted-foreground
                  "
                >
                  {projectResult.total}{' '}
                  {projectResult.total === 1
                    ? 'project'
                    : 'projects'}{' '}
                  total
                </p>
              </div>
            </div>

            <Link
              href="/admin/projects"
              className="
                inline-flex
                items-center
                gap-1
                text-xs
                font-semibold
                text-primary
                transition-opacity
                hover:opacity-70
              "
            >
              View all
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Project preview */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              scrollbar-transparent
            "
          >
            {projects.length > 0 ? (
              <div className="divide-y divide-border">
                {projects.map((project) => {
                  const progress = projectProgress(
                    project.body
                  );

                  return (
                    <Link
                      key={project.request_id}
                      href={`/admin/projects/${project.request_id}`}
                      className="
                        group
                        block
                        px-5
                        py-4
                        transition-colors
                        hover:bg-muted/40
                      "
                    >
                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        "
                      >
                        <div className="min-w-0 flex-1">
                          <p
                            className="
                              truncate
                              text-sm
                              font-semibold
                              transition-colors
                              group-hover:text-primary
                            "
                          >
                            {project.body.title}
                          </p>

                          <p
                            className="
                              mt-1
                              truncate
                              text-xs
                              text-muted-foreground
                            "
                          >
                            {project.body.owner ||
                              'Unassigned'}
                          </p>
                        </div>

<DirectoryStatus state={project.state} operationalStatus={project.operational_status} />
                      </div>

                      {/* Existing task progress */}

                      <div className="mt-3">
                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-3
                            text-[11px]
                            text-muted-foreground
                          "
                        >
                          <span>
                            {progress.done} of{' '}
                            {progress.total} tasks
                          </span>

                          <span className="font-medium">
                            {progress.percent===null?'No tasks':`${progress.percent??0}%`}
                          </span>
                        </div>

                        <div
                          className="
                            mt-2
                            h-1.5
                            overflow-hidden
                            rounded-full
                            bg-muted
                          "
                        >
                          <div
                            className="
                              h-full
                              rounded-full
                              bg-primary
                            "
                            style={{
                              width: `${progress.percent===null?'No tasks':`${progress.percent??0}%`}`,
                            }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div
                className="
                  px-6
                  py-12
                  text-center
                  text-sm
                  text-muted-foreground
                "
              >
                No projects yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
