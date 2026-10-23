/** One existing outbox attempt. Delivery acceptance and persisted completion are
 * separate: never mark a provider-accepted request failed because recording failed. */
export async function processCommunicationAttempt(
  row:{id:string;attempts:number},
  transport:{authorize:()=>Promise<boolean>;deliver:(idempotencyKey:string)=>Promise<string|null>;finish:(providerId:string|null,error:string|null)=>Promise<string>},
):Promise<'sent'|'retry'|'skipped'|'unknown'>{
  let accepted=false;
  try{
    if(!await transport.authorize())return 'skipped';
    const providerId=await transport.deliver(row.id);
    accepted=true;
    return await transport.finish(providerId,null)==='sent'?'sent':'unknown';
  }catch(cause){
    if(accepted)return 'unknown';
    try{await transport.finish(null,(cause instanceof Error?cause.message:'Transport failed').slice(0,1800));return 'retry';}
    catch{return 'unknown';}
  }
}
