'use strict';
// Separate role-scoped demo portal. URL parameters are routing hints, never authentication.
const ppKey='diki-public-demo-reporting-v1';
const ppParams=new URLSearchParams(window.location.search);
const ppRegions=[
  {id:'shenzhen',city:'深圳',name:'演示·鹏湾区域母基金'},
  {id:'shanghai',city:'上海',name:'演示·申澜区域母基金'},
  {id:'beijing',city:'北京',name:'演示·燕序区域母基金'}
];
const ppFunds=[...sourceWorkbook.funds.map(f=>({...f,region:'shenzhen'})),...demoScenario.funds];
const ppProjects=[...sourceWorkbook.deals.map(d=>({...d,region:'shenzhen'})),...demoScenario.deals];
const ppRole=ppParams.get('role'),ppTarget=ppParams.get('target');
const ppObject=ppRole==='region'?ppRegions.find(r=>r.id===ppTarget):ppRole==='fund'?ppFunds.find(f=>f.id===ppTarget):ppRole==='project'?ppProjects.find(d=>d.id===ppTarget):null;
const ppState={period:['2026-Q3','2026-Q4','2026-Y'].includes(ppParams.get('period'))?ppParams.get('period'):'2026-Q3',tab:'overview',actor:'reporter',inviteKind:'fund',inviteTarget:'',message:'',aiQuestion:'',aiAnswer:''};
const ppRegion=ppRole==='region'?ppTarget:ppObject?.region;
const ppCollabKey='diki-public-demo-collaboration-v1';
const ppAiKey='diki-public-demo-workspace-ai-v1';
const ppCadence='月 / 季 / 年';
const ppDefinitions=[
  ['早中期','总部统一阶段定义：早期为产品或商业化验证前，中期为已有收入或规模化验证阶段。'],
  ['硬科技','按总部维护的产业目录与技术特征标记，区域仅可使用，不能自行改口径。'],
  ['社会资本带动','社会资本实际认缴额 ÷ 母基金及区域基金认缴额，按确认版数据计算。'],
  ['风险分级','正常、跟踪、重点关注、重大风险；重大风险触发跨区域影响分析与联合处置。']
];
const ppE=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ppNow=()=>new Date().toLocaleString('zh-CN',{hour12:false});
const ppId=()=>`report-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const ppRead=()=>{try{const rows=JSON.parse(localStorage.getItem(ppKey)||'[]');return Array.isArray(rows)?rows:[]}catch{return []}};
const ppWrite=rows=>{try{localStorage.setItem(ppKey,JSON.stringify(rows));return true}catch{return false}};
const ppReadCollab=()=>{try{const rows=JSON.parse(localStorage.getItem(ppCollabKey)||'[]');return Array.isArray(rows)?rows:[]}catch{return []}};
const ppWriteCollab=rows=>{try{localStorage.setItem(ppCollabKey,JSON.stringify(rows));return true}catch{return false}};
const ppCollabId=prefix=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const ppCollabActor=()=>`${ppObject?.name||'区域工作台'} · ${ppState.actor==='leader'?'负责领导':'填报人员'}`;
const ppName=r=>r.type==='region'?ppRegions.find(x=>x.id===r.target)?.name:r.type==='fund'?ppFunds.find(x=>x.id===r.target)?.name:ppProjects.find(x=>x.id===r.target)?.name;
const ppTypeName={region:'区域母基金',fund:'子基金',project:'项目'};
const ppStatus={draft:'草稿',internal_review:'待本机构负责人审核',submitted:'待上级审核',returned:'已退回',confirmed:'已确认'};
const ppFields={
  region:[
    {key:'asOf',label:'数据截至日期',type:'date',required:true},
    {key:'annualPlan',label:'年度出资计划',type:'number',unit:'亿元',required:true},
    {key:'annualInvestPlan',label:'年度投资计划',type:'number',unit:'亿元',required:true},
    {key:'newFunds',label:'本期新增子基金',type:'number',unit:'支',required:true},
    {key:'newDeals',label:'本期新增直投',type:'number',unit:'笔',required:true},
    {key:'risk',label:'重大风险与待办',type:'textarea',required:true},
    {key:'summary',label:'本期经营摘要',type:'textarea',required:true},
    {key:'evidence',label:'依据材料名称 / 编号',type:'text',required:true}
  ],
  fund:[
    {key:'asOf',label:'数据截至日期',type:'date',required:true},
    {key:'committed',label:'本基金已认缴',type:'number',unit:'亿元',required:true},
    {key:'paid',label:'本基金已实缴',type:'number',unit:'亿元',required:true},
    {key:'newEnterprise',label:'本期新增底层企业',type:'text'},
    {key:'newInvestment',label:'对该企业投资额',type:'number',unit:'亿元'},
    {key:'regionFundShare',label:'区域基金在本子基金份额',type:'number',unit:'%'},
    {key:'newSector',label:'新增企业产业',type:'text'},
    {key:'newPlace',label:'新增企业注册地',type:'text'},
    {key:'investmentProgress',label:'投资进度 / 新增投资',type:'textarea'},
    {key:'exitUpdate',label:'退出进展',type:'textarea'},
    {key:'valuationChange',label:'组合估值变化',type:'text'},
    {key:'majorEvent',label:'重大事项',type:'textarea'},
    {key:'risk',label:'风险状态',type:'select',options:['正常','跟踪','重点关注'],required:true},
    {key:'summary',label:'本期运营与投资摘要',type:'textarea',required:true},
    {key:'evidence',label:'依据材料名称 / 编号',type:'text',required:true}
  ],
  project:[
    {key:'asOf',label:'数据截至日期',type:'date',required:true},
    {key:'operatingStatus',label:'经营状态',type:'select',options:['正常','需关注','重大事项'],required:true},
    {key:'milestone',label:'本期重要进展',type:'textarea',required:true},
    {key:'fundingUpdate',label:'新融资进展',type:'text'},
    {key:'qualification',label:'新获资质 / 荣誉',type:'text'},
    {key:'operatingMetrics',label:'经营指标变化',type:'textarea'},
    {key:'valuation',label:'最新估值 / 估值变化',type:'text'},
    {key:'majorEvent',label:'重大事项',type:'textarea'},
    {key:'evidenceRef',label:'依据材料索引',type:'text'},
    {key:'risk',label:'风险与待办',type:'textarea',required:true},
    {key:'evidence',label:'依据材料名称 / 编号',type:'text',required:true}
  ]
};
const ppMine=rows=>rows.filter(r=>r.type===ppRole&&r.target===ppTarget&&r.period===ppState.period);
const ppLatest=(rows,type,target,status='confirmed')=>rows.filter(r=>r.type===type&&r.target===target&&r.period===ppState.period&&r.status===status).sort((a,b)=>b.version-a.version)[0]||null;
const ppCanReview=r=>ppRole==='region'&&r.region===ppTarget&&['fund','project'].includes(r.type)&&r.status==='submitted';
const ppChildRows=rows=>rows.filter(r=>r.region===ppTarget&&['fund','project'].includes(r.type)&&r.period===ppState.period);
const ppActor=()=>`${ppTypeName[ppRole]}${ppState.actor==='leader'?'负责领导':'填报人员'}（演示）`;
const ppUrl=(role,target)=>{const url=new URL('index.html',window.location.href);url.search=new URLSearchParams({workspace:'partner',role,target,period:ppState.period}).toString();return url.href};
const ppBadge=status=>`<span class="pp-badge ${ppE(status)}">${ppE(ppStatus[status]||status)}</span>`;
const ppMessage=msg=>{ppState.message=msg;ppRender()};

function ppField(field,value,editable){
  let input;
  if(field.type==='textarea')input=`<textarea name="${field.key}" rows="3" ${editable?'':'disabled'}>${ppE(value)}</textarea>`;
  else if(field.type==='select')input=`<select name="${field.key}" ${editable?'':'disabled'}>${field.options.map(option=>`<option value="${ppE(option)}" ${value===option?'selected':''}>${ppE(option)}</option>`).join('')}</select>`;
  else input=`<input name="${field.key}" type="${field.type}" value="${ppE(value)}" ${field.type==='number'?'min="0" step="0.0001"':''} ${editable?'':'disabled'}>`;
  return `<label class="${field.type==='textarea'?'wide':''}">${field.label}${field.required?' <em>*</em>':''}${field.unit?` <small>(${field.unit})</small>`:''}${input}</label>`;
}
function ppStart(){
  if(ppState.actor!=='reporter')return ppMessage('请切换到填报人员创建草稿。');
  const rows=ppRead(),mine=ppMine(rows);
  if(mine.some(r=>['internal_review','submitted'].includes(r.status)))return ppMessage('本期报送正在等待审核，不能再创建草稿。');
  if(mine.some(r=>['draft','returned'].includes(r.status)))return ppMessage('已打开本期草稿或退回稿。');
  const prior=ppLatest(rows,ppRole,ppTarget),now=ppNow();
  const values=prior?{...prior.values}:{asOf:'2026-09-30',risk:ppRole==='fund'?'正常':'',operatingStatus:'正常'};
  rows.push({id:ppId(),type:ppRole,target:ppTarget,region:ppRegion,period:ppState.period,version:(prior?.version||0)+1,status:'draft',values,createdAt:now,updatedAt:now,history:[{at:now,actor:ppActor(),action:prior?'基于已确认版创建修订':'创建草稿',note:'',values:{...values}}]});
  ppWrite(rows);ppMessage('草稿已创建，请填写本期记录。');
}
function ppValidate(type,values){
  for(const field of ppFields[type])if(field.required&&!String(values[field.key]||'').trim())return `请填写：${field.label}`;
  for(const field of ppFields[type].filter(f=>f.type==='number'))if(values[field.key]!==''&&(!Number.isFinite(Number(values[field.key]))||Number(values[field.key])<0))return `${field.label}必须是非负数字`;
  if(type==='fund'){
    if(Number(values.paid)>Number(values.committed))return '已实缴不能超过已认缴';
    if(values.newEnterprise&&(!Number(values.newInvestment)||!Number(values.regionFundShare)))return '新增底层企业须填写投资额和区域基金份额';
    if(Number(values.regionFundShare)>100)return '区域基金份额不能超过 100%';
  }
  return '';
}
function ppSave(form,submit){
  if(ppState.actor!=='reporter')return ppMessage('当前身份不能修改填报内容。');
  const rows=ppRead(),record=ppMine(rows).find(r=>['draft','returned'].includes(r.status));if(!record)return ppMessage('没有可编辑的草稿。');
  const values=Object.fromEntries(ppFields[ppRole].map(field=>[field.key,form.elements.namedItem(field.key)?.value.trim()||'']));
  const error=submit?ppValidate(ppRole,values):'';if(error)return ppMessage(error);
  record.values=values;record.status=submit?'internal_review':'draft';record.updatedAt=ppNow();
  record.history.push({at:record.updatedAt,actor:ppActor(),action:submit?'提交本机构负责人审核':'保存草稿',note:'',values:{...values}});
  const saved=ppWrite(rows);ppMessage(saved?submit?'已提交本机构负责人审核；批准后才会送上级。':'草稿已保存。':'浏览器未允许持久保存，请勿视为提交成功。');
}
function ppInternalReview(decision){
  if(ppState.actor!=='leader')return ppMessage('请切换到本机构负责领导审核。');
  const rows=ppRead(),record=ppMine(rows).find(r=>r.status==='internal_review');if(!record)return ppMessage('当前没有本机构待审核报送。');
  const note=document.getElementById('pp-internal-note')?.value.trim()||'';
  if(decision==='returned'&&!note)return ppMessage('退回时请填写原因。');
  record.status=decision;record.updatedAt=ppNow();record.history.push({at:record.updatedAt,actor:ppActor(),action:decision==='returned'?'内部退回修改':'批准并向上级报送',note,values:{...record.values}});
  ppWrite(rows);ppMessage(decision==='returned'?'已退回填报人员修改。':'已批准报出；上级工作台现在会收到审核待办。');
}
function ppReview(id,decision){
  const rows=ppRead(),record=rows.find(r=>r.id===id);if(!record||!ppCanReview(record))return ppMessage('当前区域无权审核此记录。');
  const note=document.getElementById(`pp-note-${id}`)?.value.trim()||'';
  if(decision==='returned'&&!note)return ppMessage('退回时请填写原因。');
  record.status=decision;record.updatedAt=ppNow();record.history.push({at:record.updatedAt,actor:ppActor(),action:decision==='confirmed'?'审核确认':'退回修改',note,values:{...record.values}});
  ppWrite(rows);ppMessage(decision==='confirmed'?'已形成确认版本；总系统可读取该版本。':'已退回，填报方可继续修改。');
}
const ppAiRead=()=>{try{const rows=JSON.parse(localStorage.getItem(ppAiKey)||'[]');return Array.isArray(rows)?rows:[]}catch{return []}};
const ppAiWrite=rows=>{try{localStorage.setItem(ppAiKey,JSON.stringify(rows.slice(0,30)));return true}catch{return false}};
function ppAiAnswer(question){
  const region=ppRegions.find(x=>x.id===ppRegion),fund=ppRole==='fund'?ppFunds.find(x=>x.id===ppTarget):null,project=ppRole==='project'?ppProjects.find(x=>x.id===ppTarget):null;
  const target=fund||project||region, scope=ppRole==='region'?`${region?.name}当前纳管的${ppFunds.filter(x=>x.region===ppTarget).length}支子基金与${ppProjects.filter(x=>x.region===ppTarget).length}个直投项目`:target?.name;
  const lower=question.toLowerCase();let answer;
  if(/风险|问题|预警/.test(lower))answer=`基于${scope}的演示数据，建议优先核查：1）重大事项与融资变化是否有依据材料；2）风险状态是否已按总部口径分级；3）是否存在跨区域投资关系。当前结论仅供辅助研判，需业务人员复核。`;
  else if(/退出|收益|回报|估值/.test(lower))answer=`建议围绕认缴、实缴、投资进度、最新估值、退出回款和底层企业经营变化形成完整判断。当前工作台已将这些字段纳入统一报送模板，可继续追问具体对象。`;
  else if(/协同|资源|转介|落地/.test(lower))answer=`建议建立“需求企业—目标区域—需求类型—责任人—状态—结果材料”的闭环。本工作台已支持异地落地、客户、供应链、融资四类资源转介。`;
  else answer=`我已基于${scope}的当前演示数据生成分析框架：先看本期数据是否齐全，再看与上期确认版的变化，最后结合风险、产业布局和跨区域关联形成处置建议。你可以继续询问风险、退出、估值、产业布局或资源协同。`;
  const record={id:`AI-${Date.now()}`,question,answer,role:ppRole,target:ppTarget,createdAt:ppNow()};ppAiWrite([record,...ppAiRead().filter(x=>x.question!==question||x.target!==ppTarget)]);return answer;
}
function ppAiPanel(){
  const presets=ppRole==='region'?['本区域本期有哪些重点风险？','哪些企业适合发起跨区域资源协同？','本区域产业布局和国家目标是否匹配？']:ppRole==='fund'?['本基金投资进度和退出节奏如何？','底层项目中哪些需要重点尽调？','本基金是否存在估值或集中度风险？']:['项目经营和融资变化如何？','这个项目有哪些尽调风险？','项目下一步应该关注哪些指标？'];
  const history=ppAiRead().filter(x=>x.role===ppRole&&x.target===ppTarget).slice(0,5);
  return `<section class="pp-card pp-ai-workspace"><div class="pp-status-line"><div><small>AI WORKSPACE</small><h2>AI分析与问答</h2></div><span class="pp-badge confirmed">辅助决策 · 待复核</span></div><p>支持预设分析和自由提问，结果可以复制、导出，并保留在当前工作台历史记录中。</p><div class="pp-ai-presets">${presets.map(q=>`<button data-pp-action="ai-ask" data-question="${ppE(q)}">${ppE(q)}</button>`).join('')}</div><form id="pp-ai-form" class="pp-ai-form"><input name="question" value="${ppE(ppState.aiQuestion)}" placeholder="请输入你想了解的问题，例如：本基金有哪些重大风险？" required><button class="primary" data-pp-action="ai-submit">提问 AI</button></form><div id="pp-ai-answer" class="pp-ai-answer">${ppState.aiAnswer?`<b>${ppE(ppState.aiQuestion)}</b><p>${ppE(ppState.aiAnswer)}</p><div class="pp-ai-actions"><button data-pp-action="ai-copy">复制结果</button><button data-pp-action="ai-export">导出结果</button></div>`:'<span>选择上方问题或输入问题，生成分析结果。</span>'}</div><div class="pp-ai-history"><div class="pp-status-line"><h3>本工作台历史提问</h3><button data-pp-action="ai-history">刷新记录</button></div>${history.length?history.map(x=>`<button data-pp-action="ai-ask" data-question="${ppE(x.question)}"><b>${ppE(x.question)}</b><small>${ppE(x.createdAt)}</small></button>`).join(''):'<p class="pp-empty">暂无历史记录。</p>'}</div></section>`;
}
function ppRoleOverview(rows){
  if(ppRole==='region'){
    const funds=ppFunds.filter(x=>x.region===ppTarget),projects=ppProjects.filter(x=>x.region===ppTarget),paths=demoScenario.paths.filter(x=>x.region===ppTarget),capital=funds.reduce((s,x)=>s+Number(x.size||0),0);
    return `<div class="pp-grid pp-kpi-wide"><div class="pp-metric"><small>纳管子基金</small><b>${funds.length}</b><span>储备 / 运营 / 退出</span></div><div class="pp-metric"><small>区域直投项目</small><b>${projects.length}</b><span>项目全生命周期</span></div><div class="pp-metric"><small>穿透投资路径</small><b>${paths.length}</b><span>含跨区域关联</span></div><div class="pp-metric"><small>子基金目标规模</small><b>${capital.toFixed(1)} 亿</b><span>演示数据</span></div></div><section class="pp-card"><h2>区域运营总览</h2><div class="pp-table-wrap"><table class="pp-table"><thead><tr><th>对象</th><th>产业 / 地域</th><th>管理人 / 摘要</th><th>当前动作</th></tr></thead><tbody>${funds.slice(0,8).map(x=>`<tr><td><b>${ppE(x.name)}</b><small>子基金 · ${ppE(x.id)}</small></td><td>${ppE(x.sector)}<small>${ppE(x.place)}</small></td><td>${ppE(x.manager)}</td><td><span class="pp-badge">持续报送</span></td></tr>`).join('')}${projects.slice(0,8).map(x=>`<tr><td><b>${ppE(x.name)}</b><small>直投项目 · ${ppE(x.id)}</small></td><td>${ppE(x.sector)}<small>${ppE(x.place)}</small></td><td>${ppE(x.summary)}</td><td><span class="pp-badge">投后跟踪</span></td></tr>`).join('')}</tbody></table></div></section>`;
  }
  if(ppRole==='fund'){
    const perf=demoScenario.fundPerformance[ppTarget]||{tvpi:'—',dpi:'—',irr:'—',nav:'—'},paths=demoScenario.paths.filter(x=>x.fundId===ppTarget),exits=demoScenario.fundExits.filter(x=>x.fundId===ppTarget);
    return `<div class="pp-grid pp-kpi-wide"><div class="pp-metric"><small>基金规模</small><b>${Number(fund?.size||0).toFixed(1)} 亿</b><span>${ppE(fund?.sector)}</span></div><div class="pp-metric"><small>TVPI / DPI</small><b>${perf.tvpi} / ${perf.dpi}</b><span>演示回报指标</span></div><div class="pp-metric"><small>IRR</small><b>${perf.irr}%</b><span>基于确认数据</span></div><div class="pp-metric"><small>穿透项目</small><b>${paths.length}</b><span>退出记录 ${exits.length} 条</span></div></div><section class="pp-card"><h2>基金运营摘要</h2><div class="pp-detail-grid"><div><span>管理人</span><b>${ppE(fund?.manager)}</b></div><div><span>投资产业</span><b>${ppE(fund?.sector)}</b></div><div><span>注册地</span><b>${ppE(fund?.place)}</b></div><div><span>最新 NAV</span><b>${perf.nav} 亿</b></div></div></section>`;
  }
  const updates=demoScenario.updates.filter(x=>x.enterprise===project?.name||x.dealId===project?.id),paths=demoScenario.paths.filter(x=>x.enterprise===project?.name);
  return `<div class="pp-grid pp-kpi-wide"><div class="pp-metric"><small>当前轮次 / 申请额</small><b>${project?.round||'—'} / ${project?.request||'—'} 亿</b><span>项目融资信息</span></div><div class="pp-metric"><small>关联投资路径</small><b>${paths.length}</b><span>直投与间接投资</span></div><div class="pp-metric"><small>近期动态</small><b>${updates.length}</b><span>融资 / 资质 / 产品</span></div><div class="pp-metric"><small>当前状态</small><b>投后跟踪</b><span>按期报送</span></div></div><section class="pp-card"><h2>项目基本画像</h2><div class="pp-detail-grid"><div><span>所属区域</span><b>${ppE(ppRegions.find(x=>x.id===project?.region)?.name||'—')}</b></div><div><span>产业方向</span><b>${ppE(project?.sector)}</b></div><div><span>所在地</span><b>${ppE(project?.place)}</b></div><div><span>业务摘要</span><b>${ppE(project?.summary)}</b></div></div></section>`;
}
function ppPortfolio(){const rows=demoScenario.paths.filter(x=>x.region===ppTarget);return `<section class="pp-card"><h2>穿透投资与项目台账</h2><p>区域侧可查看本区域确认后的直接与间接投资关系；子基金和项目侧只展示自身有权范围。</p><div class="pp-table-wrap"><table class="pp-table"><thead><tr><th>底层企业</th><th>投资关系</th><th>产业 / 所在地</th><th>投资金额</th></tr></thead><tbody>${rows.map(x=>`<tr><td><b>${ppE(x.enterprise)}</b></td><td>${x.kind==='direct'?'直投':'间接'}<small>${ppE(x.fundId||x.dealId||'—')}</small></td><td>${ppE(x.sector)}<small>${ppE(x.place)}</small></td><td>${Number(x.invest||0).toFixed(2)} 亿</td></tr>`).join('')}</tbody></table></div></section>`}
function ppCapital(){const funds=ppFunds.filter(x=>x.region===ppTarget);return `<section class="pp-card"><h2>区域资金计划与出资进度</h2><div class="pp-table-wrap"><table class="pp-table"><thead><tr><th>子基金</th><th>目标规模</th><th>区域申请</th><th>计划动作</th></tr></thead><tbody>${funds.map(x=>`<tr><td>${ppE(x.name)}</td><td>${Number(x.size||0).toFixed(1)} 亿</td><td>${Number(x.request||0).toFixed(1)} 亿</td><td><span class="pp-badge">纳入资金计划</span></td></tr>`).join('')}</tbody></table></div></section>`}
function ppManagers(){const funds=ppFunds.filter(x=>x.region===ppTarget),groups=[...new Set(funds.map(x=>x.manager))];return `<section class="pp-card"><h2>管理人评价</h2><div class="pp-manager-grid">${groups.map(name=>{const list=funds.filter(x=>x.manager===name);return `<article><small>管理人</small><h3>${ppE(name)}</h3><b>${list.length} 支关联基金</b><p>建议评价：报送及时性、投资进度、风险处置、资源协同能力。</p><span class="pp-badge">待本期更新</span></article>`}).join('')}</div></section>`}
function ppOperations(){const project=ppProjects.find(x=>x.id===ppTarget),updates=demoScenario.updates.filter(x=>x.dealId===ppTarget||x.enterprise===project?.name);return `<section class="pp-card"><h2>项目经营与投后跟踪</h2><p>直投项目工作台聚焦经营指标、融资、估值、资质和重大事项，不开放区域管理权限。</p><div class="pp-timeline">${updates.length?updates.map(x=>`<article><time>${ppE(x.date)}</time><div><b>${ppE(x.type)} · ${ppE(x.title)}</b><p>${ppE(x.detail)}</p></div></article>`).join(''):'<p class="pp-empty">暂无近期动态，请在本期填报中补充。</p>'}</div></section>`}
function ppFundPipeline(){
  const fund=ppFunds.find(x=>x.id===ppTarget),pool=ppProjects.filter(x=>x.region===fund?.region).slice(0,8),paths=demoScenario.paths.filter(x=>x.fundId===ppTarget);
  return `<section class="pp-card"><div class="pp-status-line"><div><small>INVESTMENT PIPELINE</small><h2>项目储备与投资执行</h2></div><button class="pp-btn" data-pp-action="ai-ask" data-question="请帮我比较当前项目池的投资优先级">AI辅助排序</button></div><p>子基金可维护项目储备、推进尽调、记录投资决策和投后动作；区域母基金只查看确认后的结果。</p><div class="pp-table-wrap"><table class="pp-table"><thead><tr><th>项目</th><th>产业 / 地域</th><th>阶段</th><th>拟投资额</th><th>当前环节</th></tr></thead><tbody>${pool.map((x,i)=>`<tr><td><b>${ppE(x.name)}</b><small>${ppE(x.summary)}</small></td><td>${ppE(x.sector)}<small>${ppE(x.place)}</small></td><td>${i%3===0?'初筛':i%3===1?'尽调中':'投决准备'}</td><td>${Number(x.request||0).toFixed(2)} 亿</td><td><span class="pp-badge">${i%3===0?'待立项':i%3===1?'补充材料':'会议排期'}</span></td></tr>`).join('')}</tbody></table></div></section><section class="pp-card"><h2>已投项目管理</h2><div class="pp-detail-grid"><div><span>已建立穿透关系</span><b>${paths.length} 个</b></div><div><span>投后重点关注</span><b>${Math.max(1,Math.round(paths.length/3))} 个</b></div><div><span>本期需补材料</span><b>2 个</b></div><div><span>下一步</span><b>更新经营和估值</b></div></div></section>`;
}
function ppFundResearch(){
  const fund=ppFunds.find(x=>x.id===ppTarget),checklist=['管理人及团队：历史业绩、关键人稳定性、利益冲突','投资策略：阶段、产业、地域、单项目集中度','底层项目：商业模式、技术壁垒、客户与供应链','基金条款：认缴、实缴、费用、退出、重大事项','合规与风险：关联交易、诉讼、舆情、数据依据'];
  return `<section class="pp-card"><div class="pp-status-line"><div><small>RESEARCH ASSISTANT</small><h2>子基金投研与 AI 尽调</h2></div><span class="pp-badge confirmed">辅助研究</span></div><p>围绕基金策略、管理人、项目池和底层投资关系形成投研摘要，AI 结果只作为研究底稿，需人工核验。</p><div class="pp-research-grid"><article><b>建议先看</b><h3>${ppE(fund?.sector)}赛道与区域布局</h3><p>比较项目池产业集中度、投资阶段和跨区域资源协同机会。</p><button class="pp-btn" data-pp-action="ai-ask" data-question="请分析本基金的产业布局、投资阶段和区域协同机会">生成产业研究</button></article><article><b>投决前尽调清单</b><ul>${checklist.map(x=>`<li>${ppE(x)}</li>`).join('')}</ul><button class="pp-btn" data-pp-action="ai-ask" data-question="请根据本基金信息生成一份投决前尽调问题清单">生成尽调清单</button></article><article><b>投后监控</b><p>关注融资、估值、退出、重大事项、风险等级和依据材料是否持续更新。</p><button class="pp-btn" data-pp-action="ai-ask" data-question="请生成本基金投后管理月度监控建议">生成监控建议</button></article></div></section>`;
}
function ppProjectResearch(){
  const project=ppProjects.find(x=>x.id===ppTarget),items=['经营：收入、订单、毛利、现金流、客户集中度','技术：产品成熟度、核心指标、知识产权和替代风险','融资：融资轮次、估值变化、资金用途和下一轮计划','合规：重大诉讼、监管事项、关联交易和舆情','产业协同：落地场景、客户、供应链与异地资源需求'];
  return `<section class="pp-card"><div class="pp-status-line"><div><small>PROJECT DUE DILIGENCE</small><h2>直投项目 AI 尽调与经营研究</h2></div><span class="pp-badge confirmed">项目专属</span></div><p>${ppE(project?.name)}的研究空间：项目方负责提供事实与依据材料，投资方据此形成尽调和投后判断。</p><div class="pp-research-grid"><article><b>经营分析</b><h3>本期经营变化</h3><p>结合经营指标、融资、估值和重大事项识别趋势与异常。</p><button class="pp-btn" data-pp-action="ai-ask" data-question="请分析这个项目本期经营、融资和估值变化">生成经营分析</button></article><article><b>尽调维度</b><ul>${items.map(x=>`<li>${ppE(x)}</li>`).join('')}</ul><button class="pp-btn" data-pp-action="ai-ask" data-question="请为这个直投项目生成一份风险尽调清单">生成风险清单</button></article><article><b>管理动作</b><p>自动整理待补材料、下一次访谈问题和需要区域协同的资源事项。</p><button class="pp-btn" data-pp-action="ai-ask" data-question="请生成这个项目下一阶段的投后管理动作">生成管理动作</button></article></div></section>`;
}
function ppStandards(){
  return `<section class="pp-card pp-standards"><div class="pp-status-line"><div><small>HQ GOVERNANCE</small><h2>国家统一口径与报送规则</h2></div><span class="pp-badge confirmed">总部发布 · v1.0</span></div><p>区域、子基金和直投项目共享同一套指标定义、报送模板和确认规则；区域只能填报和运营，不能修改口径。</p><div class="pp-definition-grid">${ppDefinitions.map(([name,desc])=>`<article><b>${ppE(name)}</b><span>${ppE(desc)}</span></article>`).join('')}</div><div class="pp-rule-line"><span>报送节奏</span><b>${ppCadence}</b><span>本期</span><b>${ppE(ppState.period)}</b><span>统计原则</span><b>仅确认版进入国家视角</b></div></section>`;
}
function ppCollaboration(){
  const all=ppReadCollab(),outgoing=all.filter(x=>x.kind==='referral'&&x.fromRegion===ppTarget),incoming=all.filter(x=>x.kind==='referral'&&x.toRegion===ppTarget);
  const rows=[...outgoing.map(x=>({...x,direction:'发出'})),...incoming.map(x=>({...x,direction:'收到'}))].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  return `<section class="pp-card"><div class="pp-status-line"><div><small>REGIONAL RESOURCE NETWORK</small><h2>区域资源协同</h2></div><span class="pp-badge">${rows.length} 条协同记录</span></div><p>把企业异地落地、客户、供应链、融资等需求转介给其他区域，并保留接收、处置和关闭结果。</p><form id="pp-referral-form" class="pp-collab-form"><label>需求企业<input name="enterprise" placeholder="例如：上海某硬科技企业" required></label><label>转介区域<select name="toRegion">${ppRegions.filter(x=>x.id!==ppTarget).map(x=>`<option value="${x.id}">${ppE(x.name)}</option>`).join('')}</select></label><label>需求类型<select name="needType"><option>异地落地</option><option>客户 / 场景</option><option>供应链</option><option>融资</option></select></label><label class="wide">协同需求<textarea name="need" rows="2" placeholder="描述希望对接的产业资源、城市、客户或融资条件" required></textarea></label><div class="pp-actions wide"><button class="primary" data-pp-action="create-referral">创建资源转介</button></div></form></section><section class="pp-card"><h2>跨区域转介台账</h2>${rows.length?`<div class="pp-table-wrap"><table class="pp-table"><thead><tr><th>方向 / 企业</th><th>需求</th><th>对接区域</th><th>状态</th><th>操作</th></tr></thead><tbody>${rows.map(x=>`<tr><td><b>${x.direction} · ${ppE(x.enterprise)}</b><small>${ppE(x.createdAt)} · ${ppE(x.owner)}</small></td><td>${ppE(x.needType)}<small>${ppE(x.need)}</small></td><td>${ppE(ppRegions.find(r=>r.id===(x.direction==='发出'?x.toRegion:x.fromRegion))?.name||'—')}</td><td>${ppBadge(x.status)}</td><td><button data-pp-action="cycle-referral" data-id="${ppE(x.id)}">推进状态</button></td></tr>`).join('')}</tbody></table></div>`:'<p class="pp-empty">当前没有资源转介记录，可从上方创建第一条协同需求。</p>'}</section>`;
}
function ppRiskLinkage(){
  const all=ppReadCollab(),risks=all.filter(x=>x.kind==='risk'&&(x.regionIds||[]).includes(ppTarget));
  const seeded=[{id:'seed-risk-manager',kind:'risk',enterprise:'示例管理人 / 底层企业',severity:'重点关注',regionIds:['shenzhen','shanghai'],funds:'2 支子基金 + 1 个直投项目',amount:'约 3.8 亿元',status:'联合处置中',note:'融资延期与核心客户变化，需要核查跨区域投资关系。',owner:'国家母基金风险专班'}];
  const items=[...seeded,...risks];
  return `<section class="pp-card"><div class="pp-status-line"><div><small>RISK IMPACT GRAPH</small><h2>跨区域风险联动</h2></div><span class="pp-badge returned">风险影响图</span></div><p>系统按企业、管理人、基金、直投和底层项目关系展开影响范围；发现跨区域影响后生成联合处置任务。</p><div class="pp-risk-graph"><div class="pp-risk-node danger"><b>风险主体</b><span>企业 / 管理人</span></div><i>→</i><div class="pp-risk-node"><b>影响范围</b><span>区域 · 基金 · 投资金额</span></div><i>→</i><div class="pp-risk-node"><b>联合动作</b><span>核查 · 整改 · 跟踪</span></div></div><form id="pp-risk-form" class="pp-collab-form"><label>风险主体<input name="subject" placeholder="企业或管理人名称" required></label><label>风险等级<select name="severity"><option>跟踪</option><option>重点关注</option><option>重大风险</option></select></label><label>涉及金额<input name="amount" placeholder="例如：1.2 亿元"></label><label>涉及对象<input name="funds" placeholder="基金 / 直投 / 底层项目"></label><label class="wide">影响与处置建议<textarea name="note" rows="2" required placeholder="说明影响区域、风险事实和建议动作"></textarea></label><div class="pp-actions wide"><button class="primary" data-pp-action="create-risk">创建联合处置任务</button></div></form></section><section class="pp-card"><h2>风险影响与联合处置任务</h2><div class="pp-risk-list">${items.map(x=>`<article class="pp-risk-item"><div><span class="pp-risk-severity">${ppE(x.severity)}</span><h3>${ppE(x.enterprise||x.subject)}</h3><p>${ppE(x.note)}</p></div><dl><div><dt>影响区域</dt><dd>${(x.regionIds||[]).map(id=>ppRegions.find(r=>r.id===id)?.city).filter(Boolean).join('、')||'当前区域'}</dd></div><div><dt>涉及投资</dt><dd>${ppE(x.amount||'待核查')}</dd></div><div><dt>处置状态</dt><dd>${ppE(x.status)}</dd></div></dl></article>`).join('')}</div></section>`;
}
function ppReport(rows){
  const own=ppMine(rows).sort((a,b)=>b.version-a.version),active=own.find(r=>['draft','returned'].includes(r.status)),internal=own.find(r=>r.status==='internal_review'),pending=own.find(r=>r.status==='submitted'),latest=own.find(r=>r.status==='confirmed');
  const record=active||internal||pending||latest,editable=!!active&&ppState.actor==='reporter';
  return `<section class="pp-card"><div class="pp-status-line"><h2>${ppTypeName[ppRole]}本期填报</h2>${record?ppBadge(record.status):'<span class="pp-badge">尚未开始</span>'}</div><p>${ppE(ppObject.name)} · ${ppE(ppState.period)} · 填报人员 → 本机构负责人 → ${ppRole==='region'?'国家基金':'所属区域母基金'}</p>${record?`<p>第 ${record.version} 版 · ${record.status==='confirmed'?'确认版不可覆盖；更正请新建下一版。':record.status==='submitted'?'已由本机构批准报出，等待上级审核。':record.status==='internal_review'?'等待本机构负责人复核，尚未送达上级。':record.status==='returned'?'已退回，请根据版本记录修改。':'草稿未进入统计。'}</p><form id="ppReportForm"><div class="pp-fields">${ppFields[ppRole].map(field=>ppField(field,record.values[field.key]??'',editable)).join('')}</div>${editable?'<div class="pp-actions"><button type="button" data-pp-action="save">保存草稿</button><button type="button" class="primary" data-pp-action="submit">提交本机构负责人审核</button></div>':''}</form>${internal&&ppState.actor==='leader'?'<div class="pp-review"><h3>本机构内部审核</h3><p>核对后批准报出，上级才会收到待办。</p><textarea id="pp-internal-note" placeholder="审核意见；退回时必填"></textarea><div class="pp-actions"><button data-pp-action="internal-return">退回填报人员</button><button class="primary" data-pp-action="internal-approve">批准并报送上级 →</button></div></div>':''}`:'<p class="pp-empty">创建本期草稿后填写业务记录。演示只记录依据材料名称，不上传真实文件。</p>'}${!active&&!internal&&!pending&&ppState.actor==='reporter'?`<div class="pp-actions"><button data-pp-action="start" class="primary">${latest?'基于确认版发起更正':'创建本期填报'} ↗</button></div>`:''}</section>`;
}
function ppReviewQueue(rows){
  const pending=ppChildRows(rows).filter(ppCanReview);
  return `<section class="pp-card"><h2>子基金 / 项目待审核</h2><p>区域母基金审核自己负责的下级报送；确认后冻结版本，退回须说明原因。</p>${pending.length?pending.map(r=>`<article class="pp-review"><small>${r.type==='fund'?'子基金':'项目'} · ${ppE(r.period)} · v${r.version}</small><h3>${ppE(ppName(r))}</h3><p>${ppE(r.values.summary||r.values.milestone||'')} · 依据：${ppE(r.values.evidence||'未填')}</p><textarea id="pp-note-${r.id}" placeholder="核验意见；退回时必填"></textarea><div class="pp-actions"><button data-pp-action="return" data-id="${r.id}">退回修改</button><button class="primary" data-pp-action="confirm" data-id="${r.id}">审核确认</button></div></article>`).join(''):'<p class="pp-empty">当前没有待审核报送。可从“下级入口”打开子基金或项目工作台提交一份演示记录。</p>'}</section>`;
}
function ppInviteGroup(kind,title,objects){
  if(!objects.length)return `<section class="pp-card"><h2>${title}</h2><p>本区域暂无可演示对象。</p></section>`;
  if(ppState.inviteKind!==kind||!objects.some(x=>x.id===ppState.inviteTarget)){ppState.inviteKind=kind;ppState.inviteTarget=objects[0].id}
  const url=ppUrl(kind,ppState.inviteTarget);
  return `<section class="pp-card"><h2>${title}</h2><p>选择一支${kind==='fund'?'子基金':'直投项目'}，提供其独立工作台入口。链接不开放区域审核菜单。</p><div class="pp-link-row"><label>报送对象<select id="pp-invite-target">${objects.map(x=>`<option value="${ppE(x.id)}" ${x.id===ppState.inviteTarget?'selected':''}>${ppE(x.name)}</option>`).join('')}</select></label><label>工作台链接<input id="pp-invite-url" value="${ppE(url)}" readonly></label><button data-pp-action="copy">复制链接</button><a class="pp-btn" href="${ppE(url)}" target="_blank" rel="noopener">打开工作台 ↗</a></div></section>`;
}
function ppInvitations(){
  const tabs=`<div class="pp-actions"><button data-pp-action="invite-kind" data-kind="fund" class="${ppState.inviteKind==='fund'?'primary':''}">子基金填报入口</button><button data-pp-action="invite-kind" data-kind="project" class="${ppState.inviteKind==='project'?'primary':''}">项目填报入口</button></div>`;
  const kind=ppState.inviteKind,objects=(kind==='fund'?ppFunds:ppProjects).filter(x=>x.region===ppTarget);
  return `<section class="pp-card"><h2>向下级提供工作台</h2><p>区域母基金可分别向所投子基金和直投项目提供报送入口，并在本站审核其提交。</p>${tabs}</section>${ppInviteGroup(kind,kind==='fund'?'子基金工作台链接':'项目工作台链接',objects)}`;
}
function ppHistory(rows){
  const scoped=ppRole==='region'?rows.filter(r=>r.region===ppTarget&&r.period===ppState.period):ppMine(rows);
  return `<section class="pp-card pp-history"><h2>报送与版本记录</h2><p>已确认版本不能直接覆盖；更正创建新版本再审核。</p>${scoped.length?scoped.slice().sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).map(r=>`<details><summary>${ppE(ppName(r))} · ${ppE(r.period)} · v${r.version} · ${ppStatus[r.status]||r.status}</summary>${r.history.map(h=>`<p>${ppE(h.at)}　${ppE(h.action)}　${ppE(h.actor)}${h.note?` · ${ppE(h.note)}`:''}</p>`).join('')}<p>字段快照：${Object.entries(r.values).map(([key,value])=>`${ppE(key)} ${ppE(value)}`).join('；')}</p></details>`).join(''):'<p class="pp-empty">当前报告期暂无记录。</p>'}</section>`;
}
function ppOverview(rows){
  const child=ppChildRows(rows),confirmed=child.filter(r=>r.status==='confirmed'),pending=child.filter(r=>r.status==='submitted'),own=ppMine(rows);
  return `<div class="pp-grid"><div class="pp-metric"><small>本期区域报送</small><b>${own.length?ppStatus[own.sort((a,b)=>b.version-a.version)[0].status]:'待创建'}</b><span>提交国家基金审核</span></div><div class="pp-metric"><small>下级待我审核</small><b>${pending.length}</b><span>子基金与项目</span></div><div class="pp-metric"><small>下级已确认版本</small><b>${confirmed.length}</b><span>仅确认版进入统计</span></div></div><section class="pp-card"><h2>本区域报送网络</h2><div class="pp-table-wrap"><table class="pp-table"><thead><tr><th>对象层级</th><th>对象数量</th><th>待审核报送</th><th>已确认版本</th></tr></thead><tbody>${[['fund','子基金',ppFunds],['project','直投项目',ppProjects]].map(([type,label,objects])=>{const group=child.filter(r=>r.type===type);return `<tr><td>${label}</td><td>${objects.filter(x=>x.region===ppTarget).length}</td><td>${group.filter(r=>r.status==='submitted').length}</td><td>${group.filter(r=>r.status==='confirmed').length}</td></tr>`}).join('')}</tbody></table></div></section><section class="pp-card"><h2>工作流</h2><p>区域母基金填本区域报告 → 国家基金审核；区域母基金向子基金与直投项目提供独立工作台 → 下级提交 → 区域母基金审核 → 确认版本进入总系统档案、画像与穿透视图。</p></section>`;
}
function ppRender(){
  const nav=document.getElementById('ppNav'),host=document.getElementById('ppContent'),crumb=document.getElementById('ppCrumb');
  document.getElementById('ppTopAction').innerHTML=ppRole==='region'?'<a href="index.html">返回国家基金总系统（演示） ↗</a>':'<small>本机构工作台</small>';
  if(!ppObject){nav.innerHTML='';crumb.textContent='无效入口';host.innerHTML='<section class="pp-card"><h2>工作台链接无效</h2><p>请从国家基金或区域母基金工作台生成对应机构的入口。</p><a class="pp-btn" href="index.html">返回总系统</a></section>';return}
  const tabs=ppRole==='region'?[['overview','区域总览'],['portfolio','投资穿透'],['capital','资金计划'],['managers','管理人评价'],['report','本区域填报'],['review','下级审核'],['invite','下级入口'],['collab','资源协同'],['standards','统一口径'],['ai','AI分析'],['history','版本记录']]:ppRole==='fund'?[['overview','基金总览'],['pipeline','项目池与投决'],['portfolio','投资组合'],['research','投研与尽调'],['ai','AI分析'],['report','本期填报'],['history','版本记录']]:[['overview','项目总览'],['operations','经营跟踪'],['research','项目尽调'],['ai','AI分析'],['report','本期填报'],['history','版本记录']];
  if(!tabs.some(([id])=>id===ppState.tab))ppState.tab=tabs[0][0];
  nav.innerHTML=tabs.map(([id,title])=>`<button data-pp-action="tab" data-tab="${id}" class="${ppState.tab===id?'active':''}">${title}</button>`).join('');
  crumb.textContent=`${ppTypeName[ppRole]}工作台 / ${ppObject.name}`;
  const rows=ppRead();
  const body=ppState.tab==='overview'?ppRoleOverview(rows):ppState.tab==='portfolio'?(ppRole==='region'?ppPortfolio():ppFundPipeline()):ppState.tab==='pipeline'?ppFundPipeline():ppState.tab==='capital'?ppCapital():ppState.tab==='managers'?ppManagers():ppState.tab==='operations'?ppOperations():ppState.tab==='research'?(ppRole==='fund'?ppFundResearch():ppProjectResearch()):ppState.tab==='ai'?ppAiPanel():ppState.tab==='report'?ppReport(rows):ppState.tab==='review'?ppReviewQueue(rows):ppState.tab==='invite'?ppInvitations():ppState.tab==='collab'?ppCollaboration():ppState.tab==='risk'?ppRiskLinkage():ppState.tab==='standards'?ppStandards():ppHistory(rows);
  host.innerHTML=`<div class="pp-hero"><small>${ppRole==='region'?'REGIONAL FUND WORKSPACE':ppRole==='fund'?'SUB-FUND WORKSPACE':'PROJECT WORKSPACE'}</small><h1>${ppE(ppObject.name)}</h1><p>${ppTypeName[ppRole]}独立工作台 · ${ppRole==='region'?'填报本区域、审核下级并分发入口':ppRole==='fund'?'管理项目池、投研尽调、投资组合与持续报送':'经营跟踪、融资估值、项目尽调与持续报送'}</p></div><div class="pp-notice">当前是本地演示：网址参数不是登录授权，记录仅保存在当前浏览器。跨机构协同须使用线上共享数据库、身份认证及服务端审核权限。</div><div class="pp-toolbar"><label>报告期<select id="pp-period">${['2026-Q3','2026-Q4','2026-Y'].map(p=>`<option value="${p}" ${ppState.period===p?'selected':''}>${p}</option>`).join('')}</select></label><label>本机构演示身份<select id="pp-actor"><option value="reporter" ${ppState.actor==='reporter'?'selected':''}>填报人员</option><option value="leader" ${ppState.actor==='leader'?'selected':''}>负责领导</option></select></label></div>${ppState.message?`<div class="pp-notice">${ppE(ppState.message)}</div>`:''}${body}`;
}
document.addEventListener('change',event=>{
  if(event.target.id==='pp-period'){ppState.period=event.target.value;ppState.message='';const url=new URL(window.location.href);url.searchParams.set('period',ppState.period);history.replaceState(null,'',url.href);ppRender()}
  if(event.target.id==='pp-actor'){ppState.actor=event.target.value;ppState.message='';ppRender()}
  if(event.target.id==='pp-invite-target'){ppState.inviteTarget=event.target.value;ppRender()}
});
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-pp-action]');if(!button)return;
  const action=button.dataset.ppAction;
  if(action==='tab'){ppState.tab=button.dataset.tab;ppState.message='';return ppRender()}
  if(action==='invite-kind'){ppState.inviteKind=button.dataset.kind;ppState.inviteTarget='';return ppRender()}
  if(action==='start')return ppStart();
  if(action==='save'||action==='submit')return ppSave(button.closest('form'),action==='submit');
  if(action==='internal-approve'||action==='internal-return')return ppInternalReview(action==='internal-return'?'returned':'submitted');
  if(action==='confirm'||action==='return')return ppReview(button.dataset.id,action==='confirm'?'confirmed':'returned');
  if(action==='create-referral'){
    const form=document.getElementById('pp-referral-form'),values=Object.fromEntries(new FormData(form));
    if(!values.enterprise||!values.need)return ppMessage('请填写需求企业和协同需求。');
    const rows=ppReadCollab();rows.push({id:ppCollabId('ref'),kind:'referral',fromRegion:ppTarget,toRegion:values.toRegion,enterprise:values.enterprise,needType:values.needType,need:values.need,status:'待接收',owner:ppCollabActor(),createdAt:ppNow()});ppWriteCollab(rows);return ppMessage('资源转介已创建，接收区域可在其工作台查看。');
  }
  if(action==='cycle-referral'){
    const rows=ppReadCollab(),record=rows.find(x=>x.id===button.dataset.id);if(!record)return;
    const next={待接收:'已接收',已接收:'对接中',对接中:'已关闭','已关闭':'待接收'};record.status=next[record.status]||'已接收';record.updatedAt=ppNow();ppWriteCollab(rows);return ppMessage(`转介状态已更新为：${record.status}`);
  }
  if(action==='create-risk'){
    const form=document.getElementById('pp-risk-form'),values=Object.fromEntries(new FormData(form));
    if(!values.subject||!values.note)return ppMessage('请填写风险主体和影响与处置建议。');
    const rows=ppReadCollab();rows.push({id:ppCollabId('risk'),kind:'risk',subject:values.subject,severity:values.severity,regionIds:[ppTarget],amount:values.amount||'待核查',funds:values.funds||'待核查',status:'联合处置待分派',note:values.note,owner:ppCollabActor(),createdAt:ppNow()});ppWriteCollab(rows);return ppMessage('联合处置任务已创建，已纳入本区域风险影响图。');
  }
  if(action==='ai-ask'){
    ppState.aiQuestion=button.dataset.question||'';ppState.aiAnswer=ppAiAnswer(ppState.aiQuestion);ppState.tab='ai';ppState.message='';return ppRender();
  }
  if(action==='ai-submit'){
    const form=document.getElementById('pp-ai-form'),question=new FormData(form).get('question')?.toString().trim();if(!question)return ppMessage('请输入问题后再提问。');
    ppState.aiQuestion=question;ppState.aiAnswer=ppAiAnswer(question);return ppRender();
  }
  if(action==='ai-history'){return ppRender()}
  if(action==='ai-copy'){
    const text=`${ppState.aiQuestion}\n${ppState.aiAnswer}`;if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>ppMessage('AI分析结果已复制。'));else ppMessage('当前浏览器不支持自动复制，请手动复制。');return;
  }
  if(action==='ai-export'){
    const blob=new Blob([`AI分析问题：${ppState.aiQuestion}\n\n分析结果：${ppState.aiAnswer}\n\n生成时间：${ppNow()}`],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`AI分析-${ppState.target||ppRole}.txt`;link.click();URL.revokeObjectURL(url);return;
  }
  if(action==='copy'){
    const input=document.getElementById('pp-invite-url');if(!input)return;
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(input.value).then(()=>ppMessage('工作台链接已复制。')).catch(()=>{input.select();ppMessage('请手动复制已选中的链接。')});
    else{input.select();ppMessage('请手动复制已选中的链接。')}
  }
});
window.addEventListener('storage',event=>{if([ppKey,ppCollabKey].includes(event.key))ppRender()});
ppRender();
