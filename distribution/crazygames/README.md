# CrazyGames 发行清单

> 最近核对：2026-07-18。执行时以 [Requirements](https://docs.crazygames.com/requirements/intro) 和 [HTML5 v3 SDK](https://docs.crazygames.com/sdk/intro#html5) 为准。  
> **合规矩阵：** [`compliance.yaml`](./compliance.yaml)（Basic/Full、状态与证据）。  
> **细则双语整理：** [`docs/商业成功/CrazyGames官方文档双语整理/`](../../docs/商业成功/CrazyGames官方文档双语整理/00-索引与阅读边界.md)  
> **决策向要点：** [`docs/商业成功/门户上架要点/03-CrazyGames专属事项.md`](../../docs/商业成功/门户上架要点/03-CrazyGames专属事项.md)

## 发布阶段

- Basic Launch可先验证玩家表现，但平台广告变现关闭。
- 进入Full Launch后完成SDK、生命周期、广告、平台设置和适用的账号要求。

## 集成

- [ ] 加载并等待CrazyGames HTML5 v3 SDK初始化；非平台环境安全降级。
- [ ] 正确发送loading、gameplay start/stop和24关完成进度。
- [ ] 接入 `midgame` 与 `rewarded` 广告；处理成功、失败、无填充、AdBlock和冷却。
- [ ] 广告期间暂停输入和音频；失败时恢复游戏且不吞基础奖励。
- [ ] 遵守平台 `muteAudio` 设置，并随设置变化更新。
- [ ] 游戏在AdBlock下仍可完成核心主线。
- [ ] 平台包不包含外部广告、Admin和独立站专用功能。

## 技术与质量

- [ ] 初始下载、总文件大小和文件数量通过平台当前限制。
- [ ] 手机与桌面端视觉、输入、加载、保存和异常恢复通过QA。
- [ ] 游戏尽快进入真实玩法，教程清晰且不以长文阻挡开始。
- [ ] Developer Portal预览和质量检查通过。

## 素材

- [ ] 横版封面：1920x1080，16:9。
- [ ] 竖版封面：800x1200，2:3。
- [ ] 方形封面：800x800，1:1。
- [ ] 横版与竖版无声预览视频：各15至20秒，符合平台分辨率和50MB限制。
- [ ] 游戏名称、描述、玩法和操作说明。
- [ ] 三类封面视觉一致，无边框、商店Logo、虚假按钮或无权使用的素材。

## 当前缺口

v3 SDK适配器、生命周期、真实广告回调、平台静音、进度上报、三类封面、双预览视频和Portal验证均未完成。
