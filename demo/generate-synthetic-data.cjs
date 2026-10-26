'use strict';
// Synthetic business fixture; only the regional parent fund uses its public name. No private lookups.
const names=['青屿','澄岚','星舟','云汀','远岫','栖光','新禾','映川','衡野','晴岑','知岳','霁海','泊原','启萤','望序','寻杉','云槐','松弦','南棠','北澜','初隼','观沐','岚谷','序辰','穹禾','漪岚','珞序','棠野','原萤','川穗','沐序','云岑','汀岳','拾光','启棠','岑野','星屿'];
const industries=['人工智能与数字技术','半导体与集成电路','生物医药与医疗器械','高端装备与机器人','新材料与新能源','未来信息与通信','工业软件'];
const products=['工业软件研发与设备协同平台','芯片设计与测试工具研发','医疗检测设备研发与技术服务','机器人控制系统与制造解决方案','新材料中试研发与工艺验证服务','通信模组与低功耗连接技术','生产管理软件与数字化技术服务'];
const cities=['广东省深圳市','广东省广州市','浙江省杭州市','江苏省苏州市','安徽省合肥市','四川省成都市','湖北省武汉市','广东省东莞市','江苏省南京市','广东省珠海市','北京市','上海市'];
const round=n=>Math.round(n*10000)/10000;
function makeSynthetic(){
 const funds=Array.from({length:34},(_,i)=>{const size=round(2.2+((i*13+5)%29)*.23);return {id:'SF'+String(i+1).padStart(2,'0'),name:'演示·'+names[i]+'科创基金',manager:'演示·'+names[(i*5+3)%names.length]+'投资管理机构',sector:industries[(i*3+1)%industries.length],place:cities[(i*5+2)%cities.length],size,request:round(size*(.12+(i%5)*.025))}});
 const deals=Array.from({length:38},(_,i)=>{const company=i===8?0:i<8?i:i-1,k=(company*3+2)%industries.length;return {id:'DI'+String(i+1).padStart(2,'0'),name:'演示·'+names[company]+'科技'+(i===8?'（第二轮）':''),place:cities[(company*7+4)%cities.length],summary:products[k]+'；虚构业务场景，用于功能演示。',sector:industries[k],round:round(.55+((i*11+7)%27)*.14),request:round(.07+((i*7+2)%17)*.027)}});
 const sum=(rows,key)=>round(rows.reduce((s,r)=>s+r[key],0));return {kind:'synthetic',version:'public-demo-v1',asOf:'2026-09-30',fileName:'synthetic-public-demo-v1',unit:'亿元',disclosure:'区域母基金名称为公开信息；子基金、企业、金额、业务描述及关系均为虚构演示。',parent:'粤港澳大湾区创业投资引导基金',controls:{funds:{count:funds.length,size:sum(funds,'size'),request:sum(funds,'request')},deals:{count:deals.length,round:sum(deals,'round'),request:sum(deals,'request')}},funds,deals};
}
const source=()=> 'const sourceWorkbook = '+JSON.stringify(makeSynthetic(),null,2)+';\n';
if(require.main===module)process.stdout.write(source());
module.exports={makeSynthetic,source};
