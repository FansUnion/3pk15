# 品牌命名 · 独立资产库

> 与 [geo/](../geo/) **平级**的自包含文件夹：域名候选、WHOIS 查验数据、可复用脚本、找域名经验。
> 立项原则简版见 [geo/06-域名与品牌命名.md](../geo/06-域名与品牌命名.md)；产品文案见 [geo/02-产品定位.md](../geo/02-产品定位.md)。

---

## 定稿品牌

| 项 | 内容 |
|----|------|
| **品牌名** | **Levelmere** |
| **主域** | **levelmere.com** |
| **定稿日期** | 2026-07-11 |
| **产品代码仓** | [github.com/FansUnion/Levelmere](https://github.com/FansUnion/Levelmere)（`git/Levelmere`） |

**Tagline：** Get your brand recommended by AI.

---

## 命名策略演进

| 轮次 | 策略 | 结论 |
|------|------|------|
| 第一轮 | 语义贴切短造词（visible/cite/rank + -ora/-io/-ly） | 99/100 已占用 |
| 第二轮 | 名字空、文案满 — 两词组合 / 好读造词 / 中性品牌词 | 12 个可注册 → **定稿 Levelmere** |

---

## 文档导航

| 文档 | 内容 |
|------|------|
| **[08-域名寻找经验与工具.md](08-域名寻找经验与工具.md)** | **Playbook：方法论、踩坑、脚本用法** |
| [01-域名候选清单-100.md](01-域名候选清单-100.md) | 第一轮候选 + WHOIS |
| [02-域名查验记录.md](02-域名查验记录.md) | 各批次查验汇总 |
| [03-域名命名新思路.md](03-域名命名新思路.md) | 第二轮策略说明 |
| [04-域名候选清单-第二轮.md](04-域名候选清单-第二轮.md) | 第二轮候选 + Top 推荐 |
| [scripts/README.md](scripts/README.md) | WHOIS 批量脚本用法 |

---

## 快速开始（跑 WHOIS）

```bash
cd 3pk15/品牌命名
python scripts/check_domains_round2.py
```

结果输出到 `data/domain-check-round2.json`。

---

## 目录结构

```
品牌命名/
├── README.md                 # 本文件
├── 08-域名寻找经验与工具.md
├── 01–04 候选清单.md
├── data/                     # WHOIS JSON/CSV
└── scripts/
    ├── check_domains.py      # 第一轮
    └── check_domains_round2.py
```

---

> **跨项目复用**：给新项目找域名时，复制 `scripts/`、改 `CANDIDATES` 列表即可，不必改动 `geo/` 立项文档。
