/*
 * Baraja española en pixel art (grilla de 64x96). Sprites dibujados a mano, sin filtros:
 * así cada palo se lee nítido aunque la carta sea chica.
 *
 * Cada letra de un sprite es un color; se pinta con una clase (.px-k, .px-y, ...) para que
 * la paleta salga de variables CSS. "x"/"X" toman el color del palo de la carta.
 */
import type { Carta, Palo } from './arte';

type Sprite = string[];

// --------------------------------------------------------------- Sprites de los palos (12x12)
const PALO: Record<Palo, Sprite> = {
  espada: [
    '.....kk.....',
    '....kmsk....',
    '....kmsk....',
    '....kmsk....',
    '....kmsk....',
    '....kmsk....',
    '.kkkkmskkkk.',
    '.kyybbbbyyk.',
    '.kkkkbBkkkk.',
    '....kbBk....',
    '...kyyyYk...',
    '....kkkk....',
  ],
  basto: [
    '....kkk.....',
    '...khook....',
    '...khoOk.kk.',
    '...khoOkkggk',
    '...kOoOk.kk.',
    'kk..khok....',
    'kgk.khOk....',
    'kGgkkhok....',
    '.kk.khOk....',
    '....khok....',
    '....kOOk....',
    '.....kk.....',
  ],
  oro: [
    '...kkkkkk...',
    '..kyyyyyyk..',
    '.kyllyyyyYk.',
    'kylyyyyyyyYk',
    'kyyykyykyyYk',
    'kyyyyyyyyyYk',
    'kyykyyyykyYk',
    'kyyykkkkyyYk',
    'kyyyyyyyyYYk',
    '.kYyyyyyYYk.',
    '..kYYYYYYk..',
    '...kkkkkk...',
  ],
  copa: [
    'kkkkkkkkkkkk',
    'kyyyyyyyyyYk',
    'kkkkkkkkkkkk',
    '.krrrrrrrRk.',
    '.krrrkkrrRk.',
    '.krrkcckrRk.',
    '..krrkkrRk..',
    '...krrrRk...',
    '....kyYk....',
    '....kyYk....',
    '..kkyyyYkk..',
    '..kkkkkkkk..',
  ],
};

// Íconos chicos para las esquinas (7x7)
const MINI: Record<Palo, Sprite> = {
  espada: ['...k...', '..kmk..', '..kmk..', '..kmk..', '.kkkkk.', '..kbk..', '..kyk..'],
  basto: ['..kk...', '.khok..', '.kOokgk', '..kok..', '..kOk..', '..kok..', '...k...'],
  oro: ['..kkk..', '.kyyyk.', 'kylyyYk', 'kyyyyYk', 'kyyyYYk', '.kYYYk.', '..kkk..'],
  copa: ['kkkkkkk', 'krrrrRk', '.krcRk.', '..krk..', '...k...', '..kyk..', '.kkkkk.'],
};

// Figuras (bustos de 12x16): sota, caballo y rey
const FIGURA: Record<number, Sprite> = {
  10: [
    '............', '...kkkkk....', '..kxxxxxk...', '..kxxxxxxk..', '..knpppnk...', '..kpkpkpk...',
    '..kpppppk...', '..kppkppk...', '...kpppk....', '....kpk.....', '.kkkkkkkkk..', 'kxxxxyxxxxk.',
    'kxXxxyxxXxk.', 'kxXxxyxxXxk.', 'kxxxxyxxxxk.', 'kkkkkkkkkkk.',
  ],
  11: [
    '....kk.kk...', '...knnknnk..', '...knnnnnk..', '..knnnnnnk..', '..knknnnnk..', '.knnnnnnnk..',
    'knnnnnnnnk..', 'knnnnknnnk..', 'kknnk.knnk..', '..kk..knnk..', '......knnk..', '....kxxxxxk.',
    '...kxyxyxyk.', '...kxxxxxxk.', '...knnnnnnk.', '...kkkkkkkk.',
  ],
  12: [
    '...y.y.y....', '..kyyyyyk...', '..kyryryk...', '..kkkkkkk...', '..kpppppk...', '..kpkpkpk...',
    '..kpppppk...', '..keeeeek...', '..keekeek...', '...keeek....', '.kkkkkkkkk..', 'kxxxxyxxxxk.',
    'kxXxxyxxXxk.', 'kxXxxyxxXxk.', 'kxxxxyxxxxk.', 'kkkkkkkkkkk.',
  ],
};

// Números de 3x5
const DIGITO: Record<string, Sprite> = {
  0: ['xxx', 'x.x', 'x.x', 'x.x', 'xxx'], 1: ['.x.', 'xx.', '.x.', '.x.', 'xxx'], 2: ['xx.', '..x', '.x.', 'x..', 'xxx'],
  3: ['xx.', '..x', '.x.', '..x', 'xx.'], 4: ['x.x', 'x.x', 'xxx', '..x', '..x'], 5: ['xxx', 'x..', 'xx.', '..x', 'xx.'],
  6: ['.xx', 'x..', 'xxx', 'x.x', 'xxx'], 7: ['xxx', '..x', '.x.', '.x.', '.x.'],
};

/** Convierte un sprite en rects (une los píxeles iguales de cada fila para no generar miles). */
function sprite(s: Sprite, x0: number, y0: number, escala = 1, mapa: Record<string, string> = {}): string {
  let out = '';
  s.forEach((fila, y) => {
    let i = 0;
    while (i < fila.length) {
      const c = fila[i];
      let j = i;
      while (j < fila.length && fila[j] === c) j++;
      if (c !== '.' && c !== ' ') {
        const clase = mapa[c] ?? c;
        out += `<rect class="px-${clase}" x="${x0 + i * escala}" y="${y0 + y * escala}" width="${(j - i) * escala}" height="${escala}"/>`;
      }
      i = j;
    }
  });
  return out;
}

const CORTES: Record<Palo, number> = { oro: 0, copa: 1, espada: 2, basto: 3 };
// Posiciones (esquina superior izquierda) de los palos de 12x12 dentro de la carta
const L = 19, R = 33, C = 26;
const PIPS: Record<number, [number, number][]> = {
  2: [[C, 16], [C, 68]],
  3: [[C, 12], [C, 42], [C, 72]],
  4: [[L, 16], [R, 16], [L, 68], [R, 68]],
  5: [[L, 14], [R, 14], [C, 42], [L, 70], [R, 70]],
  6: [[L, 10], [R, 10], [L, 42], [R, 42], [L, 74], [R, 74]],
  7: [[L, 10], [R, 10], [C, 26], [L, 42], [R, 42], [L, 74], [R, 74]],
};

/** Marco tradicional con las "pintas" (cortes) según el palo. */
function marco(p: Palo): string {
  const x0 = 4, x1 = 59, y0 = 4, y1 = 91, hueco = 4;
  let s = `<rect class="px-x" x="${x0}" y="${y0}" width="1" height="${y1 - y0 + 1}"/><rect class="px-x" x="${x1}" y="${y0}" width="1" height="${y1 - y0 + 1}"/>`;
  for (const y of [y0, y1]) {
    const n = CORTES[p];
    let desde = x0;
    for (let i = 1; i <= n; i++) {
      const cx = Math.round(x0 + ((x1 - x0) * i) / (n + 1));
      s += `<rect class="px-x" x="${desde}" y="${y}" width="${cx - hueco / 2 - desde}" height="1"/>`;
      desde = cx + hueco / 2;
    }
    s += `<rect class="px-x" x="${desde}" y="${y}" width="${x1 + 1 - desde}" height="1"/>`;
  }
  return s;
}

/** Borde de la carta con esquinas escalonadas, papel y brillo. */
function cuerpo(papel: string, borde = 'k'): string {
  return `
    <rect class="px-${papel}" x="2" y="1" width="60" height="94"/><rect class="px-${papel}" x="1" y="2" width="62" height="92"/>
    <rect class="px-${borde}" x="2" y="0" width="60" height="1"/><rect class="px-${borde}" x="2" y="95" width="60" height="1"/>
    <rect class="px-${borde}" x="0" y="2" width="1" height="92"/><rect class="px-${borde}" x="63" y="2" width="1" height="92"/>
    <rect class="px-${borde}" x="1" y="1" width="1" height="1"/><rect class="px-${borde}" x="62" y="1" width="1" height="1"/>
    <rect class="px-${borde}" x="1" y="94" width="1" height="1"/><rect class="px-${borde}" x="62" y="94" width="1" height="1"/>
    <rect class="px-luz" x="2" y="2" width="58" height="1"/><rect class="px-luz" x="2" y="2" width="1" height="90"/>
    <rect class="px-sombra" x="3" y="93" width="59" height="1"/><rect class="px-sombra" x="61" y="3" width="1" height="91"/>`;
}

function indice(c: Carta): string {
  const txt = String(c.n);
  let s = '';
  txt.split('').forEach((d, i) => (s += sprite(DIGITO[d], 7 + i * 7, 7, 2, { x: 'X' })));
  s += sprite(MINI[c.palo], 7, 19);
  return s;
}

/** Rayos de píxeles detrás de los anchos (espada y basto). */
function rayos(): string {
  let s = '';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    for (const r of [22, 26, 30]) {
      if ((r === 30) !== (i % 2 === 0)) continue;
      const x = Math.round(32 + Math.cos(a) * r), y = Math.round(48 + Math.sin(a) * r * 1.05);
      s += `<rect class="px-rayo" x="${x - 1}" y="${y - 1}" width="2" height="2"/>`;
    }
  }
  return s;
}

export function cartaPixelSVG(c: Carta): string {
  let centro = '';
  if (c.n === 1) {
    if (c.palo === 'espada' || c.palo === 'basto') centro += rayos();
    centro += sprite(PALO[c.palo], 14, 30, 3);
  } else if (c.n >= 10) {
    centro += sprite(FIGURA[c.n], 20, 14, 2) + sprite(PALO[c.palo], C, 66);
  } else {
    centro = PIPS[c.n].map(([x, y]) => sprite(PALO[c.palo], x, y)).join('');
  }
  return `<svg class="svg-pixel palo-${c.palo}" viewBox="0 0 64 96" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    ${cuerpo('papel')}
    ${marco(c.palo)}
    ${indice(c)}
    <g transform="rotate(180 32 48)">${indice(c)}</g>
    ${centro}
  </svg>`;
}

export function dorsoPixelSVG(): string {
  let rombos = '';
  for (let y = 6; y < 90; y += 8) for (let x = 6 + ((y / 8) % 2) * 4; x < 58; x += 8) rombos += `<rect class="px-dorso2" x="${x}" y="${y}" width="2" height="2"/>`;
  return `<svg class="svg-pixel" viewBox="0 0 64 96" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    ${cuerpo('dorso')}
    ${rombos}
    <rect class="px-y" x="5" y="5" width="54" height="1"/><rect class="px-y" x="5" y="90" width="54" height="1"/>
    <rect class="px-y" x="5" y="5" width="1" height="86"/><rect class="px-y" x="58" y="5" width="1" height="86"/>
    <rect class="px-dorso" x="18" y="34" width="28" height="28"/>
    ${sprite(PALO.oro, 20, 36, 2)}
  </svg>`;
}
