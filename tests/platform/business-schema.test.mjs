import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
function load(relative){const module={exports:{}};const path=new URL(relative,import.meta.url);const js=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;new Function('module','exports','require',js)(module,module.exports,name=>name==='./industries'?load('../../lib/business/industries.ts'):require(name));return module.exports;}
const {industries}=load('../../lib/business/industries.ts');const schema=load('../../lib/business/schema.ts');
test('Industry taxonomy has 12 unique groups and 120 consistently linked subindustries',()=>{assert.equal(industries.length,12);const children=industries.flatMap(industry=>industry.subindustries);assert.equal(children.length,120);assert.equal(new Set(children.map(child=>child.id)).size,120);assert.ok(industries.every(industry=>industry.subindustries.every(child=>child.id.startsWith(industry.id+'.'))));});
test('Contact channel validation distinguishes work/personal entries and requires one primary',()=>{const email={email:'WORK@EXAMPLE.COM',kind:'work',is_primary:true};const personal={email:'home@example.com',kind:'personal',is_primary:false};const result=schema.channelDetailsSchema.parse({emails:[email,personal],phones:[]});assert.equal(result.emails[0].email,'work@example.com');assert.equal(schema.channelDetailsSchema.safeParse({emails:[email,{...email,email:'work@example.com'}],phones:[]}).success,false);assert.equal(schema.channelDetailsSchema.safeParse({emails:[{...email,is_primary:false}],phones:[]}).success,false);assert.equal(schema.businessIdSchema.safeParse('234ABCD').success,true);assert.equal(schema.businessIdSchema.safeParse('1234567').success,false);});
