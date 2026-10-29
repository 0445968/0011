'use client';
import {createContext,useContext} from 'react';
import {useRouter} from 'next/navigation';
import {guardWorkspaceNavigation} from './WorkspaceNavigationGuard';
import {taskWorkspaceHref} from '@/lib/admin/workspace/navigation';
export const TaskWorkspaceContext=createContext<((projectId:string,taskId:string,title:string)=>void)|null>(null);
export function useTaskWorkspace(){const open=useContext(TaskWorkspaceContext);const router=useRouter();return open??((projectId:string,taskId:string)=>guardWorkspaceNavigation(()=>router.push(taskWorkspaceHref(projectId,taskId))));}
