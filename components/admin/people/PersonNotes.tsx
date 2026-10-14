'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {useWorkspaceUnsavedChanges} from '../workspace/WorkspaceNavigationGuard';
export function PersonNotes({id,notes}:{id:number;notes:{id:string;body:string;created_at:string;author_label:string}[]}){
 const router=useRouter();const [body,setBody]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const saved=useWorkspaceUnsavedChanges(!!body.trim(),'Person note',save);
 async function save(){if(busy||!body.trim())return;setBusy(true);setError('');try{const response=await fetch('/api/admin/people',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'note',id,body}),signal:AbortSignal.timeout(20000)});const result=await response.json();if(!response.ok)throw new Error(result.error);saved();setBody('');router.refresh();}catch(e){setError(e instanceof Error?e.message:'Note could not save.');}finally{setBusy(false);}}
 return <section className="space-y-4 rounded-xl border bg-card p-5"><h2 className="font-semibold">Notes</h2><Textarea aria-label="New person note" value={body} maxLength={4000} disabled={busy} onChange={e=>setBody(e.target.value)}/><Button onClick={()=>void save()} disabled={busy||!body.trim()}>{busy?'Adding…':'Add note'}</Button>{error&&<p role="alert" className="text-sm text-red-600">{error}</p>}{notes.map(note=><article key={note.id} className="border-t pt-3"><p className="whitespace-pre-wrap text-sm">{note.body}</p><p className="mt-2 text-xs text-muted-foreground">{note.author_label||'Staff'} · {new Date(note.created_at).toLocaleString()}</p></article>)}</section>;
}
