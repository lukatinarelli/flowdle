<p align="center">
  <img src="favicon.svg" width="64" alt="" />
</p>

<h1 align="center">Flowdle</h1>

<p align="center">
  El wordle del freestyle. Adivina el MC del día.<br />
  <a href="https://lukatinarelli.github.io/flowdle/"><b>lukatinarelli.github.io/flowdle</b></a>
</p>

---

## Cómo se juega

Tienes **8 intentos** para dar con el MC. Cada intento te enseña en qué se parece al que buscas:

| Columna | Verde | Amarillo | Rojo |
| --- | --- | --- | --- |
| **País** | El mismo | Misma zona (Cono Sur, Andes, Caribe, Centro y Norteamérica) | Nada que ver |
| **Ligas FMS** | Exactamente las mismas | Coincide alguna | Ninguna en común |
| **Títulos FMS** | Mismo número | Te quedas a uno | Lejos |
| **FMS Int. / WS** | Mismo número | Te quedas a uno | Lejos |
| **Red Bull Int.** | Mismo resultado (campeón, finalista o nada) | | Distinto |

En las columnas de números, ▲ y ▼ te dicen si el MC tiene más o menos. A los 3 intentos puedes ver la inicial y a los 6 cuántas letras tiene.

### Modos

- **Diario**: un MC al día, el mismo para todo el mundo. Cambia a medianoche y guarda tus rachas.
- **Libre**: partidas sin límite.
- **Caras**: 6 intentos para reconocer al MC por su foto, que empieza muy borrosa y se va aclarando con cada fallo. Sale en cuanto hay al menos 5 fotos.

Al terminar puedes compartir el resultado:

```
Flowdle #3 4/8
🟥🟨🟥🟩🟥
🟩🟨🟥🟩🟩
🟩🟩🟨🟩🟩
🟩🟩🟩🟩🟩
```

## Qué MCs hay

Todos los que han competido en **FMS España, Argentina, México, Chile, Perú, Colombia y Caribe**, desde la primera temporada hasta la actual, y algunos históricos de **Red Bull Batalla** que nunca pisaron FMS (Rayden, Noult, Frescolate, Link One...). Ahora mismo son 182.

Los datos salen de [freestylestats.com](https://freestylestats.com), Wikipedia y prensa (Mundo Freestyle, Infobae, Red Bull). Si ves algo mal, abre un issue.

## Jugar en local

No hay que instalar nada: abre `index.html` en el navegador. O con un servidor:

```sh
python3 -m http.server
# http://localhost:8000
```

## Estructura

```
index.html        página
styles.css        estilos
app.js            lógica del juego
data.js           MCs: plantillas por temporada (ROSTERS) y datos extra (INFO)
photos.js         lista de MCs con foto (la genera tools/fotos.py)
img/mcs/          fotos ya procesadas
tools/check.js    revisa los datos (se ejecuta antes de cada despliegue)
tools/fotos.py    prepara las fotos
```

## Añadir una temporada

1. En `data.js`, añade la plantilla a `ROSTERS` en su liga:
   ```js
   "2027/28": ["Chuty", "Gazir", "..."],
   ```
2. Si gana alguien, súmale el título en `INFO` (`fms`, `intl` o `rb`).
3. Si hay un MC nuevo que no es del país de la liga, ponle el país en `INFO` (`c: "ar"`).
4. `node tools/check.js` para comprobar que todo cuadra.

Las ligas de cada MC se calculan solas a partir de las plantillas.

## Añadir fotos

1. Mete las fotos en `fotos/` con el nombre del MC tal y como sale en el juego: `Chuty.jpg`, `El Menor.png`, `Valles-T.webp`...
2. Ejecuta `python3 tools/fotos.py` (necesita Pillow: `pip install pillow`).
3. Sube `img/mcs/` y `photos.js`.

El script recorta cada foto en cuadrado, la deja a 256×256 en webp y avisa si algún archivo no coincide con ningún MC. La carpeta `fotos/` no se sube.

## Publicación

Cada push a `main` lanza la Action [`deploy.yml`](.github/workflows/deploy.yml), que revisa los datos, pone la versión del commit en las URLs de los `.js` y `.css` (para que nadie se quede con la versión vieja en caché) y publica en GitHub Pages.

---

<sub>Proyecto fan, sin relación con FMS, Urban Roosters ni Red Bull.</sub>
