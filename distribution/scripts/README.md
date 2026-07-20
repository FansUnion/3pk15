# 发行材料生成脚本

`capture-platform-materials.cjs` 从当前玩家端生成四季截图、CrazyGames 横竖预览和 Poki 方形动画预览。脚本只读取游戏页面并写入 `distribution/`，不修改玩家存档源代码，也不进入发行包。

前置条件：

1. 当前玩家端在一个本地 URL 运行；建议开发构建，确保页面与源码一致。
2. 安装仓库依赖和Playwright Chromium，系统可执行 `ffmpeg`。
3. 从仓库根目录执行：

```powershell
node distribution/scripts/capture-platform-materials.cjs --base-url=http://localhost:5011
```

只重做截图可追加 `--screenshots-only`；只重录视频可追加 `--videos-only`。

录制会等待真实狼方可操作状态，并要求长视频至少5次狼方行动、Poki动画至少2次。`pnpm check:platform-materials` 还会拒绝后半段静止或有效变化不足的视频。生成后仍需人工检查构图、字体、动作是否清楚；自动脚本不会把候选标记成平台最终定稿。
