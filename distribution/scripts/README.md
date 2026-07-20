# 发行材料生成脚本

`capture-platform-materials.cjs` 从当前玩家端生成四季截图、CrazyGames 横竖预览和 Poki 方形动画预览。脚本只读取游戏页面并写入 `distribution/`，不修改玩家存档源代码，也不进入发行包。

前置条件：

1. 当前玩家端在一个本地 URL 运行；建议开发构建，确保页面与源码一致。
2. Node 环境可解析 `playwright`，系统可执行 `ffmpeg`。
3. 从仓库根目录执行：

```powershell
node distribution/scripts/capture-platform-materials.cjs --base-url=http://localhost:5011
```

只重做截图可追加 `--screenshots-only`；只重录视频可追加 `--videos-only`。

生成后仍需人工检查构图、字体、动作是否清楚；自动脚本不会把候选标记成平台最终定稿。
