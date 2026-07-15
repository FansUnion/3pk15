# 候选评估：HyperFrames

> 评估日期：2026-07-12（结论复核写入 2026-07-13）  
> 仓库：https://github.com/heygen-com/hyperframes  
> 依据：[`../创业思路.md`](../创业思路.md) 六段门禁  
> 清单入口：[`00-清单.md`](./00-清单.md)

---

## 1. 候选卡

| 字段 | 值 |
|------|-----|
| `source_type` | `github_oss` |
| `name` | HyperFrames |
| `url` | https://github.com/heygen-com/hyperframes |
| `one_liner_hypothesis` | 用 HTML/CSS/JS + Agent 程序化生成确定性 MP4；对标 Remotion 的 HTML/Agent 路线 |
| `tech_tags` | HTML composition、Puppeteer/Chrome、FFmpeg、CLI、AWS Lambda、Studio；官方有 Next/Vercel 集成文档但重渲染不在 Serverless 轻量面 |
| `license_or_terms` | **Apache-2.0**（可商用、可修改、可再分发；官方强调无 per-render 费用门槛，对比 Remotion 商业许可更友好） |
| `deploy_hint` | `npx hyperframes init/preview/render`；云渲染走 Lambda / HeyGen API；**非**「Next 一键上 Vercel 即完整产品」 |
| `dedupe_key` | heygen-com/hyperframes |
| `status` | **`tech_fail`** |
| `fail_reason` | 渲染依赖 Chrome + FFmpeg / 长任务或 Lambda；超出 Vercel 轻量闭环与二开白名单；出品方 HeyGen 已提供付费云渲染，纯「托管同款引擎」差异化弱 |

---

## 2. 项目速览

HyperFrames 由 **HeyGen** 开源：把 HTML、CSS、媒体与可 seek 动画渲成确定性 MP4。面向：

- AI coding agents（skills / CLI 非交互）  
- CI / 程序化视频流水线  
- 本地 CLI、浏览器 Studio、AWS Lambda 分布式渲染  

官方定位接近 **开源 Remotion 替代（HTML 作者模型）**；本地开源免费，云渲染可走 HeyGen API。

热度参考：GitHub 约 **3.4 万+ Star**（评估时点），社区有大量 vs Remotion 讨论。

---

## 3. Tech 门禁

| 检查项 | 结果 | 说明 |
|--------|------|------|
| 冒烟（CLI 本地） | 原则上可 | `init` → `preview` → `render` 可验证引擎；**不等于**可当 Vercel SaaS 冒烟通过 |
| Vercel 友好 | **弱 / 不通过** | 核心是无头浏览器逐帧捕获 + FFmpeg；需 Worker / 容器 / Lambda，非白名单内轻量改造能扛 |
| License 商用 | **通过** | Apache-2.0 |
| 二开白名单 | **不通过** | 做成可用托管 SaaS ≈ 队列、对象存储、计费、防滥用、渲染扩缩——远超支付/品牌/落地页 |
| 时间盒（≤4h 出可推广闭环） | **预期失败** | 引擎学习成本与基础设施过重 |

**Tech 结论**：`tech_fail`（相对主管道硬边界）。  
可选降权用法：仅作**垂直产品的渲染零件**（思路 C），不把「整仓托管 HyperFrames」当 MVP。

---

## 4. Demand 门禁

一句话假说成立；品类有真实市场，**不是**「没人要」。

| 信号 | 判断 |
|------|------|
| 搜索/品类意图 | 程序化视频、agent 出片、HTML→video、Remotion alternative —— 意图清晰 |
| 付费竞品 | Remotion（团队规模超阈值需商业许可）、各类 hosted render、**HeyGen 自家云渲染** |
| 社区/内容 | Star 高；Medium / 独立评测 / vs Remotion 指南多；Agent video 叙事热 |
| KD / 红海 | 「AI video」「video generator」等大词偏红海；长尾（如 agent html video、remotion alternative）或有切口，但获客仍难 |

**Demand 结论**：信号**偏正**（至少满足「付费竞品 + 强社区」类正信号）。  
本候选卡在主管道因 Tech 已止，**不进入 Score**；Demand 记录供日后若改路线（垂直 + 外包渲染）时复用。

未跑完整 Ahrefs/SimilarWeb 数值；结论为定性门禁，阈值待标定。

---

## 5. 商业化判断（对你而言）

| 问题 | 答案 |
|------|------|
| 协议上能否商用？ | **能**（Apache-2.0） |
| 赛道有没有需求？ | **有**，且偏强 |
| 是否适合当前「多源底座 → Vercel 轻量二开」管道？ | **不适合** → `tech_fail` |
| 最大商业风险 | 与 **出品方 HeyGen** 的云渲染正面竞争；自建渲染运维成本一人公司难扛 |

### 不推荐（默认）

- Fork 整仓做「第二个 HyperFrames Cloud / 托管渲染」  
- 当作本周可动手队列头部候选  

### 仅当明确切换路线时才考虑

- **垂直切口（备选 C）**：极窄场景产品（如 PR→changelog 视频、产品页→30s promo），前端仍可 Vercel，渲染走自建 worker / 第三方 / 官方 API  
- 须单独核算：成本、差异化、是否仍落在一人公司可承受范围——**不再是默认选品路径**

---

## 6. Score / MVP

未进入 Score（Tech 未通过）。  
不启动白名单二开与域名推广。

---

## 7. 决策

| 项 | 内容 |
|----|------|
| 管道决策 | **止损本候选作 MVP 底座**；换下一条更贴 Next / Supabase / 一键模板的候选 |
| 档案用途 | 技术雷达 + Demand 正例（「有需求但 Tech 不匹配」） |
| 复盘标签 | `killed_as_mvp_base`；引擎级复用另案评估 |

---

## 变更记录

| 日期 | 说明 |
|------|------|
| 2026-07-13 | 首版：写入候选卡与 Tech/Demand/商业化分析 |
