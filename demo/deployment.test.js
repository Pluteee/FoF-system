const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const entry=fs.readFileSync(path.join(root,'index.html'),'utf8');
const redirect=entry.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(redirect,'Repository-root entry must have a redirect.');
for(const href of [
 'https://fof-system.pages.dev/',
 'https://fof-system.pages.dev/?workspace=workflow#dd-materials=sample',
 'https://example.test/subdirectory/?workspace=partner',
 'file:///tmp/public-demo/index.html?workspace=workflow'
]){
 const location=new URL(href);let target='';location.replace=value=>{target=value};
 vm.runInNewContext(redirect,{URL,window:{location}});
 const expected=new URL('./demo/index.html',href);expected.search=location.search;expected.hash=location.hash;
 assert.equal(target,expected.href,'Query parameters and material-page anchors must survive.');
}
assert.ok(entry.includes('href="./demo/index.html"'),'Provide a non-JavaScript fallback link.');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const assets=[...html.matchAll(/(?:src|href)="([^"?#]+\.(?:js|css))(?:\?[^"#]*)?"/g)].map(m=>m[1]);
for(const asset of assets)assert.ok(fs.existsSync(path.join(__dirname,asset)),'Missing initial asset '+asset);
const scripts=[...html.matchAll(/<script src="([^"?]+)(?:\?[^"#]*)?"[^>]*><\/script>/g)].map(m=>m[1]);
new vm.Script(scripts.map(asset=>fs.readFileSync(path.join(__dirname,asset),'utf8')).join('\n;\n'));
for(const file of ['workflow-bootstrap.js','partner-bootstrap.js']){
 const code=fs.readFileSync(path.join(__dirname,file),'utf8');
 for(const match of code.matchAll(/\.(?:src|href)\s*=\s*['"]([^'"?]+\.(?:js|css))(?:\?[^'"]*)?['"]/g))assert.ok(fs.existsSync(path.join(__dirname,match[1])),'Missing workflow asset '+match[1]);
}
assert.ok(fs.readFileSync(path.join(root,'.gitignore'),'utf8').includes('!/index.html'));
assert.ok(fs.readFileSync(path.join(root,'scripts/package_public_demo.py'),'utf8').includes('"index.html"'));
console.log('Deployment entry: root redirect, query/hash retention, local fallback, primary/dynamic assets and shared classic-script syntax passed.');
