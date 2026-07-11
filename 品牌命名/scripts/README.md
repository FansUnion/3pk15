# WHOIS 批量查验脚本

> 位置：`3pk15/品牌命名/scripts/`。输出：`../data/`。

---

## 依赖

- Python 3.8+
- 无第三方包（标准库 `socket` 查 Verisign WHOIS）

---

## 运行

在 `品牌命名/` 目录下执行：

```bash
python scripts/check_domains.py
python scripts/check_domains_round2.py
```

或在 `scripts/` 目录下：

```bash
python check_domains_round2.py
```

---

## 输出

| 脚本 | JSON | CSV |
|------|------|-----|
| `check_domains.py` | `data/domain-check-results.json` | `data/domain-check-results.csv` |
| `check_domains_round2.py` | `data/domain-check-round2.json` | `data/domain-check-round2.csv` |

---

## 修改候选列表

编辑脚本内 `CANDIDATES: list[dict]`，每条字段：

**第一轮**（`check_domains.py`）：

| 字段 | 说明 |
|------|------|
| name | 品牌名（CamelCase，脚本转小写 + .com） |
| cluster | 语义簇 A–H |
| etymology | 词源 |
| reason | 命名理由 |
| zh | 中文联想 |
| syllables | 音节数 |
| letters | 字母数 |
| risk | 风险备注（可选） |

**第二轮**（`check_domains_round2.py`）：

| 字段 | 说明 |
|------|------|
| route | 路线 1/2/3（两词组合 / 长造词 / 中性词） |
| 其余同上 | |

---

## 开第三轮

1. 复制 `check_domains_round2.py` → `check_domains_round3.py`
2. 替换 `CANDIDATES` 为新列表（建议 100 个）
3. 改 `payload` 里 `round` 和输出文件名为 `domain-check-round3.json`
4. 运行后在 `品牌命名/` 新建对应清单 Markdown

---

## 参数（脚本顶部常量）

| 常量 | 默认 | 说明 |
|------|------|------|
| `REQUEST_DELAY_SEC` | 1.0–1.2 | 请求间隔，防 WHOIS 限流 |
| `MAX_RETRIES` | 3 | 失败重试次数 |
| `WHOIS_HOST` | whois.verisign-grs.com | 仅适用于 .com |

---

## 判定规则

| WHOIS 响应 | 标记 |
|------------|------|
| `No match for` / `NOT FOUND` | 可注册 |
| 含 `Domain Name:` / `Registrar:` | 已占用 |
| 超时 / 模糊 | 待人工确认 |

> **免责声明**：WHOIS「可注册」不等于注册商购物车可下单。最终以购物车为准。

---

详见 [08-域名寻找经验与工具.md](../08-域名寻找经验与工具.md)。
