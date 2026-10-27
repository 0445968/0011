import {z} from 'zod';
const cursorSchema=z.object({at:z.string().datetime({offset:true}),key:z.string().min(1).max(200)}).strict();
export function activityCursor(value?:string) {
  if(!value)return null;
  if(value.length>1000)throw new Error('Invalid activity cursor.');
  try{return cursorSchema.parse(JSON.parse(Buffer.from(value,'base64url').toString('utf8')));}
  catch{throw new Error('Invalid activity cursor.');}
}
export function encodeActivityCursor(value:unknown):string|null {
  return value?Buffer.from(JSON.stringify(cursorSchema.parse(value))).toString('base64url'):null;
}
