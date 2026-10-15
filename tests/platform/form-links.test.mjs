import fs from 'node:fs';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
const module={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(new URL('../../lib/forms/links.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module,module.exports);
const forms=module.exports;
test('Form source and attachment links preserve record identity, safe anchors and supported types',()=>{
 const id='00000000-0000-4000-8000-000000000001';
 assert.equal(forms.formHref({form_type:'intake',request_id:id,item_key:null}),`/leads/${id}`);
 for(const key of ['custom-discovery','key / ?é%&']){const url=new URL(forms.formHref({form_type:'questionnaire',request_id:id,item_key:key}),'https://staff.bivi.pro');assert.equal(url.pathname,`/leads/${id}/onboarding`);assert.equal(url.searchParams.get('item'),key);assert.equal(decodeURIComponent(url.hash.slice(1)),forms.onboardingFormDomId(key));}
 for(const type of forms.attachTypes){assert.equal(forms.attachFormType(type),type);const url=new URL(forms.attachFormHref(id,type),'https://staff.bivi.pro');assert.equal(url.searchParams.get('add'),type);assert.equal(url.hash,'#onboarding-add-requirement');}
 for(const type of ['assessment','<script>','unknown',undefined])assert.equal(forms.attachFormType(type),undefined);
});
