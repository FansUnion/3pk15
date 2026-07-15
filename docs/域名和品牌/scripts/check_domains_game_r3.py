#!/usr/bin/env python3
"""Game brand Round 3: wolf/hunt/pack/fang-first .com candidates."""

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
    {"name": "Packhunt", "route": "3", "etymology": "pack + hunt", "reason": "三狼群猎", "zh": "群猎", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Huntpack", "route": "3", "etymology": "hunt + pack", "reason": "猎+狼群", "zh": "猎群", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Fangrush", "route": "3", "etymology": "fang + rush", "reason": "牙突进", "zh": "牙突", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Packrush", "route": "3", "etymology": "pack + rush", "reason": "狼群突进", "zh": "群突", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Huntfang", "route": "3", "etymology": "hunt + fang", "reason": "猎牙", "zh": "猎牙", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Stonefang", "route": "3", "etymology": "stone + fang", "reason": "岩石+牙", "zh": "石牙", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Rockfang", "route": "3", "etymology": "rock + fang", "reason": "岩牙，地形联想", "zh": "岩牙", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Gridfang", "route": "3", "etymology": "grid + fang", "reason": "棋盘牙", "zh": "格牙", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Chainfang", "route": "3", "etymology": "chain + fang", "reason": "连吃牙", "zh": "连牙", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Fangchain", "route": "3", "etymology": "fang + chain", "reason": "牙连吃", "zh": "牙链", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Wolfleap", "route": "3", "etymology": "wolf + leap", "reason": "狼+跳吃，最直", "zh": "狼跃", "syllables": 2, "letters": 8, "risk": "wolf 词根常见"},
    {"name": "Packbreak", "route": "3", "etymology": "pack + break", "reason": "狼群破阵", "zh": "群破", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Flockbreak", "route": "3", "etymology": "flock + break", "reason": "破群；flock在前降权", "zh": "破群", "syllables": 2, "letters": 10, "risk": "flock词首降权"},
    {"name": "Fangboard", "route": "3", "etymology": "fang + board", "reason": "牙棋", "zh": "牙棋", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Huntboard", "route": "3", "etymology": "hunt + board", "reason": "猎棋", "zh": "猎棋", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Tripack", "route": "3", "etymology": "tri + pack", "reason": "三狼群", "zh": "三群", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Packgrid", "route": "3", "etymology": "pack + grid", "reason": "狼群棋盘", "zh": "群格", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Fanggrid", "route": "3", "etymology": "fang + grid", "reason": "牙格棋", "zh": "牙格", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Leapfang", "route": "3", "etymology": "leap + fang", "reason": "跃+牙；leap在前略逊Fangleap", "zh": "跃牙", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Ambushleap", "route": "3", "etymology": "ambush + leap", "reason": "伏击跳", "zh": "伏跃", "syllables": 3, "letters": 10, "risk": "略长"},
    {"name": "Predleap", "route": "3", "etymology": "pred + leap", "reason": "掠食跃", "zh": "掠跃", "syllables": 2, "letters": 8, "risk": "pred缩写略怪"},
    {"name": "Fangpath", "route": "3", "etymology": "fang + path", "reason": "牙径", "zh": "牙径", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Packpath", "route": "3", "etymology": "pack + path", "reason": "群径", "zh": "群径", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Rushfang", "route": "3", "etymology": "rush + fang", "reason": "突牙", "zh": "突牙", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Boldfang", "route": "3", "etymology": "bold + fang", "reason": "勇牙", "zh": "勇牙", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Keenfang", "route": "3", "etymology": "keen + fang", "reason": "锐牙", "zh": "锐牙", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Frostfang", "route": "3", "etymology": "frost + fang", "reason": "霜牙，冬章", "zh": "霜牙", "syllables": 2, "letters": 9, "risk": "游戏道具名常见"},
    {"name": "Dawnfang", "route": "3", "etymology": "dawn + fang", "reason": "黎明牙，春章", "zh": "黎明牙", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Duskfang", "route": "3", "etymology": "dusk + fang", "reason": "暮牙", "zh": "暮牙", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Seasonfang", "route": "3", "etymology": "season + fang", "reason": "季牙，四季", "zh": "季牙", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "Packstone", "route": "3", "etymology": "pack + stone", "reason": "群+岩石", "zh": "群石", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Fangstone", "route": "3", "etymology": "fang + stone", "reason": "牙+岩石", "zh": "牙石", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Grayfang", "route": "3", "etymology": "gray + fang", "reason": "灰牙", "zh": "灰牙", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Ironfang", "route": "3", "etymology": "iron + fang", "reason": "铁牙", "zh": "铁牙", "syllables": 2, "letters": 8, "risk": "常见奇幻名"},
    {"name": "Nightfang", "route": "3", "etymology": "night + fang", "reason": "夜牙", "zh": "夜牙", "syllables": 2, "letters": 9, "risk": "常见奇幻名"},
    {"name": "Quickfang", "route": "3", "etymology": "quick + fang", "reason": "快牙，碎片对局", "zh": "快牙", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Swiftpack", "route": "3", "etymology": "swift + pack", "reason": "迅群", "zh": "迅群", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Fanghold", "route": "3", "etymology": "fang + hold", "reason": "牙据点", "zh": "牙据", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Packhold", "route": "3", "etymology": "pack + hold", "reason": "群据点", "zh": "群据", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Tripleleap", "route": "3", "etymology": "triple + leap", "reason": "三连跳", "zh": "三连跃", "syllables": 3, "letters": 10, "risk": ""},
]

assert len(CANDIDATES) == 40, f"Expected 40, got {len(CANDIDATES)}"


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
    letters = candidate["letters"]
    if "flock词首" in risk or "略怪" in risk or "略长" in risk:
        return "B"
    if any(k in risk for k in ("常见奇幻", "常见", "wolf 词根")):
        return "A"
    if letters <= 9 and not risk:
        return "S"
    if letters <= 10:
        return "A"
    return "B"


def main() -> None:
    brand_root = Path(__file__).resolve().parents[1]
    out_dir = brand_root / "data"
    out_dir.mkdir(parents=True, exist_ok=True)

    results: list[dict] = []
    print(f"Game R3: checking {len(CANDIDATES)} .com domains...")
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
        print(f"  [{i:2d}/40] {domain:22s} -> {row['status_zh']} ({row['tier']})")
        if i < len(CANDIDATES):
            time.sleep(REQUEST_DELAY_SEC)

    checked_at = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")
    payload = {
        "round": "game_r3",
        "strategy": "wolf_hunt_pack_fang_first",
        "checked_at": checked_at,
        "method": f"WHOIS via {WHOIS_HOST}:{WHOIS_PORT}",
        "total": len(results),
        "available_count": sum(1 for r in results if r["status"] == "available"),
        "taken_count": sum(1 for r in results if r["status"] == "taken"),
        "unknown_count": sum(1 for r in results if r["status"] == "unknown"),
        "candidates": results,
    }

    json_path = out_dir / "domain-check-game-r3.json"
    csv_path = out_dir / "domain-check-game-r3.csv"
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
