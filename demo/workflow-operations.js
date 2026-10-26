'use strict';
// Prospects remain separate from fund/project registers and confirmed reporting snapshots.
const foKey='diki-public-workflow-prospects-v1';
const foStages=['接洽中','初筛评估','立项','尽调','投决准备','决策通过','暂缓','终止'];
const foState={kind:'全部',stage:'全部',query:'',selected:null,editing:false,dimension:'sector',basis:'count'};
const foScope=()=>fsAccount()?.version==='region'?`region:${fsRegion.id}`:`fund:${fsFund.id}`;
const foRead=()=>{try{const v=JSON.parse(localStorage.getItem(foKey)||'[]');return Array.isArray(v)?v:[]}catch{return []}};
const foAll=()=>foRead().filter(x=>x.scope===foScope());
const foToday=()=>new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Shanghai'});
const foActive=r=>!['暂缓','终止'].includes(r.stage);
const foOverdue=r=>foActive(r)&&r.due&&r.due<foToday();
const foMoney=n=>Number(n||0).toFixed(2);
const foId=()=>`OP-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
function foAiContext(question){
  const rows=foAll(),selected=rows.find(r=>question.includes(r.name))||rows.find(r=>r.id===foState.selected);
  if(selected)return `当前储备记录：${selected.name}；类型：${selected.kind}；阶段：${selected.stage}；责任人：${selected.owner}；下一步：${selected.next}；跟进日期：${selected.due}。已有 ${selected.logs.length} 条过程记录。尚未纳入正式投资台账。`;
  const active=rows.filter(foActive),overdue=rows.filter(foOverdue);
  return `当前机构储备数据：共 ${rows.length} 条，活跃 ${active.length} 条，尽调或投决准备 ${active.filter(r=>['尽调','投决准备'].includes(r.stage)).length} 条，跟进逾期 ${overdue.length} 条。${overdue.length?'应先核对逾期对象：'+overdue.map(r=>r.name).join('、')+'。':''}该汇总仅反映本地储备记录，不代表投资决策结论。`;
}
function foSave(rows){try{localStorage.setItem(foKey,JSON.stringify(rows));return true}catch{fsFlash('保存失败，请检查浏览器存储权限后重试。');return false}}
function foSeed(){
  if(localStorage.getItem(foKey)!==null)return;
  const fixtures=[
    ['湾区先进制造二期基金（储备演示）','基金机会','高端装备','深圳','管理人推荐','尽调','投资一组',1.2,'2026-10-23','补充团队历史业绩与出资结构'],
    ['深科成长资本（接洽演示）','管理人','人工智能','深圳','行业会议','接洽中','投资二组',null,'2026-10-19','安排团队访谈，核实核心人员分工'],
    ['湾芯光电（储备演示）','企业项目','集成电路','东莞','产业伙伴','初筛评估','项目一组',0.15,'2026-10-22','获取产品测试与客户导入材料'],
    ['南湾智能机器人（储备演示）','企业项目','高端装备','广州','自主拓展','投决准备','项目二组',0.25,'2026-10-21','补充估值依据及投资条款对照'],
    ['湾区生命科学基金（储备演示）','基金机会','生物医药','广州','管理人推荐','立项','投资一组',0.8,'2026-10-26','完成基金策略初评'],
    ['前海产业资本（接洽演示）','管理人','新材料','深圳','同业转介','初筛评估','投资二组',null,'2026-10-24','核实过往退出案例与团队稳定性'],
    ['岭南传感（储备演示）','企业项目','高端装备','佛山','行业会议','暂缓','项目一组',0.1,'2026-11-05','待产品认证完成后再评估'],
    ['粤海新材料（储备演示）','企业项目','新材料','惠州','产业伙伴','终止','项目二组',0.12,'2026-10-15','投资阶段不匹配，已留存终止原因']
  ];
  const fundFixtures=[
    ['光栈智能（储备演示）','企业项目','人工智能','深圳','团队挖掘','接洽中','项目经理A',0.08,'2026-10-21','安排创始团队首次交流'],
    ['南湾芯片（储备演示）','企业项目','集成电路','东莞','产业伙伴','初筛评估','项目经理B',0.12,'2026-10-19','核查客户导入与量产计划'],
    ['云启工业软件（储备演示）','企业项目','人工智能','杭州','同业转介','尽调','项目经理A',0.15,'2026-10-24','补充财务与客户访谈材料'],
    ['深蓝精密（储备演示）','企业项目','高端装备','深圳','团队挖掘','投决准备','项目经理B',0.18,'2026-10-23','整理投资备忘录与退出路径'],
    ['穗创材料（储备演示）','企业项目','新材料','广州','行业会议','立项','项目经理C',0.1,'2026-10-27','完成技术壁垒初评'],
    ['智联传感（储备演示）','企业项目','高端装备','苏州','同业转介','暂缓','项目经理C',0.06,'2026-11-10','等待新一轮订单验证']
  ];
  const make=(list,scope)=>list.map(([name,kind,sector,place,source,stage,owner,amount,due,next])=>({id:foId(),scope,name,kind,sector,place,source,stage,owner,amount,due,next,contact:'待补充',created:'2026-10-12',logs:[{at:'2026-10-16',actor:'演示初始化',type:'接洽记录',note:next,stage}]}));
  foSave([...make(fixtures,`region:${fsRegion.id}`),...make(fundFixtures,`fund:${fsFund.id}`)]);
}
function foHead(k,title,desc,actions=''){return `<div class="fs-page-head fo-head"><small>${k}</small><h1>${title}</h1><p>${desc}</p>${actions?`<div class="fo-head-actions">${actions}</div>`:''}</div>`}
function foButton(label,action,extra=''){return `<button type="button" data-fo-action="${action}" ${extra}>${label}</button>`}
function foKpi(label,value,note,action='',stage='全部'){return `<button class="fo-kpi" ${action?`data-fo-action="${action}" data-stage="${stage}"`:''}><span>${label}</span><b>${value}</b><small>${note}</small></button>`}
function foGroup(rows,key){const map=new Map();for(const r of rows){const label=r[key]||'未分类';map.set(label,(map.get(label)||0)+1)}return [...map].sort((a,b)=>b[1]-a[1])}
function foBars(rows,unit='项',action='',key=''){const max=Math.max(1,...rows.map(x=>x[1]));return rows.length?`<div class="fo-bars">${rows.map(([label,value])=>`<button type="button" ${action?`data-fo-action="${action}" data-filter="${fsE(label)}" data-field="${key}"`:''}><span>${fsE(label)}</span><i><em style="width:${Math.max(value/max*100,0)}%"></em></i><b>${Number(value).toLocaleString('zh-CN',{maximumFractionDigits:2})}<small>${unit}</small></b></button>`).join('')}</div>`:'<p class="fs-empty">当前范围暂无可分析记录。</p>'}
function foPanel(title,sub,content,action=''){return `<section class="fs-card fo-panel"><div class="fs-card-title"><div><h2>${title}</h2><p>${sub}</p></div>${action}</div>${content}</section>`}
function fsOpsDashboard(){
  const isRegion=fsAccount().version==='region',all=foAll(),active=all.filter(foActive),paths=dxPaths.filter(p=>isRegion?p.region===fsRegion.id:p.fundId===fsFund.id),funds=isRegion?dxRegionFunds(fsRegion.id):[fsFund];
  const enterprises=[...new Set(paths.map(p=>p.enterprise))],total=paths.reduce((s,p)=>s+Number(p.invest||0),0),stages=foStages.slice(0,6).map(s=>[s,active.filter(r=>r.stage===s).length]),group=foGroup(active,foState.dimension);
  const sectors=new Map();for(const p of paths){const name=p.sector||'未分类';sectors.set(name,(sectors.get(name)||0)+(foState.basis==='count'?1:Number(p.invest||0)))}
  const dated=paths.filter(x=>x.date),months=[...new Set(dated.map(x=>x.date.slice(0,7)))].sort().slice(-6),monthly=months.map(m=>[m,dated.filter(x=>x.date.startsWith(m)).reduce((s,x)=>s+Number(x.invest||0),0)]);
  const paid=funds.reduce((s,f)=>s+Number(wbCurrent('fund',f.id)?.values.paid||0),0),confirmed=funds.filter(f=>wbCurrent('fund',f.id)).length;
  const reportRows=fsRows().filter(fsRelevant),todo=reportRows.filter(r=>fsCanFill(r)||fsCanInternalReview(r)||fsCanExternalReview(r)),exits=demoScenario.fundExits.filter(x=>funds.some(f=>f.id===x.fundId));
  const exposed=paths.filter(x=>x.kind==='indirect').reduce((s,x)=>s+Number(x.invest||0)*Number(x.share||0),0),largest=total?Math.max(0,...enterprises.map(n=>paths.filter(x=>x.enterprise===n).reduce((s,x)=>s+Number(x.invest||0),0)))/total*100:0;
  return foHead('INVESTMENT DESK / '+(isRegion?'REGIONAL':'SUB-FUND'),isRegion?'区域母基金经营驾驶舱':'子基金投资管理驾驶舱','储备机会与已投组合分别分析，点击指标和图表可查看明细。')+
    `<div class="fo-scope"><span>${fsE(fsAccount().organization)}</span><span>储备：本机构当前记录 · 组合：演示基线 + 确认报送</span><small>金额单位：亿元</small></div><div class="fo-kpis">${foKpi('活跃储备',active.length,'基金、企业与管理人机会','pipeline')}${foKpi('尽调 / 投决准备',active.filter(x=>['尽调','投决准备'].includes(x.stage)).length,'待完成评估与决策材料','focus')}${foKpi('跟进逾期',all.filter(foOverdue).length,'以北京时间今天核对下次跟进日','overdue')}${foKpi('已投底层企业',enterprises.length,'按企业名称去重','portfolio')}${foKpi('底层投资额',foMoney(total),'路径投资金额合计，非母基金出资','portfolio')}${foKpi('待我审核 / 填报',todo.length,'按当前账号权限计算','inbox')}</div>
    <div class="fo-dashboard-grid">${foPanel('机会推进漏斗','当前阶段分布，非历史转化率',foBars(stages,'项','stage'),'')}${foPanel('储备结构分析','只统计活跃储备；点击分类查看对应机会',`<div class="fo-segments">${[['sector','产业'],['source','来源渠道'],['owner','责任人'],['kind','对象类型']].map(([v,l])=>foButton(l,'dimension',`data-value="${v}" class="${foState.dimension===v?'active':''}"`)).join('')}</div>${foBars(group,'项','group',foState.dimension)}`)}
    ${foPanel('已投组合产业分布',foState.basis==='count'?'按投资路径计数，同一企业多条路径分别计算':'按路径原始投资额分析，不与区域归属金额混算',`<div class="fo-segments">${foButton('投资路径数','basis','data-value="count"')}${foButton('投资金额','basis','data-value="amount"')}</div>${foBars([...sectors],foState.basis==='count'?'条':'亿','portfolio')}`)}
    ${foPanel('投资节奏','按路径投资日期分月；无日期记录不参与趋势统计',foBars(monthly,'亿')+`<p class="fo-footnote">有日期路径 ${dated.length} / ${paths.length} 条；无日期部分未估算补齐。</p>`)}
    ${foPanel('资金与回收','确认报送与演示退出数据分别标注',`<dl class="fo-facts"><div><dt>已确认子基金实缴</dt><dd>${confirmed?foMoney(paid)+' 亿':'暂无确认数据'}</dd><small>覆盖 ${confirmed} / ${funds.length} 支基金</small></div><div><dt>退出回款（演示）</dt><dd>${foMoney(exits.reduce((s,x)=>s+Number(x.proceeds||0),0))} 亿</dd><small>${exits.length} 条退出记录</small></div><div><dt>活跃储备拟投资额</dt><dd>${foMoney(active.filter(x=>x.kind!=='管理人').reduce((s,x)=>s+Number(x.amount||0),0))} 亿</dd><small>意向额度，未计入实缴和已投统计</small></div></dl>`)}
    ${foPanel('集中度与关系核查','用于提示核查重点，不将融资动态直接认定为风险',`<dl class="fo-facts"><div><dt>最大单一企业投资占比</dt><dd>${largest.toFixed(1)}%</dd><small>按当前范围路径金额计算</small></div><div><dt>间接投资归属测算</dt><dd>${foMoney(exposed)} 亿</dd><small>企业投资额 × 区域在子基金中份额</small></div><div><dt>储备终止 / 暂缓</dt><dd>${all.filter(x=>x.stage==='终止').length} / ${all.filter(x=>x.stage==='暂缓').length}</dd><small>保留原因、后续复评条件和过程记录</small></div></dl>`)}
    </div>${foPanel('近期跟进与待办','从驾驶舱直接回到接洽和推进记录',foTable(active.slice().sort((a,b)=>String(a.due).localeCompare(String(b.due))).slice(0,5)),foButton('全部储备 →','pipeline'))}<p class="fo-footnote">储备样例均为演示，尚未投资；现有台账未标注正式投资状态的记录不在这里推定为已投。历史转化率需要阶段变更历史后才能计算。</p>`;
}
function foFiltered(){return foAll().filter(x=>(foState.kind==='全部'||x.kind===foState.kind)&&(foState.stage==='全部'||foState.stage==='重点推进'&&['尽调','投决准备'].includes(x.stage)||foState.stage==='逾期'&&foOverdue(x)||x.stage===foState.stage)&&(!foState.query||[x.name,x.sector,x.source,x.owner,x.place].join(' ').toLowerCase().includes(foState.query.toLowerCase())))}
function foTable(rows){return `<div class="fs-table-wrap"><table class="fo-table"><thead><tr><th>储备对象 / 来源</th><th>阶段 / 责任人</th><th>产业 / 地域</th><th>拟投资额</th><th>下次跟进</th><th>操作</th></tr></thead><tbody>${rows.map(x=>`<tr><td><button class="fo-link" data-fo-action="detail" data-id="${fsE(x.id)}">${fsE(x.name)}</button><small>${fsE(x.kind)} · ${fsE(x.source)}</small></td><td><span class="fs-pill ${x.stage==='终止'?'returned_external':x.stage==='暂缓'?'internal_review':''}">${fsE(x.stage)}</span><small>${fsE(x.owner)}</small></td><td>${fsE(x.sector)}<small>${fsE(x.place)}</small></td><td>${x.amount==null?'—':foMoney(x.amount)+' 亿'}</td><td class="${foOverdue(x)?'fo-overdue':''}">${fsE(x.due||'未设置')}<small>${fsE(x.next)}</small></td><td>${foButton('跟进','detail',`data-id="${fsE(x.id)}"`)}<button data-fs-action="ai-ask" data-fs-question="${fsE('储备'+x.kind+'：'+x.name+'；阶段：'+x.stage+'；下一步：'+x.next+'。请生成下一次访谈与待补材料清单。')}">✦ 访谈准备</button></td></tr>`).join('')||'<tr><td colspan="6">暂无匹配记录，可调整筛选或新建接洽。</td></tr>'}</tbody></table></div>`}
function foProspects(){
  if(!['region','fund'].includes(fsAccount()?.version))return '<p class="fs-empty">当前账号无储备管理范围。</p>';
  if(foState.editing)return foCreate();
  if(foState.selected){const row=foAll().find(x=>x.id===foState.selected);if(row)return foDetail(row);foState.selected=null}
  const all=foAll(),kinds=fsAccount().version==='region'?['全部','基金机会','管理人','企业项目']:['全部','企业项目'];
  return foHead('OPPORTUNITY PIPELINE',fsAccount().version==='region'?'储备与接洽':'项目储备与投决','记录尚未进入正式台账的基金、管理人和企业机会，持续跟进直到决策。',foButton('＋ 新建接洽','new','class="primary"'))+`<div class="fo-boundary">储备池独立留存，接洽、立项、尽调和决策通过均不会自动计入已投统计；正式投资需要签约、交割和后续确认。</div><section class="fs-card"><div class="fo-segments">${kinds.map(k=>foButton(k+' · '+(k==='全部'?all.length:all.filter(x=>x.kind===k).length),'kind',`data-value="${k}" class="${foState.kind===k?'active':''}"`)).join('')}</div><form id="foFilter" class="fs-toolbar"><input name="query" value="${fsE(foState.query)}" placeholder="搜索名称、产业、来源或责任人"><select name="stage">${['全部',...foStages,'重点推进','逾期'].map(s=>`<option ${s===foState.stage?'selected':''}>${s}</option>`).join('')}</select><button type="submit">筛选</button>${foButton('重置','clear')}</form>${foTable(foFiltered())}</section>`;
}
function foCreate(){const region=fsAccount().version==='region';return foHead('NEW OPPORTUNITY','新建接洽','先记录线索与责任人，再逐步补充材料。')+`<section class="fs-card"><form id="foCreate" class="fs-form-grid"><label>对象名称 *<input name="name" required maxlength="160"></label><label>对象类型<select name="kind">${(region?['基金机会','管理人','企业项目']:['企业项目']).map(x=>`<option>${x}</option>`).join('')}</select></label><label>产业<input name="sector" required></label><label>地域<input name="place"></label><label>来源渠道<select name="source"><option>自主拓展</option><option>管理人推荐</option><option>产业伙伴</option><option>同业转介</option><option>行业会议</option></select></label><label>联系人<input name="contact"></label><label>责任人 *<input name="owner" required></label><label>拟投资额（亿元，选填）<input name="amount" type="number" min="0" step="0.0001"></label><label>下次跟进日 *<input name="due" type="date" required></label><label class="wide">交流要点与下一步 *<textarea name="next" rows="3" required></textarea></label><div class="fs-actions">${foButton('取消','back')}<button class="primary" type="submit">保存接洽记录</button></div></form></section>`}
function foDetail(r){return foHead('OPPORTUNITY / '+fsE(r.kind),fsE(r.name),`${fsE(r.sector)} · ${fsE(r.place||'地域待补充')} · ${fsE(r.source)}`,foButton('← 返回储备池','back'))+`<section class="fs-card"><div class="fo-stage-track">${foStages.slice(0,6).map(s=>`<span class="${s===r.stage?'active':''}">${s}</span>`).join('')}</div><dl class="fo-facts"><div><dt>当前阶段</dt><dd>${fsE(r.stage)}</dd></div><div><dt>责任人 / 联系人</dt><dd>${fsE(r.owner)} / ${fsE(r.contact||'待补充')}</dd></div><div><dt>拟投资额</dt><dd>${r.amount==null?'未填写':foMoney(r.amount)+' 亿'}</dd></div></dl><p class="fo-next"><b>下一步</b> ${fsE(r.next)} <span>跟进日 ${fsE(r.due)}</span></p><div class="fs-actions"><button data-fs-action="ai-ask" data-fs-question="${fsE('为'+r.name+'准备下一次访谈；当前阶段'+r.stage+'；关注事项'+r.next)}">✦ 准备访谈与尽调问题</button></div></section><section class="fs-card"><h2>记录跟进 / 更新阶段</h2><form id="foFollow" data-id="${fsE(r.id)}" class="fs-form-grid"><label>阶段<select name="stage">${foStages.map(s=>`<option ${s===r.stage?'selected':''}>${s}</option>`).join('')}</select></label><label>下次跟进日<input name="due" type="date" value="${fsE(r.due)}" required></label><label class="wide">本次交流 / 阶段变更原因 *<textarea name="note" required rows="3" placeholder="暂缓、终止、投决通过请注明依据；管理人接触可持续留在接洽或初筛阶段"></textarea></label><label class="wide">下一步动作 *<input name="next" value="${fsE(r.next)}" required></label><div class="fs-actions"><button class="primary" type="submit">保存跟进</button></div></form></section>${foPanel('接洽与推进历史','记录本机构的交流、阶段变更及后续动作，不覆盖既往记录',`<div class="fo-history">${r.logs.slice().reverse().map(l=>`<article><time>${fsE(l.at)}</time><div><b>${fsE(l.type)} · ${fsE(l.stage)}</b><p>${fsE(l.note)}</p><small>${fsE(l.actor)}</small></div></article>`).join('')}</div>`)}`}
const foOriginalPipeline=fsPipeline;
fsPipeline=function(){return ['region','fund'].includes(fsAccount()?.version)?foProspects():foOriginalPipeline()};
document.addEventListener('click',event=>{
  const b=event.target.closest('[data-fo-action]');if(!b)return;
  const action=b.dataset.foAction;
  if(!['region','fund'].includes(fsAccount()?.version))return;
  if(action==='dimension'){foState.dimension=b.dataset.value;return fsRender()}
  if(action==='basis'){foState.basis=b.dataset.value;return fsRender()}
  if(action==='portfolio'){fsState.tab='lookthrough';return fsRender()}
  if(action==='inbox'){fsState.tab=fsAccount().version==='region'?'reporting':'home';return fsRender()}
  if(['pipeline','stage','focus','overdue','group'].includes(action)){foState.kind='全部';foState.query='';foState.stage=action==='stage'?b.dataset.filter:action==='focus'?'重点推进':action==='overdue'?'逾期':'全部';if(action==='group'){if(b.dataset.field==='kind')foState.kind=b.dataset.filter;else foState.query=b.dataset.filter}foState.selected=null;foState.editing=false;fsState.tab='pipeline'}
  if(action==='new'){foState.editing=true;foState.selected=null}
  if(action==='detail'){foState.selected=b.dataset.id;foState.editing=false;fsState.tab='pipeline'}
  if(action==='back'){foState.selected=null;foState.editing=false}
  if(action==='kind')foState.kind=b.dataset.value;
  if(action==='clear'){foState.query='';foState.stage='全部';foState.kind='全部'}
  fsRender();
});
document.addEventListener('submit',event=>{
  const form=event.target;if(!['foCreate','foFollow','foFilter'].includes(form.id))return;event.preventDefault();if(!['region','fund'].includes(fsAccount()?.version)||!form.reportValidity())return;
  const v=Object.fromEntries(new FormData(form));for(const key of Object.keys(v))v[key]=String(v[key]).trim();
  if(form.id==='foFilter'){foState.query=v.query;foState.stage=v.stage;return fsRender()}
  const rows=foRead();
  if(form.id==='foCreate'){
    if(!v.name||!v.owner||!v.next)return fsFlash('请填写对象名称、责任人和交流要点。');
    if(v.kind==='管理人')v.amount='';const amount=v.amount===''?null:Number(v.amount);if(amount!==null&&(!Number.isFinite(amount)||amount<0))return fsFlash('拟投资额须为非负数。');
    const r={...v,amount,id:foId(),scope:foScope(),stage:'接洽中',created:foToday(),logs:[{at:wbNow(),actor:fsActor(),type:'新建接洽',note:v.next,stage:'接洽中'}]};rows.push(r);if(!foSave(rows))return;foState.selected=r.id;foState.editing=false;
  }else{
    const r=rows.find(x=>x.id===form.dataset.id&&x.scope===foScope());if(!r||!foStages.includes(v.stage)||!v.note||!v.next)return fsFlash('请补齐本次跟进和下一步动作。');
    r.logs.push({at:wbNow(),actor:fsActor(),type:r.stage===v.stage?'交流跟进':`${r.stage} → ${v.stage}`,stage:v.stage,note:v.note});Object.assign(r,{stage:v.stage,due:v.due,next:v.next});if(!foSave(rows))return;
  }
  fsState.notice='已保存到本机构储备记录；未影响正式投资台账。';fsRender();
});
window.addEventListener('storage',e=>{if(e.key===foKey&&fsAccount())fsRender()});
foSeed();
fsRender();
