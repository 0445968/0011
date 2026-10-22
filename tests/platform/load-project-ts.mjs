import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
export function loadProjectTs(path) {
  const url=path instanceof URL?path:new URL(`../../${path}`,import.meta.url);
  const module={exports:{}};
  const source=ts.transpileModule(readFileSync(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  new Function('module','exports','require',source)(module,module.exports,name=>name.startsWith('.')?loadProjectTs(new URL(`${name}.ts`,url)):require(name));
  return module.exports;
}
