# Fangrush Web 部署说明

## 1. 目标

正式玩家构建由 `apps/player-web` 生成。`apps/web` 保留为完整开发入口和 Admin 工具。

玩家构建命令：

| 命令 | 目标 | 广告 | Admin |
|---|---|---|---|
| `pnpm build:standalone` | 独立站生产 Demo | 关闭 | 物理排除 |
| `pnpm build:poki` | Poki 平台构建边界 | 仅保留平台适配入口 | 物理排除 |
| `pnpm build:crazygames` | CrazyGames 平台构建边界 | 仅保留平台适配入口 | 物理排除 |

真实 SDK 仍未接入；平台构建只表示玩家入口和包体边界已经独立。

## 2. 本地开发

在仓库根目录执行：

```bash
pnpm dev
```

默认地址为 `http://localhost:5000`。本地 `.env.local` 可以使用 Mock 广告和 Admin，但不得把本地密钥提交到仓库。

## 3. 独立站生产构建

```bash
pnpm build:standalone
pnpm --filter @wolf-sheep/web start
```

独立站生产环境必须满足：

- `NEXT_PUBLIC_APP_SHELL=standalone`
- `NEXT_PUBLIC_PLATFORM=standalone`
- `NEXT_PUBLIC_ADS_PROVIDER=none`
- `ADMIN_ENABLED=false`
- 配置真实 `NEXT_PUBLIC_SITE_URL`
- 不暴露 `ADMIN_ACCESS_KEY` 到客户端环境变量

独立站是无广告 Demo 和项目展示入口。GA4 是否启用必须与隐私政策和部署环境保持一致；平台包默认不加载独立站统计。

## 4. H5平台构建

```bash
pnpm build:poki
pnpm build:crazygames
```

当前构建只完成：

- 平台标识区分。
- portal 外壳区分。
- Admin 关闭。
- 平台广告适配边界保留。
- 独立站统计关闭。

当前限制：Next.js仍会在构建清单中编译Admin页面和API，但portal运行时会统一阻断访问。平台正式提交前还需要建立物理剔除或独立导出流程，并检查最终包中不含Admin代码；当前不能把“运行时关闭”表述成“已从包体移除”。

构建后可执行 `pnpm audit:web-artifact` 查看残留；`pnpm audit:portal-artifact` 是平台提交前的严格门槛，当前预期失败，直到玩家入口与Admin构建被物理拆分。`pnpm audit:portal-external` 扫描服务端和客户端构建产物，当前也预期失败：portal运行时不加载GA4，但独立站统计域名仍被编译进共享客户端代码。只有两个严格审计都通过，才能声明平台包物理排除了Admin和独立站统计。

真实平台 SDK、广告回调、平台生命周期和提交包必须等官方接入条件明确后再开发和验收。

## 5. 发布前门禁

```bash
pnpm check:platform-boundaries
pnpm check:deployment-contract
pnpm check:player-boundaries
pnpm check:assets
pnpm test
pnpm test:web
pnpm build:standalone
pnpm release:check
```

`release:check` 会依次检查核心测试、Web测试、平台边界、资源引用和生产构建。任何一项失败都不能把构建标记为发布通过。

## 6. 环境变量原则

- `.env.example` 只保存无密钥示例。
- `NEXT_PUBLIC_*` 会进入浏览器，不得放置密钥、签名或后台凭据。
- `ADMIN_ACCESS_KEY` 只用于受保护的 Admin 服务端流程。
- 生产、平台预览和本地 Mock 使用不同环境变量，不共用生产密钥。
- 平台 SDK 密钥和广告网络凭据等真实接入后，使用平台部署系统的 Secret 管理，不进入 Git。

## 7. 回滚

部署前保留上一份可运行的生产构建版本。出现白屏、核心对局失败、资源大面积缺失、存档恢复异常或 Admin 暴露时，立即回滚到上一版本；不要在生产环境临时修改关卡或规则。

## 8. 代码边界

- 规则、AI、关卡和奖励：`packages/game-core`。
- 页面和 Web 交互：`apps/web/src`。
- 平台生命周期：`apps/web/src/lib/platform.ts`。
- 广告接口与 Mock：`apps/web/src/lib/ads.ts`。
- 平台提交资料：`distribution/`。
- 总体架构：[工程边界与最终架构准备](../../docs/普通文档ing/工程边界总览.md)。
