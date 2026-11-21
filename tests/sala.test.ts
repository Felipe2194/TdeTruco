import { describe, expect, it } from 'vitest';
import { manejar } from '../src/server/api';
import type { Vista } from '../src/server/vista';

async function post(cuerpo: Record<string, unknown>) {
  const r = await manejar('POST', {}, cuerpo);
  if (r.status !== 200) throw new Error(JSON.stringify(r.json));
  return r.json as { token?: string; vista: Vista };
}

describe('salas', () => {
  it('lobby: crear, unirse, bots e inicio', async () => {
    const { token: host, vista } = await post({ op: 'crear', nombre: 'Felipe', config: { jugadores: 4, objetivo: 15 } });
    expect(vista.fase).toBe('lobby');
    expect(vista.yo).toBe(0);
    const { token: invitado, vista: v2 } = await post({ op: 'unirse', codigo: vista.codigo, nombre: 'Juana' });
    expect(v2.yo).toBe(1);
    await post({ op: 'sentarse', codigo: vista.codigo, token: invitado, asiento: 2 }); // compañera
    const r = await manejar('POST', {}, { op: 'iniciar', codigo: vista.codigo, token: invitado });
    expect(r.status).toBe(400); // solo el host inicia
    const { vista: v3 } = await post({ op: 'iniciar', codigo: vista.codigo, token: host });
    expect(v3.fase).toBe('jugando');
    expect(v3.jugadores.filter((j) => j?.bot)).toHaveLength(2);
    expect(v3.miMano).toHaveLength(3);
  });

  it('las señas solo están cuando hay compañero en el duelo', async () => {
    const uno = await post({ op: 'crear', nombre: 'Felipe', conBots: true, config: { jugadores: 2, objetivo: 15 } });
    expect(uno.vista.acciones).not.toContain('sena');
    const r = await manejar('POST', {}, { op: 'sena', codigo: uno.vista.codigo, token: uno.token, clave: 'tres' });
    expect(r.status).toBe(400);
    const dos = await post({ op: 'crear', nombre: 'Felipe', conBots: true, config: { jugadores: 4, objetivo: 15 } });
    expect(dos.vista.acciones).toContain('sena');
  });

  it('una partida contra bots llega al final', async () => {
    const { token, vista } = await post({ op: 'crear', nombre: 'Felipe', conBots: true, config: { jugadores: 6, objetivo: 15 } });
    const codigo = vista.codigo;
    let v = vista;
    let ciclos = 0;
    let vioCartaAjena = false;
    const reloj = { t: Date.now() };
    const original = Date.now;
    Date.now = () => reloj.t;
    try {
      while (v.fase !== 'fin') {
        expect(++ciclos).toBeLessThan(5000);
        reloj.t += 3000;
        if (v.acciones.includes('jugar') || v.acciones.includes('quiero')) {
          const cuerpo = v.acciones.includes('quiero')
            ? { op: 'accion', codigo, token, tipo: 'quiero' }
            : { op: 'accion', codigo, token, tipo: 'jugar', carta: v.miMano[0] };
          v = (await post(cuerpo)).vista;
          continue;
        }
        const r = await manejar('GET', { c: codigo, t: token, desde: v.seq }, null);
        v = r.json as Vista;
        // Nunca se ven las cartas en mano de otros jugadores.
        expect(JSON.stringify(v)).not.toContain('"manos"');
        if (v.duelos.some((d) => d.jugadas.some((j) => j.asiento !== v.yo))) vioCartaAjena = true;
      }
    } finally {
      Date.now = original;
    }
    expect(v.ganador === 0 || v.ganador === 1).toBe(true);
    expect(Math.max(...v.puntos)).toBe(15);
    expect(vioCartaAjena).toBe(true);
  });
});
