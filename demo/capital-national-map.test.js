const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const listeners={};const ctx=vm.createContext({console,labels:{},renderers:{},document:{addEventListener:(name,cb)=>(listeners[name]??=[]).push(cb),getElementById:()=>null,querySelector:()=>null},localStorage:{getItem:()=>null},escapeHTML:v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),host:()=>({innerHTML:''})});const run=s=>vm.runInContext(s,ctx);
for(const file of ['source-data.js','scenario-data.js','experience.js','dashboard-visuals.js','capital-network.js','capital-map-interactions.js','capital-map-drilldown.js','capital-national-data.js','capital-national-map.js']){let code=fs.readFileSync(__dirname+'/'+file,'utf8');if(file==='experience.js')code=code.replace(/\nrenderDxDashboard\(\);\s*$/,'');run(code)}
const click=dataset=>{const b={dataset};for(const cb of listeners.click||[])cb({target:{closest:selector=>selector.includes('data-nm-')?b:null}})};
assert.equal(run('nmProvinces.length'),35);for(const name of ['新疆维吾尔自治区','西藏自治区','台湾省','香港特别行政区','澳门特别行政区','海南省'])assert.ok(run('nmProvinces.some(p=>p.name==='+JSON.stringify(name)+')'));
assert.equal(run("nmProvince('深圳').name"),'广东省');assert.equal(run("nmProvince('成都').name"),'四川省');assert.equal(run("nmProvince('北京').name"),'北京市');assert.equal(run("nmProvince('不存在的城市')"),null);
assert.equal(run('nmModel().funds.length'),42);assert.equal(run('nmModel().deals.length'),48);assert.equal(run('nmModel().entities.length'),58);
const original=run('JSON.stringify({dxFunds,dxDeals,dxPaths})');
const html=run("nmMap('shenzhen')");assert.ok(html.includes('南海诸岛'));assert.ok(html.includes('01 国家母基金'));assert.ok(html.includes('nm-province'));assert.ok(!html.includes('80°E'));
click({nmProvince:'440000'});assert.ok(run('nmPopup(nmModel())').includes('广东省'));assert.ok(run('nmPopup(nmModel())').includes('深圳'));assert.equal(run('nmState.city'),'');click({nmAction:'close'});assert.equal(run('nmState.province'),'');
click({nmRegion:'shenzhen'});assert.equal(run('nmState.region'),'shenzhen');assert.equal(run('nmModel().funds.length'),34);assert.equal(run('nmModel().deals.length'),38);assert.equal(run('nmModel().entities.length'),48);
click({nmCity:'深圳'});assert.ok(run('nmPopup(nmModel())').includes('子基金'));assert.ok(run("nmMap('shenzhen')").includes('data-nm-city="深圳"'));
const fund=run('nmScope().funds.find(f=>nmScope().paths.some(p=>p.fundId===f.id))');click({nmAction:'fund',id:fund.id});assert.equal(run('nmState.fund'),fund.id);assert.equal(run('nmModel().funds.length'),1);assert.equal(run('nmModel().deals.length'),0);assert.ok(run('nmModel().entities.length')>0);assert.ok(run('nmModel().paths.every(p=>p.fundId===nmState.fund)'));
const city=run('nmModel().cities.find(c=>c.entities.length).city');click({nmCity:city});assert.ok(run('nmPopup(nmModel())').includes('查看关联'));
const entity=run('nmModel().cities.find(c=>c.city===nmState.city).entities[0].name');click({nmAction:'entity',name:entity});assert.equal(run('nmState.entity'),entity);assert.ok(run('nmPopup(nmModel())').includes('全国关联'));assert.ok(run('nmBreadcrumb()').includes('04 '));assert.ok(run('nmRoutes(nmModel())').includes('nm-route'));
click({nmAction:'up-fund'});assert.equal(run('nmState.entity'),'');assert.equal(run('nmState.fund'),fund.id);
click({nmAction:'up-region'});assert.equal(run('nmState.fund'),'');assert.equal(run('nmState.region'),'shenzhen');assert.equal(run('nmModel().funds.length'),34);
click({nmAction:'branch',branch:'direct'});assert.equal(run('nmModel().funds.length'),0);assert.equal(run('nmModel().paths.length'),0);assert.equal(run('nmModel().entities.length'),37);
click({nmAction:'national'});assert.equal(run('nmState.region'),'');assert.equal(run('nmModel().entities.length'),58);assert.deepEqual(run('JSON.stringify({dxFunds,dxDeals,dxPaths})'),original);
click({nmRegion:'shenzhen'});click({nmAction:'fund',id:'nonexistent'});assert.equal(run('nmState.fund'),'');
const empty=run('nmScope().funds.find(f=>!nmScope().paths.some(p=>p.fundId===f.id))');click({nmAction:'fund',id:empty.id});assert.equal(run('nmModel().entities.length'),0);assert.equal(run('nmModel().paths.length'),0);
assert.ok(run("nmMap('shenzhen')").includes('尚无底层项目关系资料'));
run("nmReset();dxDeals.push({id:'UNKNOWN-CITY',region:'shenzhen',name:'未知所在地企业',place:'待补充',sector:'其他',request:0},{id:'XSS',region:'shenzhen',name:'<script>bad</script>',place:'深圳',sector:'其他'});dxPaths.push({kind:'indirect',fundId:dxFunds[0].id,region:'shenzhen',enterprise:'未知所在地企业',place:'广东省深圳市',invest:1})");assert.ok(run("nmModel().unmapped.some(c=>c.city==='注册地待核'&&c.entities.some(e=>e.name==='未知所在地企业'))"));assert.ok(!run("nmEntityPanel(nmModel().entities.find(e=>e.name==='<script>bad</script>'))").includes('<script>bad'));
run("nmState.city='深圳';nmState.page=99");assert.ok(!run('nmPopup(nmModel())').includes('100/'));
for(const p of ['北京','深圳','成都','呼和浩特']){const point=run('nmProject(cmCities['+JSON.stringify(p)+'])');assert.ok(point.x>=0&&point.x<=1000&&point.y>=0&&point.y<=625)}
run("nmState.focus=true");const v=run('nmView(nmModel())');assert.ok(Number.isFinite(v.x)&&v.w>=240&&v.h>=240);
assert.ok(fs.readFileSync('demo/index.html','utf8').includes('capital-national-map.js'));
console.log('National map: 35 geometry features, 42/48/58 counts, regional/fund/enterprise navigation, source chains, zero-path funds, unknown/conflicting places, no registry mutations and escaping passed.');
