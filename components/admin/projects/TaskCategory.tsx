'use client';
import {useState,type ReactNode} from 'react';
import {ChevronDown,MoreHorizontal} from 'lucide-react';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem,DropdownMenuSeparator} from '@/components/ui/dropdown-menu';
export function TaskCategory({title,count,selection,onAdd,onSelect,onClear,children}:{title:string;count:number;selection:ReactNode;onAdd:()=>void;onSelect:()=>void;onClear:()=>void;children:ReactNode}){
 const [collapsed,setCollapsed]=useState(false);
 return <section className="relative min-w-0 max-w-full overflow-x-auto bg-white dark:bg-card">
  <div className="bivi-task-group flex items-center gap-2 bg-slate-50 px-5 py-2 text-xs font-semibold dark:bg-muted/40">{selection}
   <button type="button" aria-expanded={!collapsed} className="flex min-h-8 min-w-0 flex-1 items-center gap-2 text-left focus-visible:ring-2 focus-visible:ring-ring" onClick={()=>setCollapsed(value=>!value)}><ChevronDown size={14} className={collapsed?'-rotate-90':''}/><span>{title}</span><span className="font-normal text-muted-foreground">{count}</span></button>
   <DropdownMenu><DropdownMenuTrigger asChild><button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring" aria-label={'Actions for '+title}><MoreHorizontal size={16}/></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={onAdd}>Add task</DropdownMenuItem><DropdownMenuItem onSelect={onSelect}>Select all in category</DropdownMenuItem><DropdownMenuItem onSelect={onClear}>Clear category selection</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem onSelect={()=>setCollapsed(value=>!value)}>{collapsed?'Expand':'Collapse'} category</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
  </div>
  <div hidden={collapsed}>{children}</div>
 </section>;
}
