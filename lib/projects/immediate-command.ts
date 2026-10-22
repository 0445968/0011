/** Transport coordination only: authoritative values/revisions stay in their existing readers. */
const pending=new Set<string>();
const uncertain=new Set<string>();
export class ProjectCommandError extends Error{
  constructor(message:string,public kind:'validation'|'conflict'|'unknown'|'rejected'|'busy'){super(message);}
}
export function confirmProjectCommandRead(url:string){uncertain.delete(url.split('?')[0]);}
export async function postProjectCommand(url:string,command:object){
  if(pending.has(url))throw new ProjectCommandError('Another command is saving. Wait for it to finish.','busy');
  if(uncertain.has(url))throw new ProjectCommandError('The previous result is uncertain. Refresh saved data before retrying.','unknown');
  pending.add(url);
  try{
    const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(20000)});
    const json=await response.json();
    if(!response.ok||json.saved!==true){
      const kind=response.ok||response.status>=500?'unknown':response.status===422||response.status===400?'validation':json.code==='revision_conflict'?'conflict':'rejected';
      if(kind==='unknown')uncertain.add(url);
      throw new ProjectCommandError(json.error||'The command result could not be confirmed.',kind);
    }
    return json as Record<string,any>;
  }catch(cause){
    if(cause instanceof ProjectCommandError)throw cause;
    uncertain.add(url);throw new ProjectCommandError('Save outcome is uncertain. Refresh saved data before retrying.','unknown');
  }finally{pending.delete(url);}
}
