# Skills
> 尝试写一些Skills服务于解决目前手里的AI工具对于国内某些资料不全的问题。

skills存放路径`~/.claude/skills`

## 安装

从 GitHub 直接安装到 Claude Code 全局 skills 目录：

```bash
# 查看可安装的 skill
npx skills add alanhe421/awsome-skills --list

# 安装全部 skill
npx skills add alanhe421/awsome-skills -g -a claude-code --skill '*'
```

也可以只安装其中一个：

```bash
npx skills add alanhe421/awsome-skills -g --skill wechat-mp-docs
npx skills add alanhe421/awsome-skills -g --skill tgit2
npx skills add alanhe421/awsome-skills -g --skill twitter-hot-search
npx skills add alanhe421/awsome-skills -g --skill glab
npx skills add alanhe421/awsome-skills -g --skill tencent-docs
npx skills add alanhe421/awsome-skills -g --skill hk-us-stock-analysis
```

说明：如需复制文件而不是创建链接，加 `--copy`；非交互安装加 `-y`。

## 已收录

- [`wechat-mp-docs`](./wechat-mp-docs) — 微信小程序官方文档问答（基于本地 CSV 检索）
- [`wechat-game`](./wechat-game) / [`wechat-subscription`](./wechat-subscription) — 微信小游戏 / 订阅号相关资料
- [`tgit2`](./tgit2) — 用自然语言调用兼容 Git 平台的 REST API，基于 npm 包 [`tgit-api`](https://www.npmjs.com/package/tgit-api) 封装；token 走 `TGIT_TOKEN` 环境变量，地址走 `TGIT_BASE_URL`（可选，默认 `https://git.code.tencent.com/api/v3`）
- [`twitter-hot-search`](./twitter-hot-search) — 用官方 X/Twitter API v2 recent search 检索最新/热门推文；token 走 `X_BEARER_TOKEN` 或 `TWITTER_BEARER_TOKEN`，默认控制请求页数以节省免费额度
- [`glab`](./glab) — GitLab CLI 的 glab 命令封装，支持多实例自动检测和手动指定；token 走 `GITLAB_TOKEN` 环境变量，地址走 `GITLAB_HOST`（可选，glab 内也有多实例配置）
- [`腾讯文档`](./tencent-docs) — 腾讯文档，官方自己托管到GitHub很难吗，无语了，这里我托管下，数据源于 https://skillhub.cn/skills/tencent-docs
- [`hk-us-stock-analysis`](./hk-us-stock-analysis) — 港美股投资研究与基础问答，覆盖市场机制、财报估值、组合风险，并可生成独立 HTML 或 PDF 研报
