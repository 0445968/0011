import fs from 'node:fs';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
const module={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(new URL('../../lib/proposals/links.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module,module.exports);
const {proposalVersionHref,requestedProposalVersion}=module.exports;
test('Proposal links identify exact saved versions and reject missing/invalid selections without invalidating the inquiry',()=>{const id='a0000000-0000-4000-8000-000000000001';assert.equal(proposalVersionHref(id,3),`/leads/${id}/proposals?version=3#proposal-version-3`);assert.equal(requestedProposalVersion('2',[3,2,1]),2);for(const value of [undefined,'','0','-1','1.5','NaN','9','99999999999999999999'])assert.equal(requestedProposalVersion(value,[3,2,1]),undefined);});
