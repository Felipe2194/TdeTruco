/*
 * Salas de juego: jugadores, bots, eventos para la interfaz y avance automático.
 * Todo es puro y serializable a JSON: la sala se guarda entera en el almacenamiento.
 */
import { decidirBot, type Indicacion, senaDeMano } from '../engine/bot.js';
import {
  type Accion, type Config, type Efecto, type Partida, aplicar, dueloDe, equipoDe, ErrorJuego, manoTerminada, nuevaPartida,
  pendienteActivo, repartir,
} from '../engine/juego.js';

export const NOMBRES_BOT = ['Ramón', 'Facundo', 'Don Chacho', 'Anselmo', 'Tobías', 'Severino', 'Martín', 'Don Eusebio'];
export const SENAS = ['anchoEspada', 'anchoBasto', 'sieteEspada', 'sieteOro', 'tres', 'dos', 'anchoFalso', 'envido', 'nada'];

export class ErrorSala extends Error {}

export interface Jugador {
  nombre: string;
  token: string | null;
  bot: boolean;
}

export type TipoEvento = 'canto' | 'sena' | 'carta' | 'baza' | 'puntos' | 'finDuelo' | 'finPartida' | 'mano';

export interface Evento {
  seq: number;
  tipo: TipoEvento;
  asiento?: number;
  texto?: string;
  datos?: Record<string, unknown>;
  /** Milisegundos que la interfaz espera antes de mostrarlo (para encadenar cantos). */
  retraso?: number;
}

export interface Sala {
  codigo: string;
  version: number;
  creada: number;
  host: string;
  config: Config;
  jugadores: (Jugador | null)[];
  fase: 'lobby' | 'jugando' | 'fin';
  partida: Partida | null;
  eventos: Evento[];
  seq: number;
  /** A partir de este momento la sala puede avanzar sola (bots, nueva mano). */
  proximo: number;
  /** Indicaciones "voy"/"vení" de la baza actual. Clave: `mano:baza:asiento`. */
  indicaciones: Record<string, Indicacion>;
}

const MAX_EVENTOS = 120;
const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

export function codigoNuevo(): string {
  const v = new Uint32Array(4);
  crypto.getRandomValues(v);
  return [...v].map((x) => LETRAS[x % LETRAS.length]).join('');
}

function tokenNuevo(): string {
  const v = new Uint8Array(18);
  crypto.getRandomValues(v);
  return [...v].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export function validarConfig(c: Partial<Config> | undefined): Config {
  const jugadores = [2, 4, 6, 8].includes(Number(c?.jugadores)) ? (Number(c!.jugadores) as Config['jugadores']) : 4;
  const objetivo = Number(c?.objetivo) === 15 ? 15 : 30;
  return { jugadores, objetivo, picaPica: c?.picaPica !== false };
}

export const limpiarNombre = (n: unknown) => String(n ?? '').trim().replace(/\s+/g, ' ').slice(0, 18) || 'Gaucho';

export function asientoDe(sala: Sala, token: string | null | undefined): number {
  if (!token) return -1;
  return sala.jugadores.findIndex((j) => j?.token === token);
}

function exigirAsiento(sala: Sala, token: string): number {
  const a = asientoDe(sala, token);
  if (a < 0) throw new ErrorSala('No estás sentado en esta sala');
  return a;
}

function exigirHost(sala: Sala, token: string) {
  if (sala.host !== token) throw new ErrorSala('Solo quien creó la sala puede hacer eso');
}

function evento(sala: Sala, e: Omit<Evento, 'seq'>) {
  sala.seq++;
  sala.eventos.push({ seq: sala.seq, ...e });
  if (sala.eventos.length > MAX_EVENTOS) sala.eventos.splice(0, sala.eventos.length - MAX_EVENTOS);
}

// ------------------------------------------------------------------ Lobby

export function crearSala(nombre: string, config: Config, ahora: number): { sala: Sala; token: string } {
  const token = tokenNuevo();
  const jugadores: (Jugador | null)[] = Array(config.jugadores).fill(null);
  jugadores[0] = { nombre: limpiarNombre(nombre), token, bot: false };
  const sala: Sala = {
    codigo: codigoNuevo(), version: 0, creada: ahora, host: token, config, jugadores,
    fase: 'lobby', partida: null, eventos: [], seq: 0, proximo: 0, indicaciones: {},
  };
  return { sala, token };
}

export function unirse(sala: Sala, nombre: string): string {
  if (sala.fase !== 'lobby') throw new ErrorSala('La partida ya empezó');
  // Primero un asiento libre; si no hay, el lugar de un bot.
  let a = sala.jugadores.findIndex((j) => j === null);
  if (a < 0) a = sala.jugadores.findIndex((j) => j?.bot);
  if (a < 0) throw new ErrorSala('La sala está llena');
  const token = tokenNuevo();
  sala.jugadores[a] = { nombre: limpiarNombre(nombre), token, bot: false };
  return token;
}

export function sentarse(sala: Sala, token: string, asiento: number) {
  if (sala.fase !== 'lobby') throw new ErrorSala('La partida ya empezó');
  const actual = exigirAsiento(sala, token);
  if (asiento === actual) return;
  const destino = sala.jugadores[asiento];
  if (asiento < 0 || asiento >= sala.jugadores.length || (destino && !destino.bot)) throw new ErrorSala('Ese asiento está ocupado');
  sala.jugadores[asiento] = sala.jugadores[actual];
  sala.jugadores[actual] = null;
}

export function ponerBot(sala: Sala, token: string, asiento: number, bot: boolean) {
  exigirHost(sala, token);
  if (sala.fase !== 'lobby') throw new ErrorSala('La partida ya empezó');
  const j = sala.jugadores[asiento];
  if (bot && j === null) sala.jugadores[asiento] = { nombre: nombreBot(sala, asiento), token: null, bot: true };
  if (!bot && j?.bot) sala.jugadores[asiento] = null;
}

function nombreBot(sala: Sala, asiento: number): string {
  const usados = new Set(sala.jugadores.map((j) => j?.nombre));
  return [NOMBRES_BOT[asiento], ...NOMBRES_BOT].find((n) => !usados.has(n)) ?? `Bot ${asiento + 1}`;
}

export function iniciar(sala: Sala, token: string, ahora: number) {
  exigirHost(sala, token);
  if (sala.fase === 'jugando') return;
  sala.jugadores = sala.jugadores.map((j, i) => j ?? { nombre: nombreBot(sala, i), token: null, bot: true });
  sala.partida = nuevaPartida(sala.config, Math.floor(Math.random() * sala.config.jugadores));
  sala.fase = 'jugando';
  nuevaMano(sala, ahora);
}

export const revancha = iniciar;

// ------------------------------------------------------------------ Juego

function nuevaMano(sala: Sala, ahora: number) {
  const p = sala.partida!;
  repartir(p);
  sala.indicaciones = {};
  evento(sala, { tipo: 'mano', datos: { numero: p.numeroMano, tipo: p.ronda!.tipo, mano: p.mano } });
  // Los bots le hacen una seña a su compañero humano; a veces los rivales también se pasan señas.
  for (const d of p.ronda!.duelos) {
    for (const a of d.asientos) {
      const j = sala.jugadores[a]!;
      if (!j.bot) continue;
      const companeroHumano = d.asientos.some((b) => b !== a && equipoDe(b) === equipoDe(a) && !sala.jugadores[b]!.bot);
      const companeroBot = d.asientos.some((b) => b !== a && equipoDe(b) === equipoDe(a) && sala.jugadores[b]!.bot);
      if (companeroHumano) evento(sala, { tipo: 'sena', asiento: a, texto: senaDeMano(p.ronda!.manos[a]), retraso: 900 });
      else if (companeroBot && Math.random() < 0.35)
        evento(sala, { tipo: 'sena', asiento: a, texto: senaDeMano(p.ronda!.manos[a]), retraso: 2500 + Math.random() * 4000 });
    }
  }
  sala.proximo = ahora + 1500;
}

function registrar(sala: Sala, efectos: Efecto[]) {
  for (const e of efectos) {
    switch (e.tipo) {
      case 'canto': evento(sala, { tipo: 'canto', asiento: e.asiento, texto: e.texto }); break;
      case 'tanto': evento(sala, { tipo: 'canto', asiento: e.asiento, texto: e.texto, retraso: 500 + e.orden * 800 }); break;
      case 'carta': evento(sala, { tipo: 'carta', asiento: e.asiento, datos: { carta: e.carta, baza: e.baza, duelo: e.duelo } }); break;
      case 'baza': evento(sala, { tipo: 'baza', datos: { duelo: e.duelo, baza: e.baza, ganador: e.ganador } }); break;
      case 'puntos': evento(sala, { tipo: 'puntos', datos: { equipo: e.equipo, puntos: e.puntos, motivo: e.motivo } }); break;
      case 'finDuelo': evento(sala, { tipo: 'finDuelo', datos: { duelo: e.duelo, ganador: e.ganador, puntos: e.puntos } }); break;
      case 'finPartida':
        sala.fase = 'fin';
        evento(sala, { tipo: 'finPartida', datos: { ganador: e.ganador } });
        break;
    }
  }
}

function pausaTras(sala: Sala, efectos: Efecto[], ahora: number) {
  const p = sala.partida!;
  let pausa = 850 + Math.random() * 450;
  if (efectos.some((e) => e.tipo === 'tanto')) pausa = 900 + efectos.filter((e) => e.tipo === 'tanto').length * 800;
  if (efectos.some((e) => e.tipo === 'baza')) pausa = Math.max(pausa, 1700);
  if (manoTerminada(p)) pausa = Math.max(pausa, 2800);
  sala.proximo = ahora + pausa;
}

export function accionJugador(sala: Sala, token: string, accion: Accion, ahora: number) {
  if (sala.fase !== 'jugando' || !sala.partida) throw new ErrorSala('No hay una mano en juego');
  const a = exigirAsiento(sala, token);
  const efectos = aplicar(sala.partida, a, accion);
  registrar(sala, efectos);
  pausaTras(sala, efectos, ahora);
}

const claveIndicacion = (p: Partida, baza: number, asiento: number) => `${p.numeroMano}:${baza}:${asiento}`;

export function puedeIndicar(sala: Sala, asiento: number): boolean {
  const p = sala.partida;
  if (sala.fase !== 'jugando' || !p?.ronda || manoTerminada(p)) return false;
  const d = dueloDe(p, asiento);
  if (!d || d.fin) return false;
  if (sala.indicaciones[`dijo:${claveIndicacion(p, d.baza, asiento)}`]) return false;
  return d.asientos.some((b) => b !== asiento && equipoDe(b) === equipoDe(asiento) && !d.jugadas.some((j) => j.asiento === b && j.baza === d.baza));
}

export function decir(sala: Sala, token: string, que: Indicacion) {
  const a = exigirAsiento(sala, token);
  if (!puedeIndicar(sala, a)) throw new ErrorSala('Ahora no podés decirle eso a tu compañero');
  const p = sala.partida!;
  const d = dueloDe(p, a)!;
  sala.indicaciones[`dijo:${claveIndicacion(p, d.baza, a)}`] = que;
  evento(sala, { tipo: 'canto', asiento: a, texto: que === 'voy' ? '¡Voy!' : '¡Vení!' });
  let respondio = false;
  for (const b of d.asientos) {
    if (b === a || equipoDe(b) !== equipoDe(a)) continue;
    sala.indicaciones[claveIndicacion(p, d.baza, b)] = que;
    if (!respondio && sala.jugadores[b]!.bot) {
      respondio = true;
      evento(sala, { tipo: 'canto', asiento: b, texto: que === 'voy' ? '¡Dejámela a mí!' : '¡Dale, poné vos!', retraso: 700 });
    }
  }
}

export function hacerSena(sala: Sala, token: string, clave: string) {
  const a = exigirAsiento(sala, token);
  if (!SENAS.includes(clave)) throw new ErrorSala('Seña desconocida');
  if (sala.fase !== 'jugando') return;
  evento(sala, { tipo: 'sena', asiento: a, texto: clave });
}

/** Avanza la sala sola si corresponde (bots, nueva mano). Devuelve true si cambió algo. */
export function tick(sala: Sala, ahora: number): boolean {
  const p = sala.partida;
  if (sala.fase !== 'jugando' || !p || ahora < sala.proximo) return false;
  if (p.ganador !== null) {
    sala.fase = 'fin';
    return true;
  }
  if (manoTerminada(p)) {
    nuevaMano(sala, ahora);
    return true;
  }
  for (const d of p.ronda!.duelos) {
    if (d.fin) continue;
    let bot: number | null = null;
    const pend = pendienteActivo(d);
    if (pend) {
      const responden = d.asientos.filter((a) => equipoDe(a) !== pend.por);
      // Si hay un humano en el equipo que responde, se lo espera a él.
      if (responden.every((a) => sala.jugadores[a]!.bot)) bot = responden[0];
    } else if (sala.jugadores[d.turno]!.bot) {
      bot = d.turno;
    }
    if (bot === null) continue;
    const indicacion = sala.indicaciones[claveIndicacion(p, d.baza, bot)];
    let efectos: Efecto[];
    try {
      efectos = aplicar(p, bot, decidirBot(p, bot, { indicacion }));
    } catch (e) {
      if (!(e instanceof ErrorJuego)) throw e;
      continue;
    }
    registrar(sala, efectos);
    pausaTras(sala, efectos, ahora);
    return true;
  }
  return false;
}
