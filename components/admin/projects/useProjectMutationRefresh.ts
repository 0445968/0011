'use client';
import {useEffect,useRef} from 'react';
import {projectMutationEvent} from '@/lib/projects/refresh';

export function useProjectMutationRefresh(id:string,refresh:()=>unknown){
  const latest=useRef(refresh);latest.current=refresh;
  useEffect(()=>{
    const changed=(event:Event)=>{if((event as CustomEvent).detail?.projectId===id)void latest.current();};
    window.addEventListener(projectMutationEvent,changed);return()=>window.removeEventListener(projectMutationEvent,changed);
  },[id]);
}
