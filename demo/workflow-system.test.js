const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const fields={
  region:[{key:'asOf',required:true},{key:'annualPlan',required:true},{key:'annualInvestPlan',required:true},{key:'newFunds',required:true},{key:'newDeals',required:true},{key:'risk',required:true},{key:'summary',required:true},{key:'evidence',required:true}],
  fund:[{key:'asOf',required:true},{key:'committed',required:true},{key:'paid',required:true},{key:'risk',required:true},{key:'summary',required:true},{key:'evidence',required:true}],
  project:[{key:'asOf',required:true},{key:'operatingStatus',required:true},{key:'milestone',required:true},{key:'risk',required:true},{key:'evidence',required:true}]
};
const data={region:{asOf:'2026-09-30',annualPlan:'10',annualInvestPlan:'8',newFunds:'1',newDeals:'1',risk:'无',summary:'区域进展',evidence:'区域季报'},fund:{asOf:'2026-09-30',committed:'5',paid:'2',risk:'正常',summary:'本期投资进展',evidence:'基金季报'},project:{asOf:'2026-09-30',operatingStatus:'正常',milestone:'取得新订单',risk:'无',evidence:'项目季报'}};
const rows=[];
const elements={fsRoot:{innerHTML:''},fsContent:{insertAdjacentHTML(){}},fsNotice:{textContent:'',hidden:false},fsOpinion:{value:''},fsForm:{elements:{namedItem:key=>({value:data[currentType][key]??''})}}};
let currentType='fund',syncs=0;
const context=vm.createContext({
  window:{addEventListener(){},confirm(){return true}},
  document:{getElementById:id=>elements[id]||null,addEventListener(){}},
  dxRegions:[{id:'shenzhen',name:'深圳区域母基金'}],
  dxFunds:[{id:'fund-1',name:'基金 A',region:'shenzhen',manager:'机构 A'}],
  dxDeals:[{id:'project-1',name:'项目 A',region:'shenzhen'}],
  dxRegion:id=>({id,name:'深圳区域母基金'}),
  dxMoney:n=>Number(n).toFixed(2),
  wbRecords:rows,
  wbPersist:()=>true,
  wbRead:()=>[],
  wbStoreKey:'diki-public-demo-reporting-v1',
  wbSyncPaths:()=>{syncs++},
  wbId:prefix=>`${prefix}-${rows.length+1}`,
  wbNow:()=>`2026-10-19 10:0${rows.length}:00`,
  wbFields:type=>fields[type],
  wbDefaultValues:type=>data[type],
  wbValidate:(type,values)=>fields[type].find(field=>field.required&&!String(values[field.key]??'').trim())?.key||'',
  wbE:value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  URLSearchParams,Date,Math
});
vm.runInContext(fs.readFileSync('demo/workflow-system.js','utf8'),context);
const run=code=>vm.runInContext(code,context);
const setAccount=id=>run(`fsState.account='${id}';fsState.selected=fsRows()[0]?.id||null;fsRender()`);

setAccount('region-reviewer');run("fsPublish('fund')");
assert.equal(rows[0].status,'assigned');
assert.ok(elements.fsRoot.innerHTML.includes('区域母基金管理工作台'));
setAccount('fund-reporter');
assert.ok(elements.fsRoot.innerHTML.includes('子基金报送工作台'));
run('fsSave(true)');assert.equal(rows[0].status,'internal_review');
setAccount('region-reviewer');assert.equal(run('fsCanExternalReview(fsRows()[0])'),false);
assert.ok(!run('fsDetail(fsRows()[0])').includes('本期投资进展'));
setAccount('fund-leader');assert.equal(run('fsCanInternalReview(fsRows()[0])'),true);
run('fsDecision(true)');assert.equal(rows[0].status,'submitted');
setAccount('region-reviewer');assert.equal(run('fsCanExternalReview(fsRows()[0])'),true);
run('fsDecision(true)');assert.equal(rows[0].status,'confirmed');assert.equal(syncs,1);
assert.equal(rows[0].history.length,4);

setAccount('national-reviewer');run("fsPublish('region')");
assert.equal(rows[1].type,'region');
currentType='region';setAccount('region-reporter');run('fsSave(true)');
setAccount('region-leader');run('fsDecision(true)');
setAccount('national-reviewer');assert.equal(run('fsCanExternalReview(fsRows()[0])'),true);
run('fsDecision(true)');assert.equal(rows[1].status,'confirmed');

setAccount('region-reviewer');run("fsPublish('project')");
currentType='project';setAccount('project-reporter');run('fsSave(true)');
setAccount('project-leader');elements.fsOpinion.value='请补充依据';run('fsDecision(false)');
assert.equal(rows[2].status,'returned_internal');
setAccount('project-reporter');run('fsSave(true)');
setAccount('project-leader');run('fsDecision(true)');
setAccount('region-reviewer');elements.fsOpinion.value='请更新风险说明';run('fsDecision(false)');
assert.equal(rows[2].status,'returned_external');
setAccount('project-reporter');run('fsSave(true)');
setAccount('project-leader');run('fsDecision(true)');
setAccount('region-reviewer');run('fsDecision(true)');assert.equal(rows[2].status,'confirmed');
run('fsReset()');assert.equal(rows.length,0);
console.log('workflow-system: fund, region, project approval and return paths OK');
