# Flowdle 🎤

El wordle del freestyle. Cada día hay un MC nuevo (FMS, Red Bull Batalla...) y tienes 8 intentos para sacarlo.

Cada intento te dice si te acercas en:

- **País** (verde si es el mismo, amarillo si es de la misma zona)
- **Ligas FMS** en las que ha competido
- **Títulos FMS** de liga nacional
- **FMS Internacional / World Series**
- **Red Bull Internacional** (campeón, finalista o nada)

Están todos los MCs que han pasado por FMS España, Argentina, México, Chile, Perú, Colombia y Caribe, más algunos históricos de Red Bull. También hay modo libre para jugar todas las veces que quieras.

## Jugar en local

No hace falta instalar nada, abre `index.html` en el navegador. Si lo prefieres con servidor:

```
python3 -m http.server
```

## Añadir MCs

Todo está en `data.js`. Las ligas de cada MC salen de las plantillas de cada temporada (`ROSTERS`), y los títulos y demás van en `INFO`. Si falta alguien o hay algún dato mal, abre un issue o un PR.

Datos actualizados a noviembre de 2026.
