# P-LEVEL-CANDIDATE-GATE 地图候选验收器

> 状态：核心能力已完成；Admin 可视化接入待后续批次。
>
> 目标：让不合理地图在进入正式 `LEVELS` 前被自动拒绝或进入人工复盘，并保留可复现证据。

## 1. 验收边界

验收器是生产前门禁，不是玩家胜率证明。它负责排除已知反例，不能证明一张地图一定好玩。

- `pass`：未命中当前自动风险门槛，可进入 Admin 试玩。
- `review`：存在拖延、长尾或策略敏感风险，不得默认进入生产，必须复盘证据局并试玩。
- `reject`：结构非法、疑似狼方强制胜、首吃严重受阻或异常终局，不得进入生产。

当前 24 关属于验收器建立前的生产基线。本次结果不会自动改写其 `productionStatus`；命中的旧关进入复核待办。今后新增或调整候选地图必须先运行验收器，只有 `pass` 才能默认进入下一阶段。

## 2. 当前自动规则

| 代码 | 级别 | 条件 | 含义 |
|---|---|---|---|
| `STRUCTURE_INVALID` | reject | `validateLevel` 返回错误 | 棋子、岩石、开局、AI、参数或季节约束非法 |
| `WOLF_FORCED_WIN_RISK` | reject | mixed 狼胜率 ≥ 90%，且羊胜为 0 | 疑似狼方稳定强制胜，羊缺少真实防守 |
| `FIRST_CAPTURE_BLOCKED` | reject | mixed 首吃覆盖率 < 80% | 合理策略仍经常无法建立捕食路径 |
| `UNEXPECTED_TERMINAL` | reject | 出现未分类终局 | 规则、模拟或终局分类可能不一致 |
| `DRAW_RATE_HIGH` | review | mixed 和棋率 ≥ 40% | 重复或回合耗尽可能成为主要防守方式 |
| `LONG_TAIL` | review | mixed P95 ≥ `maxPlies` 的 75% | 少数棋局明显拖长 |
| `STRATEGY_SENSITIVE` | review | mixed 比 random 狼胜率高 ≥ 60 个百分点 | 地图对策略理解高度敏感，需要确认可教性 |

门槛是当前生产基线，不是永久常量。调整门槛必须保留调整原因、前后命中结果和玩家数据，不能为了让某张地图通过而临时放宽。

## 3. 证据格式

`assessLevelCandidate(level, options)` 返回：

- 结论 `pass/review/reject`；
- 结构错误和命中规则；
- random/mixed 的胜负和棋、平均/P95 plies、平均捕食、首吃覆盖；
- 每局种子、策略、胜方、终局原因、plies、捕食数、首次捕食 ply；
- 每局完整行动序列 `trace`。

固定默认参数：种子 `20260717..20260726`，两种狼策略各 10 局，Hard AI `maxNodes=80`。候选比较必须保持参数一致。

## 4. 使用方式

检查当前全部正式关卡：

```powershell
pnpm --filter @wolf-sheep/game-core candidate:check
```

代码入口：

```ts
import { assessLevelCandidate } from '@wolf-sheep/game-core'

const report = assessLevelCandidate(candidateLevel)
```

候选生产流程：

1. 复制最接近的正式关卡形成候选对象，不直接覆盖 `LEVELS`。
2. 运行 `validateLevel` 和候选验收器。
3. `reject`：保留规则、种子与棋谱，候选进入反例库，不进入正式配置。
4. `review`：在 Admin 播放证据局并人工接管，确认问题属于地图、开局、AI、参数还是策略可读性。
5. `pass`：进入用户试玩；试玩通过后才允许设置 `productionStatus: approved`。
6. 每次只改一个主要变量，再用相同参数复跑并比较。

## 5. 2026-07-17 基线结果

- `pass`：11 关。
- `review`：10 关。
- `reject`：3 关，分别为 `winter-01`、`winter-03`、`winter-05`。
- 三个 reject 均命中 `WOLF_FORCED_WIN_RISK`；mixed 分别为 `10/0/0`、`10/0/0`、`9/0/1`。
- 本结果与 [24 关平衡矩阵](../产品核心/24关平衡矩阵-2026-07-17.md)一致，证明验收器复用了同一规则、AI、策略和固定种子。

旧关复核优先级：先试玩三个 reject，再复盘 summer 的高和棋和 spring 的策略敏感关。复核前不擅自调整正式地图。

## 6. 后续任务

- 将候选对象的 JSON 导入、报告导出接入 Admin。
- 在 `/admin/levels` 展示 `pass/review/reject`、命中规则和证据种子。
- 从证据局直接进入 `/admin/ai` 棋谱播放和人工接管。
- 建立持久化反例目录，记录候选配置、拒绝原因、代表棋谱和后续修复；当前先由返回报告和设计卡承载。

