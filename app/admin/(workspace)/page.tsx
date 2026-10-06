import Link from 'next/link';
import { requireStaff } from '@/lib/admin/auth';
import { formatDate, inquiryStatusSchema, listInquiries, PAGE_SIZE, statusLabels } from '@/lib/admin/inquiries';
import { getServiceBlueprint } from '@/data/serviceCatalog';

export default async function InquiriesPage({ searchParams }: { searchParams: { status?: string; page?: string } }) {
  // The page gates data reads independently of its parent layout.
  const { client } = await requireStaff();
  const parsedStatus = inquiryStatusSchema.safeParse(searchParams.status);
  const status = parsedStatus.success ? parsedStatus.data : null;
  const requestedPage = Number(searchParams.page || 1);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 && requestedPage <= 10000 ? requestedPage : 1;
  const { inquiries, total } = await listInquiries(client, status, page);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  function pageHref(next: number) { return `/admin?${new URLSearchParams({ ...(status ? { status } : {}), page: String(next) })}`; }
  return <>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Client intake</p><h1 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">Project inquiries</h1><p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">Review new requests, clarify the scope, and decide which projects to move toward a proposal.</p></div>
      <Link href="/" className="text-sm underline underline-offset-4">View website</Link>
    </div>
    <nav aria-label="Filter inquiries" className="mt-8 flex flex-wrap gap-2">
      {[{ id: null, label: 'All inquiries' }, ...Object.entries(statusLabels).map(([id, label]) => ({ id, label }))].map((filter) => <Link key={filter.id ?? 'all'} href={filter.id ? `/admin?status=${filter.id}` : '/admin'} aria-current={status === filter.id ? 'page' : undefined} className={`rounded-xl border px-4 py-2.5 text-sm ${status === filter.id ? 'border-foreground bg-foreground text-background' : 'border-border bg-background hover:bg-muted'}`}>{filter.label}</Link>)}
    </nav>
    <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap justify-between gap-2 border-b border-border px-5 py-4 text-sm text-muted-foreground"><span>{total} {status ? statusLabels[status].toLowerCase() + ' ' : ''}{total === 1 ? 'inquiry' : 'inquiries'}</span><span>Newest first · {PAGE_SIZE} per page</span></div>
      {inquiries.length ? <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm">
        <thead className="bg-muted/40 font-mono text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-4 font-normal">Client</th><th className="px-5 py-4 font-normal">Services</th><th className="px-5 py-4 font-normal">Received</th><th className="px-5 py-4 font-normal">Status</th></tr></thead>
        <tbody>{inquiries.map((inquiry) => <tr key={inquiry.request_id} className="border-t border-border align-top">
          <td className="max-w-xs px-5 py-5"><Link href={`/admin/leads/${inquiry.request_id}`} className="font-semibold underline decoration-border underline-offset-4">{inquiry.payload.name}</Link><p className="mt-1 break-words text-muted-foreground">{inquiry.payload.company || inquiry.payload.email}</p></td>
          <td className="max-w-xs px-5 py-5"><ul className="space-y-1">{inquiry.payload.services.map((service, i) => <li key={`${service.serviceId}-${i}`}>{service.serviceName || getServiceBlueprint(service.serviceId)?.name || service.serviceId} × {service.quantity}</li>)}</ul>{inquiry.payload.customRequest && <p className="mt-1 text-muted-foreground">Custom request</p>}</td>
          <td className="whitespace-nowrap px-5 py-5 text-muted-foreground">{formatDate(inquiry.created_at)}</td>
          <td className="px-5 py-5"><span className="inline-block rounded-full bg-muted px-3 py-1 text-xs">{statusLabels[inquiry.status]}</span></td>
        </tr>)}</tbody>
      </table></div> : <div className="px-6 py-16 text-center"><h2 className="font-heading text-xl font-semibold">{page > pages ? 'No inquiries on this page.' : 'No inquiries here yet.'}</h2><p className="mt-3 text-sm text-muted-foreground">{page > pages ? 'Return to the first page to see current results.' : 'Submitted project requests will appear here for review.'}</p>{page > pages && <Link href={pageHref(1)} className="mt-5 inline-block text-sm underline">First page</Link>}</div>}
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm">
      <p className="text-muted-foreground">Page {page} of {pages}</p>
      <div className="flex gap-3">{page > 1 && <Link href={pageHref(page - 1)} className="rounded-xl border border-border bg-background px-4 py-2">Previous</Link>}{page < pages && <Link href={pageHref(page + 1)} className="rounded-xl border border-border bg-background px-4 py-2">Next</Link>}</div>
    </div>
  </>;
}
