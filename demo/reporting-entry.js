'use strict';
const entryParams=new URLSearchParams(window.location.search);
const entryType=entryParams.get('type');
const entryTarget=entryParams.get('target');
const entryPeriod=entryParams.get('period');
const entryRegions={shenzhen:{city:'深圳',name:'粤港澳大湾区创业投资引导基金'},shanghai:{city:'上海',name:'长三角创业投资引导基金'},beijing:{city:'北京',name:'京津冀创业投资引导基金'}};
const entryFund=[...sourceWorkbook.funds,...demoScenario.funds].find(f=>f.id===entryTarget);
const entryValidPeriod=['2026-Q3','2026-Q4','2026-Y'].includes(entryPeriod);
const entryValid=(entryType==='region'&&entryRegions[entryTarget]||entryType==='fund'&&entryFund)&&entryValidPeriod;
const entryEscape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const entryHost=document.getElementById('entryContent');
if(!entryValid){
  entryHost.innerHTML='<span class="entry-kicker">INVITATION / DEMO</span><h1>填报链接不完整</h1><p>请从主系统「协同填报」生成对应机构和报告期的链接。</p><div class="entry-actions" style="margin-top:25px"><a class="entry-secondary" href="index.html">返回主系统 ↗</a></div>';
}else{
  const targetName=entryType==='region'?entryRegions[entryTarget].name:entryFund.name;
  const upstream=entryType==='region'?'国家基金':'所属区域母基金';
  const role=entryType==='region'?'区域母基金':'子基金管理人';
  const destination=new URL('index.html',window.location.href);
  destination.search=new URLSearchParams({workspace:'partner',role:entryType,target:entryTarget,period:entryPeriod}).toString();
  entryHost.innerHTML=`<span class="entry-kicker">REPORTING INVITATION / DEMO</span><h1>${role}工作台入口</h1><p>本入口将报送对象与报告期带入独立工作台，提交后由${upstream}审核。</p><div class="entry-target"><span>本次填报对象</span><b>${entryEscape(targetName)}</b><small>${entryEscape(entryPeriod)} · ${entryType==='region'?'区域基金报告':'子基金报告'}</small></div><div class="entry-steps"><div><strong>01</strong>确认对象与报告期</div><div><strong>02</strong>在专属工作台填报</div><div><strong>03</strong>上级审核；退回修改或形成确认版本</div></div><div class="entry-actions"><a class="entry-primary" href="${entryEscape(destination.href)}">进入独立工作台 ↗</a><a class="entry-secondary" href="index.html">返回主系统</a></div><p class="entry-warning">演示链接不验证接收人身份；请勿填入真实敏感资料。跨机构使用时必须部署线上服务、登录授权和共享数据库。</p>`;
}
