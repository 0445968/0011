'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {useProjectMutationRefresh} from './useProjectMutationRefresh';
import type {ProjectBody} from '@/lib/projects/schema';
export type TaskChangeProposal={id:string;task_id:string;version:number;created_by:string|null;owning_side:'bivi'|'client';base_task:ProjectBody['tasks'][number]|null;candidate_task:ProjectBody['tasks'][number];base_settings:Record<string,unknown>;status:'pending'|'accepted'|'rejected'|'superseded';submitted_at:string;reviewed_at:string|null;review_note:string};
export type TaskAuthority={taskId:string;owningSide:'bivi'|'client';createdBy:string|null;originKind:string;canPropose:boolean;canProgress:boolean};
export function useTaskAuthority(projectId:string,revision:number,proposalId?:string){
 const [data,setData]=useState<{authority:{isAdmin:boolean;tasks:TaskAuthority[]};proposals:TaskChangeProposal[];proposerLabels:Record<string,string>}|null>(null);
 const [error,setError]=useState('');const generation=useRef(0);
 const load=useCallback(async()=>{const current=++generation.current;try{const response=await fetch(`/api/admin/projects/${projectId}/task-changes${proposalId?'?proposalId='+encodeURIComponent(proposalId):''}`,{cache:'no-store'});const value=await response.json();if(current!==generation.current)return;if(!response.ok)throw Error(value.error||'Task permissions could not load.');setData(value);setError('');}catch(cause){if(current===generation.current)setError(cause instanceof Error?cause.message:'Task permissions could not load.');}},[projectId,proposalId]);
 useEffect(()=>{void load();return()=>{generation.current++;};},[load,revision]);useProjectMutationRefresh(projectId,load);
 return {data,error,load};
}
