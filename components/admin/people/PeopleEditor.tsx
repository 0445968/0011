'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {peopleLabels,type Person,type PersonBody} from '@/lib/people/schema';
import {useWorkspaceUnsavedChanges} from '../workspace/WorkspaceNavigationGuard';
export function PeopleEditor({person}:{person?:Person}){
 const router=useRouter();const seed:PersonBody=person?{name:person.name,email:person.email,phone:person.phone,company_name:person.company_name,labels:person.labels,notes:person.notes}:{name:'',email:'',phone:'',company_name:'',labels:['lead'],notes:''};
 const [body,setBody]=useState(seed),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const dirty=JSON.stringify(seed)!==JSON.stringify(body);const markSaved=useWorkspaceUnsavedChanges(dirty,'Person details',save);
 async function save(){if(busy)return;setBusy(true);setError('');try{const r=await fetch('/api/admin/people',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:person?.id??null,revision:person?.revision??0,body}),signal:AbortSignal.timeout(20000)});const d=await r.json();if(!r.ok)throw new Error(d.error);markSaved();window.location.assign(`/people/${d.id}`);}catch(e){setError(e instanceof Error?e.message:'Save failed.');}finally{setBusy(false);}}
 return <fieldset disabled={busy} className="space-y-5 rounded-2xl border border-border bg-card p-6"><legend className="px-2 font-semibold">{person?'Contact details':'Add person'}</legend>
 {(['name','email','phone','company_name'] as const).map(key=><label key={key} className="block text-sm">{{name:'Full name',email:'Email',phone:'Phone',company_name:'Company'}[key]}<Input className="mt-2" type={key==='email'?'email':key==='phone'?'tel':'text'} value={body[key]} maxLength={key==='email'?254:key==='phone'?80:200} onChange={e=>setBody({...body,[key]:e.target.value})}/></label>)}
 <div><p className="mb-2 text-sm">Relationships</p><div className="flex flex-wrap gap-3">{Object.entries(peopleLabels).map(([key,value])=><label key={key} className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs ${value.color}`}><input type="checkbox" checked={body.labels.includes(key as PersonBody['labels'][number])} onChange={e=>setBody({...body,labels:e.target.checked?[...body.labels,key as PersonBody['labels'][number]]:body.labels.filter(label=>label!==key)})}/>{value.name}</label>)}</div></div>
 <label className="block text-sm">Internal notes<Textarea className="mt-2" value={body.notes} maxLength={4000} onChange={e=>setBody({...body,notes:e.target.value})}/></label>
 {error&&<p role="alert" className="text-sm text-red-600">{error}</p>}<Button onClick={()=>void save()} disabled={!dirty||!body.name||!body.email||!body.labels.length}>{busy?'Saving…':'Save person'}</Button>
 </fieldset>;
}
