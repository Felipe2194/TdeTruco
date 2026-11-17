/* Gauchos ilustrados en SVG. Las partes animables (ojos, cejas, boca, cabeza) llevan clases para las señas. */

export type Sombrero = 'chambergo' | 'boina' | 'vincha' | 'copa' | 'ala';
export type Barba = 'bigotazo' | 'candado' | 'completa' | 'patillas' | 'afeitado';

export interface Gaucho {
  nombre: string;
  sombrero: Sombrero;
  sombreroColor: string;
  cinta: string;
  barba: Barba;
  poncho: string;
  guarda: string;
  piel: string;
  pelo: string;
  cejas: string;
  rx: number;
  ry: number;
  nariz: 'grande' | 'chica';
  arrugas?: boolean;
}

export const COLOR_EQUIPO = ['#6fa8dc', '#c0392b'] as const;
export const NOMBRE_EQUIPO = ['Celeste', 'Colorado'] as const;

export const GAUCHOS: Gaucho[] = [
  { nombre: 'Ramón', sombrero: 'boina', sombreroColor: '#1c2533', cinta: '#1c2533', barba: 'candado', poncho: '#2c4f7c', guarda: '#efe6d0', piel: '#e8b48c', pelo: '#5a3418', cejas: '#5a3418', rx: 55, ry: 57, nariz: 'chica' },
  { nombre: 'Facundo', sombrero: 'chambergo', sombreroColor: '#1d1712', cinta: '#7b1e2b', barba: 'bigotazo', poncho: '#8e2a22', guarda: '#1d1712', piel: '#c98f62', pelo: '#1d1712', cejas: '#1d1712', rx: 50, ry: 60, nariz: 'grande' },
  { nombre: 'Don Chacho', sombrero: 'vincha', sombreroColor: '#b3261e', cinta: '#b3261e', barba: 'completa', poncho: '#7a5a3a', guarda: '#b3261e', piel: '#a8714a', pelo: '#d9d3c7', cejas: '#cfc8ba', rx: 48, ry: 63, nariz: 'grande', arrugas: true },
  { nombre: 'Anselmo', sombrero: 'copa', sombreroColor: '#5a3a22', cinta: '#c9a227', barba: 'patillas', poncho: '#55623a', guarda: '#d9a441', piel: '#d9a27a', pelo: '#3a2414', cejas: '#3a2414', rx: 52, ry: 62, nariz: 'grande' },
  { nombre: 'Tobías', sombrero: 'ala', sombreroColor: '#d8c08a', cinta: '#5a3a22', barba: 'afeitado', poncho: '#c98f2a', guarda: '#5a3418', piel: '#f0c39d', pelo: '#8a5a2b', cejas: '#8a5a2b', rx: 50, ry: 56, nariz: 'chica' },
  { nombre: 'Severino', sombrero: 'chambergo', sombreroColor: '#6b4a2b', cinta: '#1d1712', barba: 'completa', poncho: '#6d6e70', guarda: '#6fa8dc', piel: '#b57d55', pelo: '#1d1712', cejas: '#1d1712', rx: 53, ry: 60, nariz: 'chica' },
  { nombre: 'Martín', sombrero: 'boina', sombreroColor: '#9b2335', cinta: '#9b2335', barba: 'bigotazo', poncho: '#6d1e2b', guarda: '#efe6d0', piel: '#e2a878', pelo: '#6a3d1c', cejas: '#6a3d1c', rx: 51, ry: 58, nariz: 'chica' },
  { nombre: 'Don Eusebio', sombrero: 'copa', sombreroColor: '#1d1712', cinta: '#9b2335', barba: 'candado', poncho: '#232323', guarda: '#d9a441', piel: '#c48a5e', pelo: '#e8e2d6', cejas: '#d8d2c6', rx: 50, ry: 61, nariz: 'grande', arrugas: true },
];

const L = '#2b1a10';
const PONCHO = 'M-8 272 Q-2 198 100 184 Q202 198 208 272 Z';

export function gauchoSVG(g: Gaucho, panuelo: string, id: string): string {
  const { rx, ry, pelo, cejas, piel } = g;
  let zig = '';
  for (let x = -10, i = 0; x <= 212; x += 14, i++) zig += `${x},${i % 2 ? 262 : 250} `;

  const peloAtras = g.sombrero === 'vincha'
    ? `<path d="M46 84 Q34 170 58 200 L142 200 Q166 170 154 84Z" fill="${pelo}" stroke="${L}" stroke-width="3"/>` : '';

  const barbas: Record<Barba, string> = {
    completa: `<path d="M${100 - rx + 3} 104 Q${100 - rx + 4} 170 100 ${100 + ry + 26} Q${100 + rx - 4} 170 ${100 + rx - 3} 104
      Q${100 + rx - 12} 148 122 152 Q100 160 78 152 Q${100 - rx + 12} 148 ${100 - rx + 3} 104Z" fill="${pelo}" stroke="${L}" stroke-width="3"/>
      <path d="M84 168 q4 8 0 14 M100 172 q3 8 0 16 M116 168 q-4 8 0 14" stroke="${L}" stroke-opacity=".3" stroke-width="2" fill="none"/>`,
    candado: `<path d="M84 150 Q100 182 116 150 Q100 160 84 150Z" fill="${pelo}" stroke="${L}" stroke-width="2.5"/>`,
    bigotazo: `<path d="M${100 - rx + 6} 120 Q${100 - rx + 10} 150 82 156 M${100 + rx - 6} 120 Q${100 + rx - 10} 150 118 156"
      stroke="${pelo}" stroke-opacity=".35" stroke-width="7" fill="none"/>`,
    patillas: `<path d="M${100 - rx + 4} 82 L${100 - rx + 6} 132 Q${100 - rx + 14} 140 ${100 - rx + 18} 128 L${100 - rx + 14} 84Z
      M${100 + rx - 4} 82 L${100 + rx - 6} 132 Q${100 + rx - 14} 140 ${100 + rx - 18} 128 L${100 + rx - 14} 84Z" fill="${pelo}" stroke="${L}" stroke-width="2.5"/>`,
    afeitado: '',
  };
  const bigotes: Record<Barba, string> = {
    completa: `<path d="M-24 -7 Q-10 -18 0 -12 Q10 -18 24 -7 Q12 -2 0 -6 Q-12 -2 -24 -7Z" fill="${pelo}" stroke="${L}" stroke-width="2.5"/>`,
    candado: `<path d="M-19 -8 Q0 -17 19 -8 Q8 -6 0 -9 Q-8 -6 -19 -8Z" fill="${pelo}" stroke="${L}" stroke-width="2.5"/>`,
    bigotazo: `<path d="M-36 -14 Q-38 -4 -28 -3 Q-18 -2 -10 -9 Q-4 -15 0 -11 Q4 -15 10 -9 Q18 -2 28 -3 Q38 -4 36 -14
      Q30 -6 22 -9 Q12 -16 0 -15 Q-12 -16 -22 -9 Q-30 -6 -36 -14Z" fill="${pelo}" stroke="${L}" stroke-width="2.5"/>`,
    patillas: `<path d="M-16 -9 Q0 -15 16 -9 Q0 -11 -16 -9Z" fill="${pelo}" stroke="${L}" stroke-width="2.5"/>`,
    afeitado: '',
  };
  const s = g.sombreroColor;
  const sombreros: Record<Sombrero, string> = {
    chambergo: `
      <ellipse cx="100" cy="56" rx="98" ry="17" fill="${s}" stroke="${L}" stroke-width="3"/>
      <path d="M50 58 Q48 6 100 4 Q152 6 150 58Z" fill="${s}" stroke="${L}" stroke-width="3"/>
      <path d="M49 44 Q100 34 151 44 L151 56 Q100 46 49 56Z" fill="${g.cinta}" stroke="${L}" stroke-width="2.5"/>
      <path d="M70 14 Q100 6 120 12" stroke="#fff" stroke-opacity=".12" stroke-width="6" fill="none"/>`,
    boina: `
      <path d="M50 74 Q46 60 56 54 Q60 70 64 80Z M150 74 Q154 60 144 54 Q140 70 136 80Z" fill="${pelo}"/>
      <ellipse cx="96" cy="50" rx="64" ry="22" transform="rotate(-8 96 50)" fill="${s}" stroke="${L}" stroke-width="3"/>
      <path d="M44 64 Q100 50 154 58" stroke="${L}" stroke-width="7" fill="none"/>
      <path d="M44 64 Q100 50 154 58" stroke="${s}" stroke-width="4" fill="none"/>
      <path d="M98 29 L103 18" stroke="${L}" stroke-width="5" stroke-linecap="round"/>`,
    vincha: `
      <path d="M48 94 Q42 34 100 32 Q158 34 152 94 Q146 64 128 60 Q100 70 72 60 Q54 64 48 94Z" fill="${pelo}" stroke="${L}" stroke-width="3"/>
      <path d="M47 70 Q100 56 153 70 L153 84 Q100 70 47 84Z" fill="${g.cinta}" stroke="${L}" stroke-width="2.5"/>
      <path d="M48 76 Q30 96 36 130 L44 128 Q40 100 52 82Z" fill="${g.cinta}" stroke="${L}" stroke-width="2.5"/>`,
    copa: `
      <path d="M50 76 Q46 64 54 58 Q58 70 62 82Z M150 76 Q154 64 146 58 Q142 70 138 82Z" fill="${pelo}"/>
      <ellipse cx="100" cy="62" rx="74" ry="12" fill="${s}" stroke="${L}" stroke-width="3"/>
      <path d="M62 62 L66 -4 Q100 -12 134 -4 L138 62Z" fill="${s}" stroke="${L}" stroke-width="3"/>
      <path d="M64 44 L136 44 L137 56 L63 56Z" fill="${g.cinta}" stroke="${L}" stroke-width="2.5"/>
      <path d="M76 2 L78 40" stroke="#fff" stroke-opacity=".12" stroke-width="7"/>`,
    ala: `
      <ellipse cx="100" cy="58" rx="84" ry="14" fill="${s}" stroke="${L}" stroke-width="3"/>
      <path d="M56 58 Q58 16 100 14 Q142 16 144 58Z" fill="${s}" stroke="${L}" stroke-width="3"/>
      <path d="M57 46 Q100 38 143 46 L143 55 Q100 48 57 55Z" fill="${g.cinta}" stroke="${L}" stroke-width="2.5"/>
      <path d="M70 26 Q100 18 128 24 M62 52 Q100 44 138 52" stroke="${L}" stroke-opacity=".18" stroke-width="2" fill="none"/>`,
  };
  const nariz = g.nariz === 'grande'
    ? `<path d="M100 100 Q86 126 96 132 Q104 136 112 128" fill="none" stroke="${L}" stroke-width="3.2" stroke-linecap="round"/>`
    : `<path d="M101 108 Q94 122 100 125 Q105 126 107 122" fill="none" stroke="${L}" stroke-width="3" stroke-linecap="round"/>`;
  const arrugas = g.arrugas
    ? `<path d="M80 70 Q100 64 120 70 M84 62 Q100 57 116 62" stroke="${L}" stroke-opacity=".35" stroke-width="2" fill="none"/>
       <path d="M60 102 l-8 -3 M60 108 l-8 1 M140 102 l8 -3 M140 108 l8 1" stroke="${L}" stroke-opacity=".35" stroke-width="2"/>` : '';

  return `
  <svg viewBox="-12 -24 224 300" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="cp-${id}"><path d="${PONCHO}"/></clipPath></defs>
    <g class="respira">
      <rect x="84" y="146" width="32" height="44" rx="10" fill="${piel}" stroke="${L}" stroke-width="3"/>
      <path d="${PONCHO}" fill="${g.poncho}" stroke="${L}" stroke-width="3"/>
      <g clip-path="url(#cp-${id})">
        <path d="M30 200 Q36 240 30 280 M170 200 Q164 240 170 280 M100 220 L100 280" stroke="#000" stroke-opacity=".15" stroke-width="3" fill="none"/>
        <rect x="-20" y="238" width="260" height="8" fill="${g.guarda}"/>
        <polyline points="${zig}" fill="none" stroke="${g.guarda}" stroke-width="4"/>
        <rect x="-20" y="266" width="260" height="6" fill="${g.guarda}"/>
      </g>
      <path d="M72 182 L128 182 L100 226 Z" fill="${panuelo}" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="100" cy="188" r="7" fill="${panuelo}" stroke="${L}" stroke-width="2.5"/>
      <g class="cabeza">
        ${peloAtras}
        <ellipse cx="${100 - rx + 3}" cy="106" rx="10" ry="15" fill="${piel}" stroke="${L}" stroke-width="3"/>
        <ellipse cx="${100 + rx - 3}" cy="106" rx="10" ry="15" fill="${piel}" stroke="${L}" stroke-width="3"/>
        <ellipse cx="100" cy="100" rx="${rx}" ry="${ry}" fill="${piel}" stroke="${L}" stroke-width="3"/>
        ${barbas[g.barba]}
        ${arrugas}
        <circle cx="70" cy="124" r="10" fill="#d8644a" opacity=".25"/>
        <circle cx="130" cy="124" r="10" fill="#d8644a" opacity=".25"/>
        <g transform="translate(78 102)"><g class="anim ojo ojo-i"><g class="parpadeo">
          <ellipse rx="10" ry="11" fill="#fff" stroke="${L}" stroke-width="2.5"/><circle cx="1" cy="1" r="5.5" fill="${L}"/><circle cx="3" cy="-2" r="1.8" fill="#fff"/>
        </g></g></g>
        <g transform="translate(122 102)"><g class="anim ojo ojo-d"><g class="parpadeo">
          <ellipse rx="10" ry="11" fill="#fff" stroke="${L}" stroke-width="2.5"/><circle cx="-1" cy="1" r="5.5" fill="${L}"/><circle cx="1" cy="-2" r="1.8" fill="#fff"/>
        </g></g></g>
        <g transform="translate(78 82)"><path class="anim ceja ceja-i" d="M-15 3 Q-2 -7 14 -1 L14 4 Q-2 -2 -15 7Z" fill="${cejas}" stroke="${L}" stroke-width="1.5"/></g>
        <g transform="translate(122 82)"><path class="anim ceja ceja-d" d="M15 3 Q2 -7 -14 -1 L-14 4 Q2 -2 15 7Z" fill="${cejas}" stroke="${L}" stroke-width="1.5"/></g>
        ${nariz}
        <g transform="translate(100 142)"><g class="anim boca">
          <rect x="-38" y="-20" width="76" height="40" fill="none"/>
          <path class="anim bv normal" d="M-13 -1 Q0 7 13 -1" fill="none" stroke="${L}" stroke-width="3.5" stroke-linecap="round"/>
          <g class="anim bv mordida">
            <path d="M-14 -2 Q0 8 14 -2" fill="#9a2e2e" stroke="${L}" stroke-width="3" stroke-linecap="round"/>
            <rect x="-9" y="-3" width="18" height="6" rx="2" fill="#fff" stroke="${L}" stroke-width="2"/>
          </g>
          <g class="anim bv pico">
            <ellipse cx="0" cy="1" rx="6" ry="7.5" fill="#c0504a" stroke="${L}" stroke-width="3"/>
            <path d="M-3 1 Q0 3 3 1" stroke="${L}" stroke-width="2" fill="none"/>
          </g>
          <g class="anim bv abierta">
            <ellipse cx="0" cy="4" rx="12" ry="11" fill="#3a0e0e" stroke="${L}" stroke-width="3"/>
            <ellipse cx="0" cy="10" rx="7" ry="4" fill="#d0605a"/>
          </g>
          ${bigotes[g.barba]}
        </g></g>
        ${sombreros[g.sombrero]}
      </g>
    </g>
  </svg>`;
}

export const SENAS = [
  { k: 'anchoEspada', nombre: 'Ancho de espada', gesto: 'Levantar las cejas' },
  { k: 'anchoBasto', nombre: 'Ancho de basto', gesto: 'Guiñar un ojo' },
  { k: 'sieteEspada', nombre: '7 de espada', gesto: 'Boca torcida a la derecha' },
  { k: 'sieteOro', nombre: '7 de oro', gesto: 'Boca torcida a la izquierda' },
  { k: 'tres', nombre: 'Un 3', gesto: 'Morder el labio' },
  { k: 'dos', nombre: 'Un 2', gesto: 'Trompita' },
  { k: 'anchoFalso', nombre: 'Ancho falso', gesto: 'Abrir la boca' },
  { k: 'envido', nombre: 'Tengo envido', gesto: 'Inclinar la cabeza' },
  { k: 'nada', nombre: 'Nada', gesto: 'Cerrar los ojos' },
] as const;
