#!/usr/bin/env python3
"""Wrap a single-band Byte GeoTIFF in a VRT with a 256-entry RGBA palette,
read from a plain-text file (one "R G B A" line per index 0-255).

Pure text/XML manipulation, no GDAL Python bindings required (the system
python3 running this may not have osgeo installed even when the GDAL CLI
tools do, as on this machine) — shells out to `gdal_translate -of VRT` for
the base VRT, then inserts a <ColorTable> via string substitution.

Small, single-purpose helper for scripts/convert-hih.sh — not a general tool.
See DECISIONS.md D7-D11 for why the palette approach (vs. baking colors into
the raster directly) was chosen: keeps tiles queryable by raw score value.
"""
import subprocess
import sys


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

    subprocess.run(
        ["gdal_translate", "-of", "VRT", byte_tif, out_vrt],
        check=True, capture_output=True,
    )

    with open(out_vrt) as f:
        content = f.read()

    entries = "\n".join(
        f'      <Entry c1="{r}" c2="{g}" c3="{b}" c4="{a}"/>' for (r, g, b, a) in rows
    )
    color_table_xml = f"    <ColorTable>\n{entries}\n    </ColorTable>\n"

    if "<ColorInterp>" in content:
        content = content.replace("<ColorInterp>Gray</ColorInterp>", "<ColorInterp>Palette</ColorInterp>", 1)
    # Insert the ColorTable right after the (now Palette) ColorInterp line.
    marker = "<ColorInterp>Palette</ColorInterp>\n"
    idx = content.find(marker)
    if idx == -1:
        print("could not find ColorInterp element to anchor ColorTable insertion", file=sys.stderr)
        sys.exit(1)
    insert_at = idx + len(marker)
    content = content[:insert_at] + color_table_xml + content[insert_at:]

    with open(out_vrt, "w") as f:
        f.write(content)

    print(f"wrote {out_vrt}")


if __name__ == "__main__":
    main()
