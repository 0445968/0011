
'use client';

import Link from 'next/link';

import {
  ArrowUpRight,
  CalendarDays,
  ExternalLink,
  Mail,
  X,
} from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import {
  InquiryReview,
} from '@/components/admin/InquiryReview';

import {
  budgetLabels,
  timelineLabels,
} from '@/lib/intake/schema';

import type {
  InquiryRecord,
  InquiryStatus,
} from '@/lib/admin/inquiries';

/* =========================================================
   PROPS
   ========================================================= */

interface InquiryQuickViewProps {
  inquiry: InquiryRecord | null;
  onClose: () => void;
}

/* =========================================================
   STATUS PRESENTATION
   ========================================================= */

const statusColors: Record<InquiryStatus, string> = {
  new: '#6D28D9',
  qualified: '#1D4ED8',
  declined: '#475569',
};

const statusNames: Record<InquiryStatus, string> = {
  new: 'New',
  qualified: 'Qualified',
  declined: 'Declined',
};

/* =========================================================
   DATE FORMATTING
   ========================================================= */

const centralFormatter = new Intl.DateTimeFormat(
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

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : centralFormatter.format(date);
}

/* =========================================================
   HELPERS
   ========================================================= */

function safeWebsite(value: string) {
  try {
    const url = new URL(value);

    return ['https:', 'http:'].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function budgetLabel(value: string) {
  return (
    budgetLabels[
      value as keyof typeof budgetLabels
    ] || value || '—'
  );
}

function timelineLabel(value: string) {
  return (
    timelineLabels[
      value as keyof typeof timelineLabels
    ] || value || '—'
  );
}

/* =========================================================
   DETAIL BLOCK
   ========================================================= */

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <div className="mt-1.5 break-words text-sm leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   INQUIRY QUICK VIEW
   ========================================================= */

export function InquiryQuickView({
  inquiry,
  onClose,
}: InquiryQuickViewProps) {
  const payload = inquiry?.payload;

  const website = payload
    ? safeWebsite(payload.website)
    : null;

  return (
    <Sheet
      open={Boolean(inquiry)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="
          bivi-staff-surface
          flex
          h-[100dvh]
          w-full
          max-w-none
          flex-col
          gap-0
          overflow-hidden
          border-l
          border-border
          bg-card
          p-0
          text-foreground
          shadow-2xl
          sm:w-[520px]
          sm:max-w-[520px]
        "
      >
        {inquiry && payload && (
          <>
            {/* =============================================
                HEADER
                ============================================= */}

            <SheetHeader
              className="
                shrink-0
                border-b
                border-border
                px-5
                py-5
                pr-14
                text-left
              "
            >
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Inquiry preview
              </p>

              <SheetTitle className="mt-2 break-words font-heading text-xl font-semibold">
                {payload.company || payload.name}
              </SheetTitle>

              <SheetDescription className="mt-1 text-xs text-muted-foreground">
                Submitted {formatDate(inquiry.created_at)}
              </SheetDescription>

              <div className="pt-3">
                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                  "
                  style={{
                    backgroundColor:
                      statusColors[inquiry.status],
                    color: '#FFFFFF',
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />

                  {statusNames[inquiry.status]}
                </span>
              </div>
            </SheetHeader>

            {/* =============================================
                SCROLLABLE CONTENT
                ============================================= */}

            <div
              className="
                min-h-0
                flex-1
                space-y-6
                overflow-y-auto
                overscroll-contain
                px-5
                py-5
                scrollbar-transparent
              "
            >
              {/* CONTACT */}

              <section className="space-y-4">
                <h3 className="text-sm font-semibold">
                  Contact
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Detail label="Name">
                    {payload.name}
                  </Detail>

                  <Detail label="Company">
                    {payload.company || '—'}
                  </Detail>
                </div>

                {payload.email && (
                  <a
                    href={`mailto:${payload.email}`}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-border
                      bg-background
                      px-3
                      py-3
                      text-xs
                      transition-colors
                      hover:bg-muted
                    "
                  >
                    <Mail
                      size={16}
                      className="shrink-0"
                    />

                    <span className="min-w-0 flex-1 truncate">
                      {payload.email}
                    </span>

                    <ArrowUpRight size={15} />
                  </a>
                )}

                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-border
                      bg-background
                      px-3
                      py-3
                      text-xs
                      transition-colors
                      hover:bg-muted
                    "
                  >
                    <ExternalLink
                      size={16}
                      className="shrink-0"
                    />

                    <span className="min-w-0 flex-1 truncate">
                      {payload.website}
                    </span>

                    <ArrowUpRight size={15} />
                  </a>
                )}
              </section>

              <div className="border-t border-border" />

              {/* PROJECT OVERVIEW */}

              <section className="space-y-4">
                <h3 className="text-sm font-semibold">
                  Project overview
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-background p-3">
                    <Detail label="Estimated budget">
                      {budgetLabel(payload.budget)}
                    </Detail>
                  </div>

                  <div className="rounded-xl border border-border bg-background p-3">
                    <Detail label="Preferred start">
                      {timelineLabel(payload.timeline)}
                    </Detail>
                  </div>
                </div>
              </section>

              {/* REQUESTED SERVICES */}

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">
                  Requested services
                </h3>

                {payload.services.length ? (
                  <div className="divide-y divide-border rounded-xl border border-border bg-background">
                    {payload.services.map(
                      (service, index) => (
                        <div
                          key={`${service.serviceId}-${index}`}
                          className="px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium">
                              {service.serviceName ||
                                service.serviceId}
                            </p>

                            <span className="shrink-0 rounded-md bg-muted px-2 py-1 font-mono text-[11px]">
                              × {service.quantity}
                            </span>
                          </div>

                          {service.details && (
                            <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground">
                              {service.details}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No predefined services selected.
                  </p>
                )}
              </section>

              {/* GOALS */}

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">
                  Project goals
                </h3>

                <p className="whitespace-pre-wrap break-words rounded-xl border border-border bg-background p-4 text-sm leading-relaxed">
                  {payload.goals || 'Not provided'}
                </p>
              </section>

              {/* CUSTOM REQUEST */}

              {payload.customRequest && (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold">
                    Custom request
                  </h3>

                  <p className="whitespace-pre-wrap break-words rounded-xl border border-border bg-background p-4 text-sm leading-relaxed">
                    {payload.customRequest}
                  </p>
                </section>
              )}

              <div className="border-t border-border" />

              {/* ===========================================
                  QUICK STATUS MANAGEMENT

                  Uses the existing review workflow.
                  =========================================== */}

              <div className="[&>section]:rounded-xl [&>section]:p-4">
                <InquiryReview
                  key={inquiry.request_id}
                  id={inquiry.request_id}
                  initialStatus={inquiry.status}
                  initialNote={inquiry.decision_note}
                  revision={inquiry.revision}
                />
              </div>
            </div>

            {/* =============================================
                FIXED FOOTER
                ============================================= */}

            <div
              className="
                flex
                shrink-0
                items-center
                gap-2
                border-t
                border-border
                bg-card
                px-5
                py-3
              "
            >
<Link
  href={`/admin/leads/${inquiry.request_id}`}
  className="
    inline-flex
    flex-1
    items-center
    justify-center
    gap-2
    rounded-xl
    bg-foreground
    px-4
    py-3
    text-xs
    font-semibold
    text-background
    transition-opacity
    hover:opacity-85
  "
>
  Open full inquiry
  <ArrowUpRight size={15} />
</Link>

<button
  type="button"
  onClick={onClose}
  className="
    inline-flex
    items-center
    justify-center
    gap-2
    rounded-xl
    border
    border-border
    bg-background
    px-4
    py-3
    text-xs
    font-medium
    hover:bg-muted
  "
>
  <X size={14} />
  Close
</button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
