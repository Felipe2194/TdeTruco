/*
 * Criaturas amigables para los rediseños: animalitos y fantasmitas con algún detalle gaucho.
 * Conservan las mismas partes animables que los gauchos (ojos, cejas, boca, cabeza) para que
 * las señas funcionen igual: .ojo-i/.ojo-d, .ceja-i/.ceja-d, .boca con .bv.*, .cabeza, .respira, .parpadeo.
 */

export type Especie = 'gato' | 'carpincho' | 'fantasma' | 'perro' | 'lechuza' | 'oveja' | 'zorro' | 'rana';
export type Accesorio = 'boina' | 'chambergo' | 'vincha' | 'flor' | 'ninguno';

export interface Criatura {
  especie: Especie;
  accesorio: Accesorio;
  /** Color propio (se usa si el estilo no trae paleta). */
  color: string;
}

export const CRIATURAS: Criatura[] = [
  { especie: 'gato', accesorio: 'boina', color: '#f2a65a' },
  { especie: 'carpincho', accesorio: 'chambergo', color: '#b07a4f' },
  { especie: 'fantasma', accesorio: 'boina', color: '#f4f1ff' },
  { especie: 'perro', accesorio: 'vincha', color: '#d9b48f' },
  { especie: 'lechuza', accesorio: 'ninguno', color: '#9a7b62' },
  { especie: 'oveja', accesorio: 'flor', color: '#fff6e8' },
  { especie: 'zorro', accesorio: 'chambergo', color: '#e0723a' },
  { especie: 'rana', accesorio: 'boina', color: '#7cc46a' },
];

export type FiltroPersonaje = 'pixel' | 'garabato' | 'arcilla' | 'neon' | 'ninguno';

export interface EstiloPersonaje {
  /** Color de las líneas. */
  trazo: string;
  /** Grosor de las líneas (en unidades del viewBox). */
  grosor: number;
  /** Colores de cuerpo, uno por criatura (si falta, usa el color propio). */
  paleta?: string[];
  /** Color de pupilas y bocas. */
  pupila?: string;
  /** Color de lo blanco (ojos, panza, hocico). */
  claro?: string;
  /** Color del sombrero. */
  sombrero?: string;
  /** Color de los cachetes. */
  cachete?: string;
  /** Opacidad de los rellenos (para vidrio). */
  opacidad?: number;
  filtro?: FiltroPersonaje;
}

const filtros: Record<FiltroPersonaje, (id: string) => string> = {
  ninguno: () => '',
  pixel: (id) => `<filter id="f-${id}" filterUnits="userSpaceOnUse" x="-12" y="-24" width="224" height="300">
      <feFlood x="-9" y="-21" width="1" height="1"/><feComposite x="-12" y="-24" width="7" height="7"/><feTile result="a"/>
      <feComposite in="SourceGraphic" in2="a" operator="in"/><feMorphology operator="dilate" radius="3.5"/></filter>`,
  garabato: (id) => `<filter id="f-${id}"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${id.length * 7}"/>
      <feDisplacementMap in="SourceGraphic" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>`,
  arcilla: (id) => `<filter id="f-${id}" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="b"/>
      <feOffset in="b" dx="7" dy="9" result="o1"/><feComposite in="SourceAlpha" in2="o1" operator="out" result="borde1"/>
      <feFlood flood-color="#fff" flood-opacity=".55"/><feComposite in2="borde1" operator="in" result="luz"/>
      <feOffset in="b" dx="-7" dy="-9" result="o2"/><feComposite in="SourceAlpha" in2="o2" operator="out" result="borde2"/>
      <feFlood flood-color="#5a2a3a" flood-opacity=".28"/><feComposite in2="borde2" operator="in" result="sombra"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sombra"/><feMergeNode in="luz"/></feMerge></filter>`,
  neon: (id) => `<filter id="f-${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="g"/>
      <feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
};

export function criaturaSVG(c: Criatura, indice: number, panuelo: string, id: string, e: EstiloPersonaje): string {
  const T = e.trazo, G = e.grosor;
  const GL = Math.max(G, 3); // bocas y cejas siempre visibles
  const cuerpo = e.paleta?.[indice % e.paleta.length] ?? c.color;
  const claro = e.claro ?? '#ffffff';
  const pupila = e.pupila ?? T;
  const sombrero = e.sombrero ?? '#2b2233';
  const cachete = e.cachete ?? '#ff7b8a';
  const op = e.opacidad ?? 1;
  const linea = `stroke="${T}" stroke-width="${G}" stroke-linejoin="round"`;
  const relleno = (color: string, extra = '') => `fill="${color}" fill-opacity="${op}" ${linea} ${extra}`;

  // --- Cuerpo (con poncho corto y pañuelo del equipo)
  const cuerpoFantasma = `<path d="M38 104 Q38 34 100 34 Q162 34 162 104 L166 268 Q148 252 132 268 Q116 284 100 268 Q84 252 68 268 Q52 284 34 266Z" ${relleno(cuerpo)}/>`;
  const cuerpoNormal = `
    <path d="M-2 272 Q2 194 100 182 Q198 194 202 272Z" ${relleno(cuerpo)}/>
    <path d="M40 250 Q100 214 160 250 L160 272 L40 272Z" fill="${claro}" fill-opacity="${0.55 * op}"/>
    <path d="M12 232 Q100 206 188 232" fill="none" stroke="${T}" stroke-opacity=".35" stroke-width="${G}" stroke-dasharray="10 8"/>`;
  const esFantasma = c.especie === 'fantasma';

  // --- Cabeza según especie (todo lo que va detrás de los ojos)
  const cabezas: Record<Especie, string> = {
    gato: `
      <path d="M50 78 L46 22 L90 54Z M150 78 L154 22 L110 54Z" ${relleno(cuerpo)}/>
      <path d="M56 64 L54 36 L78 54Z M144 64 L146 36 L122 54Z" fill="${cachete}" opacity=".7"/>
      <ellipse cx="100" cy="106" rx="60" ry="52" ${relleno(cuerpo)}/>
      <ellipse cx="100" cy="134" rx="26" ry="16" fill="${claro}" fill-opacity="${0.8 * op}"/>
      <path d="M94 122 L106 122 L100 129Z" fill="${cachete}" stroke="${T}" stroke-width="${G * 0.6}"/>
      <path d="M40 126 L70 130 M40 140 L70 136 M160 126 L130 130 M160 140 L130 136" stroke="${T}" stroke-width="${G * 0.6}" stroke-linecap="round"/>`,
    carpincho: `
      <ellipse cx="54" cy="60" rx="13" ry="11" ${relleno(cuerpo)}/>
      <ellipse cx="146" cy="60" rx="13" ry="11" ${relleno(cuerpo)}/>
      <rect x="42" y="52" width="116" height="104" rx="50" ${relleno(cuerpo)}/>
      <rect x="66" y="112" width="68" height="40" rx="20" fill="${T}" fill-opacity=".14"/>
      <ellipse cx="90" cy="122" rx="4" ry="6" fill="${pupila}"/><ellipse cx="110" cy="122" rx="4" ry="6" fill="${pupila}"/>`,
    fantasma: `
      <ellipse cx="78" cy="56" rx="12" ry="6" fill="${claro}" opacity=".6" transform="rotate(-20 78 56)"/>`,
    perro: `
      <ellipse cx="100" cy="104" rx="58" ry="54" ${relleno(cuerpo)}/>
      <path d="M48 70 Q20 76 26 130 Q34 150 52 128 Q50 98 60 80Z M152 70 Q180 76 174 130 Q166 150 148 128 Q150 98 140 80Z"
        fill="${T}" fill-opacity=".55" ${linea}/>
      <ellipse cx="122" cy="98" rx="20" ry="18" fill="${T}" fill-opacity=".12"/>
      <ellipse cx="100" cy="134" rx="28" ry="19" fill="${claro}" fill-opacity="${0.85 * op}" ${linea}/>
      <ellipse cx="100" cy="122" rx="9" ry="6" fill="${pupila}"/>`,
    lechuza: `
      <path d="M46 70 L42 30 L74 54Z M154 70 L158 30 L126 54Z" ${relleno(cuerpo)}/>
      <ellipse cx="100" cy="106" rx="62" ry="56" ${relleno(cuerpo)}/>
      <circle cx="78" cy="102" r="22" fill="${claro}" fill-opacity="${0.75 * op}"/>
      <circle cx="122" cy="102" r="22" fill="${claro}" fill-opacity="${0.75 * op}"/>
      <path d="M92 120 L108 120 L100 134Z" fill="#f2b33d" ${linea}/>`,
    oveja: `
      <g ${relleno(cuerpo)}>
        <circle cx="56" cy="76" r="22"/><circle cx="80" cy="56" r="24"/><circle cx="110" cy="52" r="24"/><circle cx="140" cy="68" r="22"/>
        <circle cx="152" cy="100" r="20"/><circle cx="48" cy="104" r="20"/>
      </g>
      <ellipse cx="34" cy="108" rx="16" ry="9" fill="#f3c9b0" ${linea} transform="rotate(20 34 108)"/>
      <ellipse cx="166" cy="108" rx="16" ry="9" fill="#f3c9b0" ${linea} transform="rotate(-20 166 108)"/>
      <ellipse cx="100" cy="112" rx="46" ry="46" fill="#f3c9b0" fill-opacity="${op}" ${linea}/>
      <g fill="${cuerpo}"><circle cx="82" cy="70" r="14"/><circle cx="100" cy="64" r="15"/><circle cx="118" cy="70" r="14"/></g>`,
    zorro: `
      <path d="M48 84 L40 18 L92 56Z M152 84 L160 18 L108 56Z" ${relleno(cuerpo)}/>
      <path d="M54 68 L50 36 L76 56Z M146 68 L150 36 L124 56Z" fill="${T}" fill-opacity=".45"/>
      <path d="M38 96 Q40 52 100 50 Q160 52 162 96 Q160 140 100 158 Q40 140 38 96Z" ${relleno(cuerpo)}/>
      <path d="M40 104 Q64 110 84 132 Q100 156 116 132 Q136 110 160 104 Q156 140 100 158 Q44 140 40 104Z" fill="${claro}" fill-opacity="${0.9 * op}"/>
      <ellipse cx="100" cy="128" rx="7" ry="5" fill="${pupila}"/>`,
    rana: `
      <circle cx="78" cy="88" r="24" ${relleno(cuerpo)}/>
      <circle cx="122" cy="88" r="24" ${relleno(cuerpo)}/>
      <ellipse cx="100" cy="122" rx="68" ry="42" ${relleno(cuerpo)}/>
      <ellipse cx="100" cy="146" rx="40" ry="14" fill="${claro}" fill-opacity="${0.45 * op}"/>`,
  };

  // --- Sombreros chiquitos (el detalle gaucho)
  const accesorios: Record<Accesorio, string> = {
    ninguno: '',
    boina: `<ellipse cx="96" cy="${esFantasma ? 40 : 52}" rx="46" ry="15" transform="rotate(-8 96 50)" fill="${sombrero}" ${linea}/>
      <path d="M98 ${esFantasma ? 26 : 38} l4 -10" stroke="${sombrero}" stroke-width="${G + 2}" stroke-linecap="round"/>`,
    chambergo: `<ellipse cx="100" cy="54" rx="74" ry="13" fill="${sombrero}" ${linea}/>
      <path d="M62 56 Q60 16 100 14 Q140 16 138 56Z" fill="${sombrero}" ${linea}/>
      <path d="M62 44 Q100 36 138 44 L138 53 Q100 45 62 53Z" fill="${panuelo}" ${linea}/>`,
    vincha: `<path d="M44 70 Q100 54 156 70 L156 82 Q100 66 44 82Z" fill="${panuelo}" ${linea}/>
      <path d="M46 76 Q30 92 34 118 L42 116 Q40 96 52 82Z" fill="${panuelo}" ${linea}/>`,
    flor: `<g transform="translate(140 60)">${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="7" ry="11" transform="rotate(${a}) translate(0 -10)" fill="${panuelo}" ${linea}/>`).join('')}
      <circle r="6" fill="#ffd34d" ${linea}/></g>`,
  };

  const pan = esFantasma
    ? `<path d="M74 176 L126 176 L100 210Z" fill="${panuelo}" ${linea}/><circle cx="100" cy="180" r="6" fill="${panuelo}" ${linea}/>`
    : `<path d="M70 182 L130 182 L100 226Z" fill="${panuelo}" ${linea}/><circle cx="100" cy="188" r="7" fill="${panuelo}" ${linea}/>`;

  const ojo = (dx: number) => `
    <ellipse rx="11.5" ry="12.5" fill="${claro}" stroke="${T}" stroke-width="${G * 0.8}"/>
    <circle cx="${dx}" cy="1.5" r="7" fill="${pupila}"/><circle cx="${dx + 2.5}" cy="-2" r="2.4" fill="#fff"/>`;

  const filtro = e.filtro && e.filtro !== 'ninguno' ? filtros[e.filtro](id) : '';

  return `
  <svg viewBox="-12 -24 224 300" xmlns="http://www.w3.org/2000/svg">
    <defs>${filtro}</defs>
    <g class="respira${esFantasma ? ' flota' : ''}"${filtro ? ` filter="url(#f-${id})"` : ''}>
      ${esFantasma ? cuerpoFantasma : cuerpoNormal}
      ${pan}
      <g class="cabeza">
        ${cabezas[c.especie]}
        <circle cx="66" cy="${c.especie === 'rana' ? 128 : 124}" r="9" fill="${cachete}" opacity=".45"/>
        <circle cx="134" cy="${c.especie === 'rana' ? 128 : 124}" r="9" fill="${cachete}" opacity=".45"/>
        <g transform="translate(78 ${c.especie === 'rana' ? 90 : 102})"><g class="anim ojo ojo-i"><g class="parpadeo">${ojo(1)}</g></g></g>
        <g transform="translate(122 ${c.especie === 'rana' ? 90 : 102})"><g class="anim ojo ojo-d"><g class="parpadeo">${ojo(-1)}</g></g></g>
        <g transform="translate(78 ${c.especie === 'rana' ? 64 : 80})"><path class="anim ceja ceja-i" d="M-11 2 Q0 -6 11 0" fill="none" stroke="${pupila}" stroke-width="${GL + 1.5}" stroke-linecap="round"/></g>
        <g transform="translate(122 ${c.especie === 'rana' ? 64 : 80})"><path class="anim ceja ceja-d" d="M11 2 Q0 -6 -11 0" fill="none" stroke="${pupila}" stroke-width="${GL + 1.5}" stroke-linecap="round"/></g>
        <g transform="translate(100 ${c.especie === 'lechuza' ? 146 : 144})"><g class="anim boca">
          <rect x="-30" y="-16" width="60" height="32" fill="none"/>
          <path class="anim bv normal" d="M-10 -1 Q-5 5 0 0 Q5 5 10 -1" fill="none" stroke="${pupila}" stroke-width="${GL}" stroke-linecap="round"/>
          <g class="anim bv mordida">
            <path d="M-11 -2 Q0 8 11 -2" fill="#d9475a" stroke="${pupila}" stroke-width="${GL * 0.9}" stroke-linecap="round"/>
            <rect x="-6" y="-3" width="12" height="5" rx="2" fill="#fff" stroke="${pupila}" stroke-width="${GL * 0.6}"/>
          </g>
          <g class="anim bv pico"><ellipse cx="0" cy="1" rx="5" ry="6.5" fill="#e0606a" stroke="${pupila}" stroke-width="${GL * 0.9}"/></g>
          <g class="anim bv abierta">
            <ellipse cx="0" cy="3" rx="10" ry="9" fill="#5a1626" stroke="${pupila}" stroke-width="${GL * 0.9}"/>
            <ellipse cx="0" cy="8" rx="6" ry="3.4" fill="#ff8a96"/>
          </g>
        </g></g>
        ${accesorios[c.accesorio]}
      </g>
    </g>
  </svg>`;
}
