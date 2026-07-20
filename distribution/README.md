# Fangrush 发行资料

本目录统一管理平台审核清单和最终提交材料。游戏运行时图标、皮肤、音效和代码仍以 `apps/player-web` 的构建资源、`packages/game-core`及测试为准；源素材仍由仓库资源目录维护，这里不建立第二套运行资源。

## 目录

| 目录 | 当前用途 | 状态 |
|---|---|---|
| [common](common/README.md) | 品牌、文案、法律、截图和源素材入口 | 文案、五张截图候选和权利清单已建；待用户确认 |
| [poki](poki/README.md) | Poki 执行入口、`compliance.yaml`、准入表单、缩略图交付 | 静态/动画候选已生产；真实SDK暂不启动 |
| [crazygames](crazygames/README.md) | CrazyGames 执行入口、`compliance.yaml`、三类封面与提交清单 | 三封面/双视频候选已生产；真实SDK暂不启动 |
| [google-play](google-play/README.md) | Google Play未来提交入口 | App阶段，尚未启动 |
| [app-store](app-store/README.md) | Apple App Store未来提交入口 | App阶段，尚未启动 |

## 管理规则

- `common`保存跨平台一致的品牌决定和可复用源素材说明。
- 平台目录保存按平台规格导出的最终文件，不反向成为游戏内素材真相源。
- 每个交付物记录尺寸、格式、语言、来源版本、生成日期和审核状态。
- **平台政策以官方英文文档为 SSOT**；仓库内双语整理稿与 `compliance.yaml` 只做摘要、状态与证据，执行前重新核验官网。
- `compliance.yaml` 用 `missing | partial | ready | verified` 表达状态；只有证据齐全才标 `verified`。
- 当前可提交文案统一维护在 `common/materials-manifest.md`；玩家实际显示文本以运行代码为准。
- 平台目录必须包含完成本阶段所需的字段、素材和检查清单，不依赖仓库其他目录的操作向导。
- 平台政策以官方网页为准；仓库中的研究资料可以辅助理解，但不是完成发行步骤的前置依赖。
- 不提交账号密钥、团队API Key、签名证书、支付凭据或其他秘密。

渠道是否启动由产品计划决定；本目录只回答“提交什么、怎样构建、怎样检查”。

## 本地构建验证顺序

Poki 和 CrazyGames 构建都使用 `apps/player-web/.next` 作为临时产物目录，Windows 下不能并行运行两个目标，否则可能因目录锁定出现 `EPERM`。请串行执行：

```powershell
pnpm verify:player:poki
pnpm verify:player:crazygames
```

两个命令分别包含目标构建、产物版本/大小报告和严格的玩家包边界审计。当前这两组本地验证均已通过，但不等于真实平台 SDK、Inspector、Portal 或提交审核已经通过。

基础素材规格检查：

```powershell
pnpm check:platform-materials
```
