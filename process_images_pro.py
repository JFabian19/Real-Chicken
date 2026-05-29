import os
import glob
import io
from rembg import remove
from PIL import Image, ImageEnhance, ImageFilter

def add_drop_shadow(image, offset=(0, 15), shadow_blur=25, shadow_color=(0, 0, 0, 60)):
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

def process():
    public_dir = r"c:\Users\jfabi\Desktop\Tyma DEMOS\La isla del lobo\public"
    
    # Get all image types
    extensions = ("*.jpeg", "*.jpg", "*.png", "*.webp")
    images = []
    for ext in extensions:
        images.extend(glob.glob(os.path.join(public_dir, ext)))
        
    bg_color = (255, 255, 255, 255) # Pure white e-commerce
    
    for img_path in images:
        filename = os.path.basename(img_path)
        print(f"Processing {filename}...")
        try:
            with open(img_path, 'rb') as i:
                input_data = i.read()
                
            # Remove background using rembg (AI)
            output_data = remove(input_data)
            img = Image.open(io.BytesIO(output_data)).convert("RGBA")
            
            # Enhance visual presentation (Estudio profesional)
            img = ImageEnhance.Sharpness(img).enhance(1.3) # Enfoque nítido
            img = ImageEnhance.Color(img).enhance(1.15)     # Colores más vivos
            img = ImageEnhance.Brightness(img).enhance(1.05) # Luz pareja
            img = ImageEnhance.Contrast(img).enhance(1.05)
            
            # Add subtle drop shadow (Sombras sutiles, perspectiva)
            img_with_shadow = add_drop_shadow(img, offset=(0, 20), shadow_blur=25, shadow_color=(0, 0, 0, 50))
            
            # Create 1:1 canvas (Resolución 1:1, composición limpia)
            size = max(img.size)
            # Add padding (e.g. 15%)
            canvas_size = int(size * 1.15)
            canvas = Image.new('RGBA', (canvas_size, canvas_size), bg_color)
            
            # Center the image
            offset_x = (canvas_size - img.size[0]) // 2
            offset_y = (canvas_size - img.size[1]) // 2
            
            # Paste image with shadow onto the white canvas
            canvas.paste(img_with_shadow, (offset_x, offset_y), img_with_shadow)
            
            # Save safely over the original image
            ext = os.path.splitext(img_path)[1].lower()
            save_format = "JPEG"
            if ext == ".png": save_format = "PNG"
            elif ext == ".webp": save_format = "WEBP"
            
            if save_format == "JPEG" or save_format == "JPG":
                canvas.convert("RGB").save(img_path, "JPEG", quality=95)
            else:
                canvas.save(img_path, save_format)
                
            print(f"Successfully processed {filename}")
        except Exception as e:
            print(f"Failed {filename}: {e}")

if __name__ == "__main__":
    process()
