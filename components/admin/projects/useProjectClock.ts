'use client';
import {useEffect,useState} from 'react';

/** One server reference avoids hydration drift; mounted deadline badges tick by minute. */
export function useProjectClock(initial?:string){
  const [now,setNow]=useState(()=>initial??new Date().toISOString());
  useEffect(()=>{setNow(new Date().toISOString());const timer=window.setInterval(()=>setNow(new Date().toISOString()),60000);return()=>window.clearInterval(timer);},[initial]);
  return now;
}
