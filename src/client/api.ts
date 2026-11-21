/* Comunicación con el servidor de salas (HTTP + polling). */
import type { Vista } from '../server/vista';

export type { Vista };

export class ErrorApi extends Error {}

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } });
  const json = await r.json().catch(() => ({ error: 'Respuesta inválida del servidor' }));
  if (!r.ok) throw new ErrorApi(json.error ?? `Error ${r.status}`);
  return json as T;
}

export const post = <T = { vista: Vista; token?: string }>(cuerpo: Record<string, unknown>) =>
  pedir<T>('/api/sala', { method: 'POST', body: JSON.stringify(cuerpo) });

export const estado = (codigo: string, token: string, desde: number) =>
  pedir<Vista>(`/api/sala?c=${encodeURIComponent(codigo)}&t=${encodeURIComponent(token)}&desde=${desde}`);

// ------------------------------------------------------------------ Sesión guardada

export interface Sesion {
  codigo: string;
  token: string;
}

export const guardarSesion = (s: Sesion | null) =>
  s ? localStorage.setItem('truco-sesion', JSON.stringify(s)) : localStorage.removeItem('truco-sesion');

export function sesionGuardada(): Sesion | null {
  try {
    return JSON.parse(localStorage.getItem('truco-sesion') ?? 'null');
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ Conexión a una sala

/** Mantiene la vista actualizada pidiendo el estado periódicamente. */
export class Conexion {
  seq = 0;
  /** Última versión de la sala aplicada: una respuesta vieja (que llega tarde) no pisa a una nueva. */
  private version = -1;
  private timer: number | null = null;
  private activa = true;
  private pidiendo = false;

  constructor(
    public sesion: Sesion,
    private alActualizar: (v: Vista) => void,
    private alError: (e: Error) => void,
  ) {}

  iniciar(intervalo = 600) {
    const ciclo = async () => {
      if (!this.activa) return;
      await this.refrescar();
      if (this.activa) this.timer = window.setTimeout(ciclo, document.hidden ? 2500 : intervalo);
    };
    ciclo();
  }

  detener() {
    this.activa = false;
    if (this.timer) clearTimeout(this.timer);
  }

  async refrescar() {
    if (this.pidiendo) return;
    this.pidiendo = true;
    try {
      this.recibir(await estado(this.sesion.codigo, this.sesion.token, this.seq));
    } catch (e) {
      this.alError(e as Error);
    } finally {
      this.pidiendo = false;
    }
  }

  /** Envía una operación y aplica la vista que devuelve. */
  async enviar(op: string, datos: Record<string, unknown> = {}) {
    const r = await post({ op, codigo: this.sesion.codigo, token: this.sesion.token, desde: this.seq, ...datos });
    this.recibir(r.vista);
    return r;
  }

  private recibir(v: Vista) {
    if (v.version < this.version) return;
    this.version = v.version;
    this.alActualizar(v);
    this.seq = Math.max(this.seq, v.seq);
  }
}
