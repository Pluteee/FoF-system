'use strict';
// Demo workbench. Field-level source badges distinguish imported rows from scenario overlays.
labels.dashboard='管理驾驶舱';
labels.region='区域母基金';
labels.funds='子基金';
labels.projects='直投项目';
labels.lookthrough='穿透管理';
labels.managers='基金管理人';

const dxRegions=[
  {id:'shenzhen',city:'深圳',name:'粤港澳大湾区创业投资引导基金',short:'粤港澳大湾区基金',tone:'teal'},
  {id:'shanghai',city:'上海',name:'长三角创业投资引导基金',short:'长三角基金',tone:'blue'},
  {id:'beijing',city:'北京',name:'京津冀创业投资引导基金',short:'京津冀基金',tone:'violet'}
];
// Public fixture: all regional registers are synthetic and contain no source-document rows.
const dxFunds=[...sourceWorkbook.funds.map(f=>({...f,region:'shenzhen',origin:'demo'})),...demoScenario.funds.filter(f=>f.region!=='shenzhen').map(f=>({...f,origin:'demo'}))];
const dxDeals=[...sourceWorkbook.deals.map(d=>({...d,region:'shenzhen',origin:'demo'})),...demoScenario.deals.filter(d=>d.region!=='shenzhen').map(d=>({...d,origin:'demo'}))];
const dxPaths=demoScenario.paths;
const dxRecentCutoff=(()=>{const date=new Date(`${demoScenario.asOf}T00:00:00Z`);date.setUTCDate(date.getUTCDate()-30);return date.toISOString().slice(0,10)})();
const dx={region:'shenzhen',regionTab:'overview',regionProjectFund:'全部',regionProjectIndustry:'全部',dashboardGeoTab:'fund',fundRegion:'全部',fundSector:'全部',fundIndustry:'全部',fundStage:'全部',fundPlace:'全部',fundManager:'全部',fundQuery:'',fundId:null,fundTab:'profile',fundReturnView:'funds',fundReturnScroll:0,fundPortraitAt:null,dealRegion:'全部',dealSector:'全部',dealIndustry:'全部',dealStage:'全部',dealPlace:'全部',dealQuery:'',dealId:null,dealTab:'profile',lookTab:'enterprise',lookRegion:'全部',lookQuery:'',lookSector:'全部',lookMode:'all',lookPage:1,capitalPage:1,capitalQuery:'',capitalSort:'name',managerPage:1,managerQuery:'',managerRegion:'全部',managerStage:'全部',enterprise:null,manager:null};
const dxRegion=id=>dxRegions.find(r=>r.id===id)||dxRegions[0];
const dxGeo=place=>{
  const local=String(place||'').replace(/^(?:内蒙古自治区|内蒙古|广东省|浙江省|江苏省|安徽省|四川省|河北省|山东省|湖北省|福建省)/,'');
  return local.match(/^(.{2,6}?)市/)?.[1]||local.slice(0,4)||'未分类';
};
const dxIndustry=sector=>{
  const s=String(sector||'');
  if(/集成电路|半导体|芯片|电子核心/.test(s))return '半导体与集成电路';
  if(/生物|医药|医疗|诊断|侵入式|健康/.test(s))return '生物医药与医疗器械';
  if(/量子|6G|通信|网络/.test(s))return '未来信息与通信';
  if(/软件|人工智能|信息技术|信息传输|数字/.test(s))return '人工智能与数字技术';
  if(/机器人|装备|机床|电动机|传感器|航空|航天|增材|制造/.test(s))return '高端装备与机器人';
  if(/材料|能源|聚变/.test(s))return '新材料与新能源';
  return '其他科技与服务';
};
const dxSum=(rows,key)=>rows.reduce((s,x)=>s+(Number(x[key])||0),0);
const dxMoney=(n,d=2)=>Number(n||0).toLocaleString('zh-CN',{minimumFractionDigits:d,maximumFractionDigits:d});
const dxPct=(a,b)=>b?Math.round(a/b*100):0;
const dxE=x=>escapeHTML(x);
const dxRegionFunds=id=>dxFunds.filter(f=>f.region===id);
const dxRegionDeals=id=>dxDeals.filter(d=>d.region===id);
const dxFieldSource=x=>x.origin==='source'?'<span class="dx-badge source">演示样本</span>':'<span class="dx-badge demo">演示</span>';
const dxFieldDemo='<span class="dx-badge demo">演示</span>';
function dxDataNotice(region='全部'){
  return `<div class="dx-data-status"><div><span><b>演示数据</b></span><span>区域母基金名称与管理团队采用公开信息，业务数值与底层对象均为虚构</span></div><details><summary>演示数据口径</summary><p>三地区域母基金名称与管理团队采用公开信息，不代表本平台为其官方系统。深圳样本为独立生成的虚构数据（${sourceWorkbook.asOf}），含${sourceWorkbook.funds.length}支子基金、${sourceWorkbook.deals.length}笔直投记录；上海、北京业务数值同为演示情景。注册城市用于地图交互，非实际资金覆盖披露；申请不等于已投或实缴。原始工作簿、照片和私有历史不包含在本系统中。</p></details></div>`;
}
const dxHead=(k,title,desc,side='')=>`<div class="dx-head"><div><span class="dx-kicker">${k}</span><h1>${title}</h1>${desc?`<p>${desc}</p>`:''}</div>${side?`<div class="dx-head-side">${side}</div>`:''}</div>`;
const dxPanel=(title,body,sub='',action='')=>`<section class="dx-panel"><div class="dx-panel-head"><div><h2>${title}</h2>${sub?`<p>${sub}</p>`:''}</div>${action}</div>${body}</section>`;
const dxAiButton=(label,action,id='')=>`<button class="dx-ai-button" data-dx-action="${action}" ${id?`data-id="${dxE(id)}"`:''}>✦ ${label}</button>`;
const dxAiNote=(title,body,source='当前确认数据 + 演示情景')=>`<div class="dx-ai-note"><div class="dx-ai-note-head"><span>✦ AI 辅助分析</span><small>演示 · 待人工复核</small></div><b>${dxE(title)}</b><p>${dxE(body)}</p><em>依据：${dxE(source)}</em></div>`;
const dxAiHistoryKey='diki-public-ai-analysis-history-v1';
const dxAiHistoryLoad=()=>{try{return JSON.parse(localStorage.getItem(dxAiHistoryKey)||'[]')}catch{return[]}};
const dxAiHistorySave=rows=>{try{localStorage.setItem(dxAiHistoryKey,JSON.stringify(rows.slice(0,30)));return true}catch{return false}};
function dxAiAttachActions(source='当前演示数据'){
  const modal=document.getElementById('modal'),body=modal?.querySelector('.modal-body');if(!body)return;
  const title=modal.querySelector('.card-title')?.textContent||'AI分析结果';
  const target=body.querySelector('#dxAiAnswer,#dxRegisterAnswer')||body;
  const text=target.innerText.replace(/复制结果|导出结果|查看历史记录/g,'').trim();
  const rows=dxAiHistoryLoad(),record={id:'AI-'+Date.now(),title,source,text,createdAt:new Date().toLocaleString('zh-CN',{hour12:false})};
  dxAiHistorySave([record,...rows.filter(x=>x.title!==title||x.text!==text)]);
  target.insertAdjacentHTML('beforeend',`<div class="dx-ai-actions"><button class="dx-ai-button" data-dx-ai-action="copy" data-ai-id="${record.id}">复制结果</button><button class="dx-ai-button" data-dx-ai-action="export" data-ai-id="${record.id}">导出结果</button><button class="dx-ai-history-link" data-dx-ai-action="history">查看历史记录</button></div><small class="dx-ai-saved">已自动留存本次分析 · ${record.createdAt}</small>`);
}
function dxAiRefreshDashboardHistory(a){const rows=dxAiHistoryLoad(),old=rows[0];if(!old||old.title!=='驾驶舱 智能问数')return;old.text=`${a.title}\n${a.body}\n依据：${a.source}`;old.source=a.source;dxAiHistorySave([old,...rows.slice(1)]);const answer=document.getElementById('dxAiAnswer');if(answer){answer.querySelectorAll('[data-dx-ai-action="copy"],[data-dx-ai-action="export"]').forEach(x=>x.dataset.aiId=old.id);answer.querySelector('.dx-ai-saved')?.replaceChildren(document.createTextNode(`已自动留存本次分析 · ${old.createdAt}`));if(!answer.querySelector('.dx-ai-actions'))dxAiAttachActions(a.source)}}
function dxAiRefreshRegisterHistory(a){const rows=dxAiHistoryLoad(),old=rows[0];if(!old||!old.title.includes('清单分析')&&!old.title.includes('穿透管理分析'))return;old.text=`${a.title}\n${a.body}\n依据：${a.source}`;old.source=a.source;dxAiHistorySave([old,...rows.slice(1)]);const answer=document.getElementById('dxRegisterAnswer');if(answer){answer.querySelectorAll('[data-dx-ai-action="copy"],[data-dx-ai-action="export"]').forEach(x=>x.dataset.aiId=old.id);answer.querySelector('.dx-ai-saved')?.replaceChildren(document.createTextNode(`已自动留存本次分析 · ${old.createdAt}`));if(!answer.querySelector('.dx-ai-actions'))dxAiAttachActions(a.source)}}
function dxAiRecordById(id){return dxAiHistoryLoad().find(x=>x.id===id)||dxAiHistoryLoad()[0]}
function dxAiCopy(text){if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>showToast('AI分析结果已复制')).catch(()=>showToast('复制失败，请手动选择文本'));return}const area=document.createElement('textarea');area.value=text;document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();showToast('AI分析结果已复制')}
function dxAiOpenHistory(){const rows=dxAiHistoryLoad();if(!rows.length){openModal('AI分析历史','<div class="dx-blank">还没有留存的 AI 分析结果。</div>','本地浏览器留存 · 最多 30 条');return}openModal('AI分析历史',`<div class="dx-ai-history-list">${rows.map(x=>`<article><div><b>${dxE(x.title)}</b><small>${dxE(x.createdAt)} · ${dxE(x.source)}</small></div><button class="dx-history-open" data-dx-ai-history-id="${x.id}">查看</button></article>`).join('')}</div>`,'本地浏览器留存 · 最多 30 条');}
function dxAiOpenHistoryItem(id){const x=dxAiRecordById(id);if(!x)return;openModal(x.title,`<div class="dx-ai-note"><div class="dx-ai-note-head"><span>✦ 历史 AI 分析</span><small>${dxE(x.createdAt)}</small></div><p>${dxE(x.text)}</p><em>依据：${dxE(x.source)}</em></div>`,'历史记录 · 只读查看');dxAiAttachActions(x.source)}
function dxDashboardAnswer(q){
  const profiles=dxRegions.map(r=>({...dxRegionProfile(r.id),city:r.city})),commit=dxSum(profiles,'commitment'),paid=dxSum(profiles,'paid');
  if(/风险|问题|关注/.test(q))return {title:'当前最需要关注的事项',body:'深圳样本存在原始材料局部文字待核验；三个区域的真实实缴、回款和底层项目关系仍需以确认报送为准。建议先补齐财务台账，再进行 IRR、DPI、TVPI 及跨区域集中度判断。',source:'风险清单、报送完整性与原始材料'};
  if(/哪个|哪一个|最高|最快/.test(q)&&/实缴|进度/.test(q)){const r=profiles.slice().sort((a,b)=>b.paid/b.commitment-a.paid/a.commitment)[0];return {title:'实缴进度最高的区域',body:`${r.city}区域当前演示实缴进度最高，为 ${dxPct(r.paid,r.commitment)}%，实缴 ${dxMoney(r.paid,0)} 亿元 / 认缴 ${dxMoney(r.commitment,0)} 亿元。`,source:`${r.city}区域基金档案 · ${r.reportDate}`};}
  if(/产业|投向|布局/.test(q))return {title:'三地区域投资布局',body:`当前演示覆盖 ${dxFunds.length} 支子基金、${dxDeals.length} 笔直投和 ${dxEnterprisePopulation().length} 个去重企业主体。产业判断以基金策略、直投方向和底层投资路径分别统计，不将三层金额直接相加。`,source:'三地区域基金、子基金与投资路径'};
  return {title:'三地区域运行概览',body:`三地合计认缴 ${dxMoney(commit,0)} 亿元、实缴 ${dxMoney(paid,0)} 亿元，实缴率 ${dxPct(paid,commit)}%；当前登记 ${dxFunds.length} 支子基金、${dxDeals.length} 笔直投。金额按国家基金对区域层级统计，不能与下级投资额重复相加。`,source:`数据截至 ${demoScenario.asOf}`};
}
function dxOpenDashboardAI(){
  openModal('驾驶舱 智能问数',`<p class="dx-muted-note">可询问区域比较、实缴进度、产业布局、风险事项和投资规模。回答只使用当前演示数据，并显示分析口径。</p><div class="dx-ai-chips"><button type="button" data-dx-ai-question="哪个区域实缴进度最高？">哪个区域实缴进度最高？</button><button type="button" data-dx-ai-question="三个区域主要投向什么产业？">三个区域主要投向什么产业？</button><button type="button" data-dx-ai-question="当前最需要关注什么风险？">当前最需要关注什么风险？</button></div><form id="dxAiAskForm" class="dx-ai-ask"><input name="question" placeholder="例如：三个区域合计实缴多少？" autocomplete="off"><button class="dx-ai-button">提问</button></form><div id="dxAiAnswer">${dxAiNote('可追溯回答','输入问题后，AI 会给出结论、依据和需要人工复核的边界。')}</div>`,'智能问数 · 不改变业务数据');
  dxAiAttachActions('三地区域驾驶舱与投资关系');
}
function dxOpenFundAI(id){const f=dxFund(id);if(!f)return;const m=dxFundMeta(f),paths=dxPaths.filter(p=>p.fundId===id),updates=dxRegionUpdates(f.region).filter(u=>u.fundId===id),ratio=dxPct(m.paid,m.committed);openModal('AI 基金档案分析',`${dxAiNote('基金经营判断',`${dxName(f.region)} · ${f.sector}基金当前处于${m.stage}，区域拟出资 ${dxMoney(f.request)} 亿元，演示认缴 ${dxMoney(m.committed)} 亿元、实缴 ${dxMoney(m.paid)} 亿元，实缴进度 ${ratio}%。`)}<div class="dx-ai-result-grid"><div><span>组合路径</span><b>${paths.length} 条</b></div><div><span>近期动态</span><b>${updates.length} 条</b></div><div><span>报送状态</span><b>${dxE(m.report)}</b></div><div><span>关注建议</span><b>${m.risk==='正常'?'持续跟踪':'补充核验'}</b></div></div><h3 class="dx-ai-section-title">建议关注</h3><ul class="dx-ai-list"><li>${paths.length?'核对底层项目投资节奏与基金策略是否一致。':'当前尚无已确认的底层投资路径，建议补齐投后报送。'}</li><li>${updates.length?'将近期融资、资质和产品动态纳入季度经营复盘。':'补充最近一期经营动态和重大事项说明。'}</li><li>认缴、实缴、回款与估值应分别引用财务及报送台账。</li></ul>`,'AI 基金画像 · 当前档案数据');dxAiAttachActions('基金档案、投资路径与报送演示数据');}
function dxOpenRegionAI(){const r=dxRegion(dx.region),p=dxRegionProfile(r.id),fs=dxRegionFunds(r.id),ds=dxRegionDeals(r.id),risk=ds.filter(dxIsDealRisk).length;openModal('AI 区域运行分析',`${dxAiNote('本区域运行判断',`${r.city}区域当前有 ${fs.length} 支子基金、${ds.length} 笔直投，国家基金实缴 ${dxMoney(p.paid,0)} 亿元，实缴率 ${dxPct(p.paid,p.commitment)}%。当前演示重点是投资布局、报送质量和跨区域关联的持续核验。`)}<div class="dx-ai-result-grid"><div><span>投资计划</span><b>${dxMoney(p.annualInvestPlan,0)} 亿</b></div><div><span>重点风险</span><b>${risk} 项</b></div><div><span>底层企业</span><b>${dxRegionPortfolio(r.id).length} 家</b></div><div><span>最新报告</span><b>${dxE(p.reportDate)}</b></div></div><h3 class="dx-ai-section-title">建议动作</h3><ul class="dx-ai-list"><li>对照年度投资计划检查子基金和直投的执行偏差。</li><li>对同一企业、多区域管理人和单一产业集中进行交叉核验。</li><li>把待确认数据与已确认报送分开使用，避免混合统计。</li></ul>`,'区域档案、投资关系与报送演示数据');dxAiAttachActions('区域档案、投资关系与报送演示数据');}
function dxOpenRiskAI(){openModal('AI 风险简报',`${dxAiNote('风险摘要','当前风险主要来自数据缺口、材料核验和投资关系未确认，而不是已经确认的投资损失。建议先补齐实缴、回款和底层项目关系，再进行收益和集中度判断。','风险清单、演示资料和待确认字段')}<h3 class="dx-ai-section-title">建议处置顺序</h3><ol class="dx-ai-list"><li>优先复核演示·远岫科创基金的名称和管理人。</li><li>接入认缴、实缴、拨付、回款及估值台账。</li><li>由业务人员确认照片线索与基金、企业之间的真实关系。</li></ol><div class="dx-ai-actions"><button class="dx-ai-button" data-action="draft-report">生成风险专题草稿</button></div>`,'风险解释 · 仅供人工复核');dxAiAttachActions('风险清单、演示资料和待确认字段');}
function dxOpenDealAI(id){const d=dxDeal(id);if(!d)return;const m=dxDealMeta(d),related=dxRelatedDeals(d),all=dxEnterpriseRelations().filter(p=>p.enterprise===dxDealCompany(d.name));openModal('AI 项目档案分析',`${dxAiNote('项目初步判断',`${dxDealCompany(d.name)}处于${m.stage}，所属方向为${d.sector}，本轮融资 ${dxMoney(d.round)} 亿元，申请 / 拟出资 ${dxMoney(d.request)} 亿元。当前数据适合形成初步分析，不足以替代尽调结论。`)}<div class="dx-ai-result-grid"><div><span>关联交易记录</span><b>${related.length} 笔</b></div><div><span>跨区域路径</span><b>${new Set(all.map(p=>p.region)).size} 个</b></div><div><span>下一节点</span><b>${dxE(m.milestone)}</b></div><div><span>风险状态</span><b>${dxE(m.risk)}</b></div></div><h3 class="dx-ai-section-title">建议尽调问题</h3><ul class="dx-ai-list"><li>核实本轮估值、融资到账和资金用途，避免将拟议金额当作实缴。</li><li>补充商业、技术、法律和财务尽调依据，重点确认核心技术与客户验证。</li><li>${all.length>1?'该企业存在多条投资路径，建议核对投资轮次和关联关系。':'当前未发现跨区域重复路径，仍需以统一企业主体 ID 做最终核验。'}</li></ul>`,'AI 项目分析 · 当前档案与投资关系');dxAiAttachActions('项目档案、交易关系与投后演示数据');}
function dxOpenRegisterAI(kind){
  let title,body,source,chips=[];
  if(kind==='funds'){const rows=dxFundFiltered(),groups=dxIndustryGroups(rows),top=groups[0]?.[0]||'暂无';title='AI 子基金清单分析';body=dxAiNote('子基金组合判断',`当前筛选范围包含 ${rows.length} 支子基金，目标规模合计 ${dxMoney(dxSum(rows,'size'))} 亿元，区域拟出资 ${dxMoney(dxSum(rows,'request'))} 亿元。当前规模最大的产业大类为“${top}”，建议结合投资阶段和管理人集中度继续核验。`);source='子基金清单、基金策略与区域演示数据';chips=['哪个产业的基金规模最大？','哪些管理人管理的基金最多？','当前筛选清单有哪些数据缺口？'];}
  else if(kind==='deals'){const rows=dxDealFiltered(),risk=rows.filter(dxIsDealRisk).length;title='AI 直投项目清单分析';body=dxAiNote('直投项目组合判断',`当前筛选范围包含 ${rows.length} 笔直投记录、${new Set(rows.map(d=>dxDealCompany(d.name))).size} 家企业，本轮融资合计 ${dxMoney(dxSum(rows,'round'))} 亿元，申请 / 拟出资合计 ${dxMoney(dxSum(rows,'request'))} 亿元。当前有 ${risk} 笔记录需要重点跟踪。`);source='直投项目清单、交易关系与投后演示数据';chips=['哪些项目需要优先跟进？','是否存在同一企业多轮投资？','当前直投项目主要集中在哪些产业？'];}
  else {const entities=dxEnterprisePopulation(),duplicates=entities.filter(x=>x.relations.length>1);title='AI 穿透管理分析';body=dxAiNote('投资网络判断',`当前穿透网络覆盖 ${entities.length} 个去重企业主体、${dxEnterpriseRelations().length} 条投资关系，其中 ${duplicates.length} 个企业存在多条投资路径。建议优先核对重复投资、直投与间接路径的口径差异。`);source='穿透企业主档案与投资路径演示数据';chips=['哪些企业存在多区域投资？','某个企业有哪些投资路径？','直投和间接投资应该如何区分？'];}
  openModal(title,`${body}<h3 class="dx-ai-section-title">系统建议问题</h3><div class="dx-ai-chips">${chips.map(q=>`<button type="button" data-dx-register-question="${dxE(q)}">${dxE(q)}</button>`).join('')}</div><form id="dxRegisterAskForm" class="dx-ai-ask" data-kind="${kind}"><input name="question" placeholder="也可以输入你想问的问题…" autocomplete="off"><button class="dx-ai-button">提问</button></form><div id="dxRegisterAnswer">${dxAiNote('自由提问','输入问题后，AI 会结合当前筛选范围、数据口径和投资关系进行回答。')}</div>`,'AI 辅助分析 · 可预设问题，也可自由提问');dxAiAttachActions(source);
}
function dxRegisterAnswer(kind,q){const rows=kind==='funds'?dxFundFiltered():kind==='deals'?dxDealFiltered():[];if(kind==='funds'){if(/管理人/.test(q))return {title:'管理人集中度',body:`当前筛选范围涉及 ${new Set(rows.map(f=>f.manager)).size} 家管理人、${rows.length} 支子基金。建议进一步按管理人归并，并核验同一管理人跨区域管理情况。`,source:'子基金清单与管理人字段'};if(/产业|方向|投向/.test(q)){const g=dxIndustryGroups(rows),top=g[0];return {title:'子基金产业分布',body:top?`当前规模最大的产业大类为“${top[0]}”，对应 ${dxMoney(top[1])} 亿元目标规模。该结果按基金策略归类，不等于底层企业实际投资比例。`:'当前筛选范围暂无产业数据。',source:'基金策略字段与当前筛选范围'}; }return {title:'子基金清单概览',body:`当前筛选范围包含 ${rows.length} 支子基金，目标规模 ${dxMoney(dxSum(rows,'size'))} 亿元，区域拟出资 ${dxMoney(dxSum(rows,'request'))} 亿元。`,source:'当前子基金筛选清单'};}
if(kind==='deals'){if(/重复|多轮|同一企业/.test(q)){const groups=dxCountGroups(rows,d=>dxDealCompany(d.name)).filter(x=>x[1]>1);return {title:'多轮或重复企业提示',body:groups.length?`当前筛选中发现 ${groups.length} 个企业存在多条直投记录：${groups.map(x=>x[0]).join('、')}。需要结合投资轮次和企业统一主体 ID 进一步判断。`:'当前筛选范围未发现多条直投记录。',source:'直投项目名称归并与投资轮次演示字段'}; }if(/产业|方向|集中/.test(q)){const g=dxCountGroups(rows,d=>dxIndustry(d.sector));return {title:'直投产业分布',body:g.length?`当前直投记录最多的产业大类为“${g[0][0]}”，共有 ${g[0][1]} 笔记录。数量集中不等同于金额集中，建议结合拟出资额继续分析。`:'当前筛选范围暂无项目数据。',source:'直投项目产业字段'}; }return {title:'直投项目清单概览',body:`当前筛选范围包含 ${rows.length} 笔直投、${new Set(rows.map(d=>dxDealCompany(d.name))).size} 家企业，本轮融资 ${dxMoney(dxSum(rows,'round'))} 亿元，申请 / 拟出资 ${dxMoney(dxSum(rows,'request'))} 亿元。`,source:'当前直投项目筛选清单'};}
const entities=dxEnterprisePopulation();if(/区域|重复|多区域/.test(q)){const groups=entities.filter(x=>x.relations.length>1);return {title:'多区域投资企业',body:groups.length?`发现 ${groups.length} 个企业存在多条投资路径：${groups.map(x=>x.name).join('、')}。系统只做关联提示，不直接判定违规。`:'当前没有发现多条投资路径的企业。',source:'企业主档案与投资路径'};}if(/路径|怎么投|投资关系/.test(q)){const x=entities[0];return {title:'投资路径说明',body:x?`${x.name} 当前有 ${x.relations.length} 条投资关系，包含直投和子基金间接路径。可点击企业名称查看每条路径的区域、投资主体、金额和日期。`:'当前没有可展开的企业路径。',source:'穿透投资关系'};}return {title:'穿透网络概览',body:`当前覆盖 ${entities.length} 个去重企业主体和 ${dxEnterpriseRelations().length} 条投资关系。建议优先查看多区域投资企业及直投、间接路径的金额口径差异。`,source:'穿透企业主档案与投资路径'};}
const dxMetric=(label,value,unit='',sub='',action='')=>`<${action?'button':'div'} class="dx-metric${action?' clickable':''}" ${action?`data-dx-action="${action}"`:''}><span>${label}</span><strong>${value}<small>${unit}</small></strong><em>${sub}</em>${action?'<i>查看 →</i>':''}</${action?'button':'div'}>`;
const dxTable=(heads,rows)=>`<div class="dx-table-wrap"><table class="dx-table"><thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
const dxBlank=msg=>`<div class="dx-blank">${msg}</div>`;
const dxOriginLegend=()=>'<span class="dx-mini-legend"><span class="dx-badge source">演示样本</span> 深圳立项 / 申请　 <span class="dx-badge demo">演示</span> 经营与投资关系</span>';
const dxOptions=(items,active,first='全部')=>[first,...new Set(items)].map(x=>`<option value="${dxE(x)}" ${x===active?'selected':''}>${dxE(x)}</option>`).join('');
const dxPill=(text,kind='neutral')=>`<span class="dx-pill ${kind}">${dxE(text)}</span>`;
const dxStrip=(key,items)=>`<div class="dx-tabs">${items.map(([id,label])=>`<button data-dx-action="${key}" data-value="${id}" class="${dx[key]===id?'selected':''}" aria-pressed="${dx[key]===id}">${label}</button>`).join('')}</div>`;
const dxName=(id)=>dxRegion(id).short;
const dxFund=(id)=>dxFunds.find(f=>f.id===id);
const dxDeal=(id)=>dxDeals.find(d=>d.id===id);
const dxEnterpriseNames=()=>dxEnterprisePopulation().map(x=>x.name);
const dxManagerRows=()=>{const grouped=new Map();for(const f of dxFunds){if(!grouped.has(f.manager))grouped.set(f.manager,[]);grouped.get(f.manager).push(f)}return [...grouped].map(([name,funds])=>({name,funds})).sort((a,b)=>new Set(b.funds.map(f=>f.region)).size-new Set(a.funds.map(f=>f.region)).size||b.funds.length-a.funds.length)};
const dxFundStage=f=>{
  const featured={'SF01':'投资期','SF04':'投资期','SF05':'投资期','SF02':'设立中','DMF-SH-04':'投资期','DMF-BJ-04':'投资期'};
  if(featured[f.id])return featured[f.id];
  if(f.origin==='demo')return ['投资期','募集期','投决中','投资期'][Number(f.id.slice(-2))%4];
  return ['立项','尽调中','投决中','设立中','募集期'][Number(f.id.slice(2))%5];
};
const dxFundMeta=f=>{
  const stage=dxFundStage(f),commitRate={'投资期':.92,'募集期':.68,'设立中':.35}[stage]||0,payRate={'投资期':.72,'募集期':.18}[stage]||0;
  const confirmed=window.wbFundData?.(f.id);
  return {stage,committed:confirmed?Number(confirmed.committed):Number(f.request)*commitRate,paid:confirmed?Number(confirmed.paid):Number(f.request)*payRate,managerContribution:Number(f.size)*.025,term:'8年（4+4）',managementFee:'1.5% / 年',carry:'20%',keyPerson:f.manager.replace(/（演示）/g,'')+' 投资团队',report:confirmed?'已确认报送 · '+confirmed.period:stage==='投资期'?'季度报告已报送':'月度进展已更新',risk:confirmed?.risk|| (stage==='投资期'?'正常':'跟踪')};
};
const dxDealMeta=d=>{
  const demo=d.origin==='demo';
  const idx=Number(d.id.match(/\d+$/)?.[0]||1),stages=['储备','尽调中','投决中','签约中'];
  const invested=dxPaths.some(p=>p.dealId===d.id);
  const confirmed=window.wbProjectData?.(d.id);
  return {stage:demo&&invested?'投后管理':stages[idx%stages.length],targetStake:dxPct(d.request,d.round*4),valuation:Number(d.round)*4,lead:dxRegion(d.region).city+'投资组',term:'优先认购权 · 信息权 · 重大事项保护',milestone:confirmed?.milestone|| (demo?'产品验证与下一轮融资':'技术验证与商业尽调'),risk:confirmed?.operatingStatus|| (idx%4===0?'重点关注':'正常跟踪')};
};
const dxIsDealRisk=d=>['重点关注','需关注','重大事项'].includes(dxDealMeta(d).risk);
const dxDealRound=d=>['种子/天使','Pre-A','A轮','B轮','C轮及以后'][Number(d.id.match(/\d+$/)?.[0]||1)%5];
const dxRegionProfile=id=>({...demoScenario.regions[id],...(window.wbRegionData?.(id)||{})});
const dxSectorGroups=(rows,value='request')=>[...rows.reduce((m,x)=>(m.set(x.sector,(m.get(x.sector)||0)+(Number(x[value])||0)),m),new Map())].sort((a,b)=>b[1]-a[1]);
const dxIndustryGroups=(rows,value='request')=>[...rows.reduce((m,x)=>(m.set(dxIndustry(x.sector),(m.get(dxIndustry(x.sector))||0)+(Number(x[value])||0)),m),new Map())].sort((a,b)=>b[1]-a[1]);
const dxGeoGroups=rows=>[...rows.reduce((m,x)=>(m.set(dxGeo(x.place),(m.get(dxGeo(x.place))||0)+1),m),new Map())].sort((a,b)=>b[1]-a[1]);
const dxBarList=(groups,action,kind='sector')=>{
  const max=Math.max(...groups.map(x=>x[1]),1);
  return `<div class="dx-bars">${groups.map(([label,value])=>`<button class="dx-bar-row" data-dx-action="${action}" data-value="${dxE(label)}"><span>${dxE(label)}</span><div><i style="width:${Math.max(4,value/max*100)}%"></i></div><b>${kind==='money'?dxMoney(value)+' 亿':value+(kind==='fund-count'?' 支':' 笔')}</b><em>↗</em></button>`).join('')}</div>`;
};
const dxRegionSelect=(view='region')=>`<div class="dx-region-switch" role="tablist" aria-label="区域母基金">${dxRegions.map(r=>`<button role="tab" class="${dx.region===r.id?'selected':''}" data-dx-action="select-region" data-id="${r.id}" data-view="${view}" aria-selected="${dx.region===r.id}">${r.city}</button>`).join('')}</div>`;
const dxScopeTabs=(kind)=>{const key=kind==='fund'?'fundRegion':'dealRegion';return `<div class="dx-scope-tabs" role="tablist" aria-label="区域范围">${[['全部','总体'],...dxRegions.map(r=>[r.id,r.city])].map(([id,label])=>`<button role="tab" class="${dx[key]===id?'selected':''}" data-dx-action="${kind}-scope" data-value="${id}" aria-selected="${dx[key]===id}">${label}</button>`).join('')}</div>`};
const dxChartColors=['#3679c6','#35a99f','#8c72c8','#e4a250','#6486a5','#c87e9e','#83a455'];
function dxDonut(groups,action,unit='笔'){
  if(!groups.length)return dxBlank('当前范围暂无项目记录。');
  const total=groups.reduce((n,x)=>n+x[1],0)||1;let angle=0;
  const stops=groups.map(([,n],i)=>{const start=angle;angle+=n/total*100;return `${dxChartColors[i%dxChartColors.length]} ${start}% ${angle}%`}).join(',');
  return `<div class="dx-donut-wrap"><div class="dx-donut" style="background:conic-gradient(${stops})" role="img" aria-label="产业占比图"><div><strong>${total}</strong><span>${unit}</span></div></div><div class="dx-donut-legend">${groups.map(([label,n],i)=>`<button data-dx-action="${action}" data-value="${dxE(label)}"><i style="background:${dxChartColors[i%dxChartColors.length]}"></i><span>${dxE(label)}</span><b>${dxPct(n,total)}%</b></button>`).join('')}</div></div>`;
}
function dxColumnChart(kind){
  const rows=dxRegions.map(r=>({region:r,items:kind==='fund'?dxRegionFunds(r.id):dxRegionDeals(r.id)})),max=Math.max(...rows.map(x=>x.items.length),1);
  return `<div class="dx-column-chart single ${kind}">${rows.map(({region,items})=>{const avg=dxSum(items,'request')/(items.length||1);return `<button data-dx-action="${kind==='fund'?'compare-funds':'compare-deals'}" data-id="${region.id}" aria-label="${region.city}：${items.length}${kind==='fund'?'支子基金':'笔直投项目'}，平均拟出资${dxMoney(avg)}亿元"><div class="dx-column-pair"><div class="${kind}" style="height:${Math.max(8,items.length/max*100)}%"><b>${items.length}</b></div></div><span>${region.city}</span><small>均 ${dxMoney(avg)} 亿</small></button>`}).join('')}</div>`;
}
const dxCountGroups=(rows,fn)=>[...rows.reduce((map,row)=>{const key=fn(row);map.set(key,(map.get(key)||0)+1);return map},new Map())].sort((a,b)=>b[1]-a[1]);
function dxMatrix(rows,groupFn,kind){
  const all=rows.flatMap(x=>x.items),categories=dxCountGroups(all,groupFn).map(x=>x[0]);
  return `<div class="dx-matrix-legend">${categories.map((label,i)=>`<span><i style="background:${dxChartColors[i%dxChartColors.length]}"></i>${dxE(label)}</span>`).join('')}</div><div class="dx-matrix">${[...rows,{region:{city:'总体',id:'全部'},items:all}].map(({region,items})=>{const counts=categories.map(cat=>items.filter(x=>groupFn(x)===cat).length),total=items.length||1;return `<div class="dx-matrix-row"><button data-dx-action="${kind==='fund'?'compare-funds':'compare-deals'}" data-id="${region.id}">${region.city}</button><div class="dx-matrix-bar" role="img" aria-label="${region.city}：${categories.map((cat,i)=>`${cat}${counts[i]}`).join('、')}">${counts.map((n,i)=>n?`<i style="width:${n/total*100}%;background:${dxChartColors[i%dxChartColors.length]}" title="${dxE(categories[i])} ${n}">${n/total>=.14?n:''}</i>`:'').join('')}</div><strong>${items.length}</strong></div>`}).join('')}</div>`;
}
const dxRegionMatrix=(kind,groupFn)=>dxMatrix(dxRegions.map(region=>({region,items:kind==='fund'?dxRegionFunds(region.id):dxRegionDeals(region.id)})),groupFn,kind);
function dxDashboardGeography(){
  const mode=dx.dashboardGeoTab;
  const tabs=[['fund','子基金注册地'],['direct','直投项目注册地'],['portfolio','底层项目 + 直投注册地']];
  const unit=mode==='fund'?'支':'个';
  return `<div class="dx-geo-tabs" role="tablist" aria-label="投资地域口径">${tabs.map(([id,label])=>`<button role="tab" data-dx-action="dashboard-geo-tab" data-value="${id}" class="${mode===id?'selected':''}" aria-selected="${mode===id}">${label}</button>`).join('')}</div><div class="dx-geo-dashboard">${dxRegions.map(r=>{const rows=dxDashboardGeoRows(r.id,mode),groups=dxGeoGroups(rows),max=Math.max(...groups.map(x=>x[1]),1);return `<div class="dx-geo-block"><div class="dx-geo-block-head"><button data-dx-action="open-region" data-id="${r.id}">${r.city}基金 ↗</button><span>${rows.length} ${unit}</span></div>${groups.slice(0,8).map(([city,n])=>{const action=mode==='fund'?'dashboard-fund-city':mode==='direct'?'dashboard-city':'';const inner=`<span>${dxE(city)}</span><div><i style="width:${n/max*100}%"></i></div><b>${n} ${unit}</b>`;return action?`<button class="dx-geo-city" data-dx-action="${action}" data-id="${r.id}" data-value="${dxE(city)}">${inner}</button>`:`<div class="dx-geo-city">${inner}</div>`}).join('')}</div>`}).join('')}</div>`;
}
function dxDashboardGeoRows(region,mode){
  if(mode==='fund')return dxRegionFunds(region);
  if(mode==='direct')return dxRegionDeals(region);
  const combined=[...dxRegionDeals(region).map(d=>({name:d.name,place:d.place})),...dxPaths.filter(p=>p.region===region&&p.kind==='indirect').map(p=>({name:p.enterprise,place:p.place}))];
  return [...new Map(combined.map(x=>[x.name,x])).values()];
}
function dxDashboardCharts(){
  return `<div class="dx-card-grid two dx-chart-grid">${dxPanel('子基金产业布局',dxRegionMatrix('fund',f=>dxIndustry(f.sector)),'三地与总体 · 行业归并')}${dxPanel('直投项目产业布局',dxRegionMatrix('deal',d=>dxIndustry(d.sector)),'三地与总体 · 行业归并')}</div>
    <div class="dx-card-grid two dx-chart-grid">${dxPanel('子基金推进阶段',dxRegionMatrix('fund',dxFundStage),'三地与总体')}${dxPanel('直投项目推进阶段',dxRegionMatrix('deal',d=>dxDealMeta(d).stage),'三地与总体')}</div>
    ${dxPanel('直投项目融资轮次分布',dxRegionMatrix('deal',dxDealRound),'三地与总体 · 轮次为演示字段')}`;
}
function dxDashboardFlow(){return dvTree()}
function dxRegionalComparison(){return dvComparison()}
function dxDashboardIssues(){
  const risks=dxDeals.filter(dxIsDealRisk).slice(0,4),pendingFunds=dxFunds.filter(f=>dxFundStage(f)==='投决中').slice(0,2),pendingDeals=dxDeals.filter(d=>dxDealMeta(d).stage==='投决中').slice(0,2);
  return `<div class="dx-card-grid two">${dxPanel('风险事项',`<div class="dx-issue-list">${risks.map(d=>`<button data-dx-action="open-deal" data-id="${d.id}"><span class="dx-issue-dot risk"></span><b>${dxE(d.name)}</b><small>${dxRegion(d.region).city} · ${dxDealMeta(d).risk}</small><i>↗</i></button>`).join('')}</div>`,'重点关注 · 演示')}${dxPanel('待决策事项',`<div class="dx-issue-list">${pendingFunds.map(f=>`<button data-dx-action="open-fund" data-id="${f.id}"><span class="dx-issue-dot pending"></span><b>${dxE(f.name)}</b><small>${dxRegion(f.region).city} · 基金投决</small><i>↗</i></button>`).join('')}${pendingDeals.map(d=>`<button data-dx-action="open-deal" data-id="${d.id}"><span class="dx-issue-dot pending"></span><b>${dxE(d.name)}</b><small>${dxRegion(d.region).city} · 项目投决</small><i>↗</i></button>`).join('')}</div>`,'投决中 · 演示')}</div>`;
}

function renderDxDashboard(){
  const profiles=dxRegions.map(r=>dxRegionProfile(r.id)),commit=dxSum(profiles,'commitment'),paid=dxSum(profiles,'paid');
  host('dashboard').innerHTML=`${dxHead('DILI·FoF / INVESTMENT DESK','国家创投母基金投资管理驾驶舱','',`<div class="dx-dashboard-export">${dxAiButton('智能问数与决策辅助','ai-dashboard')}<details><summary>导出数据与图表 ↓</summary><div class="dx-dashboard-export-menu"><button data-dx-action="export-dashboard-data">导出数据 CSV</button><button data-dx-action="export-dashboard-report">导出图表报告 HTML</button></div></details></div>`)}
    ${dxDataNotice()}${dxDashboardFlow()}
    ${dxRegionalComparison()}
    ${window.nrDashboardPanel?.()||''}
    ${daDashboard()}
    ${dxDashboardIssues()}
    `;
}

const dxRegionIndirect=id=>dxPaths.filter(p=>p.region===id&&p.kind==='indirect');
const dxRegionPortfolio=id=>[...new Map(dxRegionIndirect(id).map(p=>[p.enterprise,p])).values()];
const dxRegionUpdates=id=>demoScenario.updates.filter(x=>x.region===id).sort((a,b)=>b.date.localeCompare(a.date));
function dxRegionProjectIndustry(){
  const projects=dxRegionPortfolio(dx.region);
  return dxDonut(dxCountGroups(projects,p=>dxIndustry(p.sector)),'region-project-industry','个');
}
function dxRegionActivityTrend(){
  const asOf=new Date(`${demoScenario.asOf}T00:00:00Z`),months=Array.from({length:6},(_,i)=>{const d=new Date(Date.UTC(asOf.getUTCFullYear(),asOf.getUTCMonth()-5+i,1));return d.toISOString().slice(0,7)});
  const paths=dxRegionIndirect(dx.region),values=months.map(m=>paths.filter(p=>p.date?.startsWith(m)).length),max=Math.max(1,...values);
  const points=values.map((n,i)=>`${34+i*80},${114-n/max*75}`).join(' ');
  return `<div class="dx-region-trend"><svg viewBox="0 0 468 150" role="img" aria-label="近六个月子基金新增投资项目：${months.map((m,i)=>`${m} ${values[i]}个`).join('，')}"><defs><linearGradient id="dxTrendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#53aeae" stop-opacity=".35"/><stop offset="1" stop-color="#53aeae" stop-opacity="0"/></linearGradient></defs><line x1="34" y1="114" x2="434" y2="114" stroke="#dce8f3"/><polygon points="34,114 ${points} 434,114" fill="url(#dxTrendFill)"/><polyline points="${points}" fill="none" stroke="#327ec6" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>${values.map((n,i)=>`<circle cx="${34+i*80}" cy="${114-n/max*75}" r="5" fill="#fff" stroke="#327ec6" stroke-width="3"/><text x="${34+i*80}" y="${102-n/max*75}" text-anchor="middle" fill="#2c648f" font-size="12" font-weight="700">${n}</text><text x="${34+i*80}" y="139" text-anchor="middle" fill="#7d92a8" font-size="11">${months[i].slice(5)}月</text>`).join('')}</svg><div class="dx-region-trend-caption"><span>最近 6 个月新增投资项目</span><b>${values.reduce((a,b)=>a+b,0)} 个</b></div></div>`;
}
function dxRegionActiveFunds(){
  const paths=dxRegionIndirect(dx.region).filter(p=>p.date&&p.date>=dxRecentCutoff);
  const groups=[...paths.reduce((m,p)=>{const rows=m.get(p.fundId)||[];rows.push(p);m.set(p.fundId,rows);return m},new Map())].sort((a,b)=>b[1].length-a[1].length||dxSum(b[1],'invest')-dxSum(a[1],'invest'));
  return groups.length?`<div class="dx-active-funds">${groups.slice(0,4).map(([id,items],i)=>`<button data-dx-action="region-project-fund" data-id="${id}"><span class="dx-active-rank">${String(i+1).padStart(2,'0')}</span><div><b>${dxE(dxFund(id).name)}</b><small>新投 ${items.map(p=>dxE(p.enterprise)).join('、')}</small></div><strong>${items.length} 个<em>${dxMoney(dxSum(items,'invest'))} 亿</em></strong></button>`).join('')}</div>`:dxBlank('近 30 天暂无新增投资项目');
}
function dxRegionPositiveUpdates(limit=4){
  const updates=dxRegionUpdates(dx.region).slice(0,limit);
  return `<div class="dx-positive-feed">${updates.map(u=>{const related=u.fundId?dxFund(u.fundId):dxDeal(u.dealId),route=u.fundId?'子基金投资':'直投项目';return `<div class="dx-positive-item"><time>${u.date.slice(5)}</time><div><span class="dx-positive-type">${dxE(u.type)}</span><b>${dxE(u.enterprise)} · ${dxE(u.title)}</b><p>${dxE(u.detail)}</p><button data-dx-action="${u.fundId?'open-fund':'open-deal'}" data-id="${u.fundId||u.dealId}">${route} · ${dxE(related.name)} ↗</button></div></div>`}).join('')}</div>`;
}
function dxRegionProjects(){
  const all=dxRegionIndirect(dx.region),fundIds=[...new Set(all.map(p=>p.fundId))],visible=all.filter(p=>(dx.regionProjectFund==='全部'||p.fundId===dx.regionProjectFund)&&(dx.regionProjectIndustry==='全部'||dxIndustry(p.sector)===dx.regionProjectIndustry));
  const companies=new Set(visible.map(p=>p.enterprise));
  return `<div class="dx-metrics">${dxMetric('子基金投资项目',companies.size,'个','底层企业去重')}${dxMetric('关联子基金',new Set(visible.map(p=>p.fundId)).size,'支','本区域投资路径')}${dxMetric('子基金投资额',dxMoney(dxSum(visible,'invest')),'亿元','项目层投资额')}${dxMetric('近期新增',visible.filter(p=>p.date>=dxRecentCutoff).length,'个','近 30 天')}</div>
    <div class="dx-project-filter"><label>关联子基金 <select id="dxRegionProjectFund"><option value="全部">全部子基金</option>${fundIds.map(id=>`<option value="${id}" ${dx.regionProjectFund===id?'selected':''}>${dxE(dxFund(id).name)}</option>`).join('')}</select></label>${dx.regionProjectIndustry!=='全部'?`<button data-dx-action="clear-region-project-industry">${dxE(dx.regionProjectIndustry)} ×</button>`:''}</div>
    <div class="dx-card-grid two">${dxPanel('项目产业分布',dxDonut(dxCountGroups([...new Map(visible.map(p=>[p.enterprise,p])).values()],p=>dxIndustry(p.sector)),'region-project-industry','个'),'底层企业去重')}${dxPanel('投资活跃度',dxRegionActivityTrend(),'最近 6 个月')}</div>
    ${dxPanel('子基金投资项目清单',dxTable(['底层项目','所属子基金','产业 / 注册地','投资额','投资日期','项目动态'],visible.sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(p=>{const update=dxRegionUpdates(dx.region).find(u=>u.enterprise===p.enterprise&&(!u.fundId||u.fundId===p.fundId));return `<tr><td><button class="dx-link strong" data-dx-action="open-enterprise" data-name="${dxE(p.enterprise)}">${dxE(p.enterprise)}</button></td><td><button class="dx-link" data-dx-action="open-fund" data-id="${p.fundId}">${dxE(dxFund(p.fundId).name)}</button></td><td>${dxE(dxIndustry(p.sector))}<small>${dxE(dxGeo(p.place))}</small></td><td>${dxMoney(p.invest)} 亿</td><td>${p.date||'—'}</td><td>${update?`${update.fundId?'子基金投资':'直投项目'} · ${dxE(update.type)} · ${dxE(update.title)}`:'—'}</td></tr>`})),`${dxRegion(dx.region).city}区域 · ${visible.length} 条投资路径`)}
    ${dxPanel('近期动态',dxRegionPositiveUpdates(8),'融资、荣誉资质与产品进展')}`;
}
function dxRegionAllocation(){
  const fs=dxRegionFunds(dx.region),ds=dxRegionDeals(dx.region),fa=dxSum(fs,'request'),da=dxSum(ds,'request'),total=fa+da,projects=dxRegionPortfolio(dx.region).length;
  return `<div class="dx-region-allocation"><div class="dx-region-allocation-root"><span>区域申请 / 拟出资</span><strong>${dxMoney(total)} 亿</strong></div><div class="dx-region-allocation-branches"><button data-dx-action="region-funds"><span>子基金 · ${fs.length} 支</span><b>${dxMoney(fa)} 亿</b><i><em style="width:${dxPct(fa,total)}%"></em></i></button><button data-dx-action="region-deals"><span>直投项目 · ${ds.length} 笔</span><b>${dxMoney(da)} 亿</b><i><em style="width:${dxPct(da,total)}%"></em></i></button></div><button class="dx-region-allocation-end" data-dx-action="region-projects">子基金投资项目 <b>${projects} 个</b> ↗</button></div>`;
}
function dxRegionOverview(){
  const r=dxRegion(dx.region),p=dxRegionProfile(r.id),fs=dxRegionFunds(r.id),ds=dxRegionDeals(r.id),sectors=dxIndustryGroups(ds),places=dxGeoGroups(ds),projects=dxRegionPortfolio(r.id),activeFunds=new Set(dxRegionIndirect(r.id).filter(x=>x.date>=dxRecentCutoff).map(x=>x.fundId)).size;
  const risks=ds.filter(dxIsDealRisk).slice(0,4),pendingFunds=fs.filter(f=>dxFundStage(f)==='投决中').slice(0,2),pendingDeals=ds.filter(d=>dxDealMeta(d).stage==='投决中').slice(0,2);
  const issue=(obj,kind,caption)=>`<button data-dx-action="${kind==='fund'?'open-fund':'open-deal'}" data-id="${obj.id}"><span class="dx-issue-dot ${caption==='重点关注'?'risk':'pending'}"></span><b>${dxE(obj.name)}</b><small>${caption}</small><i>↗</i></button>`;
  return `<div class="dx-metrics dx-region-six">${dxMetric('基金目标规模',500,'亿元','区域基金档案','region-capital')}${dxMetric('国家基金认缴 / 实缴',`${dxMoney(p.commitment,0)} / ${dxMoney(p.paid,0)}`,'亿元',`实缴率 ${dxPct(p.paid,p.commitment)}%`,'region-capital')}${dxMetric('子基金',fs.length,'支','区域基金组合','region-funds')}${dxMetric('直投项目',ds.length,'笔','区域项目组合','region-deals')}${dxMetric('子基金投资项目',projects.length,'个','底层企业去重','region-projects')}${dxMetric('近期活跃子基金',activeFunds,'支','近 30 天有新增投资','region-projects')}</div>
    ${raDashboard()}
    ${dxPanel('近期动态',dxRegionPositiveUpdates(),'融资、荣誉资质与产品进展 · 关联投资路径')}
    <div class="dx-card-grid two">${dxPanel('待办事项',`<div class="dx-issue-list">${[...pendingFunds.map(f=>issue(f,'fund','基金投决')), ...pendingDeals.map(d=>issue(d,'deal','项目投决'))].join('')||dxBlank('当前无待决策事项')}</div>`,'投决中 · 演示')}${dxPanel('风险事项',`<div class="dx-issue-list">${risks.map(d=>issue(d,'deal','重点关注')).join('')||dxBlank('当前无重点风险事项')}</div>`,'重点关注 · 演示')}</div>`;
}

function dxRegionIndustry(){return raDashboard()}

function dxRegionCapital(){
  const p=dxRegionProfile(dx.region),fs=dxRegionFunds(dx.region),ds=dxRegionDeals(dx.region),paid=p.paid,commit=p.commitment;
  const calls=[{date:'2026-01-15',title:'首期出资',amount:paid*.5,status:'已到账'},{date:'2026-05-20',title:'第二期出资',amount:paid*.3,status:'已到账'},{date:'2026-09-18',title:'第三期出资',amount:paid*.2,status:'已到账'},{date:'2027-03-31',title:'下一期出资计划',amount:p.annualPlan,status:'计划中'}];
  return `<div class="dx-metrics">${dxMetric('国家基金认缴',dxMoney(commit,0),'亿元','已签承诺')}${dxMetric('国家基金实缴',dxMoney(paid,0),'亿元','实缴 / 认缴 '+dxPct(paid,commit)+'%')}${dxMetric('待缴承诺',dxMoney(commit-paid,0),'亿元','按认缴减实缴')}${dxMetric('年度出资计划',dxMoney(p.annualPlan,0),'亿元','本年度计划')}</div>
    <div class="dx-card-grid two">${dxPanel('出资进度',`<div class="dx-capital-progress"><div><span>已实缴 ${dxMoney(paid,0)} 亿</span><b>${dxPct(paid,commit)}%</b></div><div class="dx-progress"><i style="width:${dxPct(paid,commit)}%"></i></div><p>认缴 ${dxMoney(commit,0)} 亿　·　待缴 ${dxMoney(commit-paid,0)} 亿</p></div><div class="dx-capital-split"><span>子基金拟出资<b>${dxMoney(dxSum(fs,'request'))} 亿</b></span><span>直投拟出资<b>${dxMoney(dxSum(ds,'request'))} 亿</b></span></div>`,'各层资金分别记账，不重复加总。')}
      ${dxPanel('出资与缴款节点',dxTable(['日期','事项','金额','状态'],calls.map(x=>`<tr><td>${x.date}</td><td>${x.title}</td><td>${dxMoney(x.amount)} 亿</td><td>${dxPill(x.status,x.status==='已到账'?'teal':'amber')}</td></tr>`)),'区域经营演示')}
    </div>`;
}

function dxRegionOperations(){
  const r=dxRegion(dx.region),p=dxRegionProfile(r.id),fs=dxRegionFunds(r.id),ds=dxRegionDeals(r.id),managerCount=new Set(fs.map(f=>f.manager)).size,riskCount=ds.filter(dxIsDealRisk).length;
  return `<div class="dx-metrics">${dxMetric('子基金管理人',managerCount,'家','管理人网络','region-managers')}${dxMetric('年度投资计划',dxMoney(p.annualInvestPlan,0),'亿元','投资计划')}${dxMetric('最新报告',p.reportDate,'','季度经营报告')}${dxMetric('重点事项',riskCount,'项','风险跟踪')}</div>
    <div class="dx-card-grid two">${dxPanel('区域管理团队',`<div class="dx-profile-callout"><b>${dxE(p.manager)}</b><p>投资策略：${dxE(p.strategy)}</p><p>出资结构：${dxE(p.investors)}</p></div><button class="dx-text-link" data-dx-action="region-managers">查看子基金管理人 →</button>`)}
      ${dxPanel('近期经营节点',`<div class="dx-timeline"><div><time>09.30</time><b>三季度经营数据归集</b><p>覆盖资金、投资、底层项目与风险事项</p></div><div><time>10.12</time><b>年度投资计划执行跟踪</b><p>核对产业布局与子基金进展</p></div><div><time>10.24</time><b>区域组合分析会议</b><p>关注跨区域协同与集中度</p></div></div>`)}</div>`;
}

function renderDxRegion(){
  const r=dxRegion(dx.region),p=dxRegionProfile(r.id);
  const tabs=[['overview','总览'],['projects','项目穿透'],['industry','组合分析'],['capital','出资与资金'],['operations','治理与报送']];
  const content={overview:dxRegionOverview,projects:dxRegionProjects,industry:dxRegionIndustry,capital:dxRegionCapital,operations:dxRegionOperations}[dx.regionTab]();
  host('region').innerHTML=`${dxRegionSelect()}
    <div class="dx-region-banner ${r.tone}"><div><span>${r.city} · 区域基金档案</span><h2>${r.name}</h2><p>管理团队　${dxE(p.manager)}</p></div><div class="dx-region-banner-side"><strong>${dxMoney(p.paid,0)}<small>亿元</small></strong><span>演示</span>${dxAiButton('AI分析本区域','ai-region')}</div></div>
    <div class="dx-region-export"><details><summary>导出数据与图表 ↓</summary><div><button data-dx-action="export-region-data">导出本区域数据 CSV</button><button data-dx-action="export-region-report">导出图表报告 HTML</button></div></details></div>
    ${dxDataNotice(r.id)}${dxStrip('regionTab',tabs)}${content}`;
}
const dxCrumb=(items)=>`<div class="dx-breadcrumb">${items.map((x,i)=>i===items.length-1?`<span>${dxE(x.label)}</span>`:`<button data-dx-action="${x.action}" ${x.id?`data-id="${dxE(x.id)}"`:''}>${dxE(x.label)}</button><i>›</i>`).join('')}</div>`;
const dxFundFiltered=()=>dxFunds.filter(f=>(dx.fundRegion==='全部'||f.region===dx.fundRegion)&&(dx.fundSector==='全部'||f.sector===dx.fundSector)&&(dx.fundIndustry==='全部'||dxIndustry(f.sector)===dx.fundIndustry)&&(dx.fundStage==='全部'||dxFundStage(f)===dx.fundStage)&&(dx.fundPlace==='全部'||dxGeo(f.place)===dx.fundPlace)&&(dx.fundManager==='全部'||f.manager===dx.fundManager)&&`${f.name} ${f.manager} ${f.place} ${f.sector}`.toLowerCase().includes(dx.fundQuery.toLowerCase()));
const dxFundFilters=()=>`<div class="dx-filters"><label>搜索<input id="dxFundQuery" value="${dxE(dx.fundQuery)}" placeholder="基金、管理人、产业方向"></label><label>所属区域<select id="dxFundRegion"><option value="全部">全部区域</option>${dxRegions.map(r=>`<option value="${r.id}" ${dx.fundRegion===r.id?'selected':''}>${r.city} · ${r.short}</option>`).join('')}</select></label><label>产业大类<select id="dxFundIndustry">${dxOptions(dxFunds.map(f=>dxIndustry(f.sector)),dx.fundIndustry)}</select></label><label>投资方向<select id="dxFundSector">${dxOptions(dxFunds.map(f=>f.sector),dx.fundSector)}</select></label><label>基金阶段<select id="dxFundStage">${dxOptions(dxFunds.map(dxFundStage),dx.fundStage)}</select></label><label>拟注册城市<select id="dxFundPlace">${dxOptions(dxFunds.map(f=>dxGeo(f.place)),dx.fundPlace)}</select></label><label>基金管理人<select id="dxFundManager">${dxOptions(dxFunds.map(f=>f.manager),dx.fundManager)}</select></label></div>`;
function dxFundResults(){
  const fs=dxFundFiltered();
  return fs.length?`${dxTable(['基金名称 / 来源','区域与策略','基金管理人','目标规模','区域拟出资','当前阶段','操作'],fs.map(f=>`<tr><td><button class="dx-link strong" data-dx-action="open-fund" data-id="${f.id}">${dxE(f.name)}</button><small>${dxFieldSource(f)} ${f.origin==='source'?`子基金 · 第 ${f.row} 行`:''}</small></td><td>${dxName(f.region)}<small>${dxE(f.sector)}</small></td><td><button class="dx-link" data-dx-action="open-manager" data-name="${dxE(f.manager)}">${dxE(f.manager)}</button></td><td>${dxMoney(f.size)} 亿</td><td>${dxMoney(f.request)} 亿</td><td>${dxPill(dxFundStage(f),dxFundStage(f)==='投资期'?'teal':'blue')}</td><td><button class="dx-link" data-dx-action="open-fund" data-id="${f.id}">进入档案 ↗</button></td></tr>`))}<div class="dx-count">显示 ${fs.length} 支子基金</div>`:dxBlank('没有符合条件的子基金，请调整筛选条件。');
}
function renderDxFunds(){
  if(dx.fundId){renderDxFundDetail();return}
  const fs=dxFundFiltered();
  host('funds').innerHTML=`${dxHead('SUB-FUND / FUND REGISTER','子基金档案','',`${dxAiButton('AI分析当前清单','ai-funds-list')}${`<button class="dx-outline" data-dx-action="export-funds">导出当前清单 ↓</button>`}`)}
    ${dxScopeTabs('fund')}${dxDataNotice(dx.fundRegion)}
    <div id="dxFundStats">${dxFundStats()}</div>
    <div id="dxFundAnalysis">${dxFundAnalysis(fs)}</div>
    ${dxFundFilters()}${dxPanel('基金清单',`<div id="dxFundResults">${dxFundResults()}</div>`)}`;
}
function dxFundAnalysis(fs){
  if(!fs.length)return '';
  const sectors=dxCountGroups(fs,f=>dxIndustry(f.sector)),stages=dxCountGroups(fs,dxFundStage),cities=dxCountGroups(fs,f=>dxGeo(f.place));
  return `<div class="dx-card-grid three dx-chart-grid">${dxPanel('产业方向',dxBarList(sectors,'fund-industry','fund-count'),'行业归并')}${dxPanel('基金阶段',dxBarList(stages,'fund-stage','fund-count'),'阶段为演示，不代表演示样本已设立或已投')}${dxPanel('注册城市分布',dxBarList(cities,'fund-geo','fund-count'),'按基金拟注册地统计，可点击筛选')}</div>`;
}
function dxFundStats(){const fs=dxFundFiltered();return `<div class="dx-metrics">${dxMetric('子基金',fs.length,'支','当前筛选结果')}${dxMetric('目标规模',dxMoney(dxSum(fs,'size')),'亿元','基金目标规模合计')}${dxMetric('区域拟出资',dxMoney(dxSum(fs,'request')),'亿元','演示样本申请 / 演示拟出资')}${dxMetric('基金管理人',new Set(fs.map(f=>f.manager)).size,'家','管理人网络','dashboard-managers')}</div>`}
const dxFundPipelines={
  '新一代信息技术':['星维芯片（演示）','智序算力（演示）','光栅通信（演示）'],
  '高端装备制造':['拓界机器人（演示）','北辰精工（演示）','航材智造（演示）'],
  '生物产业':['云岚生物（演示）','仁芯医药（演示）','启源诊断（演示）'],
  '集成电路':['浦芯微电子（演示）','澄芯半导体（演示）','星维芯片（演示）'],
  '人工智能':['澜图具身机器人（演示）','智序算力（演示）','天衡智能（演示）'],
  '生物医药':['云岚生物（演示）','仁芯医药（演示）','启源诊断（演示）'],
  '新材料':['燕材科技（演示）','科陶新材（演示）','衡微材料（演示）']
};
const dxFundPaths=f=>dxPaths.filter(p=>p.kind==='indirect'&&p.fundId===f.id);
const dxFundUpdates=f=>demoScenario.updates.filter(u=>u.fundId===f.id).sort((a,b)=>b.date.localeCompare(a.date));
const dxFundExits=f=>demoScenario.fundExits.filter(x=>x.fundId===f.id).sort((a,b)=>b.date.localeCompare(a.date));
const dxFundPerformance=f=>demoScenario.fundPerformance[f.id]||null;
const dxFundReportPeriods=[{id:'2026-Q2',label:'2026 年二季度报告',due:'2026-07-25',kind:'季报'},{id:'2026-Q3',label:'2026 年三季度报告',due:'2026-10-25',kind:'季报'},{id:'2026-Y',label:'2026 年年度报告',due:'2027-03-31',kind:'年报'}];
const dxFundReportStore=(()=>{try{return JSON.parse(localStorage.getItem('diki-public-demo-fund-reports')||'{}')||{}}catch{return {}}})();
const dxFundReportRecord=(f,id)=>dxFundReportStore[`${f.id}:${id}`];
function dxFundReportStatus(f,period){
  const record=dxFundReportRecord(f,period.id);
  if(record)return {label:'已提交（本机）',tone:'teal',date:record.date,file:record.file};
  if(period.id==='2026-Q2')return {label:dxFundStage(f)==='投资期'?'已归档':'待补充',tone:dxFundStage(f)==='投资期'?'teal':'amber',date:dxFundStage(f)==='投资期'?'2026-07-20':'—',file:'—'};
  return {label:period.id==='2026-Y'?'待编制':'待提交',tone:'amber',date:'—',file:'—'};
}
function dxFundReports(f){
  const submitted=dxFundReportPeriods.filter(period=>dxFundReportStatus(f,period).tone==='teal').length;
  return `<div class="dx-metrics">${dxMetric('报告计划',dxFundReportPeriods.length,'期','2026 年度')}${dxMetric('已报送 / 归档',submitted,'期','含本机演示提交')}${dxMetric('待办报送',dxFundReportPeriods.length-submitted,'期','季报 / 年报')}${dxMetric('最近截止',dxFundReportPeriods[1].due,'','三季度报告')}</div>
    ${dxPanel('季报与年报',dxTable(['报告期','报送截止','状态','最近提交','文件','操作'],dxFundReportPeriods.map(period=>{const status=dxFundReportStatus(f,period);return `<tr><td><b>${period.label}</b><small>${period.kind}</small></td><td>${period.due}</td><td>${dxPill(status.label,status.tone)}</td><td>${status.date}</td><td>${dxE(status.file)}</td><td><button class="dx-link" data-dx-action="fund-report-submit" data-id="${period.id}">${status.tone==='teal'?'重新提交':'提交报告'} ↗</button></td></tr>`})), '报告报送 · 本机演示')}
    ${dxPanel('报送内容',`<div class="dx-field-grid"><div><span>投资组合</span><b>新增项目、后续融资与退出进展</b></div><div><span>基金运营</span><b>认缴实缴、费用与净值</b></div><div><span>风险事项</span><b>项目风险、重大事项与整改</b></div><div><span>附件</span><b>季报 / 年报、财务报表与证明材料</b></div></div>`)} `;
}
function dxFundHighlights(f){
  const paths=dxFundPaths(f),updates=dxFundUpdates(f),exits=dxFundExits(f),perf=dxFundPerformance(f);
  const achievements=updates.length?updates.map(u=>`<div class="dx-fund-achievement"><time>${u.date}</time><span>${dxPill(u.type,'teal')}</span><div><b>${dxE(u.enterprise)} · ${dxE(u.title)}</b><p>${dxE(u.detail)}</p></div></div>`).join(''):dxBlank('当前没有项目融资或资质动态。');
  return `<div class="dx-metrics dx-region-six">${dxMetric('底层投资项目',paths.length,'个','演示投资路径')}${dxMetric('项目成果动态',updates.length,'条','融资 / 资质等')}${dxMetric('退出记录',exits.length,'笔','部分退出 / 退出')}${dxMetric('TVPI',perf?dxMoney(perf.tvpi):'—','倍','演示业绩')}${dxMetric('DPI',perf?dxMoney(perf.dpi):'—','倍','演示业绩')}${dxMetric('净 IRR',perf?dxMoney(perf.irr,1):'—','%','演示业绩')}</div>
    <div class="dx-card-grid two">${dxPanel('底层项目成果',`<div class="dx-fund-achievements">${achievements}</div>`,'融资、荣誉资质与业务进展')}${dxPanel('基金业绩回报',perf?`<div class="dx-fund-return"><div><span>TVPI · 总价值倍数</span><b>${dxMoney(perf.tvpi)}×</b><i style="--value:${Math.min(100,perf.tvpi/1.5*100)}%"></i></div><div><span>DPI · 已分配倍数</span><b>${dxMoney(perf.dpi)}×</b><i style="--value:${Math.min(100,perf.dpi/1.5*100)}%"></i></div><div><span>净 IRR</span><b>${dxMoney(perf.irr,1)}%</b><i style="--value:${Math.min(100,perf.irr/15*100)}%"></i></div><div><span>期末净值</span><b>${dxMoney(perf.nav)} 亿</b><i style="--value:${Math.min(100,perf.nav/(f.size||1)*100)}%"></i></div></div>`:dxBlank('当前阶段尚未形成可展示的业绩回报。'),'业绩指标 · 演示')}</div>
    ${dxPanel('项目退出',exits.length?dxTable(['退出项目','退出方式','日期','回款金额','退出倍数'],exits.map(x=>`<tr><td>${dxE(x.enterprise)}</td><td>${dxE(x.type)}</td><td>${x.date}</td><td>${dxMoney(x.proceeds)} 亿</td><td>${dxMoney(x.returnMultiple)} 倍</td></tr>`)):dxBlank('当前没有项目退出记录。'),'项目层退出记录 · 演示')}`;
}
function dxFundPortrait(f,m){
  const paths=dxFundPaths(f),updates=dxFundUpdates(f),exits=dxFundExits(f),perf=dxFundPerformance(f),lastPath=paths.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0],report=dxFundReportStatus(f,dxFundReportPeriods[1]);
  const highlights=[`${paths.length} 个底层投资项目`,updates.length?`${updates.length} 条项目融资或资质动态`:'暂无项目成果动态',exits.length?`${exits.length} 笔退出记录`:'暂无退出记录',perf?`TVPI ${dxMoney(perf.tvpi)} 倍`:'业绩回报待形成'];
  const issues=[report.tone==='amber'?'三季度报告待提交':'三季度报告已提交',m.risk==='正常'?'暂无重点风险事项':'基金运营需持续跟踪',!exits.length?'退出与回款仍待形成':'持续跟踪退出回款'];
  return `<div class="dx-portrait-hero"><div><span>FUND PORTRAIT · ${dx.fundPortraitAt||demoScenario.asOf}</span><h2>${dxE(f.name)}</h2><p>${dxName(f.region)} · ${dxE(f.sector)} · ${dxE(m.stage)}</p></div><button data-dx-action="export-fund-portrait">导出基金画像 HTML ↓</button></div>
    <div class="dx-metrics">${dxMetric('目标规模',dxMoney(f.size),'亿元','基金档案')}${dxMetric('区域拟出资',dxMoney(f.request),'亿元','申请 / 演示拟出资')}${dxMetric('底层投资',paths.length,'个','演示路径')}${dxMetric('TVPI',perf?dxMoney(perf.tvpi):'—','倍','演示业绩')}</div>
    <div class="dx-card-grid two">${dxPanel('基本情况',`<div class="dx-portrait-list"><p><span>基金管理人</span><b>${dxE(f.manager)}</b></p><p><span>投资方向</span><b>${dxE(f.sector)}</b></p><p><span>拟注册地</span><b>${dxE(f.place)}</b></p><p><span>当前阶段</span><b>${dxE(m.stage)}</b></p></div>`)}${dxPanel('最新运营',`<div class="dx-portrait-list"><p><span>认缴 / 实缴</span><b>${dxMoney(m.committed)} / ${dxMoney(m.paid)} 亿</b></p><p><span>最近投资</span><b>${lastPath?`${lastPath.date} · ${dxE(lastPath.enterprise)}`:'尚无投资路径'}</b></p><p><span>最近报送</span><b>${dxE(report.label)}${report.date!=='—'?` · ${report.date}`:''}</b></p><p><span>管理人状态</span><b>${dxE(m.report)}</b></p></div>`)}</div>
    <div class="dx-card-grid two">${dxPanel('基金亮点',`<ul class="dx-portrait-bullets">${highlights.map(x=>`<li>${dxE(x)}</li>`).join('')}</ul>${updates.slice(0,2).map(u=>`<div class="dx-portrait-update"><b>${dxE(u.enterprise)}</b><span>${dxE(u.title)}</span></div>`).join('')}`)}${dxPanel('问题与关注',`<ul class="dx-portrait-bullets concern">${issues.map(x=>`<li>${dxE(x)}</li>`).join('')}</ul><button class="dx-text-link" data-dx-action="fundTab" data-value="reports">查看报送情况 →</button>`)}</div>`;
}
function dxFundProfile(f,m){
  const pathCount=dxPaths.filter(x=>x.fundId===f.id).length,steps=['储备','立项','尽调','投决','签约','出资','投资期','退出'];
  const stageIndex={'立项':1,'尽调中':2,'投决中':3,'设立中':4,'募集期':5,'投资期':6,'退出期':7}[m.stage]||0;
  return `<div class="dx-detail-grid">${dxPanel('基金基础信息',`<div class="dx-field-grid"><div><span>基金名称</span><b>${dxE(f.name)}</b>${dxFieldSource(f)}</div><div><span>基金管理人</span><button class="dx-link" data-dx-action="open-manager" data-name="${dxE(f.manager)}">${dxE(f.manager)} ↗</button>${dxFieldSource(f)}</div><div><span>所属区域基金</span><button class="dx-link" data-dx-action="open-region" data-id="${f.region}">${dxName(f.region)} ↗</button></div><div><span>主要策略</span><b>${dxE(f.sector)}</b>${dxFieldSource(f)}</div><div><span>拟注册地</span><b>${dxE(f.place)}</b>${dxFieldSource(f)}</div><div><span>存续期限</span><b>${m.term}</b>${dxFieldDemo}</div><div><span>管理费</span><b>${m.managementFee}</b>${dxFieldDemo}</div><div><span>收益分配</span><b>门槛收益后 20% 超额收益</b>${dxFieldDemo}</div></div>`,'基础字段与经营方案合并展示。')}
    ${dxPanel('投资定位',`<div class="dx-profile-callout"><b>${dxE(f.sector)}</b><p>重点关注种子期、初创期和成长期项目；围绕区域产业协同形成可持续项目储备。</p></div><div class="dx-brief-stat"><span>目标规模<b>${dxMoney(f.size)} 亿</b></span><span>区域拟出资<b>${dxMoney(f.request)} 亿</b></span><span>底层项目<b>${pathCount||'—'} 条</b></span></div><button class="dx-text-link" data-dx-action="fund-portfolio">查看底层投资 ↗</button>`,'基金策略与投资组合')}</div>
    ${dxPanel('生命周期',`<div class="dx-lifecycle">${steps.map((x,i)=>`<div class="${i===stageIndex?'active':''} ${i<stageIndex?'done':''}"><i>${String(i+1).padStart(2,'0')}</i><b>${x}</b></div>`).join('')}</div><div class="dx-inline-facts"><span>当前阶段：<b>${m.stage}</b></span><span>报送状态：<b>${m.report}</b></span><span>重点关注：<b>${m.risk}</b></span></div>`,'基金当前状态与后续管理阶段。')}
    ${dxPanel('出资结构',`<div class="dx-capital-stack"><div style="width:${dxPct(f.request,f.size)}%">区域基金 ${dxPct(f.request,f.size)}%</div><div style="width:${Math.max(0,100-dxPct(f.request,f.size))}%">其他 LP</div></div><div class="dx-field-grid two"><div><span>区域拟出资</span><b>${dxMoney(f.request)} 亿元</b>${dxFieldSource(f)}</div><div><span>其他出资人</span><b>${dxMoney(Math.max(0,f.size-f.request))} 亿元</b>${dxFieldDemo}</div></div><button class="dx-text-link" data-dx-action="fund-capital">查看缴款明细 ↗</button>`,'按基金目标规模与区域拟出资构成。')}</div>`;
}
function dxFundCapital(f,m){
  const scheduleBase=m.committed||f.request,pay1=Math.min(scheduleBase*.5,m.paid),pay2=Math.min(scheduleBase*.3,Math.max(0,m.paid-pay1)),pay3=Math.max(0,m.paid-pay1-pay2);
  const capitalSource=window.wbFundData?.(f.id)?'已确认报送':'经营演示';
  return `<div class="dx-metrics">${dxMetric('目标规模',dxMoney(f.size),'亿元','基金规模')}${dxMetric('区域拟出资',dxMoney(f.request),'亿元','申请 / 演示拟出资')}${dxMetric('已认缴',dxMoney(m.committed),'亿元',capitalSource)}${dxMetric('已实缴',dxMoney(m.paid),'亿元',capitalSource)}</div>
    <div class="dx-card-grid two">${dxPanel('认缴与实缴进度',`<div class="dx-progress-big"><strong>${dxPct(m.paid,m.committed)}<small>%</small></strong><span>已实缴 / 已认缴</span></div><div class="dx-progress"><i style="width:${dxPct(m.paid,m.committed)}%"></i></div><div class="dx-inline-facts"><span>认缴 ${dxMoney(m.committed)} 亿</span><span>实缴 ${dxMoney(m.paid)} 亿</span><span>待缴 ${dxMoney(m.committed-m.paid)} 亿</span></div>`)}
      ${dxPanel('缴款计划与执行',dxTable(['批次','计划日期','计划金额','实缴金额','状态'],[{name:'首期',date:'2026-03-31',due:scheduleBase*.5,paid:pay1},{name:'第二期',date:'2026-07-15',due:scheduleBase*.3,paid:pay2},{name:'第三期',date:'2027-03-31',due:scheduleBase*.2,paid:pay3}].map(x=>`<tr><td>${x.name}</td><td>${x.date}</td><td>${dxMoney(x.due)} 亿</td><td>${dxMoney(x.paid)} 亿</td><td>${dxPill(x.paid?'已到账':m.committed?'计划中':'拟定',x.paid?'teal':'amber')}</td></tr>`)),'出资流程演示')}</div>`;
}
function dxFundPortfolio(f){
  const ps=dxPaths.filter(p=>p.fundId===f.id),pipeline=dxFundPipelines[f.sector]||dxFundPipelines['新一代信息技术'];
  const rows=ps.length?ps.map(p=>`<tr><td><button class="dx-link strong" data-dx-action="open-enterprise" data-name="${dxE(p.enterprise)}">${dxE(p.enterprise)}</button><small>${dxE(p.place)}</small></td><td>${dxE(p.sector)}</td><td>${dxMoney(p.invest)} 亿</td><td>${dxPill('已投组合','teal')}</td><td><button class="dx-link" data-dx-action="open-enterprise" data-name="${dxE(p.enterprise)}">查看企业 ↗</button></td></tr>`):pipeline.map((name,i)=>`<tr><td><button class="dx-link strong" data-dx-action="open-pipeline" data-id="${f.id}" data-index="${i}">${name}</button><small>${dxE(f.place)}</small></td><td>${dxE(f.sector)}</td><td>${dxMoney(.12+i*.08)} 亿</td><td>${dxPill(['储备','初筛','尽调'][i],'blue')}</td><td><button class="dx-link" data-dx-action="open-pipeline" data-id="${f.id}" data-index="${i}">项目概览 ↗</button></td></tr>`);
  return `<div class="dx-metrics">${dxMetric('已投组合路径',ps.length,'条','底层企业关系')}${dxMetric('项目储备',pipeline.length,'个','储备池')}${dxMetric('拟投产业',f.sector,'','当前策略')}${dxMetric('投资地域',dxGeo(f.place),'','基金拟注册地')}</div>
    ${dxPanel(ps.length?'底层投资组合':'项目储备清单',dxTable(['企业 / 项目','产业','投资 / 拟投额','阶段','操作'],rows))}
    ${dxPanel('投资进度',`<div class="dx-stage-grid"><div><b>${pipeline.length}</b><span>储备</span></div><div><b>2</b><span>初筛</span></div><div><b>1</b><span>尽调</span></div><div><b>${ps.length}</b><span>已投路径</span></div></div>`)} `;
}
function dxFundOperations(f,m){
  return `<div class="dx-card-grid two">${dxPanel('管理人履职',`<div class="dx-profile-callout"><b>${dxE(f.manager)}</b><p>关键团队：${dxE(m.keyPerson)}</p><p>基金阶段：${dxE(m.stage)} · 报送：${dxE(m.report)}</p></div><button class="dx-text-link" data-dx-action="open-manager" data-name="${dxE(f.manager)}">进入管理人档案 ↗</button>`)}
    ${dxPanel('投后指标',`<div class="dx-stage-grid"><div><b>${dxPaths.filter(p=>p.fundId===f.id).length}</b><span>底层项目</span></div><div><b>1</b><span>本季会议</span></div><div><b>${m.risk==='正常'?0:1}</b><span>关注事项</span></div></div><div class="dx-inline-facts"><span>季度报告 <b>${m.report}</b></span><span>管理费 <b>${m.managementFee}</b></span></div>`,'经营演示')}</div>
    ${dxPanel('重点管理动作',`<div class="dx-timeline"><div><time>09.20</time><b>季度投资组合更新</b><p>更新投资进度、行业与地域结构</p></div><div><time>10.08</time><b>管理人沟通会</b><p>核对项目储备与出资计划</p></div><div><time>10.18</time><b>年度策略复盘</b><p>回顾策略执行、风险与退出准备</p></div></div>`)}`;
}
function dxFundDocuments(f){
  const types=['基金设立方案','管理人尽调报告','投资决策纪要','合伙协议','缴款通知与回单','季度经营报告','年度经营报告'];
  const rows=types.map((type,i)=>{const report=i>=5?dxFundReportStatus(f,dxFundReportPeriods[i===5?1:2]):null,date=report?report.date:i<3?'2026-07-'+String(10+i).padStart(2,'0'):'2026-09-'+String(10+i).padStart(2,'0'),status=report?report.label:i<4?'已编目':'待更新',tone=report?report.tone:i<4?'teal':'amber';return `<tr><td><b>${type}</b></td><td>${dxE(f.name)}</td><td>${date}</td><td>${dxPill(status,tone)}</td><td><button class="dx-link" data-dx-action="${report?'fundTab':'open-doc'}" ${report?'data-value="reports"':`data-id="${f.id}" data-index="${i}"`}>${report?'报送管理':'查看目录'} ↗</button></td></tr>`});
  return `${dxPanel('档案目录',dxTable(['文件类别','档案对象','更新日期','状态','操作'],rows),'文件目录与投决、出资、投后节点联动。')}
    <button class="dx-text-link" data-dx-action="fundTab" data-value="reports">查看季报与年报报送 →</button>
    ${f.origin==='source'?`<div class="dx-source-link">虚构台账：<a href="source-data.js?v=20261026-dili" target="_blank" rel="noopener">子基金工作表第 ${f.row} 行 ↗</a></div>`:''}`;
}
function renderDxFundDetail(){
  const f=dxFund(dx.fundId);if(!f){dx.fundId=null;renderDxFunds();return}
  const m=dxFundMeta(f),tabs=[['profile','基础档案'],['capital','出资与资金'],['portfolio','底层投资'],['operations','运营治理'],['highlights','亮点与业绩'],['reports','报告报送'],['documents','资料档案'],['portrait','基金画像']];
  const content={profile:()=>dxFundProfile(f,m),capital:()=>dxFundCapital(f,m),portfolio:()=>dxFundPortfolio(f),operations:()=>dxFundOperations(f,m),highlights:()=>dxFundHighlights(f),reports:()=>dxFundReports(f),documents:()=>dxFundDocuments(f),portrait:()=>dxFundPortrait(f,m)}[dx.fundTab]();
  const backLabel=dx.fundReturnView==='region'?'返回区域母基金':dx.fundReturnView==='lookthrough'?'返回穿透管理':'返回子基金清单';
  host('funds').innerHTML=`<div class="dx-fund-detail-toolbar"><button data-dx-action="back-funds">← ${backLabel}</button><span>${dxE(f.name)}</span><div class="dx-toolbar-actions">${dxAiButton('AI分析','ai-fund',f.id)}<button data-dx-action="fund-generate-portrait">生成基金画像 ↗</button></div></div>${dxCrumb([{label:'子基金',action:'back-funds'},{label:f.name}])}<div class="dx-detail-hero"><div><div class="dx-tags">${dxFieldSource(f)}${dxPill(dxFundStage(f),'teal')}${dxPill(dxName(f.region),'blue')}</div><h1>${dxE(f.name)}</h1><p>基金管理人　<button data-dx-action="open-manager" data-name="${dxE(f.manager)}">${dxE(f.manager)} ↗</button></p></div><div class="dx-detail-hero-fig"><span>目标规模</span><strong>${dxMoney(f.size)}<small>亿元</small></strong><em>区域拟出资 ${dxMoney(f.request)} 亿</em></div></div>
    <div class="dx-fund-tabs">${dxStrip('fundTab',tabs)}</div>${content}`;
}
const dxDealFiltered=()=>dxDeals.filter(d=>(dx.dealRegion==='全部'||d.region===dx.dealRegion)&&(dx.dealSector==='全部'||d.sector===dx.dealSector)&&(dx.dealIndustry==='全部'||dxIndustry(d.sector)===dx.dealIndustry)&&(dx.dealStage==='全部'||dxDealMeta(d).stage===dx.dealStage)&&(dx.dealPlace==='全部'||dxGeo(d.place)===dx.dealPlace)&&`${d.name} ${d.summary} ${d.place} ${d.sector}`.toLowerCase().includes(dx.dealQuery.toLowerCase()));
const dxDealCompany=name=>name.replace(/（第二轮）$/,'');
const dxRelatedDeals=d=>dxDeals.filter(x=>x.region===d.region&&dxDealCompany(x.name)===dxDealCompany(d.name));
const dxDealFilters=()=>`<div class="dx-filters"><label>搜索<input id="dxDealQuery" value="${dxE(dx.dealQuery)}" placeholder="企业、技术或行业"></label><label>所属区域<select id="dxDealRegion"><option value="全部">全部区域</option>${dxRegions.map(r=>`<option value="${r.id}" ${dx.dealRegion===r.id?'selected':''}>${r.city} · ${r.short}</option>`).join('')}</select></label><label>产业大类<select id="dxDealIndustry">${dxOptions(dxDeals.map(d=>dxIndustry(d.sector)),dx.dealIndustry)}</select></label><label>产业方向<select id="dxDealSector">${dxOptions(dxDeals.map(d=>d.sector),dx.dealSector)}</select></label><label>项目阶段<select id="dxDealStage">${dxOptions(dxDeals.map(d=>dxDealMeta(d).stage),dx.dealStage)}</select></label><label>企业注册城市<select id="dxDealPlace">${dxOptions(dxDeals.map(d=>dxGeo(d.place)),dx.dealPlace)}</select></label></div>`;
function dxDealResults(){
  const ds=dxDealFiltered();
  return ds.length?`${dxTable(['企业 / 来源','所属区域','产业与所在地','本轮融资','申请 / 拟出资','交易阶段','操作'],ds.map(d=>`<tr><td><button class="dx-link strong" data-dx-action="open-deal" data-id="${d.id}">${dxE(d.name)}</button><small>${dxFieldSource(d)} ${d.origin==='source'?`直投项目 · 第 ${d.row} 行`:''}</small></td><td>${dxName(d.region)}</td><td>${dxE(d.sector)}<small>${dxE(d.place)}</small></td><td>${dxMoney(d.round)} 亿</td><td>${dxMoney(d.request)} 亿</td><td>${dxPill(dxDealMeta(d).stage,dxDealMeta(d).stage==='投后管理'?'teal':'blue')}</td><td><button class="dx-link" data-dx-action="open-deal" data-id="${d.id}">进入档案 ↗</button></td></tr>`))}<div class="dx-count">显示 ${ds.length} 笔记录 · ${new Set(ds.map(d=>dxDealCompany(d.name))).size} 家企业</div>`:dxBlank('没有符合条件的直投项目，请调整筛选条件。');
}
function renderDxDeals(){
  if(dx.dealId){renderDxDealDetail();return}
  host('projects').innerHTML=`${dxHead('DIRECT INVESTMENT / PROJECT REGISTER','直投项目档案','',`${dxAiButton('AI分析当前清单','ai-deals-list')}${`<button class="dx-outline" data-dx-action="export-deals">导出当前清单 ↓</button>`}`)}
    ${dxScopeTabs('deal')}${dxDataNotice(dx.dealRegion)}
    <div id="dxDealStats">${dxDealStats()}</div>
    <div id="dxDealAnalysis">${dxDealAnalysis(dxDealFiltered())}</div>
    ${dxDealFilters()}${dxPanel('项目清单',`<div id="dxDealResults">${dxDealResults()}</div>`)}`;
}
function dxDealAnalysis(ds){
  if(!ds.length)return '';
  const sectors=dxCountGroups(ds,d=>dxIndustry(d.sector)),stages=dxCountGroups(ds,d=>dxDealMeta(d).stage),places=dxCountGroups(ds,d=>dxGeo(d.place));
  return `<div class="dx-card-grid three dx-chart-grid">${dxPanel('投资产业偏好',dxDonut(sectors,'deal-industry'),'行业归并')}${dxPanel('项目阶段',dxBarList(stages,'deal-stage'))}${dxPanel('企业城市分布',dxBarList(places,'deal-geo'))}</div>`;
}
function dxDealStats(){const ds=dxDealFiltered();return `<div class="dx-metrics">${dxMetric('直投记录',ds.length,'笔','当前筛选结果')}${dxMetric('企业主体',new Set(ds.map(d=>dxDealCompany(d.name))).size,'家','多轮融资按企业合并')}${dxMetric('融资规模',dxMoney(dxSum(ds,'round')),'亿元','演示样本 / 演示轮次金额')}${dxMetric('申请 / 拟出资',dxMoney(dxSum(ds,'request')),'亿元','按记录口径')}</div>`}
function dxDealProfile(d,m){
  const related=dxRelatedDeals(d),confirmed=window.wbProjectData?.(d.id);
  return `<div class="dx-detail-grid">${dxPanel('企业与项目概况',`<div class="dx-field-grid"><div><span>企业名称</span><b>${dxE(dxDealCompany(d.name))}</b>${dxFieldSource(d)}</div><div><span>企业注册地</span><b>${dxE(d.place)}</b>${dxFieldSource(d)}</div><div><span>产业方向</span><b>${dxE(d.sector)}</b>${dxFieldSource(d)}</div><div><span>所属区域基金</span><button class="dx-link" data-dx-action="open-region" data-id="${d.region}">${dxName(d.region)} ↗</button></div><div><span>项目负责人</span><b>${dxE(m.lead)}</b>${dxFieldDemo}</div><div><span>当前阶段</span><b>${m.stage}</b>${dxFieldDemo}</div></div><div class="dx-summary"><b>主营业务 / 核心技术</b><p>${dxE(d.summary)}</p></div>`)}
    ${dxPanel('交易概览',`<div class="dx-brief-stat"><span>本轮融资<b>${dxMoney(d.round)} 亿</b></span><span>申请 / 拟出资<b>${dxMoney(d.request)} 亿</b></span><span>融资轮次（演示）<b>${dxDealRound(d)}</b></span></div><div class="dx-inline-facts"><span>模拟投前估值 <b>${dxMoney(m.valuation)} 亿</b></span><span>模拟目标持股 <b>${m.targetStake}%</b></span><span>历次记录 <b>${related.length} 笔</b></span></div><button class="dx-text-link" data-dx-action="deal-transaction">查看交易条款 ↗</button>`)}
    ${dxPanel('项目进展',`<div class="dx-lifecycle">${['储备','尽调中','投决中','签约中','投后管理','退出'].map((x,i)=>`<div class="${x===m.stage?'active':''} ${i<['储备','尽调中','投决中','签约中','投后管理','退出'].indexOf(m.stage)?'done':''}"><i>${String(i+1).padStart(2,'0')}</i><b>${x}</b></div>`).join('')}</div><div class="dx-summary"><b>下一关键节点</b><p>${dxE(m.milestone)}</p></div>`)}
    ${confirmed?dxPanel('已确认项目报送',`<div class="dx-field-grid"><div><span>报告期 / 截至日期</span><b>${dxE(confirmed.period)} · ${dxE(confirmed.asOf)}</b></div><div><span>经营状态</span><b>${dxE(confirmed.operatingStatus)}</b></div><div><span>本期进展</span><b>${dxE(confirmed.milestone)}</b></div><div><span>新融资</span><b>${dxE(confirmed.fundingUpdate||'未填报')}</b></div><div><span>新获资质 / 荣誉</span><b>${dxE(confirmed.qualification||'未填报')}</b></div><div><span>风险与待办</span><b>${dxE(confirmed.risk)}</b></div></div>`,'区域母基金审核确认后发布；未经确认的报送不展示。'):''}
    ${dxPanel('历次申请 / 融资',dxTable(['轮次记录','本轮融资','申请 / 拟出资','来源'],related.map(x=>`<tr><td><button class="dx-link" data-dx-action="open-deal" data-id="${x.id}">${dxE(x.name)}</button></td><td>${dxMoney(x.round)} 亿</td><td>${dxMoney(x.request)} 亿</td><td>${dxFieldSource(x)}</td></tr>`)),'同一企业的多轮记录归集在同一档案。')}</div>`;
}
function dxDealTransaction(d,m){
  const steps=['项目立项','商业与技术尽调','投资决策','条款谈判','签约交割','股权登记'];
  const stageOrder={'储备':0,'尽调中':1,'投决中':2,'签约中':3,'投后管理':5}[m.stage]||0;
  return `<div class="dx-metrics">${dxMetric('本轮融资',dxMoney(d.round),'亿元','融资轮次金额')}${dxMetric('申请 / 拟出资',dxMoney(d.request),'亿元','项目出资金额')}${dxMetric('投前估值',dxMoney(m.valuation),'亿元','交易演示')}${dxMetric('目标持股',m.targetStake,'%','交易演示')}</div>
    <div class="dx-card-grid two">${dxPanel('交易条款',`<div class="dx-field-grid two"><div><span>投资方式</span><b>增资扩股</b>${dxFieldDemo}</div><div><span>目标持股</span><b>${m.targetStake}%</b>${dxFieldDemo}</div><div><span>治理安排</span><b>董事观察员席位</b>${dxFieldDemo}</div><div><span>投资人保护</span><b>${m.term}</b>${dxFieldDemo}</div></div>`)}
      ${dxPanel('交割条件',`<div class="dx-checklist"><div><i>${stageOrder>=2?'✓':'○'}</i><span>投决及授权文件</span><b>${stageOrder>=2?'已归档':'待完成'}</b></div><div><i>${stageOrder>=1?'✓':'○'}</i><span>核心知识产权核查</span><b>${stageOrder>=1?'已完成':'待核查'}</b></div><div><i>${stageOrder>=5?'✓':'○'}</i><span>协议签署与工商变更</span><b>${stageOrder>=5?'已完成':'推进中'}</b></div><div><i>${stageOrder>=5?'✓':'○'}</i><span>付款及权益确认</span><b>${stageOrder>=5?'已完成':'待完成'}</b></div></div>`,'交易流程演示')}</div>
    ${dxPanel('交易里程碑',`<div class="dx-lifecycle">${steps.map((x,i)=>`<div class="${i===stageOrder?'active':''} ${i<stageOrder?'done':''}"><i>${String(i+1).padStart(2,'0')}</i><b>${x}</b></div>`).join('')}</div>`)}`;
}
function dxDealHolding(d,m){
  const ps=dxPaths.filter(p=>p.dealId===d.id),enterprise=dxDealCompany(d.name),all=dxPaths.filter(p=>p.enterprise===enterprise),has=all.length;
  const holdingRows=m.stage==='投后管理'?[{date:'2026-06-30',event:'投资交割',change:m.targetStake+'%',info:'权益确认'},{date:'2026-09-30',event:'季度权益核对',change:m.targetStake+'%',info:'股东名册核查'}]:[{date:'2026-09-30',event:'拟议投资条款',change:'目标 '+m.targetStake+'%',info:'交易方案'},{date:'2026-10-15',event:'治理权利评估',change:'待签约',info:'按投决结果调整'}];
  return `<div class="dx-card-grid two">${dxPanel('权益与治理',`<div class="dx-brief-stat"><span>目标持股<b>${m.targetStake}%</b></span><span>董事席位<b>观察员 1 名</b></span><span>当前阶段<b>${m.stage}</b></span></div><div class="dx-summary"><b>股东权利</b><p>信息权、优先认购权、重大事项知情及保护性条款。</p></div>`)}
    ${dxPanel('跨基金关联',has?`<div class="dx-feature-manager"><div><span>同一企业</span><h3>${dxE(enterprise)}</h3><p>涉及 ${new Set(all.map(p=>p.region)).size} 个区域、${all.length} 条投资路径。</p></div><b>${all.length}<small>条路径</small></b></div><button class="dx-text-link" data-dx-action="open-enterprise" data-name="${dxE(enterprise)}">打开企业穿透 ↗</button>`:`<div class="dx-feature-manager"><div><span>产业协同</span><h3>${dxE(d.sector)}</h3><p>本区域同产业子基金 ${dxRegionFunds(d.region).filter(f=>f.sector===d.sector).length} 支，可直接查看相关基金布局。</p></div></div><button class="dx-text-link" data-dx-action="deal-sector-funds" data-id="${d.id}">查看同产业子基金 ↗</button>`,'企业级去重与交叉投资')}</div>
    ${dxPanel(m.stage==='投后管理'?'权益变动记录':'拟议权益安排',dxTable(['日期','事项','持股变化','说明'],holdingRows.map(x=>`<tr><td>${x.date}</td><td>${x.event}</td><td>${x.change}</td><td>${x.info}</td></tr>`)),'权益信息演示')}</div>`;
}
function dxDealPost(d,m){
  if(m.stage!=='投后管理')return `<div class="dx-metrics">${dxMetric('交易阶段',m.stage,'','当前项目阶段')}${dxMetric('跟踪频率','月度','','经营与技术跟踪计划')}${dxMetric('重点事项',3,'项','技术、商业、融资')}${dxMetric('预计下次评估','2026 Q4','','项目节点评估')}</div>
    <div class="dx-card-grid two">${dxPanel('投后监测方案',`<div class="dx-checklist"><div><i>○</i><span>经营指标与订单</span><b>按月跟踪</b></div><div><i>○</i><span>技术研发里程碑</span><b>按季核查</b></div><div><i>○</i><span>现金流与融资计划</span><b>重点关注</b></div></div>`,'与交易进度衔接')}
    ${dxPanel('下一关键节点',`<div class="dx-profile-callout"><b>${dxE(m.milestone)}</b><p>项目完成交易后，经营、估值和股东权利信息将进入本档案持续跟踪。</p></div>`)}</div>`;
  const metrics=[['营业收入','1,280 万元','较上期 +18%'],['研发里程碑','3 / 4 项','本季完成 1 项'],['现金储备','18 个月','按当前消耗估算'],['风险状态',m.risk,'持续跟踪']];
  return `<div class="dx-metrics">${metrics.map(([a,b,c])=>dxMetric(a,b,'',c)).join('')}</div>
    <div class="dx-card-grid two">${dxPanel('投后里程碑',`<div class="dx-timeline"><div><time>Q2</time><b>完成核心产品验证</b><p>${dxE(d.summary)}</p></div><div><time>Q3</time><b>客户试点扩大</b><p>重点跟踪订单转化与量产计划</p></div><div><time>Q4</time><b>下一轮融资准备</b><p>更新财务预测与估值依据</p></div></div>`)}
      ${dxPanel('风险与行动',`<div class="dx-profile-callout"><b>${m.risk}</b><p>关注现金消耗、技术节点、治理事项与后续融资进度。</p></div><div class="dx-checklist"><div><i>✓</i><span>季度经营报告</span><b>已归集</b></div><div><i>○</i><span>项目现场访谈</span><b>计划中</b></div><div><i>○</i><span>下一轮融资评估</span><b>跟进中</b></div></div>`,'投后管理演示')}</div>`;
}
function dxDealDocuments(d){
  const types=['项目立项表','商业与技术尽调','财务尽调','投资决策纪要','投资协议','工商与权益证明','季度投后报告'];
  return `${dxPanel('项目档案目录',dxTable(['文件类别','归属对象','资料日期','状态','操作'],types.map((type,i)=>`<tr><td><b>${type}</b></td><td>${dxE(dxDealCompany(d.name))}</td><td>2026-${i<4?'07':'09'}-${String(i+10).padStart(2,'0')}</td><td>${dxPill(i<4?'已编目':'待更新',i<4?'teal':'amber')}</td><td><button class="dx-link" data-dx-action="open-deal-doc" data-id="${d.id}" data-index="${i}">查看目录 ↗</button></td></tr>`)),'按交易阶段组织资料。')}
    ${d.origin==='source'?`<div class="dx-source-link">虚构台账：<a href="source-data.js?v=20261026-dili" target="_blank" rel="noopener">直投项目工作表第 ${d.row} 行 ↗</a></div>`:''}`;
}
function renderDxDealDetail(){
  const d=dxDeal(dx.dealId);if(!d){dx.dealId=null;renderDxDeals();return}
  const m=dxDealMeta(d),tabs=[['profile','项目概况'],['transaction','交易与交割'],['holding','权益与治理'],['post','投后跟踪'],['documents','资料档案']];
  const content={profile:()=>dxDealProfile(d,m),transaction:()=>dxDealTransaction(d,m),holding:()=>dxDealHolding(d,m),post:()=>dxDealPost(d,m),documents:()=>dxDealDocuments(d)}[dx.dealTab]();
  host('projects').innerHTML=`${dxCrumb([{label:'直投项目',action:'back-deals'},{label:dxDealCompany(d.name)}])}<div class="dx-detail-hero deal"><div><div class="dx-tags">${dxFieldSource(d)}${dxPill(m.stage,'teal')}${dxPill(dxName(d.region),'blue')}</div><h1>${dxE(dxDealCompany(d.name))}</h1><p>${dxE(d.sector)}　·　${dxE(d.place)}</p></div><div class="dx-detail-hero-fig"><span>申请 / 拟出资</span><strong>${dxMoney(d.request)}<small>亿元</small></strong><em>本轮融资 ${dxMoney(d.round)} 亿</em><div>${dxAiButton('AI分析项目','ai-deal',d.id)}</div></div></div>
    ${dxStrip('dealTab',tabs)}${content}`;
}
// One relation per direct deal or indirect sub-fund path. Scenario direct paths already
// represented by a deal are deliberately not counted twice.
const dxEnterpriseRelations=()=>[
  ...dxDeals.map(d=>({enterprise:dxDealCompany(d.name),region:d.region,sector:d.sector,place:d.place,kind:'direct',dealId:d.id,amount:Number(d.request),source:d.origin})),
  ...dxPaths.filter(p=>p.kind==='indirect').map(p=>({...p,amount:Number(p.invest)*Number(p.share||0),source:'demo'}))
];
const dxEnterprisePopulation=()=>[...dxEnterpriseRelations().reduce((map,p)=>{if(!map.has(p.enterprise))map.set(p.enterprise,{name:p.enterprise,relations:[]});map.get(p.enterprise).relations.push(p);return map},new Map()).values()];
const dxEnterpriseRows=()=>dxEnterprisePopulation().filter(x=>{
  const rs=x.relations,first=rs[0];return (dx.lookRegion==='全部'||rs.some(p=>p.region===dx.lookRegion))&&(dx.lookSector==='全部'||rs.some(p=>p.sector===dx.lookSector))&&(dx.lookMode!=='duplicates'||rs.length>1)&&(dx.lookMode!=='cross'||new Set(rs.map(p=>p.region)).size>1)&&`${x.name} ${first.sector} ${first.place}`.toLowerCase().includes(dx.lookQuery.toLowerCase());
}).sort((a,b)=>b.relations.length-a.relations.length||a.name.localeCompare(b.name,'zh-CN'));
const dxManagerFiltered=()=>dxManagerRows().filter(x=>(dx.lookRegion==='全部'||x.funds.some(f=>f.region===dx.lookRegion))&&(dx.lookMode!=='duplicates'||x.funds.length>1)&&`${x.name} ${x.funds.map(f=>f.name).join(' ')}`.toLowerCase().includes(dx.lookQuery.toLowerCase()));
const dxPathAmount=p=>p.kind==='direct'?p.invest:p.invest*p.share;
const dxPage=(rows,page,size=10)=>{const pages=Math.max(1,Math.ceil(rows.length/size)),current=Math.min(Math.max(1,page),pages);return {rows:rows.slice((current-1)*size,current*size),current,pages,total:rows.length}};
const dxPager=(page,action)=>`<div class="dx-pager"><span>共 ${page.total} 条 · 第 ${page.current}/${page.pages} 页</span><div><button data-dx-action="${action}" data-value="${page.current-1}" ${page.current<=1?'disabled':''}>上一页</button><button data-dx-action="${action}" data-value="${page.current+1}" ${page.current>=page.pages?'disabled':''}>下一页</button></div></div>`;
const dxModeSwitch=()=>`<div class="dx-mode-switch"><button data-dx-action="look-mode" data-value="all" class="${dx.lookMode==='all'?'selected':''}">去重主体总览</button><button data-dx-action="look-mode" data-value="duplicates" class="${dx.lookMode==='duplicates'?'selected':''}">重复投资 / 管理关系</button>${dx.lookTab==='enterprise'?`<button data-dx-action="look-mode" data-value="cross" class="${dx.lookMode==='cross'?'selected':''}">跨区域项目</button>`:''}</div>`;
function dxEnterpriseTable(){
  if(typeof ltRelationshipList==='function'&&['duplicates','cross'].includes(dx.lookMode))return ltRelationshipList();
  const page=dxPage(dxEnterpriseRows(),dx.lookPage),rows=page.rows;
  return rows.length?`${dxTable(['底层企业','产业与所在地','覆盖区域','直投 / 间接','投资路径','路径测算金额','操作'],rows.map(x=>{
    const regions=[...new Set(x.relations.map(p=>p.region))],value=x.relations.reduce((s,p)=>s+p.amount,0);
    return `<tr><td><button class="dx-link strong" data-dx-action="open-enterprise" data-name="${dxE(x.name)}">${dxE(x.name)}</button><small>${x.relations.length>1?dxPill('重复投资','amber'):''}</small></td><td>${dxE(x.relations[0].sector)}<small>${dxE(x.relations[0].place)}</small></td><td>${regions.map(id=>dxPill(dxRegion(id).city,'blue')).join(' ')}</td><td>${x.relations.filter(p=>p.kind==='direct').length} / ${x.relations.filter(p=>p.kind==='indirect').length}</td><td>${x.relations.length} 条</td><td>${dxMoney(value)} 亿</td><td><button class="dx-link" data-dx-action="open-enterprise" data-name="${dxE(x.name)}">查看关系 ↗</button></td></tr>`;
  }))}${dxPager(page,'look-page')}`:dxBlank('没有符合条件的企业。');
}
function dxManagerTable(){
  const page=dxPage(dxManagerFiltered(),dx.lookPage),rows=page.rows;
  return rows.length?`${dxTable(['基金管理人','覆盖区域','管理子基金','基金目标规模','底层企业','操作'],rows.map(x=>{
    const regions=[...new Set(x.funds.map(f=>f.region))],ids=new Set(x.funds.map(f=>f.id)),enterprises=new Set(dxPaths.filter(p=>ids.has(p.fundId)).map(p=>p.enterprise));
    return `<tr><td><button class="dx-link strong" data-dx-action="open-manager" data-name="${dxE(x.name)}">${dxE(x.name)}</button><small>${regions.length>1?dxPill('跨区域管理','amber'):dxFieldSource(x.funds[0])}</small></td><td>${regions.map(id=>dxPill(dxRegion(id).city,'blue')).join(' ')}</td><td>${x.funds.length} 支</td><td>${dxMoney(dxSum(x.funds,'size'))} 亿</td><td>${enterprises.size} 家</td><td><button class="dx-link" data-dx-action="open-manager" data-name="${dxE(x.name)}">查看网络 ↗</button></td></tr>`;
  }))}${dxPager(page,'look-page')}`:dxBlank('没有符合条件的管理人。');
}
function dxLookFilters(){
  return `<div class="dx-filters"><label>搜索<input id="dxLookQuery" value="${dxE(dx.lookQuery)}" placeholder="企业、管理人或基金"></label><label>触达区域<select id="dxLookRegion"><option value="全部">全部区域</option>${dxRegions.map(r=>`<option value="${r.id}" ${dx.lookRegion===r.id?'selected':''}>${r.city} · ${r.short}</option>`).join('')}</select></label>${dx.lookTab==='enterprise'?`<label>产业方向<select id="dxLookSector">${dxOptions(dxEnterpriseRelations().map(p=>p.sector),dx.lookSector)}</select></label>`:''}</div>`;
}
function dxEnterpriseList(){
  const all=dxEnterprisePopulation(),relations=dxEnterpriseRelations(),duplicates=all.filter(x=>x.relations.length>1),cross=all.filter(x=>new Set(x.relations.map(p=>p.region)).size>1);
  const groups=dxCountGroups(all,x=>dxIndustry(x.relations[0].sector)).slice(0,7);
  return `<div class="dx-metrics">${dxMetric('去重后项目',all.length,'家','直投 + 子基金底层')}${dxMetric('投资关系',relations.length,'条','一笔直投或一条间接路径')}${dxMetric('重复投资项目',duplicates.length,'家','同一主体关联多条关系','look-duplicates')}${dxMetric('跨区域项目',cross.length,'家','覆盖多个区域基金','look-cross')}</div>
    ${dx.lookMode==='all'||typeof ltModeIntro!=='function'?dxPanel('去重项目产业分布',dxDonut(groups,'enterprise-industry','家'),'按企业主体计数，同一企业仅计一次。'):ltModeIntro()}
    ${dxModeSwitch()}${dxLookFilters()}${dxPanel(dx.lookMode==='duplicates'?'重复投资项目':dx.lookMode==='cross'?'跨区域项目':'去重项目清单',`<div id="dxLookResults">${dxEnterpriseTable()}</div>`,'支持按区域、产业和名称筛选；每页 10 条。')}`;
}
function dxManagerList(){
  const all=dxManagerRows(),cross=all.filter(x=>new Set(x.funds.map(f=>f.region)).size>1),duplicates=all.filter(x=>x.funds.length>1);
  return `<div class="dx-metrics">${dxMetric('去重管理人',all.length,'家','按机构名称归并')}${dxMetric('管理关系',dxFunds.length,'条','一支基金对应一条')}${dxMetric('重复管理关系',duplicates.length,'家','管理多支子基金')}${dxMetric('跨区域管理人',cross.length,'家','覆盖多个区域')}</div>
    <button class="dx-manager-highlight" data-dx-action="open-manager" data-name="演示·南棠投资管理机构"><div><small>重点关系 · 跨三地</small><h3>演示·南棠投资管理机构</h3><p>深圳 1 支 · 上海 1 支 · 北京 1 支子基金，共同连接底层企业。</p></div><strong>3<em>支基金</em></strong><span>查看管理网络 ↗</span></button>
    ${dxModeSwitch()}${dxLookFilters()}${dxPanel(dx.lookMode==='duplicates'?'重复管理关系统计':'去重管理人网络',`<div id="dxLookResults">${dxManagerTable()}</div>`,'支持筛选与分页；完整档案请进入基金管理人库。')}`;
}
function dxCapitalLookthrough(){
  const regions=dxRegions.filter(r=>dx.lookRegion==='全部'||r.id===dx.lookRegion),fs=dxFunds.filter(f=>dx.lookRegion==='全部'||f.region===dx.lookRegion),ds=dxDeals.filter(d=>dx.lookRegion==='全部'||d.region===dx.lookRegion),profiles=regions.map(r=>dxRegionProfile(r.id));
  const commit=dxSum(profiles,'commitment'),paid=dxSum(profiles,'paid'),fundCommit=fs.reduce((s,f)=>s+dxFundMeta(f).committed,0),fundPaid=fs.reduce((s,f)=>s+dxFundMeta(f).paid,0),directPlan=dxSum(ds,'request'),fundSource=fs.some(f=>window.wbFundData?.(f.id))?'已确认报送 + 演示基线':'演示';
  const filtered=fs.filter(f=>`${f.name} ${f.manager} ${dxRegion(f.region).city}`.toLowerCase().includes(dx.capitalQuery.toLowerCase())).sort((a,b)=>dx.capitalSort==='request'?b.request-a.request:dx.capitalSort==='paid'?dxFundMeta(b).paid-dxFundMeta(a).paid:a.name.localeCompare(b.name,'zh-CN'));
  const fundPage=dxPage(filtered,dx.capitalPage);
  return `<div class="dx-scope-tabs" role="tablist" aria-label="资金穿透区域">${[['全部','总体'],...dxRegions.map(r=>[r.id,r.city])].map(([id,label])=>`<button role="tab" class="${dx.lookRegion===id?'selected':''}" data-dx-action="capital-scope" data-value="${id}" aria-selected="${dx.lookRegion===id}">${label}</button>`).join('')}</div>
    <div class="dx-metrics">${dxMetric('国家基金实缴',dxMoney(paid),'亿元',`认缴 ${dxMoney(commit)} 亿`)}${dxMetric('对子基金认缴',dxMoney(fundCommit),'亿元',`子基金层 · ${fundSource}`)}${dxMetric('对子基金实缴',dxMoney(fundPaid),'亿元',`子基金层 · ${fundSource}`)}${dxMetric('直投申请 / 拟出资',dxMoney(directPlan),'亿元',`${ds.length} 笔 · 非实缴`)}</div>
    ${dxPanel('资金穿透链',`<div class="dx-capital-branches"><div class="dx-capital-root"><span>国家基金 → 区域母基金</span><strong>${dxMoney(paid)} 亿</strong><small>已实缴 / 认缴 ${dxMoney(commit)} 亿</small></div><div class="dx-capital-branch"><span>区域母基金 → 子基金</span><strong>${dxMoney(fundPaid)} 亿</strong><small>已实缴 / 认缴 ${dxMoney(fundCommit)} 亿 · 演示</small></div><div class="dx-capital-branch direct"><span>区域母基金 → 直投</span><strong>${dxMoney(directPlan)} 亿</strong><small>申请 / 拟出资 · ${ds.length} 笔；不等于实缴</small></div></div>`,'区域母基金 → 子基金 / 直投；两条分支金额口径不同，不可相加为已支付金额。')}
    ${dxPanel('区域出资结构',`<div class="dx-capital-region-grid">${regions.map(r=>{const p=dxRegionProfile(r.id),funds=dxRegionFunds(r.id),deals=dxRegionDeals(r.id);return `<article class="dx-capital-region"><button class="dx-link strong" data-dx-action="open-region" data-id="${r.id}">${r.city} · ${r.short} ↗</button><div class="dx-capital-region-intro">国家基金实缴 <b>${dxMoney(p.paid)} 亿</b><small>认缴 ${dxMoney(p.commitment)} 亿 · ${dxPct(p.paid,p.commitment)}%</small></div><div class="dx-capital-region-splits"><div><span>子基金 · ${funds.length} 支</span><b>${dxMoney(funds.reduce((s,f)=>s+dxFundMeta(f).paid,0))} 亿</b><small>实缴 / 认缴 ${dxMoney(funds.reduce((s,f)=>s+dxFundMeta(f).committed,0))} 亿 · 演示</small></div><div><span>直投 · ${deals.length} 笔</span><b>${dxMoney(dxSum(deals,'request'))} 亿</b><small>申请 / 拟出资 · 非实缴</small></div></div></article>`}).join('')}</div>`,'按区域分开查看子基金与直投。')}
    ${dxPanel('子基金资金明细',`<div class="dx-register-tools"><label>检索子基金或管理人<input id="dxCapitalQuery" value="${dxE(dx.capitalQuery)}" placeholder="名称、管理人、区域"></label><label>排序<select id="dxCapitalSort"><option value="name" ${dx.capitalSort==='name'?'selected':''}>名称</option><option value="request" ${dx.capitalSort==='request'?'selected':''}>拟出资额 ↓</option><option value="paid" ${dx.capitalSort==='paid'?'selected':''}>实缴额 ↓</option></select></label></div><div id="dxCapitalResults">${dxCapitalTable(fundPage)}</div>`,'筛选后分页显示，每页 10 支。')}
    ${dxPanel('直投资金明细',ds.length?dxTable(['区域','直投项目','产业','申请 / 拟出资','阶段'],ds.slice(0,10).map(d=>`<tr><td>${dxRegion(d.region).city}</td><td><button class="dx-link strong" data-dx-action="open-deal" data-id="${d.id}">${dxE(d.name)}</button></td><td>${dxE(d.sector)}</td><td>${dxMoney(d.request)} 亿</td><td>${dxPill(dxDealMeta(d).stage,'blue')}</td></tr>`)):dxBlank('无直投项目。'),'直投为独立出资路径；完整项目可进入直投项目库。',`<button data-dx-action="dashboard-deals">查看全部直投 ↗</button>`)}`;
}
function dxCapitalTable(page){return page.total?`${dxTable(['区域','子基金','管理人','区域申请 / 拟出资','认缴','实缴','进度'],page.rows.map(f=>{const m=dxFundMeta(f);return `<tr><td>${dxRegion(f.region).city}</td><td><button class="dx-link strong" data-dx-action="open-fund" data-id="${f.id}">${dxE(f.name)}</button></td><td><button class="dx-link" data-dx-action="open-manager" data-name="${dxE(f.manager)}">${dxE(f.manager)}</button></td><td>${dxMoney(f.request)} 亿</td><td>${dxMoney(m.committed)} 亿</td><td>${dxMoney(m.paid)} 亿</td><td>${dxPct(m.paid,m.committed)}%</td></tr>`;}))}${dxPager(page,'capital-page')}`:dxBlank('没有匹配的子基金。')}
function dxCapitalResults(){const rows=dxFunds.filter(f=>(dx.lookRegion==='全部'||f.region===dx.lookRegion)&&`${f.name} ${f.manager} ${dxRegion(f.region).city}`.toLowerCase().includes(dx.capitalQuery.toLowerCase())).sort((a,b)=>dx.capitalSort==='request'?b.request-a.request:dx.capitalSort==='paid'?dxFundMeta(b).paid-dxFundMeta(a).paid:a.name.localeCompare(b.name,'zh-CN'));return dxCapitalTable(dxPage(rows,dx.capitalPage))}
function dxEnterpriseDetail(name){
  if(typeof ltEnterpriseDetail==='function')return ltEnterpriseDetail(name);
  const rs=dxEnterpriseRelations().filter(p=>p.enterprise===name);if(!rs.length)return dxBlank('企业未找到');
  const regionIds=[...new Set(rs.map(p=>p.region))],direct=rs.filter(p=>p.kind==='direct'),indirect=rs.filter(p=>p.kind==='indirect');
  return `${dxCrumb([{label:'穿透管理',action:'back-lookthrough'},{label:name}])}<div class="dx-detail-hero look"><div><div class="dx-tags">${dxPill('去重企业主体','teal')}${rs.length>1?dxPill('重复投资','amber'):''}</div><h1>${dxE(name)}</h1><p>${dxE(rs[0].sector)}　·　${dxE(rs[0].place)}</p></div><div class="dx-detail-hero-fig"><span>投资关系</span><strong>${rs.length}<small>条</small></strong><em>直投与间接路径不重复计数</em></div></div>
    <div class="dx-metrics">${dxMetric('触达区域',regionIds.length,'个','按区域去重')}${dxMetric('直投记录',direct.length,'笔','申请 / 拟出资')}${dxMetric('子基金路径',indirect.length,'条','演示穿透')}${dxMetric('关联金额',dxMoney(rs.reduce((s,p)=>s+p.amount,0)),'亿元','拟出资与间接测算混合口径')}</div>
    ${dxPanel('完整投资关系列表',dxTable(['区域','投资类型','投资主体','金额口径','金额'],rs.map(p=>{const object=p.kind==='direct'?dxDeal(p.dealId):dxFund(p.fundId);return `<tr><td>${dxRegion(p.region).city}</td><td>${p.kind==='direct'?'直投':'子基金间接'}</td><td><button class="dx-link" data-dx-action="${p.kind==='direct'?'open-deal':'open-fund'}" data-id="${object.id}">${dxE(object.name)}</button></td><td>${p.kind==='direct'?'申请 / 拟出资':'归属测算 · 演示'}</td><td>${dxMoney(p.amount)} 亿</td></tr>`})),'直投演示样本申请额与间接路径测算额不可视为同一实缴口径。')}`;
}
function dxManagerDetail(name){
  const row=dxManagerRows().find(x=>x.name===name);if(!row)return dxBlank('管理人未找到');
  const fs=row.funds,regions=[...new Set(fs.map(f=>f.region))],ids=new Set(fs.map(f=>f.id)),ps=dxPaths.filter(p=>ids.has(p.fundId)),enterprises=[...new Set(ps.map(p=>p.enterprise))];
  return `${dxCrumb([{label:'穿透管理',action:'back-lookthrough'},{label:name}])}<div class="dx-detail-hero manager"><div><div class="dx-tags">${dxPill('基金管理人','blue')}${regions.length>1?dxPill('跨区域管理','amber'):''}</div><h1>${dxE(name)}</h1><p>覆盖 ${regions.map(id=>dxRegion(id).city).join(' · ')}　·　管理 ${fs.length} 支子基金</p></div><div class="dx-detail-hero-fig"><span>管理基金规模</span><strong>${dxMoney(dxSum(fs,'size'))}<small>亿元</small></strong><em>${enterprises.length} 家底层企业</em></div></div>
    <div class="dx-metrics">${dxMetric('覆盖区域',regions.length,'个','管理人归并')}${dxMetric('管理子基金',fs.length,'支','多区域组合')}${dxMetric('区域拟出资',dxMoney(dxSum(fs,'request')),'亿元','按基金汇总')}${dxMetric('底层企业',enterprises.length,'家','按企业去重')}</div>
    ${dxPanel('跨区域管理架构',`<div class="dx-manager-network"><div class="dx-manager-root">${dxE(name)}</div><div class="dx-manager-columns">${dxRegions.map(r=>{const group=fs.filter(f=>f.region===r.id);return `<div><button class="dx-manager-region" data-dx-action="open-region" data-id="${r.id}">${r.city}<small>${r.short} ↗</small></button>${group.length?group.map(f=>`<button class="dx-manager-fund" data-dx-action="open-fund" data-id="${f.id}"><b>${dxE(f.name)}</b><small>${dxE(f.sector)} · ${dxMoney(f.size)} 亿</small></button>`).join(''):'<span class="dx-manager-none">—</span>'}</div>`}).join('')}</div></div>`,'从管理人进入任一地区的子基金档案。')}
    <div class="dx-card-grid two">${dxPanel('所管基金',dxTable(['区域','基金','行业','规模','阶段'],fs.map(f=>`<tr><td>${dxName(f.region)}</td><td><button class="dx-link" data-dx-action="open-fund" data-id="${f.id}">${dxE(f.name)}</button></td><td>${dxE(f.sector)}</td><td>${dxMoney(f.size)} 亿</td><td>${dxPill(dxFundStage(f),'blue')}</td></tr>`)))}
      ${dxPanel('底层企业触达',enterprises.length?dxTable(['企业','关联基金','投资路径'],enterprises.map(company=>{const rows=ps.filter(p=>p.enterprise===company);return `<tr><td><button class="dx-link" data-dx-action="open-enterprise" data-name="${dxE(company)}">${dxE(company)}</button></td><td>${rows.length} 支</td><td><button class="dx-link" data-dx-action="open-enterprise" data-name="${dxE(company)}">查看全部路径 ↗</button></td></tr>`})):dxBlank('当前管理基金尚无底层企业记录。'),'可从企业再反查其他区域及直投路径。')}</div>`;
}
const dxManagerNotes=(()=>{try{return JSON.parse(localStorage.getItem('diki-public-demo-manager-notes')||'{}')}catch{return {}}})();
const dxManagerProspectKey='diki-public-demo-manager-prospects-v1';
const dxManagerProspectStages=['潜在对接','接触中','尽调中','暂缓跟进'];
const dxManagerProspects=(()=>{try{const saved=JSON.parse(localStorage.getItem(dxManagerProspectKey)||'null');if(Array.isArray(saved))return saved}catch{}return [
  {name:'湾区智能制造投资团队（演示）',region:'shenzhen',stage:'潜在对接',focus:'高端装备与机器人',source:'演示线索',lastContact:'',nextAction:'核实机构主体与投资团队',nextDate:'',history:[]},
  {name:'长三角生命科学投资机构（演示）',region:'shanghai',stage:'接触中',focus:'生物医药与医疗器械',source:'演示线索',lastContact:'',nextAction:'安排策略交流并索取基金业绩材料',nextDate:'',history:[]},
  {name:'京津冀硬科技投资团队（演示）',region:'beijing',stage:'尽调中',focus:'半导体与集成电路',source:'演示线索',lastContact:'',nextAction:'核验团队履历及过往项目归属',nextDate:'',history:[]}
]})();
const dxManagerDirectoryRows=()=>[
  ...dxManagerProspects.filter(p=>!dxManagerRows().some(x=>x.name===p.name)).map(p=>({...p,kind:'prospect',funds:[],regionIds:[p.region]})),
  ...dxManagerRows().map(x=>({...x,kind:'linked',stage:'已立项入库',regionIds:[...new Set(x.funds.map(f=>f.region))]}))
];
const dxManagerProspectSave=()=>{try{localStorage.setItem(dxManagerProspectKey,JSON.stringify(dxManagerProspects));return true}catch{return false}};
function dxManagerLibraryRows(){return dxManagerDirectoryRows().filter(x=>(dx.managerRegion==='全部'||x.regionIds.includes(dx.managerRegion))&&(dx.managerStage==='全部'||x.stage===dx.managerStage)&&`${x.name} ${x.funds.map(f=>f.name).join(' ')} ${x.focus||''}`.toLowerCase().includes(dx.managerQuery.toLowerCase()))}
function dxManagerLibraryResults(){
  const page=dxPage(dxManagerLibraryRows(),dx.managerPage);
  return page.total?`${dxTable(['机构 / 来源','跟进阶段','对接区域','关联子基金','目标规模口径','档案'],page.rows.map(x=>`<tr><td><button class="dx-link strong" data-dx-action="open-manager" data-name="${dxE(x.name)}">${dxE(x.name)}</button><small>${x.kind==='prospect'?'线索档案 · '+dxE(x.source||'本地录入'):x.funds.some(f=>f.origin==='source')?'演示样本 / 演示基金关联':'演示基金关联'}</small></td><td>${dxPill(x.stage,x.kind==='prospect'?'amber':'teal')}</td><td>${x.regionIds.map(id=>dxPill(dxRegion(id).city,'blue')).join(' ')}</td><td>${x.funds.length?`${x.funds.length} 支`:'尚未关联'}</td><td>${x.funds.length?`${dxMoney(dxSum(x.funds,'size'))} 亿 · 基金目标规模`:'— · 未核实'}</td><td><button class="dx-link" data-dx-action="open-manager" data-name="${dxE(x.name)}">进入档案 ↗</button></td></tr>`))}${dxPager(page,'manager-page')}`:dxBlank('没有匹配的机构。');
}
function dxManagerDossier(name){
  const prospect=dxManagerProspects.find(p=>p.name===name&&!dxManagerRows().some(x=>x.name===name));
  if(prospect)return dxManagerProspectDossier(prospect);
  const row=dxManagerRows().find(x=>x.name===name);if(!row)return dxBlank('管理人未找到');
  const fs=row.funds,regions=[...new Set(fs.map(f=>f.region))],ids=new Set(fs.map(f=>f.id)),ps=dxPaths.filter(p=>ids.has(p.fundId)),notes=dxManagerNotes[name]||{};
  const noteField=(key,label,placeholder)=>`<label>${label}<textarea name="${key}" rows="3" placeholder="${placeholder}">${dxE(notes[key]||'')}</textarea></label>`;
  return `${dxCrumb([{label:'基金管理人',action:'back-managers'},{label:name}])}<div class="dx-detail-hero manager"><div><div class="dx-tags">${dxPill('机构档案','blue')}${regions.length>1?dxPill('跨区域管理','amber'):''}</div><h1>${dxE(name)}</h1><p>覆盖 ${regions.map(id=>dxRegion(id).city).join(' · ')} · 关联 ${fs.length} 支子基金</p></div><div class="dx-detail-hero-fig"><span>关联基金目标规模</span><strong>${dxMoney(dxSum(fs,'size'))}<small>亿元</small></strong><em>非管理资产实缴余额</em></div></div>
    <div class="dx-metrics">${dxMetric('管理基金',fs.length,'支','当前清单')}${dxMetric('覆盖区域',regions.length,'个','按区域去重')}${dxMetric('关联底层项目',new Set(ps.map(p=>p.enterprise)).size,'家','演示穿透')}${dxMetric('区域拟出资',dxMoney(dxSum(fs,'request')),'亿元','基金申请额合计')}</div>
    <div class="dx-card-grid two">${dxPanel('机构档案',`<div class="dx-field-grid"><div><span>机构名称</span><b>${dxE(name)}</b>${dxFieldSource(fs[0])}</div><div><span>覆盖区域</span><b>${regions.map(id=>dxRegion(id).city).join(' / ')}</b></div><div><span>管理基金目标规模</span><b>${dxMoney(dxSum(fs,'size'))} 亿元</b><small>按所管子基金目标规模合计，非实际 AUM。</small></div><div><span>机构登记 / 管理资产净值</span><b>待补录</b></div></div>`)}
      ${dxPanel('团队履历',`<div class="dx-manager-note-view">${dxE(notes.team||'待补录核心团队成员、职责与履历。')}</div>`,'需提供人员信息及可核验来源。')}</div>
    <div class="dx-card-grid two">${dxPanel('历史业绩与履职评价',`<div class="dx-field-grid"><div><span>退出与回报</span><b>${dxE(notes.performance||'待补录')}</b></div><div><span>报告与履职评价</span><b>${dxE(notes.duty||'待补录')}</b></div></div><p class="dx-muted-note">暂无经核验的 IRR、DPI 或履职评分；以下备注由工作台本地录入。</p>`)}
      ${dxPanel('合作评价与关注问题',`<div class="dx-field-grid"><div><span>其他合作记录</span><b>${dxE(notes.cooperation||'待补录')}</b></div><div><span>关注问题</span><b>${dxE(notes.issues||'待补录')}</b></div></div>`,'补充信息由本地录入，须核验后用于正式评价。')}</div>
    ${dxPanel('管理规模与合作记录',dxTable(['区域','合作子基金','产业方向','基金目标规模','当前阶段'],fs.map(f=>`<tr><td>${dxRegion(f.region).city}</td><td><button class="dx-link strong" data-dx-action="open-fund" data-id="${f.id}">${dxE(f.name)}</button></td><td>${dxE(f.sector)}</td><td>${dxMoney(f.size)} 亿</td><td>${dxPill(dxFundStage(f),'blue')}</td></tr>`)),'合作记录以当前清单所列子基金为准，非完整历史合作库。')}
    ${dxPanel('团队履历、问题与合作补充',`<form id="dxManagerNoteForm" data-name="${dxE(name)}" class="dx-manager-note-form">${noteField('team','核心团队及履历','填写团队成员、职责与可核实的履历')}${noteField('performance','历史业绩 / 退出','填写统计期间、退出项目及收益口径')}${noteField('duty','履职评价','填写报告质量、投后管理与合规表现')}${noteField('issues','关注问题','填写风险、缺失材料及跟进事项')}${noteField('cooperation','其他合作记录','填写与本基金清单之外的合作，并注明来源')}<button class="dx-outline" type="submit">保存本地档案</button><small>仅保存在当前浏览器；未上传服务器。未核验资料请注明来源。</small></form>`,'可补录的演示档案，不将空白字段臆造为事实。')}`;
}
function dxManagerProspectDossier(p){
  const notes=dxManagerNotes[p.name]||{};
  const field=(label,name,value,type='text')=>`<label>${label}<input name="${name}" type="${type}" value="${dxE(value||'')}"></label>`;
  return `${dxCrumb([{label:'基金管理人',action:'back-managers'},{label:p.name}])}<div class="dx-detail-hero manager"><div><div class="dx-tags">${dxPill('未立项线索','amber')}${dxPill(p.stage,'blue')}</div><h1>${dxE(p.name)}</h1><p>${dxRegion(p.region).city} · ${dxE(p.focus||'投资方向待补充')} · ${dxE(p.source||'本地录入')}</p></div><div class="dx-detail-hero-fig"><span>关联子基金</span><strong>0<small>支</small></strong><em>管理规模 / 业绩尚待核验</em></div></div>
    <div class="dx-metrics">${dxMetric('当前阶段',dxE(p.stage),'','机构接触进程')}${dxMetric('对接区域',dxRegion(p.region).city,'','意向范围')}${dxMetric('关联子基金',0,'支','尚未立项入库')}${dxMetric('基金目标规模','—','','尚无关联基金')}</div>
    <div class="dx-card-grid two">${dxPanel('线索与跟进',`<div class="dx-field-grid"><div><span>线索来源</span><b>${dxE(p.source||'待补充')}</b></div><div><span>投资方向</span><b>${dxE(p.focus||'待补充')}</b></div><div><span>最近接触</span><b>${dxE(p.lastContact||'尚未记录')}</b></div><div><span>下一步动作</span><b>${dxE(p.nextAction||'待安排')}</b><small>${dxE(p.nextDate||'日期待定')}</small></div></div>`,'线索与接触进程不等于已入库管理人。')}
      ${dxPanel('资料与核验',`<div class="dx-field-grid"><div><span>团队履历</span><b>${dxE(notes.team||'待提供 / 待核验')}</b></div><div><span>历史业绩</span><b>${dxE(notes.performance||'待提供 / 待核验')}</b></div><div><span>关注问题</span><b>${dxE(notes.issues||'待补充')}</b></div><div><span>合作记录</span><b>${dxE(notes.cooperation||'尚无已关联子基金')}</b></div></div>`,'空白不推断为负面评价。')}</div>
    ${dxPanel('更新接触进程',`<form id="dxManagerProspectUpdate" data-name="${dxE(p.name)}" class="dx-manager-prospect-form"><label>跟进阶段<select name="stage">${dxManagerProspectStages.map(s=>`<option value="${s}" ${p.stage===s?'selected':''}>${s}</option>`).join('')}</select></label><label>对接区域<select name="region">${dxRegions.map(r=>`<option value="${r.id}" ${p.region===r.id?'selected':''}>${r.city}</option>`).join('')}</select></label>${field('投资方向','focus',p.focus)}${field('线索来源','source',p.source)}${field('最近接触日期','lastContact',p.lastContact,'date')}${field('下次跟进日期','nextDate',p.nextDate,'date')}<label class="wide">下一步动作<textarea name="nextAction" rows="2">${dxE(p.nextAction||'')}</textarea></label><button class="dx-outline" type="submit">保存跟进记录</button><small>保存后记录状态变更轨迹；仅在当前浏览器有效。</small></form>`)}
    ${dxPanel('接触记录',p.history?.length?`<div class="dx-manager-prospect-history">${p.history.slice().reverse().map(h=>`<div><time>${dxE(h.at)}</time><b>${dxE(h.stage)}</b><span>${dxE(h.action||'跟进资料更新')}</span></div>`).join('')}</div>`:dxBlank('暂无接触记录。首次保存后开始留痕。'))}
    ${dxPanel('团队与问题补充',`<form id="dxManagerNoteForm" data-name="${dxE(p.name)}" class="dx-manager-note-form"><label>核心团队及履历<textarea name="team" rows="3">${dxE(notes.team||'')}</textarea></label><label>历史业绩 / 退出<textarea name="performance" rows="3">${dxE(notes.performance||'')}</textarea></label><label>履职评价<textarea name="duty" rows="3">${dxE(notes.duty||'')}</textarea></label><label>关注问题<textarea name="issues" rows="3">${dxE(notes.issues||'')}</textarea></label><label>合作记录<textarea name="cooperation" rows="3">${dxE(notes.cooperation||'')}</textarea></label><button class="dx-outline" type="submit">保存本地档案</button><small>未核验材料请注明来源。</small></form>`)} `;
}
function renderDxManagers(){
  const linked=dxManagerRows(),all=dxManagerDirectoryRows();
  host('managers').innerHTML=dx.manager?dxManagerDossier(dx.manager):`${dxHead('MANAGER LIBRARY / PARTNER PIPELINE','基金管理人库','从潜在对接、接触与尽调，到已立项入库的完整机构线索与合作档案。')}
    <div class="dx-metrics">${dxMetric('机构线索与档案',all.length,'家','按名称归并')}${dxMetric('潜在 / 接触中',dxManagerProspects.filter(p=>['潜在对接','接触中'].includes(p.stage)).length,'家','未立项线索')}${dxMetric('尽调中',dxManagerProspects.filter(p=>p.stage==='尽调中').length,'家','材料核验')}${dxMetric('已立项入库',linked.length,'家','已关联子基金')}</div>
    <details class="dx-manager-add"><summary>＋ 新增潜在管理人线索</summary><form id="dxManagerProspectCreate" class="dx-manager-prospect-form"><label>机构名称<input name="name" required placeholder="填写机构全称"></label><label>对接区域<select name="region">${dxRegions.map(r=>`<option value="${r.id}">${r.city}</option>`).join('')}</select></label><label>跟进阶段<select name="stage">${dxManagerProspectStages.map(s=>`<option value="${s}">${s}</option>`).join('')}</select></label><label>投资方向<input name="focus" placeholder="例如：高端装备"></label><label>线索来源<input name="source" placeholder="例如：机构自荐 / 活动接触"></label><label>下次跟进日期<input name="nextDate" type="date"></label><label class="wide">下一步动作<textarea name="nextAction" rows="2" placeholder="记录拟核实的信息或安排"></textarea></label><button class="dx-outline" type="submit">加入机构库</button><small>新增线索不自动计入合作基金或穿透统计。</small></form></details>
    <div class="dx-filters"><label>搜索机构、基金或方向<input id="dxManagerQuery" value="${dxE(dx.managerQuery)}" placeholder="输入名称或方向"></label><label>对接区域<select id="dxManagerRegion"><option value="全部">全部区域</option>${dxRegions.map(r=>`<option value="${r.id}" ${dx.managerRegion===r.id?'selected':''}>${r.city}</option>`).join('')}</select></label><label>跟进阶段<select id="dxManagerStage"><option value="全部">全部阶段</option>${[...dxManagerProspectStages,'已立项入库'].map(s=>`<option value="${s}" ${dx.managerStage===s?'selected':''}>${s}</option>`).join('')}</select></label></div>
    ${dxPanel('机构清单',`<div id="dxManagerResults">${dxManagerLibraryResults()}</div>`,'潜在机构与已立项机构分口径展示；筛选与分页显示，每页 10 家。')}`;
}
function renderDxLookthrough(){
  let content;
  if(dx.lookTab==='enterprise'&&dx.enterprise)content=dxEnterpriseDetail(dx.enterprise);
  else if(dx.lookTab==='manager'&&dx.manager)content=dxManagerDetail(dx.manager);
  else content=`${dxHead('LOOK-THROUGH / INVESTMENT NETWORK','穿透管理','',`${dxAiButton('AI分析投资网络','ai-lookthrough')}${`<button class="dx-outline" data-dx-action="export-paths">导出投资路径 ↓</button>`}`)}
    ${dxDataNotice(dx.lookRegion)}${dxStrip('lookTab',[['capital','资金穿透'],['enterprise','企业穿透'],['manager','管理人穿透']])}${dx.lookTab==='capital'?dxCapitalLookthrough():dx.lookTab==='enterprise'?dxEnterpriseList():dxManagerList()}`;
  host('lookthrough').innerHTML=content;
}
function dxDashboardExportData(){
  const rows=[['记录类型','区域','对象','数量','认缴/目标规模（亿元）','实缴/申请拟出资（亿元）','单支/单笔均额（亿元）','产业','注册城市','阶段/轮次','数据来源']];
  dxRegions.forEach(r=>{const p=dxRegionProfile(r.id),fs=dxRegionFunds(r.id),ds=dxRegionDeals(r.id);rows.push(['区域基金',r.city,r.name,1,p.commitment,p.paid,'','','','','演示']);rows.push(['子基金汇总',r.city,'子基金',fs.length,'',dxSum(fs,'request'),dxMoney(dxSum(fs,'request')/(fs.length||1)),'','','','汇总']);rows.push(['直投汇总',r.city,'直投项目',ds.length,'',dxSum(ds,'request'),dxMoney(dxSum(ds,'request')/(ds.length||1)),'','','','汇总']);});
  dxFunds.forEach(f=>rows.push(['子基金',dxRegion(f.region).city,f.name,1,f.size,f.request,'',dxIndustry(f.sector),dxGeo(f.place),dxFundStage(f),f.origin==='source'?'深圳演示样本':'演示']));
  dxDeals.forEach(d=>rows.push(['直投项目',dxRegion(d.region).city,d.name,1,d.round,d.request,'',dxIndustry(d.sector),dxGeo(d.place),dxDealRound(d),d.origin==='source'?'深圳演示样本':'演示']));
  dxPaths.filter(p=>p.kind==='indirect').forEach(p=>rows.push(['子基金底层项目',dxRegion(p.region).city,p.enterprise,1,'',p.invest,'',dxIndustry(p.sector),dxGeo(p.place),'穿透路径','演示']));
  rows[0].push('基础数据截至','口径说明');
  for(const row of rows.slice(1)){const original=row[1]==='深圳'&&['子基金汇总','直投汇总','子基金','直投项目'].includes(row[0]);row.push(original?sourceWorkbook.asOf:demoScenario.asOf,original?sourceWorkbook.fileName+' · 立项 / 申请口径':'演示情景，非演示样本实缴或已投');}
  download('母基金驾驶舱_汇总与明细.csv',csv(rows),'text/csv;charset=utf-8');showToast('驾驶舱数据已导出');
}
function dxDashboardReport(){
  const profiles=dxRegions.map(r=>({r,p:dxRegionProfile(r.id),fs:dxRegionFunds(r.id),ds:dxRegionDeals(r.id)}));
  const commit=dxSum(profiles.map(x=>x.p),'commitment'),paid=dxSum(profiles.map(x=>x.p),'paid');
  const regionTable=profiles.map(({r,p,fs,ds})=>`<tr><td>${r.city}</td><td>${dxMoney(p.commitment,0)}</td><td>${dxMoney(p.paid,0)}</td><td>${fs.length}</td><td>${dxMoney(dxSum(fs,'request'))}</td><td>${dxMoney(dxSum(fs,'request')/(fs.length||1))}</td><td>${ds.length}</td><td>${dxMoney(dxSum(ds,'request'))}</td><td>${dxMoney(dxSum(ds,'request')/(ds.length||1))}</td></tr>`).join('');
  const bars=kind=>{const counts=profiles.map(x=>kind==='fund'?x.fs.length:x.ds.length),max=Math.max(...counts);return `<div class="bars">${profiles.map(({r,fs,ds},i)=>{const items=kind==='fund'?fs:ds,avg=dxSum(items,'request')/(items.length||1);return `<div class="bar-col"><div class="bar-track"><div class="bar ${kind}" style="height:${Math.max(7,counts[i]/max*100)}%"><b>${counts[i]}</b></div></div><strong>${r.city}</strong><small>均 ${dxMoney(avg)} 亿</small></div>`}).join('')}</div>`};
  const geography=[['fund','子基金注册地','支'],['direct','直投项目注册地','笔'],['portfolio','底层项目 + 直投注册地','个']].map(([mode,title,unit])=>`<section class="geo"><h3>${title}</h3><div class="geo-grid">${profiles.map(({r})=>{const rows=dxDashboardGeoRows(r.id,mode),groups=dxGeoGroups(rows),max=Math.max(...groups.map(x=>x[1]),1);return `<div><h4>${r.city}基金 <span>${rows.length} ${unit}</span></h4>${groups.slice(0,8).map(([city,n])=>`<div class="geo-row"><span>${dxE(city)}</span><i><em style="width:${n/max*100}%"></em></i><b>${n}</b></div>`).join('')}</div>`}).join('')}</div></section>`).join('');
  const industries=dxIndustryGroups(dxDeals),industryMax=Math.max(...industries.map(x=>x[1]),1);
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>国家创投母基金投资管理驾驶舱 · 图表报告</title><style>*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;color:#183451;background:#f2f6fa;margin:0;padding:30px}main{max-width:1120px;margin:auto}.head{display:flex;justify-content:space-between;align-items:center;gap:20px}.head small{color:#3979b5;font-weight:800;letter-spacing:.1em}.head h1{margin:7px 0 5px;font-size:30px}.head p{margin:0;color:#70869b}.head button{padding:9px 15px;background:#216aa6;border:0;color:#fff;border-radius:7px;cursor:pointer}.card{background:#fff;border:1px solid #dce8f2;border-radius:14px;padding:22px;margin:20px 0;break-inside:avoid}h2{font-size:20px;margin:0 0 15px}h3{font-size:16px;margin:0 0 13px}.capital{background:linear-gradient(115deg,#12304d,#1d5874);color:#fff}.capital-top{display:flex;justify-content:space-between;gap:15px;align-items:center;border-bottom:1px solid #ffffff3a;padding-bottom:16px}.capital-top strong{font-size:29px}.capital-top small{font-size:13px;color:#cce7ee}.flow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:17px}.flow>div{padding:14px;border:1px solid #ffffff51;border-radius:10px;background:#ffffff12}.flow h3{margin:0 0 8px}.flow .line{height:8px;border-radius:5px;background:#ffffff2b;overflow:hidden;margin:8px 0}.flow .line i{display:block;height:100%;background:#53d0be}.flow p{margin:8px 0 0;color:#d4e6ec;font-size:13px}.flow b{color:#fff}table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:right;padding:10px 8px;border-bottom:1px solid #e5edf4;white-space:nowrap}th:first-child,td:first-child{text-align:left}th{color:#617b95;background:#f1f6fb}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}.bars{display:flex;justify-content:space-around;gap:20px;border-bottom:1px solid #d8e6f2;height:232px}.bar-col{flex:1;display:grid;justify-items:center;grid-template-rows:1fr auto auto;min-width:0}.bar-track{height:174px;width:100%;display:flex;align-items:end;justify-content:center}.bar{width:45px;position:relative;border-radius:7px 7px 0 0;background:#3679c6}.bar.direct{background:#35a99f}.bar b{position:absolute;top:-23px;width:100%;text-align:center;color:#255984}.bar-col strong{margin:7px 0 3px}.bar-col small{white-space:nowrap;color:#2f6b99;font-weight:700;margin-bottom:8px}.geo{margin-top:20px;border-top:1px solid #e3edf5;padding-top:16px}.geo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.geo-grid>div{border:1px solid #e4edf5;border-radius:8px;padding:12px;background:#f9fbfd}.geo h4{margin:0 0 9px;color:#245f93}.geo h4 span{float:right;color:#8196aa;font-weight:500}.geo-row{display:grid;grid-template-columns:52px 1fr 20px;align-items:center;gap:8px;margin:7px 0;font-size:12px;color:#587590}.geo-row i{height:8px;border-radius:6px;background:#e5eef7;overflow:hidden}.geo-row em{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#4585d0,#51b6a7)}.geo-row b{text-align:right}.industry-row{display:grid;grid-template-columns:145px 1fr 60px;gap:10px;align-items:center;margin:8px 0;font-size:13px}.industry-row i{height:10px;border-radius:6px;background:#e9f0f6;overflow:hidden}.industry-row em{display:block;height:100%;background:#438bc5}.industry-row b{text-align:right}.note{font-size:12px;color:#8193a5;margin:18px 0}@media(max-width:700px){body{padding:12px}.head{display:block}.flow,.geo-grid,.pair{grid-template-columns:1fr}.card{overflow-x:auto}}@media print{body{background:#fff;padding:0}.head button{display:none}.card{box-shadow:none;margin:12px 0;break-inside:avoid}@page{size:A4 landscape;margin:12mm}}</style></head><body><main><div class="head"><div><small>DILI·FoF / INVESTMENT DESK</small><h1>国家创投母基金投资管理驾驶舱</h1><p>深圳演示样本统计截至 ${sourceWorkbook.asOf}；上海、北京及运营指标为 ${demoScenario.asOf} 演示情景。</p><p>三地区域基金 · 投资组合图表报告</p></div><button onclick="window.print()">打印 / 另存为 PDF</button></div><section class="card capital"><h2>资金布局 · 投资路径</h2><div class="capital-top"><div><small>国家基金认缴</small><br><strong>${dxMoney(commit,0)} 亿</strong></div><div><small>已实缴</small><br><strong>${dxMoney(paid,0)} 亿</strong></div><div><small>实缴率</small><br><strong>${dxPct(paid,commit)}%</strong></div></div><div class="flow">${profiles.map(({r,p,fs,ds})=>`<div><h3>${r.city}区域母基金</h3><small>实缴 ${dxMoney(p.paid,0)} 亿 / 认缴 ${dxMoney(p.commitment,0)} 亿</small><div class="line"><i style="width:${dxPct(p.paid,p.commitment)}%"></i></div><p>子基金 <b>${fs.length} 支 · ${dxMoney(dxSum(fs,'request'))} 亿</b></p><p>直投 <b>${ds.length} 笔 · ${dxMoney(dxSum(ds,'request'))} 亿</b></p></div>`).join('')}</div></section><section class="card"><h2>区域比较</h2><table><thead><tr><th>区域</th><th>认缴 / 亿</th><th>实缴 / 亿</th><th>子基金 / 支</th><th>子基金拟出资 / 亿</th><th>基金均额 / 亿</th><th>直投 / 笔</th><th>直投拟出资 / 亿</th><th>直投均额 / 亿</th></tr></thead><tbody>${regionTable}</tbody></table></section><div class="pair"><section class="card"><h2>子基金区域分布</h2>${bars('fund')}</section></div><section class="card"><h2>投资注册地分布</h2>${geography}</section><section class="card"><h2>直投产业布局</h2>${industries.map(([label,n])=>`<div class="industry-row"><span>${dxE(label)}</span><i><em style="width:${n/industryMax*100}%"></em></i><b>${dxMoney(n)} 亿</b></div>`).join('')}</section><p class="note">深圳立项/申请字段及演示组合混合展示；金额口径为区域申请或拟出资，穿透关系为演示。</p>${bpReportHtml()}</main></body></html>`;
  download('母基金驾驶舱_图表报告.html',html,'text/html;charset=utf-8');showToast('图表报告已导出');
}
function dxRegionExportData(){
  const r=dxRegion(dx.region),p=dxRegionProfile(r.id),rows=[['记录类型','区域','对象','关联子基金或直投','金额（亿元）','产业','注册城市','日期','状态 / 标题','来源']];
  rows.push(['区域基金',r.city,r.name,'',p.paid,'','','',`认缴 ${p.commitment} 亿 / 实缴 ${p.paid} 亿`,'演示']);
  dxRegionFunds(r.id).forEach(f=>rows.push(['子基金',r.city,f.name,'',f.request,dxIndustry(f.sector),dxGeo(f.place),f.origin==='source'?sourceWorkbook.asOf:demoScenario.asOf,dxFundStage(f),f.origin==='source'?sourceWorkbook.fileName:'演示']));
  dxRegionDeals(r.id).forEach(d=>rows.push(['直投项目',r.city,d.name,'',d.request,dxIndustry(d.sector),dxGeo(d.place),d.origin==='source'?sourceWorkbook.asOf:demoScenario.asOf,dxDealMeta(d).stage,d.origin==='source'?sourceWorkbook.fileName:'演示']));
  dxRegionIndirect(r.id).forEach(x=>rows.push(['子基金投资项目',r.city,x.enterprise,dxFund(x.fundId).name,x.invest,dxIndustry(x.sector),dxGeo(x.place),x.date||'','投资路径','演示']));
  dxRegionUpdates(r.id).forEach(u=>rows.push(['正面动态',r.city,u.enterprise,u.fundId?dxFund(u.fundId).name:dxDeal(u.dealId).name,'','', '',u.date,`${u.type} · ${u.title}`,'演示']));
  download(`${r.city}区域母基金_数据.csv`,csv(rows),'text/csv;charset=utf-8');showToast('本区域数据已导出');
}
function dxRegionExportReport(){
  const r=dxRegion(dx.region),p=dxRegionProfile(r.id),fs=dxRegionFunds(r.id),ds=dxRegionDeals(r.id),paths=dxRegionIndirect(r.id),projects=dxRegionPortfolio(r.id),updates=dxRegionUpdates(r.id),industry=dxCountGroups(projects,x=>dxIndustry(x.sector)),total=industry.reduce((n,x)=>n+x[1],0)||1;
  let percent=0;const stops=industry.map(([,n],i)=>{const start=percent;percent+=n/total*100;return `${dxChartColors[i%dxChartColors.length]} ${start}% ${percent}%`}).join(',');
  const max=Math.max(1,...industry.map(x=>x[1]));
  const pathRows=paths.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(x=>`<tr><td>${dxE(x.enterprise)}</td><td>${dxE(dxFund(x.fundId).name)}</td><td>${dxE(dxIndustry(x.sector))}</td><td>${dxE(dxGeo(x.place))}</td><td>${dxMoney(x.invest)}</td><td>${x.date||'—'}</td></tr>`).join('');
  const updateRows=updates.map(u=>`<tr><td>${u.date}</td><td>${dxE(u.type)}</td><td>${dxE(u.enterprise)}</td><td>${u.fundId?'子基金投资':'直投项目'}</td><td>${dxE(u.fundId?dxFund(u.fundId).name:dxDeal(u.dealId).name)}</td><td>${dxE(u.title)}</td></tr>`).join('');
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${r.city}区域母基金 · 图表报告</title><style>*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:#f2f6fa;color:#193b5c;margin:0;padding:28px}main{max-width:1100px;margin:auto}.head{display:flex;justify-content:space-between;align-items:center;gap:20px}.head small{color:#3979b5;font-weight:800}.head h1{font-size:27px;margin:6px 0}.head p{color:#70869b;margin:0}.head button{background:#216aa6;color:#fff;border:0;border-radius:7px;padding:9px 15px;cursor:pointer}.card{background:#fff;border:1px solid #dce8f2;border-radius:12px;padding:20px;margin:17px 0;break-inside:avoid}h2{font-size:19px;margin:0 0 14px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.metrics>div{border:1px solid #e1eaf3;border-radius:9px;padding:14px;background:#f8fbfe}.metrics span{display:block;color:#7690a9;font-size:12px}.metrics strong{display:block;color:#205783;font-size:25px;margin-top:5px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}.allocation{display:grid;grid-template-columns:1fr 1.4fr;gap:12px;align-items:center}.allocation>div:first-child{background:linear-gradient(110deg,#194668,#2a8b94);color:#fff;border-radius:9px;padding:16px}.allocation>div:first-child b{display:block;font-size:24px}.allocation p{display:flex;justify-content:space-between;margin:8px 0;padding:9px;background:#edf5fb;border-radius:6px;font-size:13px}.donut-wrap{display:flex;align-items:center;gap:22px}.donut{width:140px;height:140px;border-radius:50%;flex:none;display:grid;place-items:center}.donut:after{content:'${projects.length} 个项目';display:grid;place-items:center;width:94px;height:94px;border-radius:50%;background:#fff;font-size:15px;font-weight:700;color:#255a86;text-align:center}.industry-row{display:grid;grid-template-columns:150px 1fr 30px;gap:9px;align-items:center;margin:10px 0;font-size:12px}.industry-row i{height:9px;border-radius:6px;background:#e6eef6;overflow:hidden}.industry-row em{display:block;height:100%;background:linear-gradient(90deg,#4385ce,#4cbaa9)}.industry-row b{text-align:right}.dx-region-trend svg{display:block;width:100%;height:auto}.dx-region-trend-caption{display:flex;justify-content:space-between;border-top:1px solid #e6edf4;padding-top:8px;font-size:12px;color:#7189a2}.dx-region-trend-caption b{color:#24649a}table{width:100%;border-collapse:collapse;font-size:12px}th,td{text-align:left;border-bottom:1px solid #e5edf4;padding:9px 7px;vertical-align:top}th{background:#f1f6fb;color:#64819d;white-space:nowrap}.scroll{overflow-x:auto}.note{font-size:11px;color:#8194a8;margin-top:16px}@media(max-width:700px){body{padding:10px}.head{display:block}.metrics,.pair,.allocation{grid-template-columns:1fr 1fr}.pair{display:block}.card{overflow-x:auto}}@media print{body{background:#fff;padding:0}.head button{display:none}.card{break-inside:avoid}@page{size:A4 landscape;margin:12mm}}</style></head><body><main><div class="head"><div><small>DILI·FoF / REGIONAL FUND</small><h1>${r.city} · ${dxE(r.name)}</h1><p>管理机构 ${dxE(p.manager)} · 档案截至 ${r.id==='shenzhen'?sourceWorkbook.asOf:demoScenario.asOf} · 运营演示 ${demoScenario.asOf}</p></div><button onclick="window.print()">打印 / 另存为 PDF</button></div><section class="card"><h2>区域基金总览</h2><div class="metrics"><div><span>国家基金认缴 / 实缴</span><strong>${dxMoney(p.commitment,0)} / ${dxMoney(p.paid,0)} 亿</strong></div><div><span>子基金</span><strong>${fs.length} 支</strong></div><div><span>直投项目</span><strong>${ds.length} 笔</strong></div><div><span>子基金投资项目</span><strong>${projects.length} 个</strong></div></div></section><div class="pair"><section class="card"><h2>拟出资流向</h2><div class="allocation"><div>申请 / 拟出资合计<b>${dxMoney(dxSum(fs,'request')+dxSum(ds,'request'))} 亿</b></div><div><p>子基金 ${fs.length} 支 <b>${dxMoney(dxSum(fs,'request'))} 亿</b></p><p>直投项目 ${ds.length} 笔 <b>${dxMoney(dxSum(ds,'request'))} 亿</b></p></div></div></section><section class="card"><h2>子基金投资项目产业分布</h2><div class="donut-wrap"><div class="donut" style="background:conic-gradient(${stops})"></div><div style="flex:1">${industry.map(([label,n])=>`<div class="industry-row"><span>${dxE(label)}</span><i><em style="width:${n/max*100}%"></em></i><b>${n}</b></div>`).join('')}</div></div></section></div><section class="card"><h2>近六个月投资活跃度</h2>${dxRegionActivityTrend()}</section><section class="card"><h2>子基金投资项目清单</h2><div class="scroll"><table><thead><tr><th>底层项目</th><th>所属子基金</th><th>产业</th><th>注册城市</th><th>投资额 / 亿</th><th>投资日期</th></tr></thead><tbody>${pathRows}</tbody></table></div></section><section class="card"><h2>近期动态</h2><div class="scroll"><table><thead><tr><th>日期</th><th>类型</th><th>项目</th><th>投资路径</th><th>关联对象</th><th>动态</th></tr></thead><tbody>${updateRows}</tbody></table></div></section><p class="note">深圳立项/申请字段及演示组合混合展示；底层项目、投资路径、动态与非原始金额均为演示。</p></main></body></html>`;
  download(`${r.city}区域母基金_图表报告.html`,html,'text/html;charset=utf-8');showToast('本区域图表报告已导出');
}
function dxExport(kind){
  if(kind==='funds'){
    download('子基金档案_当前筛选.csv',csv([['来源','区域基金','基金名称','基金管理人','产业大类','原始产业方向','拟注册城市','目标规模','区域申请/拟出资','演示阶段','基础数据截至','演示样本位置'],...dxFundFiltered().map(f=>[f.origin==='source'?sourceWorkbook.fileName:'演示',dxRegion(f.region).name,f.name,f.manager,dxIndustry(f.sector),f.sector,dxGeo(f.place),f.size,f.request,dxFundStage(f),f.origin==='source'?sourceWorkbook.asOf:demoScenario.asOf,f.origin==='source'?`子基金!A${f.row}:G${f.row}`:''])]),'text/csv;charset=utf-8');
  }else if(kind==='deals'){
    download('直投项目档案_当前筛选.csv',csv([['来源','区域基金','企业','产业大类','原始产业方向','注册城市','融资规模','区域申请/拟出资','融资轮次（演示）','演示阶段','基础数据截至','演示样本位置'],...dxDealFiltered().map(d=>[d.origin==='source'?sourceWorkbook.fileName:'演示',dxRegion(d.region).name,d.name,dxIndustry(d.sector),d.sector,dxGeo(d.place),d.round,d.request,dxDealRound(d),dxDealMeta(d).stage,d.origin==='source'?sourceWorkbook.asOf:demoScenario.asOf,d.origin==='source'?`直投项目!A${d.row}:G${d.row}`:''])]),'text/csv;charset=utf-8');
  }else{
    download('穿透管理_投资路径.csv',csv([['来源','底层企业','行业','区域基金','路径类型','基金/直投项目','投资额','模拟份额','归属金额'],...dxPaths.map(p=>{const object=p.kind==='indirect'?dxFund(p.fundId):dxDeal(p.dealId);return ['演示',p.enterprise,p.sector,dxRegion(p.region).name,p.kind==='direct'?'直投':'间接',object.name,p.invest,p.share||'',dxPathAmount(p)]})]),'text/csv;charset=utf-8');
  }
  showToast('当前数据已导出');
}
function dxDocument(type,id,index){
  const obj=type==='fund'?dxFund(id):dxDeal(id);if(!obj)return;
  const names=type==='fund'?['基金设立方案','管理人尽调报告','投资决策纪要','合伙协议','缴款通知与回单','季度经营报告','年度经营报告']:['项目立项表','商业与技术尽调','财务尽调','投资决策纪要','投资协议','工商与权益证明','季度投后报告'];
  const title=names[index];
  openModal(title,`<div class="dx-doc-modal"><div><span>档案对象</span><b>${dxE(obj.name)}</b></div><div><span>资料类型</span><b>${dxE(title)}</b></div><div><span>编目状态</span><b>${index<4?'已编目':'待更新'}</b></div><div><span>关联阶段</span><b>${type==='fund'?'基金设立 / 出资 / 存续':'项目决策 / 交割 / 投后'}</b></div></div><p class="dx-modal-note">目录项用于展示档案与业务节点的关联。</p>`,'资料档案 · 目录示例');
}
function dxFundReportSubmit(id){
  const f=dxFund(dx.fundId),period=dxFundReportPeriods.find(x=>x.id===id);if(!f||!period)return;
  openModal(`${period.label}提交`, `<form id="dxFundReportForm" data-fund-id="${f.id}" data-period-id="${period.id}"><div class="dx-report-form"><div><span>基金</span><b>${dxE(f.name)}</b></div><div><span>报告期</span><b>${period.label}</b></div><label>选择报告文件<input type="file" name="reportFile" accept=".pdf,.doc,.docx,.xlsx,.xls" required></label><label>报送说明<textarea name="note" rows="3" placeholder="填写本期经营、投资与风险事项摘要"></textarea></label><p>提交状态与文件名称仅保存在当前浏览器；此演示不向服务器上传文件。</p><button type="submit">确认提交（演示）</button></div></form>`, '季报 / 年报报送');
}
function dxFundPortraitExport(){
  const f=dxFund(dx.fundId);if(!f)return;const m=dxFundMeta(f),paths=dxFundPaths(f),updates=dxFundUpdates(f),exits=dxFundExits(f),perf=dxFundPerformance(f),report=dxFundReportStatus(f,dxFundReportPeriods[1]);
  const issues=[report.tone==='amber'?'三季度报告待提交':'三季度报告已提交',m.risk==='正常'?'暂无重点风险事项':'基金运营需持续跟踪',exits.length?`已形成 ${exits.length} 笔退出记录`:'退出与回款仍待形成'];
  const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${dxE(f.name)} · 基金画像</title><style>*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:#f2f6fb;color:#173856;margin:0;padding:28px}main{max-width:960px;margin:auto}.hero{background:linear-gradient(115deg,#163554,#2a6188);color:#fff;border-radius:14px;padding:28px}.hero small{color:#a8dae6}.hero h1{font-size:28px;margin:8px 0}.hero p{margin:0;color:#cee1ee}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:17px 0}.metric,.card{background:#fff;border:1px solid #dce7f2;border-radius:11px;padding:18px}.metric span{display:block;color:#758ba3;font-size:12px}.metric b{display:block;color:#1e5787;font-size:24px;margin-top:8px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.card{margin-bottom:16px}.card h2{font-size:19px;margin:0 0 12px}.line{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid #e6edf5;padding:9px 0;font-size:13px}.line span{color:#7a90a6}.line b{text-align:right}.card li{font-size:13px;margin:9px 0;line-height:1.6}.card p{font-size:13px;color:#607d99;line-height:1.65}.note{font-size:11px;color:#8295a8;margin-top:12px}@media(max-width:650px){body{padding:12px}.metrics,.grid{grid-template-columns:1fr 1fr}}@media print{body{background:#fff;padding:0}@page{size:A4;margin:15mm}}</style></head><body><main><div class="hero"><small>DILI·FoF / FUND PORTRAIT</small><h1>${dxE(f.name)}</h1><p>${dxName(f.region)} · ${dxE(f.sector)} · ${dxE(m.stage)}</p></div><div class="metrics"><div class="metric"><span>目标规模</span><b>${dxMoney(f.size)} 亿</b></div><div class="metric"><span>区域拟出资</span><b>${dxMoney(f.request)} 亿</b></div><div class="metric"><span>底层投资项目</span><b>${paths.length} 个</b></div><div class="metric"><span>TVPI</span><b>${perf?dxMoney(perf.tvpi)+' 倍':'—'}</b></div></div><div class="grid"><section class="card"><h2>基本情况</h2><div class="line"><span>基金管理人</span><b>${dxE(f.manager)}</b></div><div class="line"><span>注册地</span><b>${dxE(f.place)}</b></div><div class="line"><span>当前阶段</span><b>${dxE(m.stage)}</b></div><div class="line"><span>基金存续期</span><b>${m.term}</b></div></section><section class="card"><h2>最新运营</h2><div class="line"><span>认缴 / 实缴</span><b>${dxMoney(m.committed)} / ${dxMoney(m.paid)} 亿</b></div><div class="line"><span>三季度报送</span><b>${dxE(report.label)}</b></div><div class="line"><span>项目成果动态</span><b>${updates.length} 条</b></div><div class="line"><span>退出项目</span><b>${exits.length} 笔</b></div></section><section class="card"><h2>亮点</h2><ul><li>聚焦 ${dxE(f.sector)}，形成 ${paths.length} 条底层投资路径。</li>${updates.slice(0,3).map(u=>`<li>${dxE(u.enterprise)}：${dxE(u.title)}。</li>`).join('')}${perf?`<li>演示 TVPI ${dxMoney(perf.tvpi)} 倍、DPI ${dxMoney(perf.dpi)} 倍、净 IRR ${dxMoney(perf.irr,1)}%。</li>`:''}</ul></section><section class="card"><h2>问题与关注</h2><ul>${issues.map(x=>`<li>${dxE(x)}</li>`).join('')}</ul></section></div><p class="note">生成时间 ${dx.fundPortraitAt||demoScenario.asOf} · 画像按档案及演示业务数据汇总，业绩与底层投资关系均为演示。</p></main></body></html>`;
  download(`${f.name}_基金画像.html`,html,'text/html;charset=utf-8');showToast('基金画像已导出');
}
function dxPipeline(id,index){
  const f=dxFund(id);if(!f)return;const name=(dxFundPipelines[f.sector]||dxFundPipelines['新一代信息技术'])[index];
  openModal(name,`<div class="dx-field-grid two"><div><span>所属子基金</span><b>${dxE(f.name)}</b></div><div><span>产业方向</span><b>${dxE(f.sector)}</b></div><div><span>项目阶段</span><b>${['储备','初筛','尽调'][index]}</b></div><div><span>拟投资额</span><b>${dxMoney(.12+index*.08)} 亿元</b></div></div><div class="dx-summary"><b>下一步</b><p>${['行业研究与项目访谈','商业模式评估与团队沟通','技术、财务和法律尽调'][index]}</p></div>`,'子基金项目储备 · 演示');
}
function dxNavigate(view){go(view)}
function dxAction(button){
  const a=button.dataset.dxAction,id=button.dataset.id,value=button.dataset.value,name=button.dataset.name;
  switch(a){
    case 'export-region-data':return dxRegionExportData();
    case 'export-region-report':return dxRegionExportReport();
    case 'export-dashboard-data':return dxDashboardExportData();
    case 'export-dashboard-report':return dxDashboardReport();
    case 'ai-dashboard':return dxOpenDashboardAI();
    case 'ai-region':return dxOpenRegionAI();
    case 'ai-fund':return dxOpenFundAI(id);
    case 'ai-deal':return dxOpenDealAI(id);
    case 'ai-risk':return dxOpenRiskAI();
    case 'ai-funds-list':return dxOpenRegisterAI('funds');
    case 'ai-deals-list':return dxOpenRegisterAI('deals');
    case 'ai-lookthrough':return dxOpenRegisterAI('lookthrough');
    case 'dashboard-geo-tab':dx.dashboardGeoTab=value;document.getElementById('dxDashboardGeo').innerHTML=dxPanel('投资注册地分布',dxDashboardGeography(),'三地 · 子基金 / 直投 / 底层项目');return;
    case 'dashboard-fund-city':dx.fundId=null;dx.fundRegion=id;dx.fundPlace=value;dx.fundSector='全部';dx.fundIndustry='全部';dx.fundStage='全部';dx.fundManager='全部';dx.fundQuery='';return dxNavigate('funds');
    case 'dashboard-region':dx.region='shenzhen';dx.regionTab='overview';return dxNavigate('region');
    case 'dashboard-funds':dx.fundId=null;dx.fundRegion='全部';dx.fundSector='全部';dx.fundIndustry='全部';dx.fundStage='全部';dx.fundPlace='全部';dx.fundManager='全部';dx.fundQuery='';return dxNavigate('funds');
    case 'dashboard-deals':dx.dealId=null;dx.dealRegion='全部';dx.dealSector='全部';dx.dealIndustry='全部';dx.dealStage='全部';dx.dealPlace='全部';dx.dealQuery='';return dxNavigate('projects');
    case 'dashboard-capital':dx.lookTab='capital';dx.lookRegion='全部';dx.enterprise=null;dx.manager=null;return dxNavigate('lookthrough');
    case 'dashboard-sector':dx.dealId=null;dx.dealRegion='全部';dx.dealSector=value;dx.dealStage='全部';dx.dealPlace='全部';dx.dealQuery='';return dxNavigate('projects');
    case 'dashboard-stage':dx.dealId=null;dx.dealRegion='全部';dx.dealSector='全部';dx.dealStage=value;dx.dealPlace='全部';dx.dealQuery='';return dxNavigate('projects');
    case 'compare-funds':dx.fundId=null;dx.fundRegion=id;dx.fundSector='全部';dx.fundIndustry='全部';dx.fundStage='全部';dx.fundPlace='全部';dx.fundManager='全部';dx.fundQuery='';return dxNavigate('funds');
    case 'compare-deals':dx.dealId=null;dx.dealRegion=id;dx.dealSector='全部';dx.dealIndustry='全部';dx.dealStage='全部';dx.dealPlace='全部';dx.dealQuery='';return dxNavigate('projects');
    case 'dashboard-city':dx.dealId=null;dx.dealRegion=id;dx.dealPlace=value;dx.dealSector='全部';dx.dealIndustry='全部';dx.dealStage='全部';dx.dealQuery='';return dxNavigate('projects');
    case 'dashboard-managers':dx.lookTab='manager';dx.manager=null;dx.enterprise=null;dx.lookRegion='全部';dx.lookQuery='';dx.lookMode='all';dx.lookPage=1;return dxNavigate('lookthrough');
    case 'dashboard-enterprises':dx.lookTab='enterprise';dx.manager=null;dx.enterprise=null;dx.lookRegion='全部';dx.lookQuery='';dx.lookMode='all';dx.lookPage=1;return dxNavigate('lookthrough');
    case 'open-region':dx.region=id;dx.regionTab='overview';dx.regionProjectFund='全部';dx.regionProjectIndustry='全部';return dxNavigate('region');
    case 'select-region':dx.region=id;dx.regionTab='overview';dx.regionProjectFund='全部';dx.regionProjectIndustry='全部';return renderDxRegion();
    case 'region-projects':dx.regionTab='projects';dx.regionProjectFund='全部';dx.regionProjectIndustry='全部';return renderDxRegion();
    case 'region-project-fund':dx.regionTab='projects';dx.regionProjectFund=id;dx.regionProjectIndustry='全部';return renderDxRegion();
    case 'region-project-industry':dx.regionTab='projects';dx.regionProjectIndustry=value;return renderDxRegion();
    case 'clear-region-project-industry':dx.regionProjectIndustry='全部';return renderDxRegion();
    case 'fund-scope':dx.fundRegion=value;dx.fundSector='全部';dx.fundIndustry='全部';dx.fundStage='全部';dx.fundPlace='全部';dx.fundManager='全部';dx.fundQuery='';return renderDxFunds();
    case 'deal-scope':dx.dealRegion=value;dx.dealSector='全部';dx.dealIndustry='全部';dx.dealStage='全部';dx.dealPlace='全部';dx.dealQuery='';return renderDxDeals();
    case 'capital-scope':dx.lookRegion=value;dx.capitalPage=1;return renderDxLookthrough();
    case 'fund-sector':dx.fundSector=value;return renderDxFunds();
    case 'fund-industry':dx.fundIndustry=value;dx.fundSector='全部';return renderDxFunds();
    case 'fund-stage':dx.fundStage=value;return renderDxFunds();
    case 'fund-geo':dx.fundPlace=value;return renderDxFunds();
    case 'deal-sector':dx.dealSector=value;return renderDxDeals();
    case 'deal-industry':dx.dealIndustry=value;dx.dealSector='全部';return renderDxDeals();
    case 'deal-stage':dx.dealStage=value;return renderDxDeals();
    case 'deal-geo':dx.dealPlace=value;return renderDxDeals();
    case 'regionTab':dx.regionTab=value;return renderDxRegion();
    case 'region-capital':dx.regionTab='capital';return renderDxRegion();
    case 'region-funds':dx.fundId=null;dx.fundQuery='';dx.fundManager='全部';dx.fundRegion=dx.region;dx.fundSector='全部';dx.fundIndustry='全部';dx.fundStage='全部';dx.fundPlace='全部';return dxNavigate('funds');
    case 'region-deals':dx.dealId=null;dx.dealQuery='';dx.dealRegion=dx.region;dx.dealSector='全部';dx.dealIndustry='全部';dx.dealStage='全部';dx.dealPlace='全部';return dxNavigate('projects');
    case 'region-industry':dx.dealId=null;dx.dealRegion=dx.region;dx.dealIndustry=value;dx.dealSector='全部';dx.dealStage='全部';dx.dealPlace='全部';dx.dealQuery='';return dxNavigate('projects');
    case 'region-fund-industry':dx.fundId=null;dx.fundRegion=dx.region;dx.fundIndustry=value;dx.fundSector='全部';dx.fundStage='全部';dx.fundPlace='全部';dx.fundManager='全部';dx.fundQuery='';return dxNavigate('funds');
    case 'region-fund-stage':dx.fundId=null;dx.fundRegion=dx.region;dx.fundStage=value;dx.fundIndustry='全部';dx.fundSector='全部';dx.fundPlace='全部';dx.fundManager='全部';dx.fundQuery='';return dxNavigate('funds');
    case 'region-deal-stage':dx.dealId=null;dx.dealRegion=dx.region;dx.dealStage=value;dx.dealIndustry='全部';dx.dealSector='全部';dx.dealPlace='全部';dx.dealQuery='';return dxNavigate('projects');
    case 'region-sector':dx.dealId=null;dx.dealQuery='';dx.dealRegion=dx.region;dx.dealSector=value;dx.dealPlace='全部';return dxNavigate('projects');
    case 'region-geo':dx.dealId=null;dx.dealQuery='';dx.dealRegion=dx.region;dx.dealSector='全部';dx.dealIndustry='全部';dx.dealStage='全部';dx.dealPlace=value;return dxNavigate('projects');
    case 'region-fund-sector':dx.fundId=null;dx.fundQuery='';dx.fundManager='全部';dx.fundRegion=dx.region;dx.fundSector=value;dx.fundPlace='全部';return dxNavigate('funds');
    case 'region-fund-geo':dx.fundId=null;dx.fundQuery='';dx.fundManager='全部';dx.fundRegion=dx.region;dx.fundSector='全部';dx.fundIndustry='全部';dx.fundStage='全部';dx.fundPlace=value;return dxNavigate('funds');
    case 'region-enterprises':dx.lookTab='enterprise';dx.enterprise=null;dx.lookRegion=dx.region;dx.lookQuery='';dx.lookMode='all';dx.lookPage=1;return dxNavigate('lookthrough');
    case 'region-managers':dx.lookTab='manager';dx.manager=null;dx.lookRegion=dx.region;dx.lookQuery='';dx.lookMode='all';dx.lookPage=1;return dxNavigate('lookthrough');
    case 'open-fund':if(!dx.fundId){dx.fundReturnView=state.view;dx.fundReturnScroll=window.scrollY||0}dx.fundId=id;dx.fundTab='profile';dx.fundPortraitAt=null;dxNavigate('funds');window.scrollTo({top:0,behavior:'auto'});return;
    case 'back-funds':{const view=dx.fundReturnView||'funds',position=dx.fundReturnScroll||0;dx.fundId=null;if(view==='funds'){renderDxFunds()}else{dxNavigate(view)}window.scrollTo({top:position,behavior:'auto'});return}
    case 'fundTab':dx.fundTab=value;if(value==='portrait'&&!dx.fundPortraitAt)dx.fundPortraitAt=new Date().toLocaleString('zh-CN');return renderDxFundDetail();
    case 'fund-generate-portrait':dx.fundTab='portrait';dx.fundPortraitAt=new Date().toLocaleString('zh-CN');return renderDxFundDetail();
    case 'export-fund-portrait':return dxFundPortraitExport();
    case 'fund-report-submit':return dxFundReportSubmit(id);
    case 'fund-portfolio':dx.fundTab='portfolio';return renderDxFundDetail();
    case 'fund-capital':dx.fundTab='capital';return renderDxFundDetail();
    case 'open-deal':dx.dealId=id;dx.dealTab='profile';dx.dealRegion=dxDeal(id)?.region||'全部';return dxNavigate('projects');
    case 'back-deals':dx.dealId=null;return dxNavigate('projects');
    case 'dealTab':dx.dealTab=value;return renderDxDealDetail();
    case 'deal-transaction':dx.dealTab='transaction';return renderDxDealDetail();
    case 'deal-sector-funds':{const d=dxDeal(id);dx.fundId=null;dx.fundRegion=d.region;dx.fundSector=d.sector;dx.fundPlace='全部';dx.fundManager='全部';dx.fundQuery='';return dxNavigate('funds')}
    case 'open-enterprise':dx.lookTab='enterprise';dx.enterprise=name;dx.manager=null;return dxNavigate('lookthrough');
    case 'open-manager':dx.manager=name;dx.enterprise=null;return dxNavigate('managers');
    case 'back-managers':dx.manager=null;return dxNavigate('managers');
    case 'back-lookthrough':dx.enterprise=null;dx.manager=null;return dxNavigate('lookthrough');
    case 'lookTab':dx.lookTab=value;dx.enterprise=null;dx.manager=null;dx.lookQuery='';dx.lookSector='全部';dx.lookMode='all';dx.lookPage=1;return renderDxLookthrough();
    case 'look-duplicates':case 'look-cross':case 'look-all':Object.assign(dx,{lookTab:'enterprise',lookMode:a==='look-duplicates'?'duplicates':a==='look-cross'?'cross':'all',lookRegion:'全部',lookSector:'全部',lookQuery:'',lookPage:1,enterprise:null,manager:null});return renderDxLookthrough();
    case 'look-mode':dx.lookMode=value;dx.lookPage=1;return renderDxLookthrough();
    case 'look-page':dx.lookPage=Number(value);return renderDxLookthrough();
    case 'capital-page':dx.capitalPage=Number(value);return renderDxLookthrough();
    case 'manager-page':dx.managerPage=Number(value);return renderDxManagers();
    case 'enterprise-industry':dx.lookSector=value;dx.lookPage=1;return renderDxLookthrough();
    case 'open-doc':return dxDocument('fund',id,Number(button.dataset.index));
    case 'open-deal-doc':return dxDocument('deal',id,Number(button.dataset.index));
    case 'open-pipeline':return dxPipeline(id,Number(button.dataset.index));
    case 'export-funds':return dxExport('funds');
    case 'export-deals':return dxExport('deals');
    case 'export-paths':return dxExport('paths');
  }
}
document.addEventListener('click',event=>{const libraryLink=event.target.closest('.nav [data-view="managers"], [data-view-link="managers"]');if(libraryLink){dx.manager=null;renderDxManagers()}const button=event.target.closest('[data-dx-action]');if(button)dxAction(button)});
document.addEventListener('click',event=>{const q=event.target.closest('[data-dx-ai-question]');if(!q)return;const input=document.querySelector('#dxAiAskForm input[name="question"]');if(input)input.value=q.dataset.dxAiQuestion;const answer=document.getElementById('dxAiAnswer');if(answer){const a=dxDashboardAnswer(q.dataset.dxAiQuestion);answer.innerHTML=dxAiNote(a.title,a.body,a.source);dxAiRefreshDashboardHistory(a)}});
document.addEventListener('click',event=>{const q=event.target.closest('[data-dx-register-question]');if(!q)return;const form=document.getElementById('dxRegisterAskForm'),input=form?.querySelector('input[name="question"]');if(input)input.value=q.dataset.dxRegisterQuestion;const answer=document.getElementById('dxRegisterAnswer');if(answer){const a=dxRegisterAnswer(form?.dataset.kind||'funds',q.dataset.dxRegisterQuestion);answer.innerHTML=dxAiNote(a.title,a.body,a.source);dxAiRefreshRegisterHistory(a)}});
document.addEventListener('click',event=>{const button=event.target.closest('[data-dx-ai-action]');if(button){const action=button.dataset.dxAiAction;if(action==='history')return dxAiOpenHistory();const record=dxAiRecordById(button.dataset.aiId);if(!record)return;if(action==='copy')return dxAiCopy(record.text);if(action==='export'){download(`${record.title}_${record.createdAt.replace(/[/: ]/g,'-')}.txt`,`${record.title}\n生成时间：${record.createdAt}\n依据：${record.source}\n\n${record.text}`,'text/plain;charset=utf-8');return showToast('AI分析结果已导出')}}const history=event.target.closest('[data-dx-ai-history-id]');if(history)dxAiOpenHistoryItem(history.dataset.dxAiHistoryId)});
document.addEventListener('change',event=>{
  const x=event.target;
  if(x.id==='dxRegionProjectFund'){dx.regionProjectFund=x.value;return renderDxRegion()}
  if(x.id==='dxCapitalSort'){dx.capitalSort=x.value;dx.capitalPage=1;document.getElementById('dxCapitalResults').innerHTML=dxCapitalResults();return}
  if(x.id==='dxManagerRegion'){dx.managerRegion=x.value;dx.managerPage=1;document.getElementById('dxManagerResults').innerHTML=dxManagerLibraryResults();return}
  if(x.id==='dxManagerStage'){dx.managerStage=x.value;dx.managerPage=1;document.getElementById('dxManagerResults').innerHTML=dxManagerLibraryResults();return}
  const mappings={dxFundRegion:'fundRegion',dxFundSector:'fundSector',dxFundIndustry:'fundIndustry',dxFundStage:'fundStage',dxFundPlace:'fundPlace',dxFundManager:'fundManager',dxDealRegion:'dealRegion',dxDealSector:'dealSector',dxDealIndustry:'dealIndustry',dxDealStage:'dealStage',dxDealPlace:'dealPlace',dxLookRegion:'lookRegion',dxLookSector:'lookSector'};
  if(!mappings[x.id])return;dx[mappings[x.id]]=x.value;
  if(x.id.startsWith('dxLook'))dx.lookPage=1;
  if(x.id.startsWith('dxFund'))renderDxFunds();else if(x.id.startsWith('dxDeal'))renderDxDeals();else renderDxLookthrough();
});
document.addEventListener('input',event=>{
  const x=event.target;
  if(x.id==='dxFundQuery'){dx.fundQuery=x.value;document.getElementById('dxFundResults').innerHTML=dxFundResults();document.getElementById('dxFundStats').innerHTML=dxFundStats();document.getElementById('dxFundAnalysis').innerHTML=dxFundAnalysis(dxFundFiltered())}
  if(x.id==='dxDealQuery'){dx.dealQuery=x.value;document.getElementById('dxDealResults').innerHTML=dxDealResults();document.getElementById('dxDealStats').innerHTML=dxDealStats();document.getElementById('dxDealAnalysis').innerHTML=dxDealAnalysis(dxDealFiltered())}
  if(x.id==='dxLookQuery'){dx.lookQuery=x.value;dx.lookPage=1;document.getElementById('dxLookResults').innerHTML=dx.lookTab==='enterprise'?dxEnterpriseTable():dxManagerTable()}
  if(x.id==='dxCapitalQuery'){dx.capitalQuery=x.value;dx.capitalPage=1;document.getElementById('dxCapitalResults').innerHTML=dxCapitalResults()}
  if(x.id==='dxManagerQuery'){dx.managerQuery=x.value;dx.managerPage=1;document.getElementById('dxManagerResults').innerHTML=dxManagerLibraryResults()}
});
document.addEventListener('submit',event=>{
  if(event.target.id==='dxAiAskForm'){event.preventDefault();const q=event.target.elements.question?.value||'';const a=dxDashboardAnswer(q);const answer=document.getElementById('dxAiAnswer');if(answer){answer.innerHTML=dxAiNote(a.title,a.body,a.source);dxAiRefreshDashboardHistory(a)}return}
  if(event.target.id==='dxRegisterAskForm'){event.preventDefault();const q=event.target.elements.question?.value||'';const a=dxRegisterAnswer(event.target.dataset.kind||'funds',q);const answer=document.getElementById('dxRegisterAnswer');if(answer){answer.innerHTML=dxAiNote(a.title,a.body,a.source);dxAiRefreshRegisterHistory(a)}return}
  const form=event.target;
  if(form.id==='dxManagerProspectCreate'){
    event.preventDefault();const get=key=>form.elements.namedItem(key)?.value.trim()||'',name=get('name');
    if(!name)return showToast('请填写机构名称');
    if(dxManagerDirectoryRows().some(x=>x.name===name))return showToast('机构库已有同名档案，请直接打开并更新');
    const p={name,region:get('region'),stage:get('stage'),focus:get('focus'),source:get('source')||'本地录入',lastContact:'',nextAction:get('nextAction'),nextDate:get('nextDate'),history:[{at:new Date().toLocaleString('zh-CN',{hour12:false}),stage:get('stage'),action:'创建机构线索'}]};
    dxManagerProspects.push(p);const saved=dxManagerProspectSave();dx.manager=name;renderDxManagers();showToast(saved?'线索已加入本地机构库':'本次会话已加入线索，但浏览器未允许持久保存');return;
  }
  if(form.id==='dxManagerProspectUpdate'){
    event.preventDefault();const p=dxManagerProspects.find(x=>x.name===form.dataset.name);if(!p)return;
    const get=key=>form.elements.namedItem(key)?.value.trim()||'';
    const before={stage:p.stage,region:p.region,focus:p.focus,source:p.source,lastContact:p.lastContact,nextDate:p.nextDate,nextAction:p.nextAction};
    for(const key of Object.keys(before))p[key]=get(key);
    if(!dxManagerProspectStages.includes(p.stage)||!dxRegions.some(r=>r.id===p.region)){Object.assign(p,before);return showToast('跟进阶段或区域无效')}
    if(Object.keys(before).some(key=>before[key]!==p[key])){p.history=p.history||[];p.history.push({at:new Date().toLocaleString('zh-CN',{hour12:false}),stage:p.stage,action:p.nextAction||'更新线索资料'})}
    const saved=dxManagerProspectSave();renderDxManagers();showToast(saved?'跟进记录已保存在本地浏览器':'本次会话已更新，浏览器未允许持久保存');return;
  }
  if(form.id==='dxManagerNoteForm'){event.preventDefault();const fields=['team','performance','duty','issues','cooperation'];dxManagerNotes[form.dataset.name]=Object.fromEntries(fields.map(key=>[key,form.elements.namedItem(key)?.value.trim()||'']));let saved=false;try{localStorage.setItem('diki-public-demo-manager-notes',JSON.stringify(dxManagerNotes));saved=true}catch{}renderDxManagers();showToast(saved?'管理人档案已保存在本地浏览器':'本次会话已更新，浏览器未允许持久保存');return}
  if(form.id!=='dxFundReportForm')return;event.preventDefault();
  const file=form.elements.namedItem('reportFile')?.files?.[0];if(!file){showToast('请先选择报告文件');return}
  const key=`${form.dataset.fundId}:${form.dataset.periodId}`;
  dxFundReportStore[key]={file:file.name,date:new Date().toLocaleString('zh-CN'),note:form.elements.namedItem('note')?.value||''};
  try{localStorage.setItem('diki-public-demo-fund-reports',JSON.stringify(dxFundReportStore))}catch{}
  closeModal();renderDxFundDetail();showToast('演示提交已登记');
});
// Replace the legacy search input so navigation searches the active register and network.
const dxOldSearch=document.getElementById('globalSearch');
if(dxOldSearch){
  const dxSearch=dxOldSearch.cloneNode(true);dxOldSearch.replaceWith(dxSearch);
  dxSearch.placeholder='⌕ 搜索基金、项目、企业或管理人…';
  dxSearch.addEventListener('keydown',event=>{
    if(event.key!=='Enter')return;
    const q=event.target.value.trim();if(!q)return;
    if(dxManagerDirectoryRows().some(x=>x.name===q)){dx.manager=q;return dxNavigate('managers')}
    if(dxEnterprisePopulation().some(x=>x.name===q)){dx.lookTab='enterprise';dx.enterprise=q;return dxNavigate('lookthrough')}
    if(dxFunds.some(f=>`${f.name} ${f.manager}`.includes(q))){dx.fundId=null;dx.fundRegion='全部';dx.fundQuery=q;return dxNavigate('funds')}
    if(dxDeals.some(d=>`${d.name} ${d.summary}`.includes(q))){dx.dealId=null;dx.dealRegion='全部';dx.dealQuery=q;return dxNavigate('projects')}
    if(dxEnterprisePopulation().some(x=>x.name.includes(q))){dx.lookTab='enterprise';dx.enterprise=null;dx.lookQuery=q;return dxNavigate('lookthrough')}
    if(dxManagerDirectoryRows().some(x=>x.name.includes(q))){dx.manager=null;dx.managerQuery=q;return dxNavigate('managers')}
    showToast('没有找到匹配的对象');
  });
}
renderers.dashboard=renderDxDashboard;
renderers.region=renderDxRegion;
renderers.funds=renderDxFunds;
renderers.projects=renderDxDeals;
renderers.lookthrough=renderDxLookthrough;
renderers.managers=renderDxManagers;
renderDxDashboard();
