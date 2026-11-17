/*
 * Almacenamiento de salas.
 * - En producción: Redis por REST (Upstash, desde el Marketplace de Vercel), con escritura condicional por versión.
 * - En desarrollo (sin variables de entorno): memoria del proceso.
 */
import type { Sala } from './sala.js';

export interface Store {
  readonly tipo: 'memoria' | 'redis';
  leer(codigo: string): Promise<Sala | null>;
  /** Crea la sala solo si el código no existe. */
  crear(sala: Sala): Promise<boolean>;
  /** Guarda solo si la versión almacenada sigue siendo `versionAnterior`. */
  guardar(sala: Sala, versionAnterior: number): Promise<boolean>;
}

const TTL_SEGUNDOS = 60 * 60 * 8;
const clave = (codigo: string) => `truco:sala:${codigo}`;
const claveVersion = (codigo: string) => `truco:sala:${codigo}:v`;

class StoreMemoria implements Store {
  readonly tipo = 'memoria' as const;
  private salas: Map<string, string>;
  constructor() {
    const g = globalThis as unknown as { __salasTruco?: Map<string, string> };
    this.salas = g.__salasTruco ??= new Map();
  }
  async leer(codigo: string) {
    const s = this.salas.get(codigo);
    return s ? (JSON.parse(s) as Sala) : null;
  }
  async crear(sala: Sala) {
    if (this.salas.has(sala.codigo)) return false;
    this.salas.set(sala.codigo, JSON.stringify(sala));
    return true;
  }
  async guardar(sala: Sala, versionAnterior: number) {
    const actual = await this.leer(sala.codigo);
    if (!actual || actual.version !== versionAnterior) return false;
    this.salas.set(sala.codigo, JSON.stringify(sala));
    return true;
  }
}

const SCRIPT_GUARDAR = `
if redis.call('GET', KEYS[2]) == ARGV[1] then
  redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[4])
  redis.call('SET', KEYS[2], ARGV[3], 'EX', ARGV[4])
  return 1
end
return 0`;

class StoreRedis implements Store {
  readonly tipo = 'redis' as const;
  constructor(private url: string, private token: string) {}
  private async cmd(...args: (string | number)[]): Promise<unknown> {
    const r = await fetch(this.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args.map(String)),
    });
    const json = (await r.json()) as { result?: unknown; error?: string };
    if (!r.ok || json.error) throw new Error(`Redis: ${json.error ?? r.status}`);
    return json.result;
  }
  async leer(codigo: string) {
    const s = (await this.cmd('GET', clave(codigo))) as string | null;
    return s ? (JSON.parse(s) as Sala) : null;
  }
  async crear(sala: Sala) {
    const ok = await this.cmd('SET', claveVersion(sala.codigo), sala.version, 'NX', 'EX', TTL_SEGUNDOS);
    if (ok !== 'OK') return false;
    await this.cmd('SET', clave(sala.codigo), JSON.stringify(sala), 'EX', TTL_SEGUNDOS);
    return true;
  }
  async guardar(sala: Sala, versionAnterior: number) {
    const r = await this.cmd('EVAL', SCRIPT_GUARDAR, 2, clave(sala.codigo), claveVersion(sala.codigo),
      versionAnterior, JSON.stringify(sala), sala.version, TTL_SEGUNDOS);
    return Number(r) === 1;
  }
}

let instancia: Store | null = null;

export function obtenerStore(): Store {
  if (instancia) return instancia;
  const env = (globalThis as unknown as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
  const url = env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN;
  instancia = url && token ? new StoreRedis(url, token) : new StoreMemoria();
  return instancia;
}
