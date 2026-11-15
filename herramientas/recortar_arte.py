"""Convierte el arte crudo generado (fondo negro) en PNG con transparencia, recortado y reducido para el juego.

Uso:  python -I herramientas/recortar_arte.py
Entrada: arte/crudo/<nombre>.png   Salida: arte/<prefijo><nombre>.png
El fondo se detecta como la zona casi negra conectada con los bordes; los contornos oscuros internos se conservan.
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CRUDO = os.path.join(RAIZ, "arte", "crudo")
SALIDA = os.path.join(RAIZ, "arte")

# nombre -> (archivo de salida, lado máximo en px)
ISLAS = {n: (f"isla_{n}.png", 120) for n in ("ciencia", "tec", "ing", "mate", "int")}
PERSONAJES = {"heroe": ("heroe.png", 96), "villano": ("villano.png", 96), "niebla": ("niebla.png", 64), "barra": ("barra.png", 64), "mentor_curie": ("mentor_curie.png", 112), "mentor_johnson": ("mentor_johnson.png", 112), "mentor_camarena": ("mentor_camarena.png", 112), "mentor_jemison": ("mentor_jemison.png", 112)}


def quitar_fondo(img, umbral=34):
    rgb = np.asarray(img.convert("RGB")).astype(np.int16)
    oscuro = rgb.max(axis=2) < umbral
    etiquetas, _ = ndimage.label(oscuro)
    borde = set(np.unique(np.concatenate([etiquetas[0], etiquetas[-1], etiquetas[:, 0], etiquetas[:, -1]]))) - {0}
    fondo = np.isin(etiquetas, list(borde))
    fondo = ndimage.binary_dilation(fondo, iterations=1)  # quita el halo negro del borde
    alfa = np.where(fondo, 0, 255).astype(np.uint8)
    out = np.dstack([rgb.astype(np.uint8), alfa])
    return Image.fromarray(out, "RGBA")


def procesar(nombre, destino, lado):
    ruta = os.path.join(CRUDO, nombre + ".png")
    if not os.path.exists(ruta):
        print("falta", ruta)
        return
    im = quitar_fondo(Image.open(ruta))
    caja = im.getchannel("A").getbbox()
    im = im.crop(caja)
    k = lado / max(im.size)
    nuevo = (max(1, round(im.width * k)), max(1, round(im.height * k)))
    im = im.convert("RGBa").resize(nuevo, Image.LANCZOS).convert("RGBA")  # sin halo oscuro al reducir
    im.save(os.path.join(SALIDA, destino), optimize=True)
    print("ok", destino, nuevo)


if __name__ == "__main__":
    for n, (d, l) in {**ISLAS, **PERSONAJES}.items():
        procesar(n, d, l)
    # Fondos de las arenas (360x540, JPEG ligero)
    for n in ("ciencia", "tec", "ing", "mate", "int"):
        p = os.path.join(CRUDO, f"fondo_{n}.png")
        if os.path.exists(p):
            im = Image.open(p).convert("RGB").resize((360, 540), Image.LANCZOS)
            im.save(os.path.join(SALIDA, f"fondo_{n}.jpg"), quality=82, optimize=True)
            print("ok", f"fondo_{n}.jpg")
    # La portada no lleva transparencia: solo se reduce y se guarda como JPEG ligero.
    p = os.path.join(CRUDO, "portada.png")
    if os.path.exists(p):
        im = Image.open(p).convert("RGB")
        im = im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS)
        im.save(os.path.join(SALIDA, "portada.jpg"), quality=85, optimize=True)
        print("ok portada.jpg", im.size)
