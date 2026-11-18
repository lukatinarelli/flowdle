# Flowdle

Wordle de freestylers (FMS + Red Bull Batalla). Web estática sin build ni dependencias: HTML, CSS y JS a pelo. Todo el texto de la web y los comentarios del código van en español.

## Archivos

- `data.js`: fuente de verdad de los MCs.
  - `ROSTERS[liga][temporada]` = lista de participantes. Las ligas de cada MC (`mc.ligas`) se calculan de aquí.
  - `INFO[nombre]` = datos que no salen de las plantillas: `c` (país), `fms`, `intl`, `rb`, `final`, `alias`.
  - El país por defecto es el de la primera liga en la que compitió (por año). Si no es su país real, hay que poner `c` en INFO.
  - MCs que no están en ninguna plantilla (leyendas de Red Bull, Acru, Piezas...) van solo en INFO y necesitan `c`.
- `app.js`: un IIFE, sin módulos (tiene que funcionar abriendo el HTML con file://). Modos: `daily`, `free`, `faces`.
- `photos.js`: generado por `tools/fotos.py`, no se edita a mano.
- `index.html`: los js/css se cargan con `?v=dev`; la Action lo sustituye por el SHA del commit para romper la caché de Pages (max-age=600). No quitarlo.

## Comandos

```sh
node tools/check.js        # valida data.js y photos.js (lo ejecuta también la Action)
python3 tools/fotos.py     # procesa fotos/ -> img/mcs/*.webp + photos.js
python3 -m http.server     # servir en local
```

## Reglas del juego (no romperlas sin querer)

- El MC del día depende de `MCS.length` y del orden de `MCS` (barajado con semilla en `mcOfDay`). Añadir o reordenar MCs cambia el MC de los días siguientes; es aceptable, pero si se toca el día en curso los jugadores pierden la partida guardada.
- El slug de las fotos (`slug()` en app.js) tiene que coincidir con el de `tools/fotos.py` y `tools/check.js`.
- Títulos: `fms` = ligas nacionales, `intl` = FMS Internacional + World Series, `rb` = Final Internacional de Red Bull. Gazir y Chuty son co-campeones de Red Bull 2024; la final de 2025 ("Nueva Historia") cuenta para Fat N.

## Datos

- Plantillas por temporada: freestylestats.com (`/competition/fms-<liga>/<temporada>`), que las páginas indican con banderas para los que no son del país de la liga.
- Perú y Caribe 2025/26 fueron torneos clasificatorios, no liga: no tienen plantilla.
- FMS Brasil no se incluye a propósito.

## Diseño

Fondo oscuro sobrio con toques de neón (rosa `--pink`, cian `--cyan`, amarillo `--yellow-accent`), fuente Bungee para títulos y números, fuente del sistema para el resto. Sin emojis en la interfaz (solo en el texto de compartir). Al usuario no le gusta el aspecto "hecho por IA": nada de degradados por todas partes ni frases de relleno.

## Git

- Remoto por SSH con el alias `github-pers` (ver ~/.ssh/config).
- Commits descriptivos con prefijo (`feat:`, `fix:`, `data:`, `style:`, `docs:`, `ci:`) y el trailer:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- Push a `main` publica automáticamente.
