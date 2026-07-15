#!/usr/bin/env python3
"""The plate engraver. Ports the site's WebGL displacement-engraving to 2D:
a near-horizontal line family whose phase is displaced by (pseudo-)relief —
here, blurred luminance — and whose stroke width carries the tone; a finer
cross family joins only in the strongest third; an oval banknote vignette
closes the composition (and swallows arbitrary photo backgrounds).

Each portrait is rendered twice: dark ink for the ivory edition (strokes in
the shadows) and light ink for the night edition (white-line work — strokes
follow the light). Numbers mirror src/lib/bust-scene.ts.

Usage:
  python scripts/engrave.py in.jpg out-light.png out-dark.png \
      [fx fy [zoom]] [document] [p45]
  fx fy    crop focus in source fractions (default 0.5 0.42)
  zoom     tighten the crop around the focus (default 1.0)
  document duotone reproduction for printed matter (no line work)
  p45      4:5 plate (the author's About column) instead of 4:3
"""

import re
import sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps

W, H = 1152, 864  # the plate box is 4:3 (overridden by the p45 flag)
SPACING = 7.2
SLOPE = 0.055
DISP = 26.0  # px of line displacement across the full relief range
CROSS_SPACING = 6.0
CROSS_DISP = -18.0
AA = 0.75

INK_LIGHT_THEME = (25, 21, 16)  # --text on ivory
INK_DARK_THEME = (240, 233, 218)  # --text on the night edition


def smoothstep(lo, hi, x):
    t = np.clip((x - lo) / (hi - lo), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def prepare(path, focus=None, zoom=1.0):
    img = Image.open(path).convert("L")
    img = ImageOps.exif_transpose(img)
    img = ImageOps.autocontrast(img, cutoff=1)
    # center-crop to 4:3, biased slightly toward the top (faces sit high)
    w, h = img.size
    if zoom > 1.0:
        cw, ch = int(w / zoom), int(h / zoom)
        fx0, fy0 = focus or (0.5, 0.42)
        x0 = min(max(int(w * fx0 - cw / 2), 0), w - cw)
        y0 = min(max(int(h * fy0 - ch / 2), 0), h - ch)
        img = img.crop((x0, y0, x0 + cw, y0 + ch))
        w, h = img.size
    target = W / H
    fx, fy = focus or (0.5, 0.42)
    if w / h > target:
        nw = int(h * target)
        x0 = min(max(int(w * fx - nw / 2), 0), w - nw)
        img = img.crop((x0, 0, x0 + nw, h))
    else:
        nh = int(w / target)
        y0 = min(max(int(h * fy - nh / 2), 0), h - nh)
        img = img.crop((0, y0, w, y0 + nh))
    img = img.resize((W, H), Image.LANCZOS)
    tone = np.asarray(img, dtype=np.float32) / 255.0
    relief = np.asarray(
        img.filter(ImageFilter.GaussianBlur(9)), dtype=np.float32
    ) / 255.0
    return tone, relief


def vignette():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    nx = (xx / W - 0.5) / 0.46
    ny = (yy / H - 0.47) / 0.475
    r = np.sqrt(nx * nx + ny * ny)
    return 1.0 - smoothstep(0.86, 1.02, r)


def line_family(coord, spacing, width):
    d = np.abs(np.mod(coord / spacing, 1.0) - 0.5) * spacing
    return np.clip((width * 0.5 + AA - d) / (2 * AA), 0.0, 1.0)


def reproduce_document(tone):
    """For printed matter (title pages, documents): a clean duotone
    reproduction — ink where the page has ink — with a soft rectangular
    fade. Line-displacement over text would just shred the letterforms."""
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    ex = np.minimum(xx / W, 1 - xx / W)
    ey = np.minimum(yy / H, 1 - yy / H)
    frame = smoothstep(0.012, 0.05, np.minimum(ex, ey))
    ink = smoothstep(0.72, 0.45, tone) * frame
    return np.clip(ink, 0.0, 1.0)


def engrave(tone, relief, light_ink):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    key = tone if light_ink else 1.0 - tone
    lo, hi = (0.52, 0.97) if light_ink else (0.3, 0.9)
    k = smoothstep(lo, hi, key) * vignette()

    disp = (0.5 - relief) * DISP
    coord = yy + xx * SLOPE + disp
    # gate: a zero-width stroke must paint nothing (the AA window otherwise
    # leaves a ghost hairline across the whole frame)
    gate = smoothstep(0.02, 0.07, k)
    ink = line_family(coord, SPACING, k * (SPACING - 1.0)) * gate

    c = np.clip((k - 0.66) / 0.34, 0.0, 1.0)
    coord2 = xx - yy * 0.1 + (0.5 - relief) * CROSS_DISP
    ink = np.maximum(ink, line_family(coord2, CROSS_SPACING, c * 3.0) * (c > 0.002))

    ink *= 0.9 + 0.1 * k
    return np.clip(ink, 0.0, 1.0)


def save(ink, rgb, path):
    a = (ink * 255).astype(np.uint8)
    out = np.zeros((H, W, 4), dtype=np.uint8)
    out[..., 0], out[..., 1], out[..., 2] = rgb
    out[..., 3] = a
    im = Image.fromarray(out, "RGBA")
    im.quantize(colors=64, method=Image.FASTOCTREE).save(path, optimize=True)


def main(src, out_light, out_dark, focus=None, mode="portrait", zoom=1.0):
    tone, relief = prepare(src, focus, zoom)
    if mode == "document":
        ink = reproduce_document(tone)
        save(ink, INK_LIGHT_THEME, out_light)
        save(ink, INK_DARK_THEME, out_dark)
    else:
        save(engrave(tone, relief, light_ink=False), INK_LIGHT_THEME, out_light)
        save(engrave(tone, relief, light_ink=True), INK_DARK_THEME, out_dark)
    print(f"engraved {src} → {out_light}, {out_dark}")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    focus = None
    mode = "portrait"
    args = [a for a in sys.argv[4:] if a]
    nums = [a for a in args if re.match(r"^[\d.]+$", a)]
    if "document" in args:
        mode = "document"
    zoom = 1.0
    if "p45" in args:
        # portrait plates (the author's) run 4:5 like the About column
        globals()["W"], globals()["H"] = 864, 1080
    if len(nums) >= 2:
        focus = (float(nums[0]), float(nums[1]))
    if len(nums) >= 3:
        zoom = float(nums[2])
    main(sys.argv[1], sys.argv[2], sys.argv[3], focus, mode, zoom)
