'use strict';
// Public synthetic fixtures only; no private documents are loaded.
const sourceFunds = [
  {
    "id": "F01",
    "name": "演示·青屿科创基金",
    "manager": "演示·云汀投资管理机构",
    "sector": "半导体与集成电路",
    "place": "浙江省杭州市",
    "size": 3.35,
    "request": 0.402,
    "district": "浙江省杭州市",
    "source": "synthetic-public-demo-v1",
    "confidence": "完全虚构演示"
  },
  {
    "id": "F02",
    "name": "演示·澄岚科创基金",
    "manager": "演示·衡野投资管理机构",
    "sector": "新材料与新能源",
    "place": "广东省东莞市",
    "size": 6.34,
    "request": 0.9193,
    "district": "广东省东莞市",
    "source": "synthetic-public-demo-v1",
    "confidence": "完全虚构演示"
  },
  {
    "id": "F03",
    "name": "演示·星舟科创基金",
    "manager": "演示·启萤投资管理机构",
    "sector": "人工智能与数字技术",
    "place": "广东省深圳市",
    "size": 2.66,
    "request": 0.4522,
    "district": "广东省深圳市",
    "source": "synthetic-public-demo-v1",
    "confidence": "完全虚构演示"
  },
  {
    "id": "F04",
    "name": "演示·云汀科创基金",
    "manager": "演示·南棠投资管理机构",
    "sector": "高端装备与机器人",
    "place": "四川省成都市",
    "size": 5.65,
    "request": 1.1018,
    "district": "四川省成都市",
    "source": "synthetic-public-demo-v1",
    "confidence": "完全虚构演示"
  },
  {
    "id": "F05",
    "name": "演示·远岫科创基金",
    "manager": "演示·序辰投资管理机构",
    "sector": "工业软件",
    "place": "北京市",
    "size": 8.64,
    "request": 1.9008,
    "district": "北京市",
    "source": "synthetic-public-demo-v1",
    "confidence": "完全虚构演示"
  }
];
const sourceProjects = [
  {
    "id": "P01",
    "name": "演示·青屿科技",
    "place": "安徽省合肥市",
    "summary": "医疗检测设备研发与技术服务；虚构业务场景，用于功能演示。",
    "sector": "生物医药与医疗器械",
    "round": 1.53,
    "request": 0.124,
    "region": "安徽省合肥市",
    "source": "synthetic-public-demo-v1",
    "status": "演示线索"
  },
  {
    "id": "P02",
    "name": "演示·澄岚科技",
    "place": "上海市",
    "summary": "通信模组与低功耗连接技术；虚构业务场景，用于功能演示。",
    "sector": "未来信息与通信",
    "round": 3.07,
    "request": 0.313,
    "region": "上海市",
    "source": "synthetic-public-demo-v1",
    "status": "演示线索"
  },
  {
    "id": "P03",
    "name": "演示·星舟科技",
    "place": "湖北省武汉市",
    "summary": "芯片设计与测试工具研发；虚构业务场景，用于功能演示。",
    "sector": "半导体与集成电路",
    "round": 0.83,
    "request": 0.502,
    "region": "湖北省武汉市",
    "source": "synthetic-public-demo-v1",
    "status": "演示线索"
  },
  {
    "id": "P04",
    "name": "演示·云汀科技",
    "place": "广东省广州市",
    "summary": "新材料中试研发与工艺验证服务；虚构业务场景，用于功能演示。",
    "sector": "新材料与新能源",
    "round": 2.37,
    "request": 0.232,
    "region": "广东省广州市",
    "source": "synthetic-public-demo-v1",
    "status": "演示线索"
  },
  {
    "id": "P05",
    "name": "演示·远岫科技",
    "place": "江苏省南京市",
    "summary": "工业软件研发与设备协同平台；虚构业务场景，用于功能演示。",
    "sector": "人工智能与数字技术",
    "round": 3.91,
    "request": 0.421,
    "region": "江苏省南京市",
    "source": "synthetic-public-demo-v1",
    "status": "演示线索"
  }
];
const demoProjects = [
  {id:'D01',name:'演示·青屿科创 · 项目 A',region:'深圳',sector:'新一代信息技术',status:'储备',owner:'深圳区域',updated:'2026-10-09'},
  {id:'D02',name:'上海区域 · 项目 B',region:'上海',sector:'高端装备制造',status:'跟进',owner:'上海区域',updated:'2026-10-06'},
  {id:'D03',name:'国家直投 · 项目 C',region:'北京',sector:'生物医药',status:'尽调',owner:'国家直投',updated:'2026-09-29'}
];
const demoRegions = [
  {name:'北京',size:18.6,request:4.8,paid:3.5,funds:7,projects:34},
  {name:'上海',size:14.8,request:3.9,paid:2.8,funds:5,projects:21},
  {name:'深圳',size:19.84,request:5.1,paid:3.7,funds:8,projects:31}
];
const demoCash = [
  {date:'2026-09-30',name:'深圳区域 · 子基金首期出资',kind:'出资',amount:-0.60,balance:4.40},
  {date:'2026-08-15',name:'项目退出分配',kind:'回款',amount:0.10,balance:4.50},
  {date:'2026-09-09',name:'上海区域 · 子基金追加出资',kind:'出资',amount:-0.90,balance:3.60},
  {date:'2026-10-01',name:'利息与其他流入',kind:'回款',amount:0.15,balance:3.75},
  {date:'2026-11-12',name:'深圳区域 · 子基金后续出资',kind:'出资',amount:-0.75,balance:3.00},
  {date:'2026-12-20',name:'项目退出分配',kind:'回款',amount:0.25,balance:3.25}
];
const lifecycle=['募集期','投资期','退出期','清算期'];
const labels={dashboard:'管理驾驶舱',funds:'基金全景',projects:'项目管理',approvals:'决策与审批',hierarchy:'穿透视图',operations:'运营治理',resources:'项目资源池',managers:'管理人库',postinvest:'投后管理',cashflow:'资金与现金流',risks:'风险预警',reports:'数据报表',ai:'AI 能力',files:'档案中心'};
const state={view:'dashboard',reportTab:'overview',reportScope:'source',reportRegion:'全部',aiTab:'query',fundQuery:'',fundDistrict:'全部',resourceQuery:'',resourceSector:'全部',resourceStage:'全部',sourceView:false,sourceFund:null};
const sum=(rows,key)=>rows.reduce((t,row)=>t+(Number(row[key])||0),0);
const num=(n,d=2)=>Number(n).toFixed(d);
const currentDate=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const percent=(n,d)=>d?num(100*n/d,1)+'%':'—';
const escapeHTML=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sourceUrl=()=>'source-data.js';
const sourceLink=()=>'<span class="demo-badge">虚构演示样本 · 无原始附件</span>';
const badge=(text,kind='source')=>`<span class="${kind==='demo'?'demo-badge':'source-badge'}">${escapeHTML(text)}</span>`;
const card=(title,body,sub='',actions='')=>`<div class="card"><div class="card-head"><div><div class="card-title">${title}</div>${sub?`<div class="card-sub">${sub}</div>`:''}</div>${actions}</div><div class="pad">${body}</div></div>`;
const stat=(title,value,unit,note)=>`<div class="stat-box"><span>${title}</span><strong>${value}<small>${unit}</small></strong><p>${note}</p></div>`;
const bar=(label,value,max,suffix='亿元')=>`<div class="hbar"><span>${escapeHTML(label)}</span><div class="track"><i style="width:${Math.max(0,Math.min(100,100*value/(max||1)))}%"></i></div><b>${num(value)} ${suffix}</b></div>`;
const note=(content,kind='source')=>`<div class="data-note">${badge(kind==='source'?'原始材料':'演示情景',kind)} ${content}</div>`;
const tabbar=(tabs,active,attr)=>`<div class="tabbar" role="tablist">${tabs.map(([key,label])=>`<button type="button" role="tab" aria-selected="${key===active}" class="${key===active?'active':''}" ${attr}="${key}">${label}</button>`).join('')}</div>`;
const table=(headers,rows)=>`<div class="table-wrap"><table class="data-table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
const toast=document.getElementById('toast');
let toastTimer;
function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2800)}
function download(name,content,type='text/plain;charset=utf-8'){const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([content],{type}));link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),5000)}
function csv(rows){return '\ufeff'+rows.map(row=>row.map(value=>'"'+String(value??'').replaceAll('"','""')+'"').join(',')).join('\r\n')}
function openModal(title,body,subtitle=''){const modal=document.getElementById('modal');modal.querySelector('.card-title').textContent=title;modal.querySelector('.card-sub').textContent=subtitle;modal.querySelector('.modal-body').innerHTML=body;modal.classList.add('show');document.getElementById('closeModal').focus()}
function closeModal(){document.getElementById('modal')?.classList.remove('show')}
function host(view){let el=document.getElementById(view);if(!el){el=document.createElement('section');el.id=view;el.className='view section-hidden';document.querySelector('.content').appendChild(el)}return el}
function go(view){if(!labels[view])return;state.view=view;if(renderers[view])renderers[view]();document.querySelectorAll('.view').forEach(x=>x.classList.toggle('section-hidden',x.id!==view));document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.view===view));document.getElementById('crumbText').textContent=labels[view];window.scrollTo({top:0,behavior:'smooth'})}
function pageIntro(kicker,title,desc,action=''){return `<div class="hero"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${desc}</p></div>${action}</div>`}
const renderers={};
renderers.funds=renderFunds;
function filteredFunds(){return sourceFunds.filter(f=>(state.fundDistrict==='全部'||f.district.includes(state.fundDistrict))&&`${f.name} ${f.manager} ${f.sector}`.includes(state.fundQuery))}
function renderFunds(){const fs=filteredFunds();host('funds').innerHTML=`${pageIntro('FUND REGISTER','基金全景','基金档案、生命周期、出资结构与原始材料可逐层查看。','<button class="primary" data-action="fund-csv">导出虚构台账 CSV</button>')}${note('以下 5 条为独立生成的虚构基金；表头为“基金总规模”和“申请出资”，不能据此认定为已投或已实缴。管理归属、生命周期、项目数尚未在材料中确认。')}`+
  `<div class="filterbar"><label>搜索 <input id="fundQuery" placeholder="基金、管理人、产业方向" value="${escapeHTML(state.fundQuery)}" /></label><label>注册地 <select id="fundDistrict"><option>全部</option><option ${state.fundDistrict==='宝安'?'selected':''}>宝安</option><option ${state.fundDistrict==='南山'?'selected':''}>南山</option><option ${state.fundDistrict==='深圳'?'selected':''}>深圳</option></select></label><span class="right muted">当前显示 ${fs.length} 条 / 虚构资料核对 5 条</span></div>`+
  `<div id="fundResults">${fundResults(fs)}</div>`}
function fundResults(fs){return fs.length?`<div class="fund-cards">${fs.map(f=>`<button class="card fund-tile" data-fund="${f.id}"><div class="button-row">${badge('虚构立项表')}<span class="muted">${escapeHTML(f.district)}</span></div><h3>${escapeHTML(f.name)}</h3><div class="muted">管理人：${escapeHTML(f.manager)}</div><div class="mini-grid"><div><span>基金总规模</span><b>${num(f.size,3)}</b><small> 亿</small></div><div><span>申请出资</span><b>${num(f.request,4)}</b><small> 亿</small></div><div><span>申请/规模</span><b>${percent(f.request,f.size)}</b></div></div><div class="lifecycle">${lifecycle.map(x=>`<span class="life-step">${x}</span>`).join('')}</div><div class="muted">生命周期未在原始材料中给出 · ${escapeHTML(f.source)} 第 ${f.id} 行 →</div></button>`).join('')}</div>`:`<div class="card empty">没有符合条件的基金。请调整筛选条件。</div>`}
function openFund(id){const f=sourceFunds.find(x=>x.id===id);if(!f)return;state.sourceFund=f;renderFundModal()}
function renderFundModal(){const f=state.sourceFund;const tabs=[['base','基础信息'],['capital','出资结构'],['flow','投资流程'],['portfolio','底层项目'],['archive','资料来源']];const pane={
  base:`<div class="modal-grid"><div class="field"><span>基金名称</span><b>${escapeHTML(f.name)}</b></div><div class="field"><span>基金管理人</span><b>${escapeHTML(f.manager)}</b></div><div class="field"><span>拟注册地</span><b>${escapeHTML(f.district)}</b></div><div class="field"><span>主要行业</span><b>${escapeHTML(f.sector)}</b></div><div class="field"><span>基金总规模</span><b>${num(f.size,3)} 亿元</b></div><div class="field"><span>申请出资</span><b>${num(f.request,4)} 亿元</b></div></div>`,
  capital:`<div class="stat-row" style="grid-template-columns:repeat(3,1fr)">${stat('总规模',num(f.size,3),'亿元','立项表原值')}${stat('申请出资',num(f.request,4),'亿元','立项表原值')}${stat('申请出资占比',percent(f.request,f.size),'','申请出资 ÷ 总规模')}</div><div class="insight">认缴、实缴、现金回款和基金份额比例需要协议及财务台账支持；本页不据“申请出资”自动推断。</div>`,
  flow:`<div class="lifecycle">${lifecycle.map(x=>`<span class="life-step">${x}</span>`).join('')}</div><div class="insight">原始材料是“立项情况表”，未载明工商设立、实际出资、投委会结论或基金当前阶段。后续可接入审批单、协议与工商变更记录。</div>`,
  portfolio:`<div class="empty">虚构立项表没有逐基金对应的底层项目清单。项目资源池中的照片条目暂不自动关联本基金。</div><button class="ghost" data-view-link="resources" data-close-modal>查看项目资源池 →</button>`,
  archive:`<div class="notice">来源：粤港澳大湾区创业投资引导基金子基金立项情况表，截至 2026-09-30；照片 ${escapeHTML(f.source)}，第 ${f.id} 行。<br/>核验状态：${escapeHTML(f.confidence)}。虚构文字仅用于界面演示，正式台账应以签章原件复核。</div><p style="margin-top:16px">${sourceLink(f.source)}</p>`
};openModal(f.name,`${tabbar(tabs,state.fundModalTab||'base','data-fund-tab')}<div class="fund-pane">${pane[state.fundModalTab||'base']}</div>`,'基金档案 · 立项材料样本')}
renderers.managers=renderManagers;
function renderManagers(){const count=new Map();sourceFunds.forEach(f=>{const x=count.get(f.manager)||{manager:f.manager,funds:0,size:0,request:0,src:[]};x.funds++;x.size+=f.size;x.request+=f.request;x.src.push(f.id);count.set(f.manager,x)});const rows=[...count.values()].sort((a,b)=>b.size-a.size);host('managers').innerHTML=`${pageIntro('MANAGER DIRECTORY','管理人库','从立项材料汇总管理人，可用于后续接入履历、合规与绩效评价。','<button class="primary" data-action="manager-csv">导出管理人名单</button>')}${note('以下管理人名称及对应基金来源于立项表；“基金数/涉及规模”为这 5 条样本的汇总，非管理人全部在管规模。')}`+
  `<div class="stat-row">${stat('样本管理人',rows.length,'家','按名称去重')}${stat('关联子基金',sourceFunds.length,'支','演示资料样本')}${stat('涉及基金规模',num(sum(sourceFunds,'size')),'亿元','非管理人完整 AUM')}${stat('平均申请出资占比',percent(sum(sourceFunds,'request'),sum(sourceFunds,'size')),'','样本口径')}</div>`+
  card('管理人台账',table(['管理人','关联基金数','涉及规模（亿）','申请出资（亿）','来源'],rows.map(x=>`<tr><td class="fund-name">${escapeHTML(x.manager)}</td><td>${x.funds}</td><td>${num(x.size,3)}</td><td>${num(x.request,4)}</td><td>${sourceLink('synthetic-public-demo-v1','第 '+x.src.join('、')+' 行')}</td></tr>`)),'来源可追溯到虚构资料行号')}
renderers.resources=renderResources;
function resourcesRows(){return sourceProjects.filter(p=>`${p.name} ${p.summary} ${p.region}`.includes(state.resourceQuery)&&(state.resourceSector==='全部'||p.sector===state.resourceSector)&&(state.resourceStage==='全部'||p.status===state.resourceStage))}
function renderResources(){const rows=resourcesRows();host('resources').innerHTML=`${pageIntro('PROJECT PIPELINE','项目资源池','把线索收集、查重、跟进、入库和立项衔接起来。','<button class="primary" data-action="new-resource">＋ 新增项目线索</button>')}${note('演示资料中的企业名称与描述识别置信度有限；以下条目先进入待核验资源池。当前跟进流程为浏览器本地演示数据。')}`+
  `<div class="filterbar"><label>关键词 <input id="resourceQuery" placeholder="企业名称、行业、地区" value="${escapeHTML(state.resourceQuery)}" /></label><label>行业 <select id="resourceSector">${['全部',...new Set(sourceProjects.map(p=>p.sector))].map(s=>`<option ${s===state.resourceSector?'selected':''}>${s}</option>`).join('')}</select></label><label>状态 <select id="resourceStage"><option>全部</option><option ${state.resourceStage==='待核验'?'selected':''}>待核验</option></select></label><span class="right muted">显示 ${rows.length} 条</span></div>`+
  card('原始材料线索',table(['企业/项目','所在地','技术方向','核验状态','材料来源','操作'],rows.map(p=>`<tr><td class="fund-name">${escapeHTML(p.name)}</td><td>${escapeHTML(p.region)}</td><td>${escapeHTML(p.sector)}</td><td>${badge(p.status)}</td><td>${sourceLink(p.source)}</td><td><button class="link" data-project="${p.id}">查看线索</button></td></tr>`)),'支持检索、查看虚构资料和人工核验')+
  `<div style="height:18px"></div>`+card('演示跟进记录',table(['项目','责任区域','跟进阶段','最近更新','操作'],demoProjects.map(p=>`<tr><td>${escapeHTML(p.name)}</td><td>${escapeHTML(p.owner)}</td><td><span class="pill blue">${p.status}</span></td><td>${p.updated}</td><td><button class="link" data-followup="${p.id}">跟进记录</button></td></tr>`)),'情景示例；与演示资料企业无关联')}
function openProject(id){const p=sourceProjects.find(x=>x.id===id);if(!p)return;openModal(p.name,`<div class="modal-grid"><div class="field"><span>地区</span><b>${escapeHTML(p.region)}</b></div><div class="field"><span>行业</span><b>${escapeHTML(p.sector)}</b></div><div class="field"><span>资料描述</span><b>${escapeHTML(p.summary)}</b></div><div class="field"><span>核验状态</span><b>待核验</b></div></div><div class="insight">未从照片确认投资关系、投资金额或项目阶段。虚构资料核对后可发起入库和跟进。</div>${sourceLink(p.source)}`,'项目资源池 · 资料线索')}
function openNewResource(){openModal('新增项目线索',`<div class="form-stack"><label>企业/项目名称<input id="resourceName" maxlength="100" placeholder="请输入名称" /></label><label>地区<input id="resourceRegion" maxlength="30" placeholder="例如：深圳" /></label><label>所属行业<select id="resourceIndustry"><option>新一代信息技术</option><option>高端装备制造</option><option>生物医药</option><option>清洁能源</option><option>其他</option></select></label><label>责任区域<select id="resourceOwner"><option>国家直投</option><option>北京区域</option><option>上海区域</option><option>深圳区域</option></select></label></div><div class="modal-foot"><button class="ghost" data-action="modal-close">取消</button><button class="primary" data-action="save-resource">加入演示跟进记录</button></div>`,'仅保存在本次页面会话')}
function saveResource(){const name=document.getElementById('resourceName')?.value.trim();if(!name){document.getElementById('resourceName')?.focus();showToast('请填写项目名称');return}if(demoProjects.some(x=>x.name===name)){showToast('演示跟进记录中已存在该名称');return}demoProjects.push({id:'D'+String(demoProjects.length+1).padStart(2,'0'),name,region:document.getElementById('resourceRegion').value.trim()||'待补充',sector:document.getElementById('resourceIndustry').value,status:'储备',owner:document.getElementById('resourceOwner').value,updated:currentDate(),notes:[]});closeModal();renderResources();showToast('项目线索已加入本次演示')}
function openFollowup(id){const p=demoProjects.find(x=>x.id===id);if(!p)return;openModal(p.name,`<div class="modal-grid"><div class="field"><span>责任区域</span><b>${escapeHTML(p.owner)}</b></div><div class="field"><span>地区 / 行业</span><b>${escapeHTML(p.region)} · ${escapeHTML(p.sector)}</b></div></div><div class="form-stack" style="margin-top:18px"><label>跟进阶段<select id="followupStatus">${['储备','跟进','尽调','已立项','已终止'].map(s=>`<option ${p.status===s?'selected':''}>${s}</option>`).join('')}</select></label><label>跟进内容<textarea id="followupNote" placeholder="记录沟通、材料和下一步计划"></textarea></label></div>${p.notes?.length?`<div class="insight">已有记录：${p.notes.map(escapeHTML).join('；')}</div>`:''}<div class="modal-foot"><button class="ghost" data-action="modal-close">取消</button><button class="primary" data-action="save-followup" data-id="${p.id}">保存跟进</button></div>`,'演示工作流 · 本地记录')}
function saveFollowup(id){const p=demoProjects.find(x=>x.id===id);if(!p)return;const note=document.getElementById('followupNote').value.trim();p.status=document.getElementById('followupStatus').value;if(note){p.notes??=[];p.notes.push(note)}p.updated=currentDate();closeModal();renderResources();showToast('跟进记录已更新')}
function reportRows(){if(state.reportScope==='source')return sourceFunds.filter(f=>state.reportRegion==='全部'||f.district.includes(state.reportRegion));return demoRegions.filter(r=>state.reportRegion==='全部'||r.name===state.reportRegion)}
function reportName(r){return state.reportScope==='source'?r.name:r.name+'区域母基金'}
function reportSource(){return state.reportScope==='source'}
function reportNote(){return reportSource()?note('统计对象为独立生成的5条虚构样本；“申请出资”属于立项申请口径。筛选按拟注册地，不表示资金归属。图表由这 5 行计算。'):note('北京、上海、深圳区域规模、实缴、项目数与现金流为独立的演示情景；不是从虚构样本推算，也不代表客户真实经营数据。','demo')}
function reportScopeBar(){const options=reportSource()?['全部','宝安','南山','深圳']:['全部','北京','上海','深圳'];return `<div class="filterbar"><label>数据口径 <select id="reportScope"><option value="source" ${reportSource()?'selected':''}>虚构立项表样本</option><option value="demo" ${!reportSource()?'selected':''}>区域运营演示</option></select></label><label>地区 <select id="reportRegion">${options.map(x=>`<option ${state.reportRegion===x?'selected':''}>${x}</option>`).join('')}</select></label><span class="right muted">${reportSource()?'来源：synthetic-public-demo-v1｜2026-09-30':'情景数据｜按区域独立模拟'}</span></div>`}
const reportTabs=[['overview','总览'],['capital','出资分析'],['performance','组合绩效'],['strategy','策略与目标'],['forecast','资金预测'],['quality','数据质量']];
renderers.reports=renderReports;
function renderReports(){const rows=reportRows();host('reports').innerHTML=`${pageIntro('ANALYTICS & REPORTING','数据报告','按统一口径分析基金规模、出资、组合绩效、产业方向与资金计划。','<div class="button-row"><button class="ghost" data-action="report-csv">导出当前数据 CSV</button><button class="primary" data-action="draft-report">生成报告草稿</button></div>')}${reportScopeBar()}${reportNote()}${tabbar(reportTabs,state.reportTab,'data-report-tab')}<div id="reportContent">${reportBody(rows)}</div>`}
function reportBody(rows){switch(state.reportTab){case 'capital':return capitalReport(rows);case 'performance':return performanceReport(rows);case 'strategy':return strategyReport(rows);case 'forecast':return forecastReport(rows);case 'quality':return qualityReport(rows);default:return overviewReport(rows)}}
function reportEmpty(){return `<div class="card empty">当前地区没有样本。请切换地区或数据口径。</div>`}
function overviewReport(rows){if(!rows.length)return reportEmpty();const source=reportSource(),total=sum(rows,'size'),req=sum(rows,'request'),paid=sum(rows,'paid'),max=Math.max(...rows.map(r=>r.size));const bySector=source?Object.entries(rows.reduce((m,r)=>(m[r.sector]=(m[r.sector]||0)+r.size,m),{})).sort((a,b)=>b[1]-a[1]):[];return `<div class="stat-row">${stat(source?'样本基金':'区域基金',rows.length,'支',source?'立项材料前五行':'三个区域模拟')}${stat('基金总规模',num(total,source?3:2),'亿元',source?'基金总规模合计':'情景合计')}${stat(source?'申请出资':'已承诺出资',num(req,source?4:2),'亿元',source?'申请口径，非实缴':'情景指标')}${stat(source?'申请出资占比':'实缴/承诺',source?percent(req,total):percent(paid,req),'',source?'申请出资 ÷ 基金总规模':'已实缴 ÷ 已承诺')}</div>`+
  `<div class="split">${card(source?'单基金规模对比':'区域规模对比',rows.map(r=>bar(source?r.name.slice(0,9):r.name,r.size,max)).join(''),source?'单位：亿元；由虚构资料样本汇总':'单位：亿元；演示情景')}${card(source?'主要产业方向':'区域经营概览',source?bySector.map(([name,value])=>bar(name,value,total)).join(''):rows.map(r=>`<div class="hbar"><span>${r.name}区域</span><div class="track"><i style="width:${100*r.paid/r.request}%"></i></div><b>${percent(r.paid,r.request)}</b></div>`).join(''),source?'按基金总规模分组':'实缴/承诺比例')}</div>`+
  card('管理判断',`<div class="insight">${source?`样本合计规模 ${num(total)} 亿元，申请出资 ${num(req,4)} 亿元，占比 ${percent(req,total)}。产业方向按基金主要行业统计；本材料未提供实际出资与投后绩效。`:`三个区域的承诺出资合计 ${num(req)} 亿元，实缴合计 ${num(paid)} 亿元。各区域实缴进度可用于演示管理层的横向比较。`}</div><div class="muted">${source?'查看虚构资料：'+sourceLink('synthetic-public-demo-v1'):'演示数据不对应演示资料中的立项基金。'}</div>`) }
function capitalReport(rows){if(!rows.length)return reportEmpty();const source=reportSource(),size=sum(rows,'size'),requested=sum(rows,'request'),paid=sum(rows,'paid');return `<div class="stat-row">${stat('基金总规模',num(size),'亿元','筛选后的合计')}${stat(source?'申请出资':'承诺出资',num(requested,4),'亿元',source?'立项表列名':'模拟情景')}${stat(source?'申请占比':'实缴比例',source?percent(requested,size):percent(paid,requested),'','相同样本汇总')}${stat(source?'实缴数据':'未实缴承诺',source?'未提供':num(requested-paid),'亿元',source?'需引入财务台账':'承诺减实缴，情景值')}</div>`+
  card('出资结构明细',table([source?'子基金':'区域','总规模（亿）',source?'申请出资（亿）':'已承诺（亿）',source?'申请/规模':'已实缴（亿）','材料/口径'],rows.map(r=>`<tr><td><button class="link" ${source?`data-fund="${r.id}"`:`data-view-link="hierarchy"`}>${escapeHTML(reportName(r))}</button></td><td>${num(r.size,3)}</td><td>${num(r.request,4)}</td><td>${source?percent(r.request,r.size):num(r.paid)}</td><td>${source?sourceLink(r.source,'虚构资料第 '+r.row+' 行'):badge('情景模拟','demo')}</td></tr>`).concat(`<tr class="total"><td>合计</td><td>${num(size,3)}</td><td>${num(requested,4)}</td><td>${source?percent(requested,size):num(paid)}</td><td>${rows.length} 条</td></tr>`)),'来源、单位及汇总口径完整显示')+
  `<div style="height:18px"></div>`+card('口径说明',`<div class="formula">${source?'申请出资占比 = 申请出资金额 ÷ 基金总规模。该指标不是实缴率、资金拨付率或基金持股比例。':'实缴率 = 已实缴金额 ÷ 已承诺出资。示例区域值由单独情景数据组成。'}</div>`)}
function performanceReport(rows){if(!rows.length)return reportEmpty();if(reportSource())return `${note('虚构立项表未给出实缴出资、累计分配、剩余资产公允价值、现金流日期，因此无法可靠计算 DPI、RVPI、TVPI 和 IRR。')}${card('绩效数据接入清单',`<div class="readiness"><div class="field"><span>已实缴资本</span><b>待财务台账</b></div><div class="field"><span>累计现金分配</span><b>待分配台账</b></div><div class="field"><span>剩余投资估值</span><b>待估值报告</b></div><div class="field"><span>每笔现金流日期</span><b>待流水明细</b></div></div><div class="insight">原始材料目前只支持“总规模、申请出资”比较。可切换到区域运营演示查看绩效指标的界面及计算方式。</div>`,'不以申请出资代替 Paid-In Capital')}`;
  const pic=3.4,dist=.6,nav=3.7,dpi=dist/pic,rvpi=nav/pic,tvpi=(dist+nav)/pic;return `${note('以下为组合绩效的演示样本：累计实缴 3.40 亿、累计分配 0.60 亿、剩余价值 3.70 亿。该样本与区域规模情景独立，用于说明指标计算。','demo')}<div class="stat-row">${stat('DPI',num(dpi)+'×','','累计分配 ÷ 已实缴')}${stat('RVPI',num(rvpi)+'×','','剩余价值 ÷ 已实缴')}${stat('TVPI',num(tvpi)+'×','','（累计分配+剩余价值）÷ 已实缴')}${stat('IRR','待计算','','缺少逐笔现金流日期')}</div><div class="split">${card('价值构成',`${bar('已实缴',pic,4.5)}${bar('现金回款',dist,4.5)}${bar('剩余价值',nav,4.5)}`,'单位：亿元')}${card('公式与解读',`<div class="formula">DPI = ${num(dist)} ÷ ${num(pic)} = ${num(dpi)}×<br/>RVPI = ${num(nav)} ÷ ${num(pic)} = ${num(rvpi)}×<br/>TVPI = (${num(dist)} + ${num(nav)}) ÷ ${num(pic)} = ${num(tvpi)}×<br/>IRR 需要逐笔出资和回款日期，不用总额臆算。</div>`,'所有数值均为模拟输入')}</div>`}
function strategyReport(rows){if(!rows.length)return reportEmpty();if(reportSource()){const sectors=Object.entries(rows.reduce((m,r)=>(m[r.sector]=(m[r.sector]||0)+r.size,m),{})).sort((a,b)=>b[1]-a[1]),total=sum(rows,'size');return `<div class="stat-row">${stat('行业方向',sectors.length,'类','来自立项表“主要行业”')}${stat('样本规模',num(total),'亿元','行业规模分母')}${stat('最大行业占比',percent(sectors[0][1],total),'','按基金总规模')}${stat('政策目标','未配置','','需由客户确定口径')}</div><div class="split">${card('产业分布',sectors.map(([n,v])=>bar(n,v,total)).join(''),'按基金总规模统计')}${card('统计边界',`<div class="insight">只反映立项基金申报的主要行业，不代表底层项目行业或实际投资落地。若基金同时跨多个行业，需要项目明细才能做穿透统计。</div><div class="muted">现有材料未提供政策考核目标或门槛，系统不会自动判定“达标”。</div>`)}</div>`}
  const counts=[['新一代信息技术',36],['高端装备制造',21],['生物医药',15],['清洁能源',8],['其他',6]],total=counts.reduce((a,x)=>a+x[1],0);return `${note('底层项目行业分布为演示情景。目标值需要甲方确认后配置；当前页面不自动输出合规结论。','demo')}<div class="triple">${[['早期阶段配置','54%','演示值'],['科技企业覆盖','78%','演示值'],['关键区域覆盖','3 区域','演示值']].map(([n,v,sub])=>`<div class="target"><h4>${n}</h4><div class="number">${v}</div><div class="progress"><i style="width:72%"></i></div><p>${sub}；目标阈值尚未配置。</p></div>`).join('')}</div><div style="height:18px"></div>${card('底层项目行业分布',counts.map(([n,v])=>bar(n,v,total,'个')).join(''),'86 个情景项目，按项目数量统计')}`}
function forecastReport(rows){if(!rows.length)return reportEmpty();if(reportSource())return `${note('虚构立项表没有资金计划、预计拨付时间和现金余额，无法从“申请出资”推导未来现金流。')}${card('建模所需输入',`<div class="readiness"><div class="field"><span>可用资金期初余额</span><b>待财务台账</b></div><div class="field"><span>分期出资承诺</span><b>待协议及拨付计划</b></div><div class="field"><span>预计退出回款</span><b>待投后预测</b></div><div class="field"><span>管理费用与其他收支</span><b>待预算</b></div></div><div class="insight">切换“区域运营演示”可拖动预测假设，查看季度余额变化和可能的资金缺口。</div>`,'资金预测输入完备性')}`;
  return cashForecast()}
function cashForecast(){const rate=Number(state.forecastRate??1),out=[.60,.90,.75],inc=[.10,.15,.25],values=[],quarter=['2026 Q3','2026 Q4','2027 Q1'];let balance=5;for(let i=0;i<3;i++){balance+=inc[i]-out[i]*rate;values.push({q:quarter[i],out:out[i]*rate,inc:inc[i],balance})}return `${note('期初余额 5.00 亿元、各季计划出资和回款均为演示情景。拖动出资兑现系数后即时重算余额；不代表真实拨付安排。','demo')}<div class="filterbar"><label>出资兑现系数 <input id="forecastRate" type="range" min="0" max="200" value="${Math.round(rate*100)}" style="min-width:220px" /></label><b id="forecastRateLabel">${Math.round(rate*100)}%</b><span class="muted">100% = 按演示计划执行</span></div><div class="stat-row">${stat('期初可用余额','5.00','亿元','演示输入')}${stat('计划出资',num(values.reduce((a,r)=>a+r.out,0)),'亿元','可通过滑块调整')}${stat('预计回款',num(values.reduce((a,r)=>a+r.inc,0)),'亿元','固定演示输入')}${stat('期末可用余额',num(balance),'亿元',balance<2?'低于演示观察线 2 亿元':'高于演示观察线 2 亿元')}</div><div class="split">${card('季度余额变化',`<div class="trend-chart">${[{q:'期初',balance:5},...values].map(v=>`<div class="trend-col"><b>${num(v.balance)}</b><i style="height:${Math.max(3,Math.min(100,100*v.balance/5))}%"></i><span>${v.q}</span></div>`).join('')}</div>`,'单位：亿元')}${card('现金计划台账',table(['期间','预计出资','预计回款','期末余额'],values.map(v=>`<tr><td>${v.q}</td><td>${num(v.out)}</td><td>${num(v.inc)}</td><td class="${v.balance<2?'negative':''}">${num(v.balance)}</td></tr>`)),'计划数随兑现系数变化')}</div>`}
function qualityReport(rows){const source=reportSource();if(!rows.length)return reportEmpty();const fields=source?[['基金名称',rows.length,rows.length],['管理人',rows.length,rows.length],['总规模',rows.length,rows.length],['申请出资',rows.length,rows.length],['工商设立日期',0,rows.length],['已实缴金额',0,rows.length],['投资阶段',0,rows.length],['底层项目关联',0,rows.length]]:[['区域基金规模',rows.length,rows.length],['承诺出资',rows.length,rows.length],['已实缴金额',rows.length,rows.length],['底层项目数量',rows.length,rows.length],['原始凭证',0,rows.length]];const completeness=Math.round(100*fields.reduce((t,x)=>t+x[1],0)/fields.reduce((t,x)=>t+x[2],0));return `<div class="stat-row">${stat('字段完整率',completeness+'%','','当前页面要求字段')}${stat('记录数量',rows.length,'条','筛选后样本')}${stat('可追溯虚构资料',source?rows.length:0,'条',source?'逐行链接虚构资料':'演示数据没有虚构资料')}${stat('待人工复核',source?rows.filter(x=>x.confidence.includes('需人工')).length:rows.length,'条',source?'照片中局部文字':'演示情景全部需替换')}</div><div class="split">${card('字段完整度',fields.map(([name,filled,total])=>`<div class="hbar"><span>${name}</span><div class="track"><i style="width:${100*filled/total}%"></i></div><b>${filled}/${total}</b></div>`).join(''),'完整度按照选定口径计算')}${card('数据治理建议',`<div class="timeline-item"><b>1 · 原始材料识别</b><p>保留每个字段对应的照片与行号；照片模糊字段标记待复核。</p></div><div class="timeline-item"><b>2 · 主体信息校验</b><p>核对基金、管理人名称与实际工商/合同文件，避免同名和简称重复。</p></div><div class="timeline-item"><b>3 · 财务口径接入</b><p>增加认缴、实缴、拨付、回款和估值台账后再计算绩效指标。</p></div><div class="timeline-item"><b>4 · 项目关系确认</b><p>由业务人员确认基金—项目关系，避免仅凭照片位置自动推断。</p></div>`,'为后续数据接入提供检查清单')}</div>`}
function reportExport(){const rows=reportRows();const headers=reportSource()?['基金名称','基金管理人','拟注册地','主要行业','基金总规模（亿元）','申请出资（亿元）','虚构资料','行号']:['区域','基金总规模（亿元）','承诺出资（亿元）','已实缴（亿元）','子基金数量','项目数量','口径'];const data=rows.map(r=>reportSource()?[r.name,r.manager,r.district,r.sector,r.size,r.request,r.source,r.row]:[r.name,r.size,r.request,r.paid,r.funds,r.projects,'演示情景']);download('母基金数据报告_'+(reportSource()?'立项样本':'区域演示')+'.csv',csv([headers,...data]),'text/csv;charset=utf-8')}
function draftText(){const rows=reportRows(),source=reportSource(),size=sum(rows,'size'),amount=sum(rows,'request');return `# 国家创业投资母基金 · 数据分析报告草稿\n\n生成日期：${currentDate()}\n统计口径：${source?'2026-09-30 虚构立项表图片第 1—5 行':'区域运营演示情景'}\n筛选地区：${state.reportRegion}\n\n## 一、核心数据\n当前样本 ${rows.length} 条，基金总规模 ${num(size,3)} 亿元，${source?'申请出资':'承诺出资'} ${num(amount,4)} 亿元。${source?`申请出资占总规模 ${percent(amount,size)}。`:`已实缴 ${num(sum(rows,'paid'))} 亿元，实缴/承诺 ${percent(sum(rows,'paid'),amount)}。`}\n\n## 二、明细\n${rows.map((r,i)=>`${i+1}. ${reportName(r)}：规模 ${num(r.size,3)} 亿元；${source?'申请出资':'承诺出资'} ${num(r.request,4)} 亿元${source?`；来源 ${r.source} 第 ${r.row} 行`:`；实缴 ${num(r.paid)} 亿元`}`).join('\n')}\n\n## 三、管理提示\n${source?'当前材料没有工商设立状态、已实缴额、底层项目及现金回款，不能据此计算投后绩效。少量虚构文字需人工复核。':'本节数据仅用于展示区域横向比较和管理报告版式。正式报告应替换为财务、运营和投后系统虚构台账。'}\n\n## 四、待补数据\n基金生命周期、协议承诺额、逐笔现金流、投后估值、底层项目关系。\n`}
function openDraft(){openModal('报告草稿',`<div class="notice">已根据当前筛选条件生成。可直接编辑，并下载 Markdown 或打印；没有自动提交、审批或发送。</div><textarea class="report-editor" id="reportEditor">${escapeHTML(draftText())}</textarea><div class="modal-foot"><button class="ghost" data-action="draft-print">打印 / 存 PDF</button><button class="primary" data-action="draft-download">下载草稿 .md</button></div>`,'报告中心 · 当前页面数据口径')}
renderers.cashflow=renderCashflow;
function renderCashflow(){const out=demoCash.filter(x=>x.amount<0),income=demoCash.filter(x=>x.amount>0);host('cashflow').innerHTML=`${pageIntro('CAPITAL & CASHFLOW','资金与现金流','观察出资、回款和可用余额的时间变化。','<button class="primary" data-action="cash-csv">导出现金计划 CSV</button>')}${note('照片未提供真实拨付流水。以下 6 条为演示情景，期初余额 5.00 亿元；2026-09-30 为场景起点，不能作为真实记账日期。','demo')}<div class="stat-row">${stat('期初余额','5.00','亿元','场景起点')}${stat('累计计划出资',num(-sum(out,'amount')),'亿元','演示计划')}${stat('累计预计回款',num(sum(income,'amount')),'亿元','演示计划')}${stat('期末余额',num(demoCash.at(-1).balance),'亿元','按流水逐笔滚动')}</div><div class="split">${card('现金流变化',`<div class="trend-chart">${[{date:'期初',balance:5},...demoCash].map(x=>`<div class="trend-col"><b>${num(x.balance)}</b><i style="height:${100*x.balance/5}%"></i><span>${x.date.slice(5)}</span></div>`).join('')}</div>`,'单位：亿元；情景模拟')}${card('资金结构',`${bar('计划出资',-sum(out,'amount'),5)}${bar('预计回款',sum(income,'amount'),5)}${bar('期末余额',demoCash.at(-1).balance,5)}<div class="insight">期末余额 = 期初余额 + 累计回款 − 累计出资。可从数据报告中调整出资兑现系数，查看资金预测。</div><button class="link" data-view-link="reports" data-go-forecast>打开资金预测 →</button>`,'演示资金计划')}</div>${card('现金计划台账',table(['日期','事项','类型','收支（亿元）','滚动余额（亿元）'],demoCash.map(x=>`<tr><td>${x.date}</td><td>${escapeHTML(x.name)}</td><td>${x.kind}</td><td class="${x.amount<0?'negative':'positive'}">${x.amount>0?'+':''}${num(x.amount)}</td><td>${num(x.balance)}</td></tr>`)),'用于展示可审计的逐笔资金视图')}`}
const aiTabs=[['query','智能问数','查询基金、管理人与金额'],['document','文档识别','从粘贴文本提取字段'],['report','报告助手','草拟分析要点'],['review','条款检查','核对关键字段与矛盾'],['industry','行业配置','观察产业分布']];
renderers.ai=renderAI;
function renderAI(){host('ai').innerHTML=`<div class="ai-hero"><div><div class="eyebrow" style="color:#6be3d5">AI WORKBENCH</div><h1>AI 能力</h1><p>围绕投前识别、数据问答、报告草拟和材料核验，演示可落地的人机协同流程。</p></div><div class="ai-orbit">✦</div></div>${note('当前为浏览器本地演示：问数、抽取和规则检查基于页面数据及文本规则，无模型调用，也不会将资料上传。正式接入模型后需连接权限、资料库与审核流程。','demo')}<div class="ai-grid"><div class="card ai-menu">${aiTabs.map(([key,title,sub])=>`<button class="${key===state.aiTab?'active':''}" data-ai-tab="${key}"><b>${title}</b><small>${sub}</small></button>`).join('')}<div class="ai-state">● 本地演示模式<br/>来源定位 · 人工复核 · 可解释输出</div></div><div class="card ai-panel pad" id="aiPanel">${aiPanel()}</div></div>`}
function aiPanel(){switch(state.aiTab){case 'document':return `<h3>文档识别与字段提取</h3><p class="muted">粘贴立项表、会议纪要或协议的文字内容；演示引擎识别金额、基金名称、行业等字段，并标记需复核项。</p><div class="button-row" style="margin:18px 0"><button class="ghost" data-action="sample-document">载入立项表文本样例</button><button class="ghost" data-action="clear-document">清空</button></div><textarea id="documentText" placeholder="例如：基金名称：演示·澄岚科创基金；基金总规模：5亿元；申请出资：1.495亿元……"></textarea><div class="button-row" style="margin-top:13px"><button class="primary" data-action="extract-document">识别字段</button></div><div id="documentResult"></div>`;
  case 'report':return `<h3>报告助手</h3><p class="muted">读取当前数据报告的筛选口径，生成可编辑的管理层报告草稿。只引用样本内可追溯的数值。</p><div class="readiness"><div class="field"><span>当前口径</span><b>${reportSource()?'虚构立项表样本':'区域运营演示'}</b></div><div class="field"><span>筛选地区</span><b>${state.reportRegion}</b></div></div><div class="button-row" style="margin:20px 0"><button class="primary" data-action="draft-report">生成报告草稿</button><button class="ghost" data-view-link="reports">调整分析口径 →</button></div><div class="insight">草稿会注明缺失数据，并可下载或打印。</div>`;
  case 'review':return `<h3>协议与条款检查</h3><p class="muted">粘贴一段出资协议或会议纪要。演示规则会找出日期、金额、基金名称和关键条款是否出现；结果仅供人工审阅。</p><textarea id="reviewText" placeholder="粘贴待检查的合同或会议纪要文字"></textarea><div class="button-row" style="margin-top:13px"><button class="ghost" data-action="sample-review">载入样例</button><button class="primary" data-action="review-document">检查文本</button></div><div id="reviewResult"></div>`;
  case 'industry':{const sectors=Object.entries(sourceFunds.reduce((m,f)=>(m[f.sector]=(m[f.sector]||0)+f.size,m),{})),total=sum(sourceFunds,'size');return `<h3>行业配置观察</h3><p class="muted">当前按 5 支虚构立项基金的“主要行业”归类，分母是基金总规模合计 ${num(total)} 亿元。</p>${sectors.map(([n,v])=>bar(n,v,total)).join('')}<div class="insight">这些标签用于初步整理；跨行业基金需要底层项目穿透后才能计算真实产业投资比例。目标阈值需在策略管理中配置。</div><button class="ghost" data-view-link="reports">查看完整策略报告 →</button>`}
  default:return `<h3>智能问数</h3><p class="muted">试着问基金总规模、申请出资、管理人、注册地、虚构资料来源或数据缺口。回答只使用当前内置的立项表样本。</p><div class="question-chips"><button data-question="这5支基金总规模是多少？">样本基金总规模？</button><button data-question="演示·青屿科创申请出资多少？">演示·澄岚科创基金申请出资？</button><button data-question="宝安区有哪些基金？">宝安区有哪些基金？</button><button data-question="基金实际出资和IRR是多少？">实际出资和 IRR？</button></div><div id="aiAnswer" class="chat-answer"><h4>可追溯回答</h4><p>输入问题后，会展示计算结果、公式或对应虚构资料行号。</p><span class="cite">数据范围：synthetic-public-demo-v1 第 1—5 行 · 2026-09-30</span></div><form id="askForm" class="ask-form"><input id="askInput" autocomplete="off" placeholder="输入自然语言问题…" aria-label="输入问题" /><button class="primary">提问 →</button></form>`}
}
function answerQuestion(q){const query=q.trim(),fund=sourceFunds.find(f=>query.includes(f.name)||(['峰瑞','英诺','仁智','力合','邦勤'].some(k=>query.includes(k)&&f.name.includes(k))));if(!query)return {title:'请输入问题',body:'可以询问基金总规模、申请出资、注册地、管理人或资料来源。'};if(/IRR|TVPI|DPI|RVPI|实缴|已投|收益率|退出/.test(query))return{title:'现有材料不足以回答',body:'虚构立项表只列示基金总规模和申请出资，未提供实际实缴、投资及回款现金流；无法计算 IRR、DPI、TVPI 等指标。',cite:'缺失字段说明 · synthetic-public-demo-v1'};if(fund){let body;if(/管理人|谁管理/.test(query))body=`${fund.name} 的管理人为 ${fund.manager}。`;else if(/规模/.test(query))body=`${fund.name} 的基金总规模为 ${num(fund.size,3)} 亿元。`;else if(/哪里|地区|注册|区域/.test(query))body=`立项表拟注册地为 ${fund.district}。这不等于资金归属区域。`;else if(/行业|方向/.test(query))body=`立项表列示的主要行业为“${fund.sector}”。`;else body=`${fund.name} 申请出资 ${num(fund.request,4)} 亿元，基金总规模 ${num(fund.size,3)} 亿元，申请占比 ${percent(fund.request,fund.size)}。`;return{title:'根据原始材料回答',body,cite:`synthetic-public-demo-v1 第 ${fund.row} 行`,file:fund.source}}if(/宝安|南山/.test(query)){const area=query.includes('宝安')?'宝安':'南山',rows=sourceFunds.filter(f=>f.district.includes(area));return{title:`${area}区样本基金`,body:rows.map(f=>`${f.name}（规模 ${num(f.size,3)} 亿）`).join('；')+'。拟注册地筛选不表示 LP 资金归属。',cite:`synthetic-public-demo-v1 第 ${rows.map(f=>f.id).join('、')} 行`,file:'synthetic-public-demo-v1'}}if(/总规模|合计|总额|多少支|申请出资/.test(query)){const size=sum(sourceFunds,'size'),req=sum(sourceFunds,'request');return{title:'五支立项基金样本',body:`共 ${sourceFunds.length} 支，总规模 ${num(size,3)} 亿元，申请出资合计 ${num(req,4)} 亿元；申请出资占总规模 ${percent(req,size)}。计算口径：5 行加总，申请出资 ≠ 实缴。`,cite:'synthetic-public-demo-v1 第 1—5 行',file:'synthetic-public-demo-v1'}}return{title:'当前样本未覆盖该问题',body:'请改问这 5 支样本基金的规模、申请出资、管理人、行业、拟注册地或来源。系统不会从缺失材料推断结论。',cite:'资料范围：synthetic-public-demo-v1 第 1—5 行'}}
function renderAnswer(q){const a=answerQuestion(q),el=document.getElementById('aiAnswer');if(el)el.innerHTML=`<h4>${escapeHTML(a.title)}</h4><p>${escapeHTML(a.body)}</p><span class="cite">${escapeHTML(a.cite||'')}</span>${a.file?sourceLink(a.file):''}`}
const sampleDocument=['数据属性：完全虚构演示','基金名称：'+sourceFunds[1].name,'基金管理人：'+sourceFunds[1].manager,'基金注册地：'+sourceFunds[1].place,'投资策略：'+sourceFunds[1].sector,'基金总规模：'+sourceFunds[1].size+'亿元','申请出资：'+sourceFunds[1].request+'亿元'].join('\n');
function matchOne(text,patterns){for(const re of patterns){const m=text.match(re);if(m)return m[1].trim()}return '未识别'}
function extractDocument(){const raw=document.getElementById('documentText')?.value||'',root=document.getElementById('documentResult');if(!raw.trim()){root.innerHTML='<div class="insight">请先粘贴或载入一段材料文字。</div>';return}const fields=[['基金名称',matchOne(raw,[/基金名称[：:]\s*([^\n；;]+)/])],['基金管理人',matchOne(raw,[/基金管理人[：:]\s*([^\n；;]+)/])],['拟注册地',matchOne(raw,[/(?:基金注册地|拟注册地)[：:]\s*([^\n；;]+)/])],['主要行业',matchOne(raw,[/(?:投资策略|主要行业)[：:]\s*([^\n；;]+)/])],['基金总规模',matchOne(raw,[/基金总规模[：:]\s*([\d.]+\s*(?:亿|万)元?)/])],['申请出资',matchOne(raw,[/申请出资[：:]\s*([\d.]+\s*(?:亿|万)元?)/])]];root.innerHTML=`<div class="insight">识别到 ${fields.filter(x=>x[1]!=='未识别').length}/6 个目标字段；仅使用表单文字规则匹配，仍需与原件逐项核对。</div>${table(['字段','识别结果','状态'],fields.map(([name,v])=>`<tr><td>${name}</td><td>${escapeHTML(v)}</td><td>${badge(v==='未识别'?'待补充':'待人工核对',v==='未识别'?'demo':'source')}</td></tr>`))}`}
function reviewDocument(){const raw=document.getElementById('reviewText')?.value||'',root=document.getElementById('reviewResult');if(!raw.trim()){root.innerHTML='<div class="insight">请先粘贴或载入待检查文本。</div>';return}const items=[['基金/主体名称',/基金|合伙企业|有限公司/.test(raw)],['出资金额',/\d+(?:\.\d+)?\s*(?:亿|万)元/.test(raw)],['出资时间或条件',/\d{4}[-年]\d{1,2}|出资期限|缴付条件/.test(raw)],['投资范围',/投资范围|投资方向|投资策略/.test(raw)],['决策程序',/投委会|投资决策|审批/.test(raw)],['退出或清算约定',/退出|清算/.test(raw)]];const numbers=[...raw.matchAll(/(?:出资金额|申请出资)[：:]?\s*(\d+(?:\.\d+)?)\s*亿元?/g)].map(x=>x[1]);const mismatch=new Set(numbers).size>1;root.innerHTML=`<div class="insight">规则检查发现 ${items.filter(x=>!x[1]).length} 类信息未出现${mismatch?'，且文本存在不同出资金额，请人工核对':'。未发现同一字段的明显数值冲突'}。未出现不等于合同缺陷，检查结果需人工复核。</div>${table(['检查项','结果'],items.map(([name,found])=>`<tr><td>${name}</td><td>${badge(found?'已找到线索':'未出现',found?'source':'demo')}</td></tr>`))}`}
renderers.projects=renderProjects;
function renderProjects(){host('projects').innerHTML=`${pageIntro('PROJECT WORKFLOW','项目管理','从资源池、核验、尽调、立项到投后跟踪的项目流程。','<button class="primary" data-view-link="resources">打开项目资源池 →</button>')}${note('演示资料中的企业先作为待核验线索；项目阶段、责任区域和日期使用独立演示记录。','demo')}<div class="stat-row">${stat('虚构资料企业线索',sourceProjects.length,'条','均待核验')}${stat('演示跟进项目',demoProjects.length,'条','与照片样本独立')}${stat('尽调中',1,'条','演示跟进')}${stat('可追溯来源',sourceProjects.length,'张/条','项目可回溯照片')}</div><div class="split">${card('项目跟进阶段',`<div class="timeline-item"><b>线索池 → 核验</b><p>确认企业名称、行业、拟投资关系和来源，避免照片识别错误。</p></div><div class="timeline-item"><b>尽调 → 立项</b><p>采集经营、财务、技术与合规材料，形成决策议题。</p></div><div class="timeline-item"><b>投资 → 投后</b><p>跟进拨付、投后报告、估值与退出计划。</p></div>`,'演示流程配置')}${card('最近跟进',table(['项目','阶段','更新时间'],demoProjects.map(p=>`<tr><td>${escapeHTML(p.name)}</td><td><span class="pill blue">${p.status}</span></td><td>${p.updated}</td></tr>`)),'情景演示记录')}</div>`}
renderers.hierarchy=renderHierarchy;
function renderHierarchy(){host('hierarchy').innerHTML=`${pageIntro('FUND LOOK-THROUGH','穿透视图','展示国家—区域—子基金—项目的管理层级和待确认关联。','<button class="primary" data-view-link="funds">查看基金样本</button>')}${note('国家母基金下设北京、上海、深圳三个区域来自业务设想；区域规模、子基金数量、项目数均为演示情景。演示资料仅说明部分基金拟注册深圳，不能据此确定其 LP 归属。','demo')}<div class="split">${card('基金层级示意',`<div class="tree-root"><strong>国家创业投资母基金</strong><span>战略层</span></div><div class="tree-children">${demoRegions.map(r=>`<div class="branch"><h4>${r.name}区域母基金 ${badge('情景','demo')}</h4><div class="branch-meta"><span>子基金 ${r.funds} 支</span><b>${num(r.size)} 亿</b></div><div class="progress"><i style="width:${100*r.paid/r.request}%"></i></div><div class="branch-meta"><span>项目 ${r.projects} 个</span><span>实缴/承诺 ${percent(r.paid,r.request)}</span></div></div>`).join('')}</div><div class="insight">区域 → 子基金的实际出资关系需要 LP 台账或协议确认。立项表样本暂放在待关联区。</div>`,'区域经营数据为演示情景')}${card('待关联立项基金',sourceFunds.map(f=>`<div class="task"><div><h4>${escapeHTML(f.name)}</h4><p>${escapeHTML(f.district)} · ${sourceLink(f.source,'第 '+f.id+' 行')} · LP 归属待核验</p></div><button class="link" data-fund="${f.id}" style="margin-left:auto">查看</button></div>`).join(''),'照片中的拟注册地不等于基金层级')}</div>`}
const approvalItems=[{id:'A01',title:'基金立项资料核验',detail:'核对深圳样本的名称、管理人和拟注册地',owner:'基金管理组',due:'2026-10-18'},{id:'A02',title:'项目资源池照片复核',detail:'复核演示资料中 5 家企业名称及行业',owner:'项目管理组',due:'2026-10-19'},{id:'A03',title:'财务台账接入评估',detail:'确认认缴、实缴、现金回款字段',owner:'财务管理组',due:'2026-10-21'}];
const completedApprovals=new Set();
renderers.approvals=renderApprovals;
renderers.operations=renderOperations;
function renderOperations(){host('operations').innerHTML=`${pageIntro('GOVERNANCE & COORDINATION','运营治理','追踪重点任务、决策节点和跨区域数据报送。')}${note('会议、期限、报送率等均为演示情景；此页用于展示领导层运营治理视图。','demo')}<div class="stat-row">${stat('重点任务',8,'项','跨区域与跨部门')}${stat('本周节点',3,'项','当前演示周')}${stat('报送完成率','82%','','情景示例')}${stat('需关注',2,'项','临近截止')}</div><div class="split">${card('重点任务',`<div class="kanban" style="padding:0;grid-template-columns:repeat(3,1fr)"><div class="kanban-col"><div class="kanban-head">待启动 <b>2</b></div><div class="kanban-item"><h4>核对虚构立项表</h4><p>投资管理部 · 10 月 18 日</p></div></div><div class="kanban-col"><div class="kanban-head">进行中 <b>4</b></div><div class="kanban-item"><h4>区域基金数据标准化</h4><p>运营管理部 · 10 月 21 日</p></div></div><div class="kanban-col"><div class="kanban-head">待协同 <b>2</b></div><div class="kanban-item"><h4>项目来源关系确认</h4><p>深圳区域 · 10 月 23 日</p></div></div></div>`,'按阶段归集')}${card('近期决策节点',`<div class="calendar"><div class="calendar-row"><div class="calendar-date"><b>18</b><span>十月</span></div><div><h4>立项材料核验</h4><p>基金管理组 · 演示</p></div></div><div class="calendar-row"><div class="calendar-date"><b>21</b><span>十月</span></div><div><h4>财务数据接入评审</h4><p>财务与数据组 · 演示</p></div></div><div class="calendar-row"><div class="calendar-date"><b>23</b><span>十月</span></div><div><h4>区域基金运营例会</h4><p>北京、上海、深圳 · 演示</p></div></div></div>`,'节点为 2026 年 10 月情景')}</div>`}
renderers.postinvest=renderPostinvest;
function renderPostinvest(){host('postinvest').innerHTML=`${pageIntro('PORTFOLIO MANAGEMENT','投后管理','基金与项目运营、财务报告、估值和退出进度的统一观察。','<button class="primary" data-view-link="reports">查看绩效报告 →</button>')}${note('虚构虚构样本没有逐笔投资、投后估值或季度报告。此页展示待接入字段与模拟工作流，绩效指标需真实财务数据。','demo')}<div class="stat-row">${stat('样本基金',sourceFunds.length,'支','虚构立项材料')}${stat('底层项目关联','未提供','','不能按拟注册地关联')}${stat('季度报告','待接入','','需投后报送')}${stat('估值/退出数据','待接入','','需估值与现金流水')}</div><div class="split">${card('投后报送清单',`<div class="readiness"><div class="field"><span>基金月报/季报</span><b>经营与财务情况</b></div><div class="field"><span>底层项目表</span><b>行业、地区、持股与投资金额</b></div><div class="field"><span>估值报告</span><b>估值基准日及方法</b></div><div class="field"><span>退出与分配</span><b>逐笔现金流日期</b></div></div><div class="insight">报送模板可按区域基金统一配置，字段缺失时提示负责人员核对。</div>`,'正式投后管理所需字段')}${card('投后工作流示意',`<div class="timeline-item"><b>发起数据报送</b><p>向子基金管理人收集定期报告及底层项目变动。</p></div><div class="timeline-item"><b>质量校验</b><p>检查日期、金额单位、项目重复与口径一致性。</p></div><div class="timeline-item"><b>形成风险闭环</b><p>将经营异常、逾期报送和重大事项关联到审批与风险预警。</p></div>`,'需要接入权限与消息系统后上线')}</div>`}
renderers.files=renderFiles;
function renderFiles(){host('files').innerHTML=`${pageIntro('DOCUMENT ARCHIVE','档案中心','公开版仅包含虚构样本与公开技术资源。')}${note('原始工作簿、照片、OCR与私有附件不包含在本演示中。','demo')}${card('公开样本文件',table(['文件','用途','数据属性'],[['source-data.js','深圳样本台账','独立生成、完全虚构'],['scenario-data.js','运营情景与关系','完全虚构']].map(([file,use,kind])=>`<tr><td>${escapeHTML(file)}</td><td>${use}</td><td>${kind}</td></tr>`)),'用户自行提交的材料只保存在其浏览器中')}`}
renderers.risks=renderRisks;
function renderRisks(){host('risks').innerHTML=`${pageIntro('RISK MONITORING','风险预警','从数据缺失、照片核验、审批超期与投后异常识别管理风险。','<button class="primary" data-action="ai-risk">✦ AI生成风险简报</button>')}${note('目前风险清单为数据质量与运营情景；风险等级仅用于展示流程，不代表真实基金或企业存在风险。','demo')}<div class="risk-grid">${stat('照片待核验',1,'支基金','第 5 行主体名称需确认')}${stat('缺少实缴数据',sourceFunds.length,'支基金','样本立项表未列示')}${stat('项目关系待确认',sourceProjects.length,'条线索','照片未说明对应基金')}</div>${card('风险与质量提醒',`<div class="risk-list"><div class="risk-item"><span class="severity mid">数据待核</span><div><h4>演示·远岫科创基金名称及管理人需复核</h4><p>演示资料局部不清晰 · ${sourceLink('synthetic-public-demo-v1','查看第 5 行')}</p></div><time>资料核验</time></div><div class="risk-item"><span class="severity mid">口径缺失</span><div><h4>基金实缴、拨付和回款字段未接入</h4><p>现阶段无法计算 DPI、TVPI、IRR</p></div><time>财务台账</time></div><div class="risk-item"><span class="severity low">关系待核</span><div><h4>底层项目与基金对应关系待业务确认</h4><p>虚构线索不可直接用于基金穿透统计</p></div><time>项目资源池</time></div></div>`,'按证据和数据缺口识别')}`}
const extraTasks=[];
function openTask(){openModal('新建跟踪事项',`<div class="form-stack"><label>事项名称<input id="taskTitle" placeholder="例如：核对出资协议" maxlength="80" /></label><label>关联对象<input id="taskObject" placeholder="基金或项目名称" maxlength="100" /></label><label>截止日期<input id="taskDue" type="date" value="2026-10-21" /></label><label>责任人<input id="taskOwner" value="演示用户" maxlength="30" /></label></div><div class="modal-foot"><button class="ghost" data-action="modal-close">取消</button><button class="primary" data-action="task-save">保存到本次演示</button></div>`,'本地演示 · 不发送消息')}
function saveTask(){const title=document.getElementById('taskTitle')?.value.trim();if(!title){document.getElementById('taskTitle')?.focus();showToast('请填写事项名称');return}extraTasks.push({id:'EX'+extraTasks.length,title,detail:document.getElementById('taskObject').value.trim()||'未关联对象',owner:document.getElementById('taskOwner').value.trim()||'待分派',due:document.getElementById('taskDue').value||'待定'});closeModal();renderApprovals();showToast('已加入本次演示待办')}
function renderApprovals(){const items=[...approvalItems,...extraTasks];host('approvals').innerHTML=`${pageIntro('DECISION CENTER','决策与审批','把待核验资料、决策议题和跨部门任务放进同一个可追踪队列。','<button class="primary" data-action="new-task">＋ 新建事项</button>')}${note('以下审批事项为演示任务，完成状态仅保留在当前页面会话中；不会向人员发送通知。','demo')}${card(`待我处理（${items.filter(x=>!completedApprovals.has(x.id)).length}）`,items.map(x=>`<div class="task"><button class="task-check ${completedApprovals.has(x.id)?'done':''}" data-approval="${x.id}" aria-label="${completedApprovals.has(x.id)?'恢复':'完成'}${escapeHTML(x.title)}">${completedApprovals.has(x.id)?'✓':''}</button><div><h4>${escapeHTML(x.title)}</h4><p>${escapeHTML(x.detail)} · ${escapeHTML(x.owner)}</p></div><time>${x.due}</time></div>`).join(''),'点击勾选以演示闭环')}`}
function action(name,button){switch(name){case 'fund-csv':download('虚构立项基金台账.csv',csv([['基金名称','基金管理人','拟注册地','主要行业','基金总规模（亿元）','申请出资（亿元）','虚构样本','行号','核验状态'],...sourceFunds.map(f=>[f.name,f.manager,f.district,f.sector,f.size,f.request,f.source,f.id,f.confidence])]),'text/csv;charset=utf-8');break;
  case 'manager-csv':download('样本管理人名单.csv',csv([['基金管理人','关联基金名称','基金总规模（亿元）','申请出资（亿元）','来源行'],...sourceFunds.map(f=>[f.manager,f.name,f.size,f.request,f.id])]),'text/csv;charset=utf-8');break;
  case 'cash-csv':download('演示现金计划.csv',csv([['日期','事项','类型','收支（亿元）','滚动余额（亿元）','口径'],...demoCash.map(x=>[x.date,x.name,x.kind,x.amount,x.balance,'演示情景'])]),'text/csv;charset=utf-8');break;
  case 'report-csv':reportExport();break;case 'draft-report':openDraft();break;case 'ai-risk':if(window.dxOpenRiskAI)dxOpenRiskAI();else showToast('请先打开增强版工作台');break;
  case 'draft-download':download('母基金数据报告草稿.md',document.getElementById('reportEditor')?.value||draftText(),'text/markdown;charset=utf-8');break;
  case 'draft-print':{const value=document.getElementById('reportEditor')?.value||draftText();document.getElementById('printBody').textContent=value;window.print();break}
  case 'new-task':openTask();break;case 'task-save':saveTask();break;case 'modal-close':closeModal();break;
  case 'new-resource':openNewResource();break;case 'save-resource':saveResource();break;case 'save-followup':saveFollowup(button.dataset.id);break;
  case 'sample-document':document.getElementById('documentText').value=sampleDocument;break;case 'clear-document':document.getElementById('documentText').value='';document.getElementById('documentResult').innerHTML='';break;case 'extract-document':extractDocument();break;
  case 'sample-review':document.getElementById('reviewText').value='数据属性：完全虚构。基金名称：'+sourceFunds[1].name+'。出资金额：'+sourceFunds[1].request+'亿元。出资期限：2026年12月。投资策略：'+sourceFunds[1].sector+'。退出安排另行约定。';break;case 'review-document':reviewDocument();break;
  default:showToast('该操作正在演示流程中')}
}
document.addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;if(button.closest('.nav')&&button.dataset.view){go(button.dataset.view);return}if(button.dataset.closeModal!==undefined)closeModal();if(button.dataset.viewLink){if(button.dataset.goForecast!==undefined){state.reportScope='demo';state.reportRegion='全部';state.reportTab='forecast'}go(button.dataset.viewLink);return}if(button.dataset.action){action(button.dataset.action,button);return}if(button.dataset.fund){state.fundModalTab='base';openFund(button.dataset.fund);return}if(button.dataset.project){openProject(button.dataset.project);return}if(button.dataset.followup){openFollowup(button.dataset.followup);return}if(button.dataset.fundTab){state.fundModalTab=button.dataset.fundTab;renderFundModal();return}if(button.dataset.reportTab){state.reportTab=button.dataset.reportTab;renderReports();return}if(button.dataset.aiTab){state.aiTab=button.dataset.aiTab;renderAI();return}if(button.dataset.question){document.getElementById('askInput').value=button.dataset.question;renderAnswer(button.dataset.question);return}if(button.dataset.approval){completedApprovals.has(button.dataset.approval)?completedApprovals.delete(button.dataset.approval):completedApprovals.add(button.dataset.approval);renderApprovals();return}if(button.id==='closeModal'||button.id==='cancelModal'){closeModal();return}if(button.id==='newFund'||button.id==='newMeeting'){openTask();return}if(button.id==='detailBtn'){go('funds');return}if(button.id==='riskExport'){state.reportScope='source';state.reportRegion='全部';state.reportTab='quality';go('reports');return}});
document.addEventListener('change',e=>{const x=e.target;switch(x.id){case 'fundDistrict':state.fundDistrict=x.value;document.getElementById('fundResults').innerHTML=fundResults(filteredFunds());break;case 'resourceSector':state.resourceSector=x.value;renderResources();break;case 'resourceStage':state.resourceStage=x.value;renderResources();break;case 'reportScope':state.reportScope=x.value;state.reportRegion='全部';renderReports();break;case 'reportRegion':state.reportRegion=x.value;renderReports();break}});
document.addEventListener('input',e=>{const x=e.target;if(x.id==='fundQuery'){state.fundQuery=x.value;document.getElementById('fundResults').innerHTML=fundResults(filteredFunds())}if(x.id==='resourceQuery'){state.resourceQuery=x.value;const value=x.value;renderResources();const input=document.getElementById('resourceQuery');input.focus();input.setSelectionRange(value.length,value.length)}if(x.id==='forecastRate'){state.forecastRate=Number(x.value)/100;document.getElementById('reportContent').innerHTML=forecastReport(reportRows());document.getElementById('forecastRate')?.focus()}});
document.addEventListener('submit',e=>{if(e.target.id==='askForm'){e.preventDefault();renderAnswer(document.getElementById('askInput').value)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
document.querySelector('.topbar .search').outerHTML='<input class="search" id="globalSearch" placeholder="⌕ 搜索基金、项目…" aria-label="全局搜索" />';
document.getElementById('globalSearch').addEventListener('keydown',e=>{if(e.key!=='Enter')return;const q=e.target.value.trim();if(!q)return;if(sourceFunds.some(f=>f.name.includes(q)||f.manager.includes(q))){state.fundQuery=q;go('funds')}else{state.resourceQuery=q;go('resources')}});
function renderDashboardHome(){const total=sum(sourceFunds,'size'),requested=sum(sourceFunds,'request'),root=host('dashboard');root.innerHTML=`${pageIntro('PORTFOLIO OVERVIEW','投资管理驾驶舱','看清基金立项、区域运营、项目线索与管理动作。','<button class="primary" data-action="new-task">＋ 新建跟踪事项</button>')}${note('演示资料截至 2026-09-30，仅列示基金立项样本；下方“虚构立项样本”指标来自独立生成器，“区域运营情景”仅用于展示未来系统形态。')}`+
  `<div class="quick-links"><button data-view-link="funds"><b>◫</b>基金档案</button><button data-view-link="resources"><b>⌕</b>项目资源池</button><button data-view-link="managers"><b>◈</b>管理人库</button><button data-view-link="cashflow"><b>≋</b>资金与现金流</button><button data-view-link="reports"><b>▤</b>数据报告</button><button data-view-link="ai"><b>✦</b>AI 能力</button></div>`+
  `<div class="stat-row">${stat('立项基金样本',sourceFunds.length,'支','虚构样本编号')}${stat('样本基金总规模',num(total,3),'亿元','虚构资料“基金总规模”加总')}${stat('申请出资合计',num(requested,4),'亿元','虚构资料“申请出资”加总')}${stat('项目虚构资料线索',sourceProjects.length,'条','企业名称仍需复核')}</div>`+
  `<div class="split">${card('基金立项样本',table(['基金','规模（亿）','申请出资（亿）','虚构资料'],sourceFunds.map(f=>`<tr><td><button class="link" data-fund="${f.id}">${escapeHTML(f.name)}</button></td><td>${num(f.size,3)}</td><td>${num(f.request,4)}</td><td>${sourceLink(f.source,'第 '+f.id+' 行')}</td></tr>`)),'虚构立项表 · 2026-09-30',`<button class="link" data-view-link="funds">全部基金 →</button>`)}${card('数据质量与管理动作',`<div class="timeline-item"><b>基金阶段与实缴金额</b><p>虚构样本未给出，等待工商、协议与财务台账。</p></div><div class="timeline-item"><b>项目与基金穿透关系</b><p>项目照片未指明投资来源，5 条企业线索待人工核验。</p></div><div class="timeline-item"><b>生成领导报告</b><p>数据报告可按原始样本或演示情景切换，支持导出与草稿编辑。</p></div><button class="ghost" data-view-link="reports">进入数据报告 →</button>`,'从可核验数据出发')}</div>`+
  `<div class="split">${card('区域运营情景',demoRegions.map(r=>bar(r.name+'区域',r.size,20)).join('')+`<div class="insight">北京、上海、深圳数据均为演示情景，与虚构资料中的深圳注册基金没有自动归属关系。</div>`,'规模单位：亿元 · 情景演示',`<button class="link" data-view-link="hierarchy">查看层级 →</button>`)}${card('近期管理任务',`<div class="tasks">${approvalItems.map(t=>`<div class="task"><div><h4>${escapeHTML(t.title)}</h4><p>${escapeHTML(t.owner)} · ${escapeHTML(t.due)}</p></div></div>`).join('')}</div>`,'演示事项 · 当前会话',`<button class="link" data-view-link="approvals">进入待办 →</button>`)}</div>`}
renderers.dashboard=renderDashboardHome;
renderDashboardHome();
