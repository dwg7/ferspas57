#!/usr/bin/env bash
# Convert one FERSPAS HIH raster (Score or FinalLocation) into this project's
# tile/vector formats. Wraps the exact GDAL/pmtiles flags documented in
# DECISIONS.md D7-D11 with parameter substitution only — no new logic beyond
# what that narrative already describes. See D-entry for this expansion round
# for why this script exists now rather than repeating commands by hand again.
#
# Usage:
#   convert-hih.sh score --country <iso3-lower> --commodity <slug> \
#     (--collection <fao-gismgr:HIH:...> | --input <local-cog.tif>) \
#     [--out-dir DIR] [--dry-run]
#   convert-hih.sh final --country <iso3-lower> --commodity <slug> \
#     (--collection <fao-gismgr:HIH:...> | --input <local-cog.tif>) \
#     [--out-dir DIR] [--dry-run]
#
# score mode produces <out-dir>/hih-<country>-<commodity>-score.pmtiles
# final mode produces <out-dir>/hih-<country>-<commodity>-final.geojson
#
# --collection fetches the STAC item's `data` asset href (Google Cloud
# Storage, public) and downloads it; --input uses an already-local COG.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PALETTE="$SCRIPT_DIR/hih-score-palette.txt"
PALETTE_VRT_PY="$SCRIPT_DIR/make-palette-vrt.py"
STAC_BASE="https://data.review.fao.org/geospatial/search/stac/collections"

MODE="${1:-}"
shift || true
COUNTRY=""
COMMODITY=""
COLLECTION=""
INPUT=""
OUT_DIR="."
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --country) COUNTRY="$2"; shift 2 ;;
    --commodity) COMMODITY="$2"; shift 2 ;;
    --collection) COLLECTION="$2"; shift 2 ;;
    --input) INPUT="$2"; shift 2 ;;
    --out-dir) OUT_DIR="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    *) echo "unknown argument: $1" >&2; exit 1 ;;
  esac
done

if [[ "$MODE" != "score" && "$MODE" != "final" ]]; then
  echo "first argument must be 'score' or 'final'" >&2; exit 1
fi
if [[ -z "$COUNTRY" || -z "$COMMODITY" ]]; then
  echo "--country and --commodity are required" >&2; exit 1
fi
if [[ -z "$COLLECTION" && -z "$INPUT" ]]; then
  echo "one of --collection or --input is required" >&2; exit 1
fi

mkdir -p "$OUT_DIR"
NAME="hih-${COUNTRY}-${COMMODITY}-${MODE}"

run() {
  echo "+ $*"
  if [[ "$DRY_RUN" -eq 0 ]]; then "$@"; fi
}

# --- Resolve source COG ------------------------------------------------
SRC="$INPUT"
if [[ -z "$SRC" ]]; then
  SRC="$OUT_DIR/${NAME}_src.tif"
  ITEMS_URL="$STAC_BASE/$COLLECTION/items?limit=1"
  echo "resolving asset href from $ITEMS_URL"
  HREF=$(curl -sL -A "Mozilla/5.0" "$ITEMS_URL" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['features'][0]['assets']['data']['href'])")
  if [[ -z "$HREF" ]]; then
    echo "could not resolve data asset href for $COLLECTION" >&2; exit 1
  fi
  echo "downloading $HREF"
  run curl -sL -A "Mozilla/5.0" -o "$SRC" "$HREF"
fi

if [[ "$DRY_RUN" -eq 0 && ! -f "$SRC" ]]; then
  echo "source file not found: $SRC" >&2; exit 1
fi

# --- Score mode: continuous 0-100, hidden -9999 sentinel ----------------
# D10: Score/LocationScore layers are Float32 with a *hidden* -9999 sentinel
# on top of the declared NoData — mask both in one condition since -9999 is
# well below any real declared NoData value (typically float32 min).
if [[ "$MODE" == "score" ]]; then
  BYTE="$OUT_DIR/${NAME}_byte.tif"
  PAL_VRT="$OUT_DIR/${NAME}_pal.vrt"
  RAW_MBT="$OUT_DIR/${NAME}_raw.mbtiles"
  OUT_PMT="$OUT_DIR/${NAME}.pmtiles"

  run gdal_calc.py -A "$SRC" --outfile="$BYTE" --type=Byte --NoDataValue=255 \
    --calc="numpy.where((A<=-9999)|(A>100),255,numpy.clip(numpy.round(A),0,100).astype(numpy.uint8))" \
    --overwrite --quiet

  run python3 "$PALETTE_VRT_PY" "$BYTE" "$PALETTE" "$PAL_VRT"

  run gdal_translate -of MBTILES -co RESAMPLING=NEAREST "$PAL_VRT" "$RAW_MBT"
  run gdaladdo -r nearest "$RAW_MBT" 2 4 8 16 32 64 128
  run pmtiles convert "$RAW_MBT" "$OUT_PMT"
  run pmtiles verify "$OUT_PMT"

  echo "done: $OUT_PMT"
fi

# --- Final mode: sparse near-binary -> vector polygons -------------------
# D10/D11: FinalLocation layers are Int16, near-binary, with only a handful
# of value==1 "selected site" pixels — too sparse for raster tiling, so
# these become GeoJSON polygons instead. -mask excludes NoData/non-1 pixels
# from polygonization so no giant background polygon is produced.
if [[ "$MODE" == "final" ]]; then
  MASK="$OUT_DIR/${NAME}_mask.tif"
  RAW_GEOJSON="$OUT_DIR/${NAME}_raw.geojson"
  OUT_GEOJSON="$OUT_DIR/${NAME}.geojson"

  run gdal_calc.py -A "$SRC" --outfile="$MASK" --type=Byte --NoDataValue=0 \
    --calc="(A==1)" --overwrite --quiet

  run gdal_polygonize.py -mask "$MASK" "$MASK" -f GeoJSON "$RAW_GEOJSON" raw DN

  if [[ "$DRY_RUN" -eq 0 ]]; then
    python3 - "$RAW_GEOJSON" "$OUT_GEOJSON" "$COUNTRY" "$COMMODITY" "$COLLECTION" <<'PYEOF'
import json, sys
raw_path, out_path, country, commodity, collection = sys.argv[1:6]
with open(raw_path) as f:
    data = json.load(f)
for i, feat in enumerate(data["features"], start=1):
    feat["properties"] = {
        "country": country.upper(),
        "commodity": commodity,
        "source_collection": collection,
        "site_id": i,
    }
with open(out_path, "w") as f:
    json.dump(data, f)
print(f"wrote {out_path} with {len(data['features'])} feature(s)")
PYEOF
  else
    echo "+ (dry-run) enrich $RAW_GEOJSON -> $OUT_GEOJSON"
  fi

  echo "done: $OUT_GEOJSON"
fi
