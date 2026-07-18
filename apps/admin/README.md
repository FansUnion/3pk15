# Fangrush Admin

独立的内部验收和运营工具，不是玩家正式入口。

## 本地运行

```bash
pnpm dev:admin
```

默认地址：`http://localhost:5002`。

## 构建

```bash
pnpm build:admin
pnpm audit:admin-artifact
```

Admin 使用与玩家应用相同的 `packages/game-core` 和 `packages/web-shared`，但不应进入玩家构建产物；Admin自身也不应包含公开玩家路由。

Admin 构建前会从 `packages/web-assets/public` 同步运行时资源到独立生成目录；同步目录不提交到 Git。

## 访问控制

- `ADMIN_ENABLED` 必须显式为 `true` 才启用。
- 配置 `ADMIN_ACCESS_KEY` 后，访问者必须先通过 Admin gate。
- 不把 Admin 公开部署到独立站或 H5 平台包。
- 不提交真实密钥。

## 当前架构状态

页面、API、管理组件和候选验收实现由 `apps/admin` 所有。Admin 通过明确的应用边界消费 `game-core`、`web-shared`、`web-assets` 和必要的玩家运行时共享实现。长期共享关系以 [`docs/普通文档ing/工程边界总览.md`](../../docs/普通文档ing/工程边界总览.md) 为唯一说明。

Admin 产物通过 `pnpm audit:admin-artifact` 检查，不应包含公开玩家路由；独立构建会生成全部 24 个关卡试玩路径供验收使用。
