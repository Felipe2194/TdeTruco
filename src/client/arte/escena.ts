/* Escena retro CRT: fondo en remolino, monitor viejo, mate en pixel art y marcador con fósforos. */
import { ATADO_SVG, CENICERO_HTML, FACON_SVG, MATE_SVG, REVOLVER_SVG } from './pixel';

export { GRIETA_SVG, HACHA_SVG, MATE_SVG } from './pixel';

/** Lo que hay sobre la mesa además de las cartas: mate, cenicero con puchos, atado, facón y revólver. */
export const MESA_DECO = MATE_SVG + CENICERO_HTML + ATADO_SVG + FACON_SVG + REVOLVER_SVG;

/** Fondo animado (remolino de colores) y capa de monitor CRT por encima de todo. */
export const FONDO_SVG = '<div id="fondo"><div class="remolino"></div></div>';
export const CRT_HTML = '<div id="crt"></div>';

/** Marcador con fósforos: cuadrados de 5 (lado por lado y la diagonal). A 30 separa malas y buenas. */
export function porotosSVG(n: number, objetivo: 15 | 30 = 30, ancho = 34): string {
  const cuadros = objetivo / 5;
  const separar = objetivo === 30;
  const alto = cuadros * 30 + (separar ? 10 : 0) + 6;
  let s = `<svg viewBox="0 0 40 ${alto}" width="${ancho}" height="${(ancho * alto) / 40}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">`;
  for (let q = 0; q < cuadros; q++) {
    const y = q * 30 + (separar && q >= 3 ? 10 : 0) + 3, x0 = 10, t = 20;
    const seg = [[x0, y + t, x0, y], [x0, y, x0 + t, y], [x0 + t, y, x0 + t, y + t], [x0 + t, y + t, x0, y + t], [x0, y + t, x0 + t, y]];
    const llenos = Math.max(0, Math.min(5, n - q * 5));
    seg.forEach(([a, b, c, d], i) => {
      if (i < llenos) {
        s += `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" style="stroke:var(--poroto,#f3d9a0)" stroke-width="3" stroke-linecap="square"/>`;
        s += `<rect x="${c - 2}" y="${d - 2}" width="4" height="4" style="fill:var(--poroto-punta,#d8402c)"/>`;
      } else {
        s += `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" style="stroke:var(--poroto,#f3d9a0);stroke-opacity:.18" stroke-width="1.5" stroke-dasharray="2 3"/>`;
      }
    });
  }
  if (separar) s += '<line x1="2" y1="93" x2="38" y2="93" style="stroke:var(--poroto,#f3d9a0);stroke-opacity:.6" stroke-width="1.2"/>';
  return s + '</svg>';
}
