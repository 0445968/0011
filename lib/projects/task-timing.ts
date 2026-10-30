import {meetingTimeChoices} from './meeting-time';
import type { ProjectBody } from './schema';

type Task=ProjectBody['tasks'][number];
export const DEFAULT_TASK_TIME_ZONE='America/Chicago';
export function taskStartOn(task:Task,legacyStart:string|null=null){
  return task.startOn===undefined?legacyStart:task.startOn;
}
export function taskTimeLabel(time:string|null|undefined,timeZone=DEFAULT_TASK_TIME_ZONE,showTimezone=true){
  if(!time)return '';
  const [hours,minutes]=time.split(':').map(Number);
  return `${hours%12||12}:${String(minutes).padStart(2,'0')} ${hours>=12?'PM':'AM'}${showTimezone?' · '+timeZone:''}`;
}
export function taskDateTimeLabel(date:string|null|undefined,time?:string|null,timeZone?:string){
  return date?`${date}${time?' · '+taskTimeLabel(time,timeZone):''}`:'';
}
export function validTaskTiming(task:Task){
  if(task.startOn){const date=new Date(task.startOn+'T12:00:00Z');if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==task.startOn)return false;}
  if(task.startTime&&!task.startOn)return false;
  if(task.dueTime&&!task.dueOn)return false;
  if(task.startOn&&task.dueOn){
    if(task.startOn>task.dueOn)return false;
    if(task.startOn===task.dueOn&&task.startTime&&task.dueTime&&task.startTime>task.dueTime)return false;
  }
  for(const [date,time] of [[task.startOn,task.startTime],[task.dueOn,task.dueTime]])if(date&&time&&!meetingTimeChoices(date+'T'+time,task.timeZone??DEFAULT_TASK_TIME_ZONE).length)return false;
  return true;
}
