export const SESSION_WARNING_MS=5*60*1000;
export function sessionSecondsLeft(expiresAt:number|null,now:number){return expiresAt===null?null:Math.max(0,Math.ceil((expiresAt-now)/1000));}
export function countdownLabel(seconds:number){return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}
