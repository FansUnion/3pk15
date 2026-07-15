#!/usr/bin/env python3
"""Game brand Round 2: empty-name / full-copy — cute strategy HTML5 vibe."""

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

# 100 candidates: Route1 compound (~34), Route2 coinage (~33), Route3 empty (~33)
# Avoid Levelmere, wolfandsheep, sheepvs, get/play prefixes, hard consonant clusters.
CANDIDATES: list[dict] = [
    # === Route 1: Two-word compound (pastoral / hunt-soft / board-ish) ===
    {"name": "MeadowFang", "route": "1", "etymology": "meadow + fang", "reason": "牧场+牙，可爱猎感", "zh": "牧场牙", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "StoneHerd", "route": "1", "etymology": "stone + herd", "reason": "岩石+羊群，机制弱联想", "zh": "石群", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "GrayPaddock", "route": "1", "etymology": "gray + paddock", "reason": "灰围场，棋盘感", "zh": "灰围场", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "FrostHerd", "route": "1", "etymology": "frost + herd", "reason": "霜季羊群，四季弱联想", "zh": "霜群", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "MossPaddock", "route": "1", "etymology": "moss + paddock", "reason": "苔围场，温润", "zh": "苔围场", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "CedarFold", "route": "1", "etymology": "cedar + fold", "reason": "雪松羊圈", "zh": "雪松圈", "syllables": 3, "letters": 9, "risk": ""},
    {"name": "BirchFold", "route": "1", "etymology": "birch + fold", "reason": "桦树羊圈", "zh": "桦圈", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "PinePaddock", "route": "1", "etymology": "pine + paddock", "reason": "松木围场", "zh": "松围场", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "HillFlock", "route": "1", "etymology": "hill + flock", "reason": "山丘羊群", "zh": "山丘群", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "GlenFlock", "route": "1", "etymology": "glen + flock", "reason": "峡谷羊群", "zh": "峡群", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "ValeHerd", "route": "1", "etymology": "vale + herd", "reason": "谷地羊群", "zh": "谷群", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "ReedPaddock", "route": "1", "etymology": "reed + paddock", "reason": "芦苇围场", "zh": "苇围场", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "AshFold", "route": "1", "etymology": "ash + fold", "reason": "灰树羊圈，短", "zh": "灰圈", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "ElmHerd", "route": "1", "etymology": "elm + herd", "reason": "榆群", "zh": "榆群", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "FernPaddock", "route": "1", "etymology": "fern + paddock", "reason": "蕨围场", "zh": "蕨围场", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "MossFold", "route": "1", "etymology": "moss + fold", "reason": "苔圈", "zh": "苔圈", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "StoneFold", "route": "1", "etymology": "stone + fold", "reason": "石圈，岩石弱联想", "zh": "石圈", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "FrostFold", "route": "1", "etymology": "frost + fold", "reason": "霜圈，冬章气质", "zh": "霜圈", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "DawnPaddock", "route": "1", "etymology": "dawn + paddock", "reason": "黎明围场，春章感", "zh": "黎明围场", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "DuskHerd", "route": "1", "etymology": "dusk + herd", "reason": "黄昏羊群", "zh": "暮群", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "MistFold", "route": "1", "etymology": "mist + fold", "reason": "雾圈，轻氛围", "zh": "雾圈", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "GalePaddock", "route": "1", "etymology": "gale + paddock", "reason": "劲风围场", "zh": "风围场", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "ThornFold", "route": "1", "etymology": "thorn + fold", "reason": "刺圈，地形障碍弱联想", "zh": "刺圈", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "RidgeFlock", "route": "1", "etymology": "ridge + flock", "reason": "岭上羊群", "zh": "岭群", "syllables": 2, "letters": 10, "risk": ""},
    {"name": "BrookFold", "route": "1", "etymology": "brook + fold", "reason": "溪圈", "zh": "溪圈", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "CloverHerd", "route": "1", "etymology": "clover + herd", "reason": "三叶草羊群，轻可爱", "zh": "三叶群", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "HoneyFold", "route": "1", "etymology": "honey + fold", "reason": "蜜圈，偏可爱", "zh": "蜜圈", "syllables": 3, "letters": 9, "risk": "偏甜"},
    {"name": "AmberHerd", "route": "1", "etymology": "amber + herd", "reason": "琥珀羊群，秋章色", "zh": "琥珀群", "syllables": 3, "letters": 9, "risk": ""},
    {"name": "IvoryFold", "route": "1", "etymology": "ivory + fold", "reason": "象牙色羊圈", "zh": "牙色圈", "syllables": 3, "letters": 9, "risk": ""},
    {"name": "CopperFold", "route": "1", "etymology": "copper + fold", "reason": "铜圈，质感", "zh": "铜圈", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "SilverHerd", "route": "1", "etymology": "silver + herd", "reason": "银群", "zh": "银群", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "QuietPaddock", "route": "1", "etymology": "quiet + paddock", "reason": "静围场，策略感", "zh": "静围场", "syllables": 4, "letters": 12, "risk": "略长"},
    {"name": "KeenFold", "route": "1", "etymology": "keen + fold", "reason": "敏锐羊圈/猎感", "zh": "锐圈", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "BoldHerd", "route": "1", "etymology": "bold + herd", "reason": "勇群，进攻视角", "zh": "勇群", "syllables": 2, "letters": 8, "risk": ""},
    # === Route 2: Readable coinages (place-name feel) ===
    {"name": "Foldmere", "route": "2", "etymology": "fold + mere", "reason": "羊圈湖，地名感", "zh": "圈湖", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Herdwick", "route": "2", "etymology": "herd + wick", "reason": "羊群烛，注意Herdwick羊品种", "zh": "群烛", "syllables": 2, "letters": 8, "risk": "Herdwick羊品种名"},
    {"name": "Paddockmere", "route": "2", "etymology": "paddock + mere", "reason": "围场湖", "zh": "围场湖", "syllables": 3, "letters": 11, "risk": ""},
    {"name": "Flockmere", "route": "2", "etymology": "flock + mere", "reason": "羊群湖", "zh": "群湖", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Fangmere", "route": "2", "etymology": "fang + mere", "reason": "牙湖，猎感地名", "zh": "牙湖", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Leapmere", "route": "2", "etymology": "leap + mere", "reason": "跃湖，连跳弱联想", "zh": "跃湖", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Rockmere", "route": "2", "etymology": "rock + mere", "reason": "岩湖，岩石弱联想", "zh": "岩湖", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Stonewick", "route": "2", "etymology": "stone + wick", "reason": "石烛", "zh": "石烛", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Frostmere", "route": "2", "etymology": "frost + mere", "reason": "霜湖，冬章", "zh": "霜湖", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Meadowick", "route": "2", "etymology": "meadow + wick", "reason": "牧场烛", "zh": "牧场烛", "syllables": 3, "letters": 9, "risk": ""},
    {"name": "Herdhaven", "route": "2", "etymology": "herd + haven", "reason": "羊群港", "zh": "群港", "syllables": 3, "letters": 9, "risk": ""},
    {"name": "Foldhaven", "route": "2", "etymology": "fold + haven", "reason": "羊圈港", "zh": "圈港", "syllables": 3, "letters": 9, "risk": ""},
    {"name": "Paddockwell", "route": "2", "etymology": "paddock + well", "reason": "围场泉", "zh": "围场泉", "syllables": 3, "letters": 11, "risk": ""},
    {"name": "Glenfold", "route": "2", "etymology": "glen + fold", "reason": "峡圈", "zh": "峡圈", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Valefold", "route": "2", "etymology": "vale + fold", "reason": "谷圈", "zh": "谷圈", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Mossmere", "route": "2", "etymology": "moss + mere", "reason": "苔湖", "zh": "苔湖", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Reedmere", "route": "2", "etymology": "reed + mere", "reason": "苇湖", "zh": "苇湖", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Thornmere", "route": "2", "etymology": "thorn + mere", "reason": "刺湖，障碍感", "zh": "刺湖", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Clovermere", "route": "2", "etymology": "clover + mere", "reason": "三叶湖，可爱", "zh": "三叶湖", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "Ambermere", "route": "2", "etymology": "amber + mere", "reason": "琥珀湖，秋", "zh": "琥珀湖", "syllables": 3, "letters": 9, "risk": ""},
    {"name": "Dawnmere", "route": "2", "etymology": "dawn + mere", "reason": "黎明湖，春", "zh": "黎明湖", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Duskmere", "route": "2", "etymology": "dusk + mere", "reason": "暮湖", "zh": "暮湖", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Keenmere", "route": "2", "etymology": "keen + mere", "reason": "锐湖，策略", "zh": "锐湖", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Boldmere", "route": "2", "etymology": "bold + mere", "reason": "勇湖，进攻", "zh": "勇湖", "syllables": 2, "letters": 8, "risk": "英国地名 Boldmere"},
    {"name": "Huntmere", "route": "2", "etymology": "hunt + mere", "reason": "猎湖，弱品类", "zh": "猎湖", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Packmere", "route": "2", "etymology": "pack + mere", "reason": "群湖，三狼弱联想", "zh": "狼群湖", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Gridmere", "route": "2", "etymology": "grid + mere", "reason": "格湖，棋盘", "zh": "格湖", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Leapwick", "route": "2", "etymology": "leap + wick", "reason": "跃烛", "zh": "跃烛", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Fangwick", "route": "2", "etymology": "fang + wick", "reason": "牙烛", "zh": "牙烛", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Herdmont", "route": "2", "etymology": "herd + mont", "reason": "群山", "zh": "群山", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Foldmont", "route": "2", "etymology": "fold + mont", "reason": "圈山", "zh": "圈山", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Paddockmont", "route": "2", "etymology": "paddock + mont", "reason": "围场山", "zh": "围场山", "syllables": 3, "letters": 11, "risk": "略长"},
    {"name": "Seasonmere", "route": "2", "etymology": "season + mere", "reason": "季湖，四季", "zh": "季湖", "syllables": 3, "letters": 10, "risk": ""},
    # === Route 3: Neutral / empty vessel (playful but pronounceable) ===
    {"name": "Foldly", "route": "3", "etymology": "fold + -ly", "reason": "羊圈式空壳", "zh": "圈式", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Herdly", "route": "3", "etymology": "herd + -ly", "reason": "群式", "zh": "群式", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Paddockly", "route": "3", "etymology": "paddock + -ly", "reason": "围场式", "zh": "围场式", "syllables": 3, "letters": 9, "risk": ""},
    {"name": "Flockly", "route": "3", "etymology": "flock + -ly", "reason": "羊群式", "zh": "群式", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Fangly", "route": "3", "etymology": "fang + -ly", "reason": "牙式，短", "zh": "牙式", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Leaply", "route": "3", "etymology": "leap + -ly", "reason": "跃式", "zh": "跃式", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Rockly", "route": "3", "etymology": "rock + -ly", "reason": "岩式", "zh": "岩式", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Foldio", "route": "3", "etymology": "fold + -io", "reason": "圈io", "zh": "圈", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Herdio", "route": "3", "etymology": "herd + -io", "reason": "群io", "zh": "群", "syllables": 3, "letters": 6, "risk": ""},
    {"name": "Paddockio", "route": "3", "etymology": "paddock + -io", "reason": "围场io", "zh": "围场", "syllables": 3, "letters": 9, "risk": ""},
    {"name": "Meadowly", "route": "3", "etymology": "meadow + -ly", "reason": "牧场式", "zh": "牧场式", "syllables": 3, "letters": 8, "risk": ""},
    {"name": "Cloverly", "route": "3", "etymology": "clover + -ly", "reason": "三叶式，可爱", "zh": "三叶式", "syllables": 3, "letters": 8, "risk": ""},
    {"name": "Thornly", "route": "3", "etymology": "thorn + -ly", "reason": "刺式，障碍", "zh": "刺式", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Amberly", "route": "3", "etymology": "amber + -ly", "reason": "琥珀式", "zh": "琥珀式", "syllables": 3, "letters": 7, "risk": "Amberly 人名感"},
    {"name": "Frostly", "route": "3", "etymology": "frost + -ly", "reason": "霜式", "zh": "霜式", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Dawnly", "route": "3", "etymology": "dawn + -ly", "reason": "黎明式", "zh": "黎明式", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Duskly", "route": "3", "etymology": "dusk + -ly", "reason": "暮式", "zh": "暮式", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Keenfold", "route": "3", "etymology": "keen + fold", "reason": "锐圈合体", "zh": "锐圈", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Boldfold", "route": "3", "etymology": "bold + fold", "reason": "勇圈合体", "zh": "勇圈", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Softfold", "route": "3", "etymology": "soft + fold", "reason": "软圈，可爱外壳", "zh": "软圈", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Quickfold", "route": "3", "etymology": "quick + fold", "reason": "快圈，碎片对局", "zh": "快圈", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Brightfold", "route": "3", "etymology": "bright + fold", "reason": "亮圈", "zh": "亮圈", "syllables": 2, "letters": 10, "risk": ""},
    {"name": "Clearfold", "route": "3", "etymology": "clear + fold", "reason": "清圈", "zh": "清圈", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Truefold", "route": "3", "etymology": "true + fold", "reason": "真圈", "zh": "真圈", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Evenfold", "route": "3", "etymology": "even + fold", "reason": "平圈，策略均衡", "zh": "平圈", "syllables": 3, "letters": 8, "risk": ""},
    {"name": "Stillfold", "route": "3", "etymology": "still + fold", "reason": "静圈", "zh": "静圈", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Calmfold", "route": "3", "etymology": "calm + fold", "reason": "安圈", "zh": "安圈", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Fairfold", "route": "3", "etymology": "fair + fold", "reason": "公圈", "zh": "公圈", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Northfold", "route": "3", "etymology": "north + fold", "reason": "北圈", "zh": "北圈", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Westfold", "route": "3", "etymology": "west + fold", "reason": "西圈，注意洛环西境", "zh": "西圈", "syllables": 2, "letters": 8, "risk": "魔戒 Westfold 近"},
    {"name": "Eastfold", "route": "3", "etymology": "east + fold", "reason": "东圈", "zh": "东圈", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Southfold", "route": "3", "etymology": "south + fold", "reason": "南圈", "zh": "南圈", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Tinyfold", "route": "3", "etymology": "tiny + fold", "reason": "小圈，网页小品", "zh": "小圈", "syllables": 3, "letters": 8, "risk": ""},
]

assert len(CANDIDATES) == 100, f"Expected 100, got {len(CANDIDATES)}"


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
    if any(k in risk for k in ("魔戒", "羊品种", "人名", "偏甜", "略长", "拼写")):
        return "B"
    if letters <= 9 and not risk:
        return "S"
    if letters <= 11:
        return "A" if risk else "S"
    return "B"


def main() -> None:
    brand_root = Path(__file__).resolve().parents[1]
    out_dir = brand_root / "data"
    out_dir.mkdir(parents=True, exist_ok=True)

    results: list[dict] = []
    print(f"Game R2: checking {len(CANDIDATES)} .com domains...")
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
        print(f"  [{i:3d}/100] {domain:22s} -> {row['status_zh']} ({row['tier']})")
        if i < len(CANDIDATES):
            time.sleep(REQUEST_DELAY_SEC)

    checked_at = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")
    payload = {
        "round": "game_r2",
        "strategy": "empty_name_full_copy_cute_strategy",
        "checked_at": checked_at,
        "method": f"WHOIS via {WHOIS_HOST}:{WHOIS_PORT}",
        "total": len(results),
        "available_count": sum(1 for r in results if r["status"] == "available"),
        "taken_count": sum(1 for r in results if r["status"] == "taken"),
        "unknown_count": sum(1 for r in results if r["status"] == "unknown"),
        "candidates": results,
    }

    json_path = out_dir / "domain-check-game-r2.json"
    csv_path = out_dir / "domain-check-game-r2.csv"
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
    s_avail = [r for r in avail if r["tier"] == "S"]
    print(f"\nDone. Available: {payload['available_count']}, S-tier: {len(s_avail)}")
    print(f"Available: {[r['domain'] for r in avail]}")
    print(f"S-tier: {[r['domain'] for r in s_avail]}")
    print(f"JSON: {json_path}")


if __name__ == "__main__":
    main()
