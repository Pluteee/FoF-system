const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const reports=[],storage=new Map();
const ctx=vm.createContext({
 console,document:{addEventListener(){}},fsRender(){},fsRegion:{id:'shenzhen'},
 fsRows:()=>reports,fsRelevant:r=>r.region==='shenzhen',fsState:{tab:'dashboard'},
 localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)}
});
vm.runInContext(fs.readFileSync(__dirname+'/workflow-lifecycle.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
assert.equal(run('lcGroups.length'),5);
assert(!run('lcGroups.flatMap(g=>g.tabs).some(([id])=>id==="home")'));
for(const [tab,group] of [['dashboard','overview'],['fundraising','raise'],['pipeline','invest'],['reporting','manage'],['collab','manage'],['exits','exit']]){
 run(`fsState.tab=${JSON.stringify(tab)}`);assert.equal(run('lcGroup().id'),group);
}
const row=(id,period,version,amount,status='confirmed')=>({id,region:'shenzhen',type:'fund',target:'SF01',status,period,version,details:{exits:[{enterprise:'测试企业',date:'2026-08-01',amount,round:'股权转让',ref:'凭证1'}]}});
reports.push(row('q1','2026-Q3',1,.1),row('q2','2026-Q3',2,.2),row('draft','2026-Y',3,99,'draft'));
assert.equal(run('lcConfirmedExits().length'),1);
assert.equal(run('lcConfirmedExits()[0].amount'),.2);
reports.push(row('annual','2026-Y',1,.3));
assert.equal(run('lcConfirmedExits().length'),1);
assert.equal(run('lcConfirmedExits()[0].amount'),.3);
run(`lcPlanSave({id:'p1',region:'shenzhen',expected:1,logs:[]})`);
assert.equal(run('lcPlans().length'),1);
assert.equal(run('lcConfirmedExits()[0].amount'),.3);
console.log('lifecycle: navigation groups, task removal, report versions, annual/quarter deduplication and plan/receipt separation OK');
