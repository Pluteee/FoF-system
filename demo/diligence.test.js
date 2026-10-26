const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const listeners={};
const context=vm.createContext({
 console,Date,JSON,localStorage:{getItem(){return null},setItem(){}},
 document:{addEventListener(name,callback){listeners[name]=callback}},
 escapeHTML:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),
 renderWbAi(){},renderers:{},wbNow:()=> '2026-10-20 12:00',
});
vm.runInContext(fs.readFileSync(__dirname+'/diligence.js','utf8'),context);
const run=code=>vm.runInContext(code,context);
run(`const testCase={id:'test',type:'fund',name:'测试基金',owner:'负责人',scope:'测试范围',asOf:'2026-09-30',revision:1,materials:{},checks:{},issues:[],questions:[],reports:[],log:[],baseline:{facts:[{text:'演示样本申请额1亿元',source:'演示样本，非已投'}],gaps:['缺少审计资料']}}`);
assert.equal(run('Object.keys(ddConfig).length'),4);
assert.equal(run('ddMaterials(testCase).length'),16);
assert.equal(run('ddStats(testCase).missing'),16);
run(`const report=ddBuildReport(testCase);testCase.reports.push(report);`);
assert.equal(run('report.version'),1);
assert.match(run('ddReportText(report)'),/不是投决通过意见/);
assert.match(run('ddReportText(report)'),/材料缺口/);
assert.equal(run('report.snapshot.materials.length'),16);
run(`testCase.materials.g0m0={status:'已核验',excerpt:'证据摘录',locator:'第1页'};testCase.checks.g0={status:'已核实',finding:'已记录',refs:['g0m0']};`);
assert.equal(run('ddStats(testCase).verified'),1);
assert.equal(run('report.stats.verified'),0);
run(`ddInvalidate(testCase,'g0m0')`);
assert.equal(run('ddCheck(testCase)[0].status'),'待核查');
assert.equal(run('report.snapshot.checks[0].status'),'待核查');
assert.match(run(`ddAsk(testCase,'基金治理与策略应核查什么？')`),/规则式研究提纲/);
run(`testCase.name='<script>alert(1)</script>';const escapedReport=ddBuildReport(testCase);`);
assert(!run('ddReportPreview(escapedReport)').includes('<script>'));
assert(run('ddReportPreview(escapedReport)').includes('&lt;script&gt;'));
console.log('diligence: templates, source boundaries, missing evidence, report snapshots, evidence invalidation, research and escaping OK');
