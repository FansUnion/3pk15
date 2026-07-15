#!/usr/bin/env python3
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
r2 = json.loads((root / "data" / "domain-check-game-r2.json").read_text(encoding="utf-8"))
avail = [c for c in r2["candidates"] if c["status"] == "available"]
order = {"S": 0, "A": 1, "B": 2, "—": 9}
lines = [
    "# 01 · 域名候选清单（游戏 R2）",
    "",
    "> 策略：名字空、文案满（可爱策略网页游戏气质）。",
    f"> WHOIS 时间：{r2['checked_at']}",
    f"> 总数 {r2['total']} · 可注册 {r2['available_count']} · 已占 {r2['taken_count']} · 未知 {r2['unknown_count']}",
    "",
    "## 可注册名单（按 tier 再按字母）",
    "",
    "| Tier | 品牌 | 域名 | 路线 | 词源 | 理由 | 风险 |",
    "|------|------|------|------|------|------|------|",
]
for c in sorted(avail, key=lambda x: (order.get(x["tier"], 9), x["name"])):
    risk = c.get("risk") or "—"
    lines.append(
        f"| {c['tier']} | {c['name']} | `{c['domain']}` | {c['route']} | {c['etymology']} | {c['reason']} | {risk} |"
    )
lines += [
    "",
    "完整 100 条见 `data/domain-check-game-r2.json` / `.csv`。",
    "",
]
(root / "01-域名候选清单-游戏R2.md").write_text("\n".join(lines), encoding="utf-8")
print("ok", len(avail))
