# P-I18N · 中英文本地化收口

> 本文件是 `T-011 国际化收口` 的实施规格；状态与优先级以 [任务清单](任务清单.md) 为准。
> 语言路由定稿：[`技术设计/06`](../技术设计/06-页面地图与SEO-GEO.md) §0。  
> **范围**：玩家可见页。Admin 固定英文，不纳入。上架短文案归门户上架材料，不在此文。

做成什么样算完：EN / ZH 切换后，任务页、皮肤页、关卡说明（hunt）无大块外语文案或混语；设置或页脚可切换语言；关键壳页无大块缺译。

---

## 0. 已有（不要重做）

| 能力 | 落点 |
|------|------|
| 文案树 en/zh | [`apps/web/src/i18n/messages.ts`](../../apps/web/src/i18n/messages.ts) |
| Cookie `NEXT_LOCALE` + `/zh` 前缀 | [`middleware.ts`](../../apps/web/src/middleware.ts)、[`config/locales.ts`](../../apps/web/src/config/locales.ts) |
| 语言下拉 | [`LocaleSwitcher.tsx`](../../apps/web/src/components/LocaleSwitcher.tsx) |
| 导航/页脚切换入口 | `SiteHeader` / `SiteFooter`（部分页仅页脚） |
| 关卡名双语 | [`levels.ts`](../../packages/game-core/src/content/levels.ts) `nameEn` / `nameZh` + `levelDisplayName` |
| 章节名/短文双语 | 同文件 `CHAPTER_LABEL*` / `CHAPTER_BLURB*` |
| 多数壳页已接 `t.*` | home、how-to、chapters、levels、play HUD、settings 主体、privacy 等 |

---

## 1. 必做（blocking）— 按序执行

### 1.1 任务标题双语

**现状**：[`quests.ts`](../../packages/game-core/src/content/quests.ts) 的 `QUEST_DEFS[].title` 只有中文；EN 下 `/quests` 任务名全是中文。

**做**：

1. 为每条 quest 增加 `titleEn` / `titleZh`（或等价字段）；`title` 可作兼容别名指向其一。  
2. 从 core `index` 导出读取助手（如 `questTitle(def, locale)`），与关卡 `levelDisplayName` 同模式。  
3. [`quests/page.tsx`](../../apps/web/src/app/quests/page.tsx) 用 locale 显示标题，禁止直出单语 `title`。

**算完**：`/` 与 `/zh/quests` 下任务名分别为英/中。

---

### 1.2 Hunt「本关学习」双语

**现状**：[`levels.ts`](../../packages/game-core/src/content/levels.ts) 的 `teachingPoint`、章节默认 `seasonTeaching` 只有英文；[`hunt/[levelId]/page.tsx`](../../apps/web/src/app/hunt/[levelId]/page.tsx) 直接渲染 → ZH 页大段英文。

**做**：

1. 拆成 `teachingPointEn` / `teachingPointZh`（章节默认 teaching 同样双语）。  
2. 增加 `levelTeachingPoint(level, locale)`（或内联三元）。  
3. hunt 页按 `locale` 取文案。

**算完**：`/zh/hunt/spring-01`（及抽查其他章）学习点为中文；EN 仍为英文。

---

### 1.3 皮肤名双语

**现状**：[`skins.ts`](../../packages/game-core/src/content/skins.ts) 单字段 `name`，中英混用（如「原野狼」与 `Night Watch`）；[`skins/page.tsx`](../../apps/web/src/app/skins/page.tsx) 直出 `skin.name`。

**做**：

1. Catalog 增加 `nameEn` / `nameZh`（或 `name` + locale 字段）。  
2. 导出 `skinDisplayName(item, locale)`。  
3. skins 页与任何展示皮肤名的组件改用助手。

**算完**：EN/ZH 下皮肤名各自完整、无「一页里中英名乱跳」。

---

### 1.4 皮肤页与预览 UI 进 messages

**现状**：

- [`skins/page.tsx`](../../apps/web/src/app/skins/page.tsx)：解锁提示、分区标题、Unlocked/兑换等用硬编码或 `locale === 'zh' ? …` ternary。  
- [`SkinPreview.tsx`](../../apps/web/src/components/SkinPreview.tsx)：`Field preview` 与「装备后立即生效」同屏混语。

**做**：

1. 把上述字符串收进 [`messages.ts`](../../apps/web/src/i18n/messages.ts)（en + zh 成对）。  
2. 页面 / `SkinPreview` 只读 `t.*`（`SkinPreview` 用 `useClientMessages`）。  
3. 删掉页面内大段 ternary 文案。

**算完**：`/skins` 与 `/zh/skins` 无混语；预览条两侧语言一致。

---

### 1.5 任务页壳文案进 messages

**现状**：[`quests/page.tsx`](../../apps/web/src/app/quests/page.tsx) 中 Daily/Weekly、领取成功 toast 等仍 ternary。

**做**：收进 `messages.ts` 的 `quests.*`；页面只读 `t`。

**算完**：任务页分区标题与 toast 随语言切换，无残留 ternary 用户文案。

---

## 2. 建议一并做（polish）

| 项 | 做 |
|----|-----|
| 设置页语言入口 | [`settings/page.tsx`](../../apps/web/src/app/settings/page.tsx) 加一行，复用 `LocaleSwitcher` |
| Eyebrow 硬编码英文 | 首页、`how-to-play`、`skins` 等 eyebrow 进 messages |
| LocaleSwitcher a11y | `aria-label` 改用 `t.locale.switchLabel` |
| settings 快速提示 ternary | 收进 messages |

对局页无语言入口可接受（页脚有切换则不必强求）。

---

## 3. 验收冒烟

1. 切 EN：打开 `/quests`、`/skins`、`/hunt/spring-01` — 无大块中文内容文案。  
2. 切 ZH：同上三页 — 无大块英文；`SkinPreview` 无中英混一行。  
3. Cookie：切换语言后刷新，语言保持。  
4. Admin：`/admin` 仍英文即可。

---

## 4. 实现约定

- **内容型字符串**（任务标题、皮肤名、teachingPoint）优先放 `game-core` 双语字段 + 小助手。  
- **壳 UI 字符串**放 `messages.ts`。  
- 禁止新增长期 `locale === 'zh' ? …` 散落在 JSX。  
- 改 core 后跑 `pnpm test`；改 web 后本地切语言冒烟。
