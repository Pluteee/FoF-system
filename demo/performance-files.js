'use strict';
// PDF.js fingerprints use the newer typed-array hex helper; support older webviews.
if(!Uint8Array.prototype.toHex)Object.defineProperty(Uint8Array.prototype,'toHex',{configurable:true,writable:true,value:function(){return Array.from(this,b=>b.toString(16).padStart(2,'0')).join('')}});
const pfLoads=new Map();
function pfScript(src){if(!pfLoads.has(src))pfLoads.set(src,new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>{pfLoads.delete(src);reject(Error('本机解析组件加载失败：'+src))};document.head.appendChild(s)}));return pfLoads.get(src)}
function pfXml(text){const doc=new DOMParser().parseFromString(text,'application/xml');if(doc.querySelector('parsererror'))throw Error('文档XML无法解析');return doc}
const pfNodes=(doc,name)=>[...doc.getElementsByTagNameNS('*',name)];
async function pfZip(file){await pfScript('vendor/jszip.min.js');const zip=await JSZip.loadAsync(await file.arrayBuffer());const entries=Object.values(zip.files);if(entries.length>3000||entries.some(e=>e._data?.uncompressedSize>10*1024*1024)||entries.reduce((n,e)=>n+(e._data?.uncompressedSize||0),0)>80*1024*1024)throw Error('压缩包展开体积或条目过多，请拆分文件');return zip}
async function pfExtract(file){
 if(file.size>20*1024*1024)throw Error('单个文件不得超过20MB');
 const ext=file.name.split('.').pop().toLowerCase();let text='',structured=null,parser='';
 if(['txt','md','csv','json'].includes(ext)){text=await file.text();parser=ext.toUpperCase()+'本机文本';if(ext==='json'){structured=JSON.parse(text);text=JSON.stringify(structured,null,2)}}
 else if(ext==='docx'){const zip=await pfZip(file),entry=zip.file('word/document.xml');if(!entry)throw Error('缺少Word正文；旧版DOC请转为DOCX');const doc=pfXml(await entry.async('string'));text=pfNodes(doc,'p').map((p,i)=>'[正文段落'+(i+1)+'] '+pfNodes(p,'t').map(t=>t.textContent).join('')).filter(x=>x.trim()).join('\n');parser='DOCX正文（含表格单元格段落，非分页/OCR）'}
 else if(ext==='xlsx'){
  const zip=await pfZip(file),sharedEntry=zip.file('xl/sharedStrings.xml'),shared=sharedEntry?pfNodes(pfXml(await sharedEntry.async('string')),'si').map(n=>pfNodes(n,'t').map(t=>t.textContent).join('')):[];
  const workbook=zip.file('xl/workbook.xml'),rels=zip.file('xl/_rels/workbook.xml.rels');if(!workbook||!rels)throw Error('缺少工作簿目录');
  const links=new Map(pfNodes(pfXml(await rels.async('string')),'Relationship').map(n=>[n.getAttribute('Id'),n.getAttribute('Target')]));
  const blocks=[];for(const sheet of pfNodes(pfXml(await workbook.async('string')),'sheet')){const rid=sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id'),target=links.get(rid);if(!target||target.includes('..')||/^https?:/i.test(target))continue;const entry=zip.file(target.startsWith('/')?target.slice(1):'xl/'+target.replace(/^\.\//,''));if(!entry)continue;const cells=pfNodes(pfXml(await entry.async('string')),'c');if(cells.length>30000)throw Error('单工作表单元格过多，请拆分');blocks.push(cells.map(c=>{const type=c.getAttribute('t'),v=pfNodes(c,'v')[0]?.textContent||'',value=type==='s'?shared[Number(v)]||'':type==='inlineStr'?pfNodes(c,'t').map(n=>n.textContent).join(''):v;return '['+sheet.getAttribute('name')+'!'+c.getAttribute('r')+'] '+value+(pfNodes(c,'f').length?'（公式缓存值，未执行公式）':'')}).join('\n'))}text=blocks.join('\n\n');parser='XLSX工作表/单元格文本；缓存值待核验'}
 else if(ext==='pdf'){
  await pfScript('vendor/pdfjs-worker-classic.js');await pfScript('vendor/pdfjs-classic.js');
  const task=PerformancePDF.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false,useSystemFonts:true,disableFontFace:true,isOffscreenCanvasSupported:false});task.onPassword=()=>task.destroy();let pdf;
  try{pdf=await task.promise;if(pdf.numPages>200)throw Error('PDF超过200页，请拆分');const pages=[];for(let page=1;page<=pdf.numPages;page++){const p=await pdf.getPage(page),content=await p.getTextContent();pages.push('[PDF第'+page+'页]\n'+content.items.map(i=>i.str+(i.hasEOL?'\n':' ')).join(''));p.cleanup()}text=pages.join('\n\n');parser='PDF可选中文字；未执行脚本，未做扫描件OCR'}finally{await pdf?.destroy()}
 }else throw Error('支持PDF、DOCX、XLSX、TXT、MD、CSV、JSON；旧版DOC/XLS请先转换');
 if(!text.trim())throw Error('未提取到可用文字；扫描件或图片请补充OCR文本/人工摘录');
 const truncated=text.length>300000;return {text:text.slice(0,300000),structured,parser,truncated};
}
