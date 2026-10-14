import {WorkspaceRecordDetails} from '@/components/admin/StaffWorkspaceShell';
import {requestedProposalVersion} from '@/lib/proposals/links';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {z} from 'zod';
import {requireStaff} from '@/lib/admin/auth';
import {getInquiry} from '@/lib/admin/inquiries';
import {listProposals,proposalSeed} from '@/lib/proposals/data';
import {ProposalWorkspace} from '@/components/admin/ProposalWorkspace';
export default async function ProposalsPage({params,searchParams:p}:{params:{id:string};searchParams:Record<string,string|undefined>}){
 const {client}=await requireStaff();
 if(!z.string().uuid().safeParse(params.id).success)notFound();
 const inquiry=await getInquiry(client,params.id);if(!inquiry)notFound();
 const proposals=await listProposals(client,params.id);
 const selectedVersion=requestedProposalVersion(p.version,proposals.map(proposal=>proposal.version));
 return <><WorkspaceRecordDetails kind="inquiry" id={inquiry.request_id} title={inquiry.payload.company||inquiry.payload.name} recordType="Inquiry" status={inquiry.status}/><Link href={`/admin/leads/${params.id}`} className="text-sm underline underline-offset-4">Back to inquiry</Link><header className="mt-6"><p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Proposals and accepted scope</p><h1 className="mt-3 font-heading text-3xl font-semibold">{inquiry.payload.company||inquiry.payload.name}</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">Prepare the scope, preserve each issued version, and record the version the client accepted.</p></header><Link href={`/admin/leads/${params.id}/readiness`} className="mt-6 inline-block rounded-xl border border-border px-4 py-3 text-sm">Agreement, deposit and onboarding gate</Link><Link href="/proposals" className="ml-4 text-sm underline">All proposals</Link>{p.version&&!selectedVersion&&<p role="status" className="mt-4 rounded border p-4 text-sm">The requested saved version is unavailable. The current inquiry and its available versions remain below.</p>}<ProposalWorkspace selectedVersion={selectedVersion} key={proposals.map(p=>`${p.version}:${p.revision}`).join(',')} id={params.id} qualified={inquiry.status==='qualified'} seed={proposalSeed(inquiry)} proposals={proposals}/></>;
}
