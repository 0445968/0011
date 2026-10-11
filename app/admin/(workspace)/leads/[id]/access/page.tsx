import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';

import { ProjectAccess } from '@/components/admin/ProjectAccess';
import { requireStaff } from '@/lib/admin/auth';
import { getInquiry } from '@/lib/admin/inquiries';

export default async function LeadAccessPage({ params }: { params: { id: string } }) {
  if (!z.string().uuid().safeParse(params.id).success) notFound();
  const { client } = await requireStaff();
  const inquiry = await getInquiry(client, params.id);
  if (!inquiry) notFound();

  const [members, history] = await Promise.all([
    client.from('project_clients').select('user_id,active,can_review,revision').eq('request_id', params.id).order('updated_at', { ascending: false }).limit(100),
    client.from('project_access_history').select('id,user_id,active,can_review,revision,created_at').eq('request_id', params.id).order('id', { ascending: false }).limit(100),
  ]);
  if (members.error || history.error) throw new Error('Client access could not be loaded. Apply migration 011.');

  return (
    <>
      <Link href={`/admin/leads/${params.id}/onboarding`} className="text-sm underline underline-offset-4">Back to onboarding</Link>
      <header className="mt-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Client workspace access</p>
        <h1 className="mt-3 font-heading text-3xl font-semibold">{inquiry.payload.company || inquiry.payload.name}</h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">Access can be prepared after accepted scope and the agreement/deposit gate are ready. The project does not need to be activated first.</p>
      </header>
      <ProjectAccess id={params.id} members={members.data ?? []} />
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Recent access history</h2>
        <ol className="mt-5 space-y-4">
          {history.data?.map((row) => (
            <li key={row.id} className="rounded-xl border border-border p-4">
              <p className="break-all text-sm">{row.user_id}</p>
              <p className="mt-2 text-sm">{row.active ? 'Active' : 'Revoked'} · {row.can_review ? 'Reviewer' : 'Viewer'} · Revision {row.revision}</p>
              <p className="mt-2 text-xs text-muted-foreground">{new Date(row.created_at).toISOString()}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
