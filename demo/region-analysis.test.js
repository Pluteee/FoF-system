const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');const listeners={};
const ctx=vm.createContext({console,labels:{},renderers:{},state:{view:'test'},window:{},document:{addEventListener:(n,f)=>(listeners[n]??=[]).push(f),getElementById(){return null},querySelector(){return null}},localStorage:{getItem(){return null}},escapeHTML:v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')});
const run=s=>vm.runInContext(s,ctx);
for(const file of ['source-data.js','scenario-data.js','region-analysis.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),ctx);
const source=fs.readFileSync(__dirname+'/experience.js','utf8');vm.runInContext(source.replace(/\nrenderDxDashboard\(\);\s*$/,''),ctx);
assert.equal(run('dxRegionFunds("shenzhen").length'),34);assert.equal(run('dxRegionDeals("shenzhen").length'),38);
assert.match(run('raDashboard()'),/子基金＋直投项目/);assert.equal(run('raState.object'),'combined');
let html=run('dxRegionOverview()');assert.equal((html.match(/id="regionAnalysis"/g)||[]).length,1);assert(html.indexOf('<h2>拟出资流向</h2>')<html.indexOf('<h2>直投产业分布</h2>'));assert(html.indexOf('id="regionAnalysis"')<html.indexOf('<h2>近期动态</h2>'));assert(!html.includes('近期正面动态'));
const end=html.indexOf('</div></section>',html.indexOf('id="raAnalysisContent"'));assert(end>0);
for(const object of ['fund','direct','combined'])for(const dim of JSON.parse(run(`JSON.stringify(raDimensions('${object}'))`))){run(`raSelect('${object}','${dim[0]}')`);html=run('raBody()');assert(html.length>30);if(dim[0]==='geography'){assert(html.includes(object==='fund'?'子基金拟注册地分布':'直投城市分布'));assert(!html.includes('推进阶段分布'));assert(!html.includes('产业布局'))}if(dim[0]==='stage'){assert.match(html,/推进阶段分布/);assert(!html.includes('城市分布'));assert(!html.includes('产业布局'))}if(dim[0]==='activity'){assert.match(html,/近六个月投资活跃度/);assert.match(html,/近期活跃子基金/);assert(!html.includes('直投城市分布'))}}
run("raSelect('fund','geography')");assert.match(run('raBody()'),/region-fund-geo/);assert.match(run('raBody()'),/ 支/);assert(!run('raBody()').includes(' 笔'));
run("raSelect('direct','geography')");assert.match(run('raBody()'),/region-geo/);assert.match(run('raBody()'),/ 笔/);assert(!run('raBody()').includes('拟注册地分布'));
run("raSelect('fund','activity');raSelect('direct','activity')");assert.equal(run('raState.dimension'),'industry');
run("dx.region='shanghai';raDashboard()");assert.equal(run('raState.region'),'shanghai');assert.equal(run('raState.object'),'combined');assert.equal(run('raState.dimension'),'industry');assert(!run('raBody()').includes('43.24 亿'));
listeners.click[0]({target:{closest:()=>({dataset:{raDimension:'stage'}})}});assert.equal(run('raState.dimension'),'stage');
assert.equal(run('dxRegionIndustry()'),run('raDashboard()'));assert(!source.includes('近期正面动态'));
assert(Math.abs(run('dxSum(dxRegionFunds("shenzhen"),"request")+dxSum(dxRegionDeals("shenzhen"),"request")')-42.1267)<1e-7);
console.log('regional analysis: flow before industries, one object/dimension, all tabs, isolated populations and units, stage/geography/activity consolidation, region reset, filter actions and renamed updates OK');
