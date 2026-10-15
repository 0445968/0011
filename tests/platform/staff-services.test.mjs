import fs from 'node:fs';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
function load(path,imports={}){const module={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module,module.exports,name=>name in imports?imports[name]:require(name));return module.exports;}
const catalog=load('../../data/serviceCatalog.ts');
const staff=load('../../lib/services/staff-catalog.ts',{'@/data/serviceCatalog':catalog});
const {templateFields}=load('../../lib/templates/schema.ts');
test('Staff service directory filters and paginates canonical data without mutating source definitions',()=>{
 const before=JSON.stringify(catalog.serviceCatalog);const ids=new Set(catalog.serviceCatalog.map(service=>service.id));assert.equal(ids.size,catalog.serviceCatalog.length);
 const first=staff.listStaffServices({}),second=staff.listStaffServices({page:'2'});assert.equal(first.total,catalog.serviceCatalog.length);assert.equal(first.rows.length,6);assert.equal(new Set([...first.rows,...second.rows].map(service=>service.id)).size,first.total);
 assert.equal(staff.listStaffServices({page:'-5'}).page,1);assert.equal(staff.listStaffServices({page:'99999'}).page,first.pages);
 for(const category of catalog.serviceCategories){const result=staff.listStaffServices({category:category.id});assert.ok(result.rows.every(service=>service.categoryId===category.id));}
 assert.equal(staff.listStaffServices({q:' WEBSITE '}).total,2);assert.equal(staff.listStaffServices({q:'<script>unknown'}).total,0);
 for(const service of catalog.serviceCatalog){assert.ok(service.marketingHref.startsWith('/')&&!service.marketingHref.startsWith('//'));assert.equal(staff.serviceRequirements(service).length,service.requirementIds.length);assert.ok(service.addOnServiceIds.every(id=>ids.has(id)));assert.equal(new Set(service.tasks.map(task=>task.id)).size,service.tasks.length);}
 assert.equal(JSON.stringify(catalog.serviceCatalog),before);
});
test('Service scope seeds are valid personal proposal templates and preserve quote-required, draft and undecided terms',()=>{
 const before=JSON.stringify(catalog.serviceCatalog);
 for(const service of catalog.serviceCatalog){const seed=staff.serviceTemplateSeed(service);assert.equal(templateFields.safeParse(seed).success,true);assert.equal(seed.kind,'proposal');assert.equal(seed.visibility,'personal');assert.ok(seed.content.includes(`blueprint version ${service.blueprintVersion} (${service.status})`));assert.ok(seed.content.includes('Quote required'));assert.ok(seed.content.includes('Included revision allowance: Not agreed'));assert.ok(seed.content.includes('Review scope, quantities, fees, timing, and revision allowances'));
  for(const deliverable of service.deliverables)assert.ok(seed.content.includes(deliverable));for(const exclusion of service.exclusions)assert.ok(seed.content.includes(exclusion));
  const labels=staff.serviceCommercialLabels(service);assert.equal(labels.price,'Quote required');assert.equal(labels.turnaround,'Not specified');assert.equal(labels.support,'Not specified');assert.equal(labels.effort,'Not estimated');
 }
 assert.equal(JSON.stringify(catalog.serviceCatalog),before);
});
