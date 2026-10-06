import {fileDownload} from '@/lib/files/http';
export function POST(request:Request,{params}:{params:{id:string;fileId:string}}){return fileDownload(request,params.id,params.fileId,true);}
