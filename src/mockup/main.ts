/*
 * Mockup jugable de una mano de truco con 8 estilos visuales intercambiables en vivo.
 *   /mockup.html?estilo=<id>   (también con las teclas 1 a 8)
 *   &demo=jugada               arranca con las cartas ya jugadas (para capturas)
 */
import './estilos.css';
import {
  BOTELLAS_SVG, cartaSVG, dorsoSVG, ESTANTES_SVG, FILETE_SVG, fosforosSVG, MATE_SVG, PAPEL_SVG,
  rivalSVG, SIGILO_SVG, SOL_SVG, VELA_SVG, type Carta,
} from './arte';
import { cartaPixelSVG, dorsoPixelSVG } from './pixel';

const ESTILOS = [
  { id: 'crt', nombre: 'Retro Pixel / CRT', sub: 'ref. Balatro', grupo: 0 },
  { id: 'bodegon', nombre: 'Bodegón Nocturno', sub: 'ref. Inscryption', grupo: 0 },
  { id: 'fileteado', nombre: 'Fileteado Porteño', sub: 'tradicional ilustrado', grupo: 0 },
  { id: 'minimal', nombre: 'Minimalista Dark', sub: 'moderno / flat', grupo: 0 },
  { id: 'tarot', nombre: 'Mesa de Tarot', sub: 'terciopelo y oro', grupo: 1 },
  { id: 'ritual', nombre: 'Taberna Ritual', sub: 'pixel art cálido', grupo: 1 },
  { id: 'historieta', nombre: 'Historieta', sub: 'tinta gruesa', grupo: 1 },
  { id: 'almacen', nombre: 'Almacén Ilustrado', sub: 'dibujo animado', grupo: 1 },
] as const;

const MANO: Carta[] = [{ n: 1, palo: 'espada' }, { n: 7, palo: 'espada' }, { n: 3, palo: 'basto' }];
const CARTA_RIVAL: Carta = { n: 7, palo: 'oro' };
const JERARQUIA: Record<string, number> = { '1espada': 14, '7espada': 12, '7oro': 11, '3basto': 10 };
const NOMBRE_TRUCO = ['', '', 'Truco', 'Retruco', 'Vale cuatro'];

const q = new URLSearchParams(location.search);
const fuentes = document.createElement('link');
fuentes.rel = 'stylesheet';
fuentes.href = 'https://fonts.googleapis.com/css2?' + [
  'Press+Start+2P', 'VT323', 'Pixelify+Sans:wght@500;700', 'IM+Fell+English:ital@0;1', 'IM+Fell+English+SC', 'Special+Elite',
  'Sancreek', 'Alegreya+Sans:wght@500;800', 'Inter:wght@400;500;600;700', 'Cinzel:wght@600;800', 'Cormorant+Garamond:ital,wght@0,600;1,600',
  'Bangers', 'Patrick+Hand', 'Rye', 'Itim',
].map((f) => 'family=' + f).join('&') + '&display=swap';
document.head.appendChild(fuentes);

const carta = (c: Carta, extra = '') => `<div class="carta ${extra}" data-palo="${c.palo}" data-clave="${c.n}${c.palo}">
  <div class="cara frente">${cartaSVG(c)}${cartaPixelSVG(c)}</div><div class="cara dorso">${dorsoSVG()}${dorsoPixelSVG()}</div></div>`;

document.getElementById('app')!.innerHTML = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <filter id="pixelar" x="0" y="0" width="1" height="1">
    <feFlood x="1" y="1" width="1" height="1"/><feComposite width="4" height="4"/><feTile result="a"/>
    <feComposite in="SourceGraphic" in2="a" operator="in"/><feMorphology operator="dilate" radius="1.5"/>
  </filter>
  <filter id="papel-roto"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3" seed="4"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter>
</defs></svg>
<div id="escena">
  <div class="capa d-remolino"></div>
  <div class="capa d-estantes">${ESTANTES_SVG}</div>
  <div class="capa d-tablones"></div>
  <div class="d-cartel"><span>El Almacén de Don Tito</span></div>
  <div class="d-botellas d-izq">${BOTELLAS_SVG}</div>
  <div class="d-botellas d-der">${BOTELLAS_SVG}</div>
  <div class="d-filete d-f1">${FILETE_SVG}</div><div class="d-filete d-f2">${FILETE_SVG}</div>
  <div class="d-filete d-f3">${FILETE_SVG}</div><div class="d-filete d-f4">${FILETE_SVG}</div>

  <div id="rival"><div class="retrato">${rivalSVG()}</div><div class="placa-rival">Don Tito</div></div>
  <div id="mesa">
    <div class="m-sol">${SOL_SVG}</div>
    <div class="m-sigilo">${SIGILO_SVG}</div>
    <div class="m-rombo"></div>
    <div class="m-grilla"></div>
  </div>
  <div class="d-vela d-v1">${VELA_SVG}</div>
  <div class="d-vela d-v2">${VELA_SVG}</div>
  <div class="d-papel d-p1">${PAPEL_SVG}</div>
  <div class="d-papel d-p2">${PAPEL_SVG}</div>
  <div id="abanico-rival">${[0, 1, 2].map((i) => carta(CARTA_RIVAL, `boca-abajo r${i}`)).join('')}</div>

  <div id="jugadas"><div class="slot slot-rival"></div><div class="slot slot-yo"></div></div>
  <div id="mate">${MATE_SVG}</div>
  <div id="anotador">
    <div class="an-titulo">Partido a 15</div>
    <div class="an-cols">
      <div><div class="an-eq">Nosotros</div><div class="an-num" data-n="0"></div><div data-f="0"></div></div>
      <div><div class="an-eq">Ellos</div><div class="an-num" data-n="1"></div><div data-f="1"></div></div>
    </div>
  </div>

  <div id="globo-rival" class="globo"></div>
  <div id="globo-yo" class="globo"></div>

  <div id="mano">${MANO.map((c, i) => carta(c, 'en-mano')).join('')}</div>

  <div id="info">
    <div class="in-linea"><span>Ronda</span><b data-i="ronda">Primera</b></div>
    <div class="in-linea"><span>En juego</span><b data-i="truco">1 punto</b></div>
    <div id="estado"></div>
    <button class="btn btn-chico" id="otra">Repartir otra mano</button>
  </div>
  <div id="acciones">
    <div id="respuesta"><button class="btn" data-r="quiero">Quiero</button><button class="btn sec" data-r="noquiero">No quiero</button></div>
    <button class="btn" data-a="truco">Truco</button>
    <button class="btn" data-a="envido">Envido</button>
    <button class="btn" data-a="flor">Flor</button>
    <button class="btn sec" data-a="mazo">Irse al mazo</button>
  </div>
  <div class="capa d-luz"></div>
  <div class="capa d-grano"></div>
  <div class="capa d-crt"></div>
</div>
<nav id="barra">
  ${[0, 1].map((g) => `<div class="grupo"><span class="grupo-titulo">${g ? 'Refs' : 'Pedidos'}</span>
    ${ESTILOS.map((e, i) => e.grupo === g ? `<button data-estilo="${e.id}" title="Tecla ${i + 1}"><b>${e.nombre}</b><small>${e.sub}</small></button>` : '').join('')}</div>`).join('')}
</nav>`;

// --------------------------------------------------------------- Estilos
function ponerEstilo(id: string) {
  if (!ESTILOS.some((e) => e.id === id)) id = 'crt';
  document.body.dataset.estilo = id;
  document.querySelectorAll<HTMLButtonElement>('#barra [data-estilo]').forEach((b) => b.classList.toggle('activo', b.dataset.estilo === id));
  const u = new URLSearchParams(location.search);
  u.set('estilo', id);
  history.replaceState(null, '', `?${u}`);
}
document.querySelectorAll<HTMLButtonElement>('#barra [data-estilo]').forEach((b) => (b.onclick = () => ponerEstilo(b.dataset.estilo!)));
addEventListener('keydown', (e) => {
  const i = Number(e.key) - 1;
  if (i >= 0 && i < ESTILOS.length) ponerEstilo(ESTILOS[i].id);
});
ponerEstilo(q.get('estilo') ?? 'crt');

// --------------------------------------------------------------- Estado de la mano
const $ = <T extends HTMLElement>(s: string) => document.querySelector(s) as T;
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));
const puntos: [number, number] = [7, 9];

let estado = {
  jugada: false, // ya jugué mi carta
  envido: false, // ya se cantó (o se jugó) el envido
  trucoNivel: 1, // puntos en juego por el truco
  quieroMio: false, // tengo el quiero (puedo subir el truco)
  pendiente: null as null | 'envido' | 'truco', // canto del rival esperando respuesta
  ocupado: false,
  numeroMano: 0,
};

function decir(quien: 'rival' | 'yo', texto: string, ms = 1900) {
  const g = $(quien === 'rival' ? '#globo-rival' : '#globo-yo');
  g.textContent = texto;
  g.classList.remove('visible');
  void g.offsetWidth;
  g.classList.add('visible');
  clearTimeout(Number(g.dataset.t));
  if (ms > 0) g.dataset.t = String(setTimeout(() => g.classList.remove('visible'), ms));
  if (quien === 'rival') {
    $('#rival').classList.add('hablando');
    setTimeout(() => $('#rival').classList.remove('hablando'), 650);
  }
}

function sumar(eq: 0 | 1, n: number) {
  puntos[eq] = Math.min(15, puntos[eq] + n);
  dibujarPuntos(eq);
}

function dibujarPuntos(resaltar?: 0 | 1) {
  for (const eq of [0, 1] as const) {
    $(`[data-n="${eq}"]`).textContent = String(puntos[eq]);
    $(`[data-f="${eq}"]`).innerHTML = fosforosSVG(puntos[eq]);
  }
  if (resaltar !== undefined) {
    const el = $(`[data-n="${resaltar}"]`);
    el.classList.remove('suma');
    void el.offsetWidth;
    el.classList.add('suma');
  }
}

function actualizarControles(texto?: string) {
  const s = estado;
  const btn = (a: string) => $<HTMLButtonElement>(`[data-a="${a}"]`);
  $('#respuesta').classList.toggle('visible', s.pendiente !== null);
  const libre = !s.ocupado;
  // Truco: si nadie cantó, "Truco"; si yo tengo el quiero, puedo subir.
  const puedeTruco = s.trucoNivel === 1 || (s.quieroMio && s.trucoNivel < 4) || (s.pendiente === 'truco' && s.trucoNivel < 4);
  const proximo = s.trucoNivel + 1;
  btn('truco').textContent = proximo <= 4 ? (s.pendiente === 'truco' ? `Quiero ${NOMBRE_TRUCO[proximo].toLowerCase()}` : NOMBRE_TRUCO[proximo]) : 'Vale cuatro';
  btn('truco').disabled = !libre || !puedeTruco || s.pendiente === 'envido';
  btn('envido').disabled = !libre || s.envido || s.jugada || s.pendiente === 'envido';
  btn('flor').disabled = !libre || s.jugada;
  btn('mazo').disabled = !libre;
  document.querySelectorAll<HTMLButtonElement>('#respuesta button').forEach((b) => (b.disabled = !libre));
  $('#mano').classList.toggle('bloqueada', s.jugada || s.pendiente !== null || s.ocupado);
  $('[data-i="truco"]').textContent = s.trucoNivel === 1 ? '1 punto' : `${NOMBRE_TRUCO[s.trucoNivel]} (${s.trucoNivel})`;
  if (texto !== undefined) $('#estado').textContent = texto;
}

async function conBloqueo(fn: () => Promise<void>) {
  if (estado.ocupado) return;
  estado.ocupado = true;
  actualizarControles();
  try { await fn(); } finally {
    estado.ocupado = false;
    actualizarControles();
  }
}

/** Mueve una carta a un lugar nuevo del DOM animando el recorrido (FLIP). */
function mover(el: HTMLElement, destino: HTMLElement, ms = 520) {
  const a = el.getBoundingClientRect();
  const tapada = el.classList.contains('boca-abajo');
  destino.appendChild(el);
  el.classList.remove('en-mano', 'boca-abajo', 'r0', 'r1', 'r2');
  el.style.removeProperty('--x');
  const b = el.getBoundingClientRect();
  const dx = a.left + a.width / 2 - (b.left + b.width / 2), dy = a.top + a.height / 2 - (b.top + b.height / 2);
  el.animate([
    { transform: `translate(${dx}px, ${dy}px) scale(${a.width / b.width}) rotate(-8deg)${tapada ? ' rotateY(180deg)' : ''}` },
    { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
  ], { duration: ms, easing: 'cubic-bezier(.3,.7,.2,1.1)' });
}

async function resolverEnvido(yoCante: boolean) {
  estado.envido = true;
  if (yoCante) {
    decir('yo', '¡Envido!');
    await espera(1000);
    decir('rival', '¡Quiero!');
  } else {
    decir('yo', '¡Quiero!');
  }
  await espera(1100);
  decir('rival', 'Tengo 27…');
  await espera(1200);
  decir('yo', '¡28!');
  await espera(1100);
  decir('rival', 'Son buenas…');
  sumar(0, 2);
  actualizarControles('Envido para Nosotros (+2)');
}

async function jugarCarta(el: HTMLElement) {
  if (estado.jugada || estado.pendiente || estado.ocupado) return;
  await conBloqueo(async () => {
    estado.jugada = true;
    mover(el, $('.slot-yo'));
    await espera(800);
    const delRival = $('#abanico-rival .carta');
    mover(delRival, $('.slot-rival'), 640);
    await espera(700);
    const mia = JERARQUIA[el.dataset.clave!], suya = JERARQUIA['7oro'];
    const gano = mia > suya;
    (gano ? el : delRival).classList.add('ganadora');
    if (el.dataset.clave === '1espada') decir('rival', '¡Uh! ¡El macho!');
    else decir('rival', gano ? 'Bien jugada, pibe' : '¡Esa es mía!');
    $('[data-i="ronda"]').textContent = 'Primera terminada';
    actualizarControles(gano ? 'La primera es nuestra' : 'La primera es de ellos');
  });
}

async function accion(a: string) {
  await conBloqueo(async () => {
    const s = estado;
    if (a === 'envido') {
      // "El envido está primero": se puede cantar aunque el rival haya cantado truco.
      const habiaTruco = s.pendiente === 'truco';
      if (habiaTruco) s.pendiente = null;
      await resolverEnvido(true);
      if (habiaTruco) {
        await espera(900);
        decir('rival', 'Y el truco, ¿lo querés?', 0);
        s.pendiente = 'truco';
      }
    } else if (a === 'truco') {
      if (s.pendiente === 'truco') {
        s.pendiente = null;
        s.trucoNivel += 1;
        decir('yo', `¡Quiero ${NOMBRE_TRUCO[s.trucoNivel].toLowerCase()}!`);
        await espera(1100);
        decir('rival', '¡Quiero!');
        s.quieroMio = false;
      } else {
        s.trucoNivel += 1;
        decir('yo', `¡${NOMBRE_TRUCO[s.trucoNivel]}!`);
        await espera(1100);
        decir('rival', '¡Quiero!');
        s.quieroMio = false;
      }
      actualizarControles(`${NOMBRE_TRUCO[s.trucoNivel]} querido`);
    } else if (a === 'flor') {
      decir('yo', '¡Flor!');
      await espera(1000);
      decir('rival', 'Acá se juega sin flor, che 😉', 2400);
    } else if (a === 'mazo') {
      decir('yo', 'Me voy al mazo…');
      const pts = s.pendiente === 'truco' ? s.trucoNivel - 1 : s.trucoNivel + (s.pendiente === 'envido' ? 1 : 0);
      await espera(900);
      decir('rival', '¡Gracias, pibe!');
      sumar(1, pts);
      s.pendiente = null;
      actualizarControles(`Ellos +${pts}`);
      await espera(1300);
      s.ocupado = false;
      await repartir();
    }
  });
}

async function responder(r: string) {
  await conBloqueo(async () => {
    const s = estado;
    if (s.pendiente === 'envido') {
      s.pendiente = null;
      if (r === 'quiero') await resolverEnvido(false);
      else {
        s.envido = true;
        decir('yo', 'No quiero');
        sumar(1, 1);
        actualizarControles('Envido no querido: Ellos +1');
      }
    } else if (s.pendiente === 'truco') {
      s.pendiente = null;
      if (r === 'quiero') {
        decir('yo', '¡Quiero!');
        s.quieroMio = true;
        actualizarControles('Truco querido: podés subir a retruco');
      } else {
        decir('yo', 'No quiero');
        sumar(1, s.trucoNivel - 1);
        actualizarControles('Truco no querido: Ellos +1');
        await espera(1300);
        s.ocupado = false;
        await repartir();
      }
    }
  });
}

async function repartir() {
  estado.numeroMano++;
  const rivalCanta: 'envido' | 'truco' = estado.numeroMano % 2 ? 'envido' : 'truco';
  estado = { ...estado, jugada: false, envido: false, trucoNivel: 1, quieroMio: false, pendiente: null, ocupado: true };
  $('#globo-rival').classList.remove('visible');
  $('#globo-yo').classList.remove('visible');
  document.querySelectorAll('#jugadas .carta').forEach((c) => c.remove());
  $('#mano').innerHTML = MANO.map((c) => carta(c, 'en-mano entrando')).join('');
  $('#abanico-rival').innerHTML = [0, 1, 2].map((i) => carta(CARTA_RIVAL, `boca-abajo r${i}`)).join('');
  $('#mano').querySelectorAll<HTMLElement>('.carta').forEach((el) => (el.onclick = () => jugarCarta(el)));
  $('[data-i="ronda"]').textContent = 'Primera';
  actualizarControles('');
  await espera(700);
  // El rival canta para que la mano arranque con algo que responder.
  if (rivalCanta === 'truco') estado.trucoNivel = 2;
  decir('rival', rivalCanta === 'envido' ? '¡Envido!' : '¡Truco!', 0);
  estado.pendiente = rivalCanta;
  estado.ocupado = false;
  actualizarControles(rivalCanta === 'envido' ? 'Don Tito cantó envido. ¿Querés?' : 'Don Tito cantó truco. ¿Querés?');
}

document.querySelectorAll<HTMLButtonElement>('[data-a]').forEach((b) => (b.onclick = () => accion(b.dataset.a!)));
document.querySelectorAll<HTMLButtonElement>('[data-r]').forEach((b) => (b.onclick = () => responder(b.dataset.r!)));
$('#otra').onclick = () => { if (!estado.ocupado) repartir(); };

dibujarPuntos();
if (q.get('demo') === 'jugada') {
  // Estado fijo para capturas: ya se jugó el ancho contra el 7 de oro y el rival canta truco.
  estado.numeroMano = 1;
  $('#mano').querySelectorAll<HTMLElement>('.carta').forEach((el) => (el.onclick = () => jugarCarta(el)));
  const ancho = $('#mano .carta');
  $('.slot-yo').appendChild(ancho);
  ancho.classList.remove('en-mano');
  const r = $('#abanico-rival .carta');
  $('.slot-rival').appendChild(r);
  r.classList.remove('boca-abajo', 'r0');
  ancho.classList.add('ganadora');
  estado.jugada = true;
  estado.envido = true;
  estado.trucoNivel = 2;
  estado.pendiente = 'truco';
  decir('rival', '¡Truco!', 0);
  actualizarControles('Don Tito cantó truco. ¿Querés?');
} else {
  repartir();
}

// --------------------------------------------------------------- ?baraja=1: las 40 cartas, para revisar el arte
if (q.get('baraja')) {
  const palos = ['espada', 'basto', 'oro', 'copa'] as const;
  const numeros = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
  const capa = document.createElement('div');
  capa.id = 'baraja';
  capa.innerHTML = palos.map((p) => `<div class="fila-baraja">${numeros.map((n) => carta({ n, palo: p })).join('')}</div>`).join('')
    + `<div class="fila-baraja">${carta(CARTA_RIVAL, 'boca-abajo')}</div>`;
  document.getElementById('escena')!.appendChild(capa);
}
