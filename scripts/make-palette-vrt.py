#!/usr/bin/env python3
"""Wrap a single-band Byte GeoTIFF in a VRT with a 256-entry RGBA palette,
read from a plain-text file (one "R G B A" line per index 0-255).

Small, single-purpose helper for scripts/convert-hih.sh — not a general tool.
See DECISIONS.md D7-D11 for why the palette approach (vs. baking colors into
the raster directly) was chosen: keeps tiles queryable by raw score value.
"""
import sys
from osgeo import gdal


def main():
    if len(sys.argv) != 4:
        print("usage: make-palette-vrt.py <byte.tif> <palette.txt> <out.vrt>", file=sys.stderr)
        sys.exit(1)
    byte_tif, palette_txt, out_vrt = sys.argv[1:4]

    with open(palette_txt) as f:
        rows = [line.split() for line in f if line.strip()]
    if len(rows) != 256:
        print(f"palette file must have exactly 256 rows, got {len(rows)}", file=sys.stderr)
        sys.exit(1)

    src = gdal.Open(byte_tif)
    if src is None:
        print(f"could not open {byte_tif}", file=sys.stderr)
        sys.exit(1)

    driver = gdal.GetDriverOf(src) if hasattr(gdal, "GetDriverOf") else None
    vrt_ds = gdal.GetDriverByName("VRT").CreateCopy(out_vrt, src, strict=0)

    ct = gdal.ColorTable()
    for i, (r, g, b, a) in enumerate(rows):
        ct.SetColorEntry(i, (int(r), int(g), int(b), int(a)))

    band = vrt_ds.GetRasterBand(1)
    band.SetRasterColorTable(ct)
    band.SetRasterColorInterpretation(gdal.GCI_PaletteIndex)
    vrt_ds.FlushCache()
    vrt_ds = None
    print(f"wrote {out_vrt}")


if __name__ == "__main__":
    main()
