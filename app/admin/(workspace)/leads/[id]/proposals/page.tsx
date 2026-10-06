import Link from 'next/link';
import {notFound} from 'next/navigation';
import {z} from 'zod';
import {requireStaff} from '@/lib/admin/auth';
import {getInquiry} from '@/lib/admin/inquiries';
import {listProposals,proposalSeed} from '@/lib/proposals/data';
import {ProposalWorkspace} from '@/components/admin/ProposalWorkspace';
export default async function ProposalsPage({params}:{params:{id:string}}){
 const {client}=await requireStaff();
 if(!z.string().uuid().safeParse(params.id).success)notFound();
 const inquiry=await getInquiry(client,params.id);if(!inquiry)notFound();
 const proposals=await listProposals(client,params.id);
 return <><Link href={`/admin/leads/${params.id}`} className="text-sm underline underline-offset-4">Back to inquiry</Link><header className="mt-6"><p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Proposals and accepted scope</p><h1 className="mt-3 font-heading text-3xl font-semibold">{inquiry.payload.company||inquiry.payload.name}</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">Prepare the scope, preserve each issued version, and record the version the client accepted.</p></header><Link href={`/admin/leads/${params.id}/readiness`} className="mt-6 inline-block rounded-xl border border-border px-4 py-3 text-sm">Agreement, deposit and onboarding gate</Link><ProposalWorkspace key={proposals.map(p=>`${p.version}:${p.revision}`).join(',')} id={params.id} qualified={inquiry.status==='qualified'} seed={proposalSeed(inquiry)} proposals={proposals}/></>;
}
