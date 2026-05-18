# tgit skill

用自然语言调用腾讯工蜂（TGit, `git.code.tencent.com`）REST API 的 Claude skill，基于 npm 包 [`tgit-api`](https://www.npmjs.com/package/tgit-api) 封装。

## 安装

1. 把整个 `tgit/` 目录拷到 Claude skills 路径：

   ```bash
   cp -r tgit ~/.claude/skills/
   ```

2. 安装依赖（**必需一次**，脚本首次运行也会尝试自动跑，但若失败请手动执行）：

   ```bash
   cd ~/.claude/skills/tgit/scripts
   npm install
   ```

   要求：Node.js ≥ 14、npm。

3. 设置环境变量：

   ```bash
   export TGIT_TOKEN=你的工蜂_token        # 必填，private token 或 OAuth2 access_token
   # 可选：仅当走内部网关或自建实例时
   # export TGIT_BASE_URL=https://api-s-idc.sgw.woa.com/ebus/gitcode/git_code_api/api/v3
   ```

   建议写进 `~/.zshrc` / `~/.bashrc` 持久化。

4. 在 Claude Code 里说一句"用 tgit 列一下我的工蜂项目"或类似的，skill 会被自动触发。

## 验证

```bash
cd ~/.claude/skills/tgit/scripts
TGIT_TOKEN=$TGIT_TOKEN node tgit.js user '{}'        # 拿当前用户信息
TGIT_TOKEN=$TGIT_TOKEN node tgit.js --list           # 看所有可用方法
```

## 使用说明

详见 [`SKILL.md`](./SKILL.md)；全量方法清单见 [`references/methods.md`](./references/methods.md)。

## 目录结构

```
tgit/
├── README.md            # 人类阅读（本文件）
├── SKILL.md             # Claude 触发与使用指南
├── scripts/
│   ├── tgit.js          # CLI 入口：node tgit.js <method> '<json>'
│   └── package.json     # 锁定 tgit-api 依赖
└── references/
    └── methods.md       # 全量方法（~200 个）速查表
```
