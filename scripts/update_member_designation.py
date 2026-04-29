"""
Fetch member data from the Rotary India directory API and update the
`designation` column in `member_master_profile` (DB: rotaryindia_production).

Match strategy:
    A row is updated when EITHER member_rotary_id OR member_mobile_no matches
    the value coming from the API. (Adjust the WHERE clause to AND if you
    want both to match simultaneously.)

Source field mapping (API -> DB column):
    Classification (fallback: Designation) -> designation

Requirements:
    pip install requests pymysql
"""

import re
import sys
import requests
import pymysql

# ─── CONFIG ──────────────────────────────────────────────────────────────────
DB_CONFIG = {
    "host":     "localhost",
    "user":     "root",
    "password": "",
    "database": "rotaryindia_production",
    "charset":  "utf8mb4",
}

TABLE           = "member_master_profile"
COL_MOBILE      = "member_mobile_no"
COL_ROTARY_ID   = "member_rotary_id"
COL_DESIGNATION = "designation"

API_URL         = "http://rotaryindiaapi.rosteronwheels.com/api/Directory/Club_Details_District_Committee_PDF"
DISTRICT_NUMBER = "3262"
YEAR_FILTER     = "2026-2027"

DRY_RUN = False  # set True to preview without writing
# ─────────────────────────────────────────────────────────────────────────────


def clean_mobile(raw) -> str:
    """Strip non-digits and keep last 10 digits (Indian mobile)."""
    if not raw:
        return ""
    digits = re.sub(r"\D+", "", str(raw))
    return digits[-10:] if len(digits) >= 10 else digits


def fetch_members():
    print(f"[*] Fetching members from API for district {DISTRICT_NUMBER} ({YEAR_FILTER})...")
    resp = requests.post(
        API_URL,
        json={"District_number": DISTRICT_NUMBER, "year_filter": YEAR_FILTER},
        headers={"Content-Type": "application/json"},
        timeout=120,
    )
    resp.raise_for_status()
    data = resp.json() or {}

    members = data.get("Member_Details") or []
    pres_sec = data.get("President_And_Secretary") or []

    combined = []
    seen = set()
    for m in members + pres_sec:
        rid = (m.get("RotaryID") or "").strip()
        mob = clean_mobile(m.get("MobileNumber"))
        key = (rid, mob)
        if key in seen:
            continue
        seen.add(key)

        designation = (
            (m.get("Classification") or "").strip()
            or (m.get("Designation") or "").strip()
            or (m.get("Member_Designation") or "").strip()
        )
        if not designation:
            continue
        if not (rid or mob):
            continue

        combined.append({"rotary_id": rid, "mobile": mob, "designation": designation})

    print(f"[*] {len(combined)} members with designation data")
    return combined


def update_db(rows):
    conn = pymysql.connect(**DB_CONFIG)
    updated = matched = missing = 0
    try:
        with conn.cursor() as cur:
            sql = (
                f"UPDATE {TABLE} "
                f"SET {COL_DESIGNATION} = %s "
                f"WHERE ({COL_ROTARY_ID} = %s AND %s <> '') "
                f"   OR ({COL_MOBILE} = %s AND %s <> '')"
            )
            for r in rows:
                rid, mob, des = r["rotary_id"], r["mobile"], r["designation"]
                if DRY_RUN:
                    print(f"  [dry] {rid:>10}  {mob:>10}  -> {des}")
                    continue
                affected = cur.execute(sql, (des, rid, rid, mob, mob))
                if affected:
                    updated += affected
                    matched += 1
                else:
                    missing += 1
        if not DRY_RUN:
            conn.commit()
    finally:
        conn.close()

    print(f"[OK] matched rows: {matched}   updated rows: {updated}   no-match: {missing}")


def main():
    try:
        rows = fetch_members()
        if not rows:
            print("[!] No members fetched. Aborting.")
            sys.exit(1)
        update_db(rows)
    except requests.HTTPError as e:
        print(f"[ERR] API failed: {e}")
        sys.exit(2)
    except pymysql.MySQLError as e:
        print(f"[ERR] DB failed: {e}")
        sys.exit(3)


if __name__ == "__main__":
    main()
