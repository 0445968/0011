
import 'server-only';

import { z } from 'zod';

import type {
  SupabaseClient,
} from '@supabase/supabase-js';

import {
  projectBodySchema,
} from './schema';

import {
  proposalBodySchema,
} from '@/lib/proposals/schema';

import {
  checklistBodySchema,
} from '@/lib/onboarding/checklist-schema';

import {
  readinessBodySchema,
} from '@/lib/onboarding/schema';

/* =========================================================
   CONFIGURATION
   ========================================================= */

export const PROJECT_PAGE_SIZE = 25;

/* =========================================================
   FILTER AND SORT SCHEMAS
   ========================================================= */

export const projectStateSchema = z.enum([
  'active',
  'on_hold',
  'completed',
]);
export const projectDirectoryStatusSchema = z.enum(['active','on_hold','waiting_on_client','inactive','completed']);
export type ProjectDirectoryStatus = z.infer<typeof projectDirectoryStatusSchema>;

export const projectSortSchema = z.enum([
  'updated',
  'title',
  'owner',
  'state',
]);

export const projectSortDirectionSchema = z.enum([
  'asc',
  'desc',
]);

export const projectOwnerFilterSchema = z.enum([
  'all',
  'assigned',
  'unassigned',
]);

export const projectTaskFilterSchema = z.enum([
  'all',
  'todo',
  'doing',
  'blocked',
  'done',
]);

export const projectMilestoneFilterSchema = z.enum([
  'all',
  'planned',
  'in_progress',
  'done',
]);

export type ProjectState = z.infer<
  typeof projectStateSchema
>;

export type ProjectSortKey = z.infer<
  typeof projectSortSchema
>;

export type ProjectSortDirection = z.infer<
  typeof projectSortDirectionSchema
>;

export type ProjectOwnerFilter = z.infer<
  typeof projectOwnerFilterSchema
>;

export type ProjectTaskFilter = z.infer<
  typeof projectTaskFilterSchema
>;

export type ProjectMilestoneFilter = z.infer<
  typeof projectMilestoneFilterSchema
>;

export interface ProjectDirectoryFilters {
  search?: string;
  owner?: ProjectOwnerFilter;
  taskStatus?: ProjectTaskFilter;
  milestoneStatus?: ProjectMilestoneFilter;
  sort?: ProjectSortKey;
  direction?: ProjectSortDirection;
}

/* =========================================================
   PROJECT RECORD SCHEMAS
   ========================================================= */

const summarySchema = z.object({
  request_id: z.string().uuid(),
  state: projectStateSchema,
  body: projectBodySchema,
  updated_at: z.string(),
  operational_status: projectDirectoryStatusSchema.optional(),
});

export type ProjectSummary = z.infer<
  typeof summarySchema
>;

const recordSchema = summarySchema.extend({
  proposal_version: z.number().int(),
  revision: z.number().int(),

  scope_snapshot: proposalBodySchema,

  onboarding_snapshot: checklistBodySchema,

  onboarding_items_snapshot: z
    .array(z.record(z.unknown()))
    .catch([]),

  readiness_snapshot: readinessBodySchema,

  activated_readiness_revision: z.number(),

  activated_onboarding_revision: z.number(),

  activated_at: z.string(),

  activated_by: z.string().nullable(),
});

export type ProjectRecord = z.infer<
  typeof recordSchema
>;

const eventSchema = z.object({
  id: z.number(),
  action: z.string(),
  reason: z.string(),
  actor: z.string().nullable(),
  created_at: z.string(),

  snapshot: z.object({
    state: projectStateSchema,
    revision: z.number(),
    body: projectBodySchema,
  }),
});

export type ProjectEvent = z.infer<
  typeof eventSchema
>;

/* =========================================================
   SORT COLUMN ALLOWLIST
   ========================================================= */

const SORT_COLUMNS: Record<
  ProjectSortKey,
  string
> = {
  updated: 'updated_at',
  title: 'body->>title',
  owner: 'body->>owner',
  state: 'operational_status',
};

/* =========================================================
   VALIDATE OPTION
   ========================================================= */

function validChoice<T extends string>(
  schema: z.ZodType<T>,
  value: unknown,
  fallback: T
): T {
  const result = schema.safeParse(value);

  return result.success
    ? result.data
    : fallback;
}

/* =========================================================
   LIST PROJECTS

   Filters and sorting are applied in Supabase
   before pagination.
   ========================================================= */

export async function listProjects(
  client: SupabaseClient,
  state: string | null,
  page: number,
  filters: ProjectDirectoryFilters = {}
) {
  /* -------------------------------------------------------
     VALIDATE OPTIONS
     ------------------------------------------------------- */

  const sort = validChoice(
    projectSortSchema,
    filters.sort,
    'updated'
  );

  const direction = validChoice(
    projectSortDirectionSchema,
    filters.direction,
    'desc'
  );

  const owner = validChoice(
    projectOwnerFilterSchema,
    filters.owner,
    'all'
  );

  const taskStatus = validChoice(
    projectTaskFilterSchema,
    filters.taskStatus,
    'all'
  );

  const milestoneStatus = validChoice(
    projectMilestoneFilterSchema,
    filters.milestoneStatus,
    'all'
  );

  /* -------------------------------------------------------
     BASE QUERY
     ------------------------------------------------------- */

  let query = client
    .from('staff_project_directory')
    .select(
      'request_id,state,body,updated_at',
      {
        count: 'exact',
      }
    );

  /* -------------------------------------------------------
     PROJECT STATUS
     ------------------------------------------------------- */

  const parsedState = projectDirectoryStatusSchema.safeParse(state);

  if (parsedState.success) {
    query = query.eq(
      'operational_status',
      parsedState.data
    );
  }

  /* -------------------------------------------------------
     SEARCH PROJECT NAME OR OWNER
     ------------------------------------------------------- */

  const search = (filters.search ?? '')
    .replace(/[^a-zA-Z0-9 @._-]/g, '')
    .trim()
    .slice(0, 80);

  if (search) {
    query = query.or(
      [
        `body->>title.ilike.%${search}%`,
        `body->>owner.ilike.%${search}%`,
      ].join(',')
    );
  }

  /* -------------------------------------------------------
     OWNER ASSIGNMENT
     ------------------------------------------------------- */

  if (owner === 'assigned') {
    query = query.neq(
      'body->>owner',
      ''
    );
  } else if (owner === 'unassigned') {
    query = query.eq(
      'body->>owner',
      ''
    );
  }

  /* -------------------------------------------------------
     TASK STATUS

     Matches projects containing at least one
     task with the chosen status.
     ------------------------------------------------------- */

  if (taskStatus !== 'all') {
    query = query.contains(
      'body->tasks',
      [
        {
          status: taskStatus,
        },
      ]
    );
  }

  /* -------------------------------------------------------
     MILESTONE STATUS

     Matches projects containing at least one
     milestone with the chosen status.
     ------------------------------------------------------- */

  if (milestoneStatus !== 'all') {
    query = query.contains(
      'body->milestones',
      [
        {
          status: milestoneStatus,
        },
      ]
    );
  }

  /* -------------------------------------------------------
     PRIMARY SORT
     ------------------------------------------------------- */

  query = query.order(
    SORT_COLUMNS[sort],
    {
      ascending: direction === 'asc',
      nullsFirst: false,
    }
  );

  /* -------------------------------------------------------
     SECONDARY SORT
     ------------------------------------------------------- */

  if (sort !== 'updated') {
    query = query.order(
      'updated_at',
      {
        ascending: false,
      }
    );
  }

  /* -------------------------------------------------------
     STABLE PAGINATION ORDER
     ------------------------------------------------------- */

  query = query.order(
    'request_id',
    {
      ascending: false,
    }
  );

  /* -------------------------------------------------------
     PAGINATION
     ------------------------------------------------------- */

  const safePage =
    Number.isInteger(page) &&
    page >= 1 &&
    page <= 10000
      ? page
      : 1;

  const start =
    (safePage - 1) * PROJECT_PAGE_SIZE;

  const {
    data,
    error,
    count,
  } = await query.range(
    start,
    start + PROJECT_PAGE_SIZE - 1
  );

  if (error) {
    throw new Error(
      'Projects could not be loaded. Check the sixth migration.'
    );
  }

  return {
    projects: z
      .array(summarySchema)
      .parse(data ?? []),

    total: count ?? 0,
  };
}

/* =========================================================
   GET INDIVIDUAL PROJECT

   Existing functionality preserved.
   ========================================================= */

export async function getProject(
  client: SupabaseClient,
  id: string
) {
  const { data, error } = await client
    .from('inquiry_projects')
    .select('*')
    .eq('request_id', id)
    .maybeSingle();

  if (error) {
    throw new Error(
      'Project could not be loaded. Check migrations 006 and 011.'
    );
  }

  const history = await client
    .from('inquiry_project_history')
    .select('*')
    .eq('request_id', id)
    .order('id', {
      ascending: false,
    })
    .limit(50);

  if (history.error) {
    throw new Error(
      'Project history could not be loaded.'
    );
  }

  return {
    record: data
      ? recordSchema.parse(data)
      : null,

    history: z
      .array(eventSchema)
      .parse(history.data ?? []),
  };
}
