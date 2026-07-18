# 独立站部署交付说明

## 定位

独立站是 Fangrush 的无广告演示和项目质量验证入口，不包含平台 SDK，不对普通用户开放 Admin。

## 构建

在仓库根目录执行：

```bash
pnpm build:standalone
pnpm audit:player-artifact
pnpm --filter @wolf-sheep/player-web start
```

独立站由 `apps/player-web` 独立构建。严格产物审计确认玩家包不包含 Admin/API；Admin 使用单独的 `pnpm build:admin` 构建，不进入独立站发布产物。

## Vercel 部署边界

推荐使用同一 Git 仓库中的两个 Vercel Project，而不是把玩家端和 Admin 合并到一个公开项目：

| Project | Root Directory | 本地端口 | 生产域名 | 用途 |
|---|---|---:|---|---|
| Player | `apps/player-web` | `5003` | `fangrush.com` | 公开、无广告玩家演示站 |
| Admin | `apps/admin` | `5002` | `admin.fangrush.com` | 受保护的内部验收工具 |

本地端口只用于开发。Vercel 使用 HTTPS 域名和平台分配的运行端口，不应把 `5002` 或 `5003` 作为生产配置。Admin 是否部署到公网可后置；未部署时继续使用本地 `5002`。

玩家项目和 Admin 项目必须分别配置环境变量、部署权限和回滚版本。玩家项目不能配置 Admin 的公开客户端变量，也不能把 Admin/API 路由纳入产物。

## 生产配置

| 配置 | 要求 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | 使用真实 HTTPS 域名 |
| `NEXT_PUBLIC_APP_SHELL` | `standalone` |
| `NEXT_PUBLIC_PLATFORM` | `standalone` |
| `NEXT_PUBLIC_ADS_PROVIDER` | `none` |
| `ADMIN_ENABLED` | `false` |
| `ADMIN_ACCESS_KEY` | 不配置到公开客户端环境；如保留服务端值必须由部署平台 Secret 管理 |
| `NEXT_PUBLIC_TELEMETRY` | 按隐私政策和实际部署决定 |

## 部署前验收

- [ ] 首页、章节、关卡说明、对局、帮助、设置、皮肤和任务可访问。
- [ ] 移动端宽度无横向溢出，刷新和返回后对局可恢复。
- [ ] `/admin` 和 `/api/admin/*` 对外不可用。
- [ ] 不请求平台 SDK、广告网络或未批准外部服务。
- [ ] 隐私政策、站点 URL、robots 和 sitemap 使用正式域名。
- [ ] 运行 `pnpm release:check` 并保留结果。
- [ ] 运行 `pnpm audit:player-artifact` 并保留结果。
- [ ] 保留上一版本回滚入口。

## 不在本批次

- Poki/CrazyGames 真实 SDK。
- 独立站广告或支付。
- 玩家账号、云存档和 App 原生能力。
