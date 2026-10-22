/** Date-time values represent instants. Wall input must resolve in its named zone. */
export function meetingWallTime(instant:string,timezone:string) {
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(instant));
  const get=(kind:string)=>parts.find(part=>part.type===kind)?.value;
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}
export function meetingTimeChoices(wall:string,timezone:string):{value:string;offset:string}[] {
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(wall))return [];
  const local=Date.parse(`${wall}:00Z`);
  if(!Number.isFinite(local)||new Date(local).toISOString().slice(0,16)!==wall)return [];
  const choices:{value:string;offset:string}[]=[];
  try{
    for(let offset=-14*60;offset<=14*60;offset+=15){
      const instant=new Date(local-offset*60000).toISOString();
      if(meetingWallTime(instant,timezone)!==wall)continue;
      const label=`${offset<0?'-':'+'}${String(Math.floor(Math.abs(offset)/60)).padStart(2,'0')}:${String(Math.abs(offset)%60).padStart(2,'0')}`;
      choices.push({value:`${wall}:00${label}`,offset:label});
    }
  }catch{return [];}
  return choices;
}
export function meetingState(meeting:{status:string;starts_at:string;ends_at:string},now=new Date()):'cancelled'|'upcoming'|'ongoing'|'past' {
  if(meeting.status==='cancelled')return 'cancelled';
  if(Date.parse(meeting.ends_at)<=now.getTime())return 'past';
  return Date.parse(meeting.starts_at)<=now.getTime()?'ongoing':'upcoming';
}
