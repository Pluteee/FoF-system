// Reproducible local adaptation of bundled, unmodified-in-substance vendor distributions.
// Classic scripts support the existing file:// demo without module-fetch/CORS requirements.
const fs=require('node:fs'),path=require('node:path');
const out=path.join(__dirname,'vendor');fs.mkdirSync(out,{recursive:true});
fs.copyFileSync(require.resolve('jszip/dist/jszip.min.js'),path.join(out,'jszip.min.js'));
fs.copyFileSync(require.resolve('jszip/LICENSE.markdown'),path.join(out,'jszip.LICENSE.md'));
const root=path.dirname(require.resolve('pdfjs-dist/package.json'));
for(const [source,dest,worker] of [['build/pdf.min.mjs','pdfjs-classic.js',false],['build/pdf.worker.min.mjs','pdfjs-worker-classic.js',true]]){
 let code=fs.readFileSync(path.join(root,source),'utf8'),match=code.match(/export\s*\{([^}]+)\};?\s*$/);
 if(!match)throw Error('Unexpected PDF.js distribution export shape');
 const exports=match[1].split(',').map(x=>{const [local,alias]=x.trim().split(/\s+as\s+/);return (alias||local)+':'+local}).join(',');
 code=code.slice(0,match.index).replaceAll('import.meta.url','perfPdfBase');
 code='(function(){const perfPdfBase=document.currentScript?.src||location.href;\n'+code+(worker?'':'\nglobalThis.PerformancePDF={'+exports+'};')+'\n})();\n';
 fs.writeFileSync(path.join(out,dest),code);
}
fs.copyFileSync(path.join(root,'LICENSE'),path.join(out,'pdfjs.LICENSE.txt'));
console.log('Prepared local JSZip and PDF.js classic assets with licenses.');
