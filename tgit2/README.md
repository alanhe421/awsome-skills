# tgit2 skill

用自然语言调用兼容 Git 平台的 REST API 的 Claude skill，基于纯 JavaScript 的轻量请求封装。适合社区版、自建版或可配置 base URL 的 Git 实例。

## 安装

1. 把整个 `tgit2/` 目录拷到 Claude skills 路径：

   ```bash
   cp -r tgit2 ~/.claude/skills/
   ```

2. 安装依赖（必需一次。脚本首次运行也会尝试自动安装，但若失败请手动执行）：

   ```bash
   cd ~/.claude/skills/tgit2/scripts
   npm install
   ```

   要求：Node.js ≥ 14、npm。

3. 设置环境变量：

   ```bash
   export TGIT_TOKEN=你的token
   export TGIT_BASE_URL=https://your-git-host.example.com/api/v3
   export TGIT_TOKEN_HEADER=PRIVATE-TOKEN
   ```

   - `TGIT_TOKEN` 必填，通常是 private token 或 OAuth access token
   - `TGIT_BASE_URL` 可选，默认 `https://git.code.tencent.com/api/v3`
   - `TGIT_TOKEN_HEADER` 可选，默认 `PRIVATE-TOKEN`，如果你的实例使用别的 token 头可以改成 `OAUTH-TOKEN` 或 `Authorization`

   建议写进 `~/.zshrc` / `~/.bashrc` 持久化。

4. 在 Claude Code 里说一句“用 tgit2 列一下我的项目”或类似的，skill 会被自动触发。

## 验证

```bash
cd ~/.claude/skills/tgit2/scripts
TGIT_TOKEN=$TGIT_TOKEN node tgit.js user '{}'   # 拿当前用户信息
TGIT_TOKEN=$TGIT_TOKEN node tgit.js --list      # 看所有可用方法
```

如果是自建实例，先确保 `TGIT_BASE_URL` 和 `TGIT_TOKEN_HEADER` 配对正确。

## 使用说明

详见 [`SKILL.md`](./SKILL.md)；方法清单见 [`references/methods.md`](./references/methods.md)。

## 目录结构

```
tgit2/
├── README.md            # 人类阅读（本文件）
├── SKILL.md             # Claude 触发与使用指南
├── scripts/
│   ├── tgit.js          # CLI 入口：node tgit.js <method> '<json>'
│   └── package.json     # 依赖与脚本
└── references/
    └── methods.md       # 方法速查表
```
