const DEFAULT_TIME_ZONE='America/Chicago';

export function safeTimeZone(timezone:string|undefined|null):string {
  if(!timezone)return DEFAULT_TIME_ZONE;
  try {
    new Intl.DateTimeFormat('en-US',{timeZone:timezone});
    return timezone;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

export function formatSafeDateTime(value:string|undefined|null,timezone?:string|null,labels:{absent?:string;invalid?:string}={}) {
  if(!value)return labels.absent??'—';
  const date=new Date(value);
  if(!Number.isFinite(date.getTime()))return labels.invalid??'—';
  return new Intl.DateTimeFormat('en-US',{
    year:'numeric',
    month:'short',
    day:'numeric',
    hour:'numeric',
    minute:'2-digit',
    timeZone:safeTimeZone(timezone),
    timeZoneName:'short',
  }).format(date);
}
