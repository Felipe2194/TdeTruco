# Diseño de TdeTruco: piezas para rediseñar

Imágenes del juego tal como está hoy, separadas por parte. Se regeneran con:

```bash
npm run dev -- --port 5180      # en una terminal
npm run capturas                # en otra (usa Chrome instalado)
```

Cada carpeta indica en qué archivo del código vive esa parte, para saber qué hay que tocar después del rediseño.

| Carpeta | Qué hay | Código |
|---|---|---|
| `01-pantallas/` | Pantallas completas a 1600×900: inicio, lobby (2v2 y 4v4), mesas de 1v1, 2v2, 3v3 y 4v4, pica-pica, segunda baza, compañero haciendo una seña o diciendo "voy", y fin de partido | `src/client/pantallas.ts`, `src/client/mesa.ts` |
| `02-fondo/` | Fondo completo de la pulpería y cada elemento por separado: pared, techo y vigas, ventana a la pampa, guitarra, estantería con botellas y farol. Incluye `fondo.svg` editable | `src/client/arte/escena.ts` (`FONDO_SVG`) |
| `03-mesa/` | Mesa con el ambiente (luz del farol y viñeta), la madera sola, y el mate con la pava (PNG transparente + SVG) | `src/client/estilos.css` (`#mesa`), `escena.ts` (`MATE_SVG`) |
| `04-personajes/` | Los 8 gauchos, cada uno con el pañuelo de los dos equipos (celeste y colorado), en PNG transparente + SVG editable | `src/client/arte/gauchos.ts` (`GAUCHOS`, `gauchoSVG`) |
| `05-senas/` | Una carpeta por gaucho, con la cara neutral y las 9 señas (ancho de espada, ancho de basto, 7 de espada, 7 de oro, tres, dos, ancho falso, envido, nada) | `src/client/estilos.css` (clases `.s-*`) |
| `06-cartas/` | Las 40 cartas a resolución completa (300×462), una carpeta por palo, más el dorso y una hoja con todas | `src/client/arte/cartas.ts` |
| `07-marcador/` | El marcador con fósforos para cada puntaje posible, partido a 30 (0 a 30) y partido a 15 (0 a 15), en PNG transparente | `src/client/arte/escena.ts` (`porotosSVG`) |
| `08-interfaz/` | Paneles (marcador, info, señas, acciones en tu turno / cuando te cantan truco / cuando te cantan envido, plegados), botones, selector de opciones, globos de diálogo, carteles de puntos y placas de nombre | `src/client/hud.ts`, `src/client/estilos.css` |

## Paleta actual

| Uso | Color |
|---|---|
| Botones (vino) | `#a52a3c` → `#6d1424` |
| Dorado de títulos | `#e8c46a` |
| Texto crema | `#f6e7c8` |
| Paneles | `rgba(30,16,10,.8)` |
| Equipo celeste | `#6fa8dc` (texto `#8ec1ff`) |
| Equipo colorado | `#c0392b` (texto `#ff9a86`) |
| Palos | espada `#24519c` · basto `#2f6b22` · oro `#a8770a` · copa `#b3261e` |
