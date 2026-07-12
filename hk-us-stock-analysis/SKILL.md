---
name: hk-us-stock-analysis
description: "港美股投资研究与基础知识 Skill。Use when users ask about Hong Kong or US stock analysis, investing basics, market mechanics, order types, trading hours, settlement, financial statements, valuation, portfolio risk, ETFs, dividends, corporate actions, SEC/HKEX filings, or request a PDF/standalone HTML equity research report."
---

# 港美股票分析

回答港美股投资基础问题，或基于用户提供的股票代码生成研究报告。先判断用户是在问概念、操作机制、风险，还是要求分析具体标的；不要把简单问答强制写成完整研报。个股报告默认输出为无外部 JS/CSS 的独立 HTML；用户明确要求 PDF 时，先生成 HTML，再用本地可用工具转换成 PDF。

## 任务路由

- 基础概念、市场机制、财报/估值术语、组合与风险问题：读取 `references/investing-basics.md`。
- 港美股差异、交易时段、订单、结算、公司行动、披露与税费问题：同时读取 `references/hk-us-market-basics.md`；涉及当前规则、费用或税务时必须联网核验。
- 具体股票、财报、估值或投资论点：执行下方“个股研究流程”，并读取 `references/data-sources.md` 与 `references/methodology.md`。
- 用户问题同时包含知识问答和个股判断：先解释概念，再说明它如何影响该标的；事实、推断和情景假设分开写。

## 问答原则

1. 先给一句直接答案，再解释“是什么、为什么重要、如何核验、主要风险”。按问题复杂度增减，不机械堆满四段。
2. 区分投资教育与个性化建议。若答案依赖资金期限、风险承受能力、税务居民身份或券商规则，指出依赖项，不替用户做适当性判断。
3. 交易时间、结算周期、监管规则、税率、费用、指数成分和产品条款会变化，必须查询交易所、监管机构、税务机关、基金文件或券商官方页面，并标注核验日期。
4. 不把“历史平均”“常见做法”写成保证；不承诺收益，不用单一指标得出买卖结论。
5. 遇到期权、融资融券、杠杆/反向 ETF、卖空等可能超过本金或快速放大损失的产品，先解释最大损失、追加保证金、流动性和路径依赖，再讨论用途。

## 个股研究流程

1. 识别标的：确认 ticker、交易所、公司名称、币种、报告日期和数据日期。
2. 获取最新数据：必须联网核验当前价格、市值、财报、公告和新闻，不要只依赖模型记忆。
3. 读取 `references/data-sources.md`：按美股/港股分别选择数据源，并记录每个关键数据的来源日期。
4. 读取 `references/methodology.md`：按报告框架完成商业模式、行业格局、财务、估值、管理层、催化剂和风险分析。
5. 使用 `assets/report-template.html` 作为版式起点，生成单文件 HTML；所有 CSS 写在 `<style>` 内，不引用外部 JS、CSS、字体或图片。
6. 对估值模型做一致性检查：股数、币种、企业价值、净债务、倍数、FCF 口径必须可追溯。
7. 输出前加入免责声明：报告仅供研究教育，不构成投资建议。

## 数据优先级

- 优先使用官方文件：SEC EDGAR、公司 IR、HKEXnews、港交所披露易、年报、10-K、10-Q、20-F、6-K、8-K、公告和业绩演示材料。
- 市场数据至少交叉核验两个来源：交易所、Yahoo Finance、Nasdaq、CompaniesMarketCap、Macrotrends、Financial Modeling Prep、Alpha Vantage、Finnhub、Twelve Data、OpenBB、券商页面等。
- 新闻和行业数据优先使用 Reuters、Bloomberg、Financial Times、WSJ、CNBC、公司新闻稿、行业协会、监管机构。
- 如果无法获取某项数据，明确写“未披露”或“未能核验”，不要编造。

## 报告结构

默认生成以下章节：

1. 首页指标卡：当前股价、市值、行业、DCF 公允价值、多方法估值中枢、相对空间、核心结论。
2. 投资论点速查：核心论点、市场最容易误判的点、唯一必须盯住的指标。
3. 商业模式：收入来源、单位经济性、资本强度、护城河。
4. 行业与竞争格局：产业链位置、主要竞争者、同业差异。
5. 财务分析：收入增长、利润率、现金流、SBC/摊薄、现金债务、股息、回购、资本回报、优势与弱点。
6. 多方法估值：P/S、P/E、EV/EBITDA、P/B、DCF、SOTP、叙事估值，按公司适配选择主方法。
7. 管理层与内部人交易：高管、薪酬、持股、买卖、资本配置。
8. 前瞻指引与展望：最新业绩会、公告、管理层指引、短中期观察点。
9. 催化剂与风险：6-12 个月催化剂、乐观/悲观情景、关键风险矩阵。
10. 法律与监管：重大诉讼、监管调查、合规事项。
11. 附录：来源链接、DCF 假设表、同业倍数、免责声明。

## 输出要求

- 用中文写作，数字保留原始币种；跨币种比较时写明汇率日期和换算方法。
- 结论先行，每节末尾用一句“本节结论”收束。
- 估值不要机械套模板：盈利为负时避免 P/E；FCF 波动剧烈时弱化 DCF；多业务平台可加入 SOTP 或叙事估值。
- 所有关键结论都要能回链到数据来源或明确标注为推断。
- 不生成买入/卖出评级，除非用户明确要求；即便给评级也必须说明不构成投资建议。

## 资源

- `references/investing-basics.md`：投资框架、资产类型、复利、财报、估值、组合与风险基础。
- `references/hk-us-market-basics.md`：港美股市场机制、订单与结算、披露、公司行动、税费及差异核验清单。
- `references/data-sources.md`：港美股数据源、字段清单和核验规则。
- `references/methodology.md`：分析维度、估值方法选择和质量检查清单。
- `assets/report-template.html`：独立 HTML 报告模板，可复制后填充内容。
