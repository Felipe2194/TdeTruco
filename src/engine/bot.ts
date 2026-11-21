/* Jugador automático: decide con información propia (sus cartas y lo que hay en la mesa). */
import { type Carta, poder, tantoEnvido } from './cartas.js';
import type { Perfil } from './rivales.js';
import {
  type Accion, type Partida, accionesPosibles, dueloDe, equipoDe, pendienteActivo, siguientesEnvido,
} from './juego.js';

export type Indicacion = 'voy' | 'veni';

export interface ContextoBot {
  /** Lo que le dijo un compañero en esta baza. */
  indicacion?: Indicacion;
  rng?: () => number;
  /** Personalidad (rivales del 1v1). Sin perfil juega como siempre. */
  perfil?: Perfil;
}

/** Perfil neutro: con estos valores todos los ajustes valen cero. */
const NEUTRO: Perfil = { truco: 0.5, envido: 0.5, mentira: 0.2 };

const promedio = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function decidirBot(p: Partida, asiento: number, ctx: ContextoBot = {}): Accion {
  const rng = ctx.rng ?? Math.random;
  const acc = accionesPosibles(p, asiento);
  if (!acc.length) throw new Error('El bot no tiene acciones');
  const d = dueloDe(p, asiento)!;
  const mano = p.ronda!.manos[asiento];
  const tanto = tantoEnvido(p.ronda!.originales[asiento]);
  const eq = equipoDe(asiento);
  const bazasGanadas = d.resultados.filter((r) => r === eq).length;
  const fuerza = promedio(mano.map(poder)) + bazasGanadas * 3 + (mano.some((c) => poder(c) >= 11) ? 2 : 0);
  const pend = pendienteActivo(d);
  const pf = ctx.perfil ?? NEUTRO;
  const dt = pf.truco - 0.5, de = pf.envido - 0.5, dm = pf.mentira - 0.2;

  if (pend?.tipo === 'envido') {
    const subir = siguientesEnvido(d.envido!.cadena);
    if (tanto >= 32 && subir.includes('falta') && rng() < 0.5) return { tipo: 'envido', canto: 'falta' };
    if (tanto >= 30 && subir.includes('real') && rng() < 0.5) return { tipo: 'envido', canto: 'real' };
    if (tanto >= 27 - de * 6 || (tanto >= 24 - de * 4 && rng() < 0.3 + dm * 0.5)) return { tipo: 'quiero' };
    return { tipo: 'noquiero' };
  }

  if (pend?.tipo === 'truco') {
    if (acc.includes('envido') && tanto >= 28 - de * 6 && rng() < 0.8) return { tipo: 'envido', canto: tanto >= 31 ? 'real' : 'envido' };
    const nivel = d.truco.pendiente!.nivel;
    if (acc.includes('truco') && fuerza >= 11 - dt * 4 && rng() < 0.35 + dt * 0.5) return { tipo: 'truco' };
    const umbral = 6 + (nivel - 2) * 1.5 - dt * 3;
    if (fuerza >= umbral || rng() < 0.2 + dm * 0.5) return { tipo: 'quiero' };
    return { tipo: 'noquiero' };
  }

  // Es su turno.
  if (acc.includes('envido') && tanto >= 27 - de * 8 && rng() < 0.6 + de * 0.6) {
    return { tipo: 'envido', canto: tanto >= 31 && rng() < 0.5 ? 'real' : 'envido' };
  }
  // Los mentirosos a veces cantan sin tener nada.
  if (acc.includes('envido') && dm > 0 && rng() < dm * 0.15) return { tipo: 'envido', canto: 'envido' };
  if (acc.includes('truco') && fuerza >= 10 - dt * 4 && rng() < 0.3 + dt * 0.5) return { tipo: 'truco' };
  if (acc.includes('truco') && dm > 0 && rng() < dm * 0.3) return { tipo: 'truco' };
  return { tipo: 'jugar', carta: elegirCarta(p, asiento, ctx.indicacion) };
}

export function elegirCarta(p: Partida, asiento: number, indicacion?: Indicacion): Carta {
  const d = dueloDe(p, asiento)!;
  const orden = [...p.ronda!.manos[asiento]].sort((a, b) => poder(a) - poder(b));
  const baja = orden[0], alta = orden[orden.length - 1];
  const enBaza = d.jugadas.filter((j) => j.baza === d.baza);
  const mejor = enBaza.length ? enBaza.reduce((m, j) => (poder(j.carta) > poder(m.carta) ? j : m)) : null;
  const ganaMiEquipo = mejor && equipoDe(mejor.asiento) === equipoDe(asiento);

  if (indicacion === 'veni') return baja; // el compañero pone la carta
  if (indicacion === 'voy') {
    // vamos con la carta de este jugador: juega fuerte
    if (mejor && !ganaMiEquipo) return orden.find((c) => poder(c) > poder(mejor.carta)) ?? alta;
    return alta;
  }
  if (!mejor) return d.baza === 0 ? orden[Math.floor(orden.length / 2)] : alta;
  if (ganaMiEquipo) return baja;
  return orden.find((c) => poder(c) > poder(mejor.carta)) ?? baja;
}

/** Seña que haría un jugador según sus cartas. */
export function senaDeMano(cs: Carta[]): string {
  const tiene = (n: number, p?: string) => cs.some((c) => c.n === n && (!p || c.p === p));
  if (tiene(1, 'espada')) return 'anchoEspada';
  if (tiene(1, 'basto')) return 'anchoBasto';
  if (tiene(7, 'espada')) return 'sieteEspada';
  if (tiene(7, 'oro')) return 'sieteOro';
  if (tiene(3)) return 'tres';
  if (tiene(2)) return 'dos';
  if (tiene(1)) return 'anchoFalso';
  if (tantoEnvido(cs) >= 27) return 'envido';
  return 'nada';
}
