
import 'server-only';

import { z } from 'zod';

import type {
  SupabaseClient,
} from '@supabase/supabase-js';

/* =========================================================
   INQUIRY STATUSES
   ========================================================= */

export const inquiryStatusSchema = z.enum([
  'new',
  'qualified',
  'declined',
]);

export type InquiryStatus = z.infer<
  typeof inquiryStatusSchema
>;

export const statusLabels: Record<
  InquiryStatus,
  string
> = {
  new: 'New',
  qualified: 'Qualified',
  declined: 'Declined',
};

export const PAGE_SIZE = 25;

/* =========================================================
   SORTING
   ========================================================= */

export const inquirySortSchema = z.enum([
  'received',
  'status',
  'client',
  'company',
  'email',
]);

export type InquirySortKey = z.infer<
  typeof inquirySortSchema
>;

export const inquirySortDirectionSchema = z.enum([
  'asc',
  'desc',
]);

export type InquirySortDirection = z.infer<
  typeof inquirySortDirectionSchema
>;

// Fixed allowlist: never pass arbitrary URL values
// directly into a database ORDER BY expression.

const SORT_COLUMNS: Record<
  InquirySortKey,
  string
> = {
  received: 'created_at',
  status: 'status',
  client: 'payload->>name',
  company: 'payload->>company',
  email: 'payload->>email',
};

/* =========================================================
   DIRECTORY FILTERS
   ========================================================= */

export interface InquiryDirectoryFilters {
  search?: string;
  budget?: string;
  timeline?: string;
  service?: string;
  custom?: 'yes' | 'no' | '';

  sort?: InquirySortKey;
  direction?: InquirySortDirection;
}

/* =========================================================
   RECORD SCHEMAS
   ========================================================= */

const payloadSchema = z.object({
  name: z.string().catch('Unknown contact'),

  email: z.string().catch(''),

  company: z.string().catch(''),

  website: z.string().catch(''),

  goals: z.string().catch(''),

  budget: z.string().catch('not-sure'),

  timeline: z.string().catch('flexible'),

  customRequest: z.string().catch(''),

  consentVersion: z.string().catch(''),

  services: z.array(
    z.object({
      serviceId: z.string(),
      serviceName: z.string().optional(),
      blueprintVersion: z.number().optional(),
      quantity: z.number(),
      details: z.string().catch(''),
    })
  ).catch([]),
});

const recordSchema = z.object({
  request_id: z.string().uuid(),

  status: inquiryStatusSchema,

  created_at: z.string(),

  revision: z.number().int(),

  reviewed_at: z.string().nullable(),

  reviewed_by: z.string().nullable(),

  decision_note: z.string(),

  payload: payloadSchema,
});

export type InquiryRecord = z.infer<
  typeof recordSchema
>;

export interface ReviewRecord {
  id: number;
  previous_status: string;
  next_status: string;
  note: string;
  reviewed_by: string | null;
  created_at: string;
}

/* =========================================================
   LIST INQUIRIES
   ========================================================= */

export async function listInquiries(
  client: SupabaseClient,
  status: InquiryStatus | null,
  page: number,
  filters: InquiryDirectoryFilters = {}
) {
  /* -------------------------------------------------------
     VALIDATE SORT OPTIONS
     ------------------------------------------------------- */

  const parsedSort = inquirySortSchema.safeParse(
    filters.sort
  );

  const sort: InquirySortKey = parsedSort.success
    ? parsedSort.data
    : 'received';

  const parsedDirection =
    inquirySortDirectionSchema.safeParse(
      filters.direction
    );

  const direction: InquirySortDirection =
    parsedDirection.success
      ? parsedDirection.data
      : 'desc';

  const sortColumn = SORT_COLUMNS[sort];

  const ascending = direction === 'asc';

  /* -------------------------------------------------------
     BASE QUERY
     ------------------------------------------------------- */

  let query = client
    .from('project_inquiries')
    .select('*', {
      count: 'exact',
    });

  /* -------------------------------------------------------
     STATUS FILTER
     ------------------------------------------------------- */

  if (status) {
    query = query.eq('status', status);
  }

  /* -------------------------------------------------------
     BUDGET FILTER
     ------------------------------------------------------- */

  if (filters.budget) {
    query = query.eq(
      'payload->>budget',
      filters.budget
    );
  }

  /* -------------------------------------------------------
     PREFERRED START FILTER
     ------------------------------------------------------- */

  if (filters.timeline) {
    query = query.eq(
      'payload->>timeline',
      filters.timeline
    );
  }

  /* -------------------------------------------------------
     REQUESTED SERVICE FILTER
     ------------------------------------------------------- */

  if (filters.service) {
    query = query.contains(
      'payload->services',
      [
        {
          serviceId: filters.service,
        },
      ]
    );
  }

  /* -------------------------------------------------------
     CUSTOM REQUEST FILTER
     ------------------------------------------------------- */

  if (filters.custom === 'yes') {
    query = query.neq(
      'payload->>customRequest',
      ''
    );
  }

  if (filters.custom === 'no') {
    query = query.eq(
      'payload->>customRequest',
      ''
    );
  }

  /* -------------------------------------------------------
     CONTACT SEARCH
     ------------------------------------------------------- */

  const search = (filters.search ?? '')
    .replace(/[^a-zA-Z0-9 @._-]/g, '')
    .trim()
    .slice(0, 80);

  if (search) {
    query = query.or(
      [
        `payload->>name.ilike.%${search}%`,
        `payload->>company.ilike.%${search}%`,
        `payload->>email.ilike.%${search}%`,
      ].join(',')
    );
  }

  /* -------------------------------------------------------
     PRIMARY SORT

     Database sorting must happen before .range().
     ------------------------------------------------------- */

  query = query.order(sortColumn, {
    ascending,
    nullsFirst: false,
  });

  /* -------------------------------------------------------
     SECONDARY SORT

     For equal values, show newer records first.
     ------------------------------------------------------- */

  if (sort !== 'received') {
    query = query.order('created_at', {
      ascending: false,
    });
  }

  /* -------------------------------------------------------
     STABLE TIEBREAKER

     Ensures predictable pagination when several
     inquiries have identical sort values.
     ------------------------------------------------------- */

  query = query.order('request_id', {
    ascending: false,
  });

  /* -------------------------------------------------------
     PAGINATION
     ------------------------------------------------------- */

  const safePage =
    Number.isInteger(page) &&
    page >= 1 &&
    page <= 10000
      ? page
      : 1;

  const start = (safePage - 1) * PAGE_SIZE;

  const { data, count, error } = await query.range(
    start,
    start + PAGE_SIZE - 1
  );

  if (error) {
    console.error(
      'Inquiry directory query failed:',
      error.message
    );

    throw new Error(
      'The inquiry list could not be loaded.'
    );
  }

  return {
    inquiries: z
      .array(recordSchema)
      .parse(data ?? []),

    total: count ?? 0,
  };
}

/* =========================================================
   SINGLE INQUIRY
   ========================================================= */

export async function getInquiry(
  client: SupabaseClient,
  id: string
) {
  const { data, error } = await client
    .from('project_inquiries')
    .select('*')
    .eq('request_id', id)
    .maybeSingle();

  if (error) {
    throw new Error(
      'The inquiry could not be loaded.'
    );
  }

  return data
    ? recordSchema.parse(data)
    : null;
}

/* =========================================================
   REVIEW HISTORY
   ========================================================= */

export async function getReviewHistory(
  client: SupabaseClient,
  id: string
) {
  const { data, error } = await client
    .from('inquiry_review_history')
    .select(
      'id, previous_status, next_status, note, reviewed_by, created_at'
    )
    .eq('request_id', id)
    .order('id', {
      ascending: false,
    })
    .limit(50);

  if (error) {
    throw new Error(
      'The review history could not be loaded.'
    );
  }

  return (data ?? []) as ReviewRecord[];
}

/* =========================================================
   CENTRAL TIME
   ========================================================= */

const centralDateFormatter = new Intl.DateTimeFormat(
  'en-US',
  {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago',
    timeZoneName: 'short',
  }
);

export function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return centralDateFormatter.format(date);
}

/* =========================================================
   SAFE WEBSITE
   ========================================================= */

export function safeWebsite(value: string) {
  try {
    const url = new URL(value);

    return ['http:', 'https:'].includes(
      url.protocol
    )
      ? url.href
      : null;
  } catch {
    return null;
  }
}
