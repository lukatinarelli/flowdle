#!/usr/bin/env python3
"""Prepara las fotos de los MCs para la web.

Mete las fotos originales en fotos/ con el nombre del MC tal y como sale en el
juego (Chuty.jpg, El Menor.png, Valles-T.webp...) y ejecuta:

    python3 tools/fotos.py

Cada foto se recorta en cuadrado, se reduce a 256x256 y se guarda como
img/mcs/<slug>.webp. Al final se regenera photos.js con la lista de fotos.
"""

import re
import sys
import unicodedata
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "img" / "mcs"
SIZE = 256
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"}


def slug(name: str) -> str:
    """Igual que slug() en app.js: sin tildes, en minúsculas y con guiones."""
    s = unicodedata.normalize("NFD", name)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def known_slugs() -> set[str]:
    """Saca los nombres de data.js para avisar si una foto no cuadra con ningún MC."""
    text = (ROOT / "data.js").read_text(encoding="utf-8")
    return {slug(name) for name in re.findall(r'"([^"]+)"', text)}


def square(img: Image.Image) -> Image.Image:
    w, h = img.size
    if w == h:
        return img
    if h > w:
        # en los retratos la cara suele estar arriba, así que no recortamos por el centro
        top = int((h - w) * 0.25)
        return img.crop((0, top, w, top + w))
    left = (w - h) // 2
    return img.crop((left, 0, left + h, h))


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "fotos"
    if not src.is_dir():
        sys.exit(f"No existe la carpeta {src}")

    OUT.mkdir(parents=True, exist_ok=True)
    valid = known_slugs()
    done, unknown = 0, []

    for path in sorted(src.iterdir()):
        if path.suffix.lower() not in EXTENSIONS:
            continue
        name = slug(path.stem)
        if name not in valid:
            unknown.append(path.name)
            continue
        with Image.open(path) as img:
            img = ImageOps.exif_transpose(img).convert("RGB")
            img = square(img).resize((SIZE, SIZE), Image.LANCZOS)
            img.save(OUT / f"{name}.webp", "WEBP", quality=80, method=6)
        done += 1

    photos = sorted(p.stem for p in OUT.glob("*.webp"))
    (ROOT / "photos.js").write_text(
        "// Generado por tools/fotos.py, no editar a mano\n"
        f"const PHOTOS = {photos!r};\n".replace("'", '"'),
        encoding="utf-8",
    )

    print(f"{done} fotos procesadas, {len(photos)} en total")
    if unknown:
        print("No coinciden con ningún MC (revisa el nombre del archivo):")
        for name in unknown:
            print("  -", name)


if __name__ == "__main__":
    main()
