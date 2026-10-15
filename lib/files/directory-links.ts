export interface DirectoryFile {
  id:string; request_id:string; filename:string; size_bytes:number; mime_type:string;
  uploader_id:string|null; uploader_label:string; uploader_type:'staff'|'client'|'former';
  state:'pending'|'ready'|'withdrawn'; shared:boolean; created_at:string; updated_at:string;
  project_title:string; project_public_id:string; project_state:string;
  company_id:string|null; company_name:string|null; company_public_id:string|null;
}
export function projectFilesHref(requestId:string) {return `/projects/${requestId}/files`;}
export function previewKind(mime:string,size:number):'image'|'text'|null {
  if (['image/png','image/jpeg','image/webp'].includes(mime)) return 'image';
  return mime==='text/plain' && size<=262144 ? 'text' : null;
}
export function fileSize(bytes:number) {return bytes>=1048576?`${(bytes/1048576).toFixed(1)} MB`:`${(bytes/1024).toFixed(1)} KB`;}
export function uploadedDate(value:string|undefined):value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date=new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
}
export function filesDateRange(from:string|undefined,to:string|undefined) {
  if ((from&&!uploadedDate(from))||(to&&!uploadedDate(to))||(from&&to&&from>to)) return {from:undefined,through:undefined,before:undefined,warning:'Choose valid upload dates in order. The date filter was not applied.'};
  let before:string|undefined;
  if(to){const end=new Date(`${to}T00:00:00Z`);end.setUTCDate(end.getUTCDate()+1);before=end.toISOString();}
  return {from:from?`${from}T00:00:00Z`:undefined,through:to,before,warning:''};
}
