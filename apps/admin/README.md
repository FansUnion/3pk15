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
```

Admin 使用与玩家应用相同的 `packages/game-core` 和 `packages/web-shared`，但不应进入玩家构建产物。

## 访问控制

- `ADMIN_ENABLED` 必须显式为 `true` 才启用。
- 配置 `ADMIN_ACCESS_KEY` 后，访问者必须先通过 Admin gate。
- 不把 Admin 公开部署到独立站或 H5 平台包。
- 不提交真实密钥。

## 当前迁移状态

页面和 API 目前使用薄入口复用 `apps/web/src` 的现有实现；后续逐步迁移实现文件到 Admin 应用或 `web-shared`，保持单一来源。
