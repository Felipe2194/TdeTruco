/*
 * API HTTP de las salas, independiente del framework.
 *   GET  /api/sala?c=CODIGO&t=TOKEN&desde=SEQ   → vista (y hace avanzar a los bots)
 *   POST /api/sala  { op, ... }                 → acción y vista actualizada
 */
import type { Palo } from '../engine/cartas.js';
import { type Accion, type CantoEnvido, ErrorJuego } from '../engine/juego.js';
import {
  accionJugador, crearSala, decir, ErrorSala, hacerSena, iniciar, limpiarNombre, ponerBot, revancha, type Sala, sentarse,
  tick, unirse, validarConfig,
} from './sala.js';
import { obtenerStore } from './store.js';
import { construirVista } from './vista.js';

export interface Respuesta {
  status: number;
  json: unknown;
}

type Cuerpo = Record<string, unknown>;

const store = () => obtenerStore();

async function mutar(codigo: string, fn: (sala: Sala, ahora: number) => boolean | void): Promise<Sala> {
  for (let intento = 0; intento < 6; intento++) {
    const sala = await store().leer(codigo);
    if (!sala) throw new ErrorSala('La sala no existe o venció');
    const version = sala.version;
    if (fn(sala, Date.now()) === false) return sala;
    sala.version = version + 1;
    if (await store().guardar(sala, version)) return sala;
  }
  throw new Error('Demasiados cambios simultáneos, reintentá');
}

function leerAccion(b: Cuerpo): Accion {
  const tipo = String(b.tipo);
  switch (tipo) {
    case 'jugar': {
      const c = b.carta as { n?: unknown; p?: unknown } | undefined;
      return { tipo: 'jugar', carta: { n: Number(c?.n), p: String(c?.p) as Palo } };
    }
    case 'envido':
    case 'real':
    case 'falta':
      return { tipo: 'envido', canto: tipo as CantoEnvido };
    case 'truco':
    case 'quiero':
    case 'noquiero':
    case 'mazo':
      return { tipo };
    default:
      throw new ErrorSala('Acción desconocida');
  }
}

export async function manejar(metodo: string, query: Record<string, unknown>, cuerpo: unknown): Promise<Respuesta> {
  try {
    if (metodo === 'GET') {
      const codigo = String(query.c ?? '').toUpperCase();
      const token = query.t ? String(query.t) : null;
      const desde = Number(query.desde ?? 0) || 0;
      const sala = await mutar(codigo, (s, ahora) => tick(s, ahora));
      return { status: 200, json: construirVista(sala, token, desde) };
    }
    if (metodo !== 'POST') return { status: 405, json: { error: 'Método no permitido' } };

    const b = (typeof cuerpo === 'string' ? JSON.parse(cuerpo || '{}') : cuerpo ?? {}) as Cuerpo;
    const op = String(b.op ?? '');
    const token = String(b.token ?? '');
    const desde = Number(b.desde ?? 0) || 0;

    if (op === 'crear') {
      for (let i = 0; i < 8; i++) {
        const { sala, token: t } = crearSala(limpiarNombre(b.nombre), validarConfig(b.config as Cuerpo), Date.now());
        if (b.conBots) iniciar(sala, t, Date.now());
        if (await store().crear(sala)) return { status: 200, json: { token: t, vista: construirVista(sala, t) } };
      }
      throw new Error('No se pudo generar un código de sala');
    }

    const codigo = String(b.codigo ?? '').toUpperCase();
    if (op === 'unirse') {
      let nuevo = '';
      const sala = await mutar(codigo, (s) => { nuevo = unirse(s, limpiarNombre(b.nombre)); });
      return { status: 200, json: { token: nuevo, vista: construirVista(sala, nuevo) } };
    }

    const sala = await mutar(codigo, (s, ahora) => {
      switch (op) {
        case 'sentarse': sentarse(s, token, Number(b.asiento)); break;
        case 'bot': ponerBot(s, token, Number(b.asiento), !!b.bot); break;
        case 'iniciar': iniciar(s, token, ahora); break;
        case 'revancha': revancha(s, token, ahora); break;
        case 'accion': accionJugador(s, token, leerAccion(b), ahora); break;
        case 'decir': decir(s, token, b.que === 'voy' ? 'voy' : 'veni'); break;
        case 'sena': hacerSena(s, token, String(b.clave)); break;
        default: throw new ErrorSala('Operación desconocida');
      }
    });
    return { status: 200, json: { vista: construirVista(sala, token, desde) } };
  } catch (e) {
    if (e instanceof ErrorSala || e instanceof ErrorJuego) return { status: 400, json: { error: e.message } };
    console.error(e);
    return { status: 500, json: { error: 'Error interno' } };
  }
}

export const tipoDeStore = () => store().tipo;
