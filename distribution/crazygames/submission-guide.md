# CrazyGames Basic 首次提交向导

> 提交入口：[Submit Your Game](https://developer.crazygames.com/submit)。首次提交默认选择 Basic；Basic 用于有限受众测试，广告变现关闭，真实 SDK 不是首交硬门槛。Portal 当时显示的字段和官方 Requirements 优先于本文。

## Upload

| 字段 | Fangrush 首交口径 |
|---|---|
| Game name | `Fangrush`，与游戏内标题一致 |
| Engine | HTML5；不要选 Unity |
| Progress save | `No, the game does not need progress save` |
| Mobile support | 勾选 |
| Online multiplayer | 不勾选 |
| SDK muteAudio | Basic未接SDK时不勾选 |

“不需要进度保存”只表示没有接 CrazyGames Data Module 或账号后端；浏览器本地进度不等于平台云存档。

## Details

英文描述：

```text
Fangrush is a short-session strategy board game about positioning, chain captures, and breaking defensive formations across 24 seasonal hunts.
```

操作说明：

```text
Select a wolf, then select a highlighted point. Jump over a sheep into the empty point beyond it to capture; continue a chain when another capture is available.
```

素材位置：

- 横版、竖版、方形封面：`assets/`。
- 横竖无声预览视频：`assets/`。
- 五张真实游戏截图：`../common/screenshots/candidates/`。
- 共用字段与权利确认：`../common/materials-manifest.md`。

## 提交前

- [ ] 顶部选择 Basic。
- [ ] 上传包可玩，英文完整，无Admin、调试内容和外部广告网。
- [ ] 进度、mobile、multiplayer和muteAudio选项与当前真实能力一致。
- [ ] 三类封面和两段视频已由用户确认。
- [ ] 已阅读当前官方 Requirements，并在Portal完成QA/Preview。
- [ ] 用户已配置真实账号、支持邮箱和必要的Billing信息。

Basic数据达到平台标准且团队决定进入Full后，再启动SDK、生命周期、广告、平台静音和Data Module等真实接入。
