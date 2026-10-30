import type {ProjectBody} from './schema';
import {meetingTimeChoices} from './meeting-time';
import {DEFAULT_TASK_TIME_ZONE,taskDateTimeLabel} from './task-timing';

type Task=ProjectBody['tasks'][number];
export type DeadlineContext={today:string;timezone?:string;now?:string|number|Date};
const instants=new Map<string,number|null>();

/** Match PostgreSQL's later occurrence when a clock time repeats at DST fall-back. */
export function taskInstant(date:string|null|undefined,time:string|null|undefined,zone=DEFAULT_TASK_TIME_ZONE){
  if(!date||!time)return null;
  const key=date+'T'+time+'@'+zone;
  if(instants.has(key))return instants.get(key)!;
  const choices=meetingTimeChoices(date+'T'+time,zone).map(choice=>Date.parse(choice.value));
  const instant=choices.length?Math.max(...choices):null;
  if(instants.size>=256)instants.clear();
  instants.set(key,instant);return instant;
}
export function localDateTime(instant:string|number|Date,timezone=DEFAULT_TASK_TIME_ZONE){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(instant));
  const get=(kind:string)=>parts.find(part=>part.type===kind)!.value;
  return {date:`${get('year')}-${get('month')}-${get('day')}`,time:`${get('hour')}:${get('minute')}`};
}
export function taskEvent(task:Task,kind:'start'|'due',timezone=DEFAULT_TASK_TIME_ZONE,legacyStart:string|null=null){
  const date=kind==='due'?task.dueOn:task.startOn===undefined?legacyStart:task.startOn;
  const time=kind==='due'?task.dueTime:task.startTime;
  const instant=taskInstant(date,time,task.timeZone);
  if(instant===null)return {date,time:null,timeZone:timezone,instant:null};
  return {...localDateTime(instant,timezone),timeZone:timezone,instant};
}
export function taskDeadlineDay(task:Task,timezone=DEFAULT_TASK_TIME_ZONE){return taskEvent(task,'due',timezone).date;}
export function taskDeadlineLabel(task:Task,timezone=DEFAULT_TASK_TIME_ZONE){const event=taskEvent(task,'due',timezone);return taskDateTimeLabel(event.date,event.time,event.timeZone);}
export function taskIsOverdue(task:Task,context:DeadlineContext){
  if(task.archived||task.status==='done'||!task.dueOn)return false;
  const instant=taskInstant(task.dueOn,task.dueTime,task.timeZone);
  return instant===null?task.dueOn<context.today:instant<new Date(context.now??Date.now()).getTime();
}
export function compareTaskDeadlines(a:Task,b:Task,timezone=DEFAULT_TASK_TIME_ZONE){
  const left=taskEvent(a,'due',timezone),right=taskEvent(b,'due',timezone);
  return (left.date??'9999-12-31').localeCompare(right.date??'9999-12-31')||
    (left.time??'24:00').localeCompare(right.time??'24:00')||((left.instant??0)-(right.instant??0));
}
