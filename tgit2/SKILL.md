---
name: tgit2
description: "用自然语言调用兼容 Git 平台的 REST API。基于纯 JavaScript 的轻量请求封装，支持自定义 API base URL 和 token，覆盖项目、分支、提交、文件、合并请求、Issue、Tag/Release、成员、Webhook、代码评审等常见操作。当用户提到 tgit2、TGit、工蜂、git API、自建 Git 实例，或要求查看/创建/修改 仓库 / 分支 / MR / 合并请求 / Issue / Tag / Release / Webhook / 项目成员 / 代码评审 / 提交记录 时触发。"
---

# tgit2 - 社区版 Git API skill

把用户的中文/英文意图翻译成方法名 + JSON 参数，通过本地脚本调用兼容的 Git REST API，再用人话回报结果。

## 适用范围

这个 skill 面向社区版或自建版 Git 平台：

- API 地址可配置
- 通过 token 鉴权
- 方法定义来自当前项目的 OpenAPI 源码生成

不绑定任何内网网关、专有域名或固定入口。

## 安装

本 skill 依赖少量 npm 包，需要本机有 Node.js 和 npm。

脚本首次运行时会自动安装依赖到 `scripts/node_modules/`。如果自动安装失败，手动执行：

```bash
cd <repo>/tgit2/scripts
npm install
```

## 鉴权与地址

使用环境变量配置：

```bash
export TGIT_TOKEN=你的token
export TGIT_BASE_URL=https://your-git-host.example.com/api/v3
export TGIT_TOKEN_HEADER=PRIVATE-TOKEN
```

- `TGIT_TOKEN` 必填，通常是 private token 或 OAuth access token
- `TGIT_BASE_URL` 可选，默认值是 `https://git.code.tencent.com/api/v3`
- `TGIT_TOKEN_HEADER` 可选，默认值是 `PRIVATE-TOKEN`，如果你的实例使用别的 token 头可以改成 `OAUTH-TOKEN` 或 `Authorization`

如果用户还没配置 token，先提示他设置环境变量，再继续执行。

## 调用方式

入口脚本：

```bash
node scripts/tgit.js <method.path> '<json-params>'
```

查看本地可用方法：

```bash
node scripts/tgit.js --list
```

参数约定：

- `method.path` 采用 dot 形式，通常是 `serviceBrand.methodName`
- 例如 `projects.get`、`projects.members.getProjectMembers`、`repository.git.files.modifyFile`
- `json-params` 是 JSON 字符串
- URL 模板里的 `:id`、`:sha`、`:branch` 之类占位符，从 JSON 里同名字段取值
- `GET` 的剩余字段会拼 query string
- `POST` / `PUT` / `DELETE` 的剩余字段会作为 body

## 标准工作流

1. 先识别用户要操作的资源和动作
2. 用 `node scripts/tgit.js --list` 找到对应方法名，必要时再参考 `references/methods.md`
3. 补齐必要参数，尤其是项目 ID、merge_request_id、issue_id、branch、sha 这类字段
4. 写操作先说明要改什么，再执行
5. 执行后只回报关键信息，如 `id`、`name`、`state`、`web_url`、`author`、`created_at`

## 安全约束

以下写操作先确认再执行：

- 删除项目、分支、tag、release、用户、hook
- 合并 MR、回退 MR
- 修改文件、创建文件、删除文件
- 新增或修改成员
- 给 MR 或 Issue 发评论

只读查询可以直接执行。

## 常用示例

### 列出项目

```bash
node scripts/tgit.js projects '{"per_page":10,"order_by":"last_activity_at","sort":"desc"}'
```

### 查看项目详情

```bash
node scripts/tgit.js projects.get '{"id":"mygroup%2Fmyrepo"}'
```

### 创建分支

```bash
node scripts/tgit.js repository.git.branches.create '{"id_or_path":12345,"branch_name":"feature/x","ref":"master"}'
```

### 查看合并请求

```bash
node scripts/tgit.js projects.mergeRequest.searchMergeRequests '{"id_or_path":12345,"state":"opened","per_page":20}'
```

MR 的地址通常会返回成这种格式：

- `https://git.code.tencent.com/<group>/<project>/merge_requests/<iid>`
- 脱敏示例：`https://git.code.tencent.com/xxxx/xxx/merge_requests/6`

如果接口返回了 `web_url`，优先直接把它回给用户。

### 查看文件

```bash
node scripts/tgit.js repository.git.files.getFile '{"id_or_path":12345,"file_path":"README.md","ref":"master"}'
```

## 触发场景

用户只要提到以下任意内容，就优先考虑这个 skill：

- TGit、工蜂、Git API、代码仓库、仓库管理
- 项目、分支、tag、release、提交、文件
- 合并请求、MR、review、评审
- Issue、缺陷、评论、成员、Webhook
- 自建 Git 实例、可配置 base URL、token 鉴权

## 参考

- `references/methods.md`：命名规则与使用说明
- `scripts/tgit.js`：CLI 包装器
