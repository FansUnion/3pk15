# Wolf & Sheep · 狼与绵羊

非对称围猎棋 H5（3 狼 vs 15 羊）。玩法与规格见 `docs/`。

## 开发

```bash
pnpm install
pnpm dev
```

打开 http://localhost:3000 ，进入春日第 1 关。

```bash
pnpm test          # game-core Vitest
pnpm build         # 全仓构建
```

## 结构

| 路径 | 说明 |
|------|------|
| `packages/game-core` | 规则、FSM、三档 AI（纯 TS） |
| `apps/web` | Next.js 独立站壳 |
| `docs/` | 创意 / 技术设计 / 任务清单 |

## 构建

```bash
pnpm --filter @wolf-sheep/web build
pnpm build:portal   # 门户瘦包：无可用 admin
```

## Capacitor

一期不上架 App。占位见 `apps/web/src/lib/adapters/capacitor-stub.ts`。

## 环境变量

复制 `.env.example`。生产检查见 `docs/MVP技术设计/13-生产环境变量检查单.md`。

