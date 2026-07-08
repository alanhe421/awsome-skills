---
name: hk-us-stock-analysis
description: "港美股票研究报告生成 Skill。Use when users provide a Hong Kong or US stock ticker and ask for stock analysis, equity research, valuation, investment thesis, financial report review, company analysis, DCF, peer comparison, SEC/HKEX filing review, or a PDF/standalone HTML stock research report."
---

# 港美股票分析

基于用户提供的港股或美股代码，收集公开市场、财务、公告、同业与新闻数据，生成类似券商研究报告的中文分析输出。默认输出为无外部 JS/CSS 的独立 HTML；用户明确要求 PDF 时，先生成 HTML，再用本地可用工具转换成 PDF。

## 快速流程

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

- `references/data-sources.md`：港美股数据源、字段清单和核验规则。
- `references/methodology.md`：分析维度、估值方法选择和质量检查清单。
- `assets/report-template.html`：独立 HTML 报告模板，可复制后填充内容。
