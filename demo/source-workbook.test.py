"""Validate the public synthetic fixture without a private workbook dependency."""
import json
from decimal import Decimal
from pathlib import Path

source = json.loads((Path(__file__).parent / "source-data.js").read_text().split("=", 1)[1].strip().rstrip(";"))
assert source["kind"] == "synthetic"
assert source["version"] == "public-demo-v1"
assert source["asOf"] == "2026-09-30"
for kind, amounts in [("funds", ["size", "request"]), ("deals", ["round", "request"])]:
    rows = source[kind]
    assert len(rows) == source["controls"][kind]["count"]
    assert len({row["id"] for row in rows}) == len(rows)
    for row in rows:
        assert row["name"].startswith("演示·")
        assert "row" not in row
        if kind == "funds":
            assert row["manager"].startswith("演示·")
        else:
            assert "虚构" in row["summary"]
    for field in amounts:
        assert sum(Decimal(str(row[field])) for row in rows) == Decimal(str(source["controls"][kind][field]))
        assert all(Decimal(str(row[field])) >= 0 for row in rows)
assert len({row["name"].removesuffix("（第二轮）") for row in source["deals"]}) == 37
print("Public synthetic records, labels, IDs, totals and duplicate-round example verified.")
