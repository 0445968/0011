import {getWorkspaceRecordFromPath} from './navigation';
export type UnsavedTab={key:string;href:string;label:string;updatedAt:number;draft:boolean};
const prefix=(staff:string)=>'bivi:unsaved-tab:v1:'+staff+':';
export function unsavedTabKey(href:string){return getWorkspaceRecordFromPath(href)?.key??href.split('#')[0];}
export function writeUnsavedTab(storage:Storage,staff:string,href:string,label:string,dirty:boolean,draft=false,now=Date.now()){
 const key=unsavedTabKey(href),entryKey=prefix(staff)+encodeURIComponent(key)+'::'+encodeURIComponent(label);
 if(!dirty){storage.removeItem(entryKey);return;}
 storage.setItem(entryKey,JSON.stringify({key,href,label,updatedAt:now,draft}));
}
export function readUnsavedTabs(storage:Storage,staff:string,now=Date.now()):UnsavedTab[]{
 const result:UnsavedTab[]=[];
 for(let i=storage.length-1;i>=0;i--){const key=storage.key(i);if(!key?.startsWith(prefix(staff)))continue;
  try{const entry=JSON.parse(storage.getItem(key)||'null');if(!entry||typeof entry.href!=='string'||!entry.href.startsWith('/')||entry.href.startsWith('//')||typeof entry.label!=='string'||typeof entry.updatedAt!=='number')continue;
   if(now-entry.updatedAt>(entry.draft?60*86400000:90000)){storage.removeItem(key);continue;}result.push(entry);
  }catch{/* Ignore corrupt status metadata. */}
 }
 return result.sort((a,b)=>a.href.localeCompare(b.href));
}
