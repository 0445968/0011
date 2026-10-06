import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireStaff } from '@/lib/admin/auth';
import { formatDate, getInquiry, getReviewHistory, safeWebsite, statusLabels, type InquiryStatus } from '@/lib/admin/inquiries';
import { budgetLabels, timelineLabels } from '@/lib/intake/schema';
import { getServiceBlueprint } from '@/data/serviceCatalog';
import { InquiryReview } from '@/components/admin/InquiryReview';

export default async function InquiryPage({ params }: { params: { id: string } }) {
  const { client } = await requireStaff();
  if (!z.string().uuid().safeParse(params.id).success) notFound();
  const inquiry = await getInquiry(client, params.id);
  if (!inquiry) notFound();
  const history = await getReviewHistory(client, params.id);
  const payload = inquiry.payload;
  const website = safeWebsite(payload.website);
  const budget = budgetLabels[payload.budget as keyof typeof budgetLabels] || payload.budget;
  const timeline = timelineLabels[payload.timeline as keyof typeof timelineLabels] || payload.timeline;
  return <>
    <Link href="/admin" className="text-sm text-muted-foreground underline underline-offset-4">Back to inquiries</Link>
    <header className="mt-6"><div className="flex flex-wrap items-center gap-3"><h1 className="font-heading text-3xl font-semibold sm:text-4xl">{payload.company || payload.name}</h1><span className="rounded-full bg-muted px-3 py-1 text-xs">{statusLabels[inquiry.status]}</span></div><p className="mt-4 text-sm text-muted-foreground">Received {formatDate(inquiry.created_at)}</p><p className="mt-2 break-all font-mono text-xs text-muted-foreground">Reference: {inquiry.request_id}</p></header>
    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6"><h2 className="font-heading text-xl font-semibold">Contact and context</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <div><dt className="text-xs text-muted-foreground">Contact</dt><dd className="mt-1 text-sm">{payload.name}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Email</dt><dd className="mt-1 break-all text-sm">{payload.email ? <a href={`mailto:${encodeURIComponent(payload.email)}`} className="underline underline-offset-4">{payload.email}</a> : 'Not provided'}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Company</dt><dd className="mt-1 text-sm">{payload.company || 'Not provided'}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Website</dt><dd className="mt-1 break-all text-sm">{website ? <a href={website} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{payload.website}</a> : 'Not provided'}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Budget range</dt><dd className="mt-1 text-sm">{budget}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Preferred start</dt><dd className="mt-1 text-sm">{timeline}</dd></div>
        </dl><h3 className="mt-6 text-sm font-semibold">Project goals</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{payload.goals || 'Not provided'}</p></section>
        <section className="rounded-2xl border border-border bg-card p-6"><h2 className="font-heading text-xl font-semibold">Requested scope</h2>
          <ul className="mt-5 divide-y divide-border">{payload.services.map((service, i) => <li key={`${service.serviceId}-${i}`} className="py-4 first:pt-0"><h3 className="text-sm font-semibold">{service.serviceName || getServiceBlueprint(service.serviceId)?.name || service.serviceId} × {service.quantity}</h3>{service.details && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{service.details}</p>}<p className="mt-2 font-mono text-xs text-muted-foreground">Blueprint {service.blueprintVersion ?? 'not recorded'}</p></li>)}</ul>
          {payload.customRequest && <div className="mt-4 border-t border-border pt-4"><h3 className="text-sm font-semibold">Custom request</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{payload.customRequest}</p></div>}
          <p className="mt-5 text-xs text-muted-foreground">Requested scope only. Pricing, revisions, agreement, deposit, and confirmed dates will be recorded in the proposal workflow.</p>
        </section>
        <section className="rounded-2xl border border-border bg-card p-6"><h2 className="font-heading text-xl font-semibold">Review history</h2><p className="mt-2 text-xs text-muted-foreground">Latest 50 decisions. Notes are internal and do not send client notifications.</p>
          {history.length ? <ol className="mt-5 space-y-5">{history.map((review) => <li key={review.id} className="border-l-2 border-border pl-4"><p className="text-sm font-medium">{statusLabels[review.previous_status as InquiryStatus] || review.previous_status} → {statusLabels[review.next_status as InquiryStatus] || review.next_status}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(review.created_at)}</p>{review.note && <p className="mt-2 whitespace-pre-wrap break-words text-sm">{review.note}</p>}<p className="mt-2 break-all font-mono text-[10px] text-muted-foreground">Reviewer: {review.reviewed_by || 'Account removed'}</p></li>)}</ol> : <p className="mt-5 text-sm text-muted-foreground">No review decisions recorded yet.</p>}
        </section>
      </div>
      <div className="space-y-5 lg:sticky lg:top-8"><InquiryReview id={inquiry.request_id} initialStatus={inquiry.status} initialNote={inquiry.decision_note} revision={inquiry.revision} /><p className="px-1 text-xs text-muted-foreground">{inquiry.reviewed_at ? `Last reviewed ${formatDate(inquiry.reviewed_at)}` : 'Awaiting first review.'}</p></div>
    </div>
  </>;
}
