'use strict';
// Region-level object-first analysis; no mixing fund counts, application records and unique enterprises.
const raState={region:'',object:'combined',dimension:'industry'};
const raObjects={fund:'子基金',direct:'直投项目',combined:'子基金＋直投项目'};
function raDimensions(object=raState.object){return [['industry','产业布局'],['geography','注册地分布'],['stage','推进阶段'],...(object!=='direct'?[['activity','投资活跃度']]:[])]}
function raSelect(object,dimension){if(!raObjects[object])return false;raState.object=object;raState.dimension=raDimensions(object).some(([id])=>id===dimension)?dimension:'industry';return true}
function raChart(object,dimension){const funds=dxRegionFunds(dx.region),deals=dxRegionDeals(dx.region),fund=object==='fund',rows=fund?funds:deals;
 if(dimension==='industry')return dxPanel(fund?'子基金产业布局':'直投产业分布',dxBarList(dxIndustryGroups(rows),fund?'region-fund-industry':'region-industry','money'),'行业归并 · 申请 / 拟出资额');
 if(dimension==='geography')return dxPanel(fund?'子基金拟注册地分布':'直投城市分布',dxBarList(dxGeoGroups(rows),fund?'region-fund-geo':'region-geo',fund?'fund-count':'count'),fund?'基金拟注册城市 · 按基金档案计数':'企业注册城市 · 按直投申报记录计数');
 return dxPanel(fund?'子基金推进阶段分布':'直投项目推进阶段分布',dxBarList(dxCountGroups(rows,fund?dxFundStage:d=>dxDealMeta(d).stage),fund?'region-fund-stage':'region-deal-stage',fund?'fund-count':'count'),'当前档案推进阶段，不等于实际交割状态');
}
function raBody(){const {object,dimension}=raState;
 if(dimension==='activity')return `<div class="dx-card-grid two">${dxPanel('近六个月投资活跃度',dxRegionActivityTrend(),'子基金新增投资路径 · 非直投记录')}${dxPanel('近期活跃子基金',dxRegionActiveFunds(),'近 30 天新增投资 · 点击查看项目')}</div>`;
 if(object==='combined')return `<div class="dx-card-grid two">${raChart('fund',dimension)}${raChart('direct',dimension)}</div>`;
 if(object==='fund'&&dimension==='industry')return `<div class="dx-card-grid two">${raChart('fund',dimension)}${dxPanel('子基金投资项目产业分布',dxRegionProjectIndustry(),'本区域子基金穿透企业去重 · 与基金申请额分开统计')}</div>`;
 return raChart(object,dimension);
}
function raDashboard(){if(raState.region!==dx.region){raState.region=dx.region;raSelect('combined','industry')}return `<section id="regionAnalysis" class="ra-analysis"><header class="ra-heading"><h2>区域投资组合分析</h2><p>按对象集中查看产业、注册地、推进阶段及投资活跃度。</p></header>${dxPanel('拟出资流向',dxRegionAllocation(),'子基金 / 直投 · 申请与拟出资，不代表实际已投')}<nav class="ra-objects" role="tablist" aria-label="区域统计对象">${Object.entries(raObjects).map(([id,label])=>`<button type="button" role="tab" data-ra-object="${id}" aria-controls="raAnalysisContent" aria-selected="${raState.object===id}" class="${raState.object===id?'active':''}">${label}</button>`).join('')}</nav><div class="ra-dimensions" role="group" aria-label="区域分析维度">${raDimensions().map(([id,label])=>`<button type="button" data-ra-dimension="${id}" aria-pressed="${raState.dimension===id}" class="${raState.dimension===id?'active':''}">${label}</button>`).join('')}</div><p class="ra-note">${raState.object==='combined'?'子基金与直投项目分别统计，不混加基金支数与直投笔数；拟出资流向仅合计同单位的申请金额。':raState.object==='fund'?'基金按档案计数；穿透企业按企业主体去重，二者不混用。':'直投按申报记录计数，多轮融资可能对应同一企业；申请不等于交割。'}</p><div id="raAnalysisContent" role="region" aria-label="${raObjects[raState.object]} · ${raDimensions().find(([id])=>id===raState.dimension)[1]}">${raBody()}</div></section>`}
document.addEventListener('click',event=>{const b=event.target.closest('[data-ra-object],[data-ra-dimension]');if(!b)return;if(!raSelect(b.dataset.raObject||raState.object,b.dataset.raDimension||raState.dimension))return;const old=document.getElementById('regionAnalysis');if(old)old.outerHTML=raDashboard();document.querySelector(b.dataset.raObject?`[data-ra-object="${raState.object}"]`:`[data-ra-dimension="${raState.dimension}"]`)?.focus({preventScroll:true})});
