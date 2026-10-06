import {z} from 'zod';
const text=(max:number)=>z.string().trim().max(max);
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable();
export const readinessBodySchema=z.object({
 agreementStatus:z.enum(['pending','signed']),agreementRef:text(2000),signatory:text(200),signedOn:date,
 depositStatus:z.enum(['pending','received','waived']),depositAmount:z.string().regex(/^(?:|\d{1,9}(?:\.\d{1,2})?)$/),currency:z.string().regex(/^(?:|[A-Z]{3})$/),depositRef:text(2000),depositOn:date,waiverReason:text(2000),notes:text(4000),
}).strict();
export type ReadinessBody=z.infer<typeof readinessBodySchema>;
export const emptyReadiness:ReadinessBody={agreementStatus:'pending',agreementRef:'',signatory:'',signedOn:null,depositStatus:'pending',depositAmount:'',currency:'',depositRef:'',depositOn:null,waiverReason:'',notes:''};
export const readinessCommandSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('save'),expectedRevision:z.number().int().min(0),body:readinessBodySchema}).strict(),
 z.object({action:z.literal('release'),expectedRevision:z.number().int().min(1)}).strict(),
 z.object({action:z.literal('hold'),expectedRevision:z.number().int().min(1),reason:text(2000).min(1)}).strict(),
]);
export function readinessChecks(body:ReadinessBody){return {
 agreement:body.agreementStatus==='signed'&&!!body.agreementRef&&!!body.signatory&&!!body.signedOn,
 deposit:body.depositStatus==='received'&&Number(body.depositAmount)>0&&!!body.currency&&!!body.depositRef&&!!body.depositOn||body.depositStatus==='waived'&&!!body.waiverReason,
};}
