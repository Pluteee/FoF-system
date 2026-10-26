'use strict';
// The workbook is assigned to the Shenzhen regional fund per the user's data description.
// Its title and registration-place columns do not determine regional-fund ownership.
labels.region='区域母基金';
labels.funds='子基金';
labels.projects='直投项目';
labels.lookthrough='穿透管理';

const coreRegions=[
  {id:'shenzhen',city:'深圳',label:'演示·鹏湾区域母基金',hasWorkbook:true,source:'source-data.js'},
  {id:'shanghai',city:'上海',label:'演示·申澜区域母基金',hasWorkbook:false,source:'scenario-data.js'},
  {id:'beijing',city:'北京',label:'演示·燕序区域母基金',hasWorkbook:false,source:'scenario-data.js'}
];
const coreState={region:'shenzhen',regionTab:'overview',fundQuery:'',fundSector:'全部',fundPlace:'全部',fundSort:'source',dealQuery:'',dealSector:'全部',dealPlace:'全部',dealSort:'source',lookQuery:'',lookRegion:'全部',lookSector:'全部'};
const coreRegion=()=>coreRegions.find(x=>x.id===coreState.region);
const coreFunds=()=>coreRegion().hasWorkbook?sourceWorkbook.funds:demoScenario.funds.filter(x=>x.region===coreState.region);
const coreDeals=()=>coreRegion().hasWorkbook?sourceWorkbook.deals:demoScenario.deals.filter(x=>x.region===coreState.region);
const coreMoney=n=>Number(n).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:4});
const coreSum=(rows,key)=>rows.reduce((total,row)=>total+(Number(row[key])||0),0);
const coreCompany=name=>name.replace(/（第二轮）$/,'');
const workbookHref='source-data.js';
const coreProfileKey='diki-public-fof-regional-profile-v2';
const coreReviewKey='diki-public-fof-core-review-v1';
let coreProfiles={},coreReviews={};
try{coreProfiles=JSON.parse(localStorage.getItem(coreProfileKey)||'{}')||{}}catch{coreProfiles={}}
try{coreReviews=JSON.parse(localStorage.getItem(coreReviewKey)||'{}')||{}}catch{coreReviews={}}
const coreProfileFor=id=>({...demoScenario.regions[id],...Object.fromEntries(Object.entries(coreProfiles[id]||{}).filter(([,v])=>v!==''&&v!=null))});
const coreProfile=()=>coreProfileFor(coreState.region);
const coreProvenance=()=>coreRegion().hasWorkbook?'原始 Excel · 立项/申请':'模拟数据 · 非实际投资';
const coreRecordSource=x=>x.row?coreSource(x.id.startsWith('SF')?'子基金':'直投项目',x.row):'<span class="core-demo-badge">模拟数据</span>';
const coreSource=(sheet,row)=>`<a class="core-source" href="${workbookHref}" target="_blank" rel="noopener">Excel · ${sheet}!A${row}:G${row} ↗</a>`;
const coreHeader=(kicker,title,description,meta='')=>`<div class="core-header"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${description}</p></div><div class="core-date">${meta}</div></div>`;
const corePanel=(eyebrow,title,description,body,action='')=>`<section class="core-panel"><div class="core-panel-head"><div><small>${eyebrow}</small><h2>${title}</h2>${description?`<p>${description}</p>`:''}</div>${action}</div>${body}</section>`;
const coreMetric=(label,value,unit,description)=>`<div class="core-metric"><span>${label}</span><strong>${value}<small>${unit}</small></strong><p>${description}</p></div>`;
const coreLink=(view,label)=>`<button class="core-arrow" data-core-view="${view}">${label} <span>↗</span></button>`;
const coreEmpty=message=>`<div class="core-empty">${message}</div>`;
const coreMissing=()=>'<span class="core-na">待接入</span>';
const coreCaveat=message=>`<div class="core-caveat"><span>口径说明</span><p>${message}</p><a href="${workbookHref}" target="_blank" rel="noopener">深圳原始 Excel ↗</a></div>`;
const coreRegionSwitch=()=>`<div class="core-region-switch" role="tablist" aria-label="区域母基金">${coreRegions.map(r=>`<button type="button" role="tab" aria-selected="${r.id===coreState.region}" class="${r.id===coreState.region?'selected':''}" data-core-region="${r.id}"><b>${r.city}</b><span>${r.hasWorkbook?'深圳演示样本 + 演示档案':'演示业务档案'}</span></button>`).join('')}</div>`;
const coreTabs=()=>`<div class="core-detail-tabs" role="tablist">${[['overview','区域总览'],['capital','出资与资金'],['investment','投资布局'],['governance','治理与履约'],['reporting','报送与风险']].map(([id,name])=>`<button role="tab" aria-selected="${coreState.regionTab===id}" class="${coreState.regionTab===id?'selected':''}" data-core-tab="${id}">${name}</button>`).join('')}</div>`;
const coreField=(label,value,source='待补档')=>`<div><span>${label}</span><b>${value?escapeHTML(value):coreMissing()}</b><small>${value?source:'未从演示样本获得'}</small></div>`;
const coreReviewBadge=id=>coreReviews[id]?.status?`<span class="core-review-badge">${escapeHTML(coreReviews[id].status)}</span>`:'';
const coreReviewForm=id=>`<div class="core-review"><h3>资料核对记录 <small>只保存在本机浏览器，不修改演示样本</small></h3><div class="core-review-row"><label>核对状态<select id="coreReviewStatus">${['待核对','已核对演示样本','待补材料'].map(x=>`<option ${(coreReviews[id]?.status||'待核对')===x?'selected':''}>${x}</option>`).join('')}</select></label><label>核对备注<input id="coreReviewNote" maxlength="200" value="${escapeHTML(coreReviews[id]?.note||'')}" placeholder="记录缺失材料或核对发现"></label><button class="primary" data-core-review="${id}">保存记录</button></div></div>`;
const coreOptions=(items,active)=>['全部',...new Set(items)].map(x=>`<option value="${escapeHTML(x)}" ${x===active?'selected':''}>${escapeHTML(x)}</option>`).join('');

function coreDealGroups(rows){
  const groups=new Map();
  rows.forEach(row=>{const key=coreCompany(row.name);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row)});
  return groups;
}
function coreIndustry(rows,key){
  const bySector=new Map();
  rows.forEach(x=>bySector.set(x.sector,(bySector.get(x.sector)||0)+x[key]));
  const sorted=[...bySector].sort((a,b)=>b[1]-a[1]).slice(0,5),max=sorted[0]?.[1]||1;
  return sorted.map(([name,value])=>`<div class="core-bar"><span title="${escapeHTML(name)}">${escapeHTML(name)}</span><div><i style="width:${Math.max(3,value/max*100)}%"></i></div><b>${coreMoney(value)}</b></div>`).join('')||coreEmpty('当前区域尚无可计算的投资清单');
}
function coreRegionCards(){
  return `<div class="core-three">${coreRegions.map(r=>`<button class="core-region-card" data-core-open-region="${r.id}"><span class="core-region-index">${r.city}</span><h3>${r.label}</h3><p>${r.hasWorkbook?'34 支子基金立项、38 笔直投申请为独立生成的虚构记录；资金与穿透关系为演示。':'资金、子基金、直投及穿透路径均为演示数据，供展示流程与交互。'}</p><div class="core-region-footer"><span>${r.hasWorkbook?'演示样本截至 2026-09-30':'演示数据 · 待真实台账替换'}</span><b>查看档案 →</b></div></button>`).join('')}</div>`;
}
function coreRegionComparison(){
  return corePanel('REGIONAL COMPARISON','三地区域基金比较','公开名称和地域入口与演示运营数据分开。此表里的资金、阶段、报送日都是情景模拟，不可用于真实绩效排名。',
    table(['城市 / 基金名称','运作阶段','投资策略','国家基金实缴','子基金 / 直投','数据属性'],coreRegions.map(r=>{
      const p=coreProfileFor(r.id);
      return `<tr><td><button class="link" data-core-open-region="${r.id}">${r.city} · ${r.label}</button></td><td>${escapeHTML(p.phase)}</td><td>${escapeHTML(p.strategy)}</td><td>${coreMoney(p.paid)} 亿 <span class="core-demo-badge">模拟</span></td><td>${r.hasWorkbook?'34 支立项 / 38 笔申请':'3 支 / 3 笔 · 模拟'}</td><td>${r.hasWorkbook?'深圳 Excel + 演示档案':'全业务演示数据'}</td></tr>`;
    })));
}
function renderCoreDashboard(){
  const fs=sourceWorkbook.funds,ds=sourceWorkbook.deals;
  host('dashboard').innerHTML=`${coreHeader('DIKI·FoF / REGIONAL OVERVIEW','三只区域母基金','深圳、上海、北京三地入口，对应粤港澳大湾区、长三角、京津冀三只正式命名的区域基金。','1 地原始清单 · 2 地演示台账')}
    ${coreRegionCards()}
    <div class="core-path"><span>国家创业投资引导基金</span><i>→</i>${coreRegions.map(r=>`<button data-core-open-region="${r.id}">${r.city} · ${r.label}</button>`).join('<span>/</span>')}<i>→</i><span>子基金 / 区域直投 → 企业</span></div>
    ${coreCaveat('深圳 Excel 整体作为鹏湾区域母基金（演示）的立项/申请资料；投资对象注册地不决定区域归属。上海、北京业务台账和三地资金、子基金底层投资关系均为演示数据。深圳演示样本金额列未标单位，页面暂按亿元排版，不能视作正式披露。')}
    <div class="core-metrics">${coreMetric('区域母基金',3,'只','三只公开命名基金')}${coreMetric('虚构立项清单',1,'地','仅深圳；非运营报表')}${coreMetric('深圳子基金立项',fs.length,'支','原始工作表')}${coreMetric('深圳直投申请',ds.length,'笔',coreDealGroups(ds).size+' 家去重企业')}</div>
    <div class="core-two">${corePanel('深圳 / INVESTMENT ENTRY','深圳区域当前可见的投资清单','仅列演示样本申请与拟设规模，不代表已投或已支付。',`<div class="core-region-facts"><span>子基金申请出资 <b>${coreMoney(coreSum(fs,'request'))}</b></span><span>直投申请出资 <b>${coreMoney(coreSum(ds,'request'))}</b></span><span>区域基金实缴 <b>真实凭证待接入</b></span></div>`,coreLink('region','查看深圳区域档案'))}
      ${corePanel('DATA COVERAGE','演示资料与业务口径','领导看到的数字必须能追溯来源。',`<div class="core-status-list"><div><b>原始</b><span>深圳子基金 34 支立项、直投 38 笔申请</span></div><div><b>演示</b><span>三地资金状态、上海/北京台账、底层投资路径</span></div><div><b>待核</b><span>真实协议、实缴、GP 底层报送、交割和投后收益</span></div></div>`,coreLink('lookthrough','查看穿透演示'))}</div>
    ${coreRegionComparison()}
    <div class="core-two">${corePanel('子基金 / SUB-FUNDS','深圳区域子基金布局','按基金总规模展示行业结构；金额单位暂按亿元。',coreIndustry(fs,'size'),coreLink('funds','打开子基金台账'))}
      ${corePanel('直投 / DIRECT DEALS','深圳区域直投申请','按申请出资额展示行业结构；金额单位暂按亿元。',coreIndustry(ds,'request'),coreLink('projects','打开直投台账'))}</div>`;
}
function coreOverview(){
  const p=coreProfile(),fs=coreFunds(),ds=coreDeals(),has=coreRegion().hasWorkbook;
  return `<div class="core-profile-banner"><div><small>区域档案 / ${coreRegion().city}</small><h2>${escapeHTML(coreRegion().label)}</h2><p>基金公开名称已核对；城市是入口，不是基金名称。<a href="${coreRegion().source}" target="_blank" rel="noopener" style="color:#bcdcff">查看公开来源 ↗</a></p></div><button class="ghost" data-core-edit-profile>调整演示档案</button></div>
    <div class="core-fields">${coreField('基金公开名称',coreRegion().label,'公开资料')}${coreField('区域管理机构',p.manager,'公开资料/本机补录')}${coreField('出资人结构',p.investors,'模拟')}${coreField('投资策略',p.strategy,'模拟')}${coreField('设立日期',p.established,'演示日期，待核')}${coreField('运作阶段',p.phase,'模拟')}</div>
    <div class="core-metrics">${coreMetric('国家基金认缴',coreMoney(p.commitment),'亿元','演示数据 · 非实际出资')}${coreMetric('国家基金实缴',coreMoney(p.paid),'亿元','演示数据 · 非实际支付')}${coreMetric(has?'子基金立项':'子基金演示',fs.length,'支',has?'原始清单；非已投':'模拟台账')}${coreMetric(has?'直投申请':'直投演示',ds.length,'笔',has?'原始清单；非已交割':'模拟台账')}</div>
    <div class="core-two">${corePanel('投资结构','区域基金的两个投资入口','虚构申请额与演示资金流分别核算，不互相抵扣。',`<div class="core-lane"><b>国家基金 → ${coreRegion().label}</b><p>演示认缴 ${coreMoney(p.commitment)} 亿元 / 实缴 ${coreMoney(p.paid)} 亿元；凭证待接入。</p></div><div class="core-lane"><b>区域母基金 → 子基金</b><p>${fs.length} 支${has?'演示样本立项':'模拟子基金'}；${has?'申请':'演示拟出资'} ${coreMoney(coreSum(fs,'request'))} 亿元。</p></div><div class="core-lane"><b>区域母基金 → 直投企业</b><p>${ds.length} 笔${has?'演示样本申请':'模拟直投'}；${has?'申请':'演示拟出资'} ${coreMoney(coreSum(ds,'request'))} 亿元。</p></div>`)}
      ${corePanel('区域管理','领导层面需要关注的事项','根据设计文档的区域母基金档案结构。',`<div class="core-status-list"><div><b>投资计划</b><span>${escapeHTML(p.annualInvestPlan)} 亿元（模拟）</span></div><div><b>出资计划</b><span>${escapeHTML(p.annualPlan)} 亿元（模拟）</span></div><div><b>治理</b><span>董事会、合伙人会议及国家基金权利：待接入</span></div><div><b>运营</b><span>管理费、预算、收益分配、延期和重大变更：待接入</span></div><div><b>报告</b><span>定期、审计、托管报告及整改：待接入</span></div></div>`)}</div>`;
}
function coreCapital(){
  const p=coreProfile(),has=coreRegion().hasWorkbook;
  return `<div class="core-caveat"><span>演示资金</span><p>以下认缴、实缴、年度计划均为展示情景；深圳 Excel 未包含国家基金到区域基金的资金流水。真实金额须以协议、银行回单与托管对账替换。</p></div>
    <div class="core-metrics">${coreMetric('国家基金认缴',coreMoney(p.commitment),'亿元','模拟')}${coreMetric('国家基金实缴',coreMoney(p.paid),'亿元','模拟')}${coreMetric('年度出资计划',coreMoney(p.annualPlan),'亿元','模拟')}${coreMetric('未缴承诺',coreMoney(Number(p.commitment)-Number(p.paid)),'亿元','由模拟数据计算')}</div>
    ${corePanel('资金流 / 国家 → 区域','五步证据链','阶段节点为流程设计，不表示已经发生。',`<div class="core-capital-steps">${[['承诺','出资协议'],['通知','缴款通知'],['审批','授权与审批'],['支付','银行回单'],['到账','托管与财务确认']].map(([stage,evidence],i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><b>${stage}</b><small>${evidence}</small><em>真实凭证待接入</em></div>`).join('')}</div>`)}
    <div class="core-two">${corePanel('区域基金 → 子基金',has?'演示样本申请额':'模拟拟出资','与实际缴款分开。',`<div class="core-region-facts"><span>${has?'申请出资':'演示拟出资'} <b>${coreMoney(coreSum(coreFunds(),'request'))} 亿</b></span><span>协议认缴 <b>待接入</b></span><span>实际支付 <b>待接入</b></span></div>`)}
    ${corePanel('区域基金 → 直投企业',has?'演示样本申请额':'模拟拟出资','融资规模不等于基金实际投资。',`<div class="core-region-facts"><span>${has?'申请出资':'演示拟出资'} <b>${coreMoney(coreSum(coreDeals(),'request'))} 亿</b></span><span>交割凭证 <b>待接入</b></span><span>实际支付 <b>待接入</b></span></div>`)}</div>`;
}
function coreInvestment(){
  const fs=coreFunds(),ds=coreDeals(),has=coreRegion().hasWorkbook;
  return `<div class="core-caveat"><span>${has?'虚构申请清单':'模拟投资清单'}</span><p>${has?'深圳 Excel 全表归属本区域；注册地不决定区域归属。金额单位待核，申请不等于已投。':'本区域子基金与项目均是演示记录，名称、金额及状态不得作为真实披露。'}</p></div>
    <div class="core-metrics">${coreMetric(has?'子基金立项':'演示子基金',fs.length,'支',has?'演示样本':'模拟')}${coreMetric(has?'申请出资':'演示拟出资',coreMoney(coreSum(fs,'request')),'亿元',has?'不是实缴':'模拟')}${coreMetric(has?'直投申请':'演示直投',ds.length,'笔',has?'演示样本':'模拟')}${coreMetric(has?'申请出资':'演示拟出资',coreMoney(coreSum(ds,'request')),'亿元',has?'不是交割':'模拟')}</div>
    <div class="core-two">${corePanel('子基金组合','策略与管理人布局',has?'可追溯原始工作表。':'来自演示台账。',coreIndustry(fs,'request'),coreLink('funds','打开子基金台账'))}
    ${corePanel('直投组合','行业与项目布局',has?'演示样本为申请口径。':'来自演示台账。',coreIndustry(ds,'request'),coreLink('projects','打开直投台账'))}</div>
    ${corePanel('穿透管理','底层企业与多条投资路径','下方为展示情景；深圳演示子基金底层项目尚未报送。',`<div class="core-checkgrid"><div><b>企业去重</b><p>把多轮次和多区域路径汇成唯一企业。</p><em>演示</em></div><div><b>直接与间接</b><p>分别标记区域直投与子基金底层投资。</p><em>演示</em></div><div><b>交叉暴露</b><p>同一企业被多个区域触达时提示协同核查。</p><em>演示</em></div><div><b>测算边界</b><p>模拟份额乘子基金投入，仅作方法演示。</p><em>非真实敞口</em></div></div>`,coreLink('lookthrough','查看穿透路径'))}`;
}
function coreGovernance(){
  return `${corePanel('治理机制','国家基金权利与区域基金自主权','会议、重大事项、协议义务和决议条件应挂在同一只区域基金档案下。',`<div class="core-checkgrid"><div><b>出资人及协议</b><p>出资人结构、管理协议、补充协议、授权边界。</p><em>材料待接入</em></div><div><b>董事会 / 合伙人会</b><p>议题、资料、回避、表决、不同意见、决议。</p><em>材料待接入</em></div><div><b>重大事项</b><p>延期、策略调整、关键人员变更、重大投资和风险请示。</p><em>材料待接入</em></div><div><b>决议条件</b><p>将投委会附带条件关联到出资条件检查与执行记录。</p><em>材料待接入</em></div></div>`)}
    <div class="core-two">${corePanel('履约评价','区域管理机构履职画像','不是只看短期收益，还需记录策略兑现与受托管理质量。',`<div class="core-status-list"><div><b>投前</b><span>设立方案、年度计划、管理人团队与策略</span></div><div><b>运营</b><span>报送及时性、费用预算、管理费、沟通和问题整改</span></div><div><b>投后</b><span>组合质量、风险处置、收益分配和退出安排</span></div></div>`)}
    ${corePanel('治理台账','会议与决策记录','演示阶段不虚构会议或待办；从正式材料导入后形成闭环。',coreEmpty('尚未接入董事会、合伙人会议及重大事项记录'))}</div>`;
}
function coreReporting(){
  const p=coreProfile(),has=coreRegion().hasWorkbook;
  return `<div class="core-caveat"><span>报送口径</span><p>深圳虚构立项表截至 2026-09-30；三地季度报告日期为演示字段，不代表正式报送。审计、托管及整改资料仍未接入。</p></div>
    <div class="core-metrics">${coreMetric('立项清单',has?'演示样本':'演示','',has?'截至 2026-09-30':'演示台账')}${coreMetric('区域报告日期',escapeHTML(p.reportDate),'','模拟 · 未接入文件')}${coreMetric('审计 / 托管报告','—','','未接入')}${coreMetric('问题整改记录','—','','未接入')}</div>
    ${corePanel('区域数据报送','从填报到锁定的版本链路','支持月度、季度、年度与重大事件报送；当前仅展示流程，不伪造已提交状态。',`<div class="core-capital-steps">${[['提交','区域管理机构'],['校验','字段和金额关系'],['退回补正','问题清单'],['审核','国家层面复核'],['确认锁定','保留版本与来源']].map(([stage,detail],i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><b>${stage}</b><small>${detail}</small><em>待接入</em></div>`).join('')}</div>`)}
    <div class="core-two">${corePanel('风险信号','规则配置，不等于已发生风险','结合协议条款和报送数据触发，再由业务人员核实。',`<div class="core-status-list"><div><b>履约</b><span>出资逾期、报告迟报、交割条件未满足</span></div><div><b>运营</b><span>关键人员变更、进度偏离、费用异常</span></div><div><b>企业</b><span>现金紧张、技术里程碑延期、后续融资失败</span></div><div><b>组合</b><span>单一行业或管理人集中、关联交易程序异常</span></div></div>`)}
    ${corePanel('补档清单','当前无法完成的判断','没有底层报送与支付凭证，不计算真实投资额、IRR、DPI、TVPI或间接经济敞口。',`<div class="core-status-list"><div><b>财务</b><span>出资计划、银行回单、托管和财务对账</span></div><div><b>投资</b><span>子基金底层项目、直投签约交割与持股</span></div><div><b>绩效</b><span>估值日、现金流、收益分配和退出</span></div></div>`)}</div>`;
}
function renderCoreRegion(){
  const r=coreRegion(),p=coreProfile();
  const body={overview:coreOverview,capital:coreCapital,investment:coreInvestment,governance:coreGovernance,reporting:coreReporting}[coreState.regionTab]();
  host('region').innerHTML=`${coreHeader('REGIONAL FUND / THREE REGIONS','区域母基金','深圳、上海、北京是管理入口；三只基金使用公开名称，资金和缺失的业务资料以模拟数据演示。',r.hasWorkbook?'深圳演示样本截至 2026-09-30':'当前区域为演示台账')}
    ${coreRegionSwitch()}
    <div class="core-caveat"><span>数据分层</span><p>三只区域基金采用公开通用名称；深圳 Excel 整体归入鹏湾区域母基金（演示）的立项/申请清单。除公开名称与公开管理机构外，当前区域档案中的资金、计划、阶段和穿透关系均为演示，最终以协议和报送资料核准。</p><a href="${r.source}" target="_blank" rel="noopener">名称来源 ↗</a></div>
    ${coreTabs()}<div class="core-tab-content">${body}</div>`;
}
function coreFundRows(){
  let rows=coreFunds().filter(f=>(coreState.fundSector==='全部'||f.sector===coreState.fundSector)&&(coreState.fundPlace==='全部'||f.place===coreState.fundPlace)&&(`${f.name} ${f.manager} ${f.sector} ${f.place}`.toLowerCase().includes(coreState.fundQuery.toLowerCase())));
  if(coreState.fundSort==='request')rows.sort((a,b)=>b.request-a.request);
  if(coreState.fundSort==='size')rows.sort((a,b)=>b.size-a.size);
  return rows;
}
function coreDealRows(){
  let rows=coreDeals().filter(d=>(coreState.dealSector==='全部'||d.sector===coreState.dealSector)&&(coreState.dealPlace==='全部'||d.place===coreState.dealPlace)&&(`${d.name} ${d.summary} ${d.sector} ${d.place}`.toLowerCase().includes(coreState.dealQuery.toLowerCase())));
  if(coreState.dealSort==='request')rows.sort((a,b)=>b.request-a.request);
  if(coreState.dealSort==='round')rows.sort((a,b)=>b.round-a.round);
  return rows;
}
function coreFundTable(){
  const rows=coreFundRows();
  return rows.length?`<div class="core-table-summary">显示 ${rows.length} / ${coreFunds().length} 支 · ${coreRegion().hasWorkbook?'申请出资':'演示拟出资'} ${coreMoney(coreSum(rows,'request'))} 亿 <button data-core-export="funds">导出筛选结果 CSV ↗</button></div>${table(['序号 / 来源','子基金','管理人','策略方向','拟注册地','总规模','申请/拟出资','档案'],rows.map(f=>`<tr><td><span class="core-rowno">${f.id}</span><br>${coreRecordSource(f)}</td><td class="fund-name"><button class="link" data-core-fund="${f.id}">${escapeHTML(f.name)}</button>${coreReviewBadge(f.id)}</td><td>${escapeHTML(f.manager)}</td><td><span class="core-tag">${escapeHTML(f.sector)}</span></td><td>${escapeHTML(f.place)}</td><td>${coreMoney(f.size)}</td><td><b>${coreMoney(f.request)}</b></td><td><button class="core-row-action" data-core-fund="${f.id}">查看 →</button></td></tr>`))}`:coreEmpty('没有符合筛选条件的子基金');
}
function renderCoreFunds(){
  const fs=coreFunds(),has=coreRegion().hasWorkbook;
  host('funds').innerHTML=`${coreHeader('SUB-FUND / APPLICATION','子基金','按所属区域母基金查看子基金与管理人；拟注册地是独立属性。',has?'深圳演示样本截至 2026-09-30':'上海/北京 · 模拟台账')}${coreRegionSwitch()}
    <div class="core-caveat"><span>${has?'虚构立项':'演示数据'}</span><p>${has?'整张深圳演示样本归属鹏湾区域母基金（演示）；演示样本金额未标单位，暂按亿元展示。申请不等于实缴。':'这些基金、管理人和金额均为模拟，不代表已真实设立或投资。'}</p></div>
    <div class="core-metrics">${coreMetric(has?'立项子基金':'演示子基金',fs.length,'支',has?'虚构立项':'模拟')}${coreMetric('拟设总规模',coreMoney(coreSum(fs,'size')),'亿元',has?'演示样本金额单位待核':'模拟')}${coreMetric(has?'申请出资':'演示拟出资',coreMoney(coreSum(fs,'request')),'亿元',has?'非实缴':'模拟')}${coreMetric('管理人',new Set(fs.map(x=>x.manager)).size,'家',has?'按演示样本名称去重':'模拟')}</div>
    <div class="core-filter"><label>检索<input id="coreFundQuery" value="${escapeHTML(coreState.fundQuery)}" placeholder="基金、管理人、策略"></label><label>投资策略<select id="coreFundSector">${coreOptions(fs.map(x=>x.sector),coreState.fundSector)}</select></label><label>拟注册地<select id="coreFundPlace">${coreOptions(fs.map(x=>x.place),coreState.fundPlace)}</select></label><label>排序<select id="coreFundSort"><option value="source" ${coreState.fundSort==='source'?'selected':''}>清单顺序</option><option value="request" ${coreState.fundSort==='request'?'selected':''}>拟出资从高到低</option><option value="size" ${coreState.fundSort==='size'?'selected':''}>总规模从高到低</option></select></label></div>
    ${corePanel(has?'EXCEL / 子基金 A3:G36':'DEMO / 子基金','子基金台账','注册地不决定区域母基金归属。',`<div id="coreFundTable">${coreFundTable()}</div>`)}
    ${corePanel('投资流程','从储备到退出的证据链','演示样本只证明记录在立项清单中，不能推断已完成投决、设立或出资。',`<div class="core-steps">${['储备与征集','初筛与立项','尽职调查','投资决策','签约与设立','出资','存续管理','退出与清算'].map((x,i)=>`<div class="${i===1?'current':''}"><span>${String(i+1).padStart(2,'0')}</span><b>${x}</b></div>`).join('')}</div>`)}`;
}
function coreFundDetail(id){
  const f=[...sourceWorkbook.funds,...demoScenario.funds].find(x=>x.id===id);if(!f)return;
  const region=coreRegions.find(x=>x.id===(f.region||'shenzhen')),isReal=!!f.row;
  openModal(f.name,`<div class="core-detail-meta"><span class="core-chip">归属：${region.label}</span><span>${coreRecordSource(f)}</span></div>
    <div class="core-fields">${coreField('基金管理人',f.manager,isReal?'演示样本':'模拟')}${coreField('投资策略',f.sector,isReal?'演示样本':'模拟')}${coreField('拟注册地',f.place,isReal?'演示样本':'模拟')}${coreField('区域归属',region.city,isReal?'用户提供的数据归属':'演示情景')}</div>
    <div class="core-detail-money"><div><span>拟设基金总规模</span><strong>${coreMoney(f.size)}</strong><p>${isReal?'演示样本金额；单位待核':'模拟金额（亿元）'}</p></div><div><span>${isReal?'申请出资':'演示拟出资'}</span><strong>${coreMoney(f.request)}</strong><p>${isReal?'非认缴 / 实缴':'模拟，非真实出资'}</p></div><div><span>拟出资占规模</span><strong>${f.size?num(f.request/f.size*100,1):'—'}<small>%</small></strong><p>仅算术比例</p></div></div>
    <div class="core-missing-block"><b>${isReal?'待补齐的业务证据':'演示记录提示'}</b><p>${isReal?'管理人评价、尽调、投决、协议、支付和底层项目不在演示样本中。':'基金、管理人、金额与状态为模拟，不代表实际设立或出资。'}</p></div>${isReal?coreReviewForm(f.id):''}`,'子基金档案 · 来源请见标签');
}
function coreDealTable(){
  const rows=coreDealRows(),groups=coreDealGroups(rows);
  return rows.length?`<div class="core-table-summary">显示 ${rows.length} / ${coreDeals().length} 笔 · ${groups.size} 家企业 · ${coreRegion().hasWorkbook?'申请出资':'演示拟出资'} ${coreMoney(coreSum(rows,'request'))} 亿 <button data-core-export="deals">导出筛选结果 CSV ↗</button></div>${table(['序号 / 来源','企业 / 轮次','注册地','行业','本轮融资','申请/拟出资','档案'],rows.map(d=>`<tr><td><span class="core-rowno">${d.id}</span><br>${coreRecordSource(d)}</td><td class="fund-name"><button class="link" data-core-deal="${d.id}">${escapeHTML(d.name)}</button>${groups.get(coreCompany(d.name)).length>1?'<span class="core-tag core-tag-amber">多轮次</span>':''}${coreReviewBadge(d.id)}</td><td>${escapeHTML(d.place)}</td><td><span class="core-tag">${escapeHTML(d.sector)}</span></td><td>${coreMoney(d.round)}</td><td><b>${coreMoney(d.request)}</b></td><td><button class="core-row-action" data-core-deal="${d.id}">查看 →</button></td></tr>`))}`:coreEmpty('没有符合筛选条件的直投项目');
}
function renderCoreProjects(){
  const ds=coreDeals(),has=coreRegion().hasWorkbook;
  host('projects').innerHTML=`${coreHeader('DIRECT INVESTMENT / APPLICATION','直投项目','按区域基金管理直投，并区分企业去重与多轮融资。',has?'深圳演示样本截至 2026-09-30':'上海/北京 · 模拟台账')}${coreRegionSwitch()}
    <div class="core-caveat"><span>${has?'虚构申请':'演示数据'}</span><p>${has?'深圳演示样本整体归属鹏湾区域母基金（演示），企业注册地不决定母基金归属；金额单位待核，申请不等于交割。':'企业、金额、投资路径均为模拟，不代表真实投资。'}</p></div>
    <div class="core-metrics">${coreMetric(has?'直投申请':'演示直投',ds.length,'笔',has?'逐行 / 逐轮次':'模拟')}${coreMetric('去重企业',coreDealGroups(ds).size,'家',has?'第二轮后缀合并':'模拟')}${coreMetric('本轮融资规模',coreMoney(coreSum(ds,'round')),'亿元',has?'演示样本金额单位待核':'模拟')}${coreMetric(has?'申请出资额':'演示拟出资',coreMoney(coreSum(ds,'request')),'亿元',has?'非已交割':'模拟')}</div>
    <div class="core-filter"><label>检索<input id="coreDealQuery" value="${escapeHTML(coreState.dealQuery)}" placeholder="企业、核心技术、行业"></label><label>行业<select id="coreDealSector">${coreOptions(ds.map(x=>x.sector),coreState.dealSector)}</select></label><label>企业注册地<select id="coreDealPlace">${coreOptions(ds.map(x=>x.place),coreState.dealPlace)}</select></label><label>排序<select id="coreDealSort"><option value="source" ${coreState.dealSort==='source'?'selected':''}>清单顺序</option><option value="request" ${coreState.dealSort==='request'?'selected':''}>拟出资从高到低</option><option value="round" ${coreState.dealSort==='round'?'selected':''}>融资规模从高到低</option></select></label></div>
    ${corePanel(has?'EXCEL / 直投项目 A3:G40':'DEMO / 直投项目','直投项目台账','按所属区域与资料来源区分。',`<div id="coreDealTable">${coreDealTable()}</div>`)}
    ${corePanel('交易管理','从线索到权益和退出','直投不同于子基金投资，需要完整管理投决、条款、交割和持股。',`<div class="core-checkgrid"><div><b>评审与投决</b><p>商业、技术、法律、财务尽调，专家评审及决议。</p><em>待补充</em></div><div><b>交易与交割</b><p>估值、条款、签约、付款条件、工商变更。</p><em>待补充</em></div><div><b>权益与治理</b><p>持股确认、董事或观察员、股东会及保护性条款。</p><em>待补充</em></div><div><b>投后与退出</b><p>经营、融资、重大风险、追加投资和退出。</p><em>待补充</em></div></div>`)}`;
}
function coreDealDetail(id){
  const d=[...sourceWorkbook.deals,...demoScenario.deals].find(x=>x.id===id);if(!d)return;
  const isReal=!!d.row,related=(isReal?sourceWorkbook.deals:demoScenario.deals.filter(x=>x.region===d.region)).filter(x=>coreCompany(x.name)===coreCompany(d.name));
  const region=coreRegions.find(x=>x.id===(d.region||'shenzhen'));
  openModal(coreCompany(d.name),`<div class="core-detail-meta"><span class="core-chip">归属：${region.label}</span><span>${isReal?'演示样本申请':'模拟数据'}</span></div>
    <div class="core-fields">${coreField('企业注册地',d.place,isReal?'演示样本':'模拟')}${coreField('行业',d.sector,isReal?'演示样本':'模拟')}${coreField('区域归属',region.city,isReal?'演示样本归属':'演示情景')}</div><div class="core-summary"><b>主营业务 / 核心技术</b><p>${escapeHTML(d.summary)}</p></div>
    <h3 class="core-detail-title">融资轮次与申请</h3>${table(['企业 / 轮次','本轮融资规模','申请/拟出资','来源'],related.map(r=>`<tr><td>${escapeHTML(r.name)}</td><td>${coreMoney(r.round)}</td><td>${coreMoney(r.request)}</td><td>${coreRecordSource(r)}</td></tr>`))}
    <div class="core-missing-block"><b>${isReal?'交易状态待核验':'演示记录提示'}</b><p>${isReal?'未提供投决、签约、交割、支付或持股信息；申请不等于实际投资。':'企业与金额为模拟，不代表真实交易。'}</p></div>${isReal?coreReviewForm(d.id):''}`,'直投项目档案 · 来源请见标签');
}
const coreLookEnterprises=()=>[...new Set(demoScenario.paths.map(x=>x.enterprise))].map(name=>({name,paths:demoScenario.paths.filter(x=>x.enterprise===name)}));
const corePathExposure=p=>p.kind==='direct'?p.invest:p.invest*p.share;
const corePathSource=p=>p.kind==='direct'?demoScenario.deals.find(x=>x.id===p.dealId):[...sourceWorkbook.funds,...demoScenario.funds].find(x=>x.id===p.fundId);
function coreLookRows(){
  return coreLookEnterprises().filter(x=>{
    const first=x.paths[0];
    return (coreState.lookRegion==='全部'||x.paths.some(p=>p.region===coreState.lookRegion))&&
      (coreState.lookSector==='全部'||first.sector===coreState.lookSector)&&
      (`${x.name} ${first.sector} ${first.place}`.toLowerCase().includes(coreState.lookQuery.toLowerCase()));
  });
}
function coreLookTable(){
  const rows=coreLookRows();
  return rows.length?`<div class="core-table-summary">显示 ${rows.length} / ${coreLookEnterprises().length} 家企业 · 按企业主体去重 <button data-core-export="paths">导出演示路径 CSV ↗</button></div>${table(['底层企业','行业 / 注册地','触达区域','直投 / 间接','路径数','模拟可归属金额','详情'],rows.map(x=>{
    const ps=x.paths,regions=[...new Set(ps.map(p=>p.region))],exposure=coreSum(ps.map(p=>({v:corePathExposure(p)})),'v');
    return `<tr><td class="fund-name"><button class="link" data-core-enterprise="${escapeHTML(x.name)}">${escapeHTML(x.name)}</button>${regions.length>1?'<span class="core-tag core-tag-amber">跨区域</span>':''}</td><td>${escapeHTML(ps[0].sector)}<br><small>${escapeHTML(ps[0].place)}</small></td><td>${regions.map(id=>`<span class="core-tag">${coreRegions.find(r=>r.id===id).city}</span>`).join(' ')}</td><td>${ps.filter(p=>p.kind==='direct').length} / ${ps.filter(p=>p.kind==='indirect').length}</td><td>${ps.length}</td><td><b>${coreMoney(exposure)} 亿</b><br><small>全部为模拟</small></td><td><button class="core-row-action" data-core-enterprise="${escapeHTML(x.name)}">查看路径 →</button></td></tr>`;
  }))}`:coreEmpty('没有符合筛选条件的演示企业');
}
function renderCoreLookthrough(){
  const enterprises=coreLookEnterprises(),paths=demoScenario.paths,multi=enterprises.filter(x=>new Set(x.paths.map(p=>p.region)).size>1).length;
  host('lookthrough').innerHTML=`${coreHeader('LOOK-THROUGH / PORTFOLIO GRAPH','穿透管理','从区域母基金进入子基金，再到底层企业；并列显示区域直投，识别同一企业的多条投资路径。','全部路径为模拟 · ${demoScenario.asOf}')}
    <div class="core-caveat core-caveat-demo"><span>演示模型</span><p>本页的企业、投资额、持仓份额与全部投资边均为模拟。深圳演示样本只有子基金立项和直投申请，不能证明任何底层投资。这里的“模拟可归属金额”不是实际经济敞口或估值。</p></div>
    <div class="core-metrics">${coreMetric('穿透企业',enterprises.length,'家','模拟主体去重')}${coreMetric('投资路径',paths.length,'条','直投 + 子基金间接')}${coreMetric('跨区域企业',multi,'家','需要协同核查')}${coreMetric('模拟可归属金额',coreMoney(paths.reduce((s,p)=>s+corePathExposure(p),0)),'亿元','情景计算，非财务指标')}</div>
    <div class="core-look-intro"><div><span class="core-look-node">国家创业投资引导基金</span><i>→</i><span class="core-look-node">3 只区域基金</span><i>→</i><span class="core-look-node">子基金 / 区域直投</span><i>→</i><span class="core-look-node">去重企业</span></div><p>间接路径按“子基金对企业模拟投资额 × 区域基金在该子基金的模拟份额”测算；直投路径按模拟直投额列示。该简化方法不包含缴款时点、穿透层级、后续稀释及估值。</p></div>
    <div class="core-filter"><label>搜索企业<input id="coreLookQuery" value="${escapeHTML(coreState.lookQuery)}" placeholder="企业名称、行业或城市"></label><label>触达区域<select id="coreLookRegion"><option value="全部">全部</option>${coreRegions.map(r=>`<option value="${r.id}" ${coreState.lookRegion===r.id?'selected':''}>${r.city} · ${r.label}</option>`).join('')}</select></label><label>行业<select id="coreLookSector">${coreOptions(enterprises.map(x=>x.paths[0].sector),coreState.lookSector)}</select></label></div>
    ${corePanel('SCENARIO / BOTTOM-LEVEL ENTERPRISES','底层企业去重清单','点击企业查看所有区域、所有路径及对应的基金或直投项目。',`<div id="coreLookTable">${coreLookTable()}</div>`)}
    <div class="core-two">${corePanel('CROSS-REGION / OVERLAP','多区域交叉投资','同一企业由多个区域触达时，不把路径数当作企业数。',`<div class="core-status-list">${enterprises.filter(x=>new Set(x.paths.map(p=>p.region)).size>1).map(x=>`<div><b>${escapeHTML(x.name)}</b><span>${[...new Set(x.paths.map(p=>p.region))].map(id=>coreRegions.find(r=>r.id===id).city).join(' / ')} · ${x.paths.length} 条模拟路径</span></div>`).join('')}</div>`)}
    ${corePanel('DATA READINESS','正式穿透仍需接入','把演示模型替换为业务数据需要这些原始证据。',`<div class="core-status-list"><div><b>子基金</b><span>管理人底层投资明细、企业统一社会信用代码、轮次与持股</span></div><div><b>区域基金</b><span>协议认缴、实缴、份额、分配与估值日期</span></div><div><b>直投</b><span>交割、支付、股权变更和后续融资</span></div><div><b>核验</b><span>主体去重、关联方、跨区域重叠与报送版本</span></div></div>`)}</div>`;
}
function coreEnterpriseDetail(name){
  const ps=demoScenario.paths.filter(x=>x.enterprise===name);if(!ps.length)return;
  const regions=[...new Set(ps.map(p=>p.region))],total=ps.reduce((s,p)=>s+corePathExposure(p),0);
  openModal(name,`<div class="core-caveat core-caveat-demo"><span>全部模拟</span><p>以下每条路径、金额和份额都是演示情景，不构成真实投资或持仓声明。</p></div>
    <div class="core-fields">${coreField('行业',ps[0].sector,'模拟')}${coreField('企业注册地',ps[0].place,'模拟')}${coreField('触达区域',regions.map(id=>coreRegions.find(r=>r.id===id).city).join(' / '),'演示路径')}${coreField('模拟可归属金额',coreMoney(total)+' 亿元','情景测算')}</div>
    <h3 class="core-detail-title">全部投资路径</h3><div class="core-path-list">${ps.map((p,i)=>{
      const r=coreRegions.find(x=>x.id===p.region),src=corePathSource(p),indirect=p.kind==='indirect';
      return `<div class="core-path-item"><div><span>路径 ${String(i+1).padStart(2,'0')} · ${r.city} · ${indirect?'子基金间接':'区域直投'}</span><strong>${r.label}</strong><i>↓</i><button ${indirect?`data-core-fund="${src.id}"`:`data-core-deal="${src.id}"`}>${escapeHTML(src.name)} ↗</button><i>↓</i><b>${escapeHTML(name)}</b></div><p>${indirect?`子基金模拟投资 ${coreMoney(p.invest)} 亿 × 区域模拟份额 ${num(p.share*100,1)}% = 模拟可归属 ${coreMoney(corePathExposure(p))} 亿`:`模拟直投 ${coreMoney(p.invest)} 亿`}${src.row?'；所选子基金名称为独立生成的虚构记录，但该底层关联完全模拟':''}</p></div>`;
    }).join('')}</div>`,'企业级穿透 · 演示数据，非正式持仓');
}
function coreOpenProfile(){
  const p=coreProfile(),fields=[
    ['manager','区域管理机构','text'],['investors','出资人结构概要','text'],['strategy','投资策略','text'],
    ['established','设立日期','date'],['phase','运作阶段','select'],['commitment','国家基金认缴（亿元）','number'],['paid','国家基金实缴（亿元）','number'],
    ['annualInvestPlan','年度投资计划（亿元）','number'],['annualPlan','年度出资计划（亿元）','number'],['reportDate','最近区域报告截至日','date']
  ];
  openModal(coreRegion().label+' · 补录区域档案',`<div class="core-caveat"><span>本机演示录入</span><p>以下字段不在当前 Excel 中。录入值仅用于本机演示，不会回写原始资料，也不会自动标为审核通过。</p></div><div class="core-profile-form">${fields.map(([key,label,type])=>`<label>${label}${type==='select'?`<select data-core-profile-field="${key}">${['','筹备期','募集期','投资期','退出期','清算期'].map(v=>`<option value="${v}" ${p[key]===v?'selected':''}>${v||'请选择'}</option>`).join('')}</select>`:`<input data-core-profile-field="${key}" type="${type}" ${type==='number'?'min="0" step="0.0001"':''} value="${escapeHTML(p[key]||'')}" />`}</label>`).join('')}</div><div class="modal-foot"><button class="ghost" data-core-close>取消</button><button class="primary" data-core-save-profile>保存本机档案</button></div>`,'正式数据应接入协议、财务与区域报送系统');
}
function coreSaveProfile(){
  const values={};document.querySelectorAll('[data-core-profile-field]').forEach(x=>values[x.dataset.coreProfileField]=x.value.trim());
  for(const key of ['commitment','paid','annualPlan','annualInvestPlan'])if(values[key]!==''&&(!Number.isFinite(Number(values[key]))||Number(values[key])<0)){showToast('金额须为非负数字');return}
  if(values.commitment&&values.paid&&Number(values.paid)>Number(values.commitment)){showToast('实缴不能大于认缴，请核对');return}
  coreProfiles[coreState.region]=values;
  try{localStorage.setItem(coreProfileKey,JSON.stringify(coreProfiles))}catch{showToast('浏览器未允许持久保存，记录仅在本次页面有效')}
  closeModal();renderCoreRegion();showToast('区域档案已保存为本机演示记录');
}
function coreSaveReview(id){
  const status=document.getElementById('coreReviewStatus')?.value,note=document.getElementById('coreReviewNote')?.value.trim()||'';
  if(!['待核对','已核对演示样本','待补材料'].includes(status))return;
  coreReviews[id]={status,note};
  try{localStorage.setItem(coreReviewKey,JSON.stringify(coreReviews))}catch{}
  if(state.view==='funds')renderCoreFunds();if(state.view==='projects')renderCoreProjects();
  id.startsWith('SF')?coreFundDetail(id):coreDealDetail(id);
  showToast('核对记录已保存；原始 Excel 未改动');
}
function coreExport(kind){
  if(kind==='paths'){
    const names=new Set(coreLookRows().map(x=>x.name));
    download('穿透管理_演示路径.csv',csv([['声明','企业','企业行业','区域基金','路径类型','子基金/直投项目','模拟投资额（亿元）','模拟区域份额','模拟可归属金额（亿元）'],...demoScenario.paths.filter(p=>names.has(p.enterprise)).map(p=>['全部为模拟，非真实投资',p.enterprise,p.sector,coreRegions.find(r=>r.id===p.region).label,p.kind==='direct'?'直投':'子基金间接',corePathSource(p).name,p.invest,p.share||'',corePathExposure(p)])]),'text/csv;charset=utf-8');
  }else if(kind==='funds')download(`${coreRegion().city}_子基金${coreRegion().hasWorkbook?'演示样本':'演示'}台账.csv`,csv([['数据属性','序号','基金名称','基金管理人','投资策略','拟注册地','基金总规模（亿元，深圳演示样本单位待核）','申请/拟出资（亿元，深圳演示样本单位待核）','来源'],...coreFundRows().map(f=>[f.row?'虚构立项':'模拟数据',f.id,f.name,f.manager,f.sector,f.place,f.size,f.request,f.row?'子基金!A'+f.row+':G'+f.row:'演示数据'])]),'text/csv;charset=utf-8');
  else download(`${coreRegion().city}_直投${coreRegion().hasWorkbook?'演示样本':'演示'}台账.csv`,csv([['数据属性','序号','企业名称','注册地','主营业务/核心技术','行业','融资规模（亿元，深圳演示样本单位待核）','申请/拟出资（亿元，深圳演示样本单位待核）','来源'],...coreDealRows().map(d=>[d.row?'虚构申请':'模拟数据',d.id,d.name,d.place,d.summary,d.sector,d.round,d.request,d.row?'直投项目!A'+d.row+':G'+d.row:'演示数据'])]),'text/csv;charset=utf-8');
  showToast('已导出筛选结果，来源属性保留在 CSV 中');
}

renderers.dashboard=renderCoreDashboard;
renderers.region=renderCoreRegion;
renderers.funds=renderCoreFunds;
renderers.projects=renderCoreProjects;
renderers.lookthrough=renderCoreLookthrough;
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.coreOpenRegion){coreState.region=b.dataset.coreOpenRegion;coreState.regionTab='overview';go('region');return}
  if(b.dataset.coreRegion){coreState.region=b.dataset.coreRegion;coreState.fundQuery='';coreState.dealQuery='';coreState.fundSector='全部';coreState.fundPlace='全部';coreState.dealSector='全部';coreState.dealPlace='全部';renderers[state.view]?.();return}
  if(b.dataset.coreTab){coreState.regionTab=b.dataset.coreTab;renderCoreRegion();return}
  if(b.dataset.coreView){if(state.view==='dashboard')coreState.region='shenzhen';go(b.dataset.coreView);return}
  if(b.dataset.coreFund){coreFundDetail(b.dataset.coreFund);return}
  if(b.dataset.coreDeal){coreDealDetail(b.dataset.coreDeal);return}
  if(b.dataset.coreEnterprise){coreEnterpriseDetail(b.dataset.coreEnterprise);return}
  if(b.dataset.coreExport){coreExport(b.dataset.coreExport);return}
  if(b.dataset.coreReview){coreSaveReview(b.dataset.coreReview);return}
  if(b.hasAttribute('data-core-edit-profile')){coreOpenProfile();return}
  if(b.hasAttribute('data-core-save-profile')){coreSaveProfile();return}
  if(b.hasAttribute('data-core-close')){closeModal()}
});
document.addEventListener('input',e=>{
  if(e.target.id==='coreFundQuery'){coreState.fundQuery=e.target.value;document.getElementById('coreFundTable').innerHTML=coreFundTable()}
  if(e.target.id==='coreDealQuery'){coreState.dealQuery=e.target.value;document.getElementById('coreDealTable').innerHTML=coreDealTable()}
  if(e.target.id==='coreLookQuery'){coreState.lookQuery=e.target.value;document.getElementById('coreLookTable').innerHTML=coreLookTable()}
});
document.addEventListener('change',e=>{
  const x=e.target;
  if(x.id==='coreFundSector')coreState.fundSector=x.value;
  if(x.id==='coreFundPlace')coreState.fundPlace=x.value;
  if(x.id==='coreFundSort')coreState.fundSort=x.value;
  if(['coreFundSector','coreFundPlace','coreFundSort'].includes(x.id))document.getElementById('coreFundTable').innerHTML=coreFundTable();
  if(x.id==='coreDealSector')coreState.dealSector=x.value;
  if(x.id==='coreDealPlace')coreState.dealPlace=x.value;
  if(x.id==='coreDealSort')coreState.dealSort=x.value;
  if(['coreDealSector','coreDealPlace','coreDealSort'].includes(x.id))document.getElementById('coreDealTable').innerHTML=coreDealTable();
  if(x.id==='coreLookRegion')coreState.lookRegion=x.value;
  if(x.id==='coreLookSector')coreState.lookSector=x.value;
  if(['coreLookRegion','coreLookSector'].includes(x.id))document.getElementById('coreLookTable').innerHTML=coreLookTable();
});
document.getElementById('globalSearch').addEventListener('keydown',e=>{
  if(e.key!=='Enter')return;const q=e.target.value.trim();if(!q)return;e.stopImmediatePropagation();
  coreState.region='shenzhen';
  if(coreLookEnterprises().some(x=>x.name.includes(q))){coreState.lookQuery=q;go('lookthrough')}
  else if(sourceWorkbook.funds.some(f=>`${f.name} ${f.manager}`.includes(q))){coreState.fundQuery=q;go('funds')}
  else if(sourceWorkbook.deals.some(d=>`${d.name} ${d.summary}`.includes(q))){coreState.dealQuery=q;go('projects')}
  else showToast('当前演示样本及演示数据未找到该对象');
},true);
renderCoreDashboard();
