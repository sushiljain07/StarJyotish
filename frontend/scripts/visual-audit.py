#!/usr/bin/env python3
"""
visual-audit.py — Star Jyotish visual regression check
=======================================================

Builds the frontend (optional), serves the dist folder,
screenshots key pages at desktop (1440px) and mobile (390px),
then prints a colour-coded diff summary.

Usage:
    # Build first, then audit
    cd frontend && python3 scripts/visual-audit.py --build

    # Audit the already-built dist (fast, use after minor changes)
    cd frontend && python3 scripts/visual-audit.py

    # Skip pixel diff, just produce screenshots for manual review
    cd frontend && python3 scripts/visual-audit.py --no-diff

Requirements (all already in the dev environment):
    pip install playwright Pillow
    playwright install chromium

Output:
    frontend/screenshots/  — PNG files for every page × viewport
    Console               — PASS / WARN / FAIL per screenshot pair
"""

import argparse
import http.server
import json
import os
import socketserver
import subprocess
import sys
import threading
import time
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit("playwright not installed — run: pip install playwright && playwright install chromium")

try:
    from PIL import Image
    import numpy as np
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

# ── Paths ─────────────────────────────────────────────────────────────────
SCRIPT_DIR  = Path(__file__).parent
FRONTEND    = SCRIPT_DIR.parent
DIST        = FRONTEND / "dist"
OUT_DIR     = FRONTEND / "screenshots"
BASELINE    = FRONTEND / "screenshots" / "baseline"
PORT        = 4299

# ── Minimal but realistic chart payload ─────────────────────────────────────
CHART = {
    "ascendant": {
        "sign": "Capricorn", "sign_index": 9, "degree": 11.5,
        "nakshatra": "Shravana", "nakshatra_lord": "Moon",
    },
    "planets": [
        {"name":"Sun","sign":"Cancer","sign_index":3,"degree":9.2,"house_number":7,"nakshatra":"Pushya","nakshatra_pada":2,"nakshatra_lord":"Saturn","retrograde":False},
        {"name":"Moon","sign":"Capricorn","sign_index":9,"degree":26.1,"house_number":1,"nakshatra":"Dhanishta","nakshatra_pada":1,"nakshatra_lord":"Mars","retrograde":False},
        {"name":"Mars","sign":"Virgo","sign_index":5,"degree":24.3,"house_number":9,"nakshatra":"Chitra","nakshatra_pada":1,"nakshatra_lord":"Mars","retrograde":False},
        {"name":"Mercury","sign":"Cancer","sign_index":3,"degree":26.8,"house_number":7,"nakshatra":"Ashlesha","nakshatra_pada":3,"nakshatra_lord":"Mercury","retrograde":False},
        {"name":"Jupiter","sign":"Scorpio","sign_index":7,"degree":7.4,"house_number":11,"nakshatra":"Anuradha","nakshatra_pada":2,"nakshatra_lord":"Saturn","retrograde":True},
        {"name":"Venus","sign":"Leo","sign_index":4,"degree":14.9,"house_number":8,"nakshatra":"Purva Phalguni","nakshatra_pada":1,"nakshatra_lord":"Venus","retrograde":False},
        {"name":"Saturn","sign":"Libra","sign_index":6,"degree":4.6,"house_number":10,"nakshatra":"Chitra","nakshatra_pada":3,"nakshatra_lord":"Mars","retrograde":True},
        {"name":"Rahu","sign":"Taurus","sign_index":1,"degree":29.4,"house_number":5,"nakshatra":"Mrigashira","nakshatra_pada":1,"nakshatra_lord":"Mars","retrograde":True},
        {"name":"Ketu","sign":"Scorpio","sign_index":7,"degree":29.4,"house_number":11,"nakshatra":"Jyeshtha","nakshatra_pada":3,"nakshatra_lord":"Mercury","retrograde":True},
    ],
    "dasha": {
        "current_mahadasha":  {"planet":"Saturn","start":"2022-01-15","end":"2041-01-15"},
        "current_antardasha": {"planet":"Mercury","start":"2025-01-20","end":"2027-09-28"},
        "full_sequence": [
            {"planet":"Saturn","start":"2022-01-15","end":"2041-01-15"},
            {"planet":"Mercury","start":"2041-01-15","end":"2058-01-15"},
            {"planet":"Ketu","start":"2058-01-15","end":"2065-01-15"},
            {"planet":"Venus","start":"2065-01-15","end":"2085-01-15"},
        ],
    },
    "navamsa_planets": [],
    "navamsa_ascendant": {"sign":"Aries","sign_index":0,"degree":1.0},
}

PROFILE = {
    "id": "audit-test-1",
    "relation": "self",
    "label": "Audit User",
    "birth_date": "1983-07-26",
    "birth_time": "19:20",
    "birth_time_accuracy": "exact",
    "place": "Bargarh, Odisha, India",
    "is_primary": True,
    "created_at": "2026-01-01T00:00:00Z",
    "chart": CHART,
}

LOCALSTORAGE_SEED = {
    "sj_astrology_profiles_v1": json.dumps({"anonymous": [PROFILE]}),
}

# ── Pages to audit ─────────────────────────────────────────────────────────
#
# Each entry: (url_path, name, [clip_regions])
# clip_regions — list of {"name": ..., "x":, "y":, "width":, "height":}
#   to screenshot in addition to the full page. Useful for checking just
#   the header or footer in isolation.
PAGES = [
    ("/",        "landing",  [{"name":"header", "x":0, "y":0, "width":1440, "height":60}]),
    ("/home",    "home",     [{"name":"header", "x":0, "y":0, "width":1440, "height":60}]),
    ("/generate","generate", []),
    ("/learn",   "learn",    []),
    ("/login",   "login",    []),
    ("/about",   "about",    []),
    ("/faq",     "faq",      []),
    ("/privacy", "privacy",  []),
]

VIEWPORTS = [
    ("desktop", 1440, 900),
    ("mobile",  390,  844),
]

# ── Pixel checks run after every screenshot ────────────────────────────────
#
# Format: {"name": str, "x": int, "y": int, "expected_hex": str,
#          "tolerance": int}   — tolerance is max allowed channel diff (0–255)
#
# These are the checks that caught the grey header bug:
# at scroll=0 on every page the header must be the night colour.
PIXEL_CHECKS = {
    "landing-desktop-top": [
        {"name":"header background", "x":100, "y":30, "expected_hex":"#171b33", "tolerance":20},
        {"name":"header text visible", "x":320, "y":30, "expected_hex":"#f5e6c8", "tolerance":60},
    ],
    "home-desktop-top": [
        {"name":"header background", "x":100, "y":30, "expected_hex":"#171b33", "tolerance":20},
    ],
    "generate-desktop-top": [
        {"name":"header background", "x":100, "y":30, "expected_hex":"#171b33", "tolerance":20},
    ],
}


# ── SPA-aware static server ────────────────────────────────────────────────
class _SPA(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST), **kwargs)

    def do_GET(self):
        path = self.path.split("?")[0]
        full = DIST / path.lstrip("/")
        if path == "/" or (not full.exists() and "." not in path.split("/")[-1]):
            self.path = "/index.html"
        return super().do_GET()

    def log_message(self, *_args):
        pass  # silence access log


def _start_server():
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), _SPA)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd


# ── Pixel diff helper ──────────────────────────────────────────────────────
def _hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def _pixel_check(img_path: Path, checks: list) -> list[dict]:
    """Returns list of {name, result, actual, expected} dicts."""
    if not HAS_PIL:
        return []
    import numpy as np
    arr = np.array(Image.open(img_path).convert("RGB"))
    results = []
    for c in checks:
        r, g, b = arr[c["y"], c["x"]]
        actual   = f"#{r:02x}{g:02x}{b:02x}"
        er, eg, eb = _hex_to_rgb(c["expected_hex"])
        diff = max(abs(int(r)-er), abs(int(g)-eg), abs(int(b)-eb))
        results.append({
            "name":     c["name"],
            "actual":   actual,
            "expected": c["expected_hex"],
            "passed":   diff <= c["tolerance"],
            "diff":     diff,
        })
    return results


# ── ANSI colours ──────────────────────────────────────────────────────────
GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
RESET  = "\033[0m"
BOLD   = "\033[1m"


def _pass(msg):   print(f"  {GREEN}✓{RESET}  {msg}")
def _warn(msg):   print(f"  {YELLOW}⚠{RESET}  {msg}")
def _fail(msg):   print(f"  {RED}✗{RESET}  {msg}")


# ── Main ──────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Star Jyotish visual audit")
    parser.add_argument("--build",   action="store_true", help="Run vite build before auditing")
    parser.add_argument("--no-diff", action="store_true", help="Skip pixel checks, just capture screenshots")
    parser.add_argument("--baseline", action="store_true", help="Save screenshots as the new baseline instead of comparing")
    args = parser.parse_args()

    # ── Build ────────────────────────────────────────────────────────
    if args.build:
        print(f"{BOLD}Building frontend…{RESET}")
        result = subprocess.run(["npm", "run", "build"], cwd=FRONTEND, capture_output=True, text=True)
        if result.returncode != 0:
            print(result.stderr[-3000:])
            sys.exit(f"{RED}Build failed{RESET}")
        print(f"  {GREEN}✓{RESET}  build complete")

    if not DIST.exists():
        sys.exit(f"{RED}dist/ not found — run with --build first{RESET}")

    # ── Prepare output dirs ──────────────────────────────────────────
    OUT_DIR.mkdir(exist_ok=True)
    if args.baseline:
        BASELINE.mkdir(exist_ok=True)

    # ── Start server ─────────────────────────────────────────────────
    httpd = _start_server()
    time.sleep(0.4)
    BASE = f"http://127.0.0.1:{PORT}"

    init_script = f"""
      const data = {json.dumps(LOCALSTORAGE_SEED)};
      for (const [k, v] of Object.entries(data)) localStorage.setItem(k, v);
    """

    total = passed = failed = warned = 0

    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()

            for vp_name, vp_w, vp_h in VIEWPORTS:
                print(f"\n{BOLD}{vp_name} ({vp_w}×{vp_h}){RESET}")
                ctx = browser.new_context(viewport={"width": vp_w, "height": vp_h})
                page = ctx.new_page()
                page.add_init_script(init_script)

                for path, name, clips in PAGES:
                    label = f"{name}-{vp_name}"
                    page.goto(f"{BASE}{path}", wait_until="load", timeout=15000)
                    page.wait_for_timeout(1000)

                    # Full page
                    out = OUT_DIR / f"{label}-top.png"
                    page.screenshot(path=str(out))

                    # Footer
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    page.wait_for_timeout(400)
                    page.screenshot(path=str(OUT_DIR / f"{label}-footer.png"))

                    # Clips
                    page.evaluate("window.scrollTo(0, 0)")
                    page.wait_for_timeout(200)
                    for clip in clips:
                        clip_path = OUT_DIR / f"{label}-{clip['name']}.png"
                        page.screenshot(path=str(clip_path),
                                        clip={"x": clip["x"], "y": clip["y"],
                                              "width": clip["width"], "height": clip["height"]})

                    # Pixel checks
                    if not args.no_diff and not args.baseline:
                        checks = PIXEL_CHECKS.get(f"{label}-top", [])
                        results = _pixel_check(out, checks)
                        for r in results:
                            total += 1
                            if r["passed"]:
                                passed += 1
                                _pass(f"{label}: {r['name']} ({r['actual']})")
                            else:
                                failed += 1
                                _fail(f"{label}: {r['name']} — got {r['actual']}, expected {r['expected']} (diff={r['diff']})")
                    elif args.baseline:
                        import shutil
                        shutil.copy(out, BASELINE / out.name)

                    if not checks if not args.no_diff and not args.baseline else True:
                        print(f"  {GREEN}✓{RESET}  {label} — captured")

                ctx.close()
            browser.close()

    finally:
        httpd.shutdown()

    # ── Summary ──────────────────────────────────────────────────────
    print(f"\n{BOLD}Screenshots saved to:{RESET} {OUT_DIR}")
    if not args.no_diff and not args.baseline and total > 0:
        colour = GREEN if failed == 0 else RED
        print(f"{BOLD}Pixel checks:{RESET} {colour}{passed}/{total} passed{RESET}")
        if failed > 0:
            print(f"  Review {OUT_DIR} to diagnose failing checks")
            sys.exit(1)


if __name__ == "__main__":
    main()
