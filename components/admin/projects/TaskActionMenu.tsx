'use client';
import type {ReactNode} from 'react';
import {MoreHorizontal} from 'lucide-react';
import {ContextMenu,ContextMenuTrigger,ContextMenuContent,ContextMenuItem} from '@/components/ui/context-menu';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem} from '@/components/ui/dropdown-menu';
export type TaskAction={label:string;run:()=>void;disabled?:boolean};
export function TaskRowMenu({actions,children}:{actions:TaskAction[];children:ReactNode}){return <ContextMenu><ContextMenuTrigger asChild>{children}</ContextMenuTrigger><ContextMenuContent>{actions.map(action=><ContextMenuItem key={action.label} disabled={action.disabled} onSelect={action.run}>{action.label}</ContextMenuItem>)}</ContextMenuContent></ContextMenu>;}
export function TaskActionButton({title,actions}:{title:string;actions:TaskAction[]}){return <DropdownMenu><DropdownMenuTrigger asChild><button type="button" aria-label={'Actions for task '+title} className="bivi-task-edit-button inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"><MoreHorizontal size={15}/></button></DropdownMenuTrigger><DropdownMenuContent align="end">{actions.map(action=><DropdownMenuItem key={action.label} disabled={action.disabled} onSelect={action.run}>{action.label}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>;}
