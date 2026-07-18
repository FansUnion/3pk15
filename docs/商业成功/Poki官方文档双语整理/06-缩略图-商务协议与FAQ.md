# 06 · 缩略图、商务协议与 FAQ

> **非官方整理稿。** 本文不是 Poki 官方中文文档；一切以实现为准，请以 [Poki SDK 英文原文](https://sdk.poki.com/) 为准。  
> **最近核对日期：** 2026-07-17  
> **原始抓取：** [docs/文档整理todo/poki内容/](../../文档整理todo/poki内容/)

---

## Static Thumbnails · 静态缩略图

### 作用

**English:** The static thumbnail is the first visual on category pages, game pages, and search. It must reflect what the game is about and drive clicks. **Required to start Web Fit Test.**

**中文：** 静态缩略图是分类页、游戏页、搜索中的第一视觉，须传达游戏内容并促点击。**开始 Web Fit Test 前必须上传。**

### 硬性规格

**English:**

- **Size:** Full-bleed square, **minimum 628×628 px** (Poki adds rounded corners via mask).
- **No** extra borders, padding, or letterboxing.
- **Avoid text/titles** — unreadable at small tiles; Poki tests show text-free thumbnails perform better.
- Design for **small and large** tile sizes; detail that works large may look messy small.

**中文：**

- **尺寸：** 全出血正方形，**至少 628×628 px**（圆角由平台蒙版处理）。
- **禁止**额外边框、内边距、信箱黑边。
- **避免文字/标题** — 小图不可读；测试表明无文字缩略图表现更好。
- 同时考虑**大/小**图块；大图细节在小图可能杂乱。

### 颜色与对比

**English:** Use strong contrast so the tile “pops.” Poki Playground background is **#83FFE7** — avoid thumbnails too similar or they blend in.

**中文：** 保持强对比使图块醒目。Poki Playground 背景色 **#83FFE7** — 颜色过近会“消失”。

### 设计指南

**English:**

- **Show what’s inside** — thumbnail must match in-game visuals; mismatch hurts C2P and playtime.
- **Main character in default skin** — builds recognition.
- **Embrace simplicity** — one clear foreground subject; clean background.
- **Keep it together** — series/saga games should share visual continuity across thumbnails.
- **Motions matter (even in static art)** — dynamic poses (jump, run, aim) beat stiff poses.

**中文：**

- **内外一致** — 缩略图须与实机画面匹配；不符会伤害 C2P 与时长。
- **默认皮肤主角** — 建立识别度。
- **简约** — 单一清晰前景；干净背景。
- **系列连贯** — 同系列作品缩略图风格延续。
- **静态也要有动感** — 跳跃、奔跑、瞄准等姿势优于僵硬站姿。

### 缩略图与指标

**English:**

- **CTR:** Thumbnail mainly drives **click-through** (theme, character, style among competing tiles).
- **C2P:** Thumbnail can hurt C2P if visuals mislead, but C2P is primarily **load time, file size, responsiveness, pre-play UX**.

**中文：**

- **CTR：** 缩略图主要影响**点击率**（主题、角色、风格在竞品中的辨识度）。
- **C2P：** 误导性缩略图可能拉低 C2P，但 C2P 主要取决于**加载、体积、响应、开局体验**。

### 更新规则

**English:**

- **During development:** Update freely unless a **Web Fit Test is running**.
- **After Web Fit pass:** Changes need **Developer Support approval** (upload in P4D).
- **After global release:** Updates only for **substantial content** (new world/mode/major feature) — avoid misleading players with old content.
- **Soft Release:** Multiple versions — contact Poki for help choosing the best one.

**中文：**

- **开发中：** 可随时更新，除非 **Web Fit 进行中**。
- **Web Fit 通过后：** 变更须 **Developer Support 审核**（P4D 上传）。
- **全球发布后：** 仅在有**重大内容更新**时改图 — 避免用新图吸引玩家却仍是旧内容。
- **软发布期：** 多版本可选 — 可联系 Poki 协助挑选。

---

## Animated Thumbnails · 动画缩略图

**English:** Short video preview on **hover** over the static thumbnail. Available from **Soft Release** onward. Global release requires **both static and animated** thumbnails (per Requirements).

**中文：** 悬停静态缩略图时播放的短视频预览。**软发布**阶段起可添加。全球发布要求**静态 + 动画**缩略图（见 Requirements）。

### 视频规格

**English:**

| Spec | Value |
|------|-------|
| Dimensions | 1080×1080 (may be higher if within max size) |
| Aspect ratio | 1:1 |
| Frame rate | 50 fps+ |
| Duration | 4–6 seconds |
| Audio | Muted (file may contain audio; site won’t play) |
| Format | .mp4 |
| Max file size | 100 MB |

**中文：**

| 规格 | 要求 |
|------|------|
| 分辨率 | 1080×1080（可更高，须满足体积上限） |
| 宽高比 | 1:1 |
| 帧率 | 50 fps+ |
| 时长 | 4–6 秒 |
| 音频 | 静音（文件可有音轨，站点不播放） |
| 格式 | .mp4 |
| 最大体积 | 100 MB |

### 内容指南

**English:** Focus on core gameplay; minimal text; **2–3 scenes** (~1–2 s each); consider animating from static art; hide non-essential UI; center action (square crop); **no visible cursor** (e.g. Cursorcerer when recording).

**中文：** 突出核心玩法；少文字；**2–3 个场景**（各约 1–2 秒）；可从静态图延伸动画；隐藏非必要 UI；动作居中（方形裁切）；**勿出现鼠标**（录制时可用 Cursorcerer 等工具隐藏）。

---

## A/B Thumbnail Tests · 缩略图 A/B 测试

**English:** Run during **Soft Release only**. Compare **two** thumbnails shown randomly; minimum **3 days** per round. Email up to **3 options** to developersupport@poki.com — team picks top two. Limit rounds to avoid prolonging soft release.

**中文：** 仅在**软发布**阶段进行。随机展示**两个**版本；每轮至少 **3 天**。邮件最多 **3 个方案**至 developersupport@poki.com — 团队选前两名。控制轮次以免拖长软发布。

### 跟踪指标

**English:**

| Metric | Meaning |
|--------|---------|
| **C2P** | Starts after click; higher = thumbnail sets right expectations |
| **Average Playtime** | Retention; expectation match |
| **Video Ad Impressions** | Correlates with engaged sessions |
| **Total Playtime** (= C2P × Average Playtime) | **Primary metric** — best overall thumbnail |

**中文：**

| 指标 | 含义 |
|------|------|
| **C2P** | 点击后开始玩；越高说明预期越准 |
| **Average Playtime** | 留存；预期与实机一致 |
| **Video Ad Impressions** | 与深度会话相关 |
| **Total Playtime**（= C2P × 平均时长） | **首要指标** — 综合最优缩略图 |

**English:** Results shared by email after each test.

**中文：** 每轮结束后通过邮件分享结果。

---

## Deal Types · 协议类型

> **⚠️ 待核，以合同为准：** 本地抓取中 **独家年限存在冲突** — Bonus Level 概述写 **7 年**，Deal Types 正文写 **5 年**（默认）。签约前务必以**正式合同**与 Poki 对接人确认为准。

### Web Exclusive · 网页独家

**English:** Poki’s preferred model. On the **open web**, the game is published **only on Poki**. **Steam, mobile stores, and consoles are excluded** from web exclusivity.

**中文：** Poki 首选模式。**开放网页**上游戏**仅在 Poki 发布**。**Steam、移动商店、主机**不在网页独家范围内。

**English:** **Discord** and **YouTube Playables** count as **web platforms** (HTML5 in browser) — publishing there **conflicts** with web exclusivity.

**中文：** **Discord** 与 **YouTube Playables** 视为**网页平台**（浏览器内 HTML5）— 在这些平台发布与网页独家**冲突**。

**English (Deal Types page — 待核 vs contract):** Default exclusive term cited as **5 years**. In return, Poki invests marketing & monetization support:

- Marketing to **90M+ players**
- Top-tier ads & brand deals
- **100%** earnings when **you** bring the player (direct search, bookmark, your community)
- **50%** earnings when **Poki** brings the player (Poki.com, Poki campaigns)

**中文（Deal Types 页 — 待核）：** 正文默认独家期 **5 年**。回报包括营销与变现支持：

- 面向 **9000 万+** 玩家的推广
- 顶级广告与品牌合作
- **自带流量 100%** 收入（直接搜索、书签、自有社区）
- **Poki 导流 50%** 分成（Poki.com、Poki 营销活动）

**English (Bonus Level overview — 待核 vs contract):** Same model described with **seven-year** exclusivity including Discord/YouTube Playables. **Resolve with signed agreement.**

**中文（Bonus Level 概述 — 待核）：** 同模式亦出现 **七年** 独家（含 Discord/YouTube Playables）表述。**以签署协议为准。**

### Non-Exclusive · 非独家

**English:** One-time **flat license fee**; no revenue-share marketing package like Web Exclusive.

**中文：** 一次性**固定授权费**；不含 Web Exclusive 的分成与营销包。

### 通用合同要求（摘要）

**English:**

- Developer ships compatible builds; implements **Poki ad SDK**; follows Poki web guidelines under supervision.
- Chat / UGC / player communication only with **prior Poki approval** + moderation tools if allowed.
- **Prohibited:** unapproved promos; illegal/harmful content; third-party plugins/trackers/external services without written consent ([Privacy & Security](https://sdk.poki.com/requirements.html#privacy-security)).
- **Performance:** Responsive **16:9**; **≥ 30 FPS** (target 60) on supported devices under ~3G+; minimize file size; no game-breaking bugs — fix within **1 month** of report (or sooner if requested).
- **Devices:** Mid-range phones (last 3 years), modern Android/iOS; desktops with major browser (last 12–18 months). **≥ 85%** of users per platform without critical issues.

**中文：**

- 开发者交付兼容构建；集成 **Poki 广告 SDK**；在监督下遵循 Poki 网页规范。
- 聊天/UGC/玩家通信须 **Poki 事先批准**；若允许须用审核工具。
- **禁止：** 未批准推广；违法/有害内容；未经书面同意的第三方插件/追踪/外部服务（见 [Privacy & Security](https://sdk.poki.com/requirements.html#privacy-security)）。
- **性能：** 响应式 **16:9**；支持设备上 **≥ 30 FPS**（目标 60，约 3G+ 网络）；尽量小体积；无破坏性 Bug — 报告后 **1 个月内**修复（或按要求更快）。
- **设备：** 近 3 年中端机、现代 Android/iOS；近 12–18 个月主流浏览器桌面。**≥ 85%** 用户无严重问题。

---

## FAQ · 常见问题（支付 / 提交 / 追踪相关）

### How can I see how my game is doing? · 如何查看游戏表现？

**English:** Poki for Developers dashboard: DAU (playing vs non-playing), Engagement (time per DAU), Earnings, Ad Performance, Player Feedback, Errors — filterable by country and device.

**中文：** Poki for Developers 仪表盘：日活（玩/未玩）、参与度（每 DAU 时长）、收入、广告表现、玩家反馈、错误 — 可按国家与设备筛选。

### What kinds of payments do you offer? · 提供哪些支付方式？

**English:** Payout via **wire transfer** or **PayPal**. Set billing info and preferred currency in P4D.

**中文：** 通过**银行电汇**或 **PayPal** 付款。在 P4D 设置账单信息与首选货币。

### Can I include external trackers in my game? · 能否使用外部追踪？

**English:** **Consult Poki first** due to privacy. Platform **blocks external requests by default**; exceptions (multiplayer servers, approved analytics like GameAnalytics) need CSP approval + hosted Privacy Policy linked in-game. **Google Analytics and Google products are blocked.**

**中文：** 因隐私问题须**先咨询 Poki**。平台**默认拦截外部请求**；例外（多人外部服务器、经批准的 GameAnalytics 等）须在 Settings 申请 CSP + 游戏内链接的托管隐私政策。**Google Analytics 等 Google 产品一律禁止。**

### Is there a referral bonus? · 有推荐奖励吗？

**English:** Yes — refer a developer friend; if they sign and release a fitting game, **both** receive a bonus. Cannot refer into P4D Early Access; bonus applies **after signed release**.

**中文：** 有 — 推荐开发者朋友；若其签约并成功发布合适游戏，**双方**获奖励。不能推荐进入 P4D 早期访问；奖励在**签约发布之后**生效。

### How do you determine fullscreen eligibility? · 全屏资格如何决定？

**English:** Case-by-case: whether fullscreen **greatly improves** experience, plus design, quality, performance; policy evolves with metrics. Details: [Fullscreen For Games](https://sdk.poki.com/fullscreen-for-games.html) — **待核** (body missing from local capture).

**中文：** 逐案评估：全屏是否**显著改善**体验，及设计、质量、性能；策略随数据演进。详见 [Fullscreen For Games](https://sdk.poki.com/fullscreen-for-games.html) — **待核**（本地抓取无正文）。

### Submission & access (context) · 提交与访问（背景）

**English:** P4D and playtesting are **limited-access closed beta**. Submit via the game submission form; team curates every title and may not reply to all — they contact you if it’s a fit. After acceptance: implement **mandatory requirements** + **SDK**.

**中文：** P4D 与试玩工具为**限量封闭测试**。通过游戏提交表单申请；团队人工筛选，未必回复全部 — 合适时会联系。接受后须完成**强制要求** + **SDK**。

### Revenue sharing (platform overview) · 收入分成（平台概述）

**English:** Direct/bookmark/search/your community traffic → **100%** to you on that user. Traffic via Poki.com or Poki marketing → **50/50 split**. Web exclusivity applies to open web (not Steam/mobile stores).

**中文：** 直接/书签/搜索/自有社区流量 → 该用户 **100%** 归你。经 Poki.com 或 Poki 营销 → **50/50**。网页独家适用于开放网页（不含 Steam/移动商店）。

---

## 其他说明

**English:** For questions not covered here, email your Poki contact or developersupport@poki.com.

**中文：** 未涵盖问题请联系 Poki 对接人或 developersupport@poki.com。

**English:** Merchandise, Flash conversion, and other FAQ items outside payment/submission/tracking are omitted here; see [official FAQ](https://sdk.poki.com/).

**中文：** 周边、Flash 转换等与本篇主题无关的 FAQ 条目未收录；见 [官方 FAQ](https://sdk.poki.com/)。
