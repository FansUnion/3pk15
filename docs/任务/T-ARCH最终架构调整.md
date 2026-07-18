# T-ARCH：最终架构调整

## 最终目标

```text
packages/game-core
        │
        ├── packages/web-shared
        │     国际化、存档、平台/广告接口、共享玩家组件
        │
        ├── apps/player-web
        │     独立站、H5玩家入口
        │
        ├── apps/admin
        │     Admin、验收、AI诊断和管理API
        │
        └── future apps/mobile
              Android/iOS外壳和原生能力
```

## 四批执行

1. [x] 应用骨架：`player-web`、`admin` 独立入口和构建命令已建立。
2. [x] 共享边界：`packages/web-shared` 已承载跨应用契约和共享样式；玩家运行时归属 `player-web`，规则继续归属 `game-core`。
3. [x] Admin迁移：Admin 页面、API、管理组件和候选验收实现已迁移，`apps/web` 进入兼容期。
4. [ ] 旧入口退役：保留兼容站供现阶段开发和回归使用；确认部署迁移完成后，再删除或明确废弃重复入口。

## 当前状态

- `apps/player-web`：拥有玩家路由、运行时、本地化、组件、资源和 middleware；不再通过 TypeScript fallback 读取 `apps/web/src`。
- `apps/admin`：拥有 Admin 页面、API、管理组件和候选验收实现；24关试玩路径可独立生成。
- `apps/web`：兼容站入口，复用两个独立应用的实现，不再作为玩家端或 Admin 的实现所有者。
- `packages/web-shared`：承载跨应用类型、平台契约、存储契约、本地化路径契约和共享全局样式。
- `packages/game-core`：继续作为规则、AI、关卡和奖励唯一来源。
- 自动边界检查禁止 `player-web` 或 `admin` 重新引用旧 `apps/web/src`；玩家和 Admin 产物严格审计均通过。

## 验收门槛

- [x] 两个应用可以独立构建。
- [x] 玩家包不含 Admin/API。
- [x] Admin 包不含公开玩家路由。
- [x] 共享能力按规则核心、跨应用契约、玩家运行时和管理能力明确归属。
- [x] `game-core` 不出现平台、浏览器或 Admin 依赖。
- [x] 独立站生产构建、源码边界和产物边界自动门禁通过。
- [ ] 完成独立站真实部署与人工回归后，决定 `apps/web` 的最终删除时间。

## 约束

- 不复制规则、AI、关卡或奖励。
- 不在 `apps/player-web` 和 `apps/admin` 分别维护同一份共享逻辑。
- `apps/web` 迁移期间保留，不在未完成回归前删除。
- 真实平台 SDK、App、IAP、账号和云存档仍按原启动条件执行。
