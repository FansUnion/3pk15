#!/usr/bin/env python3
"""Round 2: calm/trustworthy brand names — compound, readable coinages, neutral words."""

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
REQUEST_DELAY_SEC = 1.0
MAX_RETRIES = 3

# Route 1: compound (~34), Route 2: readable coinage (~33), Route 3: neutral (~33)
CANDIDATES: list[dict] = [
    # === Route 1: Two-word compound ===
    {"name": "CedarHarbor", "route": "1", "etymology": "cedar + harbor", "reason": "自然港湾，沉稳机构感", "zh": "「雪松港」", "syllables": 4, "letters": 11, "risk": ""},
    {"name": "MapleBrook", "route": "1", "etymology": "maple + brook", "reason": "枫树小溪，温润可信", "zh": "「枫溪」", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "StonePine", "route": "1", "etymology": "stone + pine", "reason": "石松，稳固自然", "zh": "「石松」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "NorthField", "route": "1", "etymology": "north + field", "reason": "北野，开阔沉稳", "zh": "「北原」", "syllables": 2, "letters": 10, "risk": ""},
    {"name": "StillWater", "route": "1", "etymology": "still + water", "reason": "静水，平静可信", "zh": "「静水」", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "EastHaven", "route": "1", "etymology": "east + haven", "reason": "东港，庇护所感", "zh": "「东港」", "syllables": 3, "letters": 9, "risk": ""},
    {"name": "SilverGate", "route": "1", "etymology": "silver + gate", "reason": "银门，商务质感", "zh": "「银门」", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "CopperLane", "route": "1", "etymology": "copper + lane", "reason": "铜巷，朴实稳重", "zh": "「铜巷」", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "GrayStone", "route": "1", "etymology": "gray + stone", "reason": "灰石，坚实低调", "zh": "「灰石」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "HeronPoint", "route": "1", "etymology": "heron + point", "reason": "苍鹭角，动物+地貌好记", "zh": "「鹭角」", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "FinchBay", "route": "1", "etymology": "finch + bay", "reason": "雀湾，轻盈但不卖萌", "zh": "「雀湾」", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "LynxHill", "route": "1", "etymology": "lynx + hill", "reason": "lynx 山丘，敏锐沉稳", "zh": "「山猫丘」", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "OakRidge", "route": "1", "etymology": "oak + ridge", "reason": "橡树岭，经典地名感", "zh": "「橡岭」", "syllables": 2, "letters": 8, "risk": "常见地名组合"},
    {"name": "PineCrest", "route": "1", "etymology": "pine + crest", "reason": "松顶，户外信任感", "zh": "「松顶」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "RiverGate", "route": "1", "etymology": "river + gate", "reason": "河门，流畅-gateway 隐喻", "zh": "「河门」", "syllables": 3, "letters": 9, "risk": ""},
    {"name": "BirchLane", "route": "1", "etymology": "birch + lane", "reason": "桦巷，清新稳重", "zh": "「桦巷」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "ElmHaven", "route": "1", "etymology": "elm + haven", "reason": "榆木港，温厚", "zh": "「榆港」", "syllables": 3, "letters": 8, "risk": ""},
    {"name": "FrostPine", "route": "1", "etymology": "frost + pine", "reason": "霜松，清冷专业", "zh": "「霜松」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "MossBrook", "route": "1", "etymology": "moss + brook", "reason": "苔溪，自然沉稳", "zh": "「苔溪」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "IvyPoint", "route": "1", "etymology": "ivy + point", "reason": "常春藤角，生长感", "zh": "「藤角」", "syllables": 3, "letters": 8, "risk": ""},
    {"name": "CraneBay", "route": "1", "etymology": "crane + bay", "reason": "鹤湾，优雅好记", "zh": "「鹤湾」", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "DoveField", "route": "1", "etymology": "dove + field", "reason": "鸽野，平和可信", "zh": "「鸽野」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "HawkRidge", "route": "1", "etymology": "hawk + ridge", "reason": "鹰岭，敏锐瞭望", "zh": "「鹰岭」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "WestBirch", "route": "1", "etymology": "west + birch", "reason": "西桦，方向+自然", "zh": "「西桦」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "FairOaks", "route": "1", "etymology": "fair + oaks", "reason": "秀橡，公正明朗", "zh": "「秀橡」", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "TruePine", "route": "1", "etymology": "true + pine", "reason": "真松，诚实测量气质", "zh": "「真松」", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "CalmRiver", "route": "1", "etymology": "calm + river", "reason": "静河，沉稳", "zh": "「静河」", "syllables": 3, "letters": 9, "risk": ""},
    {"name": "LevelOak", "route": "1", "etymology": "level + oak", "reason": "平橡，Linear 感", "zh": "「平橡」", "syllables": 3, "letters": 8, "risk": ""},
    {"name": "SteadBay", "route": "1", "etymology": "stead + bay", "reason": "稳湾，可靠", "zh": "「稳湾」", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "ClearBirch", "route": "1", "etymology": "clear + birch", "reason": "清桦，透明诚实", "zh": "「清桦」", "syllables": 2, "letters": 10, "risk": ""},
    {"name": "StoneHaven", "route": "1", "etymology": "stone + haven", "reason": "石港，坚固庇护", "zh": "「石港」", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "Ironwood", "route": "1", "etymology": "iron + wood", "reason": "铁木，坚实（单词拼合）", "zh": "「铁木」", "syllables": 3, "letters": 8, "risk": "ironwood 为常见词"},
    {"name": "RedCedar", "route": "1", "etymology": "red + cedar", "reason": "红雪松，北美信任感", "zh": "「红雪松」", "syllables": 3, "letters": 8, "risk": ""},
    {"name": "BlueHeron", "route": "1", "etymology": "blue + heron", "reason": "蓝鹭，经典自然组合", "zh": "「蓝鹭」", "syllables": 3, "letters": 9, "risk": ""},
    # === Route 2: Longer readable coinages ===
    {"name": "Westmere", "route": "2", "etymology": "west + mere", "reason": "西湖地名感，沉稳", "zh": "「西湖」", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Brookhaven", "route": "2", "etymology": "brook + haven", "reason": "溪港，经典地名", "zh": "「溪港」", "syllables": 3, "letters": 10, "risk": "常见地名"},
    {"name": "Fairwick", "route": "2", "etymology": "fair + wick", "reason": "秀烛，柔和机构感", "zh": "「秀烛」", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Clearwick", "route": "2", "etymology": "clear + wick", "reason": "清烛，透明可信", "zh": "「清烛」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Steadwell", "route": "2", "etymology": "stead + well", "reason": "稳井，可靠源泉", "zh": "「稳泉」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Truespan", "route": "2", "etymology": "true + span", "reason": "真跨，诚实覆盖", "zh": "「真跨」", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Northmere", "route": "2", "etymology": "north + mere", "reason": "北湖地名感", "zh": "「北湖」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Eastwick", "route": "2", "etymology": "east + wick", "reason": "东烛，好读", "zh": "「东烛」", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Stonehaven", "route": "2", "etymology": "stone + haven", "reason": "石港，坚固", "zh": "「石港」", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "Rivermere", "route": "2", "etymology": "river + mere", "reason": "河湖，流畅", "zh": "「河湖」", "syllables": 3, "letters": 9, "risk": ""},
    {"name": "Oakendale", "route": "2", "etymology": "oak + dale", "reason": "橡谷，田园机构感", "zh": "「橡谷」", "syllables": 3, "letters": 9, "risk": ""},
    {"name": "Pinehurst", "route": "2", "etymology": "pine + hurst", "reason": "松林，经典地名尾", "zh": "「松林」", "syllables": 2, "letters": 9, "risk": "常见地名"},
    {"name": "Brookstone", "route": "2", "etymology": "brook + stone", "reason": "溪石，自然稳重", "zh": "「溪石」", "syllables": 2, "letters": 10, "risk": ""},
    {"name": "Fairmont", "route": "2", "etymology": "fair + mont", "reason": "秀山，酒店地名感", "zh": "「秀山」", "syllables": 2, "letters": 8, "risk": "Fairmont 酒店品牌"},
    {"name": "Greenwich", "route": "2", "etymology": "green + wich", "reason": "绿地，地名感", "zh": "「绿地」", "syllables": 2, "letters": 9, "risk": "格林威治知名"},
    {"name": "Westbrook", "route": "2", "etymology": "west + brook", "reason": "西溪，常见但好读", "zh": "「西溪」", "syllables": 2, "letters": 9, "risk": "常见姓氏/地名"},
    {"name": "Clearmont", "route": "2", "etymology": "clear + mont", "reason": "清山，透明", "zh": "「清山」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Steadmont", "route": "2", "etymology": "stead + mont", "reason": "稳山，可靠", "zh": "「稳山」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Truehaven", "route": "2", "etymology": "true + haven", "reason": "真港，诚实庇护", "zh": "「真港」", "syllables": 3, "letters": 9, "risk": ""},
    {"name": "Levelmere", "route": "2", "etymology": "level + mere", "reason": "平湖，公正", "zh": "「平湖」", "syllables": 3, "letters": 9, "risk": ""},
    {"name": "Calmfield", "route": "2", "etymology": "calm + field", "reason": "静野，沉稳", "zh": "「静野」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Evenwood", "route": "2", "etymology": "even + wood", "reason": "平林，均衡可信", "zh": "「平林」", "syllables": 3, "letters": 8, "risk": ""},
    {"name": "Stillmont", "route": "2", "etymology": "still + mont", "reason": "静山，平静", "zh": "「静山」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Brightmere", "route": "2", "etymology": "bright + mere", "reason": "亮湖，明朗", "zh": "「亮湖」", "syllables": 2, "letters": 10, "risk": ""},
    {"name": "Glenhaven", "route": "2", "etymology": "glen + haven", "reason": "峡谷港，苏格兰地名感", "zh": "「峡港」", "syllables": 3, "letters": 9, "risk": ""},
    {"name": "Millbrook", "route": "2", "etymology": "mill + brook", "reason": "磨坊溪，经典", "zh": "「磨溪」", "syllables": 2, "letters": 9, "risk": "常见地名"},
    {"name": "Windmere", "route": "2", "etymology": "wind + mere", "reason": "风湖，流动感", "zh": "「风湖」", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Goldcrest", "route": "2", "etymology": "gold + crest", "reason": "金顶，品质感", "zh": "「金顶」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Silvermere", "route": "2", "etymology": "silver + mere", "reason": "银湖，质感", "zh": "「银湖」", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "Copperwell", "route": "2", "etymology": "copper + well", "reason": "铜井，朴实", "zh": "「铜井」", "syllables": 3, "letters": 10, "risk": ""},
    {"name": "Ashbourne", "route": "2", "etymology": "ash + bourne", "reason": "灰溪镇，英式地名", "zh": "「灰溪」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Hartwell", "route": "2", "etymology": "hart + well", "reason": "鹿井，经典地名", "zh": "「鹿井」", "syllables": 2, "letters": 8, "risk": "常见地名"},
    {"name": "Kingsford", "route": "2", "etymology": "king + ford", "reason": "王津，地名感", "zh": "「王津」", "syllables": 2, "letters": 9, "risk": "常见地名"},
  # === Route 3: Neutral brand / empty vessel ===
    {"name": "Finchwell", "route": "3", "etymology": "finch + well", "reason": "雀泉，动物+自然轻组合", "zh": "「雀泉」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Heronly", "route": "3", "etymology": "heron + -ly", "reason": "鹭式，动物变形", "zh": "「鹭」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Steadio", "route": "3", "etymology": "stead + -io", "reason": "稳，steady 变形", "zh": "「稳」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Anchorly", "route": "3", "etymology": "anchor + -ly", "reason": "锚，可靠", "zh": "「锚」", "syllables": 3, "letters": 8, "risk": ""},
    {"name": "Compassio", "route": "3", "etymology": "compass + -io", "reason": "罗盘，方向感", "zh": "「罗盘」", "syllables": 3, "letters": 9, "risk": "compass 常见"},
    {"name": "Ledgerly", "route": "3", "etymology": "ledger + -ly", "reason": "账本，记录追踪弱联想", "zh": "「账本地」", "syllables": 3, "letters": 8, "risk": "Ledger 加密品牌"},
    {"name": "Badgerly", "route": "3", "etymology": "badger + -ly", "reason": "獾，好记动物", "zh": "「獾」", "syllables": 3, "letters": 8, "risk": ""},
    {"name": "Osprey", "route": "3", "etymology": "osprey 鱼鹰", "reason": "鱼鹰，敏锐", "zh": "「鱼鹰」", "syllables": 2, "letters": 6, "risk": "Osprey 背包品牌"},
    {"name": "Merlino", "route": "3", "etymology": "merlin + -o", "reason": "隼，智慧", "zh": "「隼」", "syllables": 3, "letters": 7, "risk": "Merlin 常见"},
    {"name": "Candidly", "route": "3", "etymology": "candid + -ly", "reason": "坦诚，诚实测量气质", "zh": "「坦诚」", "syllables": 3, "letters": 8, "risk": "副词感"},
    {"name": "Levelly", "route": "3", "etymology": "level + -ly", "reason": "平等，Linear 感", "zh": "「平」", "syllables": 3, "letters": 7, "risk": ""},
    {"name": "Plumbly", "route": "3", "etymology": "plumb + -ly", "reason": "垂直精准，测量弱联想", "zh": "「精准」", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Evenly", "route": "3", "etymology": "even + -ly", "reason": "均衡，统计感", "zh": "「均衡」", "syllables": 3, "letters": 6, "risk": "evenly 常见英文词"},
    {"name": "Steadly", "route": "3", "etymology": "stead + -ly", "reason": "稳固", "zh": "「稳固」", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Cranely", "route": "3", "etymology": "crane + -ly", "reason": "鹤，优雅", "zh": "「鹤」", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Wrenly", "route": "3", "etymology": "wren + -ly", "reason": "鹪鹩，小巧灵动", "zh": "「鹪鹩」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Larkly", "route": "3", "etymology": "lark + -ly", "reason": "云雀，轻盈", "zh": "「云雀」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Dovewell", "route": "3", "etymology": "dove + well", "reason": "鸽泉，平和", "zh": "「鸽泉」", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Hartly", "route": "3", "etymology": "hart + -ly", "reason": "鹿，自然", "zh": "「鹿」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Elmwell", "route": "3", "etymology": "elm + well", "reason": "榆泉，温润", "zh": "「榆泉」", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Ashly", "route": "3", "etymology": "ash + -ly", "reason": "灰树，短", "zh": "「灰」", "syllables": 2, "letters": 5, "risk": "Ashley 近音"},
    {"name": "Birchly", "route": "3", "etymology": "birch + -ly", "reason": "桦，清新", "zh": "「桦」", "syllables": 2, "letters": 7, "risk": ""},
    {"name": "Fernly", "route": "3", "etymology": "fern + -ly", "reason": "蕨，自然", "zh": "「蕨」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Mossly", "route": "3", "etymology": "moss + -ly", "reason": "苔，沉稳", "zh": "「苔」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Reedly", "route": "3", "etymology": "reed + -ly", "reason": "芦苇，柔韧", "zh": "「苇」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Brookly", "route": "3", "etymology": "brook + -ly", "reason": "溪，流畅", "zh": "「溪」", "syllables": 2, "letters": 7, "risk": "Brooklyn 近音"},
    {"name": "Glenly", "route": "3", "etymology": "glen + -ly", "reason": "峡谷，地名感", "zh": "「峡」", "syllables": 2, "letters": 6, "risk": ""},
    {"name": "Valewell", "route": "3", "etymology": "vale + well", "reason": "谷泉，田园", "zh": "「谷泉」", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Moorwell", "route": "3", "etymology": "moor + well", "reason": "沼泉，英式", "zh": "「沼泉」", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Fieldwell", "route": "3", "etymology": "field + well", "reason": "野泉，开阔", "zh": "「野泉」", "syllables": 2, "letters": 9, "risk": ""},
    {"name": "Havenly", "route": "3", "etymology": "haven + -ly", "reason": "港式，庇护", "zh": "「港」", "syllables": 3, "letters": 7, "risk": "Havenly 家居品牌"},
    {"name": "Portwell", "route": "3", "etymology": "port + well", "reason": "港泉，通达", "zh": "「港泉」", "syllables": 2, "letters": 8, "risk": ""},
    {"name": "Baywell", "route": "3", "etymology": "bay + well", "reason": "湾泉，短组合", "zh": "「湾泉」", "syllables": 2, "letters": 7, "risk": ""},
]

ROUTE_NAMES = {
    "1": "两词组合",
    "2": "更长好读造词",
    "3": "中性品牌/空壳词",
}

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
    route = candidate["route"]
    # S: calm/trust, readable, no major risk flag
    if risk and any(k in risk for k in ("品牌", "常见英文词", "Greenwich", "Fairmont", "Osprey", "Ledger", "Havenly", "Brooklyn", "Ashley")):
        return "B"
    if letters <= 10 and route in ("1", "3"):
        return "S"
    if letters <= 12:
        return "S" if not risk else "A"
    if letters <= 14:
        return "A"
    return "B"


def main() -> None:
    brand_root = Path(__file__).resolve().parents[1]
    out_dir = brand_root / "data"
    out_dir.mkdir(parents=True, exist_ok=True)

    results: list[dict] = []
    print(f"Round 2: checking {len(CANDIDATES)} .com domains...")
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
        "round": 2,
        "strategy": "calm_trust_empty_vessel",
        "checked_at": checked_at,
        "method": f"WHOIS via {WHOIS_HOST}:{WHOIS_PORT}",
        "total": len(results),
        "available_count": sum(1 for r in results if r["status"] == "available"),
        "taken_count": sum(1 for r in results if r["status"] == "taken"),
        "unknown_count": sum(1 for r in results if r["status"] == "unknown"),
        "candidates": results,
    }

    json_path = out_dir / "domain-check-round2.json"
    csv_path = out_dir / "domain-check-round2.csv"
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

    s_avail = [r for r in results if r["tier"] == "S"]
    print(f"\nDone. Available: {payload['available_count']}, S-tier: {len(s_avail)}")
    print(f"S-tier: {[r['domain'] for r in s_avail]}")
    print(f"JSON: {json_path}")


if __name__ == "__main__":
    main()
