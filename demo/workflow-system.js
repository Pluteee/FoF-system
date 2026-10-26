'use strict';
// Simulated accounts share browser-local demo records. URL/account switching is not authentication.
const fsPeriod='2026-Q3';
const fsRegion=dxRegions[0],fsFund=dxFunds.find(f=>f.region===fsRegion.id),fsProject=dxDeals.find(d=>d.region===fsRegion.id);
const fsAccounts=[
  {id:'national-reviewer',version:'national',role:'reviewer',name:'国家母基金审核员',organization:'国家母基金',caption:'发布区域报送要求 · 审核区域季报'},
  {id:'region-reviewer',version:'region',role:'reviewer',name:'区域母基金审核员',organization:fsRegion.name,caption:'发布下级任务 · 审核子基金及直投项目'},
  {id:'region-reviewer-2',version:'region',role:'reviewer',name:'区域母基金评审复核员',organization:fsRegion.name,caption:'申报评审独立复核 · 评分分歧核查'},
  {id:'region-reporter',version:'region',role:'reporter',name:'区域母基金填报人员',organization:fsRegion.name,caption:'填报本区域季报 · 提交内部审核'},
  {id:'region-leader',version:'region',role:'leader',name:'区域母基金负责领导',organization:fsRegion.name,caption:'内部复核 · 批准向国家母基金报送'},
  {id:'fund-reporter',version:'fund',role:'reporter',name:'子基金填报人员',organization:fsFund.name,caption:'填报基金运营与投资数据'},
  {id:'fund-leader',version:'fund',role:'leader',name:'子基金负责领导',organization:fsFund.name,caption:'内部复核 · 批准向区域母基金报送'},
  {id:'project-reporter',version:'project',role:'reporter',name:'直投项目填报人员',organization:fsProject.name,caption:'填报项目进展与材料'},
  {id:'project-leader',version:'project',role:'leader',name:'直投项目负责领导',organization:fsProject.name,caption:'内部复核 · 批准向区域母基金报送'}
];
const fsObject={region:fsRegion,fund:fsFund,project:fsProject};
const fsStatus={assigned:'待填写',draft:'草稿',internal_review:'待本机构审核',returned_internal:'内部退回',submitted:'待上级审核',returned_external:'上级退回',confirmed:'已确认'};
const fsActionName={assigned:'发布报送任务',draft:'保存草稿',internal_review:'提交本机构审核',returned_internal:'本机构退回修改',submitted:'内部批准并报送上级',returned_external:'上级退回补正',confirmed:'上级审核确认'};
const fsState={account:null,tab:'home',selected:null,notice:'',suggested:'',aiQuestion:'',aiAnswer:''};
const fsAiKey='diki-public-demo-workflow-ai-v1';
const fsE=wbE;
const fsRows=()=>wbRecords.filter(r=>r.workflowDemo).slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
const fsAccount=()=>fsAccounts.find(a=>a.id===fsState.account);
const fsRecord=id=>fsRows().find(r=>r.id===id);
const fsOwn=r=>{const a=fsAccount();return a&&(a.version===r.type&&r.target===fsObject[a.version]?.id)};
const fsRelevant=r=>{const a=fsAccount();if(!a)return false;if(a.version==='national')return r.type==='region';if(a.version==='region')return r.region===fsRegion.id;return fsOwn(r)};
const fsActor=()=>`${fsAccount().organization} · ${fsAccount().name}`;
const fsName=r=>fsObject[r.type]?.name||r.target;
const fsReviewerFor=r=>r.type==='region'?'national-reviewer':'region-reviewer';
const fsReporterFor=r=>`${r.type}-reporter`;
const fsLeaderFor=r=>`${r.type}-leader`;
const fsCanPublish=type=>{const a=fsAccount();return a?.role==='reviewer'&&(a.version==='national'&&type==='region'||a.version==='region'&&['fund','project'].includes(type))};
const fsCanExternalReview=r=>{const a=fsAccount();return r.status==='submitted'&&a?.id===fsReviewerFor(r)};
const fsCanInternalReview=r=>{const a=fsAccount();return r.status==='internal_review'&&a?.id===fsLeaderFor(r)};
const fsCanFill=r=>{const a=fsAccount();return a?.id===fsReporterFor(r)&&['assigned','draft','returned_internal','returned_external'].includes(r.status)};
const fsDue='2026-11-15';
const fsAiRead=()=>{try{const rows=JSON.parse(localStorage.getItem(fsAiKey)||'[]');return Array.isArray(rows)?rows:[]}catch{return []}};
const fsAiWrite=rows=>{try{localStorage.setItem(fsAiKey,JSON.stringify(rows.slice(0,30)));return true}catch{return false}};
function fsAiAnswer(question){
  const a=fsAccount(),name=a.organization,lower=question.toLowerCase();let answer;
  if(/风险|预警|问题/.test(lower))answer=`针对${name}，建议优先核查风险等级、重大事项、融资与估值变化、依据材料完整性，并通过企业—基金—区域关系识别是否存在跨区域影响。该结果为演示辅助分析，需人工复核。`;
  else if(/投资|项目池|投决|尽调/.test(lower))answer=`建议按“项目来源—初筛—立项—尽调—投决—交割—投后”检查当前任务，并重点补齐技术、商业、财务、合规和退出路径材料。可以继续追问具体基金或项目。`;
  else if(/经营|融资|估值|退出/.test(lower))answer=`建议将本期经营指标、融资进展、估值变化、退出进度和重大事项与上期确认版对比，形成变化原因、风险判断和下一步管理动作三部分结论。`;
  else answer=`我已基于${name}当前可见的确认数据和报送任务生成分析框架：先看数据完整性，再看本期变化，最后结合风险、投资进度和跨区域关系提出建议。`;
  if(typeof foAiContext==='function'&&['region','fund'].includes(a.version))answer=foAiContext(question)+'\n\n'+answer;
  const row={id:`AI-${Date.now()}`,question,answer,account:a.id,createdAt:wbNow()};fsAiWrite([row,...fsAiRead().filter(x=>x.question!==question||x.account!==a.id)]);return answer;
}
function fsAiPanel(){
  const a=fsAccount(),presets=a.version==='region'?['本区域有哪些重点风险？','本区域项目和基金的产业布局如何？','哪些事项需要跨区域协同？']:a.version==='fund'?['本基金的项目池如何排序？','请生成本基金投决前尽调清单','本基金投后管理应该关注什么？']:['请分析本项目的经营和融资变化','请生成本项目风险尽调清单','本项目下一步投后动作是什么？'];
  const history=fsAiRead().filter(x=>x.account===a.id).slice(0,6);
  return `<section class="fs-card fs-ai-workspace"><div class="fs-card-title"><div><small>AI WORKSPACE</small><h2>AI分析与问答</h2><p>支持预设问题和自由提问，结果可复制、导出并留存历史记录。</p></div><span class="fs-pill confirmed">辅助决策 · 待复核</span></div><div class="fs-ai-presets">${presets.map(q=>`<button data-fs-action="ai-ask" data-fs-question="${fsE(q)}">${fsE(q)}</button>`).join('')}</div><form id="fsAiForm" class="fs-ai-form"><input name="question" value="${fsE(fsState.aiQuestion)}" placeholder="请输入问题，例如：本基金有哪些重点风险？" required><button class="primary" data-fs-action="ai-submit">提问 AI</button></form><div class="fs-ai-answer">${fsState.aiAnswer?`<b>${fsE(fsState.aiQuestion)}</b><p>${fsE(fsState.aiAnswer)}</p><div class="fs-actions"><button data-fs-action="ai-copy">复制结果</button><button data-fs-action="ai-export">导出结果</button></div>`:'<span>选择一个预设问题或输入问题开始分析。</span>'}</div><div class="fs-ai-history"><h3>历史提问</h3>${history.length?history.map(x=>`<button data-fs-action="ai-ask" data-fs-question="${fsE(x.question)}"><b>${fsE(x.question)}</b><small>${fsE(x.createdAt)}</small></button>`).join(''):'<p class="fs-empty">暂无历史记录。</p>'}</div></section>`;
}
function fsWorkspacePanel(){
  const a=fsAccount();
  if(a.version==='national')return `<section class="fs-card"><div class="fs-card-title"><div><small>NATIONAL VIEW</small><h2>国家母基金全局视角</h2><p>查看三大区域、子基金、直投项目、穿透关系和风险联动。</p></div></div><div class="fs-workspace-grid"><article><b>三大区域协同</b><span>统一口径、跨区域资源转介、联合风险处置</span></article><article><b>穿透分析</b><span>直接投资与间接投资、企业影响范围、投资金额</span></article><article><b>统一报送规则</b><span>月 / 季 / 年节奏与总部发布的指标定义</span></article></div></section>`;
  if(a.version==='region')return `<section class="fs-card"><div class="fs-card-title"><div><small>REGIONAL MANAGEMENT</small><h2>区域经营工作台</h2><p>区域自主运营，同时承接国家统一规则，管理子基金、直投、资金计划和风险任务。</p></div></div><div class="fs-workspace-grid"><article><b>区域基金与资金计划</b><span>区域基金档案、出资计划、产业布局、管理人评价</span></article><article><b>下级机构管理</b><span>发布子基金 / 直投任务，审核确认并追踪整改</span></article><article><b>区域协同</b><span>资源转介与需求跟进；跨区域风险由国家统一组织</span></article></div></section>`;
  if(a.version==='fund')return `<section class="fs-card"><div class="fs-card-title"><div><small>SUB-FUND MANAGEMENT</small><h2>子基金经营工作台</h2><p>围绕项目池、投资决策、投研尽调、投资组合和投后管理开展工作。</p></div></div><div class="fs-workspace-grid"><article><b>项目池与投决</b><span>项目初筛、立项、尽调、投决、交割和投资进度</span></article><article><b>投研与 AI 尽调</b><span>产业研究、管理人分析、风险清单和投后监控</span></article><article><b>投资组合管理</b><span>底层项目、退出、估值、经营变化和重大事项</span></article></div></section>`;
  return `<section class="fs-card"><div class="fs-card-title"><div><small>DIRECT PROJECT MANAGEMENT</small><h2>直投项目经营工作台</h2><p>围绕经营、融资、估值、材料和风险持续报送，接受投资方投后管理。</p></div></div><div class="fs-workspace-grid"><article><b>经营跟踪</b><span>收入、订单、客户、产品、资质和现金流变化</span></article><article><b>项目 AI 尽调</b><span>技术、商业、财务、合规和融资风险辅助分析</span></article><article><b>重大事项管理</b><span>融资、估值变化、重大事件和依据材料索引</span></article></div></section>`;
}
function fsDefaultValues(type,target){
  if(type==='project')return {asOf:'2026-09-30',operatingStatus:'正常',milestone:'本期重要进展待核实。',fundingUpdate:'',qualification:'',risk:'无',evidence:'三季度项目运营报告（演示）'};
  return {...wbDefaultValues(type,target)};
}
function fsTransition(record,status,note=''){
  record.status=status;record.updatedAt=wbNow();
  record.history.push({at:record.updatedAt,actor:fsActor(),action:fsActionName[status],note,values:{...record.values}});
  if(!wbPersist()){fsState.notice='浏览器未允许持久保存，操作未能可靠记录。';return fsRender()}
  if(status==='confirmed')wbSyncPaths();
  fsState.notice=`${fsActionName[status]}；${status==='confirmed'?'已形成确认版本。':'待办已转给下一处理人。'}`;
  fsState.tab='home';fsState.selected=record.id;fsRender();
}
function fsPublish(type){
  if(!fsCanPublish(type))return;
  const target=fsObject[type].id;
  if(fsRows().some(r=>r.type===type&&r.target===target&&r.period===fsPeriod&&r.status!=='confirmed'))return fsFlash('本期已有进行中的任务；请先完成或重置演示。');
  const previous=wbRecords.filter(r=>r.type===type&&r.target===target&&r.period===fsPeriod);
  const version=previous.reduce((max,r)=>Math.max(max,Number(r.version)||0),0)+1;
  const now=wbNow(),values=fsDefaultValues(type,target);
  const record={id:wbId('flow'),workflowDemo:true,type,target,region:fsRegion.id,period:fsPeriod,version,status:'assigned',values,createdAt:now,updatedAt:now,dueAt:fsDue,history:[{at:now,actor:fsActor(),action:fsActionName.assigned,note:`报送对象：${fsName({type,target})}；截止：${fsDue}；依据：季报及佐证材料`,values:{...values}}]};
  wbRecords.push(record);wbPersist();fsState.notice='任务已发布。请切换到对应机构的填报人员账号查看待办。';fsState.selected=record.id;fsRender();
}
function fsFormValues(form,type){
  return Object.fromEntries(wbFields(type).map(field=>[field.key,form.elements.namedItem(field.key)?.value.trim()||'']));
}
function fsSave(submit){
  const record=fsRecord(fsState.selected),form=document.getElementById('fsForm');if(!record||!form||!fsCanFill(record))return;
  const values=fsFormValues(form,record.type),error=submit?wbValidate(record.type,values):'';
  if(error)return fsFlash(error);
  record.values=values;fsTransition(record,submit?'internal_review':'draft');
}
function fsDecision(approve){
  const record=fsRecord(fsState.selected);if(!record)return;
  const internal=fsCanInternalReview(record),external=fsCanExternalReview(record);if(!internal&&!external)return;
  const note=document.getElementById('fsOpinion')?.value.trim()||'';
  if(!approve&&!note)return fsFlash('退回必须写明原因，便于填报人员补正。');
  const status=internal?(approve?'submitted':'returned_internal'):(approve?'confirmed':'returned_external');
  fsTransition(record,status,note);
}
function fsReset(){
  if(!window.confirm('只清除分层协同演示生成的任务和报送记录；不会清除其他 demo 数据。确定重置吗？'))return;
  for(let i=wbRecords.length-1;i>=0;i--)if(wbRecords[i].workflowDemo)wbRecords.splice(i,1);
  wbPersist();wbSyncPaths();fsState.notice='演示任务已重置。';fsState.selected=null;fsRender();
}
function fsFlash(message){fsState.notice=message;const target=document.getElementById('fsNotice');if(target){target.textContent=message;target.hidden=false;return}document.getElementById('fsContent')?.insertAdjacentHTML('afterbegin',`<div id="fsNotice" class="fs-notice" role="status">${fsE(message)}</div>`)}
function fsLogin(){
  const versions=[['national','01','国家母基金版','跨区域汇总、穿透分析、统一规则、发布区域报送、审核区域季报'],['region','02','区域母基金版','区域总览、资金计划、管理人评价、下级审核、资源协同'],['child','03','子基金 / 直投项目版','项目池与投决、投资组合、AI尽调、经营跟踪、持续报送']];
  return `<div class="fs-login"><header class="fs-login-top"><img class="dili-mark" src="dili-mark.svg?v=20261026-brand" alt="" width="42" height="42"><div><b>DILI·FoF · 分层协同系统</b><span>SIMULATED SIGN-IN / 角色化产品演示</span></div><a href="index.html">返回国家基金原演示 ↗</a></header><main><div class="fs-login-intro"><small>一个业务平台 · 三类系统界面 · 逐级审核</small><h1>选择演示账号，进入对应系统</h1><p>这里模拟登录与机构权限，以同一份任务展示 B 发布 → A 填报 → A 领导批准 → B 确认。账号卡片无需密码，不代表真实身份认证。进入后会根据账号看到对应权限范围和完整工作台。</p></div><div class="fs-login-grid">${versions.map(([version,no,title,sub])=>`<section class="fs-login-card"><div class="fs-login-index">${no}</div><h2>${title}</h2><p>${sub}</p><div class="fs-accounts">${fsAccounts.filter(a=>version==='child'?['fund','project'].includes(a.version):a.version===version).map(a=>`<button data-fs-action="login" data-account="${a.id}" class="${fsState.suggested===a.id?'suggested':''}"><span>${fsE(a.name)}</span><small>${fsE(a.caption)} · 进入${a.version==='region'?'募投管退与报送审核工作台':a.version==='fund'?'项目池、投研尽调和投资组合工作台':a.version==='project'?'经营跟踪和项目 AI 尽调工作台':'国家全局管理工作台'}</small><i>进入 ↗</i></button>`).join('')}</div></section>`).join('')}</div><div class="fs-login-note">仅本机演示：不同账号看到不同待办与数据范围，但数据只保存在当前浏览器。正式部署须接入真实登录、共享后端和服务端权限校验。 <button data-fs-action="reset">重置演示记录</button></div></main></div>`;
}
function fsMetrics(rows){
  const a=fsAccount(),pending=rows.filter(r=>fsCanFill(r)||fsCanInternalReview(r)||fsCanExternalReview(r)).length;
  const confirmed=rows.filter(r=>r.status==='confirmed');
  const direct=confirmed.filter(r=>r.type==='fund').reduce((sum,r)=>sum+Number(r.values.paid||0),0);
  const third=a.version==='national'?`${confirmed.filter(r=>r.type==='region').length} 份区域确认报告`:`${dxMoney(direct)} 亿子基金已确认实缴`;
  return `<div class="fs-metrics"><div><small>我的待办</small><b>${pending}</b><span>按当前账号计算</span></div><div><small>可见报送</small><b>${rows.length}</b><span>机构范围内</span></div><div><small>已确认</small><b>${confirmed.length}</b><span>草稿与待审不计入</span></div><div><small>确认数据摘要</small><b class="fs-metric-text">${third}</b><span>${fsPeriod}</span></div></div>`;
}
function fsNext(record){
  if(!record)return null;
  const next=record.status==='assigned'||record.status==='draft'||record.status.startsWith('returned')?fsReporterFor(record):record.status==='internal_review'?fsLeaderFor(record):record.status==='submitted'?fsReviewerFor(record):null;
  if(!next||next===fsState.account)return null;
  const account=fsAccounts.find(a=>a.id===next);
  return `<button class="fs-next" data-fs-action="suggest" data-account="${next}">切换账号，查看「${fsE(account.name)}」待办 →</button>`;
}
function fsTaskRows(rows){
  return rows.length?`<div class="fs-table-wrap"><table><thead><tr><th>报送任务</th><th>状态</th><th>报告期 / 版本</th><th>下一处理方</th><th></th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${fsE(fsName(r))}</b><small>${r.type==='region'?'区域季报':r.type==='fund'?'子基金季报':'项目季报'} · 截止 ${fsE(r.dueAt||'—')}</small></td><td><span class="fs-pill ${r.status}">${fsStatus[r.status]||r.status}</span></td><td>${fsE(r.period)} · v${r.version}</td><td>${r.status==='internal_review'?'A 机构负责领导':r.status==='submitted'?'上级审核人':r.status==='confirmed'?'已完成':'填报人员'}</td><td><button data-fs-action="open" data-id="${r.id}">查看 →</button></td></tr>`).join('')}</tbody></table></div>`:`<div class="fs-empty">当前范围内没有报送记录。${fsAccount().role==='reviewer'?'请先发布任务。':'请由上级机构发布任务，或切换账号体验。'}</div>`;
}
function fsPublisher(){
  const a=fsAccount();if(a.role!=='reviewer')return '';
  const kinds=a.version==='national'?['region']:['fund','project'];
  return `<section class="fs-card fs-publisher"><div class="fs-card-title"><div><small>REPORT REQUIREMENT</small><h2>发布报送要求</h2><p>选择接收机构后，任务会出现在其填报人员的工作台。</p></div></div><div class="fs-publish-grid">${kinds.map(type=>`<article><span>${type==='region'?'区域母基金':type==='fund'?'所投子基金':'直投项目'}</span><h3>${fsE(fsObject[type].name)}</h3><p>${fsPeriod} · 截止 ${fsDue} · 季报与依据材料</p><button data-fs-action="publish" data-type="${type}">发布任务 →</button></article>`).join('')}</div></section>`;
}
function fsFields(record){
  return `<form id="fsForm" class="fs-form"><div class="fs-form-grid">${wbFields(record.type).map(field=>{const value=record.values[field.key]??'',label=`${fsE(field.label)}${field.unit?` (${fsE(field.unit)})`:''}${field.required?' *':''}`;let input;if(field.type==='textarea')input=`<textarea name="${field.key}" rows="3">${fsE(value)}</textarea>`;else if(field.type==='select')input=`<select name="${field.key}">${field.options.map(o=>`<option value="${fsE(o)}" ${value===o?'selected':''}>${fsE(o)}</option>`).join('')}</select>`;else input=`<input name="${field.key}" type="${field.type}" value="${fsE(value)}" ${field.type==='number'?'min="0" step="0.0001"':''}>`;return `<label class="${field.type==='textarea'?'wide':''}"><span>${label}</span>${input}</label>`}).join('')}</div><div class="fs-actions"><button type="button" data-fs-action="save">保存草稿</button><button type="button" class="primary" data-fs-action="submit">提交本机构负责人审核 →</button></div></form>`;
}
function fsFacts(record){
  const keys=record.type==='fund'?['asOf','committed','paid','risk','summary','evidence']:record.type==='project'?['asOf','operatingStatus','milestone','risk','evidence']:['asOf','annualPlan','annualInvestPlan','newFunds','newDeals','risk','summary','evidence'];
  return `<dl class="fs-facts">${keys.map(key=>{const field=wbFields(record.type).find(f=>f.key===key);return `<div><dt>${fsE(field?.label||key)}</dt><dd>${fsE(record.values[key]||'—')}${field?.unit?` ${fsE(field.unit)}`:''}</dd></div>`}).join('')}</dl>`;
}
function fsOpinion(internal){return `<div class="fs-review"><label>审核意见<textarea id="fsOpinion" rows="3" placeholder="退回时必须说明需要补正的事项"></textarea></label><div class="fs-actions"><button data-fs-action="return">退回修改</button><button class="primary" data-fs-action="approve">${internal?'批准并报送上级 →':'审核确认，进入统计 →'}</button></div></div>`}
function fsDetail(record){
  const note=record.history.slice().reverse().find(h=>h.note&&h.action.includes('退回'))?.note;
  let action='';
  if(fsCanFill(record))action=`${note?`<div class="fs-return-note">退回意见：${fsE(note)}</div>`:''}<p>基础信息已预填，请核对本期变化并填写依据材料。提交后先由本机构负责人审核。</p>${fsFields(record)}`;
  else if(fsCanInternalReview(record))action=`<div class="fs-stage-note">内部复核：通过后才会向上级机构生成审核待办。</div>${fsFacts(record)}${fsOpinion(true)}`;
  else if(fsCanExternalReview(record))action=`<div class="fs-stage-note">上级审核：本任务已由填报机构负责人批准报出。</div>${fsFacts(record)}${fsOpinion(false)}`;
  else if(fsState.account===fsReviewerFor(record)&&!['submitted','confirmed'].includes(record.status))action='<div class="fs-stage-note">可查看任务进度，但填报内容尚在对方机构内部流转；负责人批准报出前，上级不能查看未报出的字段和材料。</div>';
  else action=`<div class="fs-stage-note">当前账号没有该任务的可操作待办。${record.status==='confirmed'?'确认数据已进入本级统计。':''}</div>${fsFacts(record)}`;
  return `<div class="fs-detail-head"><div><small>${fsE(record.period)} · v${record.version} · 报送编号 ${fsE(record.id)}</small><h2>${fsE(fsName(record))}</h2><p>发布：${fsE(record.history[0]?.actor)} · 截止：${fsE(record.dueAt||'—')}</p></div><span class="fs-pill ${record.status}">${fsStatus[record.status]}</span></div><section class="fs-card">${action}</section>${fsNext(record)||''}<section class="fs-card fs-timeline"><h2>流转与版本记录</h2><ol>${record.history.map(h=>`<li><time>${fsE(h.at)}</time><div><b>${fsE(h.action)}</b><span>${fsE(h.actor)}</span>${h.note?`<p>${fsE(h.note)}</p>`:''}</div></li>`).join('')}</ol></section>`;
}
function fsHome(){
  const rows=fsRows().filter(fsRelevant),a=fsAccount(),selected=fsRecord(fsState.selected);
  const todo=rows.filter(r=>fsCanFill(r)||fsCanInternalReview(r)||fsCanExternalReview(r));
  const title=a.version==='national'?'国家母基金管理工作台':a.version==='region'?'区域母基金管理工作台':a.version==='fund'?'子基金报送工作台':'直投项目报送工作台';
  return `<div class="fs-page-head"><small>${a.version.toUpperCase()} WORKSPACE / ${fsE(a.name)}</small><h1>${title}</h1><p>${fsE(a.organization)} · 仅展示当前机构有权查看的演示任务与确认数据</p></div>${fsWorkspacePanel()}${typeof nrRegionInbox==='function'?nrRegionInbox():''}${fsMetrics(rows)}${selected&&fsRelevant(selected)?fsDetail(selected):`<section class="fs-card"><div class="fs-card-title"><div><small>MY INBOX</small><h2>我的待办</h2></div><span>${todo.length} 项待处理</span></div>${fsTaskRows(todo)}</section>${fsPublisher()}<section class="fs-card"><div class="fs-card-title"><div><small>TRACKING</small><h2>本机构报送进度</h2></div></div>${fsTaskRows(rows)}</section>`}`;
}
function fsHistory(){const rows=fsRows().filter(fsRelevant);return `<div class="fs-page-head"><small>REPORT TRAIL</small><h1>报送与审核记录</h1><p>按机构权限查看任务状态、审核意见和确认版本。</p></div><section class="fs-card">${fsTaskRows(rows)}</section>`}
function fsPortfolio(){const a=fsAccount(),paths=dxPaths.filter(x=>a.version==='fund'?x.fundId===fsFund.id:x.region===fsRegion.id);return `<div class="fs-page-head"><small>LOOK-THROUGH MANAGEMENT</small><h1>${a.version==='region'?'区域投资穿透':'子基金投资组合'}</h1><p>查看直接投资与间接投资关系、底层企业和投资金额。</p></div><section class="fs-card"><div class="fs-table-wrap"><table><thead><tr><th>底层企业</th><th>投资关系</th><th>产业 / 地域</th><th>投资金额</th></tr></thead><tbody>${paths.map(x=>`<tr><td><b>${fsE(x.enterprise)}</b></td><td>${x.kind==='direct'?'直投':'间接'}<small>${fsE(x.fundId||x.dealId||'—')}</small></td><td>${fsE(x.sector)}<small>${fsE(x.place)}</small></td><td>${Number(x.invest||0).toFixed(2)} 亿</td></tr>`).join('')}</tbody></table></div></section>`}
function fsCapital(){const funds=dxRegionFunds(fsRegion.id);return `<div class="fs-page-head"><small>CAPITAL PLAN</small><h1>区域资金计划与出资进度</h1><p>区域侧维护资金安排、子基金申请和年度投资计划。</p></div><section class="fs-card"><div class="fs-table-wrap"><table><thead><tr><th>子基金</th><th>目标规模</th><th>申请额</th><th>状态</th></tr></thead><tbody>${funds.map(x=>`<tr><td><b>${fsE(x.name)}</b></td><td>${Number(x.size||0).toFixed(1)} 亿</td><td>${Number(x.request||0).toFixed(1)} 亿</td><td><span class="fs-pill confirmed">计划内</span></td></tr>`).join('')}</tbody></table></div></section>`}
function fsManagers(){const funds=dxRegionFunds(fsRegion.id),names=[...new Set(funds.map(x=>x.manager))];return `<div class="fs-page-head"><small>MANAGER EVALUATION</small><h1>管理人评价</h1><p>从报送及时性、投资进度、风险处置和资源协同能力形成评价底稿。</p></div><section class="fs-card fs-workspace-grid">${names.map(name=>`<article><b>${fsE(name)}</b><span>${funds.filter(x=>x.manager===name).length} 支关联子基金</span><p>本期评价：待补充管理人评价意见。</p></article>`).join('')}</section>`}
function fsCollab(){return `<div class="fs-page-head"><small>RESOURCE COLLABORATION</small><h1>区域资源协同</h1><p>管理异地落地、客户、供应链和融资转介。</p></div><section class="fs-card"><div class="fs-workspace-grid"><article><b>待接收需求</b><span>跨区域企业转介、异地落地和融资需求</span></article><article><b>本区域待转介</b><span>将企业需求分发给其他区域或产业资源方</span></article><article><b>协同闭环</b><span>接收、对接中、已关闭，保留责任人和结果材料</span></article></div></section>`}

function fsPipeline(){return `<div class="fs-page-head"><small>INVESTMENT PIPELINE</small><h1>项目池与投资决策</h1><p>子基金管理项目储备、初筛、尽调和投决准备。</p></div><section class="fs-card"><div class="fs-table-wrap"><table><thead><tr><th>项目阶段</th><th>工作内容</th><th>AI辅助</th><th>下一步</th></tr></thead><tbody><tr><td>初筛</td><td>项目来源、产业匹配、阶段和估值</td><td>产业研究与优先级排序</td><td>立项</td></tr><tr><td>尽调中</td><td>技术、商业、财务、合规和退出</td><td>AI尽调问题清单</td><td>补充材料</td></tr><tr><td>投决准备</td><td>投资方案、估值、条款和风险</td><td>投资备忘录摘要</td><td>安排投决会议</td></tr></tbody></table></div></section>`}
function fsResearch(){const fund=fsAccount().version==='fund';return `<div class="fs-page-head"><small>AI DUE DILIGENCE</small><h1>${fund?'投研与 AI 尽调':'项目 AI 尽调'}</h1><p>${fund?'辅助子基金进行赛道研究、项目筛选、投决和投后管理。':'辅助直投项目整理经营、融资、技术、合规和重大事项材料。'}</p></div><section class="fs-card fs-research-grid"><article><b>研究摘要</b><p>围绕产业趋势、竞争格局、区域协同和投资阶段生成研究底稿。</p><button data-fs-action="ai-ask" data-fs-question="请生成一份产业研究摘要">生成研究摘要</button></article><article><b>尽调清单</b><p>技术、商业、财务、合规、管理人、客户和退出路径。</p><button data-fs-action="ai-ask" data-fs-question="请生成一份投决前尽调清单">生成尽调清单</button></article><article><b>投后监控</b><p>融资、估值、经营指标、退出进度和重大风险变化。</p><button data-fs-action="ai-ask" data-fs-question="请生成一份投后管理监控建议">生成监控建议</button></article></section>`}
function fsOperations(){return `<div class="fs-page-head"><small>OPERATIONS TRACKING</small><h1>项目经营跟踪</h1><p>直投项目持续更新经营、融资、估值、资质、客户和重大事项。</p></div><section class="fs-card"><div class="fs-workspace-grid"><article><b>经营指标</b><span>收入、订单、毛利、现金流、客户集中度</span></article><article><b>融资与估值</b><span>融资轮次、估值变化、资金用途和下一轮计划</span></article><article><b>材料与风险</b><span>重大事项、风险等级、依据材料索引</span></article></div></section>`}
function fsDashboard(){
  if(fsAccount().version==='national'&&typeof nrPanel==='function')return `<div class="fs-page-head"><small>NATIONAL DASHBOARD</small><h1>国家母基金驾驶舱</h1><p>统筹三地区域投资关系与跨区域风险核查；完整投资分析可从左侧返回国家基金总系统查看。</p></div><div class="fs-metrics"><div><small>区域母基金</small><b>${dxRegions.length}</b><span>统一规则与报送</span></div><div><small>子基金档案</small><b>${dxFunds.length}</b><span>三地纳管范围</span></div><div><small>直投项目记录</small><b>${dxDeals.length}</b><span>项目档案与交易</span></div><div><small>联合核查任务</small><b>${nrRead().filter(x=>x.status!=='已关闭').length}</b><span>国家组织、区域反馈</span></div></div>${nrPanel()}`;
  if(typeof fsOpsDashboard==='function'&&['region','fund'].includes(fsAccount().version))return fsOpsDashboard();
  const a=fsAccount();
  if(a.version==='region'){
    const funds=dxRegionFunds(fsRegion.id),deals=dxRegionDeals(fsRegion.id),paths=dxPaths.filter(x=>x.region===fsRegion.id),risk=demoScenario.updates.filter(x=>x.region===fsRegion.id&&/融资|风险/.test(x.type));
    return `<div class="fs-page-head"><small>REGIONAL DASHBOARD / ${fsE(fsRegion.name)}</small><h1>区域母基金驾驶舱</h1><p>本区域基金、子基金、直投项目、底层项目和风险协同的统一工作视图。</p></div><div class="fs-metrics fs-dashboard-metrics"><div><small>纳管子基金</small><b>${funds.length}</b><span>运营中与储备中</span></div><div><small>区域直投项目</small><b>${deals.length}</b><span>全生命周期跟踪</span></div><div><small>穿透投资路径</small><b>${paths.length}</b><span>直接 + 间接投资</span></div><div><small>本期重点事项</small><b>${risk.length}</b><span>需要核查或处置</span></div></div><section class="fs-card fs-dashboard-layout"><div><div class="fs-card-title"><div><small>PORTFOLIO DISTRIBUTION</small><h2>区域产业布局</h2></div><button data-fs-action="tab" data-tab="subfunds">查看子基金管理 →</button></div>${fsBarList([...new Set(funds.map(x=>x.sector))].map(sector=>[sector,funds.filter(x=>x.sector===sector).length]))}</div><div><div class="fs-card-title"><div><small>RISK WATCH</small><h2>风险与待办</h2></div><button data-fs-action="tab" data-tab="home">查看核查待办 →</button></div><div class="fs-watch-list">${risk.length?risk.slice(0,4).map(x=>`<article><b>${fsE(x.type)} · ${fsE(x.enterprise)}</b><span>${fsE(x.title)}</span><small>${fsE(x.detail)}</small></article>`).join(''):'<p class="fs-empty">当前没有新增重点事项。</p>'}</div></div></section><section class="fs-card"><div class="fs-card-title"><div><small>AI QUESTION</small><h2>区域经营问数</h2><p>直接询问本区域产业、资金、风险和协同情况。</p></div><button class="primary" data-fs-action="tab" data-tab="ai">打开 AI 问答 →</button></div><div class="fs-question-chips">${['本区域有哪些重点风险？','哪些项目需要跨区域资源协同？','本区域产业布局是否均衡？'].map(q=>`<button data-fs-action="ai-ask" data-fs-question="${fsE(q)}">${fsE(q)}</button>`).join('')}</div></section>`;
  }
  if(a.version==='fund'){
    const f=fsFund,perf=demoScenario.fundPerformance[f.id]||{},paths=dxPaths.filter(x=>x.fundId===f.id);
    return `<div class="fs-page-head"><small>SUB-FUND DASHBOARD / ${fsE(f.name)}</small><h1>子基金管理驾驶舱</h1><p>基金规模、项目池、投资组合、投后风险和报送状态的统一视图。</p></div><div class="fs-metrics fs-dashboard-metrics"><div><small>基金目标规模</small><b>${Number(f.size||0).toFixed(1)} 亿</b><span>${fsE(f.sector)}</span></div><div><small>TVPI / DPI</small><b>${perf.tvpi||'—'} / ${perf.dpi||'—'}</b><span>基金回报</span></div><div><small>IRR</small><b>${perf.irr||'—'}%</b><span>基于确认数据</span></div><div><small>底层投资</small><b>${paths.length}</b><span>穿透关系</span></div></div><section class="fs-card fs-dashboard-layout"><div><div class="fs-card-title"><div><small>FUND HEALTH</small><h2>基金健康度</h2></div></div>${fsBarList([['投资进度',72],['报送完整度',86],['投后更新率',64],['退出准备度',38]])}</div><div><div class="fs-card-title"><div><small>AI COPILOT</small><h2>投研助手</h2></div><button data-fs-action="tab" data-tab="research">进入 AI 尽调 →</button></div><div class="fs-watch-list"><article><b>项目池优先级</b><span>按产业匹配、阶段、估值和风险排序</span></article><article><b>投决材料</b><span>自动形成尽调问题和投资备忘录框架</span></article><article><b>投后预警</b><span>关注融资、估值、经营和退出变化</span></article></div></div></section>`;
  }
  const p=fsProject,paths=dxPaths.filter(x=>x.enterprise===p.name),updates=demoScenario.updates.filter(x=>x.enterprise===p.name||x.dealId===p.id);
  return `<div class="fs-page-head"><small>PROJECT DASHBOARD / ${fsE(p.name)}</small><h1>直投项目驾驶舱</h1><p>经营状态、融资估值、项目风险和材料完整度的统一视图。</p></div><div class="fs-metrics fs-dashboard-metrics"><div><small>经营状态</small><b>正常</b><span>${fsE(p.sector)}</span></div><div><small>当前轮次</small><b>${p.round||'—'}</b><span>融资轮次</span></div><div><small>投资路径</small><b>${paths.length}</b><span>直接 + 间接关系</span></div><div><small>近期动态</small><b>${updates.length}</b><span>融资 / 资质 / 产品</span></div></div><section class="fs-card fs-dashboard-layout"><div><div class="fs-card-title"><div><small>OPERATING HEALTH</small><h2>经营健康度</h2></div></div>${fsBarList([['经营指标更新',68],['融资材料完整度',82],['技术里程碑',76],['风险事项闭环',54]])}</div><div><div class="fs-card-title"><div><small>AI DUE DILIGENCE</small><h2>项目尽调助手</h2></div><button data-fs-action="tab" data-tab="research">进入项目尽调 →</button></div><div class="fs-watch-list"><article><b>经营趋势</b><span>分析收入、订单、客户、现金流变化</span></article><article><b>风险扫描</b><span>技术、商业、财务、合规和舆情</span></article><article><b>管理动作</b><span>生成访谈问题和待补材料清单</span></article></div></div></section>`;
}
function fsBarList(rows){return `<div class="fs-bar-list">${rows.map(([label,value])=>`<div><div><span>${fsE(label)}</span><b>${value}${typeof value==='number'&&value<=100?'%':''}</b></div><i><em style="width:${Math.min(100,Number(value)||0)}%"></em></i></div>`).join('')}</div>`}
function fsSubfunds(){const funds=dxRegionFunds(fsRegion.id);return `<div class="fs-page-head"><small>SUB-FUND MANAGEMENT</small><h1>子基金管理</h1><p>区域侧管理子基金储备、遴选、尽调、投决、出资、运营和风险。</p></div><section class="fs-card"><div class="fs-toolbar"><input placeholder="搜索子基金、管理人或产业"><select><option>全部状态</option><option>投资期</option><option>退出期</option></select><button class="primary">新建储备项目</button></div><div class="fs-table-wrap"><table><thead><tr><th>子基金</th><th>管理人</th><th>产业 / 地域</th><th>规模 / 申请</th><th>阶段</th><th>管理动作</th></tr></thead><tbody>${funds.map((x,i)=>`<tr><td><b>${fsE(x.name)}</b><small>${fsE(x.id)}</small></td><td>${fsE(x.manager)}</td><td>${fsE(x.sector)}<small>${fsE(x.place)}</small></td><td>${Number(x.size||0).toFixed(1)} / ${Number(x.request||0).toFixed(1)} 亿</td><td><span class="fs-pill ${i%3===0?'confirmed':'internal_review'}">${i%3===0?'投资期':'尽调 / 评估'}</span></td><td><button data-fs-action="ai-ask" data-fs-question="请分析${fsE(x.name)}的管理人、产业策略和风险">AI分析</button><button>查看档案</button></td></tr>`).join('')}</tbody></table></div></section>`}
function fsDirectProjects(){const deals=dxRegionDeals(fsRegion.id);return `<div class="fs-page-head"><small>DIRECT PROJECT MANAGEMENT</small><h1>直投项目管理</h1><p>区域侧管理项目储备、立项、尽调、投决、投后和重大事项。</p></div><section class="fs-card"><div class="fs-toolbar"><input placeholder="搜索项目、产业或所在地"><select><option>全部项目状态</option><option>投前储备</option><option>投后跟踪</option><option>重点关注</option></select><button class="primary">新增项目</button></div><div class="fs-table-wrap"><table><thead><tr><th>项目</th><th>产业 / 所在地</th><th>业务摘要</th><th>轮次 / 申请额</th><th>状态</th><th>动作</th></tr></thead><tbody>${deals.map((x,i)=>`<tr><td><b>${fsE(x.name)}</b><small>${fsE(x.id)}</small></td><td>${fsE(x.sector)}<small>${fsE(x.place)}</small></td><td>${fsE(x.summary)}</td><td>${x.round||'—'} / ${x.request||'—'} 亿</td><td><span class="fs-pill ${i%4===0?'confirmed':'internal_review'}">${i%4===0?'投后跟踪':'投前评估'}</span></td><td><button data-fs-action="ai-ask" data-fs-question="请生成${fsE(x.name)}的项目尽调清单">AI尽调</button><button>查看项目</button></td></tr>`).join('')}</tbody></table></div></section>`}
function fsLookthrough(){const a=fsAccount(),rows=a.version==='fund'?dxPaths.filter(x=>x.fundId===fsFund.id):dxPaths.filter(x=>x.region===fsRegion.id);return `<div class="fs-page-head"><small>LOOK-THROUGH NETWORK</small><h1>底层项目穿透</h1><p>按企业、基金、直投、间接投资和区域关系查看投资网络及影响范围。</p></div><section class="fs-card"><div class="fs-network-summary"><div><b>${new Set(rows.map(x=>x.enterprise)).size}</b><span>底层企业</span></div><div><b>${rows.filter(x=>x.kind==='direct').length}</b><span>直投关系</span></div><div><b>${rows.filter(x=>x.kind==='indirect').length}</b><span>间接关系</span></div><div><b>${rows.reduce((s,x)=>s+Number(x.invest||0),0).toFixed(2)} 亿</b><span>投资金额</span></div></div><div class="fs-table-wrap"><table><thead><tr><th>企业</th><th>关系</th><th>基金 / 项目</th><th>区域</th><th>金额</th><th>风险动作</th></tr></thead><tbody>${rows.map(x=>`<tr><td><b>${fsE(x.enterprise)}</b></td><td>${x.kind==='direct'?'直投':'间接'}</td><td>${fsE(x.fundId||x.dealId||'—')}</td><td>${fsE(dxRegion(x.region).city)}</td><td>${Number(x.invest||0).toFixed(2)} 亿</td><td><button data-fs-action="ai-ask" data-fs-question="请分析${fsE(x.enterprise)}的投资关系和潜在风险">AI穿透分析</button></td></tr>`).join('')}</tbody></table></div></section>`}
function fsApp(){
  if(fsAccount().version==='project'&&typeof rpEnterpriseApp==='function')return rpEnterpriseApp();
  if(fsAccount().version==='region'&&typeof lcRegionApp==='function')return lcRegionApp();
  if(['region','fund'].includes(fsAccount().version)&&fsState.tab==='history')fsState.tab='reporting';
  if(fsAccount().version==='region'&&fsState.tab==='risk')fsState.tab='dashboard';
  const a=fsAccount(),rows=fsRows().filter(fsRelevant),pending=rows.filter(r=>fsCanFill(r)||fsCanInternalReview(r)||fsCanExternalReview(r)).length;
  const extra=a.version==='national'?[['overview','全局数据说明','']]:a.version==='region'?[['pipeline','储备与接洽',''],['subfunds','子基金管理',''],['deals','直投项目管理',''],['lookthrough','底层项目穿透',''],['capital','资金计划',''],['managers','管理人评价',''],['collab','资源协同','']]:a.version==='fund'?[['pipeline','项目储备与投决',''],['portfolio','投资组合',''],['lookthrough','底层项目穿透',''],['research','投研与 AI 尽调','']]:[['operations','经营跟踪',''],['lookthrough','投资关系穿透',''],['research','项目 AI 尽调','']];
  const menu=[['dashboard','驾驶舱',''],['home','任务工作台',String(pending)],...extra,...(['national','fund'].includes(a.version)?[['performance','绩效监测评价',''],['riskmonitor','风险监测','']]:[]),...(a.version==='national'?[['applications','批量申报评估','']]:[]),['reporting','定期报送与审核',''],['ai','AI研究工作台',''],...(a.version==='national'?[['history','报送记录','']]:[])];
  const body=fsState.tab==='riskmonitor'&&['national','fund'].includes(a.version)?rmPage():fsState.tab==='performance'&&['national','fund'].includes(a.version)?pmPage():fsState.tab==='applications'&&a.version==='national'?arPage():fsState.tab==='reporting'&&typeof rpPage==='function'?rpPage():fsState.tab==='dashboard'?fsDashboard():fsState.tab==='history'?fsHistory():fsState.tab==='overview'?fsOverview():fsState.tab==='ai'?fsAiPanel():fsState.tab==='portfolio'?fsPortfolio():fsState.tab==='lookthrough'?fsLookthrough():fsState.tab==='subfunds'?fsSubfunds():fsState.tab==='deals'?fsDirectProjects():fsState.tab==='capital'?fsCapital():fsState.tab==='managers'?fsManagers():fsState.tab==='collab'?fsCollab():fsState.tab==='pipeline'?fsPipeline():fsState.tab==='research'?fsResearch():fsState.tab==='operations'?fsOperations():fsHome();
  return `<div class="fs-shell"><aside class="fs-side"><div class="fs-side-brand"><img class="dili-mark" src="dili-mark.svg?v=20261026-brand" alt="" width="42" height="42"><div><b>DILI·FoF</b><small>${a.version==='national'?'国家母基金版':a.version==='region'?'区域母基金版':a.version==='fund'?'子基金版':'直投项目版'}</small></div></div><div class="fs-side-org"><small>当前模拟账号</small><b>${fsE(a.name)}</b><span>${fsE(a.organization)}</span></div><nav>${menu.map(([tab,label,count])=>`<button data-fs-action="tab" data-tab="${tab}" class="${fsState.tab===tab?'active':''}">${label}${count?`<em>${count}</em>`:''}</button>`).join('')}</nav><div class="fs-side-bottom"><button data-fs-action="logout">切换演示账号 ↗</button><a href="index.html">返回国家基金原演示</a></div></aside><div class="fs-main"><header class="fs-top"><span>分层协同系统 / ${fsE(a.name)}</span><span>${fsPeriod} · 单浏览器流程模拟</span></header><main id="fsContent">${body}</main></div></div>`;
}
function fsOverview(){
  const a=fsAccount(),rows=fsRows().filter(fsRelevant),confirmed=rows.filter(r=>r.status==='confirmed');
  return `<div class="fs-page-head"><small>CONFIRMED DATA / DEMO RULES</small><h1>确认数据与权限范围</h1><p>${fsE(a.organization)}只能看到本机构及业务归属范围内的演示记录。</p></div>${fsMetrics(rows)}<section class="fs-card"><h2>本级已确认报送</h2>${fsTaskRows(confirmed)}<p class="fs-help">只有上级审核确认的版本参与确认统计；内部批准报出并不等于上级确认。此页与国家基金原有数据看板共用同一浏览器本地演示记录。</p></section>`;
}
function fsResearchBrief(){
  return `<section class="fs-card"><div class="fs-card-title"><div><small>RESEARCH BRIEF</small><h2>AI研究工作台</h2><p>围绕行业或企业发起专题研究，整理研究问题、资料线索和待核实事项。</p></div><span class="fs-pill">研究底稿</span></div><form id="fsResearchBrief" class="fs-form-grid"><label>研究类型<select name="kind"><option>行业研究</option><option>企业尽调</option><option>竞品比较</option><option>投资主题研究</option></select></label><label>行业 / 企业名称<input name="subject" required placeholder="例如：具身智能 / 某企业全称"></label><label class="wide">研究问题与资料线索<textarea name="brief" rows="3" placeholder="填写关注问题、已有材料摘要、来源与日期"></textarea></label><div class="fs-actions"><button type="button" data-fs-action="research-start">生成研究底稿</button></div></form><p class="fs-help">当前为本地规则式研究演示，未联网检索或调用大模型。事实和来源需补充核实。</p></section>`;
}
function fsBusinessAi(){
  const tab=fsState.tab,record=fsRecord(fsState.selected),context=record?`${fsName(record)} · ${record.period} · v${record.version}`:fsAccount().organization;
const questions={fundraising:['核对募资认缴与实缴口径','生成资金来源核查材料清单'],exits:['核对退出计划与实际回款的差异','梳理退出方案与回款凭证缺口'],dashboard:['解释本期关键变化','找出需要优先处理的事项'],home:record?['核对本次报送的数据与材料缺项','生成本次报送的审核问题清单']:['梳理当前待办及处理顺序'],subfunds:['分析当前子基金投资进度','生成管理人核查问题'],deals:['生成项目尽调问题','分析投后跟踪重点'],pipeline:['比较项目筛选维度','生成投决材料清单'],portfolio:['分析投资集中度','梳理退出与估值核查事项'],lookthrough:['解释直接和间接投资关系','分析交叉投资风险'],capital:['核查出资计划与资金缺口'],managers:['生成管理人访谈提纲'],collab:['整理跨区域资源需求'],risk:['生成风险影响核查清单'],operations:['分析经营与融资变化'],research:['生成尽调访谈提纲']};
  const presets=questions[tab];if(!presets)return '';
  const labels={fundraising:'AI核对募资与出资',exits:'AI分析退出与回款',dashboard:'AI问数',subfunds:'AI分析当前清单',deals:'AI分析当前清单',lookthrough:'AI分析投资网络',home:record?'AI核对报送':'AI梳理待办',capital:'AI分析资金计划',managers:'AI分析管理人',operations:'AI分析经营变化',pipeline:'AI辅助项目筛选',portfolio:'AI分析投资组合',collab:'AI整理协同需求',risk:'AI分析风险影响',research:'AI生成尽调提纲'};
  return `<button class="fs-ai-entry" data-fs-action="ai-open" data-context="${fsE(context)}" data-fs-question="${fsE(context+'：'+presets[0])}">✦ ${labels[tab]||'AI辅助分析'}</button>`;
}
function fsDrawAi(question='',answer=''){
  document.getElementById('fsAiOverlay')?.remove();
  const history=fsAiRead().filter(x=>x.account===fsAccount().id),recent=history.slice(0,8);
  const presets=fsState.tab==='subfunds'?['哪些基金需要优先核查？','生成管理人访谈提纲']:fsState.tab==='deals'?['生成项目尽调问题清单','梳理投后重点关注事项']:fsState.tab==='home'?['检查报送缺失字段和依据材料','整理审核问题清单']:['解释本期关键变化','分析风险与下一步核查事项'];
  document.getElementById('fsRoot').insertAdjacentHTML('beforeend',`<div id="fsAiOverlay" class="fs-ai-overlay"><button class="fs-ai-scrim" data-fs-action="ai-close" aria-label="关闭分析"></button><aside class="fs-ai-drawer" role="dialog" aria-modal="true" aria-label="AI辅助分析"><header><div><small>✦ AI辅助分析</small><h2>${fsE(fsAccount().organization)}</h2></div><button data-fs-action="ai-close" aria-label="关闭">×</button></header><div class="fs-ai-drawer-content"><p class="fs-ai-scope">基于当前页面范围 · 本地规则演示</p><div class="fs-question-chips">${presets.map(q=>`<button data-fs-action="ai-ask" data-fs-question="${fsE(fsAccount().organization+'：'+q)}">${fsE(q)}</button>`).join('')}</div>${answer?`<article class="fs-ai-result"><h3>${fsE(question)}</h3><p>${fsE(answer)}</p><div class="fs-ai-result-tools"><button data-fs-action="ai-copy">复制</button><button data-fs-action="ai-export">导出</button></div></article>`:'<div class="fs-ai-start"><b>从当前业务问题开始</b><p>选择建议问题，或在下方输入你想了解的内容。</p></div>'}<details class="fs-ai-records"><summary>历史分析 · ${history.length} 条</summary>${recent.map(x=>`<button data-fs-action="ai-restore" data-id="${fsE(x.id)}"><span>${fsE(x.question)}</span><small>${fsE(x.createdAt)}</small></button>`).join('')||'<p>暂无记录</p>'}</details></div><form id="fsDrawerAsk" class="fs-ai-drawer-composer"><label for="fsDrawerQuestion">${answer?'继续追问':'向AI提问'}</label><div><input id="fsDrawerQuestion" name="question" placeholder="输入问题…" autocomplete="off"><button type="submit">发送 ↑</button></div></form></aside></div>`);
  document.getElementById('fsDrawerQuestion')?.focus();
}
function fsRender(){
  document.getElementById('fsRoot').innerHTML=fsState.account?fsApp():fsLogin();if(!fsState.account)return;
  const main=document.getElementById('fsContent');
  if(typeof dxDataNotice==='function'&&['dashboard','subfunds','deals','capital','portfolio','lookthrough','operations'].includes(fsState.tab))main.insertAdjacentHTML('afterbegin',dxDataNotice(fsAccount().version==='national'?'全部':fsRegion.id));
  if(fsState.tab==='ai'&&fsAccount().version!=='project')main.insertAdjacentHTML('afterbegin',fsResearchBrief());else{const entry=fsBusinessAi(),heading=main.querySelector?.('.fs-page-head,.fs-detail-head');if(entry&&heading)heading.insertAdjacentHTML('beforeend',entry);else if(entry)main.insertAdjacentHTML('afterbegin',`<div class="fs-ai-page-tools">${entry}</div>`)}
  if(fsState.notice)main.insertAdjacentHTML('afterbegin',`<div id="fsNotice" class="fs-notice" role="status">${fsE(fsState.notice)}</div>`);
}
document.addEventListener('submit',event=>{if(event.target.id!=='fsDrawerAsk')return;event.preventDefault();const question=new FormData(event.target).get('question')?.toString().trim();if(!question)return;fsState.aiQuestion=question;fsState.aiAnswer=fsAiAnswer(question);fsDrawAi(question,fsState.aiAnswer)});
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.getElementById('fsAiOverlay')?.remove()});
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-fs-action]');if(!button)return;
  const action=button.dataset.fsAction;
  if(action==='login'){fsState.account=button.dataset.account;fsState.tab=fsAccount().version==='project'?'ai':'dashboard';fsState.selected=null;fsState.aiQuestion='';fsState.aiAnswer='';fsState.notice='';return fsRender()}
  if(action==='logout'){fsState.account=null;fsState.selected=null;fsState.suggested='';fsState.notice='';return fsRender()}
  if(action==='suggest'){fsState.suggested=button.dataset.account;fsState.account=null;fsState.selected=null;fsState.notice='';return fsRender()}
  if(action==='tab'){fsState.tab=button.dataset.tab;fsState.selected=null;fsState.notice='';return fsRender()}
  if(action==='publish')return fsPublish(button.dataset.type);
  if(action==='open'){fsState.selected=button.dataset.id;fsState.tab='home';fsState.notice='';return fsRender()}
  if(action==='save'||action==='submit')return fsSave(action==='submit');
  if(action==='approve'||action==='return')return fsDecision(action==='approve');
  if(action==='ai-close'){document.getElementById('fsAiOverlay')?.remove();return}
  if(action==='ai-open'){fsState.aiQuestion='';fsState.aiAnswer='';fsDrawAi();return}
  if(action==='ai-restore'){const row=fsAiRead().find(x=>x.id===button.dataset.id&&x.account===fsAccount().id);if(row){fsState.aiQuestion=row.question;fsState.aiAnswer=row.answer;fsDrawAi(row.question,row.answer)}return}
  if(action==='ai-ask'){fsState.aiQuestion=button.dataset.fsQuestion||'';fsState.aiAnswer=fsAiAnswer(fsState.aiQuestion);fsState.notice='';return fsDrawAi(fsState.aiQuestion,fsState.aiAnswer)}
  if(action==='research-start'){const form=document.getElementById('fsResearchBrief');if(!form.reportValidity())return;const data=new FormData(form);fsState.aiQuestion=`${data.get('kind')}：${data.get('subject')}。研究要求与资料：${data.get('brief')||'待补充'}`;fsState.aiAnswer=fsAiAnswer(fsState.aiQuestion);return fsRender()}
  if(action==='ai-submit'){const form=document.getElementById('fsAiForm'),question=new FormData(form).get('question')?.toString().trim();if(!question)return fsFlash('请输入问题后再提问。');fsState.aiQuestion=question;fsState.aiAnswer=fsAiAnswer(question);return fsRender()}
  if(action==='ai-copy'){const text=`${fsState.aiQuestion}\n${fsState.aiAnswer}`;if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>fsFlash('AI分析结果已复制。'));else fsFlash('当前浏览器不支持自动复制，请手动复制。');return}
  if(action==='ai-export'){const blob=new Blob([`AI分析问题：${fsState.aiQuestion}\n\n分析结果：${fsState.aiAnswer}\n\n生成时间：${wbNow()}`],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`AI分析-${fsAccount().version}.txt`;link.click();URL.revokeObjectURL(url);return}
  if(action==='reset')return fsReset();
});
window.addEventListener('storage',event=>{if(event.key!==wbStoreKey)return;const latest=wbRead(wbStoreKey,[]);wbRecords.splice(0,wbRecords.length,...latest);wbSyncPaths();fsRender()});
fsRender();
