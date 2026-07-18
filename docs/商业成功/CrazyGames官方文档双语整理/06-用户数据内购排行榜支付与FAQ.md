# 06 · 用户、数据、内购、排行榜、支付与 FAQ

> **非官方整理稿。** 以 [https://docs.crazygames.com/](https://docs.crazygames.com/) 英文原文为准。  
> **最近核对日期：** 2026-07-18  
> **原始抓取：** `docs/文档整理todo/crazygames/第2部分-crazygames.txt`  
> **Fangrush 首发：** User / Data / IAP / Leaderboards 多标为**可延后**；Basic 可不接。以 [02 Account](./02-Requirements技术玩法广告账户与质量.md) 适用条件为准。

---

## User module · 用户模块

**English (highlights):**

- `isUserAccountAvailable` — may be unavailable when embedded on other domains.
- `getUser()` → `username` (**6–20** chars: alphanumeric, `.`, `_`), `profilePictureUrl`; `null` if logged out.
- `__dangerousUserId` — **do not** use for auth; use `getUserToken()` (JWT, **~1 hour**, verify server-side with `https://sdk.crazygames.com/publicKey.json`).
- `systemInfo` — countryCode, locale, device, os, browser, applicationType, etc.
- `listFriends({ page, size })` — page from 1; **max size 50**; rate limit **~250ms**; errors include `userNotAuthenticated` / `rateLimited` / `requestInProgress`.
- Auth prompt / account link flows exist; strongly consider account link when using IAP or creating guest progress that should persist.

**中文：** 可取用户名与头像；鉴权用 JWT 而非危险 userId；好友列表有分页与限流。内购或需持久进度时考虑账号关联提示。

---

## Data module · 数据（云存）

**English:**

- API shaped like `localStorage`: `getItem` / `setItem` / `removeItem` / `clear`.
- Logged-in users sync to cloud; guests use local storage; login merges/uploads.
- Limit **1MB** (JSON string). Over limit → `dataLimitExcedeed` (**spelling as in SDK dump**).
- Debounce ~**1s** (up to **~30s** in special cases).
- Must enable Progress Save on submit or calls may fail with `dataModuleDisabled`.
- Prefer **fully** relying on Data module when used — don’t mix conflicting local-save logic.

**中文：** 类 localStorage API；登录云同步；上限 **1MB**；提交时勾选进度保存。使用时尽量统一走 Data，避免两套存档打架。

---

## In-game purchases · 内购（邀请制 / 可延后）

**English:**

- Invite-only; requires **Full Implementation**; partner **Xsolla**.
- **Logged-in users only** — guests cannot purchase.
- Use SDK Xsolla token; purchases bound to CrazyGames userId.
- Preview: Xsolla token noted as available in preview flows.
- Some countries restrict loot-box-like mechanics (list in official docs).

**中文：** 邀请制；须 Full；**仅登录用户**可买；走 Xsolla。棋类首发通常**不做** CG IAP，手机店 IAP 另按渠道路线。

---

## Leaderboards · 排行榜（邀请制 / 可延后）

**English:**

- **One** leaderboard per game.
- Weekly seasons Mon→Mon; end **09:00 UTC**; scores reset.
- Scopes: global / country / friends; trophies for top 3 and top 1%/5%/10%.
- Submit via client SDK (tamperable) or server API; needs keys; guide text **≤ 50** characters.

**中文：** 每游戏一个榜；周赛重置；客户端提交可被篡改，重要成绩宜服务端。首发可不做。

---

## Payouts · 支付

**English:**

- Platform: **Tipalti**. Contact: `finance@crazygames.com`.
- Setup: Developer Portal → **Account → Billing** (complete steps).
- Methods: Wire / ACH / eCheck / PayPal (by country); optional **Hold Payments**.
- **Minimum payout: €100**.
- Cadence: monthly, or when unpaid total reaches €100; terms **NET 60**, practical target often by ~10th of next month (docs describe as practically faster).
- Invoice threshold **€10** (below rolls to next month).
- Incomplete billing setup may block game submission; Hold Payments can finish onboarding first.

**中文：** Tipalti；Billing 配齐；最低提现 **€100**；月结 / 达门槛；条款 NET 60（实务可能更快）。未配支付信息可能影响提交。

---

## FAQ 精选（抓取中有依据的部分）

### 已有依据

| Topic | Digest |
|-------|--------|
| SDK existence | Yes; HTML5/Unity/Godot fullest |
| Need full SDK? | Basic can avoid full integration; Full requires compliant integration |
| Already live elsewhere | Invited titles may skip Basic; cross-promo to Steam/Epic allowed in limited desktop-menu/demo-end cases (not main CTA) |
| Engines | Many supported; HTML5 path is first-class for Fangrush |

### 待核官网（本地 dump 仅有目录/无答案正文）

下列题目在原料中**缺少答案段落**，签约/决策前请打开现行 FAQ：

- Will you iframe a game hosted on another portal / own domain?
- Do I still own my game?
- Published on Steam / Play / App Store / Facebook — still eligible for revenue share?
- Full answer bodies for “already live elsewhere” beyond Intro bypass note

**中文：** 所有权、他站 iframe、Steam/商店是否仍分账等 —— **待核官网**，本整理不臆造。

---

## Partners / Web Games 101

**English:** Partner marketing pages and “Web Games 101” FAQs are general industry Q&A. See raw capture or official FAQ Part 2; not expanded here.

**中文：** Partners 与 Web Games 101 通识见原料或官网 FAQ Part 2；本篇不展开。

---

## Fangrush 提示

**English:** Ship Full Launch with ads + game events first; add Data/User if cloud progress becomes a retention need; skip CG IAP/leaderboards unless invited and product-ready. Keep multi-platform (Poki + CG + later stores) aligned with **non-exclusive** channel plan until a contract says otherwise.

**中文：** Full 优先广告 + 游戏事件；云存按需再上 Data/User；内购/排行榜默认延后。多平台并行以渠道路线**非独家**为准，直至合同另有约定。
