import {filePreview} from '@/lib/files/http';
export const dynamic='force-dynamic';
export function POST(request:Request,{params}:{params:{id:string;fileId:string}}) {
  return filePreview(request,params.id,params.fileId);
}
