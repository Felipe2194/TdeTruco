# TdeTruco

Truco argentino multijugador con estética retro pixel / CRT: 1v1, 2v2, 3v3 y 4v4, con vista en primera persona, personajes en pixel art que hacen señas, "Voy" / "Vení" con el compañero y marcador con fósforos.

## Cómo correrlo

```bash
npm install
npm run dev          # http://localhost:5173 (servidor de juego incluido)
npm test             # motor de reglas y salas
npm run build        # build de producción
npm run capturas     # regenera las imágenes de diseño en ./diseno (con el dev server en :5180)
```

## Reglas implementadas

- Baraja española de 40 cartas con la jerarquía del truco, sin flor.
- Partido a 15 o a 30 (malas y buenas).
- **Envido**: envido, real envido y falta envido, con todas las cadenas; querido y no querido; "son buenas"; el empate lo gana la mano.
- **Truco**: truco, retruco y vale cuatro; solo sube quien tiene el quiero; "el envido está primero".
- Irse al mazo (con el punto extra en primera si no se cantó envido), pardas y orden antihorario.
- **Pica-pica ("punta y hacha")** en 3v3 y 4v4: en la zona media del partido se alterna una redonda con una mano de duelos 1v1.
- Bots que completan los asientos vacíos y respetan el "Voy" / "Vení" de su compañero humano.

## Arquitectura

```
src/engine/    Motor de reglas puro (TypeScript): juego.ts, cartas.ts, bot.ts
src/server/    Salas: jugadores, bots, eventos, vista filtrada por jugador, almacenamiento
api/sala.ts    Vercel Function que expone la API de salas
src/client/    Interfaz (Vite + TypeScript): mesa, HUD, pantallas, arte en pixel art (cartas, personajes, mate) en arte/pixel.ts
tests/         Vitest: reglas, casos borde y partidas completas simuladas
diseno/        Imágenes de cada parte del juego para rediseñar (ver diseno/README.md)
prototipos/    Prototipos visuales originales (2D y 3D) y la exploración archivada de 18 estilos
mockup.html    Mockup jugable de los 8 estilos candidatos (el elegido fue Retro Pixel / CRT)
```

- **Servidor autoritativo**: cada jugador recibe solo sus cartas. Las acciones se validan con el motor.
- **Comunicación**: HTTP con *polling* (~700 ms), suficiente para un juego por turnos. Los bots avanzan cuando alguien consulta el estado, así que no hace falta un proceso corriendo aparte.
- **Almacenamiento**: Redis por REST (Upstash) si están definidas `KV_REST_API_URL` y `KV_REST_API_TOKEN` (o `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`). Sin esas variables usa memoria, que sirve para desarrollo local.
