'use client';
import {useState,useEffect} from 'react';
import Image from 'next/image';
export type ImageKind='person'|'company'|'staff'|'client';
export function imageEndpoint(kind:ImageKind,subject:string){return `/api/${kind==='client'?'client':'admin'}/profile-image?${new URLSearchParams({kind,subject})}`;}
export function ProfileImage({kind,subject,name,path,size='h-10 w-10',version=0}:{kind:ImageKind;subject:string;name:string;path?:string|null;size?:string;version?:number}){
 const [failed,setFailed]=useState(false);useEffect(()=>setFailed(false),[path,version]);const initials=name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase()||'?';
 return <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${kind==='company'?'rounded-xl':'rounded-full'} bg-muted text-sm font-semibold ${size}`}>{path&&!failed?<Image unoptimized width={96} height={96} alt={`${name} ${kind==='company'?'logo':'avatar'}`} src={`${imageEndpoint(kind,subject)}&v=${encodeURIComponent(path)}-${version}`} onError={()=>setFailed(true)} className={`h-full w-full ${kind==='company'?'object-contain':'object-cover'}`}/>:<span aria-label={`${name} initials`}>{initials}</span>}</span>;
}
