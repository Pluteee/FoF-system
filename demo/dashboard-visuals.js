'use strict';
const dvState={region:'shenzhen',large:false,mode:'network',motion:true};
let dvObserver,dvObserved;
function dvIcon(kind){const paths={shenzhen:'M4 21V9l6-5v17M14 21V4l6 5v12M2 21h20M7 11v2m10-2v2m-10 3v2m10-2v2',shanghai:'M12 2v3M9 5h6l2 3-5 3-5-3 2-3zM12 11v5M8 16h8l1 3H7l1-3zM10 19v3m4-3v3',beijing:'M3 11l9-7 9 7H3M5 14h14M7 14v7m5-7v7m5-7v7M3 21h18M7 7h10',region:'M5 21V8l7-4 7 4v13M3 21h18M9 9v2m6-2v2m-6 3v2m6-2v2m-6 3v2m6-2v2',fund:'M4 7l8-4 8 4-8 4-8-4zm0 5l8 4 8-4M4 17l8 4 8-4',project:'M8 3h8v4h5v10h-5v4H8v-4H3V7h5V3zm0 4h8v10H8V7z',enterprise:'M4 21V5h10v16M14 10h6v11M8 9h2m-2 4h2m-2 4h2M2 21h20',award:'M8 14l-2 7 6-3 6 3-2-7M17 8a5 5 0 11-10 0 5 5 0 0110 0z',capital:'M12 3v18M17 7c-1-3-10-3-10 1s10 3 10 7-9 4-11 1',link:'M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-2 2M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l2-2'};return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(paths[kind]||paths.region).split(/(?=M)/).map(d=>`<path d="${d}"/>`).join('')}</svg>`}
const dvTone=id=>({shenzhen:'#159b90',shanghai:'#397cc4',beijing:'#8968b8'}[id]||'#3b8da7');
function dvSummary(id){
 const funds=dxRegionFunds(id),deals=dxRegionDeals(id),ids=new Set(funds.map(f=>f.id));
 const paths=dxPaths.filter(p=>p.kind==='indirect'&&p.region===id&&ids.has(p.fundId));
 const indirect=new Set(paths.map(p=>p.enterprise.trim())),direct=new Set(deals.map(d=>dxDealCompany(d.name).trim()));
 return {funds,deals,paths,indirect,direct,combined:new Set([...indirect,...direct]),fundAmount:dxSum(funds,'request'),dealAmount:dxSum(deals,'request')};
}
function dvProgress(id){
 // Only a confirmed region report can establish actual investment. No request-to-investment inference.
 const record=typeof wbCurrent==='function'?wbCurrent('region',id):null;
 const fields=record?.confirmedSnapshot?.fields||record?.details?.fields;
 const raw=fields?.ytdInvestment,investment=raw!==''&&raw!=null&&Number.isFinite(Number(raw))&&Number(raw)>=0?Number(raw):null;
 let prospects=null;
 try{const raw=localStorage.getItem('diki-public-workflow-prospects-v1');if(raw!==null){const all=JSON.parse(raw);if(Array.isArray(all))prospects=all.filter(x=>x.scope==='region:'+id)}}catch{}
 const active=prospects?.filter(x=>!['暂缓','终止'].includes(x.stage));
 const advancing=active?.filter(x=>['立项','尽调','投决准备','决策通过'].includes(x.stage));
 const reserve=active?.filter(x=>['接洽中','初筛评估'].includes(x.stage));
 return {investment,period:record?.period||'',advancing:advancing?.length??null,reserve:reserve?.length??null};
}
function dvTree(){return dvState.mode==='network'&&typeof dvNetwork==='function'?dvNetwork():dvHierarchy()} function dvHierarchy(){
 const r=dxRegion(dvState.region)||dxRegions[0],s=dvSummary(r.id);
 const profiles=dxRegions.map(r=>dxRegionProfile(r.id)),commit=dxSum(profiles,'commitment'),paid=dxSum(profiles,'paid');
 const amount=(value)=>value===null?'待补充':value+' 项';
 requestAnimationFrame(dvDraw);
 return `<section class="dv-tree dv-summary-tree ${dvState.large?'dv-tree-large':''}" aria-label="四级投资汇总穿透图">
  <header class="dv-tree-header"><div><span>CAPITAL TREE / 投资穿透</span><h2>一张图，看清资金与项目布局</h2></div><div><button data-dv-action="mode" aria-label="切换至地图网络视图">地图网络 ⇄</button><button data-dv-action="large" aria-label="${dvState.large?'退出放大':'放大树图'}">${dvState.large?'退出放大 ↙':'放大查看 ⤢'}</button><button data-dx-action="dashboard-capital">完整资金穿透 ↗</button></div></header>
  <div class="dv-tree-layout"><svg class="dv-tree-lines" aria-hidden="true"></svg>
   <div class="dv-root dv-node" data-dv-node="national">
    <div class="dv-root-title">${dvIcon('region')}<div><small>01 · 国家母基金</small><h3>国家创投母基金</h3></div><span class="dv-source">资金演示</span></div>
    <div class="dv-root-metrics"><span>区域基金目标合计<b>${dxMoney(dxRegions.length*500,0)}</b><small>亿元</small></span><span>国家基金认缴<b>${dxMoney(commit,0)}</b><small>亿元</small></span><span>国家基金实缴<b>${dxMoney(paid,0)}</b><small>亿元 · 实缴率 ${dxPct(paid,commit)}%</small></span></div>
    <div class="dv-national-layout"><span>${dvIcon('fund')}<b>${dxFunds.length}</b> 支子基金 <small>申请 / 拟出资 ${dxMoney(dxSum(dxFunds,'request'))} 亿</small></span><span>${dvIcon('project')}<b>${dxDeals.length}</b> 笔直投 <small>申请 / 拟出资 ${dxMoney(dxSum(dxDeals,'request'))} 亿</small></span></div>
   </div>
   <div class="dv-region-row">${dxRegions.map(region=>{const p=dxRegionProfile(region.id),v=dvProgress(region.id);return `<button class="dv-region dv-node ${region.id===r.id?'selected':''}" style="--dv-tone:${dvTone(region.id)}" data-dv-action="region" data-id="${region.id}" data-dv-node="region-${region.id}" data-dv-parent="national" aria-pressed="${region.id===r.id}"><span class="dv-node-eyebrow">02 · 区域母基金</span><strong>${region.city}</strong><span>${region.short}</span><small>实缴 ${dxMoney(p.paid,0)} / 认缴 ${dxMoney(p.commitment,0)} 亿 · 演示</small><div class="dv-region-progress"><span>已投金额<b>${v.investment===null?'待核实':dxMoney(v.investment)+' 亿'}</b><i>${v.investment===null?'演示样本未提供实际投资':dxE(v.period)+' 年内累计 · 已确认'}</i></span><span>推进中<b>${amount(v.advancing)}</b></span><span>储备中<b>${amount(v.reserve)}</b></span></div><em>${region.id===r.id?'当前区域 ↓':'展开区域 ↓'}</em></button>`}).join('')}</div>
   <div class="dv-focus-label" style="--dv-tone:${dvTone(r.id)}"><i></i>${r.city}区域 · 下方为区域汇总，不展开具体基金和企业名称</div>
   <div class="dv-branch-row" style="--dv-tone:${dvTone(r.id)}">
    <div class="dv-fund-branch">
     <button class="dv-aggregate dv-node" data-dv-node="fund" data-dv-parent="region-${r.id}" data-dx-action="compare-funds" data-id="${r.id}">
      <span class="dv-aggregate-heading">${dvIcon('fund')}03 · 子基金 <i>查看清单 ↗</i></span><strong>${s.funds.length}<small>支</small></strong><div class="dv-aggregate-money"><span>申请 / 拟出资<b>${dxMoney(s.fundAmount)}<small>亿</small></b></span><span>目标规模合计<b>${dxMoney(dxSum(s.funds,'size'))}<small>亿</small></b></span></div>
     </button>
     <button class="dv-bottom-summary dv-node" data-dv-node="fund-bottom" data-dv-parent="fund" data-dv-action="lookthrough" data-id="${r.id}">
      <span>${dvIcon('enterprise')}04 · 穿透后投资项目</span><strong>${s.indirect.size}<small>家企业</small></strong><p>${s.paths.length} 条子基金投资路径 · 企业去重</p><small>${s.paths.length?'演示关系 + 已确认报送；无关系档案未推算补齐':'尚无底层投资关系，不能由基金申请额推算'}</small><em>查看完整穿透明细 ↗</em>
     </button>
    </div>
    <div class="dv-direct-branch">
     <button class="dv-aggregate dv-aggregate-direct dv-node" data-dv-node="deal" data-dv-parent="region-${r.id}" data-dx-action="compare-deals" data-id="${r.id}">
      <span class="dv-aggregate-heading">${dvIcon('project')}03 · 直投项目 <i>查看清单 ↗</i></span><strong>${s.deals.length}<small>笔</small></strong><div class="dv-aggregate-money"><span>申请 / 拟出资<b>${dxMoney(s.dealAmount)}<small>亿</small></b></span><span>申报融资规模<b>${dxMoney(dxSum(s.deals,'round'))}<small>亿</small></b></span></div>
     </button>
     <button class="dv-bottom-summary dv-bottom-direct dv-node" data-dv-node="direct-bottom" data-dv-parent="deal" data-dx-action="compare-deals" data-id="${r.id}">
      <span>${dvIcon('enterprise')}直投标的企业</span><strong>${s.direct.size}<small>家企业</small></strong><p>多轮申报按企业去重</p><small>直投直接到企业，不额外虚构一层基金；申请不代表交割。</small><em>查看直投标的明细 ↗</em>
     </button>
    </div>
   </div>
   <div class="dv-bottom-total">${dvIcon('link')}<span>${r.city}区域企业覆盖 <b>${s.combined.size}</b> 家<small>子基金穿透企业与直投申报标的合并去重，不等于全部已投资。</small></span></div>
  </div>
  <footer class="dv-tree-footer"><span>连线表示层级关系，不表示金额按比例流转；申请 / 拟出资不等于已投或实缴。</span><details><summary>进度与项目统计口径</summary><p>已投金额仅取区域最新已确认报送中的年初累计投资；尚无数据标为待核实。推进中取本机区域储备台账的立项、尽调、投决准备、决策通过；储备中取接洽中、初筛评估，包含基金、企业与管理人机会。未建立台账显示待补充，已建立的空台账显示0。两类过程记录不与正式基金/项目档案相加。</p></details></footer>
 </section>`;
}
function dvDraw(){const layout=document.querySelector('.dv-tree-layout');if(!layout){dvObserver?.disconnect();dvObserved=null;return}if(dvObserved!==layout){dvObserver?.disconnect();dvObserved=layout;dvObserver=new ResizeObserver(dvDraw);dvObserver.observe(layout)}const svg=layout.querySelector('.dv-tree-lines'),box=layout.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);svg.style.height=box.height+'px';svg.innerHTML='<defs><filter id="dvLineGlow"><feGaussianBlur stdDeviation="2"/></filter></defs>';for(const node of layout.querySelectorAll('[data-dv-parent]')){const parent=layout.querySelector(`[data-dv-node="${node.dataset.dvParent}"]`);if(!parent)continue;const a=parent.getBoundingClientRect(),b=node.getBoundingClientRect(),sx=a.left+a.width/2-box.left,sy=a.bottom-box.top;let ex=b.left+b.width/2-box.left,ey=b.top-box.top,curve=Math.max(20,(ey-sy)*.55),path=`M${sx},${sy} C${sx},${sy+curve} ${ex},${ey-curve} ${ex},${ey}`;if(node.dataset.dvParent==='fund'){ex=b.left-box.left;ey=b.top+b.height/2-box.top;const gutter=a.left-box.left+7;path=`M${sx},${sy} V${sy+13} Q${sx},${sy+23} ${sx-12},${sy+23} H${gutter+10} Q${gutter},${sy+23} ${gutter},${sy+33} V${ey-9} Q${gutter},${ey} ${gutter+9},${ey} H${ex}`}else if(b.top-a.bottom>350){ex=b.right-box.left;ey=b.top+b.height/2-box.top;const gutter=box.width-4;path=`M${sx},${sy} C${sx},${sy+28} ${gutter},${sy+28} ${gutter},${sy+60} V${ey-12} Q${gutter},${ey} ${gutter-12},${ey} H${ex}`}const color=getComputedStyle(node).getPropertyValue('--dv-tone').trim()||dvTone(dvState.region);svg.insertAdjacentHTML('beforeend',`<path d="${path}" stroke="${color}" class="dv-line-halo"/><path d="${path}" stroke="${color}" class="dv-line"/><circle cx="${ex}" cy="${ey}" r="3" fill="${color}"/>`)}}
function dvRefresh(){const old=document.querySelector('.dv-tree');if(old){old.outerHTML=dvTree();requestAnimationFrame(dvDraw)}}
document.addEventListener('click',event=>{const button=event.target.closest('[data-dv-action]');if(!button){if(event.target.closest('.dv-tree [data-dx-action]'))dvState.large=false;return}if(button.dataset.dvAction==='lookthrough'){dvState.large=false;Object.assign(dx,{lookRegion:button.dataset.id,lookPage:1,lookTab:'enterprise',enterprise:null,lookQuery:'',lookSector:'全部',lookMode:'all'});go('lookthrough');return}if(button.dataset.dvAction==='region'&&dxRegions.some(r=>r.id===button.dataset.id))dvState.region=button.dataset.id;if(button.dataset.dvAction==='mode')dvState.mode=dvState.mode==='network'?'hierarchy':'network';if(button.dataset.dvAction==='motion')dvState.motion=!dvState.motion;if(button.dataset.dvAction==='large')dvState.large=!dvState.large;dvRefresh();const action=button.dataset.dvAction;document.querySelector(action==='region'?`.dv-tree [data-dv-action=region][data-id="${dvState.region}"]`:`.dv-tree [data-dv-action="${action}"]`)?.focus({preventScroll:true})});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&dvState.large){dvState.large=false;dvRefresh()}});

function dvComparisonData(){return dxRegions.map(r=>{const funds=dxRegionFunds(r.id),deals=dxRegionDeals(r.id);return {r,p:dxRegionProfile(r.id),funds,deals,fundAmount:dxSum(funds,'request'),dealAmount:dxSum(deals,'request'),cities:dxGeoGroups(funds),sectors:dxCountGroups(funds,f=>dxIndustry(f.sector))}})}
function dvLeaders(rows,value){const eligible=rows.filter(x=>Number.isFinite(value(x))),max=Math.max(...eligible.map(value),0);return {value:max,rows:max>0?eligible.filter(x=>Math.abs(value(x)-max)<1e-8):[]}}
function dvRegionFacts(x){const description=(groups,kind)=>{if(!groups.length)return '暂无'+kind+'数据';const max=groups[0][1],leaders=groups.filter(g=>g[1]===max),allTied=leaders.length===groups.length;if(allTied&&groups.length>1)return `${kind}覆盖 <b>${groups.length} ${kind==='产业'?'类':'城'}</b>，各 ${max} 支`;return `${kind==='产业'?'主要产业':'拟注册地覆盖 '+groups.length+' 城，最多城市'}：<b>${dxE(leaders.map(g=>g[0]).join('、'))}</b>（${max} 支${leaders.length>1?'，并列':''}）`};return `<p>${dvIcon('fund')}<span>${description(x.sectors,'产业')}</span></p><p>${dvIcon('region')}<span>${description(x.cities,'注册地')}</span></p>`}
function dvComparison(){const rows=dvComparisonData(),fundLeader=dvLeaders(rows,x=>x.funds.length),dealLeader=dvLeaders(rows,x=>x.dealAmount),avgLeader=dvLeaders(rows,x=>x.funds.length?x.fundAmount/x.funds.length:NaN),cityNames=result=>result.rows.map(x=>x.r.city).join('、')||'暂无数据',funds=dxFunds.length,deals=dxDeals.length,paid=dxSum(rows.map(x=>x.p),'paid'),commit=dxSum(rows.map(x=>x.p),'commitment');
 const insight=(icon,title,result,unit,desc)=>`<article>${dvIcon(icon)}<div><span>${title}${result.rows.length>1?' · 并列':''}</span><b>${dxE(cityNames(result))} <em>${Number(result.value).toLocaleString('zh-CN',{maximumFractionDigits:unit==='支'?0:2})}<small>${unit}</small></em></b><p>${desc}</p></div></article>`;
 return dxPanel('区域比较',`<div class="dv-insights">${insight('fund','子基金数量最多',fundLeader,'支',`按档案数量比较；最多区域占三地 ${dxPct(fundLeader.value,funds)}%`)}${insight('capital','直投申请 / 拟出资最高',dealLeader,'亿','申请记录金额合计，不是实际已投资金')}${insight('award','子基金单支申请均额最高',avgLeader,'亿','区域申请 / 拟出资 ÷ 子基金数量')}</div><div class="dv-compare-cards">${rows.map(x=>{const dominant=x.sectors[0],leading=x.cities[0],countLeader=fundLeader.rows.includes(x);return `<article class="dv-compare-card ${x.r.tone}"><header><span class="dv-city-symbol">${dvIcon(x.r.id)}</span><button data-dx-action="open-region" data-id="${x.r.id}"><b>${x.r.city}</b><small>${x.r.short} ↗</small></button>${countLeader?'<span class="dv-rank">子基金数量最多</span>':''}</header><div class="dv-paid-row"><span>国家基金实缴 / 认缴 · 演示</span><b>${dxMoney(x.p.paid,0)} <small>/ ${dxMoney(x.p.commitment,0)} 亿</small></b><i><em style="width:${Math.min(100,dxPct(x.p.paid,x.p.commitment))}%"></em></i><small>实缴率 ${dxPct(x.p.paid,x.p.commitment)}%</small></div><div class="dv-counts"><button data-dx-action="compare-funds" data-id="${x.r.id}">${dvIcon('fund')}<span><b>${x.funds.length}<small>支</small></b>子基金</span></button><button data-dx-action="compare-deals" data-id="${x.r.id}">${dvIcon('project')}<span><b>${x.deals.length}<small>笔</small></b>直投记录</span></button></div><div class="dv-averages"><span>基金均额 <b>${x.funds.length?dxMoney(x.fundAmount/x.funds.length):'—'} 亿</b></span><span>直投均额 <b>${x.deals.length?dxMoney(x.dealAmount/x.deals.length):'—'} 亿</b></span></div><div class="dv-region-facts">${dvRegionFacts(x)}</div>${typeof siCards==='function'?siCards(x.r.id):''}</article>`}).join('')}</div><p class="dv-compare-note">结论按当前档案数量与申请 / 拟出资口径计算。深圳为虚构样本，上海、北京为演示情景；不构成经营绩效排名。</p>`,'数量、资金、产业与地域 · 数据结论随当前台账重算').replace('<section class="dx-panel">','<section class="dx-panel dv-comparison-panel">');
}
