#!/usr/bin/env python3
"""Appends the "Free 2D Top-Down Pixel Dungeon Asset Pack" (Craftpix) to the garden atlas.

    python3 scripts/pack-dungeon.py <path to the unzipped pack>/Tiled_files

Reads the pack, slices it into sprites, appends them below the existing atlas area (existing coordinates never move)
and appends entries to src/data/atlasMeta.js:  [kind, x, y, w, h, category, frames].
Animated sprites store their frames stacked vertically (frame k is at y + k*h).
Run it once; it refuses to run again when the dungeon sprites are already present.
"""
import re, sys, json, hashlib
import numpy as np
from PIL import Image

src = sys.argv[1] if len(sys.argv) > 1 else '.'
ROOT = __file__.rsplit('/scripts/', 1)[0]
ATLAS, META = f'{ROOT}/src/assets/atlas.png', f'{ROOT}/src/data/atlasMeta.js'
BASE_H = 208            # height of the original atlas area (never changes)

meta_src = open(META).read()
meta = json.loads(re.search(r'export const META = (\[.*\]);', meta_src, re.S).group(1))
if any(len(m) > 5 for m in meta):
    sys.exit('Dungeon sprites are already in the atlas; nothing to do.')

def load(n): return np.array(Image.open(f'{src}/{n}.png').convert('RGBA'))

sprites = []            # dict(kind, cat, frames:[ndarray])
seen = set()

def add(kind, cat, frames):
    key = hashlib.md5(b''.join(f.tobytes() for f in frames)).hexdigest()
    if key in seen: return
    seen.add(key); sprites.append(dict(kind=kind, cat=cat, frames=frames))

def grid(name, cat, tile=16):
    a = load(name)
    for r in range(a.shape[0] // tile):
        for c in range(a.shape[1] // tile):
            t = a[r*tile:(r+1)*tile, c*tile:(c+1)*tile]
            al = t[..., 3]
            if al.max() == 0: continue
            add('g' if al.min() >= 250 else 'p', cat, [t.copy()])

def components(mask, gap):
    """4-connected components of the mask after dilating by `gap` pixels; returns bounding boxes of the original pixels."""
    h, w = mask.shape; d = mask.copy()
    for _ in range(gap):
        n = d.copy(); n[1:] |= d[:-1]; n[:-1] |= d[1:]; n[:, 1:] |= d[:, :-1]; n[:, :-1] |= d[:, 1:]; d = n
    lab = np.zeros((h, w), int); k = 0; boxes = []
    for y in range(h):
        for x in range(w):
            if d[y, x] and not lab[y, x]:
                k += 1; st = [(y, x)]; lab[y, x] = k
                while st:
                    cy, cx = st.pop()
                    for ny, nx in ((cy+1, cx), (cy-1, cx), (cy, cx+1), (cy, cx-1)):
                        if 0 <= ny < h and 0 <= nx < w and d[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = k; st.append((ny, nx))
    for i in range(1, k + 1):
        m = (lab == i) & mask
        if not m.any(): continue
        ys, xs = np.where(m); boxes.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    return sorted(boxes, key=lambda b: (b[1] // 24, b[0]))

def objects(name, cat, gap=1, min_px=6):
    a = load(name)
    for x0, y0, x1, y1 in components(a[..., 3] > 0, gap):
        crop = a[y0:y1, x0:x1].copy()
        if (crop[..., 3] > 0).sum() < min_px: continue
        add('n', cat, [crop])          # kind n = object, anchored bottom-centre

def animated(name, cat, frames, kind, gap=2):
    a = load(name); fh = a.shape[0] // frames
    union = np.zeros((fh, a.shape[1]), bool)
    for f in range(frames): union |= a[f*fh:(f+1)*fh, :, 3] > 0
    for x0, y0, x1, y1 in components(union, gap):
        if kind == 'p':   # snap to the 16 px grid so wall/door pieces line up
            x0, y0, x1, y1 = x0 // 16 * 16, y0 // 16 * 16, -(-x1 // 16) * 16, -(-y1 // 16) * 16
        add(kind, cat, [a[f*fh + y0:f*fh + y1, x0:x1].copy() for f in range(frames)])

grid('walls_floor', 'DUNGEON')
grid('decorative_cracks_floor', 'DUNGEON DECOR')
grid('decorative_cracks_walls', 'DUNGEON DECOR')
objects('Objects', 'DUNGEON PROPS')
animated('doors_lever_chest_animation', 'DUNGEON PROPS', 5, 'p', gap=3)
animated('fire_animation', 'DUNGEON FIRE', 6, 'n')
animated('fire_animation2', 'DUNGEON FIRE', 6, 'n')

# shelf-pack below the original area, 1 px gutters, 512 px wide
W = 512; x = y = 0; row_h = 0; place = []
for s in sorted(range(len(sprites)), key=lambda i: -sprites[i]['frames'][0].shape[0] * len(sprites[i]['frames'])):
    pass
order = sorted(range(len(sprites)), key=lambda i: (-sprites[i]['frames'][0].shape[0] * len(sprites[i]['frames']), i))
pos = {}
for i in order:
    f = sprites[i]['frames']; h, w = f[0].shape[:2]; th = h * len(f)
    if x + w > W: x, y, row_h = 0, y + row_h + 1, 0
    pos[i] = (x, y); x += w + 1; row_h = max(row_h, th)
H = BASE_H + 1 + y + row_h
atlas = Image.open(ATLAS).convert('RGBA'); assert atlas.size == (W, BASE_H)
out = Image.new('RGBA', (W, H), (0, 0, 0, 0)); out.paste(atlas, (0, 0))
entries = []
for i in range(len(sprites)):
    s = sprites[i]; px, py = pos[i]; fr = s['frames']; h, w = fr[0].shape[:2]
    for k, f in enumerate(fr): out.paste(Image.fromarray(f), (px, BASE_H + 1 + py + k * h))
    entries.append([s['kind'], px, BASE_H + 1 + py, w, h, s['cat']] + ([len(fr)] if len(fr) > 1 else []))
out.save(ATLAS, optimize=True)
meta += entries
body = ','.join(json.dumps(m, separators=(',', ':')) for m in meta)
head = meta_src.split('export const META')[0].replace('[kind, x, y, w, h]', '[kind, x, y, w, h, category?, frames?]')
open(META, 'w').write(head + f'export const META = [{body}];\n' + meta_src.split('];', 1)[1].lstrip('\n'))
cnt = {}
for e in entries: cnt[e[5]] = cnt.get(e[5], 0) + 1
print(f'atlas {W}x{H}; added {len(entries)} sprites', cnt, '| animated:', sum(1 for e in entries if len(e) > 6))
