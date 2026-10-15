export const approvalKinds={brief:'Project brief',deliverable:'Deliverable',change:'Change request',update:'Progress update',qa:'QA check',handoff:'Handoff',receipt:'Client receipt',release:'Final release',closeout:'Support closeout'} as const;
export type ApprovalKind=keyof typeof approvalKinds;
export function approvalDomId(kind:ApprovalKind,id:string,version?:number|null){return `approval-${kind}-${encodeURIComponent(id)}${version!=null?`-v${version}`:''}`;}
export function approvalHref(item:{request_id:string;kind:ApprovalKind;source_id:string;version:number|null;needs_reviewer:boolean}){
 if(item.needs_reviewer)return `/projects/${item.request_id}/access`;
 const focus=approvalDomId(item.kind,item.source_id,item.version);
 const path=item.kind==='update'?`/projects/${item.request_id}/publish`:`/projects/${item.request_id}`;
 const params=new URLSearchParams({...((item.kind!=='update')?{tab:item.kind==='brief'?'brief':'delivery'}:{}),focus});return `${path}?${params}#${encodeURIComponent(focus)}`;
}

export function approvalUpdateVersion(focus?:string){const match=/^approval-update-([1-9][0-9]{0,7})-v\1$/.exec(focus||'');return match?Number(match[1]):undefined;}
