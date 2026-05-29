import os
import glob
import io
from rembg import remove
from PIL import Image

def process():
    public_dir = r"c:\Users\jfabi\Desktop\Tyma DEMOS\aymar\public"
    images = glob.glob(os.path.join(public_dir, "*.jpeg"))
    
    bg_color = (226, 247, 249, 255) # Soft pastel cyan matching page colors
    
    for img_path in images:
        if "WhatsApp" in img_path: continue
        if "hero" in img_path.lower(): continue
        filename = os.path.basename(img_path)
        print(f"Processing {filename}...")
        try:
            with open(img_path, 'rb') as i:
                input_data = i.read()
                
            # Remove background using rembg
            output_data = remove(input_data)
            img = Image.open(io.BytesIO(output_data)).convert("RGBA")
            
            # create background
            bg = Image.new('RGBA', img.size, bg_color)
            bg.paste(img, (0, 0), img)
            
            # Save safely
            bg.convert("RGB").save(img_path, "JPEG")
            print(f"Successfully processed {filename}")
        except Exception as e:
            print(f"Failed {filename}: {e}")

if __name__ == "__main__":
    process()
