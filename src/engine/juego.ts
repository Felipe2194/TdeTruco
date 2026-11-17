/*
 * Motor de reglas del Truco argentino (sin flor).
 *
 * - 1v1, 2v2, 3v3 y 4v4. Los asientos pares son el equipo 0 y los impares el equipo 1.
 * - Se juega en sentido antihorario: después del asiento i juega el i+1.
 * - Cada mano ("ronda") tiene uno o más duelos: en una redonda hay un solo duelo con todos;
 *   en pica-pica (3v3 y 4v4, zona media del partido) hay un duelo 1v1 por cada pareja enfrentada.
 * - El motor es puro: no conoce la red ni los tiempos. Cada acción devuelve efectos para la interfaz.
 */
import { type Carta, mismaCarta, nuevoMazo, poder, tantoEnvido } from './cartas.js';

export type Equipo = 0 | 1;
export const equipoDe = (asiento: number): Equipo => (asiento % 2) as Equipo;
export const otroEquipo = (e: Equipo): Equipo => (1 - e) as Equipo;

export interface Config {
  jugadores: 2 | 4 | 6 | 8;
  objetivo: 15 | 30;
  picaPica: boolean;
}

export type CantoEnvido = 'envido' | 'real' | 'falta';

export interface Pendiente {
  por: Equipo;
  asiento: number;
}
export interface EstadoEnvido {
  cadena: CantoEnvido[];
  pendiente: Pendiente | null;
}
export interface EstadoTruco {
  /** Nivel aceptado: 1 sin truco, 2 truco, 3 retruco, 4 vale cuatro. */
  nivel: number;
  pendiente: (Pendiente & { nivel: number }) | null;
  /** Equipo que tiene "el quiero" (el único que puede volver a subir). */
  puedeSubir: Equipo | null;
}
export interface Jugada {
  asiento: number;
  carta: Carta;
  baza: number;
}
export interface FinDuelo {
  ganador: Equipo;
  puntos: number;
  motivo: string;
}
export interface Duelo {
  id: number;
  /** Orden de juego, empezando por la mano del duelo. */
  asientos: number[];
  turno: number;
  lider: number;
  baza: number;
  jugadas: Jugada[];
  /** Equipo ganador de cada baza (-1 = parda). */
  resultados: (Equipo | -1)[];
  /** Asiento que ganó cada baza (-1 = parda). */
  ganadores: number[];
  truco: EstadoTruco;
  envido: EstadoEnvido | null;
  envidoCerrado: boolean;
  fin: FinDuelo | null;
}
export type TipoRonda = 'redonda' | 'picapica';
export interface Ronda {
  tipo: TipoRonda;
  manos: Carta[][];
  originales: Carta[][];
  duelos: Duelo[];
}
export interface Partida {
  config: Config;
  puntos: [number, number];
  /** Asiento que es mano en la ronda actual. */
  mano: number;
  numeroMano: number;
  ronda: Ronda | null;
  ganador: Equipo | null;
  ultimaFuePica: boolean;
}

export type Accion =
  | { tipo: 'jugar'; carta: Carta }
  | { tipo: 'truco' }
  | { tipo: 'envido'; canto: CantoEnvido }
  | { tipo: 'quiero' }
  | { tipo: 'noquiero' }
  | { tipo: 'mazo' };

export type NombreAccion = 'jugar' | 'truco' | 'envido' | 'real' | 'falta' | 'quiero' | 'noquiero' | 'mazo';

export type Efecto =
  | { tipo: 'canto'; asiento: number; texto: string }
  | { tipo: 'carta'; asiento: number; carta: Carta; baza: number; duelo: number }
  | { tipo: 'baza'; duelo: number; baza: number; ganador: number }
  | { tipo: 'tanto'; asiento: number; texto: string; orden: number }
  | { tipo: 'puntos'; equipo: Equipo; puntos: number; motivo: string }
  | { tipo: 'finDuelo'; duelo: number; ganador: Equipo; puntos: number; motivo: string }
  | { tipo: 'finPartida'; ganador: Equipo };

export class ErrorJuego extends Error {}

export const TEXTO_TRUCO: Record<number, string> = { 2: '¡Truco!', 3: '¡Quiero retruco!', 4: '¡Quiero vale cuatro!' };
export const NOMBRE_TRUCO: Record<number, string> = { 1: 'Sin truco', 2: 'Truco', 3: 'Retruco', 4: 'Vale cuatro' };
export const TEXTO_ENVIDO: Record<CantoEnvido, string> = { envido: '¡Envido!', real: '¡Real envido!', falta: '¡Falta envido!' };
const VALOR_CANTO: Record<CantoEnvido, number> = { envido: 2, real: 3, falta: 0 };

// ------------------------------------------------------------------ Partida y reparto

export function nuevaPartida(config: Config, manoInicial = 0): Partida {
  return { config, puntos: [0, 0], mano: manoInicial, numeroMano: 0, ronda: null, ganador: null, ultimaFuePica: false };
}

/** Zona de pica-pica: algún equipo pasó los primeros puntos y nadie está por terminar. */
export function enZonaPicaPica(p: Partida): boolean {
  const { config: c, puntos } = p;
  if (!c.picaPica || c.jugadores < 6) return false;
  const max = Math.max(...puntos);
  const margen = c.objetivo === 30 ? 5 : 3;
  return max >= margen && max < c.objetivo - margen;
}

/** Distancia al rival "enfrentado" (si el de enfrente es compañero, se usa el rival más cercano). */
export function offsetPicaPica(n: number): number {
  const mitad = n / 2;
  return mitad % 2 === 1 ? mitad : mitad - 1;
}

function ordenDesde(asientos: number[], mano: number, n: number): number[] {
  return [...asientos].sort((a, b) => ((a - mano + n) % n) - ((b - mano + n) % n));
}

function nuevoDuelo(id: number, asientos: number[]): Duelo {
  return {
    id, asientos, turno: asientos[0], lider: asientos[0], baza: 0, jugadas: [], resultados: [], ganadores: [],
    truco: { nivel: 1, pendiente: null, puedeSubir: null }, envido: null, envidoCerrado: false, fin: null,
  };
}

export function repartir(p: Partida, rng: () => number = Math.random): void {
  if (p.ganador !== null) throw new ErrorJuego('La partida terminó');
  const n = p.config.jugadores;
  if (p.ronda) p.mano = (p.mano + 1) % n;
  p.numeroMano++;
  const pica = enZonaPicaPica(p) && !p.ultimaFuePica;
  p.ultimaFuePica = pica;
  const mazo = nuevoMazo(rng);
  const manos = Array.from({ length: n }, (_, i) => mazo.slice(i * 3, i * 3 + 3));
  const todos = Array.from({ length: n }, (_, i) => i);
  let duelos: Duelo[];
  if (pica) {
    const off = offsetPicaPica(n);
    duelos = todos.filter((a) => a % 2 === 0).map((a, i) => nuevoDuelo(i, ordenDesde([a, (a + off) % n], p.mano, n)));
  } else {
    duelos = [nuevoDuelo(0, ordenDesde(todos, p.mano, n))];
  }
  p.ronda = { tipo: pica ? 'picapica' : 'redonda', manos, originales: manos.map((m) => m.slice()), duelos };
}

// ------------------------------------------------------------------ Consultas

export const dueloDe = (p: Partida, asiento: number): Duelo | null =>
  p.ronda?.duelos.find((d) => d.asientos.includes(asiento)) ?? null;

export const manoTerminada = (p: Partida): boolean => !!p.ronda && p.ronda.duelos.every((d) => d.fin);

export function pendienteActivo(d: Duelo): { tipo: 'envido' | 'truco'; por: Equipo } | null {
  if (d.envido?.pendiente) return { tipo: 'envido', por: d.envido.pendiente.por };
  if (d.truco.pendiente) return { tipo: 'truco', por: d.truco.pendiente.por };
  return null;
}

const yaJugoEnBaza = (d: Duelo, asiento: number, baza: number) =>
  d.jugadas.some((j) => j.asiento === asiento && j.baza === baza);

export function envidoDisponible(d: Duelo, asiento: number): boolean {
  return !d.envidoCerrado && d.envido === null && d.baza === 0 && d.truco.nivel === 1 && !yaJugoEnBaza(d, asiento, 0);
}

export function siguientesEnvido(cadena: CantoEnvido[]): CantoEnvido[] {
  if (cadena.includes('falta')) return [];
  if (cadena.includes('real')) return ['falta'];
  const envidos = cadena.filter((c) => c === 'envido').length;
  return envidos >= 2 ? ['real', 'falta'] : ['envido', 'real', 'falta'];
}

export const faltaEnvido = (p: Partida) => p.config.objetivo - Math.max(...p.puntos);

export function valorQuerido(cadena: CantoEnvido[], p: Partida): number {
  if (cadena.includes('falta')) return faltaEnvido(p);
  return cadena.reduce((s, c) => s + VALOR_CANTO[c], 0);
}

export function valorNoQuerido(cadena: CantoEnvido[]): number {
  if (cadena.length <= 1) return 1;
  return cadena.slice(0, -1).reduce((s, c) => s + VALOR_CANTO[c], 0);
}

export function ganadorDuelo(r: (Equipo | -1)[], equipoMano: Equipo): Equipo | null {
  const g0 = r.filter((x) => x === 0).length;
  const g1 = r.filter((x) => x === 1).length;
  if (r.length >= 2) {
    if (g0 >= 2) return 0;
    if (g1 >= 2) return 1;
    if (r[0] === -1 && r[1] !== -1) return r[1];
    if (r[0] !== -1 && r[1] === -1) return r[0];
  }
  if (r.length === 3) {
    if (r[2] === -1) return r[0] !== -1 ? r[0] : equipoMano;
    return r[2];
  }
  return null;
}

/** Asientos que pueden actuar ahora (el del turno, o el equipo que tiene que responder un canto). */
export function quienesActuan(p: Partida): number[] {
  if (!p.ronda || p.ganador !== null) return [];
  const r: number[] = [];
  for (const d of p.ronda.duelos) {
    if (d.fin) continue;
    const pend = pendienteActivo(d);
    if (pend) r.push(...d.asientos.filter((a) => equipoDe(a) !== pend.por));
    else r.push(d.turno);
  }
  return r;
}

export function accionesPosibles(p: Partida, asiento: number): NombreAccion[] {
  if (p.ganador !== null || !p.ronda) return [];
  const d = dueloDe(p, asiento);
  if (!d || d.fin) return [];
  const eq = equipoDe(asiento);
  const pend = pendienteActivo(d);
  const r: NombreAccion[] = [];
  if (pend) {
    if (pend.por === eq) return [];
    r.push('quiero', 'noquiero');
    if (pend.tipo === 'envido') {
      r.push(...siguientesEnvido(d.envido!.cadena));
      return r;
    }
    if (d.truco.pendiente!.nivel < 4) r.push('truco');
    if (envidoDisponible(d, asiento)) r.push('envido', 'real', 'falta');
    r.push('mazo');
    return r;
  }
  if (d.turno !== asiento) return [];
  r.push('jugar');
  if (d.truco.nivel < 4 && (d.truco.puedeSubir === null || d.truco.puedeSubir === eq)) r.push('truco');
  if (envidoDisponible(d, asiento)) r.push('envido', 'real', 'falta');
  r.push('mazo');
  return r;
}

// ------------------------------------------------------------------ Acciones

export function aplicar(p: Partida, asiento: number, a: Accion): Efecto[] {
  const nombre: NombreAccion = a.tipo === 'envido' ? a.canto : a.tipo;
  if (!accionesPosibles(p, asiento).includes(nombre)) throw new ErrorJuego(`Acción no permitida: ${nombre}`);
  const d = dueloDe(p, asiento)!;
  const ef: Efecto[] = [];
  switch (a.tipo) {
    case 'jugar': jugarCarta(p, d, asiento, a.carta, ef); break;
    case 'truco': cantarTruco(d, asiento, ef); break;
    case 'envido': cantarEnvido(d, asiento, a.canto, ef); break;
    case 'quiero': querer(p, d, asiento, ef); break;
    case 'noquiero': noQuerer(p, d, asiento, ef); break;
    case 'mazo': irseAlMazo(p, d, asiento, ef); break;
  }
  return ef;
}

function siguiente(d: Duelo, a: number) {
  return d.asientos[(d.asientos.indexOf(a) + 1) % d.asientos.length];
}

function jugarCarta(p: Partida, d: Duelo, asiento: number, carta: Carta, ef: Efecto[]) {
  const mano = p.ronda!.manos[asiento];
  const i = mano.findIndex((c) => mismaCarta(c, carta));
  if (i < 0) throw new ErrorJuego('No tenés esa carta');
  mano.splice(i, 1);
  d.jugadas.push({ asiento, carta, baza: d.baza });
  ef.push({ tipo: 'carta', asiento, carta, baza: d.baza, duelo: d.id });

  const enBaza = d.jugadas.filter((j) => j.baza === d.baza);
  if (enBaza.length < d.asientos.length) {
    d.turno = siguiente(d, asiento);
    return;
  }
  let mejor = enBaza[0];
  let parda = false;
  for (const j of enBaza.slice(1)) {
    const pa = poder(j.carta), pb = poder(mejor.carta);
    if (pa > pb) { mejor = j; parda = false; }
    else if (pa === pb && equipoDe(j.asiento) !== equipoDe(mejor.asiento)) parda = true;
  }
  d.resultados.push(parda ? -1 : equipoDe(mejor.asiento));
  d.ganadores.push(parda ? -1 : mejor.asiento);
  ef.push({ tipo: 'baza', duelo: d.id, baza: d.baza, ganador: parda ? -1 : mejor.asiento });

  const g = ganadorDuelo(d.resultados, equipoDe(d.asientos[0]));
  if (g !== null) return terminarDuelo(p, d, g, d.truco.nivel, 'ganó la mano', ef);
  d.baza++;
  d.envidoCerrado = true;
  if (!parda) d.lider = mejor.asiento;
  d.turno = d.lider;
}

function cantarTruco(d: Duelo, asiento: number, ef: Efecto[]) {
  const eq = equipoDe(asiento);
  const t = d.truco;
  if (t.pendiente) t.nivel = t.pendiente.nivel; // subir equivale a querer lo anterior
  t.pendiente = { nivel: t.nivel + 1, por: eq, asiento };
  ef.push({ tipo: 'canto', asiento, texto: TEXTO_TRUCO[t.pendiente.nivel] });
}

function cantarEnvido(d: Duelo, asiento: number, canto: CantoEnvido, ef: Efecto[]) {
  const eq = equipoDe(asiento);
  if (d.envido === null) {
    const primero = !!d.truco.pendiente;
    d.envido = { cadena: [canto], pendiente: { por: eq, asiento } };
    ef.push({ tipo: 'canto', asiento, texto: (primero ? 'El envido está primero. ' : '') + TEXTO_ENVIDO[canto] });
  } else {
    d.envido.cadena.push(canto);
    d.envido.pendiente = { por: eq, asiento };
    ef.push({ tipo: 'canto', asiento, texto: TEXTO_ENVIDO[canto] });
  }
}

function querer(p: Partida, d: Duelo, asiento: number, ef: Efecto[]) {
  const pend = pendienteActivo(d)!;
  ef.push({ tipo: 'canto', asiento, texto: '¡Quiero!' });
  if (pend.tipo === 'envido') return resolverEnvido(p, d, ef);
  d.truco.nivel = d.truco.pendiente!.nivel;
  d.truco.pendiente = null;
  d.truco.puedeSubir = equipoDe(asiento);
  d.envidoCerrado = true; // con el truco querido ya no se puede cantar envido
}

function noQuerer(p: Partida, d: Duelo, asiento: number, ef: Efecto[]) {
  const pend = pendienteActivo(d)!;
  ef.push({ tipo: 'canto', asiento, texto: 'No quiero' });
  if (pend.tipo === 'envido') {
    const env = d.envido!;
    const ganador = env.pendiente!.por;
    env.pendiente = null;
    d.envidoCerrado = true;
    sumarPuntos(p, ganador, valorNoQuerido(env.cadena), 'envido no querido', ef);
    return;
  }
  const ganador = d.truco.pendiente!.por;
  d.truco.pendiente = null;
  terminarDuelo(p, d, ganador, d.truco.nivel, 'no quisieron el truco', ef);
}

function irseAlMazo(p: Partida, d: Duelo, asiento: number, ef: Efecto[]) {
  let puntos = d.truco.nivel;
  if (d.baza === 0 && d.envido === null && !d.envidoCerrado) puntos += 1;
  d.truco.pendiente = null;
  ef.push({ tipo: 'canto', asiento, texto: 'Me voy al mazo' });
  terminarDuelo(p, d, otroEquipo(equipoDe(asiento)), puntos, 'se fueron al mazo', ef);
}

function resolverEnvido(p: Partida, d: Duelo, ef: Efecto[]) {
  const env = d.envido!;
  const orig = p.ronda!.originales;
  const valor = valorQuerido(env.cadena, p);
  // Cantan los tantos en orden desde la mano: solo declara quien supera al mejor rival.
  let mejor: { asiento: number; tanto: number } | null = null;
  let orden = 0;
  const declararon = new Set<number>();
  for (const a of d.asientos) {
    const t = tantoEnvido(orig[a]);
    if (!mejor) {
      mejor = { asiento: a, tanto: t };
      declararon.add(a);
      ef.push({ tipo: 'tanto', asiento: a, texto: `${t}`, orden: orden++ });
      continue;
    }
    if (equipoDe(a) === equipoDe(mejor.asiento)) continue;
    if (t > mejor.tanto) {
      mejor = { asiento: a, tanto: t };
      declararon.add(a);
      ef.push({ tipo: 'tanto', asiento: a, texto: `${t}`, orden: orden++ });
    } else {
      ef.push({ tipo: 'tanto', asiento: a, texto: 'Son buenas', orden: orden++ });
    }
  }
  // Ganador real: el tanto más alto; en caso de empate, el más cercano a la mano.
  let ganador = d.asientos[0];
  let maximo = tantoEnvido(orig[ganador]);
  for (const a of d.asientos) {
    const t = tantoEnvido(orig[a]);
    if (t > maximo) { maximo = t; ganador = a; }
  }
  if (!declararon.has(ganador)) ef.push({ tipo: 'tanto', asiento: ganador, texto: `${maximo}`, orden: orden++ });
  env.pendiente = null;
  d.envidoCerrado = true;
  sumarPuntos(p, equipoDe(ganador), valor, `envido (${maximo})`, ef);
}

function sumarPuntos(p: Partida, eq: Equipo, puntos: number, motivo: string, ef: Efecto[]) {
  if (p.ganador !== null) return;
  p.puntos[eq] = Math.min(p.config.objetivo, p.puntos[eq] + puntos);
  ef.push({ tipo: 'puntos', equipo: eq, puntos, motivo });
  if (p.puntos[eq] >= p.config.objetivo) {
    p.ganador = eq;
    ef.push({ tipo: 'finPartida', ganador: eq });
  }
}

function terminarDuelo(p: Partida, d: Duelo, eq: Equipo, puntos: number, motivo: string, ef: Efecto[]) {
  d.fin = { ganador: eq, puntos, motivo };
  d.truco.pendiente = null;
  if (d.envido) d.envido.pendiente = null;
  ef.push({ tipo: 'finDuelo', duelo: d.id, ganador: eq, puntos, motivo });
  sumarPuntos(p, eq, puntos, motivo, ef);
}
