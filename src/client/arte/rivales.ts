/*
 * Rivales del modo 1v1 contra bots: personajes distópicos en pixel art (grilla de 40x44).
 *
 * Cada uno se arma por piezas (cuerpo, cabeza, sombrero...) y cada pieza lleva su contorno,
 * así quedan separadas con línea gruesa. La cara usa las mismas capas que los personajes de la
 * mesa (.ojo-i/.ojo-d, .ojo-i-c/.ojo-d-c, .boca, .boca-abierta), para que parpadeen y hablen.
 *
 * Quiénes son y cómo juegan está en src/engine/rivales.ts (mismo `id`).
 */
import { DATOS_RIVALES, type DatosRival } from '../../engine/rivales';

const W = 40, H = 44;
const K = '#1d1d2b';

class Lienzo {
  c = new Map<number, string>();
  pon(x: number, y: number, col: string) { if (x >= 0 && x < W && y >= 0 && y < H) this.c.set(y * W + x, col); return this; }
  caja(x0: number, y0: number, x1: number, y1: number, col: string) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.pon(x, y, col); return this; }
  elipse(cx: number, cy: number, rx: number, ry: number, col: string, filtro: (x: number, y: number) => boolean = () => true) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1 && filtro(x, y)) this.pon(x, y, col);
      }
    return this;
  }
  linea(x0: number, y0: number, x1: number, y1: number, col: string) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= n; i++) this.pon(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), col);
    return this;
  }
  tiene = (x: number, y: number) => this.c.has(y * W + x);
  /** Sombrea con `col` el borde derecho de lo pintado (luz desde la izquierda). */
  sombra(col: string, ancho = 2) {
    const nuevos: [number, number][] = [];
    for (const i of this.c.keys()) {
      const x = i % W, y = Math.floor(i / W);
      for (let d = 1; d <= ancho; d++) if (!this.tiene(x + d, y)) { nuevos.push([x, y]); break; }
    }
    for (const [x, y] of nuevos) this.pon(x, y, col);
    return this;
  }
}

/** Pieza con su contorno de 1 píxel. */
function conContorno(l: Lienzo): Lienzo {
  const out = new Lienzo();
  for (const i of l.c.keys()) {
    const x = i % W, y = Math.floor(i / W);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!l.tiene(x + dx, y + dy)) out.pon(x + dx, y + dy, K);
  }
  for (const [i, col] of l.c) out.c.set(i, col);
  return out;
}

/** Superpone piezas en orden (cada una con su contorno). */
function componer(...piezas: Lienzo[]): Lienzo {
  const out = new Lienzo();
  for (const p of piezas) for (const [i, col] of conContorno(p).c) out.c.set(i, col);
  return out;
}

function rects(l: Lienzo): string {
  let s = '';
  for (let y = 0; y < H; y++) {
    let x = 0;
    while (x < W) {
      const col = l.c.get(y * W + x);
      if (!col) { x++; continue; }
      let j = x;
      while (j < W && l.c.get(y * W + j) === col) j++;
      s += `<rect x="${x}" y="${y}" width="${j - x}" height="1" fill="${col}"/>`;
      x = j;
    }
  }
  return s;
}

const capa = (f: (l: Lienzo) => void) => { const l = new Lienzo(); f(l); return rects(l); };

/** Torso que se abre hacia abajo desde los hombros. */
function torso(col: string, y0 = 31, ancho = 18, patron?: (x: number, y: number) => string | null) {
  const l = new Lienzo();
  for (let y = y0; y < H; y++) {
    const hw = Math.min(ancho, 7 + (y - y0) * 3);
    for (let x = 20 - hw; x < 20 + hw; x++) l.pon(x, y, patron?.(x, y) ?? col);
  }
  return l;
}

interface Dibujo {
  id: string;
  fondo: string;
  /** Partes de la cara, en capas que se prenden con CSS. */
  dibujo: () => { base: Lienzo; ojoI: string; ojoD: string; ojoIc: string; ojoDc: string; boca: string; bocaAbierta: string; encima?: string };
}

const DIBUJOS: Dibujo[] = [
  {
    id: 'cobrador', fondo: '#2b3a55',
    dibujo: () => {
      const piel = '#8aa0b4', oscura = '#5f7488';
      const saco = torso('#2b2f45', 32, 18, (x, y) => (Math.abs(x - 19.5) < 2.5 && y < 40 ? (Math.abs(x - 19.5) < 1 ? '#c23a4c' : '#f4f1e8') : null));
      saco.caja(12, 27, 14, 32, '#2b2f45').caja(25, 27, 27, 32, '#2b2f45'); // cuello levantado
      saco.pon(13, 36, '#ffc93c').pon(14, 37, '#ffc93c').pon(15, 38, '#ffc93c'); // cadena del reloj
      const cuello = new Lienzo().caja(17, 26, 22, 31, oscura);
      const cara = new Lienzo().elipse(20, 18, 6.5, 10.5, piel).sombra(oscura);
      cara.caja(14, 15, 18, 17, oscura).caja(22, 15, 26, 17, oscura); // ojeras hundidas
      cara.caja(19, 18, 20, 21, oscura); // nariz larga
      const sombrero = new Lienzo().elipse(20, 8.5, 7.5, 5, '#34344a', (_x, y) => y <= 9).caja(10, 9, 30, 10, '#34344a').caja(13, 8, 27, 8, '#c23a4c');
      return {
        base: componer(saco, cuello, cara, sombrero),
        ojoI: capa((l) => l.caja(15, 16, 17, 16, '#ffe14a').pon(16, 16, '#ffffff')),
        ojoD: capa((l) => l.caja(23, 16, 25, 16, '#ffe14a').pon(24, 16, '#ffffff')),
        ojoIc: capa((l) => l.caja(14, 17, 18, 17, K)), ojoDc: capa((l) => l.caja(22, 17, 26, 17, K)),
        boca: capa((l) => l.caja(17, 24, 23, 24, K).pon(16, 23, K)),
        bocaAbierta: capa((l) => l.caja(17, 23, 23, 25, '#3a1020').pon(18, 23, '#ffffff').pon(21, 23, '#ffffff')),
      };
    },
  },
  {
    id: 'humo', fondo: '#3c2f52',
    dibujo: () => {
      const chal = torso('#7a4ab8', 31, 18, (x, y) => ((x + y) % 3 === 0 ? '#5a2e90' : null));
      chal.caja(19, 33, 20, 34, '#ffc93c'); // prendedor
      const humo = new Lienzo();
      for (const [x, y, rx, ry] of [[20, 19, 9, 8], [13, 14, 5, 5], [27, 13, 5, 5], [20, 10, 6, 5], [13, 23, 4, 4], [27, 23, 4, 4]])
        humo.elipse(x, y, rx, ry, '#c9d2dc');
      for (const [x, y, r] of [[12, 12, 2], [19, 8, 2.5], [26, 11, 2], [15, 18, 2]]) humo.elipse(x, y, r, r * 0.7, '#eef2f5');
      humo.sombra('#a4aebb');
      const mate = new Lienzo().elipse(10, 39, 3.5, 4, '#c97a3a').caja(7, 36, 13, 36, '#7a4420');
      const bombilla = new Lienzo().linea(11, 35, 13, 31, '#e8f0f5');
      return {
        base: componer(chal, humo, bombilla, mate),
        ojoI: capa((l) => l.elipse(16, 18, 2.6, 2.6, '#ffffff').caja(16, 18, 17, 19, K)),
        ojoD: capa((l) => l.elipse(24, 18, 2.6, 2.6, '#ffffff').caja(24, 18, 25, 19, K)),
        ojoIc: capa((l) => l.caja(14, 19, 18, 19, K)), ojoDc: capa((l) => l.caja(22, 19, 26, 19, K)),
        boca: capa((l) => l.caja(19, 23, 21, 23, '#5a6470')),
        bocaAbierta: capa((l) => l.elipse(20, 24, 1.8, 1.8, '#5a6470')),
        encima: capa((l) => l.pon(31, 4, '#c9d2dc').pon(32, 3, '#c9d2dc').pon(8, 5, '#c9d2dc').pon(7, 4, '#c9d2dc')),
      };
    },
  },
  {
    id: 'sapo', fondo: '#244a3a',
    dibujo: () => {
      const verde = '#5cc44a', verdeOsc = '#3e9a34';
      const chaleco = torso('#f39a2c', 31, 19, (x, y) => (y === 36 || y === 40 ? '#f4f1e8' : Math.abs(x - 19.5) < 1 ? '#2f7fd8' : null));
      const ojos = new Lienzo().elipse(13, 12, 4.5, 4.5, verde).elipse(27, 12, 4.5, 4.5, verde);
      const cara = new Lienzo().elipse(20, 21, 13, 9, verde).elipse(20, 25, 10, 4, '#b8e06a', (_x, y) => y >= 24).sombra(verdeOsc);
      cara.pon(18, 18, K).pon(22, 18, K); // narinas
      cara.pon(11, 20, verdeOsc).pon(29, 21, verdeOsc).pon(26, 17, verdeOsc).pon(14, 25, verdeOsc); // verrugas
      const casco = new Lienzo().elipse(20, 7, 6.5, 4, '#ffc93c', (_x, y) => y <= 7).caja(14, 8, 26, 8, '#ffc93c').caja(19, 3, 20, 7, '#d88a1a');
      return {
        base: componer(chaleco, ojos, cara, casco),
        ojoI: capa((l) => l.elipse(13, 12, 2.7, 2.7, '#ffffff').caja(12, 12, 14, 12, K)),
        ojoD: capa((l) => l.elipse(27, 12, 2.7, 2.7, '#ffffff').caja(26, 12, 28, 12, K)),
        ojoIc: capa((l) => l.elipse(13, 12, 2.9, 2.9, verde).caja(10, 12, 16, 12, K)),
        ojoDc: capa((l) => l.elipse(27, 12, 2.9, 2.9, verde).caja(24, 12, 30, 12, K)),
        boca: capa((l) => l.caja(11, 23, 29, 23, K).pon(10, 22, K).pon(30, 22, K)),
        bocaAbierta: capa((l) => l.caja(11, 23, 29, 26, '#7a1f2f').caja(16, 25, 24, 26, '#ff7a9a').caja(11, 23, 29, 23, K)),
        encima: capa((l) => l.caja(34, 4, 35, 5, K).pon(33, 3, '#ffffff').pon(36, 3, '#ffffff').caja(4, 8, 5, 9, K).pon(3, 7, '#ffffff').pon(6, 7, '#ffffff')),
      };
    },
  },
  {
    id: 'robot', fondo: '#3a2a2a',
    dibujo: () => {
      const metal = '#a8b4bc', metalOsc = '#7a8890';
      const poncho = torso('#c23a4c', 30, 20, (_x, y) => (y % 4 === 0 ? '#2b2f45' : y % 4 === 2 ? '#f4f1e8' : null));
      const cuello = new Lienzo().caja(17, 27, 22, 30, metalOsc).caja(17, 28, 22, 28, '#5c6b75');
      const orejas = new Lienzo().caja(8, 15, 10, 21, metalOsc).caja(30, 15, 32, 21, metalOsc);
      const cabeza = new Lienzo().caja(11, 10, 29, 27, metal).sombra(metalOsc, 3);
      for (const [x, y] of [[13, 12], [27, 12], [13, 25], [27, 25]]) cabeza.pon(x, y, '#5c6b75');
      cabeza.caja(13, 14, 27, 19, K); // visor
      cabeza.pon(14, 23, '#b8642c').pon(15, 24, '#b8642c').pon(25, 12, '#b8642c').pon(26, 13, '#b8642c'); // óxido
      const antena = new Lienzo().caja(31, 6, 31, 14, '#5c6b75').caja(30, 4, 32, 5, '#ff4d5e');
      const sombrero = new Lienzo().caja(5, 8, 35, 9, '#4a3020').caja(12, 2, 28, 7, '#4a3020').caja(12, 6, 28, 7, '#2a1a10');
      return {
        base: componer(poncho, cuello, orejas, antena, cabeza, sombrero),
        ojoI: capa((l) => l.caja(15, 16, 25, 17, '#ff4d5e').caja(18, 16, 20, 16, '#ffb0b8')),
        ojoD: '', ojoIc: capa((l) => l.caja(15, 17, 25, 17, '#5a1626')), ojoDc: '',
        boca: capa((l) => l.caja(15, 22, 25, 22, '#5c6b75').caja(15, 24, 25, 24, '#5c6b75')),
        bocaAbierta: capa((l) => {
          l.caja(15, 21, 25, 25, K);
          [2, 4, 3, 5, 2, 4, 3].forEach((h, i) => l.caja(16 + i * 1.5 | 0, 25 - h + 1, 16 + i * 1.5 | 0, 25, '#4fb05a'));
        }),
      };
    },
  },
  {
    id: 'tarotista', fondo: '#2a2450',
    dibujo: () => {
      const piel = '#f2a0c0', oscura = '#c8708f', pelo = '#2fb8a8';
      const tunica = torso('#3a2a6a', 31, 18, (x, y) => ((x * 7 + y * 3) % 11 === 0 ? '#ffc93c' : null));
      const melena = new Lienzo().elipse(20, 16, 11, 11, pelo).caja(9, 16, 13, 37, pelo).caja(27, 16, 31, 37, pelo);
      melena.pon(11, 22, '#1f8a7e').pon(12, 28, '#1f8a7e').pon(29, 24, '#1f8a7e').pon(28, 31, '#1f8a7e');
      const cara = new Lienzo().elipse(20, 19, 7.5, 9, piel).sombra(oscura);
      cara.caja(19, 13, 21, 15, '#ffffff').pon(20, 14, '#7a4ab8'); // tercer ojo
      cara.pon(20, 20, oscura).pon(20, 21, oscura); // nariz
      cara.pon(15, 22, '#ff7a9a').pon(25, 22, '#ff7a9a');
      const flequillo = new Lienzo().elipse(20, 11, 8, 4, pelo, (_x, y) => y <= 12);
      const aros = new Lienzo().caja(12, 21, 12, 23, '#ffc93c').caja(28, 21, 28, 23, '#ffc93c');
      const carta = new Lienzo().caja(28, 33, 33, 41, '#f4f1e8').elipse(30.5, 37, 1.6, 1.6, '#ffc93c');
      return {
        base: componer(melena, tunica, cara, flequillo, aros, carta),
        ojoI: capa((l) => l.caja(16, 18, 17, 19, K).pon(16, 18, '#ffffff').pon(15, 17, K)),
        ojoD: capa((l) => l.caja(23, 18, 24, 19, K).pon(23, 18, '#ffffff').pon(25, 17, K)),
        ojoIc: capa((l) => l.caja(15, 19, 18, 19, K)), ojoDc: capa((l) => l.caja(22, 19, 25, 19, K)),
        boca: capa((l) => l.caja(19, 24, 21, 24, '#c23a4c').pon(18, 23, '#c23a4c').pon(22, 23, '#c23a4c')),
        bocaAbierta: capa((l) => l.caja(19, 23, 21, 25, '#5a1626').caja(19, 23, 21, 23, '#c23a4c')),
      };
    },
  },
  {
    id: 'calavera', fondo: '#352a2a',
    dibujo: () => {
      const hueso = '#ece6da', huesoOsc = '#c8bfa8';
      const traje = torso('#3a3f4a', 31, 18, (x, y) => (Math.abs(x - 19.5) < 2.5 && y < 40 ? (Math.abs(x - 19.5) < 1 ? '#c23a4c' : '#f4f1e8') : x % 3 === 0 ? '#5a606c' : null));
      const cuello = new Lienzo().caja(18, 27, 21, 31, huesoOsc).caja(18, 29, 21, 29, '#a39a84');
      const craneo = new Lienzo().elipse(20, 16, 8, 8.5, hueso).caja(15, 21, 25, 27, hueso).sombra(huesoOsc);
      craneo.elipse(16.5, 17, 2.3, 2.3, K).elipse(23.5, 17, 2.3, 2.3, K); // cuencas
      craneo.caja(19, 21, 20, 22, K); // nariz
      craneo.caja(16, 24, 24, 25, '#ffffff');
      for (let x = 17; x <= 24; x += 2) craneo.caja(x, 24, x, 25, K);
      craneo.pon(22, 24, '#ffc93c'); // diente de oro
      const sombrero = new Lienzo().caja(9, 9, 31, 10, '#2a2e38').caja(13, 3, 27, 8, '#2a2e38').caja(13, 7, 27, 8, '#c23a4c');
      const pucho = new Lienzo().caja(26, 26, 31, 26, '#f4f1e8').pon(26, 26, '#e0883a').pon(32, 26, '#ff7a2a');
      return {
        base: componer(traje, cuello, craneo, sombrero, pucho),
        ojoI: capa((l) => l.pon(16, 17, '#ff4d5e')), ojoD: capa((l) => l.pon(23, 17, '#ff4d5e')),
        ojoIc: capa((l) => l.pon(16, 17, '#5a1626')), ojoDc: capa((l) => l.pon(23, 17, '#5a1626')),
        boca: '',
        bocaAbierta: capa((l) => l.caja(16, 26, 24, 27, K)),
        encima: capa((l) => l.pon(33, 24, '#c9d2dc').pon(34, 22, '#c9d2dc').pon(33, 20, '#c9d2dc').pon(35, 19, '#c9d2dc')),
      };
    },
  },
  {
    id: 'antena', fondo: '#2a3a24',
    dibujo: () => {
      const buzo = torso('#ffc93c', 31, 18, (x) => (x < 7 || x > 32 ? '#d88a1a' : null));
      buzo.caja(19, 36, 20, 37, K).caja(16, 34, 17, 35, K).caja(22, 34, 23, 35, K).caja(19, 39, 20, 40, K); // símbolo
      const capucha = new Lienzo().elipse(20, 18, 11, 11.5, '#d88a1a').sombra('#a86410');
      const cara = new Lienzo().elipse(20, 19, 7, 7.5, '#e2a878');
      const mascara = new Lienzo().elipse(20, 20, 7.5, 6, '#4a5560').caja(14, 20, 26, 25, '#4a5560').sombra('#353e47');
      mascara.elipse(16, 18, 3.4, 3.4, K).elipse(24, 18, 3.4, 3.4, K);
      const filtro = new Lienzo().elipse(20, 26, 3.5, 2.6, '#8fa3b0').caja(18, 26, 22, 26, '#5c6b75');
      const antenas = new Lienzo().linea(13, 8, 10, 2, '#8fa3b0').linea(27, 8, 30, 2, '#8fa3b0').caja(9, 0, 10, 1, '#ff4d5e').caja(30, 0, 31, 1, '#ff4d5e');
      return {
        base: componer(buzo, antenas, capucha, cara, mascara, filtro),
        ojoI: capa((l) => l.elipse(16, 18, 2.5, 2.5, '#7dff6a').pon(15, 17, '#ffffff')),
        ojoD: capa((l) => l.elipse(24, 18, 2.5, 2.5, '#7dff6a').pon(23, 17, '#ffffff')),
        ojoIc: capa((l) => l.elipse(16, 18, 2.5, 2.5, '#2e5a28')), ojoDc: capa((l) => l.elipse(24, 18, 2.5, 2.5, '#2e5a28')),
        boca: '',
        bocaAbierta: capa((l) => l.caja(18, 26, 22, 26, '#7dff6a')),
      };
    },
  },
  {
    id: 'caudillo', fondo: '#1f2f3a',
    dibujo: () => {
      const piel = '#c8dce8', oscura = '#94acbc';
      const saco = torso('#2e4a3a', 31, 19, (x, y) => (x === 20 && (y === 35 || y === 38 || y === 41) ? '#ffc93c' : null));
      saco.pon(14, 35, '#ff4d5e').pon(14, 36, '#ffc93c').pon(16, 35, '#2f7fd8').pon(16, 36, '#ffc93c');
      const charreteras = new Lienzo().caja(5, 31, 11, 32, '#ffc93c').caja(28, 31, 34, 32, '#ffc93c');
      for (let x = 5; x <= 34; x += 2) if (x <= 11 || x >= 28) charreteras.pon(x, 33, '#d88a1a');
      const piel_ = new Lienzo().elipse(20, 31.5, 10, 2, '#eef2f5');
      for (let x = 12; x <= 28; x += 3) piel_.pon(x, 31, '#c9d2dc');
      const orejas = new Lienzo().elipse(12, 17, 2.6, 4, piel).elipse(28, 17, 2.6, 4, piel).caja(12, 16, 12, 18, oscura).caja(28, 16, 28, 18, oscura);
      const cara = new Lienzo().elipse(20, 16, 7, 11, piel).sombra(oscura, 1);
      cara.caja(18, 10, 22, 10, oscura); // arruga
      cara.caja(14, 13, 17, 13, '#3a4a58').pon(17, 14, '#3a4a58').caja(23, 13, 26, 13, '#3a4a58').pon(23, 14, '#3a4a58'); // cejas fruncidas
      cara.caja(20, 17, 20, 20, oscura).pon(19, 20, oscura); // nariz
      const gorra = new Lienzo().elipse(20, 5.5, 8.5, 3.5, '#2e4a3a', (_x, y) => y <= 6).caja(12, 6, 28, 7, '#c23a4c').caja(11, 8, 29, 8, '#2b2f45');
      gorra.caja(19, 4, 21, 5, '#ffc93c');
      return {
        base: componer(saco, charreteras, piel_, orejas, cara, gorra),
        ojoI: capa((l) => l.caja(15, 15, 17, 16, '#ffffff').pon(16, 16, '#c23a4c')),
        ojoD: capa((l) => l.caja(23, 15, 25, 16, '#ffffff').pon(24, 16, '#c23a4c')),
        ojoIc: capa((l) => l.caja(15, 16, 17, 16, K)), ojoDc: capa((l) => l.caja(23, 16, 25, 16, K)),
        boca: capa((l) => l.caja(18, 23, 22, 23, K).pon(17, 24, K).pon(23, 24, K)),
        bocaAbierta: capa((l) => l.caja(18, 23, 22, 25, '#3a1020').caja(18, 23, 22, 23, '#ffffff')),
      };
    },
  },
];

export type Rival = DatosRival & Dibujo;
export const RIVALES: Rival[] = DATOS_RIVALES.map((d) => ({ ...d, ...DIBUJOS.find((x) => x.id === d.id)! }));
export const rivalPorId = (id: string | undefined) => RIVALES.find((r) => r.id === id);

/** SVG de un rival, con las mismas clases de capas que los personajes de la mesa. */
export function rivalSVG(r: Rival): string {
  const d = r.dibujo();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges" preserveAspectRatio="xMidYMax meet">
    <g class="respira"><g class="cabeza">
      ${rects(d.base)}
      <g class="capa ojo-i parpadeo">${d.ojoI}</g><g class="capa ojo-d parpadeo">${d.ojoD}</g>
      <g class="capa ojo-i-c">${d.ojoIc}</g><g class="capa ojo-d-c">${d.ojoDc}</g>
      <g class="capa boca">${d.boca}</g><g class="capa boca-abierta">${d.bocaAbierta}</g>
      ${d.encima ?? ''}
    </g></g></svg>`;
}
