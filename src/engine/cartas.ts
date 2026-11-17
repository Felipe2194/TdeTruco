export type Palo = 'espada' | 'basto' | 'oro' | 'copa';

export interface Carta {
  n: number;
  p: Palo;
}

export const PALOS: Palo[] = ['espada', 'basto', 'oro', 'copa'];
export const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

/** Jerarquía del truco: mayor número = carta más fuerte. */
export function poder(c: Carta): number {
  const { n, p } = c;
  if (n === 1 && p === 'espada') return 14;
  if (n === 1 && p === 'basto') return 13;
  if (n === 7 && p === 'espada') return 12;
  if (n === 7 && p === 'oro') return 11;
  if (n === 3) return 10;
  if (n === 2) return 9;
  if (n === 1) return 8;
  if (n === 12) return 7;
  if (n === 11) return 6;
  if (n === 10) return 5;
  if (n === 7) return 4;
  if (n === 6) return 3;
  if (n === 5) return 2;
  return 1;
}

export const valorEnvido = (c: Carta) => (c.n >= 10 ? 0 : c.n);

/** Tanto de envido de una mano (máximo 33). */
export function tantoEnvido(cs: Carta[]): number {
  let mejor = Math.max(0, ...cs.map(valorEnvido));
  for (let i = 0; i < cs.length; i++)
    for (let j = i + 1; j < cs.length; j++)
      if (cs[i].p === cs[j].p) mejor = Math.max(mejor, 20 + valorEnvido(cs[i]) + valorEnvido(cs[j]));
  return mejor;
}

export function nuevoMazo(rng: () => number = Math.random): Carta[] {
  const m: Carta[] = [];
  for (const p of PALOS) for (const n of NUMEROS) m.push({ n, p });
  for (let i = m.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [m[i], m[j]] = [m[j], m[i]];
  }
  return m;
}

export const mismaCarta = (a: Carta, b: Carta) => a.n === b.n && a.p === b.p;
export const claveCarta = (c: Carta) => `${c.n}-${c.p}`;
