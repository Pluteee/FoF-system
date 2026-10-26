// Parser unit tests only: no browser automation, page access or network.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const JSZip=require('jszip'),{xml2js}=require('xml-js'),{PDFDocument,StandardFonts}=require('pdf-lib'),canvas=require('@napi-rs/canvas');
function wrap(n){return {textContent:n.type==='text'?n.text:(n.elements||[]).map(x=>wrap(x).textContent).join(''),getAttribute:k=>n.attributes?.[k]||'',getAttributeNS:(ns,k)=>n.attributes?.['r:'+k]||'',querySelector:()=>null,getElementsByTagNameNS(ns,k){const found=[];function walk(x){for(const c of x.elements||[]){if(c.name?.split(':').pop()===k)found.push(wrap(c));walk(c)}}walk(n);return found}}}
const ctx=vm.createContext({console,setTimeout,clearTimeout,structuredClone,URL,TextDecoder,TextEncoder,Uint8Array,ArrayBuffer,ReadableStream,TransformStream,AbortController,AbortSignal,MessageChannel,DOMMatrix:canvas.DOMMatrix,ImageData:canvas.ImageData,Path2D:canvas.Path2D,JSZip,DOMParser:class{parseFromString(s){return wrap(xml2js(s))}},location:{href:'file:///unit-test/'},document:{currentScript:{src:'file:///unit-test/vendor.js'}},navigator:{userAgent:'parser-unit-test',platform:'MacIntel'}});
vm.runInContext(fs.readFileSync(__dirname+'/performance-files.js','utf8'),ctx);
vm.runInContext(`pfScript=async src=>{if(!src.includes('jszip'))loadVendor(src)}`,ctx);
ctx.loadVendor=src=>vm.runInContext(fs.readFileSync(__dirname+'/'+src,'utf8'),ctx);
const extract=file=>{ctx.testFile=file;return vm.runInContext('pfExtract(testFile)',ctx)};
const file=(name,data)=>{const b=Buffer.isBuffer(data)?data:Buffer.from(data);return {name,size:b.length,text:async()=>b.toString(),arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.length)}};
(async()=>{
 assert.equal((await extract(file('a.txt','政策证据'))).text,'政策证据');
 assert.equal((await extract(file('a.json','{"year":2025}'))).structured.year,2025);
 await assert.rejects(()=>extract(file('a.json','{bad')));await assert.rejects(()=>extract(file('a.txt',' ')));
 await assert.rejects(()=>extract({name:'a.pdf',size:21*1024*1024}));
 const doc=new JSZip();doc.file('word/document.xml','<w:document xmlns:w="test"><w:p><w:r><w:t>证据正文</w:t></w:r></w:p><w:tbl><w:p><w:r><w:t>表格材料</w:t></w:r></w:p></w:tbl></w:document>');
 const dr=await extract(file('a.docx',await doc.generateAsync({type:'nodebuffer'})));assert.match(dr.text,/正文段落1.*证据正文/);assert.match(dr.text,/表格材料/);
 const book=new JSZip();book.file('xl/workbook.xml','<workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="绩效" r:id="r1"/></sheets></workbook>');book.file('xl/_rels/workbook.xml.rels','<Relationships><Relationship Id="r1" Target="worksheets/sheet1.xml"/></Relationships>');book.file('xl/sharedStrings.xml','<sst><si><t>实际出资</t></si></sst>');book.file('xl/worksheets/sheet1.xml','<worksheet><c r="A1" t="s"><v>0</v></c><c r="B1"><f>2+2</f><v>4</v></c></worksheet>');
 const br=await extract(file('a.xlsx',await book.generateAsync({type:'nodebuffer'})));assert.match(br.text,/绩效!A1.*实际出资/);assert.match(br.text,/绩效!B1.*4.*公式缓存值/);
 const pdf=await PDFDocument.create(),font=await pdf.embedFont(StandardFonts.Helvetica);pdf.addPage().drawText('Performance evidence 2025',{font,size:18,x:30,y:700});
 const pr=await extract(file('a.pdf',Buffer.from(await pdf.save())));assert.match(pr.text,/PDF第1页/);assert.match(pr.text,/Performance evidence 2025/);
 console.log('performance-files: TXT/JSON validation, size and empty guards, DOCX paragraphs/tables, XLSX addresses and cached formulas, classic PDF text extraction OK');
})().catch(e=>{console.error(e);process.exitCode=1});
