import {fileCommand} from '@/lib/files/http';
export function POST(request:Request,{params}:{params:{id:string}}){return fileCommand(request,params.id,false);}
