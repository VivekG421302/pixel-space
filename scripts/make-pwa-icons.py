#!/usr/bin/env python3
"""Draws the app icons (public/icons/*.png) from the pixel-art favicon (public/favicon.svg, a 16 x 16 grid)."""
from PIL import Image, ImageDraw
ROOT = __file__.rsplit('/scripts/', 1)[0]
GREEN, INK, WHITE, RED = '#78c850', '#383838', '#f8f8f8', '#e84860'

def draw(size, rounded, scale):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(img); u = size / 16
    if rounded: d.rounded_rectangle([0, 0, size - 1, size - 1], radius=3 * u, fill=GREEN)
    else: d.rectangle([0, 0, size, size], fill=GREEN)
    # the face lives in a 16-unit box; `scale` shrinks it towards the centre (keeps maskable icons inside the safe zone)
    m = lambda v: (8 + (v - 8) * scale) * u
    r = lambda x0, y0, x1, y1, c: d.rectangle([round(m(x0)), round(m(y0)), round(m(x1)) - 1, round(m(y1)) - 1], fill=c)
    r(2.5, 2.5, 13.5, 13.5, INK); r(3.5, 3.5, 12.5, 12.5, WHITE)
    r(5, 5, 7, 7, INK); r(9, 5, 11, 7, INK); r(5, 9, 11, 11, RED)
    return img

for name, size, rounded, scale in [('icon-192', 192, True, 1), ('icon-512', 512, True, 1),
                                   ('maskable-512', 512, False, .74), ('apple-touch-icon', 180, False, .86)]:
    draw(size, rounded, scale).save(f'{ROOT}/public/icons/{name}.png', optimize=True)
print('icons written')
