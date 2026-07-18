# 02 · Requirements：技术、玩法、广告、账户与质量

> **非官方整理稿。** 以 [https://docs.crazygames.com/](https://docs.crazygames.com/) 英文原文为准。  
> **最近核对日期：** 2026-07-18  
> **原始抓取：** `docs/文档整理todo/crazygames/第1部分-crazygames.txt`

---

## Requirements 前言

**English:** To publish on CrazyGames, games must meet platform standards (fun, unique, visually appealing, properly integrated). Launch has two steps—see [01](./01-平台概览与双阶段发布.md). **Basic Launch** can go live without customizing for CrazyGames (SDK optional, monetization off). After selection for **Full Launch**, you must comply with **all** integration requirements below, including the SDK. **Full Implementation includes Basic requirements.**

**中文：** 上架须满足平台标准（好玩、有特色、观感与集成到位）。发布两步见 [01](./01-平台概览与双阶段发布.md)。**Basic** 可不做平台定制（SDK 可选、变现关）。获选 **Full** 后须满足下列**全部**集成要求（含 SDK）。**Full 包含 Basic。**

---

## Summary table · Basic vs Full（摘要）

| Category | Basic Implementation | Full Implementation |
|----------|----------------------|---------------------|
| **Technical** | Initial download ≤ **50MB**；总包与文件数限制（见下）；SDK 可选 | SDK **强制**；含 gameplay 事件等 |
| **Gameplay** | Basic visual QA；**PEGI 12** / 13+ 受众等 | Full visual QA；**尽快进入真实玩法**（见下） |
| **Advertisement** | CG 变现禁用；**无外部广告** | 仅通过 SDK 广告并遵守指南；**AdBlock 下仍可玩** |
| **Account** | 仅在适用时 | 无外部登录；进度绑 CrazyGames Account 等（适用时） |

---

## Technical · 技术要求

### File size & count · 包体与文件数

**English (digest — verify live docs if conflict):**

- **Initial download ≤ 50MB**. For **mobile homepage** eligibility, initial download **≤ 20MB**.
- With SDK: initial download is measured from load start until first **`gameplayStart`** (reachable playable state; not counting menus/extra loads after that).
- **Total file size ≤ 250MB**; **file count ≤ 1500**.
- Without SDK: treat total size as initial → effectively **≤ 50MB** (mobile homepage **≤ 20MB**). Summary table wording: “≤ 250MB (50MB without SDK)” — same idea, different phrasing; **confirm on current Technical page**.
- External resources: QA may assess time-to-playable **≤ ~20s**.
- Use **relative paths only** (no absolute paths).

**中文：**

- **初始下载 ≤ 50MB**；若要具备**移动首页**资格，初始下载 **≤ 20MB**。
- 有 SDK 时：从加载开始计量到首次 **`gameplayStart`**（进入可玩态）。
- **总包 ≤ 250MB**；**文件数 ≤ 1500**。
- 无 SDK 时：总包视作初始 → **≤ 50MB**（移动首页 **≤ 20MB**）。摘要表另有「250MB（无 SDK 则 50MB）」表述——语义接近，**以现行 Technical 页为准**。
- 外链资源：QA 可能按到达可玩约 **≤ 20s** 评估。
- **仅相对路径**。

### SDK（技术侧）

**English:**

- **Basic:** SDK optional; if integrated, must fire **gameplay start** appropriately; ads remain disabled.
- **Full:** SDK required; `gameplayStart` / `gameplayStop`; Data/User when applicable; optional `loadingStart` / `loadingStop`; HTML5 (and listed engines) must support **`muteAudio`**.

**中文：** Basic 可选 SDK；Full **强制** SDK 与玩法起止事件；适用则 Data/User；须支持平台 **`muteAudio`**。详见 [04](./04-HTML5-SDK与游戏模块.md)。

### Browsers & input · 浏览器与输入

**English:** Support Chrome / Edge; if Safari is poor, disable Safari; if Chromebook 4GB RAM is not smooth, disable Chromium OS. Mouse/keyboard on desktop; touch on mobile. Desktop must be playable in **landscape**; portrait with letterboxing/side art allowed.

**中文：** 支持 Chrome / Edge；Safari / Chromebook 不畅可禁用对应环境。桌面键鼠、移动触控；桌面须横屏可玩。

---

## Gameplay · 玩法要求

### Basic

**English:** Visual/functional checks; readable at required iframe sizes; physics consistent at high refresh (e.g. 144/165Hz); **English required**; intuitive controls; stable (no crashes); original; **no custom fullscreen button**; no cross-promotion (limited exceptions); **PEGI 12** / audience 13+.

**中文：** 基础视觉与功能检查；在指定 iframe 尺寸下可读；高刷新率下物理一致；**须英语**；控制直观；稳定；原创；**禁止自定义全屏按钮**；禁止交叉推广（有限例外）；**PEGI 12** / 受众 13+。

### Full（额外）

**English:** New users should land **directly in gameplay**; if not feasible, **at most one click** to start playing.

**中文：** 新用户应**立即进入玩法**；不可行则**最多一次点击**开始玩。

### Reference iframe sizes（可读性检查，16:9 示例）

桌面非全屏示例：907×510、1216×684、1077×606、821×462；桌面全屏示例：1366×768、1920×1080、1536×864、1280×720；mobile 800×450；tablet 1080×607。（以官网列表为准。）

---

## Advertisement · 广告要求（政策层）

| Phase | English | 中文 |
|-------|---------|------|
| Basic | Monetization off; **no external ads**; if Ads SDK present, game must still work when ads disabled (no soft-lock, no dead rewarded buttons) | 变现关；**无外部广告**；接了广告 API 也须在禁用时仍可玩 |
| Full | Ads **only** via CrazyGames SDK; follow guidelines; must remain playable with **AdBlock** | **仅** SDK 广告；遵守指南；**AdBlock 下可玩** |

**English:** Types include midgame, rewarded, in-game banners. Forbidden: interrupting core play unfairly, deceptive triggers, chaining multiple ads. Midroll: about **at most once per 3 minutes** (platform-managed; early requests ignored or error — see [05](./05-广告模块-视频与横幅.md)). Banners: useful screen, average open **≥ 5s**; don’t block UI; not during active gameplay; max **2** per screen.

**中文：** 类型含 midgame、rewarded、局内 banner。禁止不公平打断、欺骗触发、串联多广告。中插约 **最多每 3 分钟 1 次**（平台管控）。Banner：有用屏、平均打开 ≥5s；不挡 UI；玩法中勿出；每屏最多 2 个。API 细则见 [05](./05-广告模块-视频与横幅.md)。

---

## Account integration · 账户集成

**English:**

- **Basic:** only when applicable.
- **Full (when applicable):** no external login options; progress linked to CrazyGames Account; use CrazyGames username & avatar; CG users auto-login.
- If the game has no user concept, User module may be skipped; Data module or APS may apply.
- Cloud save options include Data module (preferred), own backend + User, or APS — **APS prohibited when IAP is used**.
- Guests must be able to play; no in-game Facebook/Google/email login; “Login with CrazyGames” should not be the main CTA; don’t auto-show Auth prompt.

**中文：** Full 适用时：无外部登录；进度绑 CG 账号；用平台用户名与头像。无用户概念可不接 User。云存优先 Data；有 IAP 时禁止 APS。游客可玩；勿把平台登录当主按钮或自动弹登录。详见 [06](./06-用户数据内购排行榜支付与FAQ.md)。

---

## Multiplayer · 多人（短注）

**English:** Multiplayer titles may bypass Basic when they need a large audience; QA decides. Fangrush is primarily single-player board content—treat multiplayer pages as **out of scope** unless you add online modes.

**中文：** 多人可能跳过 Basic；由 QA 判定。Fangrush 以单机棋盘为主——多人专章默认**不在范围内**，除非后续做联机。

---

## Quality guidelines · 质量指南（Guideline）

**English (highlights):** Land in gameplay quickly; skippable tutorials; less text / more visual; clear controls; buttons clear (not misleading toward ads); clear goals; easy to learn; consistent controls; responsive; comfortable AV; avoid boring repetition; updatable content; name must not confuse with others / avoid generic unowned names (e.g. bare “Chess”); covers/name match genre; high-quality consistent art/audio.

**Restricted keys:** Escape closes fullscreen; Ctrl/Cmd+W closes tab; consider AZERTY (ZQSD) where relevant.

**中文：** 快进玩法、教程可跳、偏视觉引导、控制清晰、勿诱导广告按钮、目标清楚、易学、响应快、音画舒适、少无聊重复、可更新内容、命名勿混淆/勿用无授权通用名；封面与品类一致。注意保留 Escape / Ctrl+W 等系统键语义。

封面硬规格见 [03](./03-游戏封面与素材.md)。

---

## Fangrush 提示

**English:** Meet English UI for portal builds; land in a playable board ASAP for Full; keep Admin/external ads out of CG packages; plan package size vs 50MB/20MB homepage goals early.

**中文：** 门户包英文本地化；Full 要求尽快进可玩棋局；CG 包无 Admin/外站广告；尽早按 50MB（移动首页 20MB）目标控初始包。
