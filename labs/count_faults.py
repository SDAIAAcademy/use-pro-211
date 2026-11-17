# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Counts the faults of a coded maintenance log: per asset and code, the total, the largest
number inside any 90-day window, and whether that makes the fault a recurring one.

    uv run labs/count_faults.py
    uv run labs/count_faults.py --file labs/files/runs/mikshaf_coding.csv --column mikshaf_code
    uv run labs/count_faults.py --asset P-101B --code SEAL --rows

The counts come from the rows, so every number can be traced: --rows prints the work orders
behind one number. The script reads a file and prints; it writes nothing and calls no model.
"""
import argparse
import csv
import sys

sys.stdout.reconfigure(encoding="utf-8")
from collections import defaultdict
from datetime import date
from pathlib import Path

WINDOW_DAYS = 90      # the codebook's rule: the same code on the same asset,
MIN_IN_WINDOW = 3     # three times or more inside any 90 days
NOT_FAULTS = {"PM", "OTH"}


def read_rows(path: Path, column: str) -> list[dict]:
    with path.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    if not rows or column not in rows[0]:
        sys.exit(f"{path.name}: no column named {column}")
    return rows


def max_in_window(days: list[int]) -> int:
    days = sorted(days)
    best = 0
    for i, start in enumerate(days):
        j = i
        while j < len(days) and days[j] - start <= WINDOW_DAYS:
            j += 1
        best = max(best, j - i)
    return best


def main() -> None:
    here = Path(__file__).resolve().parent
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--file", type=Path, default=here / "files" / "runs" / "mikshaf_coding.csv")
    ap.add_argument("--column", default="mikshaf_code", help="the column that holds the code")
    ap.add_argument("--asset", help="only this asset")
    ap.add_argument("--code", help="only this code")
    ap.add_argument("--rows", action="store_true", help="print the work orders behind the counts")
    ap.add_argument("--min", type=int, default=4, help="show groups with at least this many entries")
    a = ap.parse_args()

    rows = read_rows(a.file, a.column)
    groups: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for r in rows:
        code = r[a.column].strip().upper()
        if code in NOT_FAULTS or not code:
            continue
        if a.asset and r["asset"] != a.asset:
            continue
        if a.code and code != a.code.upper():
            continue
        groups[(r["asset"], code)].append(r)

    print(f"{a.file.name}, column {a.column}: {len(rows)} work orders")
    print(f"{'asset':<10} {'code':<5} {'count':>5} {'max in 90 days':>15}  recurring")
    table = []
    for (asset, code), rs in groups.items():
        days = [date.fromisoformat(r["date"]).toordinal() for r in rs]
        w = max_in_window(days)
        table.append((len(rs), asset, code, w, rs))
    for n, asset, code, w, rs in sorted(table, key=lambda t: (-t[0], t[1], t[2])):
        if n < a.min and not (a.asset or a.code):
            continue
        print(f"{asset:<10} {code:<5} {n:>5} {w:>15}  {'yes' if w >= MIN_IN_WINDOW else 'no'}")
        if a.rows:
            for r in sorted(rs, key=lambda r: r["date"]):
                print(f"    {r['wo_id']}  {r['date']}  {r['text']}")


if __name__ == "__main__":
    main()
