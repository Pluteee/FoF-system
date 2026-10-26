'use strict';
// Local, role-switching workflow prototype. This is not authentication or a shared database.
labels.reporting='协同填报';
labels.aiworkbench='AI 尽调工作台';

const wbStoreKey='diki-public-demo-reporting-v1';
const wbAiKey='diki-public-demo-dd-cases-v1';
const wbE=value=>escapeHTML(String(value??''));
const wbRead=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key)||'null');return value&&Array.isArray(value)?value:fallback}catch{return fallback}};
const wbRecords=wbRead(wbStoreKey,[]);
const wbCases=wbRead(wbAiKey,[]);
const wbState={role:'national',region:'shenzhen',fundId:dxFunds[0].id,period:'2026-Q3',tab:'tasks',editId:null,inviteTarget:'',aiType:'fund',aiObject:dxFunds[0].id,aiCaseId:null};
const wbNow=()=>new Date().toLocaleString('zh-CN',{hour12:false});
const wbId=prefix=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const wbPersist=()=>{try{localStorage.setItem(wbStoreKey,JSON.stringify(wbRecords));return true}catch{return false}};
const wbPersistAi=()=>{try{localStorage.setItem(wbAiKey,JSON.stringify(wbCases));return true}catch{return false}};
const wbToast=message=>showToast(message);
const wbRegion=id=>dxRegions.find(r=>r.id===id);
const wbFund=id=>dxFunds.find(f=>f.id===id);
const wbSource=record=>record.type==='region'?wbRegion(record.target)?.city:record.type==='fund'?wbFund(record.target)?.name:dxDeal(record.target)?.name;
const wbActor=()=>wbState.role==='national'?'国家基金审核员（演示）':wbState.role==='region'?`${wbRegion(wbState.region).city}区域母基金（演示）`:`${wbFund(wbState.fundId)?.manager||'子基金管理人'}（演示）`;
const wbStatus={assigned:'待填写',draft:'草稿',internal_review:'待本机构审核',returned_internal:'内部退回',submitted:'待上级审核',returned:'已退回',returned_external:'上级退回',confirmed:'已确认'};
const wbStatusTone={assigned:'blue',draft:'blue',internal_review:'amber',submitted:'amber',returned:'amber',returned_internal:'amber',returned_external:'amber',confirmed:'teal'};
const wbStatusPill=status=>dxPill(wbStatus[status]||status,wbStatusTone[status]||'neutral');
const wbLatest=(type,target,period,status='confirmed')=>wbRecords.filter(r=>r.type===type&&r.target===target&&r.period===period&&r.status===status).sort((a,b)=>b.version-a.version||b.updatedAt.localeCompare(a.updatedAt))[0]||null;
const wbCurrent=(type,target)=>wbRecords.filter(r=>r.type===type&&r.target===target&&r.status==='confirmed').sort((a,b)=>b.period.localeCompare(a.period)||b.version-a.version)[0]||null;
const wbFundData=id=>{const record=wbCurrent('fund',id);return record?{...record.values,period:record.period}:null};
const wbRegionData=id=>{const record=wbCurrent('region',id);return record?{annualPlan:Number(record.values.annualPlan),annualInvestPlan:Number(record.values.annualInvestPlan),reportDate:record.values.asOf}:null};
const wbProjectData=id=>{const record=wbCurrent('project',id);return record?{...record.values,period:record.period}:null};
window.wbFundData=wbFundData;
window.wbRegionData=wbRegionData;
window.wbProjectData=wbProjectData;

function wbSyncPaths(){
  for(let i=dxPaths.length-1;i>=0;i--)if(dxPaths[i].confirmedReportId)dxPaths.splice(i,1);
  for(const fund of dxFunds){const record=wbCurrent('fund',fund.id);if(!record)continue;const v=record.values;
    if(!v.newEnterprise||!Number(v.newInvestment)||!Number(v.regionFundShare))continue;
    if(dxPaths.some(p=>p.kind==='indirect'&&p.fundId===fund.id&&p.enterprise===v.newEnterprise))continue;
    dxPaths.push({enterprise:v.newEnterprise,sector:v.newSector||fund.sector,place:v.newPlace||fund.place,region:fund.region,kind:'indirect',fundId:fund.id,invest:Number(v.newInvestment),share:Number(v.regionFundShare)/100,date:v.asOf,confirmedReportId:record.id});
  }
  for(const fund of dxFunds){
    const records=wbRecords.filter(x=>x.type==='fund'&&x.target===fund.id&&x.status==='confirmed'&&x.details),latest=new Map();
    for(const r of records)if(!latest.has(r.period)||latest.get(r.period).version<r.version)latest.set(r.period,r);
    const annualYears=new Set([...latest.values()].filter(r=>r.period.endsWith('-Y')).map(r=>r.period.slice(0,4))),seen=new Set();
    for(const r of latest.values()){
      if(!r.period.endsWith('-Y')&&annualYears.has(r.period.slice(0,4)))continue;
      const details=r.confirmedSnapshot||r.details;
      for(const row of details.investments||[]){const key=[fund.id,row.enterprise.trim(),row.date,Number(row.amount),row.round].join('|');if(seen.has(key))continue;seen.add(key);dxPaths.push({enterprise:row.enterprise.trim(),sector:row.sector||'待补充',place:row.place||'待补充',region:fund.region,kind:'indirect',fundId:fund.id,invest:Number(row.amount),share:Number(details.fields.regionFundShare)/100,date:row.date,confirmedReportId:r.id,reportPeriod:r.period,reportVersion:r.version,evidenceRef:row.ref})}
    }
  }
}
wbSyncPaths();

window.wbDashboardPanel=()=>{
  const regions=dxRegions.map(r=>wbCurrent('region',r.id)).filter(Boolean),funds=dxFunds.map(f=>wbCurrent('fund',f.id)).filter(Boolean),projects=dxDeals.map(d=>wbCurrent('project',d.id)).filter(Boolean),paths=dxPaths.filter(p=>p.confirmedReportId);
  const confirmedPaid=funds.reduce((sum,record)=>sum+Number(record.values.paid||0),0);
  return `<section class="wb-confirmed-strip"><div><small>协同填报 · 已确认快照</small><h2>分层报送进入驾驶舱</h2><p>仅已确认版本参与重算；尚未报送的对象继续显示演示基线。</p></div><div class="wb-confirmed-numbers"><span><b>${regions.length}</b> 区域报送</span><span><b>${funds.length}</b> 子基金报送</span><span><b>${projects.length}</b> 项目报送</span><span><b>${dxMoney(confirmedPaid)}</b> 亿 · 已确认子基金实缴</span><span><b>${paths.length}</b> 新增穿透路径</span></div><button data-wb-action="open-reporting">进入填报 ↗</button></section>`;
};

const wbRegionFields=[
  {key:'asOf',label:'数据截至日期',type:'date',required:true,hint:'业务数据日期，不是提交日期'},
  {key:'annualPlan',label:'年度出资计划',type:'number',required:true,unit:'亿元',hint:'区域基金年度出资计划'},
  {key:'annualInvestPlan',label:'年度投资计划',type:'number',required:true,unit:'亿元',hint:'对子基金与直投的计划额'},
  {key:'newFunds',label:'本期新增子基金',type:'number',required:true,unit:'支',hint:'本期变动，不替代子基金档案'},
  {key:'newDeals',label:'本期新增直投',type:'number',required:true,unit:'笔',hint:'本期变动，不替代直投台账'},
  {key:'risk',label:'重大风险与待办',type:'textarea',required:true,hint:'无重大风险可填写“无”'},
  {key:'summary',label:'本期经营摘要',type:'textarea',required:true,hint:'重点变化与管理动作'},
  {key:'evidence',label:'依据材料名称 / 编号',type:'text',required:true,hint:'演示只记录名称，不上传文件'}
];
const wbFundFields=[
  {key:'asOf',label:'数据截至日期',type:'date',required:true,hint:'业务数据日期'},
  {key:'committed',label:'本基金已认缴',type:'number',required:true,unit:'亿元',hint:'已签约认缴口径'},
  {key:'paid',label:'本基金已实缴',type:'number',required:true,unit:'亿元',hint:'到账口径，不能大于认缴'},
  {key:'newEnterprise',label:'本期新增底层企业',type:'text',hint:'选填；填写企业全称以建立穿透关系'},
  {key:'newInvestment',label:'本基金对该企业投资额',type:'number',unit:'亿元',hint:'填了企业名称时必填'},
  {key:'regionFundShare',label:'区域基金在本子基金份额',type:'number',unit:'%',hint:'建立归属测算路径时必填，不能用申请额代替'},
  {key:'newSector',label:'新增企业产业',type:'text',hint:'填写企业名称时建议填写'},
  {key:'newPlace',label:'新增企业注册地',type:'text',hint:'填写企业名称时建议填写'},
  {key:'risk',label:'风险状态',type:'select',required:true,options:['正常','跟踪','重点关注']},
  {key:'summary',label:'本期运营与投资摘要',type:'textarea',required:true},
  {key:'evidence',label:'依据材料名称 / 编号',type:'text',required:true,hint:'演示只记录名称，不上传文件'}
];
const wbProjectFields=[
  {key:'asOf',label:'数据截至日期',type:'date',required:true},
  {key:'operatingStatus',label:'经营状态',type:'select',required:true,options:['正常','需关注','重大事项']},
  {key:'milestone',label:'本期重要进展',type:'textarea',required:true},
  {key:'fundingUpdate',label:'新融资进展',type:'text'},
  {key:'qualification',label:'新获资质 / 荣誉',type:'text'},
  {key:'risk',label:'风险与待办',type:'textarea',required:true},
  {key:'evidence',label:'依据材料名称 / 编号',type:'text',required:true}
];
const wbFields=type=>type==='region'?wbRegionFields:type==='project'?wbProjectFields:wbFundFields;
function wbDefaultValues(type,target){
  if(type==='region'){const p=dxRegionProfile(target);return {asOf:'2026-09-30',annualPlan:p.annualPlan,annualInvestPlan:p.annualInvestPlan,newFunds:0,newDeals:0,risk:'无',summary:'本期完成区域基金经营数据归集，相关事项待核验。',evidence:'2026年三季度区域经营报告（演示）'}}
  const f=wbFund(target),m=dxFundMeta(f);return {asOf:'2026-09-30',committed:m.committed,paid:m.paid,newEnterprise:'',newInvestment:'',regionFundShare:'',newSector:'',newPlace:'',risk:m.risk,summary:'本期基金运营和投资情况待补充核验。',evidence:'2026年三季度基金报告（演示）'};
}
function wbStart(type,target){
  if(!target)return;
  if(wbRecords.some(r=>r.type===type&&r.target===target&&r.period===wbState.period&&r.status==='submitted'))return wbToast('本期已有待审核报送，请等待审核后再修改');
  const open=wbRecords.filter(r=>r.type===type&&r.target===target&&r.period===wbState.period&&['draft','returned'].includes(r.status)).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))[0];
  if(open){wbState.editId=open.id;wbState.tab='form';return renderWbReporting()}
  const confirmed=wbLatest(type,target,wbState.period),v=confirmed?.values||wbDefaultValues(type,target),now=wbNow();
  const record={id:wbId('report'),type,target,region:type==='region'?target:wbFund(target).region,period:wbState.period,version:(confirmed?.version||0)+1,status:'draft',values:{...v},createdAt:now,updatedAt:now,history:[{at:now,actor:wbActor(),action:confirmed?'基于已确认版创建修订':'创建草稿',note:'',values:{...v}}]};
  wbRecords.push(record);wbPersist();wbState.editId=record.id;wbState.tab='form';renderWbReporting();
}
const wbReport=()=>wbRecords.find(r=>r.id===wbState.editId);
function wbReadForm(form){const values={};for(const field of wbFields(form.dataset.type))values[field.key]=form.elements.namedItem(field.key)?.value.trim()||'';return values}
function wbValidate(type,v){
  for(const field of wbFields(type))if(field.required&&!String(v[field.key]||'').trim())return `请填写：${field.label}`;
  for(const field of wbFields(type).filter(f=>f.type==='number'))if(v[field.key]!==''&&(!Number.isFinite(Number(v[field.key]))||Number(v[field.key])<0))return `${field.label}必须是非负数字`;
  if(type==='fund'){
    if(Number(v.paid)>Number(v.committed))return '已实缴不能大于已认缴';
    if(v.newEnterprise&&(!Number(v.newInvestment)||!Number(v.regionFundShare)))return '填写新增企业后，还需填写投资额和区域基金份额';
    if(Number(v.regionFundShare)>100)return '区域基金份额不能超过 100%';
  }
  return '';
}
function wbSaveForm(form,submit){
  const record=wbReport();if(!record||!['draft','returned'].includes(record.status))return;
  const values=wbReadForm(form),error=submit?wbValidate(record.type,values):'';
  if(error){wbToast(error);return}
  record.values=values;record.updatedAt=wbNow();record.status=submit?'submitted':'draft';
  record.history.push({at:record.updatedAt,actor:wbActor(),action:submit?'提交审核':'保存草稿',note:'',values:{...values}});
  const saved=wbPersist();wbState.tab=submit?'tasks':'form';renderWbReporting();wbToast(saved?(submit?'已提交，等待上级审核':'草稿已保存到本机'):'本次会话已更新，但浏览器未允许持久保存');
}
const wbCanReview=r=>r.status==='submitted'&&(wbState.role==='national'&&r.type==='region'||wbState.role==='region'&&['fund','project'].includes(r.type)&&r.region===wbState.region);
function wbReview(id,decision){
  const record=wbRecords.find(r=>r.id===id);if(!record||!wbCanReview(record))return;
  const note=document.getElementById(`wb-review-${id}`)?.value.trim()||'';
  if(decision==='returned'&&!note){wbToast('退回时请填写原因');return}
  record.status=decision;record.updatedAt=wbNow();record.history.push({at:record.updatedAt,actor:wbActor(),action:decision==='confirmed'?'审核确认':'退回修改',note,values:{...record.values}});
  wbPersist();if(decision==='confirmed')wbSyncPaths();renderWbReporting();wbToast(decision==='confirmed'?'已形成确认版本，相关视图将在打开时重算':'已退回填报机构');
}

function wbScopeRecords(){
  if(wbState.role==='national')return wbRecords.filter(r=>r.type==='region'&&['submitted','confirmed'].includes(r.status));
  if(wbState.role==='region')return wbRecords.filter(r=>r.region===wbState.region&&(r.type==='region'||['submitted','confirmed'].includes(r.status)));
  return wbRecords.filter(r=>r.type==='fund'&&r.target===wbState.fundId);
}
function wbInviteUrl(type,target){
  const url=new URL('index.html',window.location.href);
  url.search=new URLSearchParams({workspace:'partner',role:type,target,period:wbState.period}).toString();
  return url.href;
}
function wbInvitationPanel(){
  if(wbState.role==='fund')return '';
  const type=wbState.role==='national'?'region':'fund';
  const choices=type==='region'?dxRegions.map(r=>({id:r.id,name:r.name})):dxRegionFunds(wbState.region).map(f=>({id:f.id,name:f.name}));
  if(!choices.length)return '';
  if(!choices.some(x=>x.id===wbState.inviteTarget))wbState.inviteTarget=choices[0].id;
  const url=wbInviteUrl(type,wbState.inviteTarget);
  return `<section class="wb-panel wb-invitation"><div class="wb-panel-head"><div><h2>${type==='region'?'区域母基金工作台入口':'子基金工作台入口'}</h2><span>${type==='region'?'国家基金 → 区域母基金':'区域母基金 → 所投子基金'} · ${wbState.period}</span></div></div><div class="wb-invite-controls"><label>开通对象<select id="wb-invite-target">${choices.map(x=>`<option value="${wbE(x.id)}" ${wbState.inviteTarget===x.id?'selected':''}>${wbE(x.name)}</option>`).join('')}</select></label><label>演示工作台链接<input id="wb-invite-link" value="${wbE(url)}" readonly></label><button data-wb-action="copy-invite">复制链接</button><a href="${wbE(url)}" target="_blank" rel="noopener">打开工作台 ↗</a></div><p>区域工作台可填报自身业务、审核子基金及项目，并继续提供下级入口；子基金和项目有各自填报工作台。链接仅选定演示范围，正式跨机构接入须部署共享服务、账号与权限校验。</p></section>`;
}
function wbReportingTasks(){
  const canFill=wbState.role!=='national',type=wbState.role==='region'?'region':'fund',target=type==='region'?wbState.region:wbState.fundId,confirmed=canFill?wbLatest(type,target,wbState.period):null,open=canFill?wbRecords.find(r=>r.type===type&&r.target===target&&r.period===wbState.period&&['draft','returned'].includes(r.status)):null;
  const rows=wbScopeRecords().slice().sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
  return `${wbInvitationPanel()}<div class="wb-stats"><div><span>当前范围报送</span><b>${rows.length}</b></div><div><span>待我审核</span><b>${rows.filter(wbCanReview).length}</b></div><div><span>已确认版本</span><b>${rows.filter(r=>r.status==='confirmed').length}</b></div></div>
    ${canFill?`<section class="wb-callout"><div><small>${wbState.period} · ${type==='region'?'区域母基金填报':'子基金填报'}</small><h2>${type==='region'?wbRegion(target).name:wbE(wbFund(target).name)}</h2><p>${confirmed?`当前已确认第 ${confirmed.version} 版，可发起更正版本。`:'尚无本期确认版本，先提交填报表。'}</p></div><button data-wb-action="start" data-type="${type}" data-target="${target}">${open?'继续草稿 / 修改':'开始填报 / 发起修订'} ↗</button></section>`:''}
    <section class="wb-panel"><div class="wb-panel-head"><h2>报送与审核任务</h2><span>按本演示身份可见范围展示</span></div>${rows.length?`<div class="wb-table-wrap"><table><thead><tr><th>对象 / 报告期</th><th>版本</th><th>状态</th><th>更新</th><th>操作</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${wbE(wbSource(r))}</b><small>${r.period} · ${{region:'区域报告',fund:'子基金报告',project:'项目报告'}[r.type]||'业务报告'}</small></td><td>v${r.version}</td><td>${wbStatusPill(r.status)}</td><td>${wbE(r.updatedAt)}</td><td><button data-wb-action="history" data-id="${r.id}">查看版本 ↗</button>${wbCanReview(r)?`<button data-wb-action="review-tab">审核 ↗</button>`:''}</td></tr>`).join('')}</tbody></table></div>`:'<p class="wb-empty">当前还没有报送记录。切换身份并创建一份填报，即可演示从草稿到审核的全流程。</p>'}</section>`;
}
function wbFieldInput(field,value){
  const id=`wb-field-${field.key}`,required=field.required?'required':'';
  let control;
  if(field.type==='textarea')control=`<textarea id="${id}" name="${field.key}" rows="3" ${required}>${wbE(value)}</textarea>`;
  else if(field.type==='select')control=`<select id="${id}" name="${field.key}" ${required}>${field.options.map(option=>`<option value="${wbE(option)}" ${value===option?'selected':''}>${wbE(option)}</option>`).join('')}</select>`;
  else control=`<input id="${id}" name="${field.key}" type="${field.type}" value="${wbE(value)}" ${field.type==='number'?'min="0" step="0.0001"':''} ${required}>`;
  return `<label class="wb-field" for="${id}"><span>${field.label}${field.required?' <i>*</i>':''}${field.unit?` <em>(${field.unit})</em>`:''}</span>${control}${field.hint?`<small>${field.hint}</small>`:''}</label>`;
}
function wbReportingForm(){
  const r=wbReport();if(!r)return '<div class="wb-empty">从“报送任务”选择对象开始填报。</div>';
  const editable=['draft','returned'].includes(r.status),fields=wbFields(r.type);
  return `<section class="wb-panel"><div class="wb-panel-head"><div><h2>${{region:'区域母基金',fund:'子基金',project:'项目'}[r.type]||'业务'} · ${wbE(wbSource(r))}</h2><span>${r.period} · v${r.version} · ${wbStatus[r.status]}</span></div><button data-wb-action="tasks">返回任务</button></div>
    <div class="wb-form-note">${r.status==='returned'?'已退回：请根据版本记录中的审核意见修改。':r.status==='confirmed'?'此版本已确认，不能直接覆盖；请从任务页发起修订。':r.status==='submitted'?'此版本正在等待上级审核，审核前不可修改，也不会进入统计。':'先保存草稿，再提交上级审核；未经确认不会进入驾驶舱与画像。'}</div>
    <form id="wb-report-form" data-type="${r.type}"><fieldset ${editable?'':'disabled'}><div class="wb-form-grid">${fields.map(field=>wbFieldInput(field,r.values[field.key]??'')).join('')}</div></fieldset><div class="wb-form-actions">${editable?'<button type="button" data-wb-action="save">保存草稿</button><button type="button" class="primary" data-wb-action="submit">提交审核</button>':''}<button type="button" data-wb-action="history" data-id="${r.id}">查看修改记录</button></div></form></section>`;
}
function wbReviewQueue(){
  const rows=wbScopeRecords().filter(wbCanReview).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
  return `<section class="wb-panel"><div class="wb-panel-head"><h2>待我审核</h2><span>${wbState.role==='national'?'国家基金审核区域报告':wbState.role==='region'?'区域母基金审核所投子基金与项目':'子基金不审核上级报告'}</span></div>${rows.length?rows.map(r=>`<article class="wb-review-card"><div><small>${r.period} · v${r.version}</small><h3>${wbE(wbSource(r))}</h3><p>${r.type==='fund'?`认缴 ${wbE(r.values.committed)} 亿 · 实缴 ${wbE(r.values.paid)} 亿`:r.type==='project'?`经营状态 ${wbE(r.values.operatingStatus)} · 进展 ${wbE(r.values.milestone)}`:`年度投资计划 ${wbE(r.values.annualInvestPlan)} 亿`} · 材料：${wbE(r.values.evidence)}</p><p>${wbE(r.values.summary||r.values.risk||'')}</p></div><label>审核意见<textarea id="wb-review-${r.id}" rows="2" placeholder="确认可写核对意见；退回必须说明原因"></textarea></label><div><button data-wb-action="return" data-id="${r.id}">退回修改</button><button class="primary" data-wb-action="confirm" data-id="${r.id}">审核确认</button></div></article>`).join(''):'<p class="wb-empty">当前身份没有待审核报送。可在区域工作台体验子基金与项目提交后审核。</p>'}</section>`;
}
function wbHistory(){
  const rows=wbScopeRecords().slice().sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
  return `<section class="wb-panel"><div class="wb-panel-head"><h2>版本与操作记录</h2><span>已确认版本不可覆盖；更正会形成新版本</span></div>${rows.length?rows.map(r=>`<details class="wb-history"><summary><b>${wbE(wbSource(r))}</b><span>${r.period} · v${r.version} · ${wbStatus[r.status]} · ${wbE(r.updatedAt)}</span></summary><div>${r.history.map(h=>`<div><time>${wbE(h.at)}</time><b>${wbE(h.action)}</b><small>${wbE(h.actor)}${h.note?` · ${wbE(h.note)}`:''}</small></div>`).join('')}</div><p>本版本字段：${wbFields(r.type).filter(f=>r.values[f.key]!==undefined).map(f=>`${f.label} ${wbE(r.values[f.key])}`).join(' · ')}</p></details>`).join(''):'<p class="wb-empty">暂无版本记录。</p>'}</section>`;
}
function wbSchemaView(){
  const fieldRows=(type,fields)=>`<section class="wb-panel"><div class="wb-panel-head"><h2>${{region:'区域母基金季报',fund:'子基金季报',project:'项目季报'}[type]} · 字段设计</h2><span>* 必填</span></div><div class="wb-table-wrap"><table><thead><tr><th>字段</th><th>类型 / 单位</th><th>维护方</th><th>口径 / 用途</th></tr></thead><tbody>${fields.map(f=>`<tr><td>${wbE(f.label)}${f.required?' *':''}</td><td>${f.type==='number'?`数值 · ${f.unit}`:f.type==='date'?'日期':f.type==='textarea'?'长文本':'文本 / 枚举'}</td><td>${{region:'区域母基金',fund:'子基金管理人',project:'项目企业'}[type]}</td><td>${wbE(f.hint||'本期填报')}</td></tr>`).join('')}</tbody></table></div></section>`;
  return `<div class="wb-schema-intro">正式系统建议以“机构、区域基金、子基金、企业、投资关系”为主数据，以“报送期、提交、审核、确认快照、依据材料、审计事件”为过程数据。图表只读取确认快照，草稿和退回稿不参与统计。</div>${fieldRows('region',wbRegionFields)}${fieldRows('fund',wbFundFields)}${fieldRows('project',wbProjectFields)}
    <section class="wb-panel"><div class="wb-panel-head"><h2>核心数据表</h2><span>建议服务端实现 · 本页为本地流程原型</span></div><div class="wb-table-wrap"><table><thead><tr><th>表</th><th>关键字段</th><th>作用</th></tr></thead><tbody>${[
      ['organizations','id, type, parent_org_id, status','机构及层级授权'],['workspace_grants','organization_id, object_id, role, expires_at, revoked_at','分层工作台访问范围'],['review_routes','owner_org_id, reviewer_org_id, submission_type','国家 / 区域 / 下级审核路由'],['objects','id, type, canonical_name, region_id, manager_id','基金 / 项目统一主体'],['investment_relations','id, investor_id, investee_id, relation_type, effective_date','子基金 / 直投 / 底层项目关系'],['report_submissions','id, object_id, period, version, status, submitted_by, reviewed_by','报送任务与审核状态'],['report_values','submission_id, field_key, value, unit, as_of_date, source_ref','字段值及统计口径'],['evidence_files','id, submission_id, file_hash, uploaded_by, permission','真实文件与完整性校验'],['confirmed_snapshots','object_id, period, version, approved_at, values','已确认、可供分析的快照'],['audit_events','actor_id, action, before, after, timestamp, reason','修改与审核的不可覆盖轨迹']
    ].map(([name,keys,purpose])=>`<tr><td><code>${name}</code></td><td>${keys}</td><td>${purpose}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function renderWbReporting(){
  const roleOptions=[['national','国家基金总系统'],['region','区域视角（流程模拟）'],['fund','子基金视角（流程模拟）']];
  const scope=wbState.role==='region'?`<label>所属区域<select id="wb-region">${dxRegions.map(r=>`<option value="${r.id}" ${wbState.region===r.id?'selected':''}>${r.city} · ${r.short}</option>`).join('')}</select></label>`:wbState.role==='fund'?`<label>所管子基金<select id="wb-fund">${dxFunds.map(f=>`<option value="${f.id}" ${wbState.fundId===f.id?'selected':''}>${wbE(f.name)}</option>`).join('')}</select></label>`:'';
  const tabs=[['tasks','报送任务'],['form','填报表'],['review','审核队列'],['history','版本记录'],['schema','字段 / 表设计']];
  host('reporting').innerHTML=`<div class="wb-head"><div><small>REPORTING / CONFIRMED DATA</small><h1>协同填报与审核</h1><p>国家基金总系统 → 区域母基金工作台 → 子基金 / 项目工作台；逐级审核确认后重算视图。</p></div><span>本机流程演示</span></div>
    <div class="wb-mode-notice">请从本页进入区域独立工作台，再由区域提供子基金 / 项目工作台。下方身份切换仅为兼容流程模拟，不是真实登录或权限隔离；数据只保存在当前浏览器。</div>
    <div class="wb-context"><label>演示身份<select id="wb-role">${roleOptions.map(([id,label])=>`<option value="${id}" ${wbState.role===id?'selected':''}>${label}</option>`).join('')}</select></label>${scope}<label>报告期<select id="wb-period">${['2026-Q3','2026-Q4','2026-Y'].map(p=>`<option value="${p}" ${wbState.period===p?'selected':''}>${p}</option>`).join('')}</select></label></div>
    <div class="wb-tabs">${tabs.map(([id,label])=>`<button data-wb-action="tab" data-value="${id}" class="${wbState.tab===id?'active':''}">${label}</button>`).join('')}</div>
    ${wbState.tab==='form'?wbReportingForm():wbState.tab==='review'?wbReviewQueue():wbState.tab==='history'?wbHistory():wbState.tab==='schema'?wbSchemaView():wbReportingTasks()}`;
}
renderers.reporting=renderWbReporting;

const wbAiTypes=[
  {id:'fund',title:'基金尽调',sub:'策略、出资、运营与底层投资',icon:'◫'},
  {id:'manager',title:'管理人尽调',sub:'机构、团队、业绩与合作关系',icon:'♙'},
  {id:'project',title:'项目尽调',sub:'交易、产业、资料与投资路径',icon:'◇'},
  {id:'talent',title:'人才尽调',sub:'核心团队履历与关键人核验',icon:'◎'}
];
const wbAiType=id=>wbAiTypes.find(x=>x.id===id)||wbAiTypes[0];
const wbAiObjects=type=>type==='fund'?dxFunds.map(f=>({id:f.id,name:f.name})):type==='project'?dxDeals.map(d=>({id:d.id,name:d.name})):dxManagerDirectoryRows().map(x=>({id:x.name,name:x.name}));
const wbAiObjectName=(type,id)=>wbAiObjects(type).find(x=>x.id===id)?.name||id;
const wbFact=(text,source)=>({text,source});
function wbGenerateDiligence(type,id){
  const facts=[],gaps=[],questions=[],checks=[];
  const add=(fact,source)=>facts.push(wbFact(fact,source));
  if(type==='fund'){
    const f=wbFund(id);if(!f)return null;const m=dxFundMeta(f),confirmed=wbCurrent('fund',id),paths=dxFundPaths(f);
    add(`基金名称：${f.name}；管理人：${f.manager}`,f.origin==='source'?`演示样本 · 子基金工作表第 ${f.row} 行`:'演示基金档案');
    add(`目标规模 ${dxMoney(f.size)} 亿元；区域申请 / 拟出资 ${dxMoney(f.request)} 亿元`,f.origin==='source'?`演示样本 · 第 ${f.row} 行`:'演示基金档案');
    add(`认缴 ${dxMoney(m.committed)} 亿元；实缴 ${dxMoney(m.paid)} 亿元`,confirmed?`已确认报送 · ${confirmed.period} v${confirmed.version}`:'演示运营口径 · 未经报送确认');
    add(`底层投资关系 ${paths.length} 条`,paths.some(p=>p.confirmedReportId)?'已确认报送 + 演示穿透关系':'演示穿透关系');
    if(!confirmed)gaps.push('缺少本期经区域母基金审核的基金运营报送，认缴和实缴仅为演示值。');
    if(!paths.length)gaps.push('尚无可核验的底层项目投资清单。');
    if(f.origin==='source')gaps.push('演示样本只有立项 / 申请数据，未附合伙协议、缴款回单及审计报告。');
    if(m.paid>m.committed)checks.push('认缴与实缴金额不一致：实缴超过认缴，需核对虚构台账。');
    questions.push('投资策略与实际项目组合是否一致？','认缴、实缴与缴款回单能否逐笔勾稽？','管理费、关键人和退出条款是否与协议一致？');
    return {facts,gaps,checks,questions,materials:['合伙协议及补充协议','最新季报与审计报告','缴款通知及银行回单','底层项目投资清单']};
  }
  if(type==='manager'||type==='talent'){
    const row=dxManagerDirectoryRows().find(x=>x.name===id);if(!row)return null;const regions=row.regionIds,notes=dxManagerNotes[id]||{};
    add(`机构名称：${id}；阶段：${row.stage}；关联子基金 ${row.funds.length} 支；对接 / 覆盖区域 ${regions.map(r=>dxRegion(r).city).join('、')}`,row.kind==='prospect'?'本地机构线索 · 待核验':'子基金管理人字段 · 按名称归并');
    if(type==='manager'){
      if(row.funds.length)add(`所管基金目标规模合计 ${dxMoney(dxSum(row.funds,'size'))} 亿元（非实际 AUM）`,'子基金目标规模字段 · 演示样本 / 演示组合');
      else gaps.push('尚未关联立项子基金，管理规模、合作记录与履职表现不可据此推断。');
      if(!notes.team)gaps.push('核心团队履历尚未补录和核验。');
      if(!notes.performance)gaps.push('缺少按基金、时间区间和现金流口径核验的历史业绩。');
      if(!notes.duty)gaps.push('履职评价尚未由区域母基金确认。');
      questions.push('过往业绩分别归属于哪些基金与团队成员？','关键人离职或职责变化会如何影响基金？','是否存在关联交易或跨基金利益冲突？');
      return {facts,gaps,checks,questions,materials:['机构登记与组织架构','基金历史业绩及退出流水','团队履历和任职证明','履职评价及合作记录']};
    }
    gaps.push('当前档案没有经核验的个人级履历、任职证明及项目贡献材料。');
    if(notes.team)add('管理人档案已录入团队备注，但尚未作为个人级核验事实。','管理人本地补录 · 待核验');
    checks.push('不得根据缺失资料推断个人能力，也不生成自动淘汰或个人风险分。');
    questions.push('拟核验的岗位职责和关键人范围是什么？','任职时间、项目贡献能否由本人及机构材料交叉证明？','是否已明确告知处理目的并取得所需授权？');
    return {facts,gaps,checks,questions,materials:['必要范围内的履历与授权','任职及项目贡献证明','面谈纪要','合规审查记录']};
  }
  const d=dxDeal(id);if(!d)return null;const company=dxDealCompany(d.name),relation=dxEnterpriseRelations().filter(x=>x.enterprise===company),confirmed=relation.some(x=>x.confirmedReportId),projectReport=wbCurrent('project',id);
  add(`企业 / 项目：${company}；产业：${d.sector}；注册地：${d.place}`,d.origin==='source'?`演示样本 · 直投工作表第 ${d.row} 行`:'演示直投档案');
  add(`本轮融资 ${dxMoney(d.round)} 亿元；直投申请 / 拟出资 ${dxMoney(d.request)} 亿元`,d.origin==='source'?`演示样本 · 第 ${d.row} 行`:'演示交易数据');
  add(`关联投资关系 ${relation.length} 条`,confirmed?'已确认填报 + 演示投资关系':'直投台账 + 演示投资关系');
  if(projectReport)add(`项目经营状态：${projectReport.values.operatingStatus}；本期进展：${projectReport.values.milestone}`,`项目已确认报送 · ${projectReport.period} v${projectReport.version}`);
  else gaps.push('缺少经区域母基金审核确认的本期项目经营报送。');
  gaps.push('财务预测、客户合同、知识产权权属及法律事项需提供原始证据。');
  if(relation.length>1)checks.push('同一企业存在多条投资关系，需核对轮次、投资主体及是否重复统计。');
  questions.push('主营收入和核心客户如何用合同、发票及回款核对？','核心技术和知识产权归属是否清晰？','估值假设与本轮融资条款是否一致？');
  return {facts,gaps,checks,questions,materials:['财务报表及主要客户合同','股权结构与融资协议','知识产权证明','法务及技术尽调材料']};
}
function wbRunAi(){
  const type=wbState.aiType,id=wbState.aiObject,analysis=wbGenerateDiligence(type,id);if(!analysis)return wbToast('请选择尽调对象');
  const record={id:wbId('dd'),type,target:id,name:wbAiObjectName(type,id),createdAt:wbNow(),status:'待人工复核',analysis,reviewNote:'',reviewedAt:''};
  wbCases.unshift(record);wbPersistAi();wbState.aiCaseId=record.id;renderWbAi();wbToast('已生成规则式核验清单；尚未形成尽调结论');
}
function wbAiCaseView(){
  const record=wbCases.find(x=>x.id===wbState.aiCaseId);if(!record)return `<div class="wb-empty">选择尽调类型与对象，生成第一份证据化核验清单。</div>`;
  const a=record.analysis;
  return `<div class="wb-ai-report"><div class="wb-ai-report-head"><div><small>${wbAiType(record.type).title} · ${wbE(record.createdAt)}</small><h2>${wbE(record.name)}</h2><p>${record.status} · 规则式演示，不代表模型或投资决策结论</p></div><button data-wb-action="export-ai" data-id="${record.id}">导出清单 ↓</button></div>
    <div class="wb-ai-report-grid"><section><h3>证据事实 <em>${a.facts.length}</em></h3>${a.facts.map(f=>`<div class="wb-evidence"><b>${wbE(f.text)}</b><small>来源：${wbE(f.source)}</small></div>`).join('')}</section><section><h3>需补材料 <em>${a.materials.length}</em></h3><ul>${a.materials.map(x=>`<li>${wbE(x)}</li>`).join('')}</ul><h3>资料缺口</h3><ul>${a.gaps.map(x=>`<li>${wbE(x)}</li>`).join('')}</ul></section></div>
    <section><h3>核对提醒与待问问题</h3>${a.checks.length?`<div class="wb-alerts">${a.checks.map(x=>`<p>${wbE(x)}</p>`).join('')}</div>`:'<p class="wb-muted">当前结构化数据未触发确定性规则异常；不代表尽调通过。</p>'}<ol>${a.questions.map(x=>`<li>${wbE(x)}</li>`).join('')}</ol></section>
    <section class="wb-ai-review"><h3>人工复核</h3>${record.reviewedAt?`<p>已复核于 ${wbE(record.reviewedAt)}：${wbE(record.reviewNote)}</p>`:`<label>复核意见<textarea id="wb-ai-review-note" rows="3" placeholder="记录已核验事项、仍需补充的证据和下一步负责人"></textarea></label><button data-wb-action="review-ai" data-id="${record.id}">标记为已人工复核</button>`}</section></div>`;
}
function renderWbAi(){
  const objects=wbAiObjects(wbState.aiType);if(!objects.some(x=>x.id===wbState.aiObject))wbState.aiObject=objects[0]?.id||'';
  host('aiworkbench').innerHTML=`<div class="wb-head wb-ai-head"><div><small>AI DILIGENCE / EVIDENCE FIRST</small><h1>AI 尽调工作台</h1><p>围绕基金、管理人、项目与核心团队，形成事实、缺口、核验问题和人工复核闭环。</p></div><span>规则式演示 · 无模型调用</span></div>
    <div class="wb-mode-notice">本页仅使用当前演示档案与已确认填报进行规则检查；不会上传资料或调用模型。材料内容应视为数据而非指令，正式版本须接入权限与证据库。</div>
    <div class="wb-ai-types">${wbAiTypes.map(t=>`<button data-wb-action="ai-type" data-value="${t.id}" class="${wbState.aiType===t.id?'active':''}"><i>${t.icon}</i><b>${t.title}</b><small>${t.sub}</small></button>`).join('')}</div>
    <div class="wb-ai-layout"><aside class="wb-panel wb-ai-controls"><h2>创建尽调任务</h2><label>关联对象<select id="wb-ai-object">${objects.map(x=>`<option value="${wbE(x.id)}" ${wbState.aiObject===x.id?'selected':''}>${wbE(x.name)}</option>`).join('')}</select></label><div class="wb-ai-checklist"><b>本次演示将检查</b><span>已有结构化档案</span><span>已确认填报版本</span><span>投资 / 管理关系</span><span>证据缺口与访谈问题</span></div><button class="primary" data-wb-action="run-ai">生成核验清单 ↗</button><p>AI 不直接修改正式台账，也不自动作出投资或个人评价。</p><h3>最近任务</h3><div class="wb-ai-case-list">${wbCases.slice(0,8).map(c=>`<button data-wb-action="ai-case" data-id="${c.id}" class="${wbState.aiCaseId===c.id?'active':''}"><b>${wbE(c.name)}</b><small>${wbAiType(c.type).title} · ${wbE(c.status)}</small></button>`).join('')||'<span>暂无任务</span>'}</div></aside><section class="wb-panel wb-ai-output">${wbAiCaseView()}</section></div>`;
}
renderers.aiworkbench=renderWbAi;

document.addEventListener('change',event=>{
  const x=event.target;
  if(x.id==='wb-role'){wbState.role=x.value;wbState.editId=null;wbState.inviteTarget='';wbState.tab='tasks';renderWbReporting()}
  if(x.id==='wb-region'){wbState.region=x.value;wbState.editId=null;wbState.inviteTarget='';renderWbReporting()}
  if(x.id==='wb-fund'){wbState.fundId=x.value;wbState.editId=null;renderWbReporting()}
  if(x.id==='wb-period'){wbState.period=x.value;wbState.editId=null;renderWbReporting()}
  if(x.id==='wb-invite-target'){wbState.inviteTarget=x.value;renderWbReporting()}
  if(x.id==='wb-ai-object')wbState.aiObject=x.value;
});
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-wb-action]');if(!button)return;
  const action=button.dataset.wbAction,id=button.dataset.id,value=button.dataset.value;
  switch(action){
    case 'open-reporting':return go('reporting');
    case 'copy-invite':{
      const input=document.getElementById('wb-invite-link');if(!input)return;
      if(navigator.clipboard?.writeText)navigator.clipboard.writeText(input.value).then(()=>wbToast('填报链接已复制')).catch(()=>{input.select();wbToast('复制受浏览器限制，请手动复制已选中的链接')});
      else{input.select();wbToast('请手动复制已选中的链接')}
      return;
    }
    case 'tab':wbState.tab=value;return renderWbReporting();
    case 'tasks':wbState.tab='tasks';return renderWbReporting();
    case 'review-tab':wbState.tab='review';return renderWbReporting();
    case 'history':wbState.tab='history';return renderWbReporting();
    case 'start':{
      const type=button.dataset.type,target=button.dataset.target;
      if(type==='region'&&wbState.role==='region'&&target===wbState.region||type==='fund'&&wbState.role==='fund'&&target===wbState.fundId)return wbStart(type,target);
      return wbToast('当前演示身份不能填报该对象');
    }
    case 'save':return wbSaveForm(button.closest('form'),false);
    case 'submit':return wbSaveForm(button.closest('form'),true);
    case 'confirm':return wbReview(id,'confirmed');
    case 'return':return wbReview(id,'returned');
    case 'ai-type':wbState.aiType=value;wbState.aiObject=wbAiObjects(value)[0]?.id||'';return renderWbAi();
    case 'run-ai':return wbRunAi();
    case 'ai-case':wbState.aiCaseId=id;return renderWbAi();
    case 'review-ai':{
      const record=wbCases.find(c=>c.id===id),note=document.getElementById('wb-ai-review-note')?.value.trim();if(!record||!note)return wbToast('请先填写人工复核意见');
      record.status='已人工复核';record.reviewNote=note;record.reviewedAt=wbNow();wbPersistAi();renderWbAi();return wbToast('复核意见已记录');
    }
    case 'export-ai':{
      const c=wbCases.find(x=>x.id===id);if(!c)return;
      const a=c.analysis,lines=[`${wbAiType(c.type).title} · ${c.name}`,`生成：${c.createdAt}`,`状态：${c.status}`,'','证据事实',...a.facts.map(f=>`- ${f.text} [${f.source}]`),'','资料缺口',...a.gaps.map(x=>`- ${x}`),'','核对提醒',...a.checks.map(x=>`- ${x}`),'','待问问题',...a.questions.map(x=>`- ${x}`),'','待补材料',...a.materials.map(x=>`- ${x}`),'',`人工复核：${c.reviewNote||'待复核'}`,'','规则式演示，不代表模型或投资决策结论。'];
      return download(`${c.name}_尽调核验清单.txt`,lines.join('\n'),'text/plain;charset=utf-8');
    }
  }
});

// The external entry only selects a demo scope. Real authorization must be checked by a server.
if(window.location?.search){
  const entry=new URLSearchParams(window.location.search);
  const type=entry.get('type'),target=entry.get('target'),period=entry.get('period');
  const valid=(type==='region'&&dxRegions.some(r=>r.id===target))||(type==='fund'&&dxFunds.some(f=>f.id===target));
  if(entry.get('view')==='reporting'&&valid){
    wbState.role=type==='region'?'region':'fund';
    if(type==='region')wbState.region=target;else wbState.fundId=target;
    if(['2026-Q3','2026-Q4','2026-Y'].includes(period))wbState.period=period;
    go('reporting');
    if(entry.get('start')==='1')wbStart(type,target);
  }
}
window.addEventListener?.('storage',event=>{
  if(event.key!==wbStoreKey)return;
  const latest=wbRead(wbStoreKey,[]);
  wbRecords.splice(0,wbRecords.length,...latest);
  wbSyncPaths();
  if(state.view==='reporting')renderWbReporting();
  if(state.view==='dashboard')renderDxDashboard();
  if(state.view==='funds')renderDxFunds();
  if(state.view==='projects')renderDxDeals();
  if(state.view==='lookthrough')renderDxLookthrough();
});
if(state.view==='dashboard')renderDxDashboard();
