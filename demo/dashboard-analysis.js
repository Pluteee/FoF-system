'use strict';
// One object and one dimension at a time; keep enterprise and application populations separate.
const daState={object:'enterprise',dimension:'round'};
const daObjects={
 fund:{name:'子基金',dimensions:[['industry','产业布局'],['geography','注册地域'],['stage','推进阶段']]},
 direct:{name:'直投项目',dimensions:[['industry','产业布局'],['geography','注册地域'],['stage','推进阶段'],['round','融资轮次']]},
 enterprise:{name:'底层企业',dimensions:[['round','融资轮次'],['valuation','估值区间']]}
};
function daSelect(object,dimension){
 if(!daObjects[object])return false;
 const dimensions=daObjects[object].dimensions;
 daState.object=object;daState.dimension=dimensions.some(([id])=>id===dimension)?dimension:dimensions[0][0];
 return true;
}
function daGeography(object){
 const mode=object==='fund'?'fund':'direct',unit=object==='fund'?'支':'笔';
 return dxPanel(daObjects[object].name+'注册地分布',`<div class="dx-geo-dashboard">${dxRegions.map(r=>{const rows=dxDashboardGeoRows(r.id,mode),groups=dxGeoGroups(rows),max=Math.max(1,...groups.map(x=>x[1]));return `<div class="dx-geo-block"><div class="dx-geo-block-head"><button data-dx-action="open-region" data-id="${r.id}">${r.city}区域 ↗</button><span>${rows.length} ${unit}</span></div>${groups.map(([city,n])=>`<button class="dx-geo-city" data-dx-action="${object==='fund'?'dashboard-fund-city':'dashboard-city'}" data-id="${r.id}" data-value="${dxE(city)}"><span>${dxE(city)}</span><div><i style="width:${n/max*100}%"></i></div><b>${n} ${unit}</b></button>`).join('')||'<p>暂无注册地记录</p>'}</div>`}).join('')}</div>`,'同一对象、同一注册地口径 · 按申报档案计数');
}
function daBody(){
 const {object,dimension}=daState;
 if(object==='enterprise'){bpState.dimension=dimension;return bpDashboard({dimension,embedded:true})}
 if(dimension==='geography')return `${object==='fund'?dxPanel('子基金区域分布',dxColumnChart('fund'),'数量与单支平均拟出资'):''}${daGeography(object)}`;
 const kind=object==='fund'?'fund':'deal',name=daObjects[object].name;
 if(dimension==='industry')return dxPanel(name+'产业布局',dxRegionMatrix(kind,x=>dxIndustry(x.sector)),'三地与总体 · 同一产业分类口径');
 if(dimension==='stage')return dxPanel(name+'推进阶段',dxRegionMatrix(kind,object==='fund'?dxFundStage:x=>dxDealMeta(x).stage),'三地与总体 · 阶段为演示字段，不代表实际交割状态');
 return dxPanel('直投项目融资轮次分布',dxRegionMatrix('deal',dxDealRound),'直投申报记录口径 · 轮次为演示字段，不与底层企业去重口径混合');
}
function daDashboard(){
 const object=daObjects[daState.object];
 return `<section id="dashboardAnalysis" class="da-analysis"><header class="da-heading"><span>PORTFOLIO ANALYSIS / 投资组合分析</span><h2>按对象，看清组合结构</h2><p>先选择分析对象，再选择分析维度；每次只展示当前对象下的内容。</p></header><nav class="da-objects" role="tablist" aria-label="分析对象">${Object.entries(daObjects).map(([id,x])=>`<button role="tab" data-da-object="${id}" aria-selected="${id===daState.object}" aria-controls="daAnalysisContent" class="${id===daState.object?'active':''}">${typeof dvIcon==='function'?dvIcon(id==='fund'?'fund':id==='direct'?'project':'enterprise'):''}${x.name}</button>`).join('')}</nav><div class="da-dimensions" role="group" aria-label="${object.name}分析维度"><span>分析维度</span>${object.dimensions.map(([id,label])=>`<button data-da-dimension="${id}" aria-pressed="${id===daState.dimension}" class="${id===daState.dimension?'active':''}">${label}</button>`).join('')}</div><div id="daAnalysisContent" role="region" aria-label="${object.name} · ${object.dimensions.find(([id])=>id===daState.dimension)[1]}">${daBody()}</div></section>`;
}
function daRefresh(){const el=document.getElementById('dashboardAnalysis');if(el)el.outerHTML=daDashboard()}
document.addEventListener('click',event=>{
 const b=event.target.closest('[data-da-object],[data-da-dimension]');if(!b)return;
 const prior=daState.object,next=b.dataset.daObject||daState.object;
 if(!daSelect(next,b.dataset.daDimension||daState.dimension))return;
 if(prior!==next||next==='enterprise'){bpState.region='all';bpState.bucket='all';bpState.page=1}
 daRefresh();
 document.querySelector(b.dataset.daObject?`[data-da-object="${next}"]`:`[data-da-dimension="${daState.dimension}"]`)?.focus({preventScroll:true});
});
