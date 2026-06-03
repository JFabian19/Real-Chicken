import os
import io
from PIL import Image, ImageDraw
from rembg import remove

brain_dir = r"C:\Users\jfabi\.gemini\antigravity\brain\4d180159-d1d3-47b4-844a-53056eba7b37"
scratch_dir = os.path.join(brain_dir, "scratch")
os.makedirs(scratch_dir, exist_ok=True)

img_path = os.path.join(brain_dir, "media__1780329763897.jpg") # Chuleta

# 1. Open original image
img = Image.open(img_path).convert("RGBA")
width, height = img.size

# 2. Pre-mask regions containing text and logos by drawing white boxes
draw = ImageDraw.Draw(img)
# Top left: Title & Slogan
draw.rectangle([0, 0, 700, 245], fill=(255, 255, 255, 255))
# Top right: Real Chicken Logo
draw.rectangle([700, 0, 1024, 240], fill=(255, 255, 255, 255))
# Bottom right: Price circle
draw.rectangle([660, 750, 1024, 1024], fill=(255, 255, 255, 255))

# Save the premasked image for inspection
premasked_path = os.path.join(scratch_dir, "premasked_chuleta.png")
img.save(premasked_path)
print(f"Saved premasked image to {premasked_path}")

# 3. Remove background using rembg
with open(premasked_path, 'rb') as f:
    input_data = f.read()

print("Running rembg.remove()...")
output_data = remove(input_data)

# Save the transparency result
cutout_path = os.path.join(scratch_dir, "cutout_chuleta.png")
with open(cutout_path, 'wb') as f:
    f.write(output_data)

print(f"Saved cutout image to {cutout_path}")
