const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context=vm.createContext({document:{addEventListener(){}},console});
for(const f of ['source-data.js','scenario-data.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),context);
const run=s=>vm.runInContext(s,context);
run(`const wbRecords=[];const dxRegions=[{id:'shenzhen',city:'深圳'},{id:'shanghai',city:'上海'},{id:'beijing',city:'北京'}];
const dxDeals=[...sourceWorkbook.deals.map(d=>({...d,region:'shenzhen'})),...demoScenario.deals];const dxPaths=demoScenario.paths;
const dxDealCompany=s=>s.replace(/（第二轮）$/,'');`);
vm.runInContext(fs.readFileSync(__dirname+'/bottom-profile.js','utf8'),context);
assert.equal(run('bpRows().length'),21);
assert.equal(run('bpForRegion(bpRows(),"shenzhen").filter(r=>r.name.includes("澜图")).length'),1);
assert(run('dxRegions.reduce((n,r)=>n+bpForRegion(bpRows(),r.id).length,0)')>21);
assert.equal(run('bpProfile("鹏湾低空传感（演示）").valuation'),null);
assert.equal(run('bpProfile("光栅通信（演示）").valuation'),null);
assert.equal(run('bpProfile("芯程微纳（演示）").round'),'未披露');
assert.equal(run('bpValidDate("2026-02-30")'),false);
assert.equal(run('bpValidDate("2026-09-30")'),true);
for(const [value,bucket] of [[null,'未披露'],['','未披露'],[undefined,'未披露'],[NaN,'未披露'],[-1,'未披露'],[0,'1亿以下'],[.99,'1亿以下'],[1,'1—5亿'],[5,'5—10亿'],[10,'10—30亿'],[30,'30亿及以上']]){
 context.boundary=value;assert.equal(run('bpValueBucket(boundary)'),bucket);
}
run(`bpState.scope='all'`);assert.equal(run('bpRows().length'),58);
assert.equal(run('bpRows().filter(r=>r.name==="演示·青屿科技").length'),1);
assert.equal(run('bpProfile("演示·青屿科技").valuation'),null);
run(`wbRecords.push({id:'draft',type:'project',target:'DI01',period:'2026-Q3',version:1,status:'draft',values:{valuation:'990000',valuationDate:'2026-09-30',valuationBasis:'投后估值'}})`);
assert.equal(run('bpProfile("演示·青屿科技").valuation'),null);
run(`wbRecords[0].status='confirmed';wbRecords[0].id='confirmed'`);
assert.equal(run('bpProfile("演示·青屿科技").valuation'),99);
assert.equal(run('bpProfile("演示·青屿科技").reportId'),'confirmed');
run(`wbRecords[0].values.valuationBasis='投前估值'`);assert.equal(run('bpProfile("演示·青屿科技").valuation'),null);
run(`wbRecords[0].confirmedSnapshot={fields:{valuation:0,valuationDate:'2026-09-30',valuationBasis:'投后'}}`);
assert.equal(run('bpProfile("演示·青屿科技").valuation'),0);
run(`bpState.scope='indirect'`);
for(const dimension of ['round','valuation']){
 context.dimension=dimension;
 assert.equal(run('bpGroup(bpRows(),dimension,dimension==="round"?bpRounds:bpValues).reduce((s,g)=>s+g.count,0)'),21);
}
console.log('bottom profiles: regional/global company deduplication, round and valuation gaps, exact interval boundaries, no financing-value inference, confirmed snapshot priority, units and draft isolation OK');
