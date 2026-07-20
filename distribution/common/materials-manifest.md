# Fangrush 基础发行材料清单

> 本清单只记录可复用的首交材料、来源和确认状态。平台 SDK、广告、Portal 联调和真实提交不在本文件管理。

## 品牌与文案

| 字段 | 当前候选 | 状态 |
|---|---|---|
| 游戏名 | `Fangrush` | 待用户最终确认 |
| 中文名 | `三狼连猎` | 官网辅助名称，不替代英文平台名 |
| 品类 | Strategy / Puzzle / Board game / HTML5 casual | 可提交 |
| 一句话 | Lead three wolves through compact seasonal hunts, break the flock's formation, and capture eight sheep before the wolves are trapped. | 可提交 |
| 短描述 | Fangrush is a short-session strategy board game about positioning, chain captures, and breaking defensive formations across 24 seasonal hunts. | 可提交 |
| 操作 | Select a wolf, then select a highlighted point. Jump over a sheep into the empty point beyond it to capture; continue a chain when another capture is available. | 可提交 |
| Demo | `https://fangrush.com` | 已公开；最终提交前由用户再体验 |
| 隐私页 | `https://fangrush.com/privacy` | 已公开 |
| 中文隐私页 | `https://fangrush.com/zh/privacy` | 已公开 |
| 支持邮箱 | 未提供 | 用户必须填写，不能由 AI 猜测 |

长描述、中文对应文案和运行时术语仍以产品文案事实源与玩家端翻译为准；本表只保存平台可粘贴的短字段。

## 截图候选

截图目录为 `distribution/common/screenshots/candidates/`，统一使用英文界面、默认皮肤、无 Admin、无调试 UI。

| 文件 | 场景 | 用途 |
|---|---|---|
| `01-spring-opening-1080x1350.png` | 春季开局、三狼与羊阵 | 商店截图 / 玩法概览 |
| `02-summer-routes-1080x1350.png` | 夏季通道与路线选择 | 展示季节变化 |
| `03-autumn-rocks-1080x1350.png` | 秋季岩石与地形控制 | 展示核心地形机制 |
| `04-winter-pressure-1080x1350.png` | 冬季专家防守开局 | 展示后期内容 |
| `05-capture-moment-1080x1350.png` | 实际捕食后的局面 | 展示核心动作与数量变化 |

截图是候选，不等同于最终平台封面。最终选择时优先保证棋盘、棋子、状态栏在缩图后仍可读。

## 预览视频脚本

### 横版 15–20 秒

1. 0–3 秒：春季完整开局，立即点选一只狼并显示合法落点。
2. 3–8 秒：实际移动与羊 AI 回应，不出现教程弹层。
3. 8–13 秒：切到秋季岩石局，展示绕石和路线判断。
4. 13–18 秒：切到冬季高压局或一次捕食，停在清晰盘面结束。

### 竖版 15–20 秒

使用相同事件顺序，保持棋盘和主要动作居中；不简单裁掉状态栏，不添加黑边、鼠标、促销文字、Logo 转场或音轨。

### Poki 动画缩略图 4–6 秒

方形画面依次显示：选择狼、合法落点、移动或捕食。只保留棋盘核心区域，动作位于中央 70%。

## 素材权利清单

| 类别 | 仓库来源 | 当前事实 | 最终确认 |
|---|---|---|---|
| 默认狼、羊 SVG | `packages/web-assets/public/skins/default/` | 项目运行素材；封面候选直接复用 | 用户确认来源与商业使用权 |
| 四季棋盘 SVG | `packages/web-assets/public/skins/boards/` | 项目运行素材；截图直接呈现 | 用户确认来源与商业使用权 |
| 音效 WAV | `packages/web-assets/public/sfx/` | 预览视频按平台要求静音，不嵌入 | 正式宣传片使用前另行确认 |
| 字体 | 系统/网页字体栈 | 封面源使用通用 serif 字体；不同机器可能替换 | 最终导出以像素文件为准 |
| 封面构图 | `distribution/*/assets/source/` | 由项目现有矢量资产确定性组合，无外部图库 | 用户审美确认 |
| 实机截图/视频 | 当前玩家端构建 | 来自 Fangrush 自有运行画面 | 用户确认可公开提交 |

## 用户必须完成

- 提供长期支持邮箱、真实联系人、国家/主体与收款/签约主体。
- 确认默认狼、羊、棋盘、音效和历史生成素材的商业使用权事实。
- 从候选中选择最终封面、截图和视频；不满意时给出“主体、颜色、构图、可读性”中的具体反馈。
- 在真实提交前重新核对 Portal 当时显示的必填项并亲自提交。
