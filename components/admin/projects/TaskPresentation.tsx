'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {Tag,Plus,X} from 'lucide-react';
import {useWorkspaceUnsavedChanges} from '../workspace/WorkspaceNavigationGuard';
import {useProjectMutationRefresh} from './useProjectMutationRefresh';
import {postProjectCommand,confirmProjectCommandRead} from '@/lib/projects/immediate-command';
import {refreshProjectSurfaces} from '@/lib/projects/refresh';
export type TaskPresentationRow={task_id:string;code:string;tags:string[];revision:number};
export function useTaskPresentation(projectId:string,revision:number){
 const [rows,setRows]=useState<TaskPresentationRow[]>([]);
 const [error,setError]=useState('');const generation=useRef(0);
 const endpoint=`/api/admin/projects/${projectId}/task-presentation`;
 const load=useCallback(async()=>{const current=++generation.current;try{const response=await fetch(endpoint,{cache:'no-store'});const data=await response.json();if(current!==generation.current)return;if(!response.ok)throw new Error(data.error||'Task labels could not load.');setRows(data.rows);setError('');confirmProjectCommandRead(endpoint);}catch(e){if(current===generation.current)setError(e instanceof Error?e.message:'Task labels could not load.');}},[endpoint]);
 useEffect(()=>{void load();return()=>{generation.current++;};},[load,revision]);
 useProjectMutationRefresh(projectId,load);
 return {rows,error,load,endpoint};
}
export function TaskTags({projectId,projectRevision,row,catalog,disabled,reload}:{projectId:string;projectRevision:number;row?:TaskPresentationRow;catalog:string[];disabled:boolean;reload:()=>Promise<void>}){
 const router=useRouter();const [input,setInput]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState('');
 async function save(tags:string[]){if(!row||disabled||busy)return false;setBusy(true);setMessage('');setError('');try{await postProjectCommand(`/api/admin/projects/${projectId}/task-presentation`,{taskId:row.task_id,tags,revision:row.revision,projectRevision});setInput('');setMessage('Tags saved.');await reload();refreshProjectSurfaces(projectId,router);return true;}catch(e){setError(e instanceof Error?e.message:'Tags could not be saved.');return false;}finally{setBusy(false);}}
 async function add(){const tag=input.trim().toLowerCase();return tag?save([...new Set([...(row?.tags??[]),tag])]):false;}
 useWorkspaceUnsavedChanges(Boolean(input.trim()),'New task tag',async()=>{if(!await add())throw new Error('Save the task tag before leaving.');});
 return <div className="space-y-2 text-xs"><div className="flex flex-wrap items-center gap-2"><Tag size={13} aria-hidden/><span className="font-medium">Tags</span>{row?.tags.map(tag=><span key={tag} className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1">{tag}<button type="button" aria-label={`Remove tag ${tag}`} disabled={disabled||busy} onClick={()=>void save(row.tags.filter(value=>value!==tag))}><X size={11}/></button></span>)}</div><div className="flex items-center gap-2"><input aria-label="Create or assign tag" placeholder="Create or choose a tag" list={`task-tags-${row?.task_id}`} maxLength={40} value={input} disabled={disabled||busy||!row} onChange={event=>setInput(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();void add();}}} className="min-w-0 rounded-md bg-muted/40 px-2 py-1.5"/><datalist id={`task-tags-${row?.task_id}`}>{catalog.map(tag=><option key={tag} value={tag}/>)}</datalist><button type="button" aria-label="Assign tag" title="Assign tag" disabled={disabled||busy||!row||!input.trim()||(row.tags.length>=20)} onClick={()=>void add()} className="rounded p-1 hover:bg-muted disabled:opacity-40"><Plus size={14}/></button>{input&&<button type="button" className="text-muted-foreground" disabled={busy} onClick={()=>setInput('')}>Cancel</button>}</div>{!row&&<p className="text-muted-foreground">Save this task to assign tags and receive its reference.</p>}{message&&<p role="status" className="text-emerald-700">{message}</p>}{error&&<p role="alert" className="text-destructive">{error}<button type="button" className="ml-2 underline" onClick={()=>void reload()}>Refresh</button></p>}</div>;
}
