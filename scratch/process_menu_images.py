import os
import glob
import io
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
from rembg import remove

def add_drop_shadow(image, offset=(0, 15), shadow_blur=25, shadow_color=(0, 0, 0, 45)):
    # Create a blank image for the shadow
    shadow = Image.new('RGBA', image.size, (0, 0, 0, 0))
    # Paste the alpha channel of the original image
    shadow.paste(shadow_color, [0, 0, image.size[0], image.size[1]], mask=image)
    
    # Offset the shadow
    shadow_offset = Image.new('RGBA', image.size, (0, 0, 0, 0))
    shadow_offset.paste(shadow, offset)
    
    # Blur the shadow
    shadow_offset = shadow_offset.filter(ImageFilter.GaussianBlur(shadow_blur))
    
    # Composite
    result = Image.alpha_composite(shadow_offset, image)
    return result

def process_image(src_path, dest_name, title_mask, logo_mask, price_mask):
    public_dir = r"c:\Users\jfabi\Desktop\Tyma DEMOS\Real Chicken\public"
    dest_path = os.path.join(public_dir, dest_name)
    
    print(f"Loading {src_path}...")
    img = Image.open(src_path).convert("RGBA")
    
    # Apply masking over text/overlays by drawing white rectangles
    draw = ImageDraw.Draw(img)
    if title_mask:
        draw.rectangle(title_mask, fill=(255, 255, 255, 255))
    if logo_mask:
        draw.rectangle(logo_mask, fill=(255, 255, 255, 255))
    if price_mask:
        draw.rectangle(price_mask, fill=(255, 255, 255, 255))
        
    # Convert to bytes for rembg
    byte_arr = io.BytesIO()
    img.save(byte_arr, format='PNG')
    input_data = byte_arr.getvalue()
    
    print(f"Running rembg background removal for {dest_name}...")
    output_data = remove(input_data)
    cutout = Image.open(io.BytesIO(output_data)).convert("RGBA")
    
    # Trim transparency (auto-crop)
    bbox = cutout.getbbox()
    if bbox:
        cutout = cutout.crop(bbox)
        
    print(f"Enhancing visual details for {dest_name}...")
    # Enhance visual presentation
    cutout = ImageEnhance.Sharpness(cutout).enhance(1.3) # Enfoque nítido
    cutout = ImageEnhance.Color(cutout).enhance(1.15)     # Colores más vivos
    cutout = ImageEnhance.Brightness(cutout).enhance(1.05) # Luz pareja
    cutout = ImageEnhance.Contrast(cutout).enhance(1.05)
    
    # Add premium drop shadow
    print(f"Adding drop shadow to {dest_name}...")
    img_with_shadow = add_drop_shadow(cutout, offset=(0, 20), shadow_blur=25, shadow_color=(0, 0, 0, 50))
    
    # Create square canvas with white background
    size = max(img_with_shadow.size)
    canvas_size = int(size * 1.15)
    canvas = Image.new('RGBA', (canvas_size, canvas_size), (255, 255, 255, 255))
    
    # Center the image
    offset_x = (canvas_size - img_with_shadow.size[0]) // 2
    offset_y = (canvas_size - img_with_shadow.size[1]) // 2
    canvas.paste(img_with_shadow, (offset_x, offset_y), img_with_shadow)
    
    # Save as PNG
    print(f"Saving final image to {dest_path}...")
    canvas.save(dest_path, "PNG")
    print(f"Successfully processed and saved {dest_name}!\n")

def run():
    brain_dir = r"C:\Users\jfabi\.gemini\antigravity\brain\4d180159-d1d3-47b4-844a-53056eba7b37"
    
    # Image 1 is Chuleta
    chuleta_src = os.path.join(brain_dir, "media__1780329763897.jpg")
    # Image 2 is Churrasco
    churrasco_src = os.path.join(brain_dir, "media__1780329768884.jpg")
    
    # Coordinates of masks based on standard 1024x1024 layout
    title_mask = [0, 0, 700, 245]
    logo_mask = [700, 0, 1024, 240]
    price_mask = [660, 750, 1024, 1024]
    
    if os.path.exists(chuleta_src):
        process_image(chuleta_src, "chuleta.png", title_mask, logo_mask, price_mask)
    else:
        print(f"Error: Chuleta source not found at {chuleta_src}")
        
    if os.path.exists(churrasco_src):
        process_image(churrasco_src, "churrasco.png", title_mask, logo_mask, price_mask)
    else:
        print(f"Error: Churrasco source not found at {churrasco_src}")

if __name__ == "__main__":
    run()
