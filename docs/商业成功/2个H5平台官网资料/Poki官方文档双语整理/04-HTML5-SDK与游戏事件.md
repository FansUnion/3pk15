# 04 · HTML5 SDK 与游戏事件

> **非官方整理稿。** 本文不是 Poki 官方中文文档；一切以实现为准，请以 [Poki SDK 英文原文](https://sdk.poki.com/) 为准。  
> **最近核对日期：** 2026-07-17  
> **原始抓取：** [docs/文档整理todo/poki内容/](../../文档整理todo/poki内容/)

---

## 适用范围

- 本文仅整理 **HTML5 / 通用 SDK** 内容。
- Defold、Unity、GameMaker、Phaser 3、Godot、Cocos、Construct 3、GDevelop 等引擎专用集成步骤见 [官方各引擎页面](https://sdk.poki.com/)，本文不收录引擎正文。

---

## SDK General Info · 事件语义总览

### 为何需要 SDK 事件

**English:** The Poki SDK lets you track key metrics by firing a few events at the right moments. Dashboard data includes Daily Playing Users, Engagement (time in game, loading, ads), Earnings, Error Scanner (24h errors, hourly refresh), and Player Feedback.

**中文：** Poki SDK 通过在合适时机触发少量事件，即可汇总核心指标。后台数据包括日活（访客与可玩比例）、参与度（游戏时长、加载与广告耗时）、收入、错误扫描（近 24 小时、每小时更新）及玩家反馈。

### 事件定义

**English:**

| Event | When to fire |
|-------|--------------|
| `gameLoadingFinished()` | Loading is complete; used for Conversion to Play tracking. |
| `gameplayStart()` | Player starts interacting (moving, clicking, etc.). |
| `gameplayStop()` | Gameplay halts (pause, level end, game over, death, menu). |
| `commercialBreak()` | Natural break before returning to gameplay (between levels, restart, etc.). |
| `rewardedBreak()` | Player opts in to watch an ad for an in-game reward. |

**中文：**

| 事件 | 触发时机 |
|------|----------|
| `gameLoadingFinished()` | 加载完成；用于 Conversion to Play 统计。 |
| `gameplayStart()` | 玩家开始交互（移动、点击等）。 |
| `gameplayStop()` | 玩法暂停（暂停、关卡结束、死亡、菜单等）。 |
| `commercialBreak()` | 回到玩法前的自然断点（关卡间、重开等）。 |
| `rewardedBreak()` | 玩家主动选择看广告换取奖励。 |

### 典型事件顺序

**English:**

- **Startup:** `gameLoadingFinished()` → `gameplayStart()`
- **Die & restart:** `gameplayStop()` → `commercialBreak()` → `gameplayStart()`
- **Die & revive (rewarded):** `gameplayStop()` → `rewardedBreak()` → `gameplayStart()`
- **Next level:** `gameplayStop()` → `commercialBreak()` → `gameplayStart()`
- **Next level with double reward:** `gameplayStop()` → `rewardedBreak()` → `gameplayStart()`
- **Pause / unpause:** `gameplayStop()` → `gameplayStart()`
- **Note:** If an ad plays without interrupting gameplay (e.g. unlock a skin), you do **not** need extra `gameplayStop()` / `gameplayStart()`.

**中文：**

- **启动：** `gameLoadingFinished()` → `gameplayStart()`
- **死亡重开：** `gameplayStop()` → `commercialBreak()` → `gameplayStart()`
- **死亡复活（激励）：** `gameplayStop()` → `rewardedBreak()` → `gameplayStart()`
- **下一关：** `gameplayStop()` → `commercialBreak()` → `gameplayStart()`
- **下一关双倍奖励：** `gameplayStop()` → `rewardedBreak()` → `gameplayStart()`
- **暂停/恢复：** `gameplayStop()` → `gameplayStart()`
- **注意：** 若广告不打断玩法（如解锁皮肤），无需额外 `gameplayStop()` / `gameplayStart()`。

### 审核常见错误（Requirements 摘录）

**English:**

- Do not fire the same event twice in a row (e.g. two `gameplayStart()` or two `gameplayStop()`).
- `gameplayStart()` must fire on the **first player input**, not on load.
- `gameplayStop()` must fire on any gameplay interruption (pause, menu, level end, cutscene).
- Do not fire SDK events during midrolls or rewarded videos.
- `commercialBreak()` only when **exiting pause and returning to gameplay** — e.g. close Pause menu → gameplay ✅; leave gameplay → level select ❌. Edge case: dress-up games may fire `gameplayStop()` + `commercialBreak()` when switching clothing categories.

**中文：**

- 同一事件不可连续触发两次。
- `gameplayStart()` 须在**首次玩家输入**时触发，而非加载完成时。
- 任何玩法中断（暂停、菜单、关卡结束、过场）都应触发 `gameplayStop()`。
- 插播/激励视频播放期间不得触发 SDK 事件。
- `commercialBreak()` 仅用于**退出暂停并回到玩法**；离开玩法进入选关 ❌。边缘：换装类游戏切换服装类别时可触发 `gameplayStop()` + `commercialBreak()`。

### 测试工具：Poki Inspector

**English:** Drag a folder with `index.html` into [Poki Inspector](https://sdk.poki.com/) (or open from P4D Versions tab). The tool runs the game as on the live platform, shows the Event Log, supports Desktop/Mobile (QR) modes, scaling tests, and warnings (external resources, image optimization, unexpected SDK behavior).

**中文：** 将含 `index.html` 的文件夹拖入 [Poki Inspector](https://sdk.poki.com/)（或从 Poki for Developers 版本页打开）。工具按上线环境运行游戏、输出事件日志，支持桌面/移动（二维码）、缩放测试及警告（外部资源、图片优化、SDK 异常行为）。

### CLI 上传

**English:** Poki for Developers CLI uploads builds from terminal or CI. See the official GitHub repo for install details.

**中文：** Poki for Developers 命令行工具支持终端/CI 上传构建，安装方式见官方 GitHub 仓库。

---

## HTML5 · 集成步骤

### 1. Initialize · 初始化

**English:** Add the SDK script in `<head>`, then call `PokiSDK.init()` at game start. Continue loading the game in both `then` and `catch`.

**中文：** 在 `<head>` 引入 SDK 脚本，游戏启动时调用 `PokiSDK.init()`；无论成功或失败都应继续进入游戏。

```html
<script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js"></script>
```

```javascript
PokiSDK.init().then(() => {
    console.log("Poki SDK successfully initialized");
    // continue to game
}).catch(() => {
    console.log("Initialized, something went wrong, load your game anyway");
    // continue to game
});
```

### 2. gameLoadingFinished · 加载完成

**English:** Fire when loading finishes for accurate Conversion to Play.

**中文：** 加载完成后触发，用于准确的「转化到游玩」指标。

```javascript
PokiSDK.gameLoadingFinished();
```

### 3. gameplayStart / gameplayStop · 玩法起止

**English:** `gameplayStart()` on level start and unpause; `gameplayStop()` on level finish, game over, pause, quit to menu.

**中文：** 关卡开始/取消暂停时 `gameplayStart()`；关卡结束、Game Over、暂停、回菜单时 `gameplayStop()`。

```javascript
PokiSDK.gameplayStart();
// player is playing...
PokiSDK.gameplayStop();
```

### 4. commercialBreak · 插播广告

**English:** Trigger on natural breaks. Implement `commercialBreak()` **before every** `gameplayStart()` when the player intends to continue. Not every call shows an ad — signal as many opportunities as Poki’s system allows. Pause game/audio in the callback.

**中文：** 在自然断点触发；玩家打算继续玩时，建议在每次 `gameplayStart()` **之前**调用。并非每次都会出广告，应尽可能上报机会。在回调中暂停游戏/音频。

```javascript
PokiSDK.commercialBreak(() => {
  // pause background music if needed
}).then(() => {
  // resume audio, continue game
});
```

### 5. rewardedBreak · 激励广告

**English:** Player must know they are about to watch an ad. Optional object: `size` (`small` | `medium` | `large`), `onStart` callback. `success` in `then` indicates whether the ad was shown — grant reward only on success. A rewarded break resets the commercial ad timer so users do not immediately see another midroll.

**中文：** 须事先告知玩家将观看广告。可选参数：`size`（`small`/`medium`/`large`）、`onStart`。`then(success)` 为 true 才发奖。激励广告会重置插播计时器，避免紧接着再出插播。

```javascript
PokiSDK.rewardedBreak({
    size: 'medium',
    onStart: () => {},
}).then((success) => {
    if (success) {
        // grant reward
    }
});
```

---

## Final Steps · 上线前必做

### 广告期间静音并禁用输入

**English:** Mute audio and disable keyboard input during `commercialBreak()` and `rewardedBreak()` so the game does not interfere with ads. Re-enable after the break, then fire `gameplayStart()` if resuming gameplay.

**中文：** 插播与激励广告期间静音并禁用键盘输入，避免干扰广告；结束后恢复，若继续玩法则触发 `gameplayStart()`。

```javascript
// gameplayStop(); mute; disable input
PokiSDK.commercialBreak().then(() => {
    // unmute; enable input
    PokiSDK.gameplayStart();
});
```

### 防止父页面滚动

**English:** Space and arrow keys scroll the parent page on Poki (game is embedded, not full-window). Prevent default on those keys and on wheel events.

**中文：** Poki 上游戏嵌入长页面，空格/方向键会滚动父页。应对这些按键及滚轮调用 `preventDefault`。

```javascript
window.addEventListener('keydown', ev => {
    if (['ArrowDown', 'ArrowUp', ' '].includes(ev.key)) {
        ev.preventDefault();
    }
});
window.addEventListener('wheel', ev => ev.preventDefault(), { passive: false });
```

### shareableURL · 可分享链接

**English:** Build shareable URLs with custom params (prefixed with `gd` on Poki).

**中文：** 生成带自定义参数的可分享 URL（在 Poki 上以 `gd` 为前缀）。

```javascript
PokiSDK.shareableURL({ id: 'myid', type: 'mytype' }).then(url => {
    // e.g. https://poki.com/en/g/my-game?gdid=myid&gdtype=mytype
});
```

### getURLParam · 读取 URL 参数

**English:** Read params from the Poki URL; helper resolves `gd`-prefixed or plain names.

**中文：** 读取 Poki 页面 URL 参数；辅助函数同时处理 `gd` 前缀与普通参数名。

```javascript
const id = PokiSDK.getURLParam('id');
// returns gdid from poki.com or id from current URL
```

### movePill · 移动端 Poki Pill 位置

**English:** Reposition the Poki Pill on mobile: `PokiSDK.movePill(topPercent, topPx)`. `topPercent` is 0–50 (% from top of game area, not below 50%). `topPx` adds pixel offset (positive = down). Default: `movePill(0, 24)`. Pill size: 46×62px (width &lt; 1211px) or 92×64px (≥ 1211px).

**中文：** 移动端微调 Poki Pill：`PokiSDK.movePill(topPercent, topPx)`。`topPercent` 为 0–50（相对游戏区域顶部，不可低于 50%）。`topPx` 为像素偏移（正数向下）。默认 `movePill(0, 24)`。尺寸：屏宽 &lt; 1211px 为 46×62px；≥ 1211px 为 92×64px。

```javascript
PokiSDK.movePill(50, -100); // 100px above vertical center
```

---

## User Accounts · 用户账户（optional / recommended）

> **English:** Optional capability — enables login, personalized experiences, and backend-verified identity. Not required for basic SDK integration.  
> **中文：** **可选能力** — 支持登录、个性化与后端验证身份；基础 SDK 集成不强制要求。

### 主要 API

**English:**

- `login()` — Prompt login on user action only (not on load). Success may full-page refresh; 45s timeout or closed panel rejects.
- `getUser()` — Returns `{ username, avatarUrl }` or `null`.
- `getToken()` — JWT for backend verification; **expires in 1 minute**; do not store; regenerate each verification.

**中文：**

- `login()` — 仅在需要账户的用户操作中调用（勿在加载时自动弹出）。成功可能整页刷新；关闭面板或超过 45 秒会 reject。
- `getUser()` — 返回 `{ username, avatarUrl }` 或 `null`。
- `getToken()` — 供后端验证的 JWT；**1 分钟过期**；勿持久化；每次验证重新获取。

### 后端验证

**English:** `GET https://user-vault.poki.com/auth/verify-token` with `Authorization: Bearer <token>` and `X-Poki-Team-Api-Key` (from account manager). Returns immutable per-game `user_id`.

**中文：** 使用 `Authorization: Bearer <token>` 与 `X-Poki-Team-Api-Key`（向客户经理索取）请求上述端点，返回每游戏唯一且不变的 `user_id`。

**English (Inspector debug):** With debug mode, `getUser()` returns mock data; `getToken()` returns a long-lived test token resolving to `debug-user-id`.

**中文（Inspector 调试）：** 调试模式下 `getUser()` 返回模拟数据；`getToken()` 返回可用于完整验证流程的测试令牌。

---

## Cloud Gamesaves · 云存档（optional / recommended）

> **English:** Optional — when a user is logged in, saves sync automatically via `localStorage` and `IndexedDB` monitoring; no extra SDK calls.  
> **中文：** **可选能力** — 用户登录后自动同步 `localStorage` 与 `IndexedDB` 变更，无需额外 SDK 调用。

**English:**

- Prefix keys/stores/row keys with `poki_ignore` to exclude from cloud sync (caches, temp state, analytics buffers).
- Payload limit: **1 MB after gzip**. Exceeding disables cloud saves for that player.

**中文：**

- 以 `poki_ignore` 前缀标记的数据不参与云同步（缓存、临时状态、分析缓冲等）。
- 存档 gzip 后不得超过 **1 MB**；超限则对该玩家禁用云同步。

---

## Game Events · measure()（optional）

> **English:** Optional analytics beyond mandatory SDK events. Use `PokiSDK.measure(category, what, action)` for checkpoints.  
> **中文：** **可选** — 在必需 SDK 事件之外，用 `measure()` 记录分析检查点。

**English:** `category` = broad group (`level`, `tutorial`, `button`, …); `what` = specific id; `action` = state. Special actions: `start` / `complete` / `fail` (progress); `visible` / `interact` (UI). Commercial and rewarded breaks are tracked automatically — no extra `measure()` for ads.

**中文：** `category` 为分组；`what` 为具体标识；`action` 为状态。特殊值：`start`/`complete`/`fail`（进度），`visible`/`interact`（交互）。插播与激励广告由 SDK 自动统计，无需额外 `measure()`。

```javascript
PokiSDK.measure('level', '1', 'start');
PokiSDK.measure('level', '1', 'complete');
PokiSDK.measure('button', 'reward-revive', 'visible');
PokiSDK.measure('button', 'reward-revive', 'interact');
```

---

## 上传与验收

**English:** Upload to Poki for Developers, validate in Poki Inspector (Event Log + QA modules), then request review. Contact: Discord or developersupport@poki.com.

**中文：** 上传至 Poki for Developers，在 Poki Inspector 核对事件日志与 QA 模块后申请审核。联系：Discord 或 developersupport@poki.com。
