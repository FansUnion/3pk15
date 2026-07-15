#!/usr/bin/env python3
"""Batch .com availability check for domain candidates."""

from __future__ import annotations

import csv
import json
import re
import socket
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

WHOIS_HOST = "whois.verisign-grs.com"
WHOIS_PORT = 43
REQUEST_DELAY_SEC = 1.2
MAX_RETRIES = 3

# Excluded from 06: Visora, Seenly, Visibl, Noticed, Ansora, Askrank, Answerly, Signalo, Beaconly

CANDIDATES: list[dict] = [
    # A. 可见 / 被看见
    {"name": "Lucora", "cluster": "A", "etymology": "lucid + -ora", "reason": "清澈可见，柔化 SaaS 感", "zh": "「澄澈可见」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Sightio", "cluster": "A", "etymology": "sight + -io", "reason": "直指「被看见」，科技后缀", "zh": "「视野」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Presio", "cluster": "A", "etymology": "presence + -io", "reason": "品牌在 AI 答案中的「存在感」", "zh": "「在场」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Glintly", "cluster": "A", "etymology": "glint + -ly", "reason": "微光一闪=被 AI 点到", "zh": "「闪光可见」", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Clario", "cluster": "A", "etymology": "clarity + -io 柔化", "reason": "清晰、透明，契合诚实测量", "zh": "「清晰」", "syllables": 3, "letters": 6, "risk": "与 Clari 等近"},
    {"name": "Lumora", "cluster": "A", "etymology": "lumen + -ora", "reason": "光度隐喻可见度", "zh": "「光亮」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Visent", "cluster": "A", "etymology": "visible + -ent", "reason": "极短，「可见的」", "zh": "「可见」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Optora", "cluster": "A", "etymology": "optic + -ora", "reason": "光学/视角隐喻", "zh": "「视角」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Seento", "cluster": "A", "etymology": "seen + -o", "reason": "直白「被看见」", "zh": "「被看见」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Vizent", "cluster": "A", "etymology": "visible 缩写 + -ent", "reason": "短、科技感", "zh": "「可见」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Appearly", "cluster": "A", "etymology": "appear + -ly", "reason": "出现率=核心指标", "zh": "「出现」", "syllables": 3, "letters": 8, "risk": ""},
    {"name": "Showora", "cluster": "A", "etymology": "show + -ora", "reason": "被展示、被呈现", "zh": "「展示」", "syllables": 3, "letters": 7, "risk": ""},
    # B. 答案 / 推荐
    {"name": "Citora", "cluster": "B", "etymology": "cite + -ora", "reason": "AI 引用=可见度核心信号", "zh": "「被引用」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Nomio", "cluster": "B", "etymology": "nominate + -io", "reason": "被 AI 提名推荐", "zh": "「被提名」", "syllables": 3, "letters": 5, "risk": ""},
    {"name": "Recora", "cluster": "B", "etymology": "recommend + -ora", "reason": "直指「被推荐」", "zh": "「被推荐」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Mentio", "cluster": "B", "etymology": "mention + -io", "reason": "被点名提及", "zh": "「被提及」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Ansio", "cluster": "B", "etymology": "answer + -io", "reason": "答案引擎语境", "zh": "「答案」", "syllables": 3, "letters": 5, "risk": ""},
    {"name": "Citely", "cluster": "B", "etymology": "cite + -ly", "reason": "引用追踪感", "zh": "「引用地」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Pickora", "cluster": "B", "etymology": "pick + -ora", "reason": "AI 挑选你的品牌", "zh": "「被选中」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Votora", "cluster": "B", "etymology": "vote + -ora", "reason": "AI「投票」式推荐", "zh": "「被投票」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Nodora", "cluster": "B", "etymology": "nod + -ora", "reason": "点头认可=被推荐", "zh": "「认可」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Shoutio", "cluster": "B", "etymology": "shout-out + -io", "reason": "被大声推荐", "zh": "「被喊话推荐」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Listora", "cluster": "B", "etymology": "list + -ora", "reason": "上榜、入列", "zh": "「上榜」", "syllables": 3, "letters": 7, "risk": "略偏排行榜语义"},
    {"name": "Refera", "cluster": "B", "etymology": "refer + -a", "reason": "被转介推荐", "zh": "「被转介」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Namedly", "cluster": "B", "etymology": "named + -ly", "reason": "被点名", "zh": "「被点名地」", "syllables": 3, "letters": 7, "risk": ""},
    # C. 信号 / 雷达 / 追踪
    {"name": "Pulso", "cluster": "C", "etymology": "pulse + -o", "reason": "脉搏式持续监测", "zh": "「脉搏/信号」", "syllables": 2, "letters": 5, "risk": "西语 pulso=脉搏，无负面"},
    {"name": "Tracio", "cluster": "C", "etymology": "trace + -io", "reason": "追踪 AI 答案轨迹", "zh": "「追踪」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Beacora", "cluster": "C", "etymology": "beacon + -ora", "reason": "灯塔信标隐喻", "zh": "「信标」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Signly", "cluster": "C", "etymology": "signal + -ly", "reason": "提及信号", "zh": "「信号地」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Pingora", "cluster": "C", "etymology": "ping + -ora", "reason": "探测式监测", "zh": "「探测」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Pulseio", "cluster": "C", "etymology": "pulse + -io", "reason": "持续脉冲监测", "zh": "「脉冲」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Tracely", "cluster": "C", "etymology": "trace + -ly", "reason": "追踪感", "zh": "「追踪地」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Blipora", "cluster": "C", "etymology": "blip + -ora", "reason": "雷达光点=被检测到", "zh": "「光点信号」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Pulsent", "cluster": "C", "etymology": "pulse + -ent", "reason": "短、监测感", "zh": "「脉动」", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Signent", "cluster": "C", "etymology": "signal + -ent", "reason": "信号实体化", "zh": "「信号」", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Pingly", "cluster": "C", "etymology": "ping + -ly", "reason": "极短探测感", "zh": "「探测」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Echoio", "cluster": "C", "etymology": "echo + -io", "reason": "品牌在 AI 中的回声", "zh": "「回声」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Radora", "cluster": "C", "etymology": "radar 缩写 + -ora", "reason": "雷达扫描隐喻", "zh": "「雷达」", "syllables": 3, "letters": 6, "risk": "radar 类词竞争多"},
    # D. 排名 / 份额 / 胜出
    {"name": "Rankio", "cluster": "D", "etymology": "rank + -io", "reason": "排名一目了然", "zh": "「排名」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Slotly", "cluster": "D", "etymology": "slot + -ly", "reason": "AI 答案有限名额", "zh": "「席位」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Winora", "cluster": "D", "etymology": "win + -ora", "reason": "赢下 AI 答案", "zh": "「胜出」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Sharely", "cluster": "D", "etymology": "share + -ly", "reason": "份额/出现率", "zh": "「份额」", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Topora", "cluster": "D", "etymology": "top + -ora", "reason": "名列前茅", "zh": "「顶尖」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Slotora", "cluster": "D", "etymology": "slot + -ora", "reason": "占住 AI 推荐位", "zh": "「席位」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Winly", "cluster": "D", "etymology": "win + -ly", "reason": "极短、胜利感", "zh": "「赢」", "syllables": 2, "letters": 5, "risk": ""},
    {"name": "Leadora", "cluster": "D", "etymology": "lead + -ora", "reason": "领跑 AI 推荐", "zh": "「领先」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Firstio", "cluster": "D", "etymology": "first + -io", "reason": "首选推荐", "zh": "「首选」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Shareio", "cluster": "D", "etymology": "share + -io", "reason": "声量份额", "zh": "「份额」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Placely", "cluster": "D", "etymology": "place + -ly", "reason": "排位、名次", "zh": "「名次」", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Pitchly", "cluster": "D", "etymology": "pitch + -ly", "reason": "推销位/推荐位", "zh": "「推销位」", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Edgely", "cluster": "D", "etymology": "edge + -ly", "reason": "比竞品靠前", "zh": "「优势」", "syllables": 2, "letters": 6, "risk": ""},
    # E. 光 / 透镜 / 聚光
    {"name": "Lenso", "cluster": "E", "etymology": "lens + -o", "reason": "透镜=聚焦可见度", "zh": "「透镜」", "syllables": 2, "letters": 5, "risk": ""},
    {"name": "Beamly", "cluster": "E", "etymology": "beam + -ly", "reason": "光束打亮品牌", "zh": "「光束」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Glowra", "cluster": "E", "etymology": "glow + -ra", "reason": "发光被看见", "zh": "「辉光」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Focora", "cluster": "E", "etymology": "focus + -ora", "reason": "聚光到品牌", "zh": "「聚焦」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Rayora", "cluster": "E", "etymology": "ray + -ora", "reason": "光线隐喻", "zh": "「光线」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Beamora", "cluster": "E", "etymology": "beam + -ora", "reason": "灯塔光束", "zh": "「光束」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Lensio", "cluster": "E", "etymology": "lens + -io", "reason": "聚焦监测", "zh": "「透镜」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Glowio", "cluster": "E", "etymology": "glow + -io", "reason": "柔和发光感", "zh": "「辉光」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Focent", "cluster": "E", "etymology": "focus + -ent", "reason": "短、聚焦", "zh": "「聚焦」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Rayly", "cluster": "E", "etymology": "ray + -ly", "reason": "极短光线感", "zh": "「光线」", "syllables": 2, "letters": 5, "risk": ""},
    {"name": "Spotora", "cluster": "E", "etymology": "spotlight + -ora", "reason": "聚光灯", "zh": "「聚光灯」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Litely", "cluster": "E", "etymology": "light + -ly 柔化", "reason": "照亮品牌", "zh": "「照亮」", "syllables": 3, "letters": 6, "risk": "易联想到 lite/轻量"},
    # F. 短造词 / 高品牌感
    {"name": "Vexio", "cluster": "F", "etymology": "造词", "reason": "短、独特、SaaS 品牌感", "zh": "（无义，品牌感）", "syllables": 3, "letters": 5, "risk": ""},
    {"name": "Zentra", "cluster": "F", "etymology": "造词（zen + tra）", "reason": "平静专业感", "zh": "「中心」联想", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Klyro", "cluster": "F", "etymology": "造词", "reason": "极短、现代", "zh": "（无义）", "syllables": 2, "letters": 5, "risk": ""},
    {"name": "Nexora", "cluster": "F", "etymology": "next + -ora 柔化", "reason": "下一代可见度", "zh": "「下一代」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Zelvio", "cluster": "F", "etymology": "造词", "reason": "独特、好记", "zh": "（无义）", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Quorio", "cluster": "F", "etymology": "造词", "reason": "高级感、短", "zh": "（无义）", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Trivio", "cluster": "F", "etymology": "造词", "reason": "轻快 SaaS 感", "zh": "（无义）", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Nexent", "cluster": "F", "etymology": "next + -ent", "reason": "短、前瞻", "zh": "「下一代」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Velora", "cluster": "F", "etymology": "velocity + -ora 柔化", "reason": "快速、动感", "zh": "「迅捷」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Zolent", "cluster": "F", "etymology": "造词", "reason": "独特、商标友好", "zh": "（无义）", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Kyvent", "cluster": "F", "etymology": "造词", "reason": "短、科技", "zh": "（无义）", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Trovio", "cluster": "F", "etymology": "造词", "reason": "探索感", "zh": "「探索」弱联想", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Nexly", "cluster": "F", "etymology": "next + -ly", "reason": "极短", "zh": "「下一代」", "syllables": 2, "letters": 5, "risk": ""},
    # G. 动作型
    {"name": "Scanly", "cluster": "G", "etymology": "scan + -ly", "reason": "免费扫描钩子", "zh": "「扫描」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Trackio", "cluster": "G", "etymology": "track + -io", "reason": "持续追踪", "zh": "「追踪」", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Watchra", "cluster": "G", "etymology": "watch + -ra", "reason": "盯着 AI 答案", "zh": "「监视」", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Monily", "cluster": "G", "etymology": "monitor + -ly", "reason": "监测感", "zh": "「监测」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Watchio", "cluster": "G", "etymology": "watch + -io", "reason": "持续观察", "zh": "「观察」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Scanora", "cluster": "G", "etymology": "scan + -ora", "reason": "扫描品牌", "zh": "「扫描」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Trackly", "cluster": "G", "etymology": "track + -ly", "reason": "追踪感", "zh": "「追踪」", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Monitra", "cluster": "G", "etymology": "monitor + -a", "reason": "监测品牌", "zh": "「监测」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Checkio", "cluster": "G", "etymology": "check + -io", "reason": "检查可见度", "zh": "「检查」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Scoutly", "cluster": "G", "etymology": "scout + -ly", "reason": "侦察竞品", "zh": "「侦察」", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Watchly", "cluster": "G", "etymology": "watch + -ly", "reason": "持续盯盘", "zh": "「观察」", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Peekio", "cluster": "G", "etymology": "peek + -io", "reason": "一窥 AI 答案", "zh": "「一窥」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Probeio", "cluster": "G", "etymology": "probe + -io", "reason": "探测引擎答案", "zh": "「探测」", "syllables": 3, "letters": 7, "risk": ""},
    # H. 复合柔化
    {"name": "Citeora", "cluster": "H", "etymology": "cite + -ora", "reason": "引用分析核心", "zh": "「引用」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Rankora", "cluster": "H", "etymology": "rank + -ora", "reason": "排名+品牌感", "zh": "「排名」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Vislio", "cluster": "H", "etymology": "visible + -io", "reason": "可见度直指", "zh": "「可见」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Mentora", "cluster": "H", "etymology": "mention + -ora", "reason": "被提及", "zh": "「提及」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Citent", "cluster": "H", "etymology": "cite + -ent", "reason": "极短引用感", "zh": "「引用」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Rankent", "cluster": "H", "etymology": "rank + -ent", "reason": "排名实体", "zh": "「排名」", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Sigora", "cluster": "H", "etymology": "signal + -ora", "reason": "信号监测", "zh": "「信号」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Askora", "cluster": "H", "etymology": "ask + -ora", "reason": "用户提问场景", "zh": "「提问」", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Prompio", "cluster": "H", "etymology": "prompt + -io", "reason": "prompt 监测", "zh": "「提示词」", "syllables": 3, "letters": 7, "risk": "略绑 prompt 概念"},
    {"name": "Brandio", "cluster": "H", "etymology": "brand + -io", "reason": "品牌可见度", "zh": "「品牌」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Replyora", "cluster": "H", "etymology": "reply + -ora", "reason": "AI 回复中的品牌", "zh": "「回复」", "syllables": 3, "letters": 8, "risk": ""},
]

EXCLUDED_06 = {
    "visora", "seenly", "visibl", "noticed", "ansora", "askrank",
    "answerly", "signalo", "beaconly",
}

filtered = [c for c in CANDIDATES if c["name"].lower() not in EXCLUDED_06]
assert len(filtered) == 100, f"Expected 100 candidates, got {len(filtered)}"
CANDIDATES = filtered


@dataclass
class CheckResult:
    name: str
    domain: str
    status: str  # available | taken | unknown
    raw_hint: str


def query_whois(domain: str) -> CheckResult:
    name = domain.removesuffix(".com")
    last_error = ""
    for attempt in range(MAX_RETRIES):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(15)
            sock.connect((WHOIS_HOST, WHOIS_PORT))
            sock.sendall(f"{domain}\r\n".encode())
            chunks: list[bytes] = []
            while True:
                data = sock.recv(4096)
                if not data:
                    break
                chunks.append(data)
            sock.close()
            text = b"".join(chunks).decode("utf-8", errors="replace")
            upper = text.upper()
            if "NO MATCH FOR" in upper or "NOT FOUND" in upper:
                return CheckResult(name, domain, "available", "NO MATCH")
            if re.search(r"DOMAIN NAME:\s*" + re.escape(domain.upper()), upper):
                return CheckResult(name, domain, "taken", "DOMAIN NAME found")
            if "REGISTRAR:" in upper or "CREATION DATE:" in upper:
                return CheckResult(name, domain, "taken", "registration info")
            return CheckResult(name, domain, "unknown", text[:120].replace("\n", " "))
        except OSError as exc:
            last_error = str(exc)
            time.sleep(2 * (attempt + 1))
    return CheckResult(name, domain, "unknown", last_error or "query failed")


def status_label(status: str) -> str:
    return {"available": "可注册", "taken": "已占用", "unknown": "待人工确认"}[status]


def tier_for(candidate: dict, status: str) -> str:
    if status != "available":
        return "—"
    letters = candidate["letters"]
    syllables = candidate["syllables"]
    risk = candidate.get("risk", "")
    if letters <= 7 and syllables <= 3 and not risk:
        return "S"
    if letters <= 8 and syllables <= 3:
        return "A"
    return "B"


def main() -> None:
    brand_root = Path(__file__).resolve().parents[1]
    out_dir = brand_root / "data"
    out_dir.mkdir(parents=True, exist_ok=True)

    results: list[dict] = []
    checks: list[CheckResult] = []

    print(f"Checking {len(CANDIDATES)} .com domains...")
    for i, cand in enumerate(CANDIDATES, 1):
        domain = f"{cand['name'].lower()}.com"
        check = query_whois(domain)
        checks.append(check)
        row = {
            **cand,
            "domain": domain,
            "status": check.status,
            "status_zh": status_label(check.status),
            "tier": tier_for(cand, check.status),
            "whois_hint": check.raw_hint,
        }
        results.append(row)
        print(f"  [{i:3d}/100] {domain:20s} -> {row['status_zh']}")
        if i < len(CANDIDATES):
            time.sleep(REQUEST_DELAY_SEC)

    checked_at = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")

    payload = {
        "checked_at": checked_at,
        "method": f"WHOIS via {WHOIS_HOST}:{WHOIS_PORT}",
        "total": len(results),
        "available_count": sum(1 for r in results if r["status"] == "available"),
        "taken_count": sum(1 for r in results if r["status"] == "taken"),
        "unknown_count": sum(1 for r in results if r["status"] == "unknown"),
        "candidates": results,
    }

    json_path = out_dir / "domain-check-results.json"
    csv_path = out_dir / "domain-check-results.csv"

    with json_path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    fieldnames = [
        "name", "domain", "cluster", "etymology", "reason", "zh",
        "syllables", "letters", "risk", "status_zh", "tier", "whois_hint",
    ]
    with csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in results:
            writer.writerow({k: r.get(k, "") for k in fieldnames})

    print(f"\nDone. Available: {payload['available_count']}, Taken: {payload['taken_count']}, Unknown: {payload['unknown_count']}")
    print(f"JSON: {json_path}")
    print(f"CSV:  {csv_path}")


if __name__ == "__main__":
    main()
