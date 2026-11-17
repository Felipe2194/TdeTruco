// Vercel Function: adapta la petición HTTP a la API de salas.
import { manejar } from '../src/server/api.js';

interface Req {
  method?: string;
  query?: Record<string, unknown>;
  body?: unknown;
}
interface Res {
  status(code: number): Res;
  setHeader(name: string, value: string): Res;
  json(body: unknown): void;
}

export default async function handler(req: Req, res: Res) {
  const r = await manejar(req.method ?? 'GET', req.query ?? {}, req.body ?? null);
  res.setHeader('Cache-Control', 'no-store');
  res.status(r.status).json(r.json);
}
