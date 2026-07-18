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

## Vercel 控制台维护方式

以下配置以 Vercel 控制台当前字段为准；仓库脚本和构建审计是项目内的事实来源，控制台配置不能替代它们。

### 1. 建立两个 Project

在同一个 Git 仓库中建立两个 Vercel Project，分别设置 Root Directory：

| 项目 | Root Directory | 构建命令 | 部署用途 |
|---|---|---|---|
| `fangrush-player` | `apps/player-web` | `pnpm build:standalone` | 公开独立站 |
| `fangrush-admin` | `apps/admin` | `pnpm build:admin` | 内部 Admin，按需启用 |

建议先连接 Git 仓库，再在每个 Project 的 General/Build & Development Settings 中确认 Root Directory。不要把仓库根目录作为两个项目的 Root Directory，也不要用 `apps/web` 创建新项目。

Install Command 使用仓库现有的 `pnpm install --frozen-lockfile`（若 Vercel 自动识别 pnpm，可保留自动值，但首次部署后要查看构建日志确认）。Output Directory 对 Next.js 项目通常保持默认，不手工填写 `dist`；不要把 `.next` 当作静态上传目录。

### 2. 环境变量按项目隔离

变量分别在对应 Project 的 Environment Variables 中维护，并区分 Preview 与 Production：

| Project | Production 必要口径 | Preview 口径 |
|---|---|---|
| Player | `NEXT_PUBLIC_APP_SHELL=standalone`、`NEXT_PUBLIC_PLATFORM=standalone`、`NEXT_PUBLIC_ADS_PROVIDER=none`、`ADMIN_ENABLED=false`、正式 `NEXT_PUBLIC_SITE_URL` | 使用预览域名或测试域名；仍关闭 Admin 和广告 |
| Admin | `NEXT_PUBLIC_APP_SHELL=admin`、`ADMIN_ENABLED=true`、强随机 `ADMIN_ACCESS_KEY` | 使用独立测试密钥；不得复用 Production 密钥 |

`ADMIN_ACCESS_KEY` 只能作为 Vercel Secret 配置在 Admin Project，不能出现在 `NEXT_PUBLIC_*`、玩家 Project、Git、构建日志或截图中。Player Project 不配置 Admin 密钥。

### 3. 分支和部署顺序

推荐维护一条 `main` 主线：

1. Pull Request 先由两个 Project 的 Preview 部署检查构建是否成功。
2. 先发布 Player Production，检查首页、24 个关卡、隐私页、robots/sitemap 和 `/admin` 不可用。
3. Player 稳定后，再按需要发布 Admin Production；Admin 不作为公开站首页或 SEO 入口。
4. 规则、AI 或共享包变化时，两个 Project 都必须重新部署并分别查看构建日志。

不要为 Player/Admin 建长期代码分支；两个 Vercel Project 的分开部署不是两个代码分支。

### 4. 域名、保护和回滚

- Player 绑定正式公开域名；`NEXT_PUBLIC_SITE_URL` 必须与最终规范域名一致，另一个域名只做明确的重定向。
- Admin 使用独立子域名；生产启用 Admin gate，并优先叠加 Vercel 的访问保护或团队访问控制。
- 每次 Production 发布后记录 Vercel Deployment URL、Git commit、构建命令和验收结果。
- 发现线上 P0 时，优先在 Vercel Deployments 中把对应 Project 回滚到上一个已验收 Deployment；修复合并后再重新部署，不直接改线上文件。
- Player 和 Admin 分别回滚，不要因为 Admin 有问题回滚玩家端，反之亦然。

### 5. 每次发布后的最小检查

```bash
pnpm release:check
pnpm check:runtime-routes
```

线上还需分别检查 Player 的公开路由和 Admin 的 gate/关卡/AI 路由。`check:runtime-routes` 默认检查本地 `5003`/`5002`；线上检查时使用 `PLAYER_URL` 和 `ADMIN_URL` 环境变量覆盖地址。

## 环境变量文件与生产配置

环境变量模板按应用维护并纳入 Git：

```text
apps/player-web/.env.example  # 玩家端模板，可提交
apps/admin/.env.example       # Admin 模板，可提交
apps/player-web/.env.local    # 玩家端本地初始值，当前纳入 Git
apps/admin/.env.local          # Admin 本地初始值，当前纳入 Git
```

两个应用的 `.env.local` 只维护可公开的本地初始值，不得写入真实平台密钥、生产凭据或个人数据。Vercel Secret 和生产 `ADMIN_ACCESS_KEY` 不纳入 Git。根目录 `.env.example` 已废弃；`apps/web/.env.example` 只为尚未退役的兼容入口保留，不作为两个新 Vercel Project 的配置来源。

本地复制对应应用的模板为 `.env.local`，例如：

```text
apps/player-web/.env.local
apps/admin/.env.local
```

模板中的空密钥只能表示“未配置”，不能用于 Admin 生产访问；当前代码会在密钥为空时拒绝 Admin 访问。部署 Admin 时必须在 Vercel 中填写强随机 Secret。

## 生产配置

| 配置 | 要求 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | 使用真实 HTTPS 域名 |
| `NEXT_PUBLIC_APP_SHELL` | `standalone` |
| `NEXT_PUBLIC_PLATFORM` | `standalone` |
| `NEXT_PUBLIC_ADS_PROVIDER` | `none` |
| `ADMIN_ENABLED` | `false` |
| `ADMIN_ACCESS_KEY` | 不配置到公开客户端环境；如保留服务端值必须由部署平台 Secret 管理 |

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
