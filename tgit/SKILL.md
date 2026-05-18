---
name: tgit
description: "用自然语言调用腾讯工蜂（TGit / git.code.tencent.com）REST API。基于 npm 包 tgit-api 封装，覆盖项目、分支、提交、文件、合并请求、Issue、Release、成员、Webhook、代码评审、统计等约 200 个接口。当用户提到 工蜂 / TGit / git.code.tencent.com / tgit-api，或要求查看/创建/修改 仓库 / 分支 / MR / 合并请求 / Issue / 缺陷 / Tag / Release / Webhook / 项目成员 / 代码评审 / 提交记录 时触发。"
---

# tgit — 用自然语言调用腾讯工蜂

把用户的中文/英文意图翻译成 `tgit-api` 方法名 + JSON 参数，通过本地脚本调 工蜂 REST API，再用人话回报结果。

## 安装 / Setup（首次使用前必读）

本 skill 依赖 npm 包 `tgit-api`，需要本机有 **Node.js ≥ 14** 和 **npm**。

**情形 A：脚本能写本目录（默认情况）**
什么也不用做。第一次调用 `scripts/tgit.js` 时会自动执行 `npm install`，把 `tgit-api` 装到 `scripts/node_modules/`。第一次会慢几秒，之后秒级响应。

**情形 B：自动安装失败**（网络受限 / `scripts/` 只读 / 沙箱禁止 npm）
让用户手动跑一次：

```bash
cd ~/.claude/skills/tgit/scripts && npm install
```

或者本仓库根目录下：

```bash
cd <repo>/tgit/scripts && npm install
```

**Claude 触发本 skill 时的检查清单**：
1. `scripts/node_modules/tgit-api/` 不存在 → 提示用户先 `cd scripts && npm install`，或直接尝试自动安装（首次调用会自动跑）。
2. `TGIT_TOKEN` 未设 → 提示用户 `export TGIT_TOKEN=...`（详见下节）。
3. 上面两条都满足 → 直接调用。

## 触发场景

只要用户提到下列任意场景，就用本 skill：

- 工蜂 / TGit / git.code.tencent.com / 太湖网关上的 gitcode
- 列出我的项目 / 我的仓库 / 拉一下某项目详情
- 看这个 MR / 合并请求 / 合并 / 评审 / revert
- 列出某分支 / 创建分支 / 保护分支 / 删除分支
- 读文件 / 改文件 / 提交文件 / blame
- 创建/查/改/关 缺陷 (Issue) / 加评论
- Tag / Release / 上传附件
- Webhook 增删改查
- 项目成员、保护分支成员
- 统计：提交次数、代码行增量、各语言贡献
- Commit 评审、邀请评审人

## 鉴权与地址（环境变量）

- `TGIT_TOKEN`（**必填**）— 工蜂的 `private token`（长度 20）或 OAuth2 `access_token`。`tgit-api` 会按 token 长度自动选择 `PRIVATE-TOKEN` 或 `OAUTH-TOKEN` 请求头。
- `TGIT_BASE_URL`（**可选**）— 默认 `https://git.code.tencent.com/api/v3`。仅当走内部网关（如太湖 `https://api-s-idc.sgw.woa.com/ebus/gitcode/git_code_api/api/v3`）或自建实例时才需要覆盖。

如果用户没设过 `TGIT_TOKEN`，提示他执行：

```bash
export TGIT_TOKEN=你的工蜂token
# 可选：export TGIT_BASE_URL=https://其它实例/api/v3
```

不要把 token 写进文件或 commit；只在 shell session 里 export。

## 调用约定

入口脚本：`scripts/tgit.js`，调用形式

```bash
node scripts/tgit.js <method.path> '<json-params>'
```

- `<method.path>` 用 dot 形式，照搬 `references/methods.md`（例如 `projects.merge_requests.merge`）。
- `<json-params>` 是一个 JSON 对象字符串。`tgit-api` 内部会：
  - 把 URL 模板里 `:xxx` 形式的占位符（如 `:id`、`:merge_request_id`、`:sha`、`:branch`）从该对象抽走并 URL-encode；
  - `GET` 请求把剩余字段拼成 query string；
  - `POST/PUT/DELETE` 请求把剩余字段作为 JSON body。
- 标准输出是接口返回的 JSON；非 0 退出码表示出错，stderr 里是 `{ error, status, data, url, method }`。

**首次运行**：脚本会自动 `npm install` 把 `tgit-api` 下载到 `scripts/node_modules/`。无需手动安装，但需要本机有 `node` 和 `npm`。

查看本地实际可用的方法清单：

```bash
node scripts/tgit.js --list
```

## 标准工作流

1. **识别意图** → 在 `references/methods.md` 里挑出最贴近的方法名。不确定时优先列出最可能的几个，让用户确认。
2. **确认必要 ID**：项目 ID（`id`）必须是项目数字 ID 或 `namespace/path`（URL-encoded，如 `mygroup%2Fmyrepo`）。如果用户只给了仓库 URL，提取 `path_with_namespace` 并 URL-encode。
3. **执行**：用 Bash 工具调用 `node scripts/tgit.js <method> '<json>'`。如果是写操作（POST/PUT/DELETE），先把要做的事**说清楚再执行**，确认意图后再调用。
4. **结果**：原始 JSON 可能很大；用人话总结关键字段（id、name、state、web_url、author、created_at 等），必要时给出 `web_url` 让用户点过去看。

## 写操作的安全约束

下面这些操作不可逆或会广播到他人，**执行前必须明确告知并征得用户确认**：

- `projects.delete`, `groups.delete`, `users.delete`, `users.block`
- `projects.branches.delete`, `projects.tags.delete`, `projects.releases.delete`
- `projects.merge_requests.merge`, `projects.merge_request.revert`
- `projects.files.delete`, `projects.files.modify`（写入分支会留 commit）
- `projects.hooks.add/modify/delete`
- `projects.members.add/modify/delete`, `groups.members.*`
- `projects.issues.notes.add`, `projects.merge_requests.notes.add`（评论会通知到他人）

只读操作（`GET`）可以直接执行不必逐一确认。

## 常用示例

### 1. 列出我的项目（前 10 条，按更新时间倒序）

```bash
node scripts/tgit.js projects '{"per_page":10,"order_by":"last_activity_at","sort":"desc"}'
```

### 2. 查看某项目详情（用 namespace/path）

```bash
# id 需 URL-encode，例如 mygroup/myrepo
node scripts/tgit.js projects.get '{"id":"mygroup%2Fmyrepo"}'
```

### 3. 列出某项目的 opened 合并请求

```bash
node scripts/tgit.js projects.merge_requests '{"id":12345,"state":"opened","per_page":20}'
```

### 4. 查看 MR 详情（按 iid，即页面上看到的 !123 编号）

```bash
node scripts/tgit.js projects.merge_requests.getByIid '{"id":12345,"merge_request_iid":123}'
```

### 5. 给某 MR 加评论

```bash
node scripts/tgit.js projects.merge_requests.notes.add \
  '{"id":12345,"merge_request_id":98765,"body":"LGTM 👍"}'
```

### 6. 合并某 MR

```bash
node scripts/tgit.js projects.merge_requests.merge \
  '{"id":12345,"merge_request_id":98765,"merge_commit_message":"feat: merge xxx"}'
```

### 7. 读取仓库某文件

```bash
node scripts/tgit.js projects.files.get \
  '{"id":12345,"file_path":"README.md","ref":"master"}'
```

返回里 `content` 是 base64 编码（按工蜂规范）。如果用户要看内容，解码后呈现。

### 8. 在分支里改文件

```bash
node scripts/tgit.js projects.files.modify '{
  "id":12345,
  "file_path":"README.md",
  "branch_name":"main",
  "content":"# Hello\n",
  "commit_message":"docs: update readme"
}'
```

### 9. 创建分支（从某 ref 切出）

```bash
node scripts/tgit.js projects.branches.add \
  '{"id":12345,"branch_name":"feature/x","ref":"master"}'
```

### 10. 列出最近 commit

```bash
node scripts/tgit.js projects.commits '{"id":12345,"ref_name":"master","per_page":20}'
```

### 11. 创建 Issue / 缺陷

```bash
node scripts/tgit.js projects.issues.add \
  '{"id":12345,"title":"登录页 500","description":"复现步骤...","labels":"bug"}'
```

### 12. 创建 Release

```bash
node scripts/tgit.js projects.releases.add \
  '{"id":12345,"tag_name":"v1.2.0","description":"## 变更\n- ..."}'
```

### 13. 当前认证用户

```bash
node scripts/tgit.js user '{}'
```

## 常见坑

- **项目 ID**：路径形式必须 URL-encode 斜杠（`/` → `%2F`），否则会被 axios 拆成多段。数字 ID 不必编码。
- **分支名 / tag 名**：含 `/` 的同样要编码，例如 `feature/x` → `feature%2Fx`。
- **文件 path**：放在 JSON 里就行，不必预编码；脚本/库会处理。
- **token 失效**：报错里 `status: 401` 说明 token 过期或不对，让用户重新 export `TGIT_TOKEN`。
- **超时 / 网络**：默认走公网 `git.code.tencent.com`。如果用户在内网无法访问，需要设 `TGIT_BASE_URL`。
- **method.path 拼错**：脚本会回 `Unknown method: xxx` 并提示运行 `--list`。

## 完整方法清单

见 [`references/methods.md`](references/methods.md)。按资源分组列出所有约 200 个方法、URL 模板和关键参数，是查找方法名的权威表。

## 目录结构

```
tgit/
├── SKILL.md
├── scripts/
│   ├── tgit.js          # CLI 包装：node tgit.js <method> '<json>'
│   └── package.json     # 锁定 tgit-api 依赖
└── references/
    └── methods.md       # 全量方法清单
```
