#!/usr/bin/env python3
"""Game brand Round 1: semantic leap/pack/rock candidates from 00-品牌与域名方案.md."""

from __future__ import annotations

import csv
import json
import re
import socket
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

WHOIS_HOST = "whois.verisign-grs.com"
WHOIS_PORT = 43
REQUEST_DELAY_SEC = 1.1
MAX_RETRIES = 3

CANDIDATES: list[dict] = [
    {"name": "Leapack", "route": "A", "etymology": "leap + pack", "reason": "Packleap 音节倒置，连跳狼群", "zh": "三狼连猎", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Rockleap", "route": "A", "etymology": "rock + leap", "reason": "岩石+连跳", "zh": "岩跃猎", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Fangrid", "route": "A", "etymology": "fang + grid", "reason": "狼牙×交点棋盘", "zh": "牙格猎", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Chainleap", "route": "A", "etymology": "chain + leap", "reason": "连续多吃", "zh": "连跃猎", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Flockleap", "route": "A", "etymology": "flock + leap", "reason": "跃入羊群", "zh": "破群跃", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Trileap", "route": "A", "etymology": "tri + leap", "reason": "三狼+连跳", "zh": "三连猎", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Stoneleap", "route": "A", "etymology": "stone + leap", "reason": "岩石变体", "zh": "石跃猎", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Fangleap", "route": "A", "etymology": "fang + leap", "reason": "狼牙+连跳", "zh": "牙跃猎", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Leapflock", "route": "B", "etymology": "leap + flock", "reason": "连跳切入羊群", "zh": "跃群猎", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Packrift", "route": "B", "etymology": "pack + rift", "reason": "狼群撕开防线", "zh": "裂群猎", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Flockrift", "route": "B", "etymology": "flock + rift", "reason": "羊群防线撕裂", "zh": "羊阵裂", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Huntleap", "route": "B", "etymology": "hunt + leap", "reason": "猎+跳", "zh": "猎跃", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Gridleap", "route": "B", "etymology": "grid + leap", "reason": "棋盘格点+连跳", "zh": "格跃棋", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Lineleap", "route": "B", "etymology": "line + leap", "reason": "横竖直行吃线", "zh": "线跃棋", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Seasonleap", "route": "B", "etymology": "season + leap", "reason": "四季章节", "zh": "四季跃", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "Packfang", "route": "B", "etymology": "pack + fang", "reason": "三狼成群", "zh": "狼牙阵", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Leapstone", "route": "B", "etymology": "leap + stone", "reason": "连跳+岩石", "zh": "跃岩棋", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Crossleap", "route": "B", "etymology": "cross + leap", "reason": "交点棋盘", "zh": "交跃棋", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Wolvleap", "route": "C", "etymology": "wolv + leap", "reason": "wolves压缩+leap", "zh": "狼跃猎", "syllables": 2, "letters": 8, "risk": "拼写略怪"},
    {"name": "Packchomp", "route": "C", "etymology": "pack + chomp", "reason": "吃子爽感卡通", "zh": "狼群噬", "syllables": 2, "letters": 9, "risk": "偏直白"},
    {"name": "Huntgrid", "route": "C", "etymology": "hunt + grid", "reason": "猎场棋盘", "zh": "猎格棋", "syllables": 2, "letters": 8, "risk": "略泛"},
    {"name": "Threefang", "route": "C", "etymology": "three + fang", "reason": "三狼直译感", "zh": "三牙猎", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Fangpack", "route": "C", "etymology": "fang + pack", "reason": "fang+pack", "zh": "牙群猎", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Cleavpack", "route": "C", "etymology": "cleave + pack", "reason": "裂阵狼群", "zh": "裂阵狼", "syllables": 2, "letters": 9, "risk": "cleav拼写易错"},
]


@dataclass
class CheckResult:
    name: str
    domain: str
    status: str
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
    risk = candidate.get("risk", "")
    if risk:
        return "B"
    if candidate["letters"] <= 9 and candidate["route"] == "A":
        return "S"
    if candidate["letters"] <= 10:
        return "A"
    return "B"


def main() -> None:
    brand_root = Path(__file__).resolve().parents[1]
    out_dir = brand_root / "data"
    out_dir.mkdir(parents=True, exist_ok=True)

    results: list[dict] = []
    print(f"Game R1: checking {len(CANDIDATES)} .com domains...")
    for i, cand in enumerate(CANDIDATES, 1):
        domain = f"{cand['name'].lower()}.com"
        check = query_whois(domain)
        row = {
            **cand,
            "domain": domain,
            "status": check.status,
            "status_zh": status_label(check.status),
            "tier": tier_for(cand, check.status),
            "whois_hint": check.raw_hint,
        }
        results.append(row)
        print(f"  [{i:2d}/{len(CANDIDATES)}] {domain:22s} -> {row['status_zh']} ({row['tier']})")
        if i < len(CANDIDATES):
            time.sleep(REQUEST_DELAY_SEC)

    checked_at = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")
    payload = {
        "round": "game_r1",
        "strategy": "semantic_leap_pack_rock",
        "checked_at": checked_at,
        "method": f"WHOIS via {WHOIS_HOST}:{WHOIS_PORT}",
        "total": len(results),
        "available_count": sum(1 for r in results if r["status"] == "available"),
        "taken_count": sum(1 for r in results if r["status"] == "taken"),
        "unknown_count": sum(1 for r in results if r["status"] == "unknown"),
        "candidates": results,
    }

    json_path = out_dir / "domain-check-game-r1.json"
    csv_path = out_dir / "domain-check-game-r1.csv"
    with json_path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    fieldnames = [
        "name", "domain", "route", "etymology", "reason", "zh",
        "syllables", "letters", "risk", "status_zh", "tier", "whois_hint",
    ]
    with csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in results:
            writer.writerow({k: r.get(k, "") for k in fieldnames})

    avail = [r for r in results if r["status"] == "available"]
    print(f"\nDone. Available: {payload['available_count']}")
    print(f"Available: {[r['domain'] for r in avail]}")
    print(f"JSON: {json_path}")


if __name__ == "__main__":
    main()
