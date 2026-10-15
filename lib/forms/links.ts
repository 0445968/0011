export const formTypes={intake:'Project inquiry',questionnaire:'Questionnaire',information_request:'Information request',assessment:'Assessment'} as const;
export type FormType=keyof typeof formTypes;
export const attachTypes=['questionnaire','information_request'] as const;
export type AttachFormType=typeof attachTypes[number];
export function attachFormType(value:string|undefined):AttachFormType|undefined {return attachTypes.includes(value as AttachFormType)?value as AttachFormType:undefined;}
export interface FormRecord {
 form_key:string;form_type:FormType;request_id:string;item_key:string|null;title:string;status:string;
 owner:'client'|'bivi';required:boolean;due_on:string|null;has_response:boolean;updated_at:string;
 contact_name:string;company_name:string;inquiry_status:string;onboarding_state:string|null;
 project_id:string|null;project_title:string|null;project_public_id:string|null;
}
export interface FormTarget {request_id:string;contact_name:string;company_name:string;state:string;updated_at:string;project_title:string|null;project_public_id:string|null;}
export function onboardingFormDomId(key:string){return `onboarding-form-${encodeURIComponent(key)}`;}
export function formHref(item:Pick<FormRecord,'form_type'|'request_id'|'item_key'>) {
 if(item.form_type==='intake'||!item.item_key)return `/leads/${item.request_id}`;
 return `/leads/${item.request_id}/onboarding?${new URLSearchParams({item:item.item_key})}#${encodeURIComponent(onboardingFormDomId(item.item_key))}`;
}
export function attachFormHref(requestId:string,kind:AttachFormType) {return `/leads/${requestId}/onboarding?${new URLSearchParams({add:kind})}#onboarding-add-requirement`;}
