# 母基金管理系统 · 公开演示

本项目是静态交互原型。深圳、上海、北京仅作为演示地域；基金、管理人、企业、金额、业务描述、经营状态和投资关系均为虚构情景，不代表真实机构或投资事实。

## 打开演示

直接打开 `demo/index.html`。分层工作台入口为 `demo/index.html?workspace=workflow`，可切换国家、区域、子基金及项目的模拟账号。

主要功能包括全国投资覆盖地图、企业与资金穿透、批量申报评估、绩效监测评价、风险监测、AI尽调和相似项目推荐。AI功能为本地规则与交互演示，未连接真实模型或外部企业数据库；账号不具备服务端认证能力。

## 数据与本机记录

- `demo/source-data.js` 为独立生成的虚构样本，生成器为 `demo/generate-synthetic-data.cjs`。保留技术ID及分页、重复轮次等演示结构，名称、注册城市、行业、摘要与金额均重新生成；不发布真实名称对照表。
- `demo/scenario-data.js` 为虚构运营情景。全部区域名称及管理机构使用演示身份。
- 公开版使用 `diki-public-*` 浏览器存储空间，不读取旧版任务、附件与历史记录。上传和填写的数据仅保存在使用者自己的浏览器，不会随源码或发布包上传。
- 全国地图的公开地理数据及第三方代码许可证保留在演示目录中。

## 准备 GitHub 上传文件

在项目根目录运行：

```sh
node scripts/check-public-data.cjs
python3 scripts/package_public_demo.py
```

将生成的 `public-release/public-demo/` **目录内的内容**作为 GitHub 仓库文件；也可以先解压 `public-release/public-demo.zip` 再上传。发布包只收录本说明、Git忽略配置、`demo/` 和公开维护脚本，不包含原始工作簿、照片、OCR、预览、私有交接材料或本机依赖。

根目录的 `.gitignore` 使用允许列表，供本地 Git 提交使用。手动网页上传时以生成的发布目录为准。

## 校验

```sh
node scripts/check-public-data.cjs
python3 demo/source-workbook.test.py
```

各功能测试可分别运行 `node demo/功能名称.test.js`。源码更改后应重新校验、生成发布包。
