import fs from 'node:fs';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
const module={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(new URL('../../lib/business/transfer/csv.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(module,module.exports);
const {parseCsv,writeCsv}=module.exports;
test('CSV preserves commas, quotes, unicode and multiline fields',()=>{const rows=[['name','notes'],['Élière','one, two\n"quoted"']];assert.deepEqual(parseCsv(writeCsv(rows)),rows);assert.deepEqual(parseCsv('name,email\r\nAda,ada@example.com\r\n'),[['name','email'],['Ada','ada@example.com']]);});
test('CSV rejects malformed or oversized imports and neutralizes spreadsheet formulas',()=>{for(const value of ['name,name\na,b','name,email\na','name\n"unclosed','name\n"ok"bad','name\n'+Array(101).fill('x').join('\n')])assert.throws(()=>parseCsv(value));assert.throws(()=>parseCsv('x'.repeat(500001)));assert.match(writeCsv([['=HYPERLINK("evil")',' +123','@SUM(1)']]),/"'=HYPERLINK/);});
