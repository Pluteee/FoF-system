'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const fixture=vm.runInNewContext(fs.readFileSync(path.join(root,'demo/source-data.js'),'utf8')+';sourceWorkbook');
const expected=require('../demo/generate-synthetic-data.cjs').makeSynthetic();
assert.equal(JSON.stringify(fixture),JSON.stringify(expected),'Public fixture must match the synthetic generator.');
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'demo/scenario-data.js'),'utf8'),ctx);const scenario=vm.runInContext('demoScenario',ctx);
for(const row of [...fixture.funds,...fixture.deals])assert.ok(row.name.startsWith('演示·'));
for(const row of fixture.funds)assert.ok(row.manager.startsWith('演示·'));
for(const row of Object.values(scenario.regions))assert.ok(row.manager.includes('演示'));
const violations=[];let count=0;
function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name),rel=path.relative(root,file);if(entry.isSymbolicLink()){violations.push(rel+': symlink');continue}if(entry.isDirectory()){if(['node_modules','__pycache__','.git'].includes(entry.name))continue;visit(file);continue}if(!/\.(js|cjs|py|md|css|html|json)$/.test(entry.name))continue;count++;if(rel.startsWith('demo/vendor/'))continue;const text=fs.readFileSync(file,'utf8');if(/\/Users\/[A-Za-z][^/\s]+\//.test(text))violations.push(rel+': local user path');if(/IMG_\d+\.(?:JPG|JPEG|PNG)/i.test(text))violations.push(rel+': source image identifier');if(/(?:src|href)=["']\.\.\//.test(text))violations.push(rel+': parent-directory browser asset');if(/(['"])diki-(?!public-)[a-z0-9-]+\1/.test(text))violations.push(rel+': legacy browser storage');}}
visit(path.join(root,'demo'));visit(path.join(root,'scripts'));
assert.deepEqual(violations,[],'Public source checks failed.');
console.log('Public synthetic fixture and '+count+' public source files checked.');
