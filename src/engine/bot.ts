/* Jugador automático: decide con información propia (sus cartas y lo que hay en la mesa). */
import { Carta, poder, tantoEnvido } from './cartas';
import {
  Accion, Partida, accionesPosibles, dueloDe, equipoDe, pendienteActivo, siguientesEnvido,
} from './juego';

export type Indicacion = 'voy' | 'veni';

export interface ContextoBot {
  /** Lo que le dijo un compañero en esta baza. */
  indicacion?: Indicacion;
  rng?: () => number;
}

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

  if (pend?.tipo === 'envido') {
    const subir = siguientesEnvido(d.envido!.cadena);
    if (tanto >= 32 && subir.includes('falta') && rng() < 0.5) return { tipo: 'envido', canto: 'falta' };
    if (tanto >= 30 && subir.includes('real') && rng() < 0.5) return { tipo: 'envido', canto: 'real' };
    if (tanto >= 27 || (tanto >= 24 && rng() < 0.3)) return { tipo: 'quiero' };
    return { tipo: 'noquiero' };
  }

  if (pend?.tipo === 'truco') {
    if (acc.includes('envido') && tanto >= 28 && rng() < 0.8) return { tipo: 'envido', canto: tanto >= 31 ? 'real' : 'envido' };
    const nivel = d.truco.pendiente!.nivel;
    if (acc.includes('truco') && fuerza >= 11 && rng() < 0.35) return { tipo: 'truco' };
    const umbral = 6 + (nivel - 2) * 1.5;
    if (fuerza >= umbral || rng() < 0.2) return { tipo: 'quiero' };
    return { tipo: 'noquiero' };
  }

  // Es su turno.
  if (acc.includes('envido') && tanto >= 27 && rng() < 0.6) {
    return { tipo: 'envido', canto: tanto >= 31 && rng() < 0.5 ? 'real' : 'envido' };
  }
  if (acc.includes('truco') && fuerza >= 10 && rng() < 0.3) return { tipo: 'truco' };
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
