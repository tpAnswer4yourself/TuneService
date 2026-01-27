from PIL import Image

async def resize_cover(image_path: str, max_size = (800, 800)):
    try:
        with Image.open(image_path) as Img:
            Img.thumbnail(max_size, Image.Resampling.LANCZOS)
            print("Resize cover")
            Img.save(image_path)
    except Exception as e:
        print(f"Error: ", e)