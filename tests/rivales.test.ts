import { describe, expect, it } from 'vitest';
import { decidirBot } from '../src/engine/bot';
import { DATOS_RIVALES, datosRival } from '../src/engine/rivales';
import { nuevaPartida, repartir } from '../src/engine/juego';
import { manejar } from '../src/server/api';
import type { Vista } from '../src/server/vista';

async function post(cuerpo: Record<string, unknown>) {
  const r = await manejar('POST', {}, cuerpo);
  return { status: r.status, json: r.json as { token?: string; vista: Vista; error?: string } };
}

describe('rivales del 1v1', () => {
  it('se elige un rival por id o al azar, y no se aceptan inventados', async () => {
    const sapo = await post({ op: 'crear', nombre: 'Felipe', conBots: true, rival: 'sapo', config: { jugadores: 2, objetivo: 15 } });
    expect(sapo.json.vista.jugadores[1]).toMatchObject({ nombre: 'Sapardo', bot: true, rival: 'sapo' });
    expect(sapo.json.vista.eventos.some((e) => e.asiento === 1 && e.texto === datosRival('sapo')!.frase)).toBe(true);
    const azar = await post({ op: 'crear', nombre: 'Felipe', conBots: true, rival: 'azar', config: { jugadores: 2, objetivo: 15 } });
    expect(DATOS_RIVALES.map((r) => r.id)).toContain(azar.json.vista.jugadores[1]!.rival);
    const falso = await post({ op: 'crear', nombre: 'Felipe', conBots: true, rival: 'nadie', config: { jugadores: 2, objetivo: 15 } });
    expect(falso.status).toBe(400);
  });

  it('la personalidad cambia cómo juega: Sapardo canta envido mucho más que el robot', () => {
    const cuenta = (id: string) => {
      let envidos = 0;
      for (let i = 0; i < 400; i++) {
        const p = nuevaPartida({ jugadores: 2, objetivo: 30, picaPica: false }, 1);
        repartir(p);
        const a = decidirBot(p, 1, { perfil: datosRival(id)!.juego });
        if (a.tipo === 'envido') envidos++;
      }
      return envidos;
    };
    expect(cuenta('sapo')).toBeGreaterThan(cuenta('robot') * 1.5);
  });

  it('una partida contra un rival llega al final y el rival se despide', async () => {
    const { json } = await post({ op: 'crear', nombre: 'Felipe', conBots: true, rival: 'calavera', config: { jugadores: 2, objetivo: 15 } });
    const { token } = json;
    const codigo = json.vista.codigo;
    let v = json.vista;
    const textos: string[] = [];
    const reloj = { t: Date.now() };
    const original = Date.now;
    Date.now = () => reloj.t;
    try {
      for (let i = 0; i < 5000 && v.fase !== 'fin'; i++) {
        reloj.t += 3000;
        const cuerpo = v.acciones.includes('quiero') ? { op: 'accion', codigo, token, tipo: 'quiero' }
          : v.acciones.includes('jugar') ? { op: 'accion', codigo, token, tipo: 'jugar', carta: v.miMano[0] } : null;
        v = cuerpo ? (await post(cuerpo)).json.vista : ((await manejar('GET', { c: codigo, t: token, desde: v.seq }, null)).json as Vista);
        textos.push(...v.eventos.map((e) => e.texto ?? ''));
      }
    } finally {
      Date.now = original;
    }
    expect(v.fase).toBe('fin');
    const r = datosRival('calavera')!;
    expect(textos.some((t) => t === r.frases.gana || t === r.frases.pierde)).toBe(true);
  });
});
