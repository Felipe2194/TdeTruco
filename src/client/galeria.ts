/*
 * Galería de diseño: dibuja cada parte del juego por separado para poder capturarla y rediseñarla.
 *   /galeria.html?parte=<parte>&...   (ver scripts/capturas.mjs)
 */
import './estilos.css';
import type { Config } from '../engine/juego';
import { repartir } from '../engine/juego';
import { accionJugador, crearSala, iniciar, tick, type Sala } from '../server/sala';
import { construirVista, type Vista } from '../server/vista';
import { CRT_HTML, FONDO_SVG, MATE_SVG, porotosSVG } from './arte/escena';
import { avatarSVG, COLOR_EQUIPO, SENAS } from './arte/personajes';
import { cartaSVG, dorsoSVG, PERSONAJES, personajeSVG } from './arte/pixel';
import { Hud } from './hud';
import { Mesa } from './mesa';
import { pantallaFin, pantallaInicio, pantallaLobby } from './pantallas';

const q = new URLSearchParams(location.search);
const parte = q.get('parte') ?? 'indice';
const app = document.getElementById('app')!;
const nada = () => {};

declare global {
  interface Window { __galeria: Record<string, unknown>; __listo?: boolean }
}
window.__galeria = { cartaSVG, dorsoSVG, porotosSVG, personajeSVG, PERSONAJES, FONDO_SVG, MATE_SVG, SENAS };

const listo = (ms = 300) => setTimeout(() => (window.__listo = true), ms);

/** Simula una partida con bots hasta que haya `cartas` cartas en la mesa. */
function simular(jugadores: Config['jugadores'], cartas: number, opciones: { pica?: boolean; truco?: boolean } = {}): { sala: Sala; vista: Vista } {
  const { sala, token } = crearSala('Vos', { jugadores, objetivo: 30, picaPica: true }, 0);
  iniciar(sala, token, 0);
  const p = sala.partida!;
  if (opciones.pica) {
    p.puntos = [8, 6];
    p.ultimaFuePica = false;
    repartir(p);
  }
  let t = 0;
  for (let i = 0; i < 400; i++) {
    t += 5000;
    const v = construirVista(sala, token);
    const enMesa = v.duelos.reduce((s, d) => s + d.jugadas.length, 0);
    if (enMesa >= cartas || v.duelos.every((d) => d.fin)) break;
    if (v.acciones.includes('quiero')) accionJugador(sala, token, { tipo: 'quiero' }, t);
    else if (opciones.truco && v.acciones.includes('truco') && enMesa > 0) accionJugador(sala, token, { tipo: 'truco' }, t);
    else if (v.acciones.includes('jugar')) accionJugador(sala, token, { tipo: 'jugar', carta: v.miMano[v.miMano.length - 1] }, t);
    else tick(sala, t);
  }
  return { sala, vista: construirVista(sala, token) };
}

/** Vista ficticia para las pantallas de lobby y fin. */
function vistaFicticia(jugadores: Config['jugadores'], fase: Vista['fase']): Vista {
  const { sala, token } = crearSala('Felipe', { jugadores, objetivo: 30, picaPica: true }, 0);
  sala.codigo = 'MATE';
  sala.jugadores[1] = { nombre: 'Juana', token: 'x1', bot: false };
  if (jugadores > 2) sala.jugadores[2] = { nombre: 'Ramón', token: null, bot: true };
  sala.fase = fase;
  const v = construirVista(sala, token);
  if (fase === 'fin') {
    v.puntos = [30, 22];
    v.ganador = 0;
  }
  return v;
}

function fondoSolo(conMesa: boolean) {
  app.insertAdjacentHTML('beforeend', FONDO_SVG + (conMesa ? `<div id="mesa"></div>${MATE_SVG}` : '') + CRT_HTML);
}

function lienzo(html: string, fondo = '#1b2a30') {
  if (q.get('t') === '1') {
    fondo = 'transparent';
    document.documentElement.style.background = 'transparent';
  }
  document.body.style.background = fondo;
  app.innerHTML = `<div style="position:fixed;inset:0;display:grid;place-items:center">${html}</div>`;
}

switch (parte) {
  case 'fondo':
    fondoSolo(false);
    listo();
    break;

  case 'mesa':
    fondoSolo(true);
    listo();
    break;

  case 'personaje':
  case 'gaucho': {
    const i = Number(q.get('g') ?? 0);
    const equipo = Number(q.get('equipo') ?? i % 2);
    const sena = q.get('sena');
    lienzo(`<div id="pieza" class="avatar${sena ? ' s-' + sena : ''}" style="position:relative;width:380px;height:500px">${avatarSVG(i, COLOR_EQUIPO[equipo])}</div>`);
    // Sin animación de respiración ni parpadeo, para una captura estable.
    document.querySelectorAll<SVGElement>('.cabeza, .ojo-i, .ojo-d, .ojo-i-c, .ojo-d-c').forEach((e) => (e.style.animation = 'none'));
    listo(400);
    break;
  }

  case 'personajes': {
    // Los ocho personajes del estilo, con una seña distinta cada uno.
    const senas = [null, 'anchoEspada', 'anchoBasto', 'tres', 'dos', 'anchoFalso', 'envido', 'nada'];
    fondoSolo(true);
    app.insertAdjacentHTML('beforeend', `<div class="pantalla"><div class="tarjeta galeria-personajes">
      <div class="logo" style="font-size:24px">Personajes<small>con una seña cada uno</small></div>
      <div class="grilla-personajes">${senas.map((s, i) => `<figure>
        <div class="avatar${s ? ' s-' + s : ''}" style="position:relative;width:100%;aspect-ratio:224/300">${avatarSVG(i, COLOR_EQUIPO[i % 2])}</div>
        <figcaption>${s ? SENAS.find((x) => x.k === s)!.gesto : 'Neutral'}</figcaption></figure>`).join('')}</div></div></div>`);
    listo(400);
    break;
  }

  case 'marcador': {
    const n = Number(q.get('n') ?? 0);
    const objetivo = (Number(q.get('objetivo') ?? 30) === 15 ? 15 : 30) as 15 | 30;
    lienzo(`<div id="pieza" class="panel" style="position:relative;padding:14px 18px">${porotosSVG(n, objetivo, 80)}</div>`);
    listo();
    break;
  }

  case 'componentes': {
    document.body.style.background = '#1b2a30';
    app.innerHTML = `
      <div style="position:fixed;inset:0;padding:40px;display:flex;flex-wrap:wrap;gap:40px;align-content:flex-start">
        <div id="c-botones" class="panel" style="position:relative;display:flex;gap:8px;flex-wrap:wrap;width:520px">
          <button class="btn">Truco</button><button class="btn">Envido</button><button class="btn">Quiero</button>
          <button class="btn secundario">No quiero</button><button class="btn secundario">Irse al mazo</button>
          <button class="btn" disabled>Retruco</button><button class="btn grande">¡A jugar!</button>
        </div>
        <div id="c-opciones" class="panel" style="position:relative;width:420px">
          <div class="opciones"><button class="opcion">1 vs 1</button><button class="opcion activa">2 vs 2</button><button class="opcion">3 vs 3</button><button class="opcion">4 vs 4</button></div>
        </div>
        <div id="c-burbuja" style="position:relative;width:260px;height:90px">
          <div class="burbuja visible" style="position:absolute;left:130px;top:70px">¡Quiero retruco!</div>
        </div>
        <div id="c-burbuja-tanto" style="position:relative;width:200px;height:90px">
          <div class="burbuja visible" style="position:absolute;left:100px;top:70px">33</div>
        </div>
        <div id="c-cartel" style="position:relative;width:420px;height:110px">
          <div id="cartel" class="visible e0" style="position:absolute;top:55px;left:210px">Nosotros +2</div>
        </div>
        <div id="c-cartel-ellos" style="position:relative;width:420px;height:110px">
          <div class="cartel visible e1" style="position:absolute;top:55px;left:210px">Ellos +3</div>
        </div>
        <div id="c-placas" style="position:relative;width:520px;height:60px">
          <div class="placa" style="position:absolute;left:110px;top:15px"><i style="background:${COLOR_EQUIPO[0]}"></i>Ramón<small>compañero</small></div>
          <div class="placa" style="position:absolute;left:290px;top:15px"><i style="background:${COLOR_EQUIPO[1]}"></i>Facundo<small>rival</small></div>
          <div class="placa turno" style="position:absolute;left:450px;top:15px"><i style="background:${COLOR_EQUIPO[1]}"></i>Severino<small>rival</small></div>
        </div>
      </div>`;
    listo();
    break;
  }

  case 'hud': {
    const estado = q.get('estado') ?? 'turno';
    fondoSolo(true);
    const { vista } = simular(4, estado === 'turno' ? 0 : 1, { truco: estado === 'truco' });
    if (estado === 'truco') {
      // Forzar que el rival nos haya cantado truco.
      const d = vista.duelos[0];
      d.truco.pendiente = { nivel: 2, por: ((vista.yo + 1) % 2) as 0 | 1, asiento: (vista.yo + 1) % 4 };
      vista.acciones = ['quiero', 'noquiero', 'truco', 'mazo', 'sena'];
    }
    if (estado === 'envido') {
      const d = vista.duelos[0];
      d.envido = { cadena: ['envido'], pendiente: { por: ((vista.yo + 1) % 2) as 0 | 1, asiento: (vista.yo + 1) % 4 } };
      vista.acciones = ['quiero', 'noquiero', 'envido', 'real', 'falta', 'sena'];
    }
    if (estado === 'turno') vista.acciones = ['jugar', 'truco', 'envido', 'real', 'falta', 'mazo', 'voy', 'veni', 'sena'];
    vista.puntos = [12, 17];
    const hud = new Hud(app, { accion: nada, decir: nada, sena: nada });
    if (estado === 'plegado') {
      document.getElementById('senas')!.classList.add('plegado');
      document.getElementById('acciones')!.classList.add('plegado');
    } else {
      document.getElementById('senas')!.classList.remove('plegado');
      document.getElementById('acciones')!.classList.remove('plegado');
    }
    hud.actualizar(vista);
    listo();
    break;
  }

  case 'partida': {
    const n = Number(q.get('n') ?? 4) as Config['jugadores'];
    const cartas = Number(q.get('cartas') ?? n);
    const pica = q.get('pica') === '1';
    const { vista } = simular(n, cartas, { pica });
    const mesa = new Mesa(app);
    const hud = new Hud(app, { accion: nada, decir: nada, sena: nada });
    document.getElementById('senas')!.classList.remove('plegado');
    document.getElementById('acciones')!.classList.remove('plegado');
    hud.actualizar(vista);
    mesa.actualizar(vista);
    const sena = q.get('sena');
    const decir = q.get('decir');
    setTimeout(() => {
      const companero = (vista.yo + 2) % n;
      if (sena) mesa.fijarSena(n === 2 ? (vista.yo + 1) % n : companero, sena);
      if (decir) mesa.decir(n === 2 ? (vista.yo + 1) % n : companero, decir, 60000);
      listo(400);
    }, 2600);
    break;
  }

  case 'inicio':
    fondoSolo(true);
    app.insertAdjacentHTML('beforeend', '<div class="pantalla" id="pant"></div>');
    pantallaInicio(document.getElementById('pant')!, { alCrear: nada, alUnirse: nada });
    listo();
    break;

  case 'lobby': {
    fondoSolo(true);
    app.insertAdjacentHTML('beforeend', '<div class="pantalla" id="pant"></div>');
    pantallaLobby(document.getElementById('pant')!, vistaFicticia(Number(q.get('n') ?? 4) as Config['jugadores'], 'lobby'),
      { alSentarse: nada, alBot: nada, alIniciar: nada, alSalir: nada });
    listo();
    break;
  }

  case 'fin': {
    fondoSolo(true);
    app.insertAdjacentHTML('beforeend', '<div class="pantalla" id="pant"></div>');
    pantallaFin(document.getElementById('pant')!, vistaFicticia(4, 'fin'), { alRevancha: nada, alSalir: nada });
    listo();
    break;
  }

  default:
    lienzo(`<div class="tarjeta"><div class="logo" style="font-size:32px">Galería de diseño</div>
      <p class="nota">Partes: fondo, mesa, personaje (o gaucho), personajes, marcador, componentes, hud, partida, inicio, lobby, fin.</p></div>`);
    listo();
}
