/*
 * Índice de la preview de rediseños: muestra cada estilo de lib/estilos-preview.ts en miniatura
 * (usando la galería de diseño) y permite verlo en grande o jugar con él.
 */
import { ESTILOS, type EstiloPreview } from '../../lib/estilos-preview';

const PANTALLAS = [
  { id: 'mesa4', nombre: 'Mesa 2 vs 2', url: 'parte=partida&n=4' },
  { id: 'sena', nombre: 'Seña del compañero', url: 'parte=partida&n=4&cartas=2&sena=anchoEspada&decir=' + encodeURIComponent('¡Voy!') },
  { id: 'mesa2', nombre: 'Mesa 1 vs 1', url: 'parte=partida&n=2' },
  { id: 'pica', nombre: 'Pica-pica 3 vs 3', url: 'parte=partida&n=6&pica=1&cartas=4' },
  { id: 'mesa8', nombre: 'Mesa 4 vs 4', url: 'parte=partida&n=8' },
  { id: 'personajes', nombre: 'Personajes y señas', url: 'parte=personajes' },
  { id: 'inicio', nombre: 'Inicio', url: 'parte=inicio' },
  { id: 'lobby', nombre: 'Lobby', url: 'parte=lobby&n=4' },
  { id: 'fin', nombre: 'Fin de partido', url: 'parte=fin' },
] as const;

const ANCHO = 1440, ALTO = 900;
let pantalla: string = new URLSearchParams(location.search).get('pantalla') ?? 'mesa4';
if (!PANTALLAS.some((p) => p.id === pantalla)) pantalla = 'mesa4';

const urlDe = (e: EstiloPreview, p = pantalla) => `/galeria.html?${PANTALLAS.find((x) => x.id === p)!.url}&estilo=${e.id}`;
const modo = (e: EstiloPreview) => (e.modo === 'tema' ? 'Usa el tema elegido' : e.modo === 'claro' ? 'Claro' : 'Oscuro');

const css = document.createElement('style');
css.textContent = `
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #0c0c10; color: #ececf1; font: 15px/1.45 system-ui, 'Segoe UI', sans-serif; }
  header { position: sticky; top: 0; z-index: 5; background: rgba(12,12,16,.88); backdrop-filter: blur(10px); border-bottom: 1px solid #23232b; padding: 14px 24px 12px; }
  h1 { margin: 0; font-size: 20px; letter-spacing: -.01em; } h1 span { color: #8b8b99; font-weight: 500; }
  .sub { color: #9a9aa8; font-size: 13px; margin: 2px 0 10px; }
  .tabs { display: flex; gap: 6px; flex-wrap: wrap; }
  .tabs button, .vista-barra button, .vista-barra a { background: #1a1a21; color: #d8d8e0; border: 1px solid #2a2a33; border-radius: 999px; padding: 6px 12px; font: 600 13px system-ui; cursor: pointer; text-decoration: none; }
  .tabs button.activa, .vista-barra button.activa { background: #ececf1; color: #0c0c10; border-color: #ececf1; }
  main { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 22px; padding: 22px 24px 60px; }
  .estilo { background: #131318; border: 1px solid #23232b; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
  .marco { position: relative; aspect-ratio: 16 / 10; overflow: hidden; background: #000; cursor: zoom-in; }
  .marco iframe { position: absolute; left: 0; top: 0; width: ${ANCHO}px; height: ${ALTO}px; border: 0; transform-origin: 0 0; pointer-events: none; }
  .datos { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
  .fila { display: flex; align-items: center; gap: 8px; }
  .num { font: 700 12px ui-monospace, monospace; color: #8b8b99; min-width: 22px; }
  .nombre { font-weight: 700; font-size: 16px; flex: 1; }
  .modo { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #23232b; color: #b7b7c4; white-space: nowrap; }
  .modo.claro { background: #f2f2f2; color: #222; } .modo.oscuro { background: #000; color: #ddd; border: 1px solid #333; }
  .desc { color: #9a9aa8; font-size: 13px; flex: 1; }
  .id { font: 12px ui-monospace, monospace; color: #6d6d7a; }
  .acciones { display: flex; gap: 6px; margin-top: 4px; }
  .acciones a, .acciones button { flex: 1; text-align: center; background: #1f1f27; color: #ececf1; border: 1px solid #2d2d37; border-radius: 9px; padding: 7px; font: 600 13px system-ui; text-decoration: none; cursor: pointer; }
  .acciones a.jugar { background: #7b1e2b; border-color: #9b2a3b; }
  #vista { position: fixed; inset: 0; z-index: 20; background: rgba(0,0,0,.92); display: none; flex-direction: column; }
  #vista.abierta { display: flex; }
  .vista-barra { display: flex; gap: 8px; align-items: center; padding: 10px 14px; flex-wrap: wrap; border-bottom: 1px solid #23232b; }
  .vista-barra .titulo { font-weight: 800; margin-right: 8px; min-width: 240px; }
  .vista-barra .sep { flex: 1; }
  #vista-marco { flex: 1; position: relative; }
  #vista-marco iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; background: #000; }
`;
document.head.appendChild(css);

const app = document.getElementById('app')!;
app.innerHTML = `
  <header>
    <h1>TdeTruco <span>· Preview de rediseños (${ESTILOS.length - 1} estilos + el actual)</span></h1>
    <div class="sub"><a href="/mockup.html" style="color:#ff9aa8;font-weight:700">Nuevo → mockup jugable con 8 estilos (Balatro, Inscryption, fileteado, minimal y tus referencias)</a><br>Mismo juego, mismas reglas y señas; cambia la estética y los personajes (criaturas amigables en vez de gauchos). Tocá una miniatura para verla en grande.</div>
    <div class="tabs">${PANTALLAS.map((p) => `<button data-pantalla="${p.id}" class="${p.id === pantalla ? 'activa' : ''}">${p.nombre}</button>`).join('')}</div>
  </header>
  <main>${ESTILOS.map((e, i) => `
    <article class="estilo" data-i="${i}">
      <div class="marco" data-ver="${i}"><iframe loading="lazy" title="${e.nombre}" tabindex="-1"></iframe></div>
      <div class="datos">
        <div class="fila"><span class="num">${i}</span><span class="nombre">${e.nombre}</span><span class="modo ${e.modo}">${modo(e)}</span></div>
        <div class="desc">${e.descripcion}</div>
        <div class="id">?estilo=${e.id}</div>
        <div class="acciones"><button data-ver="${i}">Ver grande</button><a class="jugar" href="/?estilo=${e.id}">Jugar con este estilo</a></div>
      </div>
    </article>`).join('')}
  </main>
  <div id="vista">
    <div class="vista-barra">
      <button data-mover="-1" title="Anterior (←)">←</button>
      <span class="titulo" id="vista-titulo"></span>
      <button data-mover="1" title="Siguiente (→)">→</button>
      <span class="sep"></span>
      ${PANTALLAS.map((p) => `<button data-vpantalla="${p.id}">${p.nombre}</button>`).join('')}
      <a id="vista-jugar" href="#">Jugar</a>
      <button data-cerrar title="Cerrar (Esc)">✕</button>
    </div>
    <div id="vista-marco"><iframe title="Vista grande"></iframe></div>
  </div>`;

// --- Miniaturas: escalar el iframe al ancho de la tarjeta
const marcos = [...app.querySelectorAll<HTMLDivElement>('.marco')];
const ajustar = new ResizeObserver((entradas) => {
  for (const en of entradas) {
    const f = en.target.querySelector('iframe')!;
    f.style.transform = `scale(${en.contentRect.width / ANCHO})`;
  }
});
marcos.forEach((m) => ajustar.observe(m));

function cargarMiniaturas() {
  marcos.forEach((m, i) => (m.querySelector('iframe')!.src = urlDe(ESTILOS[i])));
  app.querySelectorAll<HTMLButtonElement>('[data-pantalla]').forEach((b) => b.classList.toggle('activa', b.dataset.pantalla === pantalla));
  const q = new URLSearchParams(location.search);
  q.set('pantalla', pantalla);
  history.replaceState(null, '', `?${q}`);
}
app.querySelectorAll<HTMLButtonElement>('[data-pantalla]').forEach((b) => (b.onclick = () => {
  pantalla = b.dataset.pantalla!;
  cargarMiniaturas();
}));
cargarMiniaturas();

// --- Vista grande
const vista = document.getElementById('vista')!;
const vistaIframe = vista.querySelector('iframe')!;
let indice = 0, vPantalla = pantalla;
function mostrar() {
  const e = ESTILOS[indice];
  vistaIframe.src = urlDe(e, vPantalla);
  document.getElementById('vista-titulo')!.textContent = `${indice}. ${e.nombre}`;
  (document.getElementById('vista-jugar') as HTMLAnchorElement).href = `/?estilo=${e.id}`;
  vista.querySelectorAll<HTMLButtonElement>('[data-vpantalla]').forEach((b) => b.classList.toggle('activa', b.dataset.vpantalla === vPantalla));
}
function abrir(i: number) {
  indice = i;
  vPantalla = pantalla;
  vista.classList.add('abierta');
  mostrar();
}
const mover = (d: number) => { indice = (indice + d + ESTILOS.length) % ESTILOS.length; mostrar(); };
const cerrar = () => { vista.classList.remove('abierta'); vistaIframe.src = 'about:blank'; };
app.querySelectorAll<HTMLElement>('[data-ver]').forEach((el) => (el.onclick = () => abrir(Number(el.dataset.ver))));
vista.querySelectorAll<HTMLButtonElement>('[data-mover]').forEach((b) => (b.onclick = () => mover(Number(b.dataset.mover))));
vista.querySelectorAll<HTMLButtonElement>('[data-vpantalla]').forEach((b) => (b.onclick = () => { vPantalla = b.dataset.vpantalla!; mostrar(); }));
vista.querySelector<HTMLButtonElement>('[data-cerrar]')!.onclick = cerrar;
addEventListener('keydown', (ev) => {
  if (!vista.classList.contains('abierta')) return;
  if (ev.key === 'Escape') cerrar();
  if (ev.key === 'ArrowRight') mover(1);
  if (ev.key === 'ArrowLeft') mover(-1);
});
