#!/usr/bin/env python3
"""
Generate og-image.png (1200x630) for HashmiTools
Rich gradient background + logo text + tagline + tool icons grid
"""
from PIL import Image, ImageDraw, ImageFont
import math, os

W, H = 1200, 630

# ── Gradient background (deep navy → indigo → purple) ──────────────────────
def make_gradient(w, h):
    img = Image.new("RGB", (w, h))
    px = img.load()
    # top-left: #0a0e1a  bottom-right: #3b1f6e
    for y in range(h):
        for x in range(w):
            t = (x / w + y / h) / 2
            r = int(10  + t * (59  - 10))
            g = int(14  + t * (31  - 14))
            b = int(26  + t * (110 - 26))
            px[x, y] = (r, g, b)
    return img

img = make_gradient(W, H)
draw = ImageDraw.Draw(img, "RGBA")

# ── Decorative circles (subtle glow) ───────────────────────────────────────
def circle_glow(draw, cx, cy, r, color):
    for i in range(5, 0, -1):
        alpha = int(30 * i / 5)
        draw.ellipse([cx - r*i//4, cy - r*i//4, cx + r*i//4, cy + r*i//4],
                     fill=color + (alpha,))

circle_glow(draw, 120, 120, 300, (99, 102, 241))   # top-left indigo
circle_glow(draw, 1100, 500, 250, (139, 92, 246))  # bottom-right purple
circle_glow(draw, 620, 600, 200, (6, 182, 212))    # bottom-center cyan

# ── Horizontal divider lines ────────────────────────────────────────────────
for y_off, alpha in [(0, 40), (1, 20)]:
    draw.line([(80, 320+y_off), (1120, 320+y_off)],
              fill=(255, 255, 255, alpha), width=1)

# ── Load fonts ──────────────────────────────────────────────────────────────
try:
    font_big   = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 82)
    font_mid   = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 34)
    font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 26)
    font_tag   = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
except:
    font_big   = ImageFont.load_default(size=72)
    font_mid   = ImageFont.load_default(size=34)
    font_small = ImageFont.load_default(size=26)
    font_tag   = ImageFont.load_default(size=28)

# ── Brand name ──────────────────────────────────────────────────────────────
brand = "HashmiTools"
bb = draw.textbbox((0, 0), brand, font=font_big)
bw = bb[2] - bb[0]
bx = (W - bw) // 2

# Shadow
draw.text((bx+3, 98), brand, font=font_big, fill=(0, 0, 0, 120))
# Gradient text trick — draw twice with slightly different tints
draw.text((bx, 95), brand, font=font_big, fill=(200, 200, 255))

# ── Tagline ──────────────────────────────────────────────────────────────────
tagline = "100+ Free Online Tools · Zakat · EMI · PDF · AI · Developer"
tb = draw.textbbox((0, 0), tagline, font=font_mid)
tw = tb[2] - tb[0]
draw.text(((W - tw) // 2, 200), tagline, font=font_mid, fill=(180, 185, 220))

# ── Tool badges row ─────────────────────────────────────────────────────────
badges = [
    ("🧮 Zakat Calc",  (99, 102, 241)),
    ("📊 EMI Calc",    (6, 182, 212)),
    ("💱 Currency",    (16, 185, 129)),
    ("📄 PDF Merge",   (245, 158, 11)),
    ("🔗 URL Short",   (239, 68, 68)),
    ("📱 QR Code",     (168, 85, 247)),
    ("🤖 AI Hashtag",  (59, 130, 246)),
    ("⚖️ Tax Calc",    (251, 146, 60)),
]

badge_y = 290
badge_h = 52
pad_x, pad_y = 18, 12
gap = 12

# measure total width
widths = []
for text, _ in badges:
    bb2 = draw.textbbox((0, 0), text, font=font_tag)
    widths.append(bb2[2] - bb2[0] + pad_x * 2)

total_w = sum(widths) + gap * (len(badges) - 1)
start_x = (W - total_w) // 2

for i, (text, color) in enumerate(badges):
    bw2 = widths[i]
    x0 = start_x + sum(widths[:i]) + gap * i
    y0 = badge_y
    x1 = x0 + bw2
    y1 = y0 + badge_h
    # badge rounded rect
    draw.rounded_rectangle([x0, y0, x1, y1], radius=10,
                            fill=color + (50,), outline=color + (180,), width=2)
    # text
    bb3 = draw.textbbox((0, 0), text, font=font_tag)
    tx = x0 + (bw2 - (bb3[2] - bb3[0])) // 2
    ty = y0 + (badge_h - (bb3[3] - bb3[1])) // 2
    draw.text((tx, ty), text, font=font_tag, fill=(240, 243, 255))

# ── Second badge row ─────────────────────────────────────────────────────────
badges2 = [
    ("🕌 Prayer Times", (99, 102, 241)),
    ("💊 BMI Calc",     (6, 182, 212)),
    ("🔐 Password",     (16, 185, 129)),
    ("💻 Dev Tools",    (245, 158, 11)),
    ("📰 Blog",         (239, 68, 68)),
    ("🔬 Science",      (168, 85, 247)),
]

badge_y2 = badge_y + badge_h + 12
widths2 = []
for text, _ in badges2:
    bb2 = draw.textbbox((0, 0), text, font=font_tag)
    widths2.append(bb2[2] - bb2[0] + pad_x * 2)

total_w2 = sum(widths2) + gap * (len(badges2) - 1)
start_x2 = (W - total_w2) // 2

for i, (text, color) in enumerate(badges2):
    bw2 = widths2[i]
    x0 = start_x2 + sum(widths2[:i]) + gap * i
    y0 = badge_y2
    x1 = x0 + bw2
    y1 = y0 + badge_h
    draw.rounded_rectangle([x0, y0, x1, y1], radius=10,
                            fill=color + (50,), outline=color + (180,), width=2)
    bb3 = draw.textbbox((0, 0), text, font=font_tag)
    tx = x0 + (bw2 - (bb3[2] - bb3[0])) // 2
    ty = y0 + (badge_h - (bb3[3] - bb3[1])) // 2
    draw.text((tx, ty), text, font=font_tag, fill=(240, 243, 255))

# ── Bottom bar ───────────────────────────────────────────────────────────────
draw.rectangle([(0, H - 80), (W, H)], fill=(0, 0, 0, 100))
url_text = "hashmitools.com"
ub = draw.textbbox((0, 0), url_text, font=font_small)
uw = ub[2] - ub[0]
draw.text(((W - uw) // 2, H - 52), url_text, font=font_small, fill=(130, 160, 255))

# ── Stars / sparkle dots ─────────────────────────────────────────────────────
import random
random.seed(42)
for _ in range(60):
    sx = random.randint(0, W)
    sy = random.randint(0, H - 80)
    sr = random.choice([1, 1, 1, 2])
    sa = random.randint(60, 180)
    draw.ellipse([sx, sy, sx+sr, sy+sr], fill=(255, 255, 255, sa))

# ── Save ─────────────────────────────────────────────────────────────────────
out_path = "/home/user/webapp/og-image.png"
img.save(out_path, "PNG", optimize=True)
print(f"✅ Saved: {out_path}  ({os.path.getsize(out_path):,} bytes)")
print(f"   Size: {img.size}")
