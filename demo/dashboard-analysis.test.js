const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const listeners={};
const ctx=vm.createContext({console,document:{addEventListener:(name,fn)=>(listeners[name]??=[]).push(fn),getElementById(){return null},querySelector(){return null}}});
const run=s=>vm.runInContext(s,ctx);
for(const file of ['source-data.js','scenario-data.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),ctx);
run(`const wbRecords=[];
 const dxRegions=[{id:'shenzhen',city:'深圳'},{id:'shanghai',city:'上海'},{id:'beijing',city:'北京'}];
 const dxFunds=[...sourceWorkbook.funds.map(f=>({...f,region:'shenzhen'})),...demoScenario.funds];
 const dxDeals=[...sourceWorkbook.deals.map(d=>({...d,region:'shenzhen'})),...demoScenario.deals],dxPaths=demoScenario.paths;
 const dxDealCompany=s=>s.replace(/（第二轮）$/,''),dxRegion=id=>dxRegions.find(r=>r.id===id);
 const dxRegionFunds=id=>dxFunds.filter(f=>f.region===id),dxRegionDeals=id=>dxDeals.filter(d=>d.region===id);
 const dxE=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const dxMoney=(n,d=2)=>Number(n).toFixed(d),dxPct=(a,b)=>b?Math.round(a/b*100):0;
 const dxPanel=(title,body,sub)=>'<section class="dx-panel"><h2>'+title+'</h2><p>'+sub+'</p>'+body+'</section>';
 const dxIndustry=s=>s,dxFundStage=()=> '立项',dxDealMeta=()=>({stage:'尽调中'}),dxDealRound=()=> 'Pre-A';
 const dxRegionMatrix=(kind,fn)=>'<div class="test-matrix">'+kind+':'+fn((kind==='fund'?dxFunds:dxDeals)[0])+'</div>';
 const dxColumnChart=kind=>'<div class="test-columns">'+kind+'</div>';
 const dxDashboardGeoRows=(id,mode)=>mode==='fund'?dxRegionFunds(id):dxRegionDeals(id);
 const dxGeoGroups=rows=>{const groups=new Map();rows.forEach(r=>groups.set(r.place,(groups.get(r.place)||0)+1));return [...groups]};
`);
for(const file of ['bottom-profile.js','dashboard-analysis.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),ctx);
assert.match(run('daDashboard()'),/投资组合分析/);
assert.equal((run('daDashboard()').match(/class="dx-panel"/g)||[]).length,1);
assert.match(run('daDashboard()'),/三地底层项目轮次分布/);
assert(!run('daDashboard()').includes('三地底层项目估值分布'));
assert(!run('daDashboard()').includes('看清底层企业的成长阶段与估值结构'));
for(const object of ['fund','direct','enterprise']){
 const dimensions=JSON.parse(run(`JSON.stringify(daObjects.${object}.dimensions)`));
 for(const [dimension] of dimensions){
  run(`daSelect('${object}','${dimension}')`);const html=run('daDashboard()');
  assert(html.includes('aria-label="'+run(`daObjects.${object}.name`)+'分析维度"'));
  if(object!=='enterprise')assert(!html.includes('id="bottomProjectProfile"'));
  else {assert(html.includes('id="bottomProjectProfile"'));assert.equal((html.match(/class="dx-panel"/g)||[]).length,1)}
  assert(!html.includes('<h2>直投项目区域分布</h2>'));
 }
}
run(`daSelect('fund','valuation')`);assert.equal(run('daState.dimension'),'industry');
run(`daSelect('direct','geography')`);assert.match(run('daDashboard()'),/直投项目注册地分布/);assert(!run('daDashboard()').includes('子基金注册地分布'));
run(`daSelect('fund','geography')`);assert.match(run('daDashboard()'),/子基金区域分布/);
run(`daSelect('enterprise','valuation')`);assert.match(run('daDashboard()'),/三地底层项目估值分布/);assert(!run('daDashboard()').includes('三地底层项目轮次分布'));
run(`bpState.region='shenzhen';bpState.bucket='1—5亿';bpState.page=3`);
const event={target:{closest:selector=>selector.includes('data-da-')?{dataset:{daDimension:'round'}}:null}};
listeners.click.at(-1)(event);
assert.equal(run('daState.dimension'),'round');assert.equal(run('bpState.region'),'all');assert.equal(run('bpState.bucket'),'all');assert.equal(run('bpState.page'),1);
const experience=fs.readFileSync(__dirname+'/experience.js','utf8');
const dashboard=experience.slice(experience.indexOf('function renderDxDashboard(){'),experience.indexOf('const dxRegionIndirect'));
assert(dashboard.includes('智能问数与决策辅助'));assert(dashboard.includes('${daDashboard()}'));
assert(!dashboard.includes('${bpDashboard()}'));assert(!dashboard.includes('${dxDashboardCharts()}'));assert(!dashboard.includes('直投项目区域分布'));
assert(!experience.includes('<h2>直投项目区域分布</h2>'));
const index=fs.readFileSync(__dirname+'/index.html','utf8');assert(index.indexOf('dashboard-analysis.js')<index.indexOf('src="experience.js'));
const css=fs.readFileSync(__dirname+'/dashboard-analysis.css','utf8');assert(css.includes('.dv-comparison-panel>.dx-panel-head h2{font-size:25px;line-height:1.5}'));
console.log('dashboard analysis: object-first navigation, one dimension at a time, all tab combinations, filter reset, separate fund/deal/enterprise populations, removed direct-region chart including export, matching heading size and renamed AI entry OK');
