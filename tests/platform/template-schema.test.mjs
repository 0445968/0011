import fs from 'node:fs';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const module={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(new URL('../../lib/templates/schema.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module,module.exports,createRequire(import.meta.url));
const {templateCommand}=module.exports;
test('Template commands bound content, forbid ownership injection and require a version for existing records',()=>{
 const create={action:'create',id:'00000000-0000-4000-8000-000000000001',title:'Example',kind:'proposal',description:'',visibility:'personal',content:'Reusable content',changeNote:'Initial'};
 assert.equal(templateCommand.safeParse(create).success,true);
 for(const fields of [{content:' '},{content:'x'.repeat(30001)},{changeNote:''},{kind:'html'},{visibility:'public'},{owner_id:create.id}])assert.equal(templateCommand.safeParse({...create,...fields}).success,false);
 assert.equal(templateCommand.safeParse({...create,action:'save'}).success,false);
 assert.equal(templateCommand.safeParse({...create,action:'save',expectedVersion:1}).success,true);
 for(const action of ['duplicate','archive','restore']){assert.equal(templateCommand.safeParse({action,id:create.id,expectedVersion:2}).success,true);assert.equal(templateCommand.safeParse({action,id:create.id}).success,false);}
});
