# Fangrush · 三狼连猎

非对称围猎棋（3 狼 vs 15 羊）的 Web 游戏。玩法与规格见 [`docs/`](docs/)。

**边界**：业务代码 = `game-core` + `web`；自动化测试只在 game-core（Vitest）。无独立 backend、无 E2E、无 web 单测包；App（Capacitor）一期不上，仅有 stub。

---

## 1. 游戏是怎么串起来的

**`game-core` 判定真相**（合法着法、胜负、AI、存档 schema）；**`apps/web` 负责呈现与会话**（点哪里、播什么音、进度写哪、广告走哪）。

```text
玩家点棋盘 (PlayScreen / BoardSvg)
        │
        ▼
  play-store（本局会话）
        │  调用 applyAction / listLegalActions / pickSheepAction
        ▼
  packages/game-core
        │  rules · ai · content(levels/save/skins/quests)
        │
        ├─ 画面反馈 ← BoardSvg 高亮 / juice
        ├─ 音效     ← sfx
        └─ 通关结算 → save-store → storage(localStorage)
                              ↘ 可选广告 ← ads (IAds)
```

### 1.1 `game-core` 内核

| 区域 | 职责 |
|------|------|
| `src/rules.ts` 等 | 局面、合法着法、`applyAction`、连吃、胜负 |
| `src/ai/` | `pickSheepAction`（easy / normal / hard），对局与 Admin 共用 |
| `src/content/` | 关卡表、`SaveGame`、皮肤 Catalog、任务 |

### 1.2 `apps/web/src/lib/` 壳层

| 模块 | 干什么 |
|------|--------|
| **play-store** | **本局会话**（zustand）：`BoardState`、选中狼、可走/可吃高亮、连吃、羊思考延时。走子 / 结束连吃 / 重置都经此调 core，UI 不私写吃子或胜负。 |
| **save-store** | **跨局进度**（zustand）：章节解锁、碎片、皮肤、任务、静音等。hydrate 后读写；通关奖励先落这里。 |
| **storage** | **存档适配器**（`IStorage` → `localStorage`）：load / persist / migrate；失败回默认档。 |
| **sfx** | 走子 / 吃子 / 连吃 / 胜负等音效；缺文件程序化兜底；尊重静音。 |
| **ads** | **`IAds`**：按 env 选 Mock / 门户 SDK / AdSense 占位；激励发奖只认 `ok`。 |
| **adapters/** | 原生预留（现仅 `capacitor-stub.ts`）；将来仍走同一套 `IStorage` / `IAds`。 |

### 1.3 壳层其它目录

| 路径 | 内容 |
|------|------|
| `src/components/PlayScreen.tsx` | 对局页：接 play-store + save-store，结算、静音、重置 |
| `src/components/BoardSvg.tsx` | 棋盘渲染与点击 |
| `src/components/admin/*` | 独立站驾驶舱；AI 仍调同一 `pickSheepAction` |
| `src/i18n/`、`middleware.ts`、sitemap / robots | 中英语言与收录 |
| `public/` | 皮肤 SVG、音效、品牌图 |

---

## 2. 仓库地图

除 `game-core` 与 `web` 外，几乎没有第三个业务包。

| 路径 | 角色 |
|------|------|
| `packages/game-core` | 玩法内核（纯 TS，无 DOM） |
| `apps/web` | Next.js 壳、`/admin`、`public/` |
| `content/skins` | 几乎空；真实皮肤在 `apps/web/public/skins/` |
| `docs/` | 产品 / 技术文档（非运行时） |
| `.github/workflows/ci.yml` | CI |
| 根 `package.json` | 统一脚本入口 |

---

## 3. 怎么跑

```bash
pnpm install
pnpm dev                 # http://localhost:5000
pnpm test                # 仅 game-core Vitest
pnpm lint
pnpm build
pnpm build:portal        # 门户瘦包（无可用 admin）
pnpm check:skins         # 皮肤齐套（CI 用）
```

深度平衡：`pnpm --filter @wolf-sheep/game-core balance:deep`。

环境变量：复制 [`apps/web/.env.example`](apps/web/.env.example)；多渠道 / env 防呆见技术设计 `07` §3.3。

---

## 4. 怎么验（测试 · CI · 脚本）

`pnpm test` → Vitest，只跑 `@wolf-sheep/game-core`。

| 文件 | 测什么 |
|------|--------|
| `tests/rules.test.ts` | 开局、隔空吃、连吃、胜负、羊禁后退、非法着法等 |
| `tests/ai-behavior.test.ts` | 羊 AI 护栏：不送吃、堵口、合围、hard 预算/降级、确定性 |
| `tests/levels-save.test.ts` | 24 关校验、开局、存档通关 / 解锁 |
| `tests/skins-quests.test.ts` | 皮肤 Catalog、解锁、每日任务 |
| `tests/balance-sim.test.ts` | 批量模拟粗校准 |
| `tests/balance-deep.test.ts` | 更深平衡模拟 |
| `tests/jump-ux.test.ts` | 跳吃 / 连吃规则侧 |

Admin `AiSimConsole` 是人工校准，不是自动化测试。壳层回归靠 `/admin/checklist`；补测优先加 core fixture。

**CI**（`.github/workflows/ci.yml`）：game-core test + lint → web build → `build:portal` → `check:skins`。

| 脚本 | 用途 |
|------|------|
| `packages/game-core/scripts/check-skins.mjs` | 皮肤齐套 |
| `packages/game-core/scripts/balance-deep.mjs` | 深度平衡模拟 |
| `apps/web/scripts/build-portal.mjs` | 门户瘦包 |
| `apps/web/scripts/assets/gen-boards.mjs` / `gen-sfx.mjs` | 资源生成辅助 |

---

## 5. 文档入口

| 文档 | 用途 |
|------|------|
| [`docs/当前工作总览与执行索引.md`](docs/当前工作总览与执行索引.md) | 当前批次与导航 |
| [`docs/任务/任务清单.md`](docs/任务/任务清单.md) | 待办状态 SSOT |
| [`docs/技术设计/07-游戏架构总览.md`](docs/技术设计/07-游戏架构总览.md) | 架构总览 |
| [`docs/产品核心/README.md`](docs/产品核心/README.md) | 现行产品规格 |
