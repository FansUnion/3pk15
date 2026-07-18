# Fangrush 发行资料

本目录统一管理平台审核清单和最终提交材料。游戏运行时图标、皮肤、音效和代码仍以 `apps/web/public`、`packages/game-core`及测试为准；这里不建立第二套运行资源。

## 目录

| 目录 | 当前用途 | 状态 |
|---|---|---|
| [common](common/README.md) | 品牌、文案、法律、截图和源素材入口 | 待整理 |
| [poki](poki/README.md) | Poki 执行入口、`compliance.yaml`、准入表单、缩略图交付 | 合规矩阵已建；SDK/素材待生产 |
| [crazygames](crazygames/README.md) | CrazyGames SDK、三类封面、视频和提交清单 | 待生产 |
| [google-play](google-play/README.md) | Google Play未来提交入口 | 需求池第六批 |
| [app-store](app-store/README.md) | Apple App Store未来提交入口 | 需求池第六批 |

## 管理规则

- `common`保存跨平台一致的品牌决定和可复用源素材说明。
- 平台目录保存按平台规格导出的最终文件，不反向成为游戏内素材真相源。
- 每个交付物记录尺寸、格式、语言、来源版本、生成日期和审核状态。
- **平台政策以官方英文文档为 SSOT**；仓库内双语整理稿与 `compliance.yaml` 只做摘要、状态与证据，执行前重新核验官网。
- `compliance.yaml` 用 `missing | partial | ready | verified` 表达状态；只有证据齐全才标 `verified`。
- 品牌文案 SSOT：[`docs/普通文档ing/美术等资源/01-品牌文案和游戏上架材料.md`](../docs/普通文档ing/美术等资源/01-品牌文案和游戏上架材料.md)；运行时翻译 SSOT：`apps/web/src/i18n/messages.ts`。发行目录不复制两者正文。
- Poki 人读理解稿：[`docs/商业成功/Poki官方文档双语整理/`](../docs/商业成功/Poki官方文档双语整理/00-索引与阅读边界.md)；原始抓取保留于 `docs/文档整理todo/poki内容/`。
- 不提交账号密钥、团队API Key、签名证书、支付凭据或其他秘密。

当前执行任务见 [任务清单](../docs/任务/任务清单.md)，渠道决策见 [渠道发展路线](../docs/商业成功/渠道发展路线.md)。
