'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {Tag,Plus,X} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
 const suggestions=catalog.length?catalog.filter(tag=>!(row?.tags??[]).includes(tag)):['design','review','feedback','client'];
 return <div className="text-xs">
  <Popover>
    <PopoverTrigger asChild>
      <button type="button" aria-label="Task tags" className="inline-flex min-h-8 items-center gap-2 rounded-lg px-2 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
        <Tag size={14} aria-hidden/><span className="font-medium">Tags</span>{Boolean(row?.tags.length)&&<span className="rounded-full bg-muted px-1.5 text-[10px]">{row?.tags.length}</span>}
      </button>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-64 space-y-3 p-3">
      <p className="text-xs font-semibold">Task tags</p>
      {row?.tags.length?<div className="flex flex-wrap gap-1.5">{row.tags.map(tag=><span key={tag} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px]">{tag}<button type="button" aria-label={'Remove tag '+tag} disabled={disabled||busy} onClick={()=>void save(row.tags.filter(value=>value!==tag))}><X size={12}/></button></span>)}</div>:<p className="text-[11px] text-muted-foreground">No tags assigned yet.</p>}
      {suggestions.length>0&&<div>
        <p className="mb-1.5 text-[11px] text-muted-foreground">Suggestions</p>
        <div className="flex flex-wrap gap-1">{suggestions.slice(0,12).map(tag=><button type="button" key={tag} disabled={disabled||busy||!row||(row?.tags.length??0)>=20} className="rounded-md border border-border px-2 py-1 text-[11px] hover:bg-muted disabled:opacity-40" onClick={()=>void save([...(row?.tags??[]),tag])}>{tag}</button>)}</div>
      </div>}
      <form onSubmit={event=>{event.preventDefault();void add();}} className="flex gap-1.5">
        <input aria-label="New tag name" placeholder="New tag…" maxLength={40} value={input} disabled={disabled||busy||!row} onChange={event=>setInput(event.target.value)} className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs outline-none"/>
        <button type="submit" title="Add tag" aria-label="Add tag" disabled={disabled||busy||!row||!input.trim()||(row?.tags.length??0)>=20} className="rounded-md bg-foreground px-2 text-background disabled:opacity-40"><Plus size={14}/></button>
      </form>
      {!row&&<p className="text-[11px] text-muted-foreground">Save this task first to assign tags.</p>}
      {message&&<p role="status" className="text-[11px] text-emerald-700">{message}</p>}
      {error&&<p role="alert" className="text-[11px] text-destructive">{error}<button type="button" className="ml-2 underline" onClick={()=>void reload()}>Refresh</button></p>}
    </PopoverContent>
  </Popover>
 </div>;
}
