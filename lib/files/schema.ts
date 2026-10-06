import {z} from 'zod';
export const FILE_BUCKET='bivi-project-files';
export const MAX_FILE_BYTES=10*1024*1024;
const mimes:Record<string,string>={pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',zip:'application/zip',txt:'text/plain'};
export function fileMime(filename:string){const extension=filename.includes('.')?filename.split('.').pop()?.toLowerCase()||'':'';return Object.prototype.hasOwnProperty.call(mimes,extension)?mimes[extension]:undefined;}
const filename=z.string().min(1).max(180).refine(s=>s===s.trim()&&!/[\x00-\x1f\x7f/\\]/.test(s));
export const fileCommandSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('reserve'),id:z.string().uuid(),filename,size:z.number().int().min(1).max(MAX_FILE_BYTES),mime:z.string()}).strict(),
 z.object({action:z.literal('finalize'),id:z.string().uuid()}).strict(),
 z.object({action:z.enum(['share','private']),id:z.string().uuid(),expectedRevision:z.number().int().nonnegative()}).strict(),
 z.object({action:z.literal('withdraw'),id:z.string().uuid(),expectedRevision:z.number().int().nonnegative(),reason:z.string().trim().min(1).max(2000)}).strict(),
]).refine(c=>c.action!=='reserve'||fileMime(c.filename)===c.mime);
