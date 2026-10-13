
import {
  Inbox,
} from 'lucide-react';

import {
  requireStaff,
} from '@/lib/admin/auth';

import {
  inquiryStatusSchema,
  inquirySortSchema,
  inquirySortDirectionSchema,
  listInquiries,
  type InquiryStatus,
  type InquirySortKey,
  type InquirySortDirection,
} from '@/lib/admin/inquiries';

import {
  InquiryDirectory,
  type InquiryDirectoryViewFilters,
} from '@/components/admin/InquiryDirectory';

import {
  budgetLabels,
  timelineLabels,
} from '@/lib/intake/schema';

import {
  serviceCatalog,
} from '@/data/serviceCatalog';

/* =========================================================
   SEARCH PARAMETERS
   ========================================================= */

interface InquiriesSearchParams {
  status?: string;
  search?: string;
  budget?: string;
  timeline?: string;
  service?: string;
  custom?: string;
  sort?: string;
  direction?: string;
  page?: string;
}

/* =========================================================
   VALIDATE FILTERS
   ========================================================= */

function getFilters(
  params: InquiriesSearchParams
): InquiryDirectoryViewFilters {
  /* -------------------------------------------------------
     STATUS
     ------------------------------------------------------- */

  const parsedStatus =
    inquiryStatusSchema.safeParse(params.status);

  const status: InquiryStatus | null =
    parsedStatus.success
      ? parsedStatus.data
      : null;

  /* -------------------------------------------------------
     CONTACT SEARCH
     ------------------------------------------------------- */

  const search = (params.search ?? '')
    .replace(/[^a-zA-Z0-9 @._-]/g, '')
    .trim()
    .slice(0, 80);

  /* -------------------------------------------------------
     ESTIMATED BUDGET
     ------------------------------------------------------- */

  const budget =
    params.budget &&
    Object.prototype.hasOwnProperty.call(
      budgetLabels,
      params.budget
    )
      ? params.budget
      : '';

  /* -------------------------------------------------------
     PREFERRED START
     ------------------------------------------------------- */

  const timeline =
    params.timeline &&
    Object.prototype.hasOwnProperty.call(
      timelineLabels,
      params.timeline
    )
      ? params.timeline
      : '';

  /* -------------------------------------------------------
     REQUESTED SERVICE
     ------------------------------------------------------- */

  const service =
    params.service &&
    serviceCatalog.some(
      (item) => item.id === params.service
    )
      ? params.service
      : '';

  /* -------------------------------------------------------
     CUSTOM REQUEST
     ------------------------------------------------------- */

  const custom: '' | 'yes' | 'no' =
    params.custom === 'yes' ||
    params.custom === 'no'
      ? params.custom
      : '';

  /* -------------------------------------------------------
     SORT COLUMN
     ------------------------------------------------------- */

  const parsedSort =
    inquirySortSchema.safeParse(params.sort);

  const sort: InquirySortKey =
    parsedSort.success
      ? parsedSort.data
      : 'received';

  /* -------------------------------------------------------
     SORT DIRECTION
     ------------------------------------------------------- */

  const parsedDirection =
    inquirySortDirectionSchema.safeParse(
      params.direction
    );

  const direction: InquirySortDirection =
    parsedDirection.success
      ? parsedDirection.data
      : 'desc';

  return {
    status,
    search,
    budget,
    timeline,
    service,
    custom,
    sort,
    direction,
  };
}

/* =========================================================
   PAGE NUMBER
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
   INQUIRIES PAGE
   ========================================================= */

export default async function InquiriesPage({
  searchParams = {},
}: {
  searchParams: InquiriesSearchParams;
}) {
  /* -------------------------------------------------------
     AUTHENTICATION
     ------------------------------------------------------- */

  const { client } = await requireStaff();

  /* -------------------------------------------------------
     VALIDATED DIRECTORY STATE
     ------------------------------------------------------- */

  const filters = getFilters(searchParams);

  const page = getPage(searchParams.page);

  /* -------------------------------------------------------
     SERVER-SIDE FILTERING AND SORTING
     ------------------------------------------------------- */

  const { inquiries, total } = await listInquiries(
    client,
    filters.status,
    page,
    {
      search: filters.search,
      budget: filters.budget,
      timeline: filters.timeline,
      service: filters.service,
      custom: filters.custom,
      sort: filters.sort,
      direction: filters.direction,
    }
  );

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
              text-2xl
              font-semibold
              tracking-tight
              sm:text-3xl
            "
          >
            Inquiries
          </h1>

          <p
            className="
              mt-1.5
              text-xs
              text-muted-foreground
              sm:text-sm
            "
          >
            Manage incoming project requests.
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
          <Inbox
            size={19}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>
      </header>

      {/* INTERACTIVE INQUIRY DIRECTORY */}

      <InquiryDirectory
        inquiries={inquiries}
        total={total}
        page={page}
        filters={filters}
      />
    </div>
  );
}
