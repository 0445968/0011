import 'server-only';
import {revalidatePath} from 'next/cache';

/** Existing dynamic/RLS reads remain authoritative; invalidate router entries after commit. */
export function revalidateProjectSurfaces(id:string){
  try{
    for(const path of ['/admin','/admin/projects',`/admin/projects/${id}`,`/admin/projects/${id}/activity`,'/admin/notifications','/notifications','/admin/tasks','/admin/calendar',`/client/projects/${id}`,'/','/projects',`/projects/${id}`,`/projects/${id}/activity`,'/tasks','/calendar'])revalidatePath(path);
    return true;
  }catch{console.error('[project refresh] Saved mutation needs view refresh',{projectId:id});return false;}
}
