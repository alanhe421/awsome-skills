---
name: twitter-hot-search
description: "Official X/Twitter recent-search and hot-topic retrieval assistant. Use when users ask to search Twitter/X, inspect recent tweets, find hot posts around a keyword, monitor official accounts, or rank search results by engagement. Uses the official X API v2 recent search endpoint with bearer token from X_BEARER_TOKEN or TWITTER_BEARER_TOKEN."
---

# twitter-hot-search — 官方 X/Twitter 热点检索

用官方 X/Twitter API v2 `recent search` 检索最近推文，并按互动指标做本地热度排序。

## 触发场景

当用户提到以下需求时使用本 skill：

- 检索 Twitter / X 上某个关键词、话题、产品名、账号相关的最新推文
- 找某个关键词下的热门推文 / 热点讨论 / 高互动内容
- 搜索官方账号或指定账号发布的推文，例如 `from:OpenAI`、`from:xai`
- 按语言、是否转推、是否含链接等 X search operators 过滤
- 需要基于官方 API，而不是网页抓取或非官方接口

## 鉴权与额度

需要设置官方 API bearer token：

```bash
export X_BEARER_TOKEN=你的_bearer_token
# 或者：export TWITTER_BEARER_TOKEN=你的_bearer_token
```

可选覆盖 API base：

```bash
export TWITTER_API_BASE_URL=https://api.twitter.com/2
```

注意：官方免费 / 低价套餐通常有请求次数和时间窗口限制。默认每次只发 1 个请求；只有用户明确要扩大覆盖范围时才增加 `pages`，最多建议 5 页。

## 调用方式

入口脚本：`scripts/twitter-hot-search.js`。

### 最新检索

```bash
node scripts/twitter-hot-search.js "<query>" [limit]
```

示例：

```bash
node scripts/twitter-hot-search.js "Claude lang:en -is:retweet" 10
```

### 热度排序

```bash
node scripts/twitter-hot-search.js --hot "<query>" [limit] [pages]
```

示例：

```bash
node scripts/twitter-hot-search.js --hot "OpenAI OR Claude lang:en -is:retweet" 20 2
```

### JSON 参数

```bash
node scripts/twitter-hot-search.js --json '{"query":"Claude lang:en -is:retweet","limit":10,"pages":1,"sort":"hot"}'
```

支持字段：

- `query`：官方 recent search 查询字符串，必填
- `limit`：最终返回条数，默认 10，最大 100
- `pages`：请求页数，默认 1，最大 5；页数越多越消耗额度
- `sort`：`recency` / `relevancy` / `hot`；`hot` 会本地按互动排序
- `lang`：如果 query 里没写 `lang:`，自动追加语言过滤
- `start_time` / `end_time`：ISO 8601 时间范围

## 热度计算

`sort: "hot"` 时，脚本会先调用官方 recent search，再按以下公式本地排序：

```text
hot_score = like_count + retweet_count * 3 + reply_count * 2 + quote_count * 2 + bookmark_count * 2 + floor(impression_count / 1000)
```

返回 JSON 中每条结果包含：

- `text`
- `created_at`
- `author`
- `public_metrics`
- `hot_score`
- `url`

## 工作流

1. 提取用户要查的主题、账号、语言、时间范围。
2. 尽量把查询写窄，减少额度消耗：
   - 排除转推：`-is:retweet`
   - 指定语言：`lang:en` / `lang:zh`
   - 指定账号：`from:username`
   - 多关键词：`(Claude OR OpenAI)`
3. 默认跑 1 页；只有用户要求“多找一些 / 更全 / 扩大范围”时才增加 `pages`。
4. 对脚本输出做简短总结：列出最热 / 最新推文、作者、时间、互动数、链接。
5. 如果 API 返回 401/403，提示用户检查 bearer token 和套餐权限；如果 429，说明额度或频率限制已触发。

## 常用查询示例

```bash
# 查某关键词最新推文
node scripts/twitter-hot-search.js "Claude Code lang:en -is:retweet" 10

# 查高互动内容
node scripts/twitter-hot-search.js --hot "AI coding assistant lang:en -is:retweet" 20 2

# 查官方账号近期内容
node scripts/twitter-hot-search.js "from:OpenAI -is:retweet" 10

# 查中文讨论
node scripts/twitter-hot-search.js --hot "AI 编程 lang:zh -is:retweet" 10 1
```

## 安全与合规

- 只使用官方 API；不要抓取网页、绕过登录、绕过限流或使用非授权 token。
- 不要把 token 写入文件或提交到仓库。
- 不要帮助用户检索、整理或曝光个人隐私信息。
- 遇到政治敏感、仇恨、色情、违法等内容请求时，按宿主环境安全规则拒绝。

## 目录结构

```text
twitter-hot-search/
├── SKILL.md
└── scripts/
    └── twitter-hot-search.js
```
