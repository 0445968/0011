
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';

import {
  ArrowUpRight,
} from 'lucide-react';

import {
  WorkspaceRecordDetails,
} from '@/components/admin/StaffWorkspaceShell';

import {
  InquiryReview,
} from '@/components/admin/InquiryReview';

import {
  requireStaff,
} from '@/lib/admin/auth';

import {
  formatDate,
  getInquiry,
  getReviewHistory,
  safeWebsite,
  statusLabels,
  type InquiryStatus,
} from '@/lib/admin/inquiries';

import {
  budgetLabels,
  timelineLabels,
} from '@/lib/intake/schema';

import {
  getServiceBlueprint,
} from '@/data/serviceCatalog';

/* =========================================================
   INQUIRY DETAIL PAGE
   ========================================================= */

export default async function InquiryPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const { client } = await requireStaff();

  /* =======================================================
     VALIDATE RECORD
     ======================================================= */

  if (
    !z.string().uuid().safeParse(
      params.id
    ).success
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

  const history = await getReviewHistory(
    client,
    params.id
  );

  const payload = inquiry.payload;

  /* =======================================================
     COMPANY / RECORD NAME
     ======================================================= */

  const companyName =
    payload.company?.trim() ||
    payload.name?.trim() ||
    'Unnamed inquiry';

  /* =======================================================
     INQUIRY TYPE
     ======================================================= */

  const selectedServices =
    payload.services;

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

  const inquiryType =
    selectedServices.length > 1
      ? 'Multi-service Inquiry'
      : primaryServiceName
        ? `${primaryServiceName} Inquiry`
        : payload.customRequest
          ? 'Custom Inquiry'
          : 'General Inquiry';

  /* =======================================================
     DISPLAY VALUES
     ======================================================= */

  const website = safeWebsite(
    payload.website
  );

  const budget =
    budgetLabels[
      payload.budget as keyof typeof budgetLabels
    ] || payload.budget;

  const timeline =
    timelineLabels[
      payload.timeline as keyof typeof timelineLabels
    ] || payload.timeline;

  const status =
    statusLabels[inquiry.status];

  const base = `/leads/${params.id}`;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="min-w-0 space-y-5 pb-8">

      {/* ===================================================
          REGISTER WORKSPACE TAB METADATA
          =================================================== */}

      <WorkspaceRecordDetails
        kind="inquiry"
        id={inquiry.request_id}
        title={companyName}
        recordType={inquiryType}
        status={status}
      />

      {/* ===================================================
          COMPACT INQUIRY INFORMATION
          =================================================== */}

      <div
        className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-3
          text-xs
          text-muted-foreground
        "
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span>
            Received{' '}
            {formatDate(inquiry.created_at)}
          </span>

          <span className="font-medium text-foreground">
            {inquiryType}
          </span>

          <span
            title={inquiry.request_id}
            className="font-mono text-[10px]"
          >
            Ref: {inquiry.request_id.slice(0, 8)}
          </span>
        </div>

        <Link
          href={`${base}/proposals`}
          className="
            inline-flex
            items-center
            gap-1
            text-xs
            font-semibold
            text-foreground
            hover:underline
            hover:underline-offset-4
          "
        >
          Open proposals
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* ===================================================
          PRIMARY GRID
          =================================================== */}

      <div
        className="
          grid
          items-start
          gap-5
          lg:grid-cols-[minmax(0,1fr)_320px]
          xl:grid-cols-[minmax(0,1fr)_340px]
        "
      >
        {/* ===============================================
            MAIN INQUIRY CONTENT
            =============================================== */}

        <div className="min-w-0 space-y-5">

          {/* =============================================
              CONTACT AND CONTEXT
              ============================================= */}

          <section
            className="
              rounded-2xl
              border
              border-border
              bg-card
              p-5
              sm:p-6
            "
          >
            <h2 className="font-heading text-xl font-semibold">
              Contact and context
            </h2>

            <dl
              className="
                mt-5
                grid
                gap-x-6
                gap-y-5
                sm:grid-cols-2
              "
            >
              {/* CONTACT NAME */}

              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">
                  Contact
                </dt>

                <dd className="mt-1 break-words text-sm">
                  {payload.name}
                </dd>
              </div>

              {/* EMAIL */}

              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">
                  Email
                </dt>

                <dd className="mt-1 break-all text-sm">
                  {payload.email ? (
                    <a
                      href={`mailto:${encodeURIComponent(
                        payload.email
                      )}`}
                      className="
                        underline
                        underline-offset-4
                        hover:text-muted-foreground
                      "
                    >
                      {payload.email}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </dd>
              </div>

              {/* COMPANY */}

              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">
                  Company
                </dt>

                <dd className="mt-1 break-words text-sm">
                  {payload.company || 'Not provided'}
                </dd>
              </div>

              {/* WEBSITE */}

              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">
                  Website
                </dt>

                <dd className="mt-1 break-all text-sm">
                  {website ? (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        underline
                        underline-offset-4
                        hover:text-muted-foreground
                      "
                    >
                      {payload.website}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </dd>
              </div>

              {/* BUDGET */}

              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">
                  Budget range
                </dt>

                <dd className="mt-1 text-sm">
                  {budget}
                </dd>
              </div>

              {/* TIMELINE */}

              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">
                  Preferred start
                </dt>

                <dd className="mt-1 text-sm">
                  {timeline}
                </dd>
              </div>
            </dl>

            {/* PROJECT GOALS */}

            <div className="mt-6 border-t border-border pt-5">
              <h3 className="text-sm font-semibold">
                Project goals
              </h3>

              <p
                className="
                  mt-2
                  whitespace-pre-wrap
                  break-words
                  text-sm
                  leading-relaxed
                  text-muted-foreground
                "
              >
                {payload.goals || 'Not provided'}
              </p>
            </div>
          </section>

          {/* =============================================
              REQUESTED SCOPE
              ============================================= */}

          <section
            className="
              rounded-2xl
              border
              border-border
              bg-card
              p-5
              sm:p-6
            "
          >
            <h2 className="font-heading text-xl font-semibold">
              Requested scope
            </h2>

            {selectedServices.length > 0 ? (
              <ul className="mt-5 divide-y divide-border">
                {selectedServices.map(
                  (service, index) => {
                    const blueprint =
                      getServiceBlueprint(
                        service.serviceId
                      );

                    const serviceName =
                      service.serviceName ||
                      blueprint?.name ||
                      service.serviceId;

                    return (
                      <li
                        key={`${service.serviceId}-${index}`}
                        className="py-4 first:pt-0"
                      >
                        <h3 className="text-sm font-semibold">
                          {serviceName}
                          {' × '}
                          {service.quantity}
                        </h3>

                        {service.details && (
                          <p
                            className="
                              mt-2
                              whitespace-pre-wrap
                              break-words
                              text-sm
                              leading-relaxed
                              text-muted-foreground
                            "
                          >
                            {service.details}
                          </p>
                        )}

                        <p
                          className="
                            mt-2
                            font-mono
                            text-xs
                            text-muted-foreground
                          "
                        >
                          Blueprint{' '}
                          {service.blueprintVersion ??
                            'not recorded'}
                        </p>
                      </li>
                    );
                  }
                )}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No predefined services selected.
              </p>
            )}

            {/* CUSTOM REQUEST */}

            {payload.customRequest && (
              <div className="mt-4 border-t border-border pt-4">
                <h3 className="text-sm font-semibold">
                  Custom request
                </h3>

                <p
                  className="
                    mt-2
                    whitespace-pre-wrap
                    break-words
                    text-sm
                    leading-relaxed
                    text-muted-foreground
                  "
                >
                  {payload.customRequest}
                </p>
              </div>
            )}

            <p
              className="
                mt-5
                text-xs
                leading-relaxed
                text-muted-foreground
              "
            >
              Requested scope only. Pricing,
              revisions, agreement, deposit, and
              confirmed dates will be recorded in
              the proposal workflow.
            </p>
          </section>

          {/* =============================================
              REVIEW HISTORY
              ============================================= */}

          <section
            className="
              rounded-2xl
              border
              border-border
              bg-card
              p-5
              sm:p-6
            "
          >
            <h2 className="font-heading text-xl font-semibold">
              Review history
            </h2>

            <p className="mt-2 text-xs text-muted-foreground">
              Latest 50 decisions. Notes are internal
              and do not send client notifications.
            </p>

            {history.length > 0 ? (
              <ol className="mt-5 space-y-5">
                {history.map((review) => (
                  <li
                    key={review.id}
                    className="border-l-2 border-border pl-4"
                  >
                    <p className="text-sm font-medium">
                      {statusLabels[
                        review.previous_status as InquiryStatus
                      ] || review.previous_status}

                      {' → '}

                      {statusLabels[
                        review.next_status as InquiryStatus
                      ] || review.next_status}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(review.created_at)}
                    </p>

                    {review.note && (
                      <p
                        className="
                          mt-2
                          whitespace-pre-wrap
                          break-words
                          text-sm
                        "
                      >
                        {review.note}
                      </p>
                    )}

                    <p
                      className="
                        mt-2
                        break-all
                        font-mono
                        text-[10px]
                        text-muted-foreground
                      "
                    >
                      Reviewer:{' '}
                      {review.reviewed_by ||
                        'Account removed'}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">
                No review decisions recorded yet.
              </p>
            )}
          </section>
        </div>

        {/* ===============================================
            INQUIRY REVIEW SIDEBAR
            =============================================== */}

        <aside
          className="
            min-w-0
            space-y-4
            lg:sticky
            lg:top-4
          "
        >
          <InquiryReview
            id={inquiry.request_id}
            initialStatus={inquiry.status}
            initialNote={inquiry.decision_note}
            revision={inquiry.revision}
          />

          <p className="px-1 text-xs text-muted-foreground">
            {inquiry.reviewed_at
              ? `Last reviewed ${formatDate(
                  inquiry.reviewed_at
                )}`
              : 'Awaiting first review.'}
          </p>
        </aside>
      </div>
    </div>
  );
}
