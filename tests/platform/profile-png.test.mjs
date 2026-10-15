import fs from 'node:fs';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
const module={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(new URL('../../lib/profile-images/png.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(module,module.exports);
const {validProfilePng}=module.exports;
test('Profile image validation accepts bounded PNGs and rejects corruption, oversize dimensions, SVG and appended data',()=>{
 const valid=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC",'base64');assert.equal(validProfilePng(valid),true);
 const corrupt=Buffer.from(valid);corrupt[40]^=1;assert.equal(validProfilePng(corrupt),false);
 assert.equal(validProfilePng(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAgEAAAABCAIAAADIG+ofAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC",'base64')),false);
 assert.equal(validProfilePng(Buffer.from('<svg onload="alert(1)"/>')),false);
 assert.equal(validProfilePng(valid.subarray(0,valid.length-1)),false);
 assert.equal(validProfilePng(Buffer.concat([valid,Buffer.from('trailing')])),false);
 assert.equal(validProfilePng(Buffer.alloc(2097153)),false);
});
