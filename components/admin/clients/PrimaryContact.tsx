'use client';
import Link from 'next/link';
import {useState} from 'react';
import {ContactPhonebook} from '@/components/admin/people/ContactPhonebook';
import {Button} from '@/components/ui/button';
import {companyCommand} from '@/components/admin/companies/CompanyActions';
import {guardWorkspaceNavigation} from '@/components/admin/workspace/WorkspaceNavigationGuard';
export function PrimaryContact({companyId,revision,contactId,name}:{companyId:string;revision:number;contactId:number|null;name:string|null}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function save(id:number|null){if(busy)return;setBusy(true);setError('');try{await companyCommand({action:'primary',company:companyId,id,revision});window.location.reload();}catch(e){setError(e instanceof Error?e.message:'Primary contact could not save.');}finally{setBusy(false);}}
 return <section className="space-y-3"><h3 className="font-medium">Primary contact</h3>{contactId?<Link className="text-sm underline" href={`/people/${contactId}`}>{name||'Open person'}</Link>:<p className="text-sm text-muted-foreground">Unassigned</p>}<p className="text-xs text-muted-foreground">Choose an active person assigned to this company. Selecting saves the primary contact and refreshes this page.</p><fieldset disabled={busy} className="flex flex-wrap items-center gap-3"><ContactPhonebook companyId={companyId} activeOnly selectLabel="Set primary contact" onSelect={person=>guardWorkspaceNavigation(()=>void save(person.id))}/><span className="text-sm">Choose primary contact</span>{contactId&&<Button variant="outline" onClick={()=>guardWorkspaceNavigation(()=>void save(null))}>Clear</Button>}</fieldset>{busy&&<p role="status" className="text-xs">Saving…</p>}{error&&<p role="alert" className="text-sm text-red-600">{error}</p>}</section>;
}
