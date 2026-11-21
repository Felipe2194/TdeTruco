/* Lo que ve cada jugador: sus cartas, lo jugado en la mesa y las acciones que tiene disponibles. */
import type { Carta } from '../engine/cartas.js';
import { accionesPosibles, type Config, type Equipo, type FinDuelo, quienesActuan, type TipoRonda } from '../engine/juego.js';
import { asientoDe, type Evento, puedeHacerSena, puedeIndicar, type Sala } from './sala.js';

export interface VistaDuelo {
  id: number;
  asientos: number[];
  turno: number;
  baza: number;
  jugadas: { asiento: number; carta: Carta; baza: number }[];
  ganadores: number[];
  resultados: (Equipo | -1)[];
  truco: { nivel: number; pendiente: { nivel: number; por: Equipo; asiento: number } | null; puedeSubir: Equipo | null };
  envido: { cadena: string[]; pendiente: { por: Equipo; asiento: number } | null } | null;
  fin: FinDuelo | null;
}

export interface Vista {
  codigo: string;
  version: number;
  fase: Sala['fase'];
  config: Config;
  yo: number;
  esHost: boolean;
  jugadores: ({ nombre: string; bot: boolean; equipo: Equipo; rival?: string } | null)[];
  puntos: [number, number];
  mano: number;
  numeroMano: number;
  ganador: Equipo | null;
  tipoRonda: TipoRonda | null;
  duelos: VistaDuelo[];
  miMano: Carta[];
  cartasEnMano: number[];
  acciones: string[];
  actuan: number[];
  eventos: Evento[];
  seq: number;
}

export function construirVista(sala: Sala, token: string | null, desde = 0): Vista {
  const yo = asientoDe(sala, token);
  const p = sala.partida;
  const ronda = p?.ronda ?? null;
  const acciones: string[] = [];
  if (yo >= 0 && p && sala.fase === 'jugando') {
    acciones.push(...accionesPosibles(p, yo));
    if (puedeIndicar(sala, yo)) acciones.push('voy', 'veni');
    if (puedeHacerSena(sala, yo)) acciones.push('sena');
  }
  return {
    codigo: sala.codigo,
    version: sala.version,
    fase: sala.fase,
    config: sala.config,
    yo,
    esHost: !!token && token === sala.host,
    jugadores: sala.jugadores.map((j, i) => (j ? { nombre: j.nombre, bot: j.bot, equipo: (i % 2) as Equipo, rival: sala.rivales?.[i] } : null)),
    puntos: p?.puntos ?? [0, 0],
    mano: p?.mano ?? 0,
    numeroMano: p?.numeroMano ?? 0,
    ganador: p?.ganador ?? null,
    tipoRonda: ronda?.tipo ?? null,
    duelos: (ronda?.duelos ?? []).map((d) => ({
      id: d.id, asientos: d.asientos, turno: d.turno, baza: d.baza, jugadas: d.jugadas, ganadores: d.ganadores,
      resultados: d.resultados,
      truco: { nivel: d.truco.nivel, pendiente: d.truco.pendiente, puedeSubir: d.truco.puedeSubir },
      envido: d.envido ? { cadena: d.envido.cadena, pendiente: d.envido.pendiente } : null,
      fin: d.fin,
    })),
    miMano: yo >= 0 && ronda ? ronda.manos[yo] : [],
    cartasEnMano: ronda ? ronda.manos.map((m) => m.length) : [],
    acciones,
    actuan: p ? quienesActuan(p) : [],
    eventos: sala.eventos.filter((e) => e.seq > desde),
    seq: sala.seq,
  };
}
