/* Arte de la pulpería: fondo, mate y pava, y marcador con fósforos. */

export const FONDO_SVG = `<svg id="fondo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="gPared" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a87c55"/><stop offset=".6" stop-color="#8f6541"/><stop offset="1" stop-color="#5e3f26"/>
    </linearGradient>
    <pattern id="pRevoque" width="160" height="140" patternUnits="userSpaceOnUse">
      <ellipse cx="30" cy="40" rx="26" ry="14" fill="#000" opacity=".05"/>
      <ellipse cx="110" cy="20" rx="18" ry="9" fill="#fff" opacity=".05"/>
      <ellipse cx="90" cy="100" rx="34" ry="16" fill="#000" opacity=".04"/>
      <ellipse cx="20" cy="120" rx="14" ry="8" fill="#fff" opacity=".04"/>
      <path d="M60 60 l12 6 l-4 10" stroke="#000" stroke-opacity=".08" fill="none"/>
    </pattern>
    <pattern id="pLadrillo" width="80" height="36" patternUnits="userSpaceOnUse">
      <rect width="80" height="36" fill="#7a3f24"/>
      <rect x="2" y="2" width="76" height="14" rx="2" fill="#94502e"/>
      <rect x="-38" y="20" width="76" height="14" rx="2" fill="#8a4729"/>
      <rect x="42" y="20" width="76" height="14" rx="2" fill="#8a4729"/>
    </pattern>
    <linearGradient id="gCielo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#070d24"/><stop offset="1" stop-color="#25355f"/>
    </linearGradient>
    <linearGradient id="gMadera" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5a371d"/><stop offset="1" stop-color="#3a2210"/>
    </linearGradient>
    <radialGradient id="gLlama" cx="50%" cy="60%" r="50%">
      <stop offset="0" stop-color="#fff8d8"/><stop offset=".4" stop-color="#ffd068"/><stop offset="1" stop-color="#ff9a2a" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <g id="f-pared">
  <!-- Pared de adobe -->
  <rect width="1600" height="900" fill="url(#gPared)"/>
  <rect width="1600" height="900" fill="url(#pRevoque)"/>
  <rect y="560" width="1600" height="340" fill="url(#pLadrillo)" opacity=".9"/>
  <rect y="552" width="1600" height="12" fill="#4a2c16"/>
  </g>
  <g id="f-techo">
  <!-- Techo con vigas -->
  <rect width="1600" height="64" fill="#2e1a0c"/>
  <g fill="#3d2412">
    <rect x="60" width="34" height="84"/><rect x="330" width="34" height="84"/><rect x="600" width="34" height="84"/>
    <rect x="966" width="34" height="84"/><rect x="1236" width="34" height="84"/><rect x="1506" width="34" height="84"/>
  </g>
  <rect y="58" width="1600" height="18" fill="#4a2c16"/>
  </g>
  <g id="f-ventana">
  <!-- Ventana con la pampa de noche -->
  <g transform="translate(548 118)">
    <rect x="-16" y="-16" width="202" height="244" rx="4" fill="url(#gMadera)"/>
    <rect width="170" height="212" fill="url(#gCielo)"/>
    <g fill="#fff">
      <circle cx="20" cy="30" r="1.4"/><circle cx="52" cy="18" r="1"/><circle cx="74" cy="56" r="1.3"/>
      <circle cx="30" cy="86" r="1"/><circle cx="150" cy="96" r="1.2"/><circle cx="96" cy="24" r="1"/>
      <circle cx="140" cy="18" r="1.4"/><circle cx="60" cy="110" r="1"/><circle cx="12" cy="130" r="1.1"/>
    </g>
    <circle cx="122" cy="52" r="20" fill="#f4ecc8"/>
    <circle cx="131" cy="46" r="17" fill="#0d1631"/>
    <path d="M0 168 Q40 158 86 164 Q130 170 170 160 L170 212 L0 212Z" fill="#0c1a11"/>
    <g fill="#060f09">
      <rect x="34" y="128" width="9" height="40"/>
      <circle cx="38" cy="122" r="22"/><circle cx="22" cy="132" r="15"/><circle cx="56" cy="130" r="16"/>
    </g>
    <g stroke="#1c120a" stroke-width="6">
      <line x1="43" y1="0" x2="43" y2="212"/><line x1="86" y1="0" x2="86" y2="212"/><line x1="129" y1="0" x2="129" y2="212"/>
      <line x1="0" y1="106" x2="170" y2="106"/>
    </g>
    <rect x="-24" y="212" width="218" height="14" rx="2" fill="#5a3a22"/>
    <!-- herradura -->
    <path d="M71 -46 a14 14 0 1 1 28 0 l0 14 l-7 0 l0 -14 a7 7 0 1 0 -14 0 l0 14 l-7 0Z" fill="#6d6a66" stroke="#2b2622" stroke-width="2" transform="rotate(180 85 -39)"/>
  </g>
  </g>
  <g id="f-guitarra">
  <!-- Guitarra criolla colgada con cinta celeste y blanca -->
  <g transform="translate(150 330) rotate(-14)">
    <path d="M30 -14 Q0 -70 -30 -14" fill="none" stroke="#6fa8dc" stroke-width="6"/>
    <path d="M30 -14 Q0 -64 -30 -14" fill="none" stroke="#f4f4f4" stroke-width="2"/>
    <circle cx="0" cy="-70" r="4" fill="#2b2622"/>
    <rect x="-9" y="-14" width="18" height="150" fill="#5a3418" stroke="#2b1a10" stroke-width="2"/>
    <rect x="-13" y="-46" width="26" height="36" rx="5" fill="#3a2210" stroke="#2b1a10" stroke-width="2"/>
    <path d="M0 120 C-60 120 -66 190 -40 210 C-70 240 -60 310 0 310 C60 310 70 240 40 210 C66 190 60 120 0 120Z"
      fill="#c98a45" stroke="#5a2e10" stroke-width="4"/>
    <circle cx="0" cy="200" r="20" fill="#2b1608"/>
    <circle cx="0" cy="200" r="25" fill="none" stroke="#7a4a1f" stroke-width="3"/>
    <rect x="-20" y="262" width="40" height="9" rx="2" fill="#3a2210"/>
    <g stroke="#e8e0cc" stroke-width=".9" opacity=".8">
      <line x1="-5" y1="-40" x2="-5" y2="266"/><line x1="-2" y1="-40" x2="-2" y2="266"/><line x1="1" y1="-40" x2="1" y2="266"/><line x1="4" y1="-40" x2="4" y2="266"/>
    </g>
  </g>
  </g>
  <g id="f-estanteria">
  <!-- Estantería de pulpería con botellas -->
  <g transform="translate(1290 140)">
    <rect x="0" y="0" width="270" height="290" fill="#2e1a0c" opacity=".35"/>
    <g fill="#4a2c16"><rect x="-6" y="128" width="282" height="12"/><rect x="-6" y="270" width="282" height="12"/></g>
    <g>
      <rect x="16" y="64" width="26" height="64" rx="6" fill="#2f6b3a"/><rect x="23" y="40" width="12" height="28" fill="#2f6b3a"/><rect x="22" y="34" width="14" height="8" fill="#9b2335"/>
      <rect x="54" y="74" width="30" height="54" rx="4" fill="#9c5a1a" opacity=".9"/><rect x="62" y="56" width="14" height="20" fill="#9c5a1a"/><rect x="61" y="50" width="16" height="7" fill="#e8c46a"/>
      <rect x="64" y="90" width="12" height="16" fill="#f3e3c0"/>
      <rect x="96" y="58" width="22" height="70" rx="5" fill="#d8e6e0" opacity=".55"/><rect x="101" y="38" width="12" height="22" fill="#d8e6e0" opacity=".55"/>
      <rect x="130" y="80" width="38" height="48" rx="3" fill="#b8352a"/><rect x="134" y="86" width="30" height="20" fill="#f3e3c0"/><circle cx="149" cy="96" r="6" fill="#2f6b22"/>
      <rect x="180" y="66" width="24" height="62" rx="6" fill="#3b2a1a"/><rect x="186" y="44" width="12" height="24" fill="#3b2a1a"/>
      <rect x="214" y="86" width="44" height="42" rx="6" fill="#8a7a5a"/><rect x="214" y="80" width="44" height="10" rx="3" fill="#5a4a32"/>
    </g>
    <g>
      <ellipse cx="60" cy="226" rx="46" ry="46" fill="#3d5a2e"/>
      <path d="M18 214 Q60 190 102 214 M16 236 Q60 214 104 236 M22 254 Q60 236 98 254" stroke="#c9a36a" stroke-width="5" fill="none"/>
      <rect x="50" y="166" width="20" height="18" fill="#3d5a2e"/><rect x="48" y="160" width="24" height="8" fill="#9b6a3a"/>
      <rect x="128" y="206" width="36" height="64" rx="4" fill="#6a2d1a"/><rect x="132" y="216" width="28" height="26" fill="#efe1bd"/>
      <rect x="178" y="190" width="28" height="80" rx="7" fill="#26402c"/><rect x="186" y="164" width="12" height="28" fill="#26402c"/>
      <rect x="218" y="230" width="40" height="40" rx="18" fill="#c7a16a"/><rect x="222" y="222" width="32" height="10" rx="3" fill="#7a5a32"/>
    </g>
  </g>
  </g>
  <g id="f-farol">
  <!-- Farol colgante -->
  <g transform="translate(800 0)">
    <line x1="0" y1="0" x2="0" y2="38" stroke="#1c120a" stroke-width="3"/>
    <circle cx="0" cy="40" r="5" fill="none" stroke="#1c120a" stroke-width="3"/>
    <path d="M-24 52 L24 52 L16 44 L-16 44Z" fill="#1f1a16"/>
    <circle cx="0" cy="78" r="60" fill="url(#gLlama)" opacity=".7"/>
    <path d="M-20 52 L20 52 L24 104 L-24 104Z" fill="#ffe7a8" opacity=".55" stroke="#1f1a16" stroke-width="4"/>
    <line x1="0" y1="52" x2="0" y2="104" stroke="#1f1a16" stroke-width="3"/>
    <ellipse cx="0" cy="84" rx="7" ry="13" fill="url(#gLlama)"/>
    <path d="M-28 104 L28 104 L22 114 L-22 114Z" fill="#1f1a16"/>
  </g>
  </g>
  </svg>`;

export const MATE_SVG = `<svg id="mate" class="deco" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 110">
  <ellipse cx="85" cy="100" rx="80" ry="9" fill="#000" opacity=".25"/>
  <!-- pava -->
  <path d="M86 46 Q84 24 112 22 Q140 24 138 46 L144 96 Q112 104 80 96Z" fill="#7d8a8f" stroke="#2b2622" stroke-width="3"/>
  <path d="M84 60 Q60 52 50 34 L56 30 Q70 46 88 50Z" fill="#7d8a8f" stroke="#2b2622" stroke-width="3"/>
  <path d="M96 24 Q112 0 128 24" fill="none" stroke="#2b2622" stroke-width="5"/>
  <ellipse cx="112" cy="22" rx="14" ry="4" fill="#5c676b" stroke="#2b2622" stroke-width="2"/>
  <path d="M96 40 Q100 70 98 92" stroke="#fff" stroke-opacity=".3" stroke-width="5" fill="none"/>
  <!-- mate con bombilla -->
  <line x1="40" y1="56" x2="58" y2="10" stroke="#d8d4cc" stroke-width="4"/>
  <ellipse cx="34" cy="76" rx="26" ry="24" fill="#8a5a2b" stroke="#2b1a10" stroke-width="3"/>
  <ellipse cx="34" cy="58" rx="17" ry="6" fill="#4c7a2a" stroke="#2b1a10" stroke-width="2.5"/>
  <path d="M10 70 Q34 80 58 70" stroke="#c9a36a" stroke-width="4" fill="none"/>
  <rect x="22" y="96" width="24" height="6" rx="3" fill="#c9a36a"/>
</svg>`;

/** Marcador con fósforos: cuadrados de 5 (lado por lado y la diagonal). A 30 separa malas y buenas. */
export function porotosSVG(n: number, objetivo: 15 | 30 = 30, ancho = 34): string {
  const cuadros = objetivo / 5;
  const separar = objetivo === 30;
  const alto = cuadros * 30 + (separar ? 10 : 0) + 6;
  let s = `<svg viewBox="0 0 40 ${alto}" width="${ancho}" height="${(ancho * alto) / 40}" xmlns="http://www.w3.org/2000/svg">`;
  for (let q = 0; q < cuadros; q++) {
    const y = q * 30 + (separar && q >= 3 ? 10 : 0) + 3, x0 = 10, t = 20;
    const seg = [[x0, y + t, x0, y], [x0, y, x0 + t, y], [x0 + t, y, x0 + t, y + t], [x0 + t, y + t, x0, y + t], [x0, y + t, x0 + t, y]];
    const llenos = Math.max(0, Math.min(5, n - q * 5));
    seg.forEach(([a, b, c, d], i) => {
      if (i < llenos) {
        s += `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="#f3d9a0" stroke-width="2.6" stroke-linecap="round"/>`;
        s += `<circle cx="${c}" cy="${d}" r="2.3" fill="#d8402c"/>`;
      } else {
        s += `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="rgba(243,217,160,.14)" stroke-width="1.5" stroke-dasharray="2 3"/>`;
      }
    });
  }
  if (separar) s += '<line x1="2" y1="93" x2="38" y2="93" stroke="rgba(243,217,160,.6)" stroke-width="1.2"/>';
  return s + '</svg>';
}
