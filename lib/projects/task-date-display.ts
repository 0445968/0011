/** Display date-only values without converting them to the viewer's timezone. */
export function taskColumnDateLabel(date:string|null|undefined,time?:string|null,options:{weekday?:boolean;showTime?:boolean;showTimezone?:boolean;timezone?:string}={}){
 if(!date)return '';
 const parsed=new Date(date+'T12:00:00Z');
 if(!Number.isFinite(parsed.getTime()))return '';
 const day=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(parsed);
 const weekday=options.weekday?new Intl.DateTimeFormat('en-GB',{weekday:'short',timeZone:'UTC'}).format(parsed)+', ':'';
 let clock='';
 if(time&&options.showTime!==false){const [hour,minute]=time.split(':').map(Number);clock=` ${hour%12||12}:${String(minute).padStart(2,'0')} ${hour>=12?'PM':'AM'}`;}
 return weekday+day+clock+(options.showTimezone&&options.timezone?' · '+options.timezone:'');
}
