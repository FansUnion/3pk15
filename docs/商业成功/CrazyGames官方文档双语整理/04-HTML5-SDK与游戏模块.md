# 04 · HTML5 SDK 与游戏模块

> **非官方整理稿。** 以 [https://docs.crazygames.com/](https://docs.crazygames.com/) 英文原文为准。  
> **最近核对日期：** 2026-07-18  
> **原始抓取：** `docs/文档整理todo/crazygames/第2部分-crazygames.txt`  
> **范围：** 仅 **HTML5 SDK v3**；其他引擎见官网。

---

## Modules overview · 模块一览

**English:** HTML5 / Unity / Godot SDKs support full scenarios. Modules include:

**中文：** HTML5（及 Unity/Godot）覆盖完整场景。模块包括：

| Module | Role |
|--------|------|
| `ad` | Video ads & adblock detection |
| `banner` | In-game banners |
| `game` | Game events & integration |
| `user` | Logged-in user |
| `data` | Cross-device persistent data |
| In-game purchases | Via Xsolla (not a separate module) |

广告细则见 [05](./05-广告模块-视频与横幅.md)；User/Data/IAP 见 [06](./06-用户数据内购排行榜支付与FAQ.md)。

---

## Install & init · 安装与初始化

**English:** Load the SDK in `<head>` before game code:

**中文：** 在 `index.html` 的 `<head>`、游戏代码之前加载：

```html
<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>
```

**English:** v3 requires explicit init before use:

**中文：** v3 使用前须显式初始化：

```javascript
await window.CrazyGames.SDK.init();
```

**English:** Init is async; do not call other SDK APIs before it resolves. Prefer a loading screen during init. Promises have no callback parameters; use `.then` / `.catch` as needed.

**中文：** 初始化异步；完成前勿调其他 API。建议用加载屏等待。无旧式 callback 参数，可用 Promise。

**English (v2→v3):** Manual init required; some getters became properties; loading API renamed; errors unify as `{ code, message }`.

**中文：** 相对 v2：须手动 init；部分 getter 变属性；loading API 改名；错误统一为 `{ code, message }`。

---

## Game module · 游戏事件

### Loading

**English:**

- `loadingStart()` / `loadingStop()` — optional but useful for accurate metrics.

**中文：** `loadingStart()` / `loadingStop()` — 可选，利于准确指标。

### Gameplay start / stop

**English:**

- `gameplayStart()` — player is in active gameplay. **First** `gameplayStart` is used for initial-download measurement (time-to-playable).
- `gameplayStop()` — pause, menus, level end, etc. Fire stop when leaving active play.
- Do **not** call `gameplayStop` merely because the window lost focus.

**中文：**

- `gameplayStart()` — 进入活跃玩法；**首次** start 用于初始下载/可玩耗时计量。
- `gameplayStop()` — 暂停、菜单、关卡结束等离开活跃玩法时。
- **不要**仅因窗口失焦就 `gameplayStop`。

### Progress

**English:** `reportGameCompletedPercentage(0–100)` — report completion progress (portal docs mention progress reporting; align with your level progression, e.g. campaign completion).

**中文：** `reportGameCompletedPercentage(0–100)` — 上报完成进度（与关卡进度对齐）。

### Settings from platform

**English:**

- **`muteAudio`** — platform mute; takes priority over in-game volume toggles. Local test: `?muteAudio=true`.
- **`disableChat`** — `?disableChat=true` for local testing where relevant.

**中文：** 须遵守平台 **`muteAudio`**（优先于游戏内音量开关）；本地可用查询参数测试。

### Other (brief)

**English:** Also documented: `happytime()`, `setGameContext` / `clearGameContext`, multiplayer room helpers — use only if product needs them.

**中文：** 另有 `happytime()`、游戏上下文、多人房间等——按产品需要选用。

---

## Development & testing · 开发与测试环境

| Environment | Behavior (digest) |
|-------------|-------------------|
| `localhost` / `127.0.0.1` | Local; ads unavailable (overlay messaging); `?useLocalSdk=true` may force local SDK |
| Editors | Demo ads/banners |
| **Preview** `crazygames.com/preview` | Closest to production; **Xsolla token only works here** among non-prod notes |
| CrazyGames domains | Normal `crazygames` env |
| Other domains | `disabled` — SDK calls throw |

**English:** Use Developer Portal preview / QA tool before submission.

**中文：** 提交前用 Developer Portal 预览与 QA 工具。

---

## Fangrush 提示

**English:** Non-CG environments must degrade safely (no throw that bricks the standalone site). Wire loading + gameplay start/stop to real board sessions; report progress against the 24-level (or expanded) campaign. Honor `muteAudio` for Full Launch.

**中文：** 非 CG 环境须安全降级（勿拖垮独立站）。loading / gameplay 事件对齐真实对局；进度上报对齐关卡战役。Full 须正确响应 `muteAudio`。
