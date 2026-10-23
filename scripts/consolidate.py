#!/usr/bin/env python3
"""Consolidate the per-region research JSON into `app/public/data/projects.geojson`.

Usage (run from repo root):
    python3 scripts/consolidate.py

Reads region JSON files from `scripts/regions/*.json` (one JSON array each),
normalises statuses to the app's three-bucket taxonomy, validates the schema,
dedupes by name, and writes the FeatureCollection used by the map.
"""

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGIONS_DIR = os.path.join(ROOT, "scripts", "regions")
OUTPUT = os.path.join(ROOT, "app", "public", "data", "projects.geojson")

STATUS_MAP = {
    "operational": "operational",
    "underperforming": "underperforming",
    "construction": "development",
    "planning": "development",
}

STAGE_MAP = {
    "operational": "operational",
    "underperforming": "operational",
    "construction": "construction",
    "planning": "planning",
}

ALLOWED_STAGES = {
    "operational",
    "construction",
    "planning",
    "advanced development",
    "early development",
}

ALLOWED_TYPES = {
    "capture",
    "storage",
    "power",
    "hydrogen",
    "DAC",
    "industrial",
    "hub",
    "bioenergy",
}

REQUIRED_KEYS = {
    "name",
    "country",
    "status",
    "stage",
    "type",
    "operator",
    "location",
    "capacity",
    "description",
    "longitude",
    "latitude",
}


def clean_text(value):
    if value is None:
        return ""
    return str(value).strip()


def normalise(item, source):
    """Validate and normalise one facility dict. Returns (props, geometry) or None."""
    if not isinstance(item, dict):
        return None

    name = clean_text(item.get("name"))
    if not name:
        return None

    raw_status = clean_text(item.get("status")).lower()
    status = STATUS_MAP.get(raw_status)
    if status is None:
        print(f"  [{source}] skipping {name!r}: unknown status {raw_status!r}")
        return None

    raw_stage = clean_text(item.get("stage")).lower()
    stage = raw_stage if raw_stage in ALLOWED_STAGES else STAGE_MAP.get(raw_status, "planning")

    raw_type = clean_text(item.get("type"))
    if raw_type not in ALLOWED_TYPES:
        raw_type = "capture"

    try:
        lng = float(item.get("longitude"))
        lat = float(item.get("latitude"))
    except (TypeError, ValueError):
        print(f"  [{source}] skipping {name!r}: missing/invalid coordinates")
        return None

    props = {
        "name": name,
        "country": clean_text(item.get("country")),
        "status": status,
        "stage": stage,
        "type": raw_type,
        "operator": clean_text(item.get("operator")),
        "location": clean_text(item.get("location")),
        "capacity": clean_text(item.get("capacity")) or "—",
        "description": clean_text(item.get("description")),
    }

    missing = [k for k in REQUIRED_KEYS - {"longitude", "latitude"} if not props.get(k)]
    if missing:
        print(f"  [{source}] {name!r}: missing fields {missing}")

    geometry = {"type": "Point", "coordinates": [lng, lat]}
    return props, geometry


def main():
    if not os.path.isdir(REGIONS_DIR):
        print(f"No region files at {REGIONS_DIR}")
        return

    seen = set()
    features = []
    files = sorted(f for f in os.listdir(REGIONS_DIR) if f.endswith(".json"))
    for filename in files:
        source = filename
        path = os.path.join(REGIONS_DIR, filename)
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        items = data if isinstance(data, list) else data.get("features", [])
        for item in items:
            result = normalise(item, source)
            if result is None:
                continue
            props, geometry = result
            key = props["name"].casefold()
            if key in seen:
                print(f"  [{source}] duplicate {props['name']!r} — dropped")
                continue
            seen.add(key)
            features.append(
                {"type": "Feature", "geometry": geometry, "properties": props}
            )

    # Sort: status order (operational, underperforming, development), then country, name
    order = {"operational": 0, "underperforming": 1, "development": 2}
    features.sort(
        key=lambda f: (
            order.get(f["properties"]["status"], 9),
            f["properties"]["country"].casefold(),
            f["properties"]["name"].casefold(),
        )
    )

    out = {"type": "FeatureCollection", "features": features}
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    from collections import Counter

    statuses = Counter(f["properties"]["status"] for f in features)
    countries = Counter(f["properties"]["country"] for f in features)
    print(f"Wrote {len(features)} facilities to {OUTPUT}")
    print("By status:", dict(statuses))
    print("By country:", dict(sorted(countries.items())))


if __name__ == "__main__":
    main()
