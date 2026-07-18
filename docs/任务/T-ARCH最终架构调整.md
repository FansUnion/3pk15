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

1. 应用骨架：`player-web` 已建立；建立 `admin` 独立入口和构建命令。
2. 共享层：建立 `packages/web-shared`，迁移国际化、存档、平台/广告接口和共享玩家组件。
3. Admin迁移：迁移 Admin 页面、API 和管理组件，`apps/web` 进入兼容期。
4. 旧入口退役：双应用回归通过后，删除或明确废弃 `apps/web` 的重复入口。

## 当前状态

- `apps/player-web`：完整玩家路由、独立资源、独立 middleware，Admin/API 严格审计为0。
- `apps/web`：当前完整开发入口和 Admin 兼容入口。
- `packages/web-shared`：尚未建立，本批次开始建立。
- `apps/admin`：尚未建立，本批次开始建立。
- `packages/game-core`：继续作为规则、AI、关卡和奖励唯一来源。

## 验收门槛

- 两个应用可以独立构建。
- 玩家包不含 Admin/API。
- Admin 包不含公开玩家路由。
- 共享能力只有一个来源。
- `game-core` 不出现平台、浏览器或 Admin 依赖。
- 独立站、H5 和 Admin 回归测试通过。

## 约束

- 不复制规则、AI、关卡或奖励。
- 不在 `apps/player-web` 和 `apps/admin` 分别维护同一份共享逻辑。
- `apps/web` 迁移期间保留，不在未完成回归前删除。
- 真实平台 SDK、App、IAP、账号和云存档仍按原启动条件执行。
