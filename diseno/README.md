# Diseño de TdeTruco: estética retro pixel / CRT

Imágenes del juego tal como está hoy, separadas por parte. Se regeneran con:

```bash
npm run dev -- --port 5180      # en una terminal
npm run capturas                # en otra (usa Chrome instalado)
```

> `npm run capturas` borra y vuelve a crear esta carpeta entera (este README incluido).

| Carpeta | Qué hay | Código |
|---|---|---|
| `01-pantallas/` | Pantallas completas a 1600×900: inicio, lobby (2v2 y 4v4), mesas de 1v1 a 4v4, pica-pica, segunda baza, compañero haciendo una seña o diciendo "voy", y fin de partido | `src/client/pantallas.ts`, `src/client/mesa.ts` |
| `02-fondo/` | Fondo con el remolino de colores y la capa de monitor CRT | `src/client/arte/escena.ts`, `src/client/estilos.css` (`#fondo`, `#crt`) |
| `03-mesa/` | Mesa de paño verde, el paño solo y el mate en pixel art (PNG + SVG) | `src/client/estilos.css` (`#mesa`), `src/client/arte/pixel.ts` (`MATE`) |
| `04-personajes/` | Los 8 personajes con la camiseta a rayas de cada equipo (celeste y colorado), PNG + SVG | `src/client/arte/pixel.ts` (`PERSONAJES`, `personajeSVG`) |
| `05-senas/` | Una carpeta por personaje con la cara neutral y las 9 señas | `src/client/estilos.css` (clases `.s-*` sobre las capas de la cara) |
| `06-cartas/` | Las 40 cartas en pixel art: SVG de 64×96 y PNG a 4×, más el dorso y una hoja con todas | `src/client/arte/pixel.ts` (`cartaSVG`, `dorsoSVG`) |
| `07-marcador/` | El marcador con fósforos para cada puntaje posible, a 30 y a 15 | `src/client/arte/escena.ts` (`porotosSVG`) |
| `08-interfaz/` | Paneles, botones, selector de opciones, globos, carteles de puntos y placas de nombre | `src/client/hud.ts`, `src/client/estilos.css` |

## Cómo está hecho el pixel art

- Todo se dibuja como `<rect>` sobre una grilla (cartas 64×96, personajes 32×36, mate 20×21), con `shape-rendering="crispEdges"`. No hay filtros de pixelado: por eso se lee nítido a cualquier tamaño.
- Los personajes se generan por código a partir de unos pocos rasgos (piel, pelo, sombrero, barba, anteojos). La cara tiene capas (`.ojo-i`, `.ojo-d`, `.cejas`, `.cejas-arriba`, `.boca-*`) que el CSS prende y apaga para hacer las señas.
- La paleta está en `PALETA` (`src/client/arte/pixel.ts`) y en las variables de `:root` de `src/client/estilos.css`.

## Paleta

| Uso | Color |
|---|---|
| Fondo | `#1b2a30` |
| Contornos | `#1d1d2b` |
| Texto / papel | `#f4f1e8` |
| Acento (títulos, turno) | `#ffc93c` |
| Botón truco / quiero | `#ff4d5e` |
| Botón envido | `#2f8fe8` |
| Botones voy / vení | `#f39a2c` |
| Botones secundarios | `#3e535c` |
| Equipo celeste / colorado | `#5ab0ff` / `#ff4d5e` |
| Paño de la mesa | `#4fae78` → `#2a6a47` |

## Tipografías

- **Press Start 2P**: títulos, globos, números del marcador y placas.
- **Pixelify Sans**: textos de interfaz y botones.
