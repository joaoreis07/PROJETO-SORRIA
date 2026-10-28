from pathlib import Path
import sys
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
folders = [root / "assets" / "fotos", root / "assets" / "selecionadas"]
limit = int(sys.argv[1]) if len(sys.argv) > 1 else 15
count = 0
for folder in folders:
    for source in folder.rglob("*.jpg"):
        target = source.with_suffix(".webp")
        if target.exists():
            continue
        with Image.open(source) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            image.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
            image.save(target, "WEBP", quality=78, method=0)
        count += 1
        if count >= limit:
            break
    if count >= limit:
        break

remaining = sum(1 for folder in folders for source in folder.rglob("*.jpg") if not source.with_suffix(".webp").exists())
if remaining == 0:
    manifest = root / "assets" / "fotos" / "manifest.js"
    manifest.write_text(manifest.read_text(encoding="utf-8").replace(".jpg", ".webp"), encoding="utf-8")
    landing = root / "index.html"
    landing.write_text(landing.read_text(encoding="utf-8").replace(".jpg\"", ".webp\"").replace(".jpg'", ".webp'"), encoding="utf-8")
print(f"Converted {count}; {remaining} remain")
