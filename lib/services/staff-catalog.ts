import {clientRequirements,serviceCatalog,serviceCategories} from '@/data/serviceCatalog';
import type {ServiceBlueprint} from './types';
import type {TemplateFields} from '@/lib/templates/schema';

export function listStaffServices(p:Record<string,string|undefined>) {
 const term=(p.q||'').trim().toLowerCase().slice(0,100);
 const category=serviceCategories.some(category=>category.id===p.category)?p.category:undefined;
 const matches=serviceCatalog.filter(service=>(!category||service.categoryId===category)&&(!term||[service.id,service.name,service.description,...service.deliverables,...service.configurationFields].join(' ').toLowerCase().includes(term))).sort((a,b)=>a.name.localeCompare(b.name));
 const pages=Math.max(1,Math.ceil(matches.length/6));
 const page=Math.min(pages,Math.max(1,Math.floor(Number(p.page)||1)));
 return {rows:matches.slice((page-1)*6,page*6),total:matches.length,page,pages,category};
}
export function serviceRequirements(service:ServiceBlueprint) {return service.requirementIds.map(id=>clientRequirements.find(requirement=>requirement.id===id)).filter((item):item is typeof clientRequirements[number]=>!!item);}
export function serviceCommercialLabels(service:ServiceBlueprint) {
 const terms=service.commercial;
 return {
  price:terms.price===null||!terms.currency?'Quote required':`${terms.currency} ${terms.price.toLocaleString('en-US')} · Quote required`,
  effort:terms.estimatedEffortHours===null?'Not estimated':`${terms.estimatedEffortHours} hours`,
  turnaround:terms.turnaroundBusinessDays?`${terms.turnaroundBusinessDays.min}–${terms.turnaroundBusinessDays.max} business days`:'Not specified',
  support:terms.supportDays===null?'Not specified':`${terms.supportDays} days`,
  included:terms.revisions.includedRounds===null?'Not agreed':`${terms.revisions.includedRounds} rounds`,
  proposed:terms.revisions.proposedRounds===null?'Not proposed':`${terms.revisions.proposedRounds} rounds (${terms.revisions.status})`,
 };
}
export function serviceScopeText(service:ServiceBlueprint) {
 const labels=serviceCommercialLabels(service);
 const section=(title:string,items:string[])=>`${title}\n${items.length?items.map(item=>`- ${item}`).join('\n'):'- None specified'}`;
 return [
  `${service.name} — draft scope`,
  `Source: ${service.id}, blueprint version ${service.blueprintVersion} (${service.status}).`,
  service.description,
  `Quantity: minimum ${service.minimumQuantity} ${service.unit}. ${service.quantityNotes}`,
  section('Configuration to confirm',service.configurationFields),
  section('Scope prerequisites to review',service.prerequisites),
  section('Deliverables',service.deliverables),
  section('Exclusions',service.exclusions),
  section('Client inputs',serviceRequirements(service).map(item=>`${item.label}${item.required?' (required)':' (optional)'}`)),
  section('Approval gates',service.approvalGates.map(gate=>`${gate.title} — ${gate.phase}`)),
  section('Handoff',service.handoff),
  `Commercial terms\nPricing: ${labels.price}\nEstimated effort: ${labels.effort}\nTurnaround: ${labels.turnaround}\nSupport: ${labels.support}\nIncluded revision allowance: ${labels.included}\nProposed revision allowance: ${labels.proposed}\n${service.commercial.revisions.notes}`,
  'Review scope, quantities, fees, timing, and revision allowances before including this wording in an agreed proposal.',
 ].join('\n\n');
}
export function serviceTemplateSeed(service:ServiceBlueprint):TemplateFields {
 return {title:`${service.name} scope`.slice(0,200),kind:'proposal',description:`Draft scope from ${service.id}, blueprint version ${service.blueprintVersion}. Review before use.`,visibility:'personal',content:serviceScopeText(service),changeNote:`Created from ${service.id} blueprint v${service.blueprintVersion}`};
}
