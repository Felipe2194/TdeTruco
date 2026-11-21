/*
 * Arte del mockup en SVG. Todos los colores salen de variables CSS, así cada estilo
 * repinta cartas, personaje, mate y anotador sin volver a dibujar nada.
 */

export type Palo = 'espada' | 'basto' | 'oro' | 'copa';
export interface Carta { n: number; palo: Palo }

// --------------------------------------------------------------- Palos (caja de 100x100)
const PALOS: Record<Palo, string> = {
  espada: `
    <path class="f-metal pl" d="M50 4 L58 18 L58 63 L42 63 L42 18 Z"/>
    <path class="pl-fina" d="M50 14 V60"/>
    <path class="f-esp pl" d="M26 62 H74 Q78 67 74 72 H26 Q22 67 26 62Z"/>
    <rect class="f-mango pl" x="44" y="72" width="12" height="15" rx="3"/>
    <circle class="f-esp pl" cx="50" cy="91" r="6.5"/>`,
  basto: `
    <path class="f-bas pl" d="M43 94 Q39 64 36 34 Q33 9 50 7 Q68 9 64 34 Q61 64 57 94 Z"/>
    <ellipse class="f-bas-osc" cx="47" cy="30" rx="4" ry="3"/><ellipse class="f-bas-osc" cx="55" cy="52" rx="3.5" ry="2.6"/>
    <ellipse class="f-bas-osc" cx="46" cy="70" rx="3" ry="2.4"/>
    <path class="f-hoja pl" d="M62 26 Q76 14 84 22 Q74 32 62 26Z"/>
    <path class="f-hoja pl" d="M38 54 Q24 44 16 52 Q26 62 38 54Z"/>`,
  oro: `
    <circle class="f-oro pl" cx="50" cy="50" r="42"/>
    ${Array.from({ length: 12 }, (_, i) => `<path class="f-oro-osc" transform="rotate(${i * 30} 50 50)" d="M47 14 L50 8 L53 14Z"/>`).join('')}
    <circle class="pl" fill="none" cx="50" cy="50" r="30"/>
    <circle class="f-oro-claro" cx="50" cy="50" r="27"/>
    <circle class="f-tinta" cx="41" cy="45" r="3"/><circle class="f-tinta" cx="59" cy="45" r="3"/>
    <path class="pl" fill="none" d="M40 57 Q50 66 60 57"/>`,
  copa: `
    <path class="f-cop pl" d="M22 20 H78 Q78 52 57 58 H43 Q22 52 22 20Z"/>
    <rect class="f-oro pl" x="17" y="12" width="66" height="11" rx="4"/>
    <circle class="f-gema pl" cx="50" cy="37" r="6.5"/>
    <rect class="f-oro pl" x="45" y="58" width="10" height="20"/>
    <ellipse class="f-oro pl" cx="50" cy="67" rx="11" ry="5"/>
    <path class="f-oro pl" d="M28 94 Q50 74 72 94Z"/>`,
};

export function paloSVG(p: Palo, x: number, y: number, tam: number, rot = 0): string {
  const s = tam / 100;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(-50 -50)">${PALOS[p]}</g>`;
}

// --------------------------------------------------------------- Cartas (200x300)
const CORTES: Record<Palo, number> = { oro: 0, copa: 1, espada: 2, basto: 3 };
const PIPS: Record<number, [number, number][]> = {
  1: [[100, 150]],
  2: [[100, 82], [100, 218]],
  3: [[100, 76], [100, 150], [100, 224]],
  4: [[68, 82], [132, 82], [68, 218], [132, 218]],
  5: [[68, 82], [132, 82], [100, 150], [68, 218], [132, 218]],
  6: [[68, 76], [132, 76], [68, 150], [132, 150], [68, 224], [132, 224]],
  7: [[68, 72], [132, 72], [100, 112], [68, 154], [132, 154], [68, 228], [132, 228]],
};

function marco(p: Palo): string {
  const x0 = 16, x1 = 184, y0 = 16, y1 = 284, hueco = 14;
  let d = `M${x0} ${y0} V${y1} M${x1} ${y0} V${y1}`;
  for (const y of [y0, y1]) {
    const n = CORTES[p];
    let desde = x0;
    for (let i = 1; i <= n; i++) {
      const cx = x0 + ((x1 - x0) * i) / (n + 1);
      d += ` M${desde} ${y} H${cx - hueco / 2}`;
      desde = cx + hueco / 2;
    }
    d += ` M${desde} ${y} H${x1}`;
  }
  return `<path class="c-marco" d="${d}"/>`;
}

export function cartaSVG(c: Carta): string {
  const indice = `<text class="c-num" x="34" y="56" text-anchor="middle">${c.n}</text>${paloSVG(c.palo, 34, 80, 24)}`;
  let centro = '';
  if (c.n === 1) {
    const especial = c.palo === 'espada' || c.palo === 'basto';
    if (especial) {
      centro += `<g class="c-rayos">${Array.from({ length: 20 }, (_, i) => `<path transform="rotate(${i * 18} 100 150)" d="M100 82 L104 100 L96 100Z"/>`).join('')}</g>`;
    }
    centro += paloSVG(c.palo, 100, 150, especial ? 150 : 120);
  } else if (c.n >= 10) {
    const figura = { 10: 'Sota', 11: 'Caballo', 12: 'Rey' }[c.n];
    centro = `<rect class="c-marco" x="52" y="52" width="96" height="196" rx="8"/>${paloSVG(c.palo, 100, 130, 90)}<text class="c-num" x="100" y="225" text-anchor="middle" style="font-size:26px">${figura}</text>`;
  } else {
    const tam = c.n <= 3 ? 62 : 52;
    centro = PIPS[c.n].map(([x, y], i) => {
      const rot = c.palo === 'espada' || c.palo === 'basto' ? (i % 2 ? 18 : -18) : 0;
      return paloSVG(c.palo, x, y, tam, rot);
    }).join('');
  }
  return `<svg class="svg-carta" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
    <rect class="c-papel" width="200" height="300"/>
    <rect class="c-papel-luz" width="200" height="300"/>
    ${marco(c.palo)}
    ${indice}
    <g transform="rotate(180 100 150)">${indice}</g>
    <g class="c-centro">${centro}</g>
  </svg>`;
}

export function dorsoSVG(): string {
  return `<svg class="svg-carta" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
    <rect class="d-a" width="200" height="300"/>
    <g class="d-b">${Array.from({ length: 22 }, (_, i) => `<path d="M${-300 + i * 30} 0 L${i * 30} 300 M${i * 30 - 100} 0 L${-400 + i * 30} 300"/>`).join('')}</g>
    <rect class="d-marco" x="14" y="14" width="172" height="272" rx="8"/>
    <circle class="d-sello" cx="100" cy="150" r="38"/>
    <text class="d-letra" x="100" y="166" text-anchor="middle">T</text>
  </svg>`;
}

// --------------------------------------------------------------- Personaje: Don Tito, viejo de club con boina
export function rivalSVG(): string {
  return `<svg class="svg-rival" viewBox="0 0 240 270" xmlns="http://www.w3.org/2000/svg">
    <g class="respira">
      <path class="a-ropa al" d="M6 270 Q14 186 120 174 Q226 186 234 270Z"/>
      <path class="a-franja" d="M60 196 Q120 176 180 196 L190 222 Q120 200 50 222Z"/>
      <path class="a-cuello al" d="M92 176 L120 214 L148 176"/>
      <rect class="a-piel al" x="100" y="150" width="40" height="34" rx="12"/>
      <g class="cabeza">
        <ellipse class="a-piel al" cx="62" cy="116" rx="13" ry="18"/>
        <ellipse class="a-piel al" cx="178" cy="116" rx="13" ry="18"/>
        <ellipse class="a-piel al" cx="120" cy="108" rx="58" ry="64"/>
        <path class="a-pelo al" d="M64 100 Q60 130 70 140 Q72 112 78 98Z M176 100 Q180 130 170 140 Q168 112 162 98Z"/>
        <circle class="a-cachete" cx="84" cy="132" r="11"/><circle class="a-cachete" cx="156" cy="132" r="11"/>
        <path class="a-ceja" d="M80 82 Q96 72 110 82"/><path class="a-ceja" d="M130 82 Q144 72 160 82"/>
        <g class="ojos"><circle class="a-ojo" cx="96" cy="102" r="6"/><circle class="a-ojo" cx="144" cy="102" r="6"/>
          <circle class="a-brillo" cx="98" cy="100" r="2"/><circle class="a-brillo" cx="146" cy="100" r="2"/></g>
        <g class="anteojos"><circle cx="96" cy="102" r="17"/><circle cx="144" cy="102" r="17"/><path d="M113 100 Q120 95 127 100"/></g>
        <path class="a-nariz al" d="M120 104 Q104 132 114 138 Q122 142 130 134"/>
        <ellipse class="a-boca-abierta" cx="120" cy="160" rx="10" ry="9"/>
        <path class="a-boca al" d="M110 158 Q120 164 130 158"/>
        <path class="a-bigote al" d="M80 146 Q86 132 104 136 Q114 128 120 136 Q126 128 136 136 Q154 132 160 146 Q148 154 136 148 Q126 146 120 150 Q114 146 104 148 Q92 154 80 146Z"/>
        <path class="a-boina al" d="M54 74 Q56 32 118 30 Q184 32 188 70 Q170 60 120 60 Q72 60 54 74Z"/>
        <path class="a-boina-borde al" d="M54 74 Q120 52 188 70"/>
        <path class="a-boina al" d="M116 30 l4 -12"/>
      </g>
    </g>
  </svg>`;
}

// --------------------------------------------------------------- Mate de calabaza con bombilla
export const MATE_SVG = `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
  <ellipse class="m-sombra" cx="60" cy="132" rx="44" ry="7"/>
  <path class="m-bombilla al" d="M70 52 L92 6"/>
  <circle class="m-bombilla-pico" cx="92" cy="6" r="4"/>
  <path class="m-calabaza al" d="M24 54 Q8 92 30 122 Q60 140 90 122 Q112 92 96 54Z"/>
  <path class="m-calabaza-osc" d="M34 60 Q22 92 38 118 Q30 90 40 62Z"/>
  <ellipse class="m-virola al" cx="60" cy="54" rx="38" ry="10"/>
  <ellipse class="m-yerba" cx="60" cy="54" rx="31" ry="6.5"/>
  <path class="m-guarda" d="M22 86 Q60 100 98 86"/>
  <rect class="m-pie al" x="44" y="124" width="32" height="8" rx="3"/>
</svg>`;

// --------------------------------------------------------------- Anotador con fósforos (cuadrados de 5)
export function fosforosSVG(n: number, objetivo = 15): string {
  const cuadros = objetivo / 5;
  let s = `<svg viewBox="0 0 40 ${cuadros * 30 + 6}" xmlns="http://www.w3.org/2000/svg">`;
  for (let q = 0; q < cuadros; q++) {
    const y = q * 30 + 4, x0 = 9, t = 22;
    const seg = [[x0, y + t, x0, y], [x0, y, x0 + t, y], [x0 + t, y, x0 + t, y + t], [x0 + t, y + t, x0, y + t], [x0, y + t, x0 + t, y]];
    const llenos = Math.max(0, Math.min(5, n - q * 5));
    seg.forEach(([a, b, c, d], i) => {
      s += i < llenos
        ? `<line class="fosforo" x1="${a}" y1="${b}" x2="${c}" y2="${d}"/><circle class="fosforo-cabeza" cx="${c}" cy="${d}" r="2.4"/>`
        : `<line class="fosforo-vacio" x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`;
    });
  }
  return s + '</svg>';
}

// --------------------------------------------------------------- Decoración
export const VELA_SVG = `<svg viewBox="0 0 60 140" xmlns="http://www.w3.org/2000/svg">
  <ellipse class="v-halo" cx="30" cy="34" rx="30" ry="34"/>
  <path class="v-llama" d="M30 8 Q42 30 30 46 Q18 30 30 8Z"/>
  <path class="v-llama-centro" d="M30 24 Q36 36 30 44 Q24 36 30 24Z"/>
  <path class="v-pabilo" d="M30 44 V52"/>
  <path class="v-cera al" d="M14 52 Q30 46 46 52 L46 124 Q30 130 14 124Z"/>
  <path class="v-gota" d="M40 52 Q44 66 40 74 Q36 66 40 52Z"/>
  <ellipse class="v-plato al" cx="30" cy="126" rx="26" ry="7"/>
</svg>`;

export const BOTELLAS_SVG = `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
  <path class="b-1 al" d="M30 40 V20 H42 V40 Q56 50 56 70 V150 H16 V70 Q16 50 30 40Z"/>
  <rect class="b-etiqueta al" x="20" y="90" width="32" height="26"/>
  <path class="b-2 al" d="M92 60 V36 H104 V60 Q122 70 122 90 V150 H74 V90 Q74 70 92 60Z"/>
  <path class="b-3 al" d="M130 100 Q130 84 142 84 Q154 84 154 100 V150 H130Z"/>
</svg>`;

export const FILETE_SVG = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path class="fi-hoja al" d="M20 180 Q20 60 120 30 Q80 80 90 120 Q60 120 50 150 Q40 160 20 180Z"/>
  <path class="fi-hoja2 al" d="M30 170 Q60 100 150 70 Q120 110 120 140 Q90 130 70 150Z"/>
  <path class="fi-espiral al" d="M120 30 Q170 20 180 60 Q186 92 156 96 Q132 96 134 74 Q138 60 152 64"/>
  <path class="fi-luz" d="M40 160 Q40 90 110 46"/>
  <circle class="fi-flor al" cx="60" cy="60" r="14"/><circle class="fi-centro" cx="60" cy="60" r="5"/>
  <path class="fi-espiral al" d="M20 180 Q10 120 40 100"/>
</svg>`;

export const SOL_SVG = `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <circle class="s-linea" cx="200" cy="200" r="190"/><circle class="s-linea" cx="200" cy="200" r="176"/>
  ${Array.from({ length: 24 }, (_, i) => `<path class="s-rayo" transform="rotate(${i * 15} 200 200)" d="M200 66 L208 110 L192 110Z"/>`).join('')}
  <circle class="s-linea" cx="200" cy="200" r="70"/>
  <path class="s-linea" d="M172 190 q8 -8 16 0 M212 190 q8 -8 16 0 M178 226 q22 16 44 0"/>
  ${[45, 135, 225, 315].map((a) => `<path class="s-luna" transform="rotate(${a} 200 200) translate(200 34)" d="M-12 0 a14 14 0 1 0 22 -12 a11 11 0 1 1 -22 12Z"/>`).join('')}
  ${[0, 90, 180, 270].map((a) => `<path class="s-estrella" transform="rotate(${a} 200 200) translate(200 30)" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2Z"/>`).join('')}
</svg>`;

export const SIGILO_SVG = `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <circle class="g-linea" cx="200" cy="200" r="186"/><circle class="g-linea" cx="200" cy="200" r="160"/>
  ${Array.from({ length: 16 }, (_, i) => `<text class="g-runa" transform="rotate(${i * 22.5} 200 200)" x="200" y="34" text-anchor="middle">${'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊ'[i]}</text>`).join('')}
  <path class="g-linea" d="M200 48 L332 276 L68 276Z"/>
  <path class="g-linea" d="M200 352 L68 124 L332 124Z"/>
  <circle class="g-linea" cx="200" cy="200" r="58"/>
  <path class="g-linea" d="M200 142 V258 M142 200 H258"/>
</svg>`;

export const ESTANTES_SVG = `<svg viewBox="0 0 1600 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <rect class="e-fondo" width="1600" height="600"/>
  <path class="e-viga al" d="M0 40 H1600 M0 90 H1600"/>
  ${[180, 330, 480].map((y) => `<rect class="e-estante al" x="-10" y="${y}" width="560" height="18"/><rect class="e-estante al" x="1050" y="${y}" width="560" height="18"/>`).join('')}
  ${[[60, 180], [140, 180], [230, 180], [380, 180], [90, 330], [200, 330], [320, 330], [440, 330], [70, 480], [260, 480], [1120, 180], [1240, 180], [1380, 180], [1500, 180], [1150, 330], [1300, 330], [1450, 330], [1100, 480], [1260, 480], [1420, 480]]
    .map(([x, y], i) => `<path class="e-frasco e-c${i % 5} al" d="M${x - 22} ${y} V${y - 50} Q${x - 22} ${y - 66} ${x - 10} ${y - 70} V${y - 84} H${x + 10} V${y - 70} Q${x + 22} ${y - 66} ${x + 22} ${y - 50} V${y}Z"/>
      <path class="e-brillo" d="M${x - 14} ${y - 12} V${y - 46}"/>`).join('')}
  <path class="e-planta al" d="M1060 60 Q1120 120 1180 60 Q1240 120 1300 60 Q1360 120 1420 60"/>
  ${[1100, 1220, 1340].map((x) => `<ellipse class="e-hoja al" cx="${x + 20}" cy="88" rx="14" ry="8"/>`).join('')}
</svg>`;

export const PAPEL_SVG = `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg">
  <path class="p-hoja al" d="M8 6 L112 10 L108 144 L12 140Z"/>
  <path class="p-escritura" d="M22 30 H96 M22 46 H84 M22 62 H98 M22 78 H70 M22 94 H90 M22 110 H60"/>
  <circle class="p-chinche al" cx="60" cy="12" r="6"/>
</svg>`;
