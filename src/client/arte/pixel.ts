/*
 * Pixel art del juego (estética retro CRT). Todo se dibuja como rects sobre una grilla,
 * sin filtros, para que se vea nítido a cualquier tamaño.
 *
 *  - Cartas: grilla de 64x96 con sprites de palos dibujados a mano.
 *  - Personajes: grilla de 32x36 generada por código, con capas para las señas
 *    (ojos, cejas, bocas) que se prenden y apagan desde CSS.
 *  - Mate: sprite de 20x21.
 */
import type { Carta, Palo } from '../../engine/cartas';

export type Sprite = string[];

/** Paleta común. Cada letra de un sprite es uno de estos colores. */
export const PALETA: Record<string, string> = {
  k: '#1d1d2b', w: '#ffffff', papel: '#f4f1e8', luz: '#ffffff', sombra: '#d3cab5',
  m: '#e8f0f5', s: '#8fa3b0', b: '#2f7fd8', B: '#1a4f9c', c: '#5ab0ff',
  y: '#ffc93c', Y: '#d88a1a', l: '#fff3b0', r: '#ff4d5e', R: '#a3202f',
  g: '#4fb05a', G: '#2e7a3a', o: '#c97a3a', O: '#7a4420', h: '#eaa364',
  p: '#f2b98a', n: '#8a5a2b', e: '#ece6da', rayo: '#ffc93c', dorso: '#c23a4c', dorso2: '#8e2236',
};

const COLOR_PALO: Record<Palo, [string, string]> = {
  espada: ['#2f7fd8', '#1a4f9c'], basto: ['#4fb05a', '#2e7a3a'], oro: ['#e8a020', '#b86a10'], copa: ['#ff4d5e', '#a3202f'],
};

/** Convierte un sprite en rects, uniendo los píxeles iguales de cada fila. */
export function sprite(s: Sprite, x0: number, y0: number, escala = 1, colores: Record<string, string> = PALETA): string {
  let out = '';
  s.forEach((fila, y) => {
    let i = 0;
    while (i < fila.length) {
      const ch = fila[i];
      let j = i;
      while (j < fila.length && fila[j] === ch) j++;
      const color = ch === '.' ? undefined : colores[ch] ?? PALETA[ch];
      if (color) out += `<rect x="${x0 + i * escala}" y="${y0 + y * escala}" width="${(j - i) * escala}" height="${escala}" fill="${color}"/>`;
      i = j;
    }
  });
  return out;
}

const rect = (x: number, y: number, w: number, h: number, color: string) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`;

// ======================================================================= Cartas

const PALO: Record<Palo, Sprite> = {
  espada: ['.....kk.....', '....kmsk....', '....kmsk....', '....kmsk....', '....kmsk....', '....kmsk....',
    '.kkkkmskkkk.', '.kyybbbbyyk.', '.kkkkbBkkkk.', '....kbBk....', '...kyyyYk...', '....kkkk....'],
  basto: ['....kkk.....', '...khook....', '...khoOk.kk.', '...khoOkkggk', '...kOoOk.kk.', 'kk..khok....',
    'kgk.khOk....', 'kGgkkhok....', '.kk.khOk....', '....khok....', '....kOOk....', '.....kk.....'],
  oro: ['...kkkkkk...', '..kyyyyyyk..', '.kyllyyyyYk.', 'kylyyyyyyyYk', 'kyyykyykyyYk', 'kyyyyyyyyyYk',
    'kyykyyyykyYk', 'kyyykkkkyyYk', 'kyyyyyyyyYYk', '.kYyyyyyYYk.', '..kYYYYYYk..', '...kkkkkk...'],
  copa: ['kkkkkkkkkkkk', 'kyyyyyyyyyYk', 'kkkkkkkkkkkk', '.krrrrrrrRk.', '.krrrkkrrRk.', '.krrkcckrRk.',
    '..krrkkrRk..', '...krrrRk...', '....kyYk....', '....kyYk....', '..kkyyyYkk..', '..kkkkkkkk..'],
};

const MINI: Record<Palo, Sprite> = {
  espada: ['...k...', '..kmk..', '..kmk..', '..kmk..', '.kkkkk.', '..kbk..', '..kyk..'],
  basto: ['..kk...', '.khok..', '.kOokgk', '..kok..', '..kOk..', '..kok..', '...k...'],
  oro: ['..kkk..', '.kyyyk.', 'kylyyYk', 'kyyyyYk', 'kyyyYYk', '.kYYYk.', '..kkk..'],
  copa: ['kkkkkkk', 'krrrrRk', '.krcRk.', '..krk..', '...k...', '..kyk..', '.kkkkk.'],
};

// Bustos de las figuras (12x16): "x"/"X" toman el color del palo.
const FIGURA: Record<number, Sprite> = {
  10: ['............', '...kkkkk....', '..kxxxxxk...', '..kxxxxxxk..', '..knpppnk...', '..kpkpkpk...',
    '..kpppppk...', '..kppkppk...', '...kpppk....', '....kpk.....', '.kkkkkkkkk..', 'kxxxxyxxxxk.',
    'kxXxxyxxXxk.', 'kxXxxyxxXxk.', 'kxxxxyxxxxk.', 'kkkkkkkkkkk.'],
  11: ['....kk.kk...', '...knnknnk..', '...knnnnnk..', '..knnnnnnk..', '..knknnnnk..', '.knnnnnnnk..',
    'knnnnnnnnk..', 'knnnnknnnk..', 'kknnk.knnk..', '..kk..knnk..', '......knnk..', '....kxxxxxk.',
    '...kxyxyxyk.', '...kxxxxxxk.', '...knnnnnnk.', '...kkkkkkkk.'],
  12: ['...y.y.y....', '..kyyyyyk...', '..kyryryk...', '..kkkkkkk...', '..kpppppk...', '..kpkpkpk...',
    '..kpppppk...', '..keeeeek...', '..keekeek...', '...keeek....', '.kkkkkkkkk..', 'kxxxxyxxxxk.',
    'kxXxxyxxXxk.', 'kxXxxyxxXxk.', 'kxxxxyxxxxk.', 'kkkkkkkkkkk.'],
};

const DIGITO: Record<string, Sprite> = {
  0: ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'], 1: ['.X.', 'XX.', '.X.', '.X.', 'XXX'], 2: ['XX.', '..X', '.X.', 'X..', 'XXX'],
  3: ['XX.', '..X', '.X.', '..X', 'XX.'], 4: ['X.X', 'X.X', 'XXX', '..X', '..X'], 5: ['XXX', 'X..', 'XX.', '..X', 'XX.'],
  6: ['.XX', 'X..', 'XXX', 'X.X', 'XXX'], 7: ['XXX', '..X', '.X.', '.X.', '.X.'],
};

const CORTES: Record<Palo, number> = { oro: 0, copa: 1, espada: 2, basto: 3 };
const L = 19, R = 33, C = 26;
const PIPS: Record<number, [number, number][]> = {
  2: [[C, 16], [C, 68]],
  3: [[C, 12], [C, 42], [C, 72]],
  4: [[L, 16], [R, 16], [L, 68], [R, 68]],
  5: [[L, 14], [R, 14], [C, 42], [L, 70], [R, 70]],
  6: [[L, 10], [R, 10], [L, 42], [R, 42], [L, 74], [R, 74]],
  7: [[L, 10], [R, 10], [C, 26], [L, 42], [R, 42], [L, 74], [R, 74]],
};

function marco(p: Palo, color: string): string {
  const x0 = 4, x1 = 59, y0 = 4, y1 = 91, hueco = 4;
  let s = rect(x0, y0, 1, y1 - y0 + 1, color) + rect(x1, y0, 1, y1 - y0 + 1, color);
  for (const y of [y0, y1]) {
    let desde = x0;
    for (let i = 1; i <= CORTES[p]; i++) {
      const cx = Math.round(x0 + ((x1 - x0) * i) / (CORTES[p] + 1));
      s += rect(desde, y, cx - hueco / 2 - desde, 1, color);
      desde = cx + hueco / 2;
    }
    s += rect(desde, y, x1 + 1 - desde, 1, color);
  }
  return s;
}

/** Borde con esquinas escalonadas, papel, luz y sombra. */
function cuerpoCarta(papel: string): string {
  const k = PALETA.k;
  return rect(2, 1, 60, 94, papel) + rect(1, 2, 62, 92, papel)
    + rect(2, 0, 60, 1, k) + rect(2, 95, 60, 1, k) + rect(0, 2, 1, 92, k) + rect(63, 2, 1, 92, k)
    + rect(1, 1, 1, 1, k) + rect(62, 1, 1, 1, k) + rect(1, 94, 1, 1, k) + rect(62, 94, 1, 1, k)
    + rect(2, 2, 58, 1, PALETA.luz) + rect(2, 2, 1, 90, PALETA.luz)
    + rect(3, 93, 59, 1, PALETA.sombra) + rect(61, 3, 1, 91, PALETA.sombra);
}

function rayos(): string {
  let s = '';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    for (const r of [22, 26, 30]) {
      if ((r === 30) !== (i % 2 === 0)) continue;
      s += rect(Math.round(32 + Math.cos(a) * r) - 1, Math.round(48 + Math.sin(a) * r * 1.05) - 1, 2, 2, PALETA.rayo);
    }
  }
  return s;
}

const svg = (w: number, h: number, cuerpo: string, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges"${extra}>${cuerpo}</svg>`;

/** SVG de una carta en pixel art. */
export function cartaSVG(c: Carta): string {
  const [x, X] = COLOR_PALO[c.p];
  const col = { ...PALETA, x, X };
  const indice = String(c.n).split('').map((d, i) => sprite(DIGITO[d], 7 + i * 7, 7, 2, col)).join('') + sprite(MINI[c.p], 7, 19);
  let centro = '';
  if (c.n === 1) {
    if (c.p === 'espada' || c.p === 'basto') centro += rayos();
    centro += sprite(PALO[c.p], 14, 30, 3);
  } else if (c.n >= 10) {
    centro = sprite(FIGURA[c.n], 20, 14, 2, col) + sprite(PALO[c.p], C, 66);
  } else {
    centro = PIPS[c.n].map(([px, py]) => sprite(PALO[c.p], px, py)).join('');
  }
  return svg(64, 96, cuerpoCarta(PALETA.papel) + marco(c.p, x) + indice + `<g transform="rotate(180 32 48)">${indice}</g>` + centro);
}

/** SVG del dorso. */
export function dorsoSVG(): string {
  let rombos = '';
  for (let y = 6; y < 90; y += 8) for (let x = 6 + ((y / 8) % 2) * 4; x < 58; x += 8) rombos += rect(x, y, 2, 2, PALETA.dorso2);
  const y = PALETA.y;
  return svg(64, 96, cuerpoCarta(PALETA.dorso) + rombos + rect(5, 5, 54, 1, y) + rect(5, 90, 54, 1, y) + rect(5, 5, 1, 86, y)
    + rect(58, 5, 1, 86, y) + rect(18, 34, 28, 28, PALETA.dorso) + sprite(PALO.oro, 20, 36, 2));
}

// ======================================================================= Mate

const MATE: Sprite = [
  '...............kk...', '..............kmk...', '.............kmk....', '............kmk.....', '...........kmk......',
  '...kkkkkkkkmkkkk....', '..kmmmmmmmmmmmmsk...', '..kgggggggggggggk...', '..kmmmmmmmmmmmmsk...', '..kooooooooooooOk...',
  '.kohoooooooooooOOk..', '.kohooooooooooooOk..', '.kohooooooooooooOk..', '.kyyyyyyyyyyyyyyYk..', '.kohooooooooooooOk..',
  '.koooooooooooooOOk..', '..kooooooooooooOk...', '...kooooooooooOk....', '....kkkkkkkkkkk.....', '.....kmmmmmmsk......',
  '.....kkkkkkkkk......',
];

export const MATE_SVG = svg(20, 21, sprite(MATE, 0, 0), ' id="mate" class="deco"');

// ======================================================================= Objetos de la mesa (cenicero, atado, facón, revólver)

const COL_DECO: Record<string, string> = {
  ...PALETA, A: '#3a3a46', a: '#6b6b78', S: '#55646e', f: '#e0883a', F: '#a85a1c', E: '#ff7a2a', z: '#9a9aa4',
};

const CENICERO: Sprite = [
  '......kkkkkkkkkkkk......',
  '...kkkmmmmmmmmmmmmkkk...',
  '..kmmmssssssssssssmmmk..',
  '.kmmsskAAAAAAAAAAkssmmk.',
  'kmmsskAaAAaAAAaAAAksmmmk',
  'kmmskAAAAAAaAAAAaAAksmmk',
  'kmmskAaAAAAAAAaAAAAksmmk',
  '.kmsskAAAaAAAAAAAAkssmk.',
  '..kmssskkkkkkkkkkksssk..',
  '...kkmmmmmmmmmmmmmmkk...',
  '....kkSSSSSSSSSSSSkk....',
  '......kkkkkkkkkkkk......',
];
const PUCHO: Sprite = ['kkkkkk', 'kwwwff', 'kkkkkk'];
const CIGARRILLO: Sprite = [
  '.kkkkkkkkkkkkkkkkk.',
  'kffffwwwwwwwwwwazEk',
  'kFFFFsssssssssszAEk',
  '.kkkkkkkkkkkkkkkkk.',
];

/** Cenicero con puchos y un cigarrillo prendido apoyado en el borde (el humo lo anima el CSS). */
export const CENICERO_HTML = `<div id="cenicero" class="deco">${svg(40, 14,
  sprite(CENICERO, 0, 2, 1, COL_DECO) + sprite(PUCHO, 7, 6, 1, COL_DECO) + sprite(PUCHO, 11, 8, 1, COL_DECO)
  + sprite(CIGARRILLO, 19, 3, 1, COL_DECO))}<i class="humo"></i><i class="humo"></i><i class="humo"></i></div>`;

const ATADO: Sprite = [
  '...kk.kk.....',
  '..kffkffk....',
  '..kffkffk....',
  'kkkkkkkkkkkkk',
  'kwwwwwwwwwwwk',
  'kwwwwwwwwwwsk',
  'krrrrrrrrrrRk',
  'krrwwwwwwwrRk',
  'krwwyyyyywwRk',
  'krwwyRRRywwRk',
  'krwwyyyyywwRk',
  'krrwwwwwwwrRk',
  'krrrrrrrrrrRk',
  'krrrrrrrrrrRk',
  'kRRRRRRRRRRRk',
  'kkkkkkkkkkkkk',
];
export const ATADO_SVG = svg(13, 16, sprite(ATADO, 0, 0, 1, COL_DECO), ' id="atado" class="deco"');

const FACON: Sprite = [
  '....kkkkkkkkkk..kkk',
  '...kOnnmnnmnnOk.ksk.kkkkkkkkkkkkkkkkkkkkkkkkk',
  '..kOnnnmnnmnnnOkksmkmmmmmmmmmmmmmmmmmmmmmmmmmkk',
  '..knnnnmnnmnnnnkksmkwwwwwwwwwwwwwwwwwwwwwwwwwwmkk',
  '..kOnnnmnnmnnnOkksmkssssssssssssssssssssssssssskk',
  '...kOnnmnnmnnOk.ksk.kkkkkkkkkkkkkkkkkkkkkkkkkkk',
  '....kkkkkkkkkk..kkk',
];
export const FACON_SVG = svg(49, 7, sprite(FACON, 0, 0, 1, COL_DECO), ' id="facon" class="deco"');

const REVOLVER: Sprite = [
  '..k.............................',
  '.kkkkkkkkkkkkkkkkkkkkkkkkk.kk...',
  'kmmmmmmmmmmmmmmkmmmmmmmmmkksk...',
  'kssssssssssssssksmmmmmmmsksssk..',
  'kkkkkkkkkkkkkkkksmsmsmsmsksssk..',
  '...............ksssssssssksssk..',
  '...............kkkkkkkkkkksssk..',
  '.................kk.k...kssssssk',
  '.................k..k..knnnnnnk.',
  '.................k.k..knnOnnnOk.',
  '..................kk.knnOnnnOk..',
  '.....................knnnnnnOk..',
  '....................knnOnnnOk...',
  '....................knnOnnnOk...',
  '....................knnnnnOOk...',
  '....................kkkkkkkkk...',
];
export const REVOLVER_SVG = svg(32, 16, sprite(REVOLVER, 0, 0, 1, COL_DECO), ' id="revolver" class="deco"');

// ======================================================================= Punta y hacha

const HACHA: Sprite = [
  'kkk.........kkkkk..',
  'kwmkk.......knnOk..',
  'kwmmmkk.....knnOk..',
  'kwmmmmmkk...knnOk..',
  'kwmmmmmmmkkkknnOkk.',
  'kwmmmmmmmmmsknnOssk',
  'kwmmmmmmmmmsknnOssk',
  'kwmmmmmmmmmsknnOssk',
  'kwmmmmmmmmmsknnOssk',
  'kwmmmmmmmmmsknnOssk',
  'kwmmmmmmmkkkknnOkk.',
  'kwmmmmmkk...knnOk..',
  'kwmmmkk.....knnOk..',
  'kwmkk.......knnOk..',
  'kkk.........knnOk..',
  ...Array.from({ length: 19 }, (_, i) => (i % 6 === 2 ? '............kRROk..' : '............knnOk..')),
  '............kOOOk..',
  '............kkkkk..',
];
export const HACHA_SVG = svg(19, 36, sprite(HACHA, 0, 0, 1, COL_DECO));

const GRIETA: Sprite = [
  '.................k......................',
  '..........k.....kk.......k..............',
  '...........k...kGk......k...............',
  '....kk......kkkGk......k.......kk.......',
  '......kkk....kGGkk...kk......kk.........',
  '.........kkkkGGGGGkkk....kkkk...........',
  '............kGGkkGGGkkkkk...............',
  '....kkkkkkkkGGkkkkGGkk..................',
  '.kkk......kkGkk...kGGkkkkk..............',
  '.........kk.k......kkk....kkkkk.........',
  '.......kk....k.......k.........kk.......',
  '.....k.......k........k...........k.....',
  '..............k.........................',
];
export const GRIETA_SVG = svg(40, 13, sprite(GRIETA, 0, 0, 1, { ...PALETA, k: '#0f2a22', G: '#071812' }));

// ======================================================================= Personajes

export type Peinado = 'boina' | 'gorra' | 'chambergo' | 'pelado' | 'vincha' | 'rulos' | 'corto';
export type Barba = 'bigote' | 'bigotazo' | 'candado' | 'completa' | 'larga' | 'nada';

export interface Personaje {
  nombre: string;
  piel: string;
  pielOsc: string;
  pelo: string;
  cejas: string;
  peinado: Peinado;
  sombrero: string;
  barba: Barba;
  anteojos: boolean;
}

export const PERSONAJES: Personaje[] = [
  { nombre: 'Ramón', piel: '#f2b98a', pielOsc: '#c98a5a', pelo: '#3a2418', cejas: '#3a2418', peinado: 'boina', sombrero: '#2a3550', barba: 'bigote', anteojos: false },
  { nombre: 'Facundo', piel: '#d9a070', pielOsc: '#a8703f', pelo: '#1d1410', cejas: '#1d1410', peinado: 'gorra', sombrero: '#c23a4c', barba: 'candado', anteojos: false },
  { nombre: 'Don Chacho', piel: '#f0c0a0', pielOsc: '#c8906a', pelo: '#ece6da', cejas: '#b8b0a0', peinado: 'boina', sombrero: '#c23a4c', barba: 'bigotazo', anteojos: true },
  { nombre: 'Anselmo', piel: '#e8b08a', pielOsc: '#b8805a', pelo: '#8a8a8a', cejas: '#5a5a5a', peinado: 'pelado', sombrero: '', barba: 'bigote', anteojos: true },
  { nombre: 'Tobías', piel: '#f6c9a4', pielOsc: '#d09a70', pelo: '#c8843a', cejas: '#8a5a2b', peinado: 'rulos', sombrero: '', barba: 'nada', anteojos: false },
  { nombre: 'Severino', piel: '#b8805a', pielOsc: '#8a5a3a', pelo: '#2a1a10', cejas: '#2a1a10', peinado: 'chambergo', sombrero: '#4a3020', barba: 'completa', anteojos: false },
  { nombre: 'Martín', piel: '#e2a878', pielOsc: '#b07a4a', pelo: '#6a3d1c', cejas: '#4a2a10', peinado: 'vincha', sombrero: '#ffc93c', barba: 'bigote', anteojos: false },
  { nombre: 'Don Eusebio', piel: '#f2c4a8', pielOsc: '#c8946e', pelo: '#f4f1e8', cejas: '#c8c0b0', peinado: 'pelado', sombrero: '', barba: 'larga', anteojos: true },
];

const W = 32, H = 36;
type Capa = Map<number, string>; // índice y*W+x → color
const nueva = (): Capa => new Map();
const pon = (c: Capa, x: number, y: number, color: string) => { if (x >= 0 && x < W && y >= 0 && y < H) c.set(y * W + x, color); };
const caja = (c: Capa, x0: number, y0: number, x1: number, y1: number, color: string) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) pon(c, x, y, color); };
function elipse(c: Capa, cx: number, cy: number, rx: number, ry: number, color: string, filtro: (x: number, y: number) => boolean = () => true) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1 && filtro(x, y)) pon(c, x, y, color);
    }
}
/** Agrega contorno de 1 píxel alrededor de lo pintado. */
function contorno(c: Capa, color = PALETA.k): Capa {
  const out = new Map(c);
  for (const i of c.keys()) {
    const x = i % W, y = Math.floor(i / W);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < W && ny >= 0 && ny < H && !c.has(ny * W + nx)) out.set(ny * W + nx, color);
    }
  }
  return out;
}
function rects(c: Capa): string {
  let s = '';
  for (let y = 0; y < H; y++) {
    let x = 0;
    while (x < W) {
      const color = c.get(y * W + x);
      if (!color) { x++; continue; }
      let j = x;
      while (j < W && c.get(y * W + j) === color) j++;
      s += rect(x, y, j - x, 1, color);
      x = j;
    }
  }
  return s;
}

/**
 * SVG de un personaje. Capas con clase para las señas:
 * .ojo-i/.ojo-d (abiertos) y .ojo-i-c/.ojo-d-c (cerrados), .cejas / .cejas-arriba,
 * .boca (normal), .boca-der, .boca-izq, .boca-muerde, .boca-trompa, .boca-abierta, y .cabeza para inclinarla.
 */
export function personajeSVG(p: Personaje, colorEquipo: string): string {
  const K = PALETA.k;
  // --- Cuerpo: camiseta de club a rayas con el color del equipo
  const cuerpo = nueva();
  for (let y = 27; y < H; y++) {
    const [x0, x1] = y === 27 ? [9, 22] : y === 28 ? [6, 25] : [3, 28];
    for (let x = x0; x <= x1; x++) pon(cuerpo, x, y, x % 4 < 2 ? colorEquipo : PALETA.papel);
  }
  caja(cuerpo, 13, 23, 18, 27, p.pielOsc); // cuello
  for (let x = 12; x <= 19; x++) pon(cuerpo, x, 27, K); // cuello de la camiseta
  pon(cuerpo, 14, 28, K); pon(cuerpo, 17, 28, K); pon(cuerpo, 15, 29, K); pon(cuerpo, 16, 29, K);
  caja(cuerpo, 15, 28, 16, 28, p.pielOsc);

  // --- Cabeza
  const cab = nueva();
  const enCara = (x: number, y: number) => { const dx = (x + 0.5 - 16) / 8.5, dy = (y + 0.5 - 15) / 9.5; return dx * dx + dy * dy <= 1; };
  elipse(cab, 16, 15, 8.5, 9.5, p.piel);
  caja(cab, 6, 14, 7, 17, p.piel); caja(cab, 24, 14, 25, 17, p.piel); // orejas
  pon(cab, 7, 15, p.pielOsc); pon(cab, 24, 15, p.pielOsc);
  for (let y = 6; y <= 24; y++) for (let x = 8; x <= 24; x++) if (enCara(x, y) && !enCara(x + 1, y)) pon(cab, x, y, p.pielOsc); // sombra lateral
  caja(cab, 15, 16, 16, 18, p.pielOsc); pon(cab, 15, 16, p.piel); // nariz
  pon(cab, 10, 18, '#f08a80'); pon(cab, 21, 18, '#f08a80'); // cachetes

  // Barba (va en la base de la cabeza, debajo de las bocas)
  const pelo = p.pelo;
  if (p.barba === 'completa' || p.barba === 'larga') {
    for (let y = 17; y <= 25; y++) for (let x = 6; x <= 25; x++) {
      const enBoca = x >= 13 && x <= 18 && y >= 20 && y <= 22;
      if (cab.has(y * W + x) && !enBoca && (x <= 10 || x >= 21 || y >= 22)) pon(cab, x, y, pelo);
    }
    if (p.barba === 'larga') elipse(cab, 16, 25, 6, 5, pelo);
  }
  if (p.barba === 'candado') caja(cab, 14, 23, 17, 24, pelo);
  // Bigotes
  if (p.barba === 'bigote' || p.barba === 'candado' || p.barba === 'completa' || p.barba === 'larga') {
    caja(cab, 12, 19, 19, 19, pelo); pon(cab, 11, 20, pelo); pon(cab, 20, 20, pelo);
  }
  if (p.barba === 'bigotazo') { caja(cab, 10, 19, 21, 20, pelo); pon(cab, 9, 21, pelo); pon(cab, 22, 21, pelo); caja(cab, 15, 19, 16, 19, p.pielOsc); }

  // Pelo y sombreros
  const s = p.sombrero;
  const lados = (y0: number, y1: number) => { caja(cab, 7, y0, 8, y1, pelo); caja(cab, 23, y0, 24, y1, pelo); };
  switch (p.peinado) {
    case 'pelado': lados(11, 16); pon(cab, 13, 7, '#ffffff'); pon(cab, 14, 7, '#ffffff'); break;
    case 'boina': lados(10, 14); elipse(cab, 15.5, 7, 10.5, 3.4, s); caja(cab, 16, 2, 16, 3, s); for (let x = 7; x <= 24; x++) pon(cab, x, 9, s); break;
    case 'gorra': lados(10, 13); elipse(cab, 16, 9, 8.8, 5, s, (_x, y) => y <= 9); caja(cab, 16, 9, 27, 10, s); caja(cab, 14, 4, 15, 4, '#ffffff'); break;
    case 'chambergo': lados(10, 13); caja(cab, 3, 8, 28, 9, s); caja(cab, 9, 2, 22, 8, s); caja(cab, 9, 6, 22, 7, K); break;
    case 'vincha': elipse(cab, 16, 9, 9.5, 5.5, pelo, (_x, y) => y <= 11); caja(cab, 5, 10, 8, 23, pelo); caja(cab, 23, 10, 26, 23, pelo); caja(cab, 7, 9, 24, 10, s); break;
    case 'rulos': for (const [x, y] of [[8, 9], [11, 6], [15, 5], [19, 5], [22, 7], [24, 10], [7, 12], [13, 8], [18, 8]]) elipse(cab, x, y, 2.8, 2.6, pelo); break;
    case 'corto': elipse(cab, 16, 9, 9, 5, pelo, (_x, y) => y <= 10); lados(10, 15); break;
  }

  // --- Capas de la cara (se prenden con CSS)
  const capa = (f: (c: Capa) => void) => { const c = nueva(); f(c); return rects(c); };
  const ojo = (x: number) => capa((c) => { caja(c, x, 14, x + 1, 15, K); pon(c, x, 14, '#ffffff'); });
  const ojoCerrado = (x: number) => capa((c) => caja(c, x - 1, 15, x + 2, 15, K));
  const cejas = (y: number) => capa((c) => { caja(c, 10, y, 13, y, p.cejas); caja(c, 18, y, 21, y, p.cejas); });
  const B = '#5a1626', ROJO = '#e04a5a';
  const bocas: Record<string, string> = {
    boca: capa((c) => caja(c, 14, 21, 17, 21, K)),
    'boca-der': capa((c) => { caja(c, 16, 21, 18, 21, K); pon(c, 19, 20, K); }),
    'boca-izq': capa((c) => { caja(c, 13, 21, 15, 21, K); pon(c, 12, 20, K); }),
    'boca-muerde': capa((c) => { caja(c, 14, 21, 17, 21, '#ffffff'); caja(c, 14, 22, 17, 22, ROJO); }),
    'boca-trompa': capa((c) => { caja(c, 15, 21, 16, 22, ROJO); pon(c, 15, 21, K); }),
    'boca-abierta': capa((c) => { caja(c, 14, 21, 17, 23, B); caja(c, 15, 23, 16, 23, ROJO); }),
  };
  const anteojos = p.anteojos ? capa((c) => {
    for (const x0 of [9, 17]) { caja(c, x0, 13, x0 + 5, 13, K); caja(c, x0, 16, x0 + 5, 16, K); caja(c, x0, 13, x0, 16, K); caja(c, x0 + 5, 13, x0 + 5, 16, K); }
    caja(c, 15, 14, 16, 14, K);
  }) : '';

  return svg(W, H, `
    <g class="respira">
      <g class="cuerpo">${rects(contorno(cuerpo))}</g>
      <g class="cabeza">
        ${rects(contorno(cab))}
        <g class="capa ojo-i parpadeo">${ojo(11)}</g><g class="capa ojo-d parpadeo">${ojo(19)}</g>
        <g class="capa ojo-i-c">${ojoCerrado(11)}</g><g class="capa ojo-d-c">${ojoCerrado(19)}</g>
        <g class="capa cejas">${cejas(12)}</g><g class="capa cejas-arriba">${cejas(10)}</g>
        ${Object.entries(bocas).map(([k, v]) => `<g class="capa ${k}">${v}</g>`).join('')}
        ${anteojos}
      </g>
    </g>`, ' preserveAspectRatio="xMidYMax meet"');
}
