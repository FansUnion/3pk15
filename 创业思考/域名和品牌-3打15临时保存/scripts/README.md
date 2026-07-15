# 游戏品牌 WHOIS 脚本

复用 Levelmere 找域方法（Verisign WHOIS，无第三方依赖）。

## 运行

在 `docs/域名和品牌/` 下：

```bash
python scripts/check_domains_game_r1.py   # 语义 24 词
python scripts/check_domains_game_r2.py   # 空壳 100 词
python scripts/check_domains_game_r3.py   # 狼侧 40 词
python scripts/export_r2_md.py            # 从 R2 JSON 生成 01 清单
```

## 输出

| 脚本 | JSON / CSV |
|------|------------|
| r1 | `data/domain-check-game-r1.*` |
| r2 | `data/domain-check-game-r2.*` |
| r3 | `data/domain-check-game-r3.*` |

Playbook 见仓库 [`创业思考/品牌命名/08-域名寻找经验与工具.md`](../../../创业思考/品牌命名/08-域名寻找经验与工具.md)。
