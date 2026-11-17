# TdeTruco

Truco argentino multijugador (2v2, 3v3 y 4v4) con vista en primera persona, señas entre compañeros y marcador con fósforos.

## Estado actual: prototipo visual

- `prototipos/2d.html`: **diseño elegido**. Escena 2.5D ilustrada en una pulpería, con tres gauchos, cartas de baraja española, señas, "Voy" / "Vení" y paneles plegables.
- `prototipos/3d.html`: alternativa 3D (Three.js) que se usó para comparar.
- `prototipos/comun.js`: reglas simplificadas (2v2, a 30, sin flor), bots e interfaz compartida.

## Probarlo localmente

```bash
npx http-server prototipos -p 5173 -c-1
# abrir http://localhost:5173/2d.html
```

## Reglas acordadas

- Partido a 30 (malas y buenas de 15), sin flor.
- Envido, real envido y falta envido. Truco, retruco y vale cuatro. "El envido está primero".
- Pica-pica ("punta y hacha") en 3v3 y 4v4.
- Señas por botones, que ejecuta el avatar animado.
