# 03 · CrazyGames 专属事项

> **分层 C。** 仅在对接 **CrazyGames** 时作为专属清单；勿默认套用到 Poki / 独立站。  
> **通用质量**见 [01-多平台通用质量事项.md](./01-多平台通用质量事项.md)。  
> **Poki 专属**见 [02-Poki专属事项.md](./02-Poki专属事项.md)——漏斗与 API **不同**。  
> **不写代码、不标工程完成状态**；施工与勾选见 `distribution/crazygames/`。  
> 一切以 [docs.crazygames.com](https://docs.crazygames.com/) 与协议为准。

每条结构：**为什么重要 → 适用 / 不适用 → 要准备什么 / 关键口径 → 常见误区（如有）→ 细则链接**。

---

## 与 Poki 的快速对照（先建立心智模型）

| 维度 | CrazyGames | Poki（对照） |
|------|------------|--------------|
| 先测后赚 | **Basic Launch** ~2 周，**广告关闭** | Playtest → Player Fit → Web Fit（广告可先占位） |
| 全球变现 | **Full Launch** 后 SDK 广告 + 分成 | Final Review / Soft→Global 后变现 |
| 中插 API | `requestAd("midgame")` | `commercialBreak()` |
| 激励 API | `requestAd("rewarded")` | `rewardedBreak()` |
| 初始包常见口径 | ≤ **50MB**（移动首页倾向 ≤ **20MB**） | 目标 &lt; **8MB** |
| 封面 | 横/竖/方 **三张** + 双预览视频 | 方形静态（+ 动画缩略图） |
| 独家 | 渠道路线默认**先非独家**；FAQ 部分待核 | Web Exclusive 可选且年限待核 |

通用体验纪律（引导、跨设备、干净包、AdBlock 不锁主线等）仍看 [01](./01-多平台通用质量事项.md)，此处不重复长文。

---

## C1 · 双阶段漏斗与指标

### 为什么重要

CG 用 **Basic → Full** 缩短首发，用真实流量决定是否值得做完整集成与开广告。搞错阶段会白做 SDK，或在广告关闭期误判「广告坏了」。

### 适用 / 不适用

- **适用：** 所有计划上 CrazyGames 的构建。  
- **对 Fangrush：** 可先交 **Basic**（少/无 CG 特化）验证棋盘乐趣；过线后再做 **Full** 包。勿把 Basic 当成 Poki Web Fit。

### 要准备什么 / 关键口径

- Basic：约 **2 周**有限受众；**不要**强上 CG 特定集成；变现关；仅 Basic QA。  
- 晋级看：**平均时长、转化到游玩、留存**（对标平台其他游戏）。  
- 全过 → 做 Full Implementation 再交 Full；部分过 → 可能再 Basic；多数不过 → 不能进 Full，再交须当**新游戏+重大改进**。  
- 多人/特邀可能跳过 Basic（棋类默认仍走 Basic）。

### 常见误区

- Basic 期间反复排查「为什么不出广告」——属预期（`adsDisabledBasicLaunch`）。  
- 未过线仍按全球发行排期。

### 细则链接

- [双语 01 · 双阶段发布](../CrazyGames官方文档双语整理/01-平台概览与双阶段发布.md)

---

## C2 · Full 硬约束（SDK / 广告 / 包体 / AdBlock）

### 为什么重要

Full 才开钱；SDK 事件错、包体超标、AdBlock 锁关，会卡 QA 或上线后指标崩。

### 适用 / 不适用

- **Basic：** SDK 可选；若已接广告 API，禁用时仍须可玩。  
- **Full：** SDK **强制**；仅 CG 广告；无外站广告网。  
- **对 Fangrush：** 独立站无广告；CG 包与 Admin 分离；`muteAudio` 必须听平台。

### 要准备什么 / 关键口径

**SDK / 事件**

- `crazygames-sdk-v3.js` → `await SDK.init()`（失败/非 CG 环境安全降级）。  
- `loadingStart/Stop`（建议）、`gameplayStart/Stop`（首次 start 影响初始下载计量）、进度 `reportGameCompletedPercentage`。  
- 失焦不要乱 `gameplayStop`。

**广告**

- `midgame` / `rewarded`；`adStarted` 才静音暂停；仅 `adFinished` 发激励奖。  
- 处理 `unfilled` / `adblock` / `adCooldown` / Basic 禁用码；中插约 **3 分钟**频控归平台。  
- **AdBlock 下核心主线可完成**；可挡额外内容，勿惩罚式锁死。

**包体**

- 初始下载 ≤ **50MB**；冲击移动首页时争取 ≤ **20MB**。  
- 总包 ≤ **250MB**；文件数 ≤ **1500**；相对路径。

**玩法入口（Full）**

- 尽快进入真实玩法（最好 0 次、最多 1 次点击）；英语 UI。

### 常见误区

- 在 `requestAd` 当下就静音（应等 `adStarted`）。  
- 自建激进广告计时器。  
- CG 包混入第二广告网或 Admin。

### 细则链接

- [双语 02 · Requirements](../CrazyGames官方文档双语整理/02-Requirements技术玩法广告账户与质量.md)  
- [双语 04 · SDK](../CrazyGames官方文档双语整理/04-HTML5-SDK与游戏模块.md)  
- [双语 05 · 广告](../CrazyGames官方文档双语整理/05-广告模块-视频与横幅.md)

---

## C3 · 封面与预览视频

### 为什么重要

三类封面 + 预览视频是提交与曝光物料；与 Poki「一张大方图」规格不同，错用尺寸会返工。

### 适用 / 不适用

- Basic/Full 提交均需按门户要求备齐（执行清单已列）。  
- **对 Fangrush：** 与 Poki 方形缩略图共用品牌，但**单独出图/剪辑**。

### 要准备什么 / 关键口径

- 静图：1920×1080（16:9）、800×1200（2:3）、800×800（1:1）；风格一致；少促销字/边框/商店 Logo。  
- 视频：横+竖，约 **15–20s**，≤ **50MB**，**无声**，勿预快进；表现真实玩法。

### 细则链接

- [双语 03 · 封面与素材](../CrazyGames官方文档双语整理/03-游戏封面与素材.md)

---

## C4 · 商务、支付与多平台并存

### 为什么重要

双门户是本品主线；若误签独家或搞不清分账/支付门槛，会卡住并行策略或收款。

### 适用 / 不适用

- **对 Fangrush：** [渠道发展路线](../渠道发展路线.md) 默认 **Poki + CrazyGames 先非独家**。所有权、他站 iframe、Steam 是否仍分账等 FAQ 在本地抓取中**正文缺失**——签约前 **待核官网**。

### 要准备什么 / 关键口径

- Full 后走平台广告分成；内购仅**受邀**游戏且走 Xsolla（棋类首发通常不做）。  
- 支付：Tipalti；Billing 配齐；最低提现约 **€100**；条款常见 NET 60（实务可能更快）。  
- 勿把 Poki Web Exclusive 默认套到 CG；反之亦然。

### 常见误区

- 未读合同就假设「上了 Steam / 另一门户一定不影响 CG 分账」。

### 细则链接

- [双语 06 · 支付与 FAQ](../CrazyGames官方文档双语整理/06-用户数据内购排行榜支付与FAQ.md)  
- [渠道发展路线](../渠道发展路线.md)

---

## C5 · 首发可延后（非 Full 第一天硬门槛）

> 知悉即可；避免被可选模块淹没。是否「适用」以 QA/Requirements 的 Account 条款为准。

| 能力 | 口径 |
|------|------|
| **User** 登录/好友 | 无强账号概念可后做；Full 若适用则禁外部登录、绑 CG 账号 |
| **Data** 云存（1MB） | 本地进度可先撑住；要跨设备再上，且尽量单一存档源 |
| **Banner** | Full 可变现组成；棋类首发可优先视频 midgame/rewarded，Banner 按版面再加 |
| **IAP / Leaderboards** | 邀请制；默认延后 |
| **happytime / 多人 room** | 非棋盘刚需 |

### 细则链接

- [双语 06](../CrazyGames官方文档双语整理/06-用户数据内购排行榜支付与FAQ.md)

---

## 本篇与工程文档

- **规则含义与取舍：** 本文 + [CrazyGames 双语整理](../CrazyGames官方文档双语整理/00-索引与阅读边界.md)  
- **实现、验收证据、勾进度：** `distribution/crazygames/`（README / compliance.yaml）  
- **与 Poki 并行：** [02-Poki专属](./02-Poki专属事项.md) + [渠道发展路线](../渠道发展路线.md)
