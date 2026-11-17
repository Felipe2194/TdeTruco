import { describe, expect, it } from 'vitest';
import { Carta, poder, tantoEnvido } from '../src/engine/cartas';
import {
  Config, Partida, accionesPosibles, aplicar, dueloDe, enZonaPicaPica, ganadorDuelo, manoTerminada,
  nuevaPartida, offsetPicaPica, quienesActuan, repartir, siguientesEnvido, valorNoQuerido, valorQuerido,
} from '../src/engine/juego';
import { decidirBot } from '../src/engine/bot';

const c = (n: number, p: Carta['p']): Carta => ({ n, p });
const cfg = (jugadores: Config['jugadores'], extra: Partial<Config> = {}): Config => ({ jugadores, objetivo: 30, picaPica: true, ...extra });

/** Reparte y reemplaza las manos por las indicadas. */
function conManos(p: Partida, manos: Carta[][]) {
  repartir(p);
  p.ronda!.manos = manos.map((m) => m.slice());
  p.ronda!.originales = manos.map((m) => m.slice());
}

// Generador pseudoaleatorio con semilla, para simulaciones reproducibles.
function semilla(s: number) {
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe('cartas', () => {
  it('respeta la jerarquía del truco', () => {
    const orden = [c(1, 'espada'), c(1, 'basto'), c(7, 'espada'), c(7, 'oro'), c(3, 'copa'), c(2, 'oro'),
      c(1, 'copa'), c(12, 'basto'), c(11, 'oro'), c(10, 'copa'), c(7, 'copa'), c(6, 'oro'), c(5, 'basto'), c(4, 'espada')];
    for (let i = 1; i < orden.length; i++) expect(poder(orden[i - 1])).toBeGreaterThan(poder(orden[i]));
    expect(poder(c(1, 'oro'))).toBe(poder(c(1, 'copa')));
    expect(poder(c(7, 'basto'))).toBe(poder(c(7, 'copa')));
  });

  it('calcula el tanto de envido', () => {
    expect(tantoEnvido([c(7, 'oro'), c(6, 'oro'), c(1, 'espada')])).toBe(33);
    expect(tantoEnvido([c(12, 'copa'), c(11, 'copa'), c(3, 'oro')])).toBe(20);
    expect(tantoEnvido([c(12, 'copa'), c(5, 'oro'), c(3, 'espada')])).toBe(5);
    expect(tantoEnvido([c(10, 'basto'), c(11, 'oro'), c(12, 'espada')])).toBe(0);
    expect(tantoEnvido([c(4, 'basto'), c(5, 'basto'), c(7, 'basto')])).toBe(32);
  });
});

describe('bazas y pardas', () => {
  it('resuelve el ganador de la mano', () => {
    expect(ganadorDuelo([0, 0], 1)).toBe(0);
    expect(ganadorDuelo([0, 1], 1)).toBe(null);
    expect(ganadorDuelo([0, 1, 1], 0)).toBe(1);
    expect(ganadorDuelo([-1, 1], 0)).toBe(1);
    expect(ganadorDuelo([0, -1], 1)).toBe(0);
    expect(ganadorDuelo([0, 1, -1], 1)).toBe(0);
    expect(ganadorDuelo([-1, -1, 1], 0)).toBe(1);
    expect(ganadorDuelo([-1, -1, -1], 1)).toBe(1);
  });

  it('una parda entre compañeros no es parda', () => {
    const p = nuevaPartida(cfg(4));
    conManos(p, [[c(3, 'oro'), c(4, 'oro'), c(5, 'oro')], [c(4, 'copa'), c(5, 'copa'), c(6, 'copa')],
      [c(3, 'copa'), c(4, 'basto'), c(5, 'basto')], [c(6, 'basto'), c(6, 'espada'), c(5, 'espada')]]);
    aplicar(p, 0, { tipo: 'jugar', carta: c(3, 'oro') });
    aplicar(p, 1, { tipo: 'jugar', carta: c(4, 'copa') });
    aplicar(p, 2, { tipo: 'jugar', carta: c(3, 'copa') });
    aplicar(p, 3, { tipo: 'jugar', carta: c(6, 'basto') });
    expect(dueloDe(p, 0)!.resultados).toEqual([0]);
  });

  it('juega en orden antihorario y el ganador de la baza arranca la siguiente', () => {
    const p = nuevaPartida(cfg(4));
    conManos(p, [[c(4, 'oro'), c(4, 'copa'), c(5, 'oro')], [c(1, 'espada'), c(5, 'copa'), c(6, 'copa')],
      [c(6, 'oro'), c(4, 'basto'), c(5, 'basto')], [c(6, 'basto'), c(6, 'espada'), c(5, 'espada')]]);
    expect(quienesActuan(p)).toEqual([0]);
    aplicar(p, 0, { tipo: 'jugar', carta: c(4, 'oro') });
    expect(quienesActuan(p)).toEqual([1]);
    aplicar(p, 1, { tipo: 'jugar', carta: c(1, 'espada') });
    aplicar(p, 2, { tipo: 'jugar', carta: c(6, 'oro') });
    aplicar(p, 3, { tipo: 'jugar', carta: c(6, 'basto') });
    expect(quienesActuan(p)).toEqual([1]);
    expect(() => aplicar(p, 2, { tipo: 'jugar', carta: c(4, 'basto') })).toThrow();
  });
});

describe('envido', () => {
  it('encadena los cantos permitidos', () => {
    expect(siguientesEnvido([])).toEqual(['envido', 'real', 'falta']);
    expect(siguientesEnvido(['envido'])).toEqual(['envido', 'real', 'falta']);
    expect(siguientesEnvido(['envido', 'envido'])).toEqual(['real', 'falta']);
    expect(siguientesEnvido(['envido', 'real'])).toEqual(['falta']);
    expect(siguientesEnvido(['falta'])).toEqual([]);
  });

  it('calcula los puntos queridos y no queridos', () => {
    const p = nuevaPartida(cfg(2));
    p.puntos = [12, 20];
    expect(valorQuerido(['envido'], p)).toBe(2);
    expect(valorQuerido(['envido', 'envido', 'real'], p)).toBe(7);
    expect(valorQuerido(['envido', 'falta'], p)).toBe(10);
    expect(valorNoQuerido(['envido'])).toBe(1);
    expect(valorNoQuerido(['real'])).toBe(1);
    expect(valorNoQuerido(['envido', 'envido'])).toBe(2);
    expect(valorNoQuerido(['envido', 'real'])).toBe(2);
    expect(valorNoQuerido(['envido', 'envido', 'real', 'falta'])).toBe(7);
    expect(valorNoQuerido(['real', 'falta'])).toBe(3);
  });

  it('gana el tanto más alto y el empate lo gana la mano', () => {
    const p = nuevaPartida(cfg(2));
    conManos(p, [[c(7, 'oro'), c(6, 'oro'), c(1, 'espada')], [c(7, 'copa'), c(6, 'copa'), c(4, 'basto')]]);
    aplicar(p, 0, { tipo: 'envido', canto: 'envido' });
    aplicar(p, 1, { tipo: 'quiero' });
    expect(p.puntos).toEqual([2, 0]);

    const q = nuevaPartida(cfg(2));
    conManos(q, [[c(4, 'oro'), c(1, 'oro'), c(10, 'espada')], [c(7, 'copa'), c(6, 'copa'), c(4, 'basto')]]);
    aplicar(q, 0, { tipo: 'envido', canto: 'real' });
    aplicar(q, 1, { tipo: 'quiero' });
    expect(q.puntos).toEqual([0, 3]);
  });

  it('no querido suma al que cantó y cierra el envido', () => {
    const p = nuevaPartida(cfg(2));
    conManos(p, [[c(7, 'oro'), c(6, 'oro'), c(1, 'espada')], [c(7, 'copa'), c(6, 'copa'), c(4, 'basto')]]);
    aplicar(p, 0, { tipo: 'envido', canto: 'envido' });
    aplicar(p, 1, { tipo: 'envido', canto: 'real' });
    aplicar(p, 0, { tipo: 'noquiero' });
    expect(p.puntos).toEqual([0, 2]);
    expect(accionesPosibles(p, 0)).not.toContain('envido');
  });

  it('el envido está primero cuando cantan truco en la primera', () => {
    const p = nuevaPartida(cfg(2));
    conManos(p, [[c(7, 'oro'), c(6, 'oro'), c(1, 'espada')], [c(7, 'copa'), c(6, 'copa'), c(4, 'basto')]]);
    aplicar(p, 0, { tipo: 'truco' });
    expect(accionesPosibles(p, 1)).toEqual(expect.arrayContaining(['quiero', 'noquiero', 'truco', 'envido', 'mazo']));
    aplicar(p, 1, { tipo: 'envido', canto: 'envido' });
    expect(accionesPosibles(p, 0)).toEqual(expect.arrayContaining(['quiero', 'noquiero']));
    aplicar(p, 0, { tipo: 'quiero' });
    expect(p.puntos).toEqual([2, 0]);
    // sigue pendiente el truco para el equipo 1
    expect(accionesPosibles(p, 1)).toEqual(expect.arrayContaining(['quiero', 'noquiero']));
    expect(accionesPosibles(p, 1)).not.toContain('envido');
    aplicar(p, 1, { tipo: 'quiero' });
    expect(dueloDe(p, 0)!.truco.nivel).toBe(2);
  });

  it('la falta envido puede terminar el partido', () => {
    const p = nuevaPartida(cfg(2));
    p.puntos = [25, 10];
    conManos(p, [[c(7, 'oro'), c(6, 'oro'), c(1, 'espada')], [c(7, 'copa'), c(6, 'copa'), c(4, 'basto')]]);
    aplicar(p, 0, { tipo: 'envido', canto: 'falta' });
    aplicar(p, 1, { tipo: 'quiero' });
    expect(p.puntos[0]).toBe(30);
    expect(p.ganador).toBe(0);
    expect(accionesPosibles(p, 0)).toEqual([]);
  });
});

describe('truco', () => {
  it('no querido da el nivel anterior y termina la mano', () => {
    const p = nuevaPartida(cfg(2));
    repartir(p);
    aplicar(p, 0, { tipo: 'truco' });
    aplicar(p, 1, { tipo: 'noquiero' });
    expect(p.puntos).toEqual([1, 0]);
    expect(manoTerminada(p)).toBe(true);
  });

  it('retruco y vale cuatro: solo sube quien tiene el quiero', () => {
    const p = nuevaPartida(cfg(2));
    repartir(p);
    aplicar(p, 0, { tipo: 'truco' });
    aplicar(p, 1, { tipo: 'truco' }); // quiero retruco
    expect(dueloDe(p, 0)!.truco.nivel).toBe(2);
    aplicar(p, 0, { tipo: 'quiero' });
    expect(dueloDe(p, 0)!.truco.nivel).toBe(3);
    expect(dueloDe(p, 0)!.truco.puedeSubir).toBe(0);
    // el equipo 1 no puede subir
    expect(accionesPosibles(p, 0)).toContain('truco');
    aplicar(p, 0, { tipo: 'jugar', carta: p.ronda!.manos[0][0] });
    expect(accionesPosibles(p, 1)).not.toContain('truco');
  });

  it('irse al mazo en primera sin envido da un punto extra', () => {
    const p = nuevaPartida(cfg(2));
    repartir(p);
    aplicar(p, 0, { tipo: 'mazo' });
    expect(p.puntos).toEqual([0, 2]);
    const q = nuevaPartida(cfg(2));
    repartir(q);
    aplicar(q, 0, { tipo: 'truco' });
    aplicar(q, 1, { tipo: 'quiero' });
    aplicar(q, 0, { tipo: 'jugar', carta: q.ronda!.manos[0][0] });
    aplicar(q, 1, { tipo: 'mazo' });
    expect(q.puntos).toEqual([2, 0]);
  });
});

describe('pica-pica', () => {
  it('enfrenta a rivales en 3v3 y 4v4', () => {
    expect(offsetPicaPica(6)).toBe(3);
    expect(offsetPicaPica(8)).toBe(3);
    for (const n of [6, 8] as const) {
      const p = nuevaPartida(cfg(n));
      p.puntos = [8, 3];
      expect(enZonaPicaPica(p)).toBe(true);
      repartir(p);
      expect(p.ronda!.tipo).toBe('picapica');
      expect(p.ronda!.duelos).toHaveLength(n / 2);
      const vistos = new Set<number>();
      for (const d of p.ronda!.duelos) {
        expect(d.asientos).toHaveLength(2);
        expect(d.asientos[0] % 2).not.toBe(d.asientos[1] % 2);
        d.asientos.forEach((a) => vistos.add(a));
      }
      expect(vistos.size).toBe(n);
      repartir(p);
      expect(p.ronda!.tipo).toBe('redonda'); // se alterna
    }
  });

  it('no hay pica-pica en 2v2 ni fuera de la zona', () => {
    const p = nuevaPartida(cfg(4));
    p.puntos = [10, 10];
    expect(enZonaPicaPica(p)).toBe(false);
    const q = nuevaPartida(cfg(6));
    q.puntos = [26, 10];
    expect(enZonaPicaPica(q)).toBe(false);
  });
});

describe('partidas completas entre bots', () => {
  for (const n of [2, 4, 6, 8] as const) {
    for (const objetivo of [15, 30] as const) {
      it(`${n} jugadores a ${objetivo} terminan sin errores`, () => {
        let partidasConPica = 0;
        for (let s = 1; s <= 15; s++) {
          const rng = semilla(s * 7919 + n);
          const p = nuevaPartida({ jugadores: n, objetivo, picaPica: true }, s % n);
          let pasos = 0;
          let huboPica = false;
          while (p.ganador === null) {
            if (!p.ronda || manoTerminada(p)) {
              repartir(p, rng);
              if (p.ronda!.tipo === 'picapica') huboPica = true;
              continue;
            }
            const actores = quienesActuan(p);
            expect(actores.length).toBeGreaterThan(0);
            const a = actores[Math.floor(rng() * actores.length)];
            aplicar(p, a, decidirBot(p, a, { rng }));
            expect(++pasos).toBeLessThan(20000);
          }
          expect(Math.max(...p.puntos)).toBe(objetivo);
          if (huboPica) partidasConPica++;
        }
        if (n >= 6) expect(partidasConPica).toBeGreaterThan(5);
        else expect(partidasConPica).toBe(0);
      });
    }
  }
});
