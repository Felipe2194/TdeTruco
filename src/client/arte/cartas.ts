/* Imágenes de las cartas: pixel art en SVG (ver pixel.ts), servidas como data URL para <img>. */
import type { Carta } from '../../engine/cartas';
import { cartaSVG, dorsoSVG } from './pixel';

const cache = new Map<string, string>();
const url = (svg: string) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

/** Imagen (data URL) de una carta, o del dorso si es null. */
export function imagenCarta(c: Carta | null): string {
  const k = c ? c.n + c.p : 'dorso';
  let u = cache.get(k);
  if (!u) {
    u = url(c ? cartaSVG(c) : dorsoSVG());
    cache.set(k, u);
  }
  return u;
}
