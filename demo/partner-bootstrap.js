'use strict';
// Keep every demo workspace on index.html so file:// browser storage has one page origin.
if(new URLSearchParams(window.location.search).get('workspace')==='partner'){
  state.view='partner';
  document.body.className='partner-workspace';
  const style=document.createElement('link');style.rel='stylesheet';style.href='partner-portal.css';document.head.appendChild(style);
  const extraStyle=document.createElement('link');extraStyle.rel='stylesheet';extraStyle.href='partner-portal-enhancements.css';document.head.appendChild(extraStyle);
  const override=document.createElement('style');override.textContent='.partner-workspace{background:#f1f5fa;color:#183857}';document.head.appendChild(override);
  document.body.innerHTML='<div class="pp-app"><aside class="pp-side"><div class="pp-brand"><img class="dili-mark" src="dili-mark.svg?v=20261026-brand" alt="" width="42" height="42"><div><b>DILI·FoF</b><small>分层协同工作台 · DEMO</small></div></div><nav id="ppNav"></nav><div class="pp-side-note">国家基金 → 区域母基金<br>→ 子基金 / 项目</div></aside><main class="pp-main"><header class="pp-top"><span id="ppCrumb">协同报送</span><span id="ppTopAction"></span></header><div class="pp-content" id="ppContent"></div></main></div>';
  const script=document.createElement('script');script.src='partner-portal.js?v=20261026-dili';document.body.appendChild(script);
}
