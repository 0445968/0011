import { getProjectDirectoryContext } from '@/lib/projects/directory-context';
import { validDirectoryMode } from '@/lib/projects/directory-types';

import {
  FolderKanban,
} from 'lucide-react';

import {
  requireStaff,
} from '@/lib/admin/auth';

import {
  listProjects,
  projectStateSchema,
  projectSortSchema,
  projectSortDirectionSchema,
  projectOwnerFilterSchema,
  projectTaskFilterSchema,
  projectMilestoneFilterSchema,
  type ProjectState,
  type ProjectSortKey,
  type ProjectSortDirection,
  type ProjectOwnerFilter,
  type ProjectTaskFilter,
  type ProjectMilestoneFilter,
} from '@/lib/projects/data';

import {
  ProjectDirectory,
  type ProjectDirectoryViewFilters,
} from '@/components/admin/ProjectDirectory';

/* =========================================================
   SEARCH PARAMETERS
   ========================================================= */

interface ProjectsSearchParams {
  state?: string;
  search?: string;
  owner?: string;
  taskStatus?: string;
  milestoneStatus?: string;
  sort?: string;
  direction?: string;
  page?: string;
  view?: string;
}

/* =========================================================
   VALIDATE FILTERS
   ========================================================= */

function getFilters(
  params: ProjectsSearchParams
): ProjectDirectoryViewFilters {
  /* -------------------------------------------------------
     PROJECT STATUS
     ------------------------------------------------------- */

  const parsedState =
    projectStateSchema.safeParse(
      params.state
    );

  const state: ProjectState | null =
    parsedState.success
      ? parsedState.data
      : null;

  /* -------------------------------------------------------
     PROJECT SEARCH
     ------------------------------------------------------- */

  const search = (params.search ?? '')
    .replace(/[^a-zA-Z0-9 @._-]/g, '')
    .trim()
    .slice(0, 80);

  /* -------------------------------------------------------
     OWNER ASSIGNMENT
     ------------------------------------------------------- */

  const parsedOwner =
    projectOwnerFilterSchema.safeParse(
      params.owner
    );

  const owner: ProjectOwnerFilter =
    parsedOwner.success
      ? parsedOwner.data
      : 'all';

  /* -------------------------------------------------------
     TASK STATUS
     ------------------------------------------------------- */

  const parsedTaskStatus =
    projectTaskFilterSchema.safeParse(
      params.taskStatus
    );

  const taskStatus: ProjectTaskFilter =
    parsedTaskStatus.success
      ? parsedTaskStatus.data
      : 'all';

  /* -------------------------------------------------------
     MILESTONE STATUS
     ------------------------------------------------------- */

  const parsedMilestoneStatus =
    projectMilestoneFilterSchema.safeParse(
      params.milestoneStatus
    );

  const milestoneStatus: ProjectMilestoneFilter =
    parsedMilestoneStatus.success
      ? parsedMilestoneStatus.data
      : 'all';

  /* -------------------------------------------------------
     SORT FIELD
     ------------------------------------------------------- */

  const parsedSort =
    projectSortSchema.safeParse(
      params.sort
    );

  const sort: ProjectSortKey =
    parsedSort.success
      ? parsedSort.data
      : 'updated';

  /* -------------------------------------------------------
     SORT DIRECTION
     ------------------------------------------------------- */

  const parsedDirection =
    projectSortDirectionSchema.safeParse(
      params.direction
    );

  const direction: ProjectSortDirection =
    parsedDirection.success
      ? parsedDirection.data
      : 'desc';

  return {
    state,
    search,
    owner,
    taskStatus,
    milestoneStatus,
    sort,
    direction,
  };
}

/* =========================================================
   PAGINATION
   ========================================================= */

function getPage(value?: string) {
  const parsed = Number(value ?? '1');

  if (
    !Number.isInteger(parsed) ||
    parsed < 1 ||
    parsed > 10000
  ) {
    return 1;
  }

  return parsed;
}

/* =========================================================
   PROJECTS PAGE
   ========================================================= */

export default async function ProjectsPage({
  searchParams = {},
}: {
  searchParams: ProjectsSearchParams;
}) {
  /* -------------------------------------------------------
     AUTHENTICATION
     ------------------------------------------------------- */

  const { client } = await requireStaff();

  /* -------------------------------------------------------
     VALIDATED DIRECTORY STATE
     ------------------------------------------------------- */

  const filters = getFilters(
    searchParams
  );

  const page = getPage(
    searchParams.page
  );

  /* -------------------------------------------------------
     FILTERED AND SORTED PROJECTS

     Queries are executed on the server.
     Pagination is handled by Supabase.
     ------------------------------------------------------- */

  const {
    projects,
    total,
  } = await listProjects(
    client,
    filters.state,
    page,
    {
      search: filters.search,
      owner: filters.owner,
      taskStatus: filters.taskStatus,
      milestoneStatus: filters.milestoneStatus,
      sort: filters.sort,
      direction: filters.direction,
    }
  );

  const context = await getProjectDirectoryContext(client, projects.map(project => project.request_id));

  /* -------------------------------------------------------
     PAGE CONTENT
     ------------------------------------------------------- */

  return (
    <div className="space-y-4">

      {/* PAGE HEADER */}

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
          <h1
            className="
              font-heading
              text-xl
              font-semibold
              tracking-tight
              sm:text-2xl
            "
          >
            Projects
          </h1>

          <p
            className="
              mt-1.5
              text-xs
              text-muted-foreground
              sm:text-sm
            "
          >
            Manage project work, milestones,
            and client collaboration.
          </p>
        </div>

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-border
            bg-card
            text-foreground
          "
        >
          <FolderKanban
            size={19}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>
      </header>

      {/* INTERACTIVE PROJECT DIRECTORY */}

      <ProjectDirectory
        projects={projects}
        context={context}
        mode={validDirectoryMode(searchParams.view)}
        total={total}
        page={page}
        filters={filters}
      />
    </div>
  );
}
