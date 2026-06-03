import os
import io
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
from rembg import remove

def add_drop_shadow(image, offset=(0, 15), shadow_blur=25, shadow_color=(0, 0, 0, 45)):
    shadow = Image.new('RGBA', image.size, (0, 0, 0, 0))
    shadow.paste(shadow_color, [0, 0, image.size[0], image.size[1]], mask=image)
    shadow_offset = Image.new('RGBA', image.size, (0, 0, 0, 0))
    shadow_offset.paste(shadow, offset)
    shadow_offset = shadow_offset.filter(ImageFilter.GaussianBlur(shadow_blur))
    result = Image.alpha_composite(shadow_offset, image)
    return result

brain_dir = r"C:\Users\jfabi\.gemini\antigravity\brain\4d180159-d1d3-47b4-844a-53056eba7b37"
scratch_dir = os.path.join(brain_dir, "scratch")

# We'll test on Chuleta
chuleta_src = os.path.join(brain_dir, "media__1780329763897.jpg")
img = Image.open(chuleta_src).convert("RGBA")

# Draw tighter white rectangles to hide only the texts/logos
draw = ImageDraw.Draw(img)
# 1. Title + Slogan (top left)
draw.rectangle([45, 30, 680, 230], fill=(255, 255, 255, 255))
# 2. Logo (top right)
draw.rectangle([730, 15, 960, 230], fill=(255, 255, 255, 255))
# 3. Price (bottom right)
draw.rectangle([670, 770, 1024, 1024], fill=(255, 255, 255, 255))

# Save the premasked image
premasked_path = os.path.join(scratch_dir, "premasked_tighter_chuleta.png")
img.save(premasked_path)

# Run rembg
with open(premasked_path, 'rb') as f:
    input_data = f.read()

print("Running rembg on tighter mask...")
output_data = remove(input_data)
cutout = Image.open(io.BytesIO(output_data)).convert("RGBA")

# Trim transparency
bbox = cutout.getbbox()
if bbox:
    cutout = cutout.crop(bbox)

# Enhance
cutout = ImageEnhance.Sharpness(cutout).enhance(1.3)
cutout = ImageEnhance.Color(cutout).enhance(1.15)
cutout = ImageEnhance.Brightness(cutout).enhance(1.05)
cutout = ImageEnhance.Contrast(cutout).enhance(1.05)

# Shadow
img_with_shadow = add_drop_shadow(cutout, offset=(0, 20), shadow_blur=25, shadow_color=(0, 0, 0, 50))

# Centering on square canvas
size = max(img_with_shadow.size)
canvas_size = int(size * 1.15)
canvas = Image.new('RGBA', (canvas_size, canvas_size), (255, 255, 255, 255))
offset_x = (canvas_size - img_with_shadow.size[0]) // 2
offset_y = (canvas_size - img_with_shadow.size[1]) // 2
canvas.paste(img_with_shadow, (offset_x, offset_y), img_with_shadow)

final_path = os.path.join(scratch_dir, "tighter_chuleta.png")
canvas.save(final_path)
print(f"Saved tighter masked image to {final_path}")
