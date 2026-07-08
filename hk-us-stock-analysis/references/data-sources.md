# 数据源与字段清单

## 标的识别

收集并核验：

- ticker、交易所、公司法定名称、常用名称、CIK/LEI/港股编号
- 报告日期、数据日期、财报期间、币种
- 当前股价、市值、流通股/稀释股数、企业价值
- 所属 GICS/ICB 板块、行业、主要上市地

## 美股优先来源

- SEC EDGAR：10-K、10-Q、20-F、6-K、8-K、S-1、DEF 14A、Form 4
- 公司 IR：earnings release、investor presentation、transcript、annual report
- Nasdaq/NYSE/公司官网：价格、股本、分红、拆股
- Yahoo Finance、Financial Modeling Prep、Alpha Vantage、Finnhub、Twelve Data、OpenBB：财务摘要、历史价格、估值倍数
- Reuters、Bloomberg、FT、WSJ、CNBC：新闻、行业事件、管理层表述

## 港股优先来源

- HKEXnews/披露易：年报、中报、季报、公告、通函、翌日披露报表
- 公司 IR：业绩公告、路演材料、投资者演示、盈利预警
- 港交所、AAStocks、ETNet、富途、东方财富、Yahoo Finance：价格、市值、股本、分红、拆股、估值倍数
- 香港证监会、联交所监管公告：监管与合规事项

## 必备财务字段

至少覆盖最近 3 个完整财年、TTM、最近季度：

- 收入、收入同比、毛利、毛利率
- 营业利润、营业利润率、净利润、净利率
- EBITDA、调整后 EBITDA，若公司披露
- 经营现金流、资本开支、自由现金流
- 研发费用、销售费用、管理费用、SBC/股权激励
- 现金及短期投资、总债务、净现金/净负债
- 稀释股数、每股收益、回购、股息、派息率
- ROE、ROA、ROIC，若可得

## 必备市场与同业字段

- 当前 P/E、Forward P/E、P/S、EV/Sales、EV/EBITDA、P/B、FCF Yield
- 52 周区间、近 1/3/6/12 个月涨跌幅
- 同业列表：3-8 家，说明选择理由和不可比点
- 同业收入增速、毛利率、营业利润率、净利率、估值倍数

## 公告与事件字段

- 最新业绩公告和管理层指引
- 最近重大融资、发债、回购、配股、并购、分拆、诉讼、监管调查
- 内部人交易或董事/高管持股变动
- 未来 6-12 个月可观察催化剂

## 核验规则

- 同一关键数字至少找两个来源；官方文件优先于聚合网站。
- 记录来源日期，避免把旧价格和新财报混用。
- 明确区分 fiscal year、calendar year、TTM、LTM、quarter。
- 港股财报常用港元、人民币或美元，统一比较前必须标注原始币种。
- 如果数据缺失，用“未披露”或“未能核验”，不要用同业均值填空。
