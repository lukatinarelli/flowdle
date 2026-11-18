# Flowdle 🎤

El wordle del freestyle. Cada día hay un MC nuevo (FMS, Red Bull Batalla...) y tienes 8 intentos para sacarlo.

Cada intento te dice si te acercas en:

- **País** (verde si es el mismo, amarillo si es de la misma zona)
- **Ligas FMS** en las que ha competido
- **Títulos FMS** de liga nacional
- **FMS Internacional / World Series**
- **Red Bull Internacional** (campeón, finalista o nada)

Están todos los MCs que han pasado por FMS España, Argentina, México, Chile, Perú, Colombia y Caribe, más algunos históricos de Red Bull.

Modos:

- **Diario**: un MC al día, el mismo para todos.
- **Libre**: partidas infinitas.
- **Caras**: adivina el MC por su foto, que empieza muy borrosa y se aclara con cada fallo (aparece cuando hay al menos 5 fotos).

## Jugar en local

No hace falta instalar nada, abre `index.html` en el navegador. Si lo prefieres con servidor:

```
python3 -m http.server
```

## Fotos

1. Mete las fotos originales en `fotos/` con el nombre del MC tal y como sale en el juego: `Chuty.jpg`, `El Menor.png`, `Valles-T.webp`...
2. Ejecuta `python3 tools/fotos.py` (necesita Pillow: `pip install pillow`).

El script las recorta en cuadrado, las deja a 256x256 en `img/mcs/` y actualiza `photos.js`. Si un archivo no coincide con ningún MC, te avisa. La carpeta `fotos/` no se sube al repo.

Los MCs sin foto siguen funcionando igual, simplemente no se les ve la cara.

## Añadir MCs

Todo está en `data.js`. Las ligas de cada MC salen de las plantillas de cada temporada (`ROSTERS`), y los títulos y demás van en `INFO`. Si falta alguien o hay algún dato mal, abre un issue o un PR.

Datos actualizados a noviembre de 2026.
