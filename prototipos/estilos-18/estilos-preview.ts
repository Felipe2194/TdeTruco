/*
 * Preview de rediseños estéticos de TdeTruco.
 *
 *   ?estilo=<id>   elige el estilo (se recuerda en localStorage). ?estilo=actual vuelve al diseño de siempre.
 *
 * Cada estilo define: nombre, modo (claro/oscuro), fuentes, colores de equipo, dorso de las cartas
 * y cómo se dibujan los personajes. El CSS de cada uno está en lib/estilos-preview.css
 * bajo html[data-estilo="<id>"].
 */
import './estilos-preview.css';
import { configurarDorso } from '../src/client/arte/cartas';
import { CRIATURAS, criaturaSVG, type EstiloPersonaje } from '../src/client/arte/criaturas';
import { COLOR_EQUIPO, GAUCHOS, gauchoSVG } from '../src/client/arte/gauchos';

export type Modo = 'claro' | 'oscuro' | 'tema';

export interface EstiloPreview {
  id: string;
  nombre: string;
  modo: Modo;
  descripcion: string;
  /** Familias de Google Fonts (formato de la URL css2). */
  fuentes?: string[];
  /** Colores de los equipos [celeste, colorado], adaptados al estilo. */
  equipos?: [string, string];
  /** Dorso de las cartas: [fondo claro, fondo oscuro, líneas, letra]. */
  dorso?: [string, string, string, string];
  personajes?: EstiloPersonaje;
}

const PASTEL = ['#ffb4a2', '#cdb4db', '#a2d2ff', '#ffd6a5', '#b9fbc0', '#fdffb6', '#ffc8dd', '#bde0fe'];

export const ESTILOS: EstiloPreview[] = [
  {
    id: 'actual', nombre: 'Actual (sin cambios)', modo: 'tema',
    descripcion: 'La pulpería ilustrada con gauchos, tal como está hoy.',
  },
  {
    id: 'neo-brutalismo', nombre: 'Neo brutalismo', modo: 'claro',
    descripcion: 'Bordes negros gruesos, sombras duras desplazadas y colores saturados.',
    fuentes: ['Archivo+Black', 'Space+Grotesk:wght@500;700'],
    equipos: ['#4d9fff', '#ff4d4d'],
    dorso: ['#ffd23f', '#ff4d4d', '#111111', '#111111'],
    personajes: { trazo: '#111', grosor: 5, paleta: ['#ffd23f', '#ff9f1c', '#ffffff', '#ff8fab', '#7bdff2', '#b2f7ef', '#ff6b6b', '#9bf6ff'], sombrero: '#111', cachete: '#ff4d6d' },
  },
  {
    id: 'brutalismo', nombre: 'Brutalismo puro', modo: 'claro',
    descripcion: 'HTML crudo: monoespaciada, blanco y negro, sin adornos ni esquinas redondas.',
    fuentes: ['IBM+Plex+Mono:wght@400;700'],
    equipos: ['#0000ee', '#ee0000'],
    dorso: ['#ffffff', '#000000', '#ffffff', '#ffffff'],
    personajes: { trazo: '#000', grosor: 3, paleta: ['#fff', '#ddd', '#fff', '#ccc', '#eee', '#fff', '#ddd', '#ccc'], pupila: '#000', sombrero: '#000', cachete: '#ee0000' },
  },
  {
    id: 'memphis', nombre: 'Memphis', modo: 'claro',
    descripcion: 'Formas geométricas, confeti, zigzags y colores de los 80.',
    fuentes: ['Bungee', 'Rubik:wght@500;700;800'],
    equipos: ['#00a6ed', '#ff3d7f'],
    dorso: ['#ffcc00', '#ff3d7f', '#1a1a2e', '#1a1a2e'],
    personajes: { trazo: '#1a1a2e', grosor: 4.5, paleta: ['#ffcc00', '#2ec4b6', '#ffffff', '#ff9f1c', '#c77dff', '#ffd6e0', '#ff3d7f', '#7bd389'], sombrero: '#1a1a2e', cachete: '#ff3d7f' },
  },
  {
    id: 'y2k', nombre: 'Y2K', modo: 'claro',
    descripcion: 'Cromo, burbujas brillosas, brillitos y lila/celeste bebé de los 2000.',
    fuentes: ['Audiowide', 'Comfortaa:wght@500;700'],
    equipos: ['#3fa9ff', '#ff4fa3'],
    dorso: ['#e0c3fc', '#8ec5fc', '#ffffff', '#7a3cff'],
    personajes: { trazo: '#5b3a9e', grosor: 3.5, paleta: ['#ffb3e6', '#c7b8ff', '#e8f4ff', '#b8f2ff', '#d6c4ff', '#fff0fb', '#ff9ed2', '#aef5d8'], sombrero: '#7a3cff', cachete: '#ff4fa3', filtro: 'arcilla' },
  },
  {
    id: 'retro70', nombre: 'Retro 70s', modo: 'claro',
    descripcion: 'Atardecer en franjas mostaza, naranja y marrón; tipografía gordita.',
    fuentes: ['Shrikhand', 'Rubik:wght@500;700'],
    equipos: ['#3d8c95', '#d9481c'],
    dorso: ['#f2a541', '#c1440e', '#fff1d0', '#5c2a0f'],
    personajes: { trazo: '#4a2511', grosor: 4, paleta: ['#f2a541', '#a0612f', '#fff1d0', '#e3b778', '#8c5a3c', '#f6e3c1', '#d9481c', '#9bb35e'], sombrero: '#4a2511', cachete: '#d9481c' },
  },
  {
    id: 'pixel', nombre: 'Pixel art / retro gaming', modo: 'oscuro',
    descripcion: 'Como una consola de 16 bits: píxeles grandes, bordes escalonados y fuente de arcade.',
    fuentes: ['Press+Start+2P', 'VT323'],
    equipos: ['#41a6f6', '#e43b44'],
    dorso: ['#5d275d', '#29366f', '#ffcd75', '#ffcd75'],
    personajes: { trazo: '#1a1c2c', grosor: 5, paleta: ['#ef7d57', '#a7703f', '#f4f4f4', '#ffcd75', '#94b0c2', '#ffffff', '#ff8e3c', '#38b764'], sombrero: '#1a1c2c', cachete: '#e43b44', filtro: 'pixel' },
  },
  {
    id: 'glass', nombre: 'Glassmorphism', modo: 'oscuro',
    descripcion: 'Paneles de vidrio esmerilado flotando sobre manchas de color.',
    fuentes: ['Manrope:wght@500;700;800'],
    equipos: ['#7cc8ff', '#ff8aa8'],
    dorso: ['#6a5cff', '#2b1e6e', 'rgba(255,255,255,.5)', '#ffffff'],
    personajes: { trazo: 'rgba(255,255,255,.85)', grosor: 3, paleta: ['#ff9ec7', '#9d8cff', '#e8f0ff', '#7ce0ff', '#c2a8ff', '#ffffff', '#ff8aa8', '#8affc1'], pupila: '#1b1640', sombrero: 'rgba(30,20,70,.75)', opacidad: 0.6 },
  },
  {
    id: 'neumorphism', nombre: 'Neumorphism', modo: 'claro',
    descripcion: 'Todo del mismo gris suave, con relieves de luz y sombra.',
    fuentes: ['Nunito:wght@600;800;900'],
    equipos: ['#5b8def', '#e0605e'],
    dorso: ['#e4e9f0', '#c9d3e0', '#ffffff', '#8a97ab'],
    personajes: { trazo: '#8a97ab', grosor: 3, paleta: ['#eef1f6', '#e1e6ee', '#f7f9fc', '#e7ebf2', '#dde3ec', '#ffffff', '#eceff5', '#e3e8ef'], pupila: '#4a5568', sombrero: '#c9d3e0', cachete: '#f2a3a3', filtro: 'arcilla' },
  },
  {
    id: 'clay', nombre: 'Claymorphism', modo: 'claro',
    descripcion: 'Formas infladas de plastilina, pastel y con relieve.',
    fuentes: ['Fredoka:wght@500;600;700'],
    equipos: ['#6aa9ff', '#ff7a7a'],
    dorso: ['#ffb4a2', '#e5989b', '#fff1ec', '#ffffff'],
    personajes: { trazo: 'transparent', grosor: 0.01, paleta: PASTEL, pupila: '#4a3a5a', sombrero: '#8e7dbe', cachete: '#ff8fa3', filtro: 'arcilla' },
  },
  {
    id: 'bento', nombre: 'Bento grid', modo: 'claro',
    descripcion: 'Tarjetas redondeadas como cajitas de bento, cada una con su tono suave.',
    fuentes: ['DM+Sans:wght@500;700;800'],
    equipos: ['#3b82f6', '#ef4444'],
    dorso: ['#d9e6d2', '#a7c4a0', '#ffffff', '#2f4a2a'],
    personajes: { trazo: '#2b2b2b', grosor: 3, paleta: ['#ffd6a5', '#cbb79f', '#ffffff', '#e9d8c4', '#cfc3b0', '#fff8ef', '#ffb38a', '#b5e48c'], sombrero: '#2b2b2b' },
  },
  {
    id: 'suizo', nombre: 'Minimalismo suizo', modo: 'claro',
    descripcion: 'Grilla, Helvetica, rojo y negro sobre blanco. Formas planas.',
    fuentes: ['Inter:wght@400;700;900'],
    equipos: ['#1d4ed8', '#e30613'],
    dorso: ['#ffffff', '#e30613', '#ffffff', '#ffffff'],
    personajes: { trazo: 'transparent', grosor: 0.01, paleta: ['#e30613', '#111111', '#f2f2f2', '#d4d4d4', '#111111', '#ffffff', '#e30613', '#9a9a9a'], pupila: '#111', claro: '#ffffff', sombrero: '#111', cachete: 'transparent' },
  },
  {
    id: 'cyberpunk', nombre: 'Cyberpunk / Neón', modo: 'oscuro',
    descripcion: 'Grilla de neón, magenta y cian, esquinas cortadas y brillo eléctrico.',
    fuentes: ['Orbitron:wght@600;800;900', 'Share+Tech+Mono'],
    equipos: ['#00f0ff', '#ff2bd6'],
    dorso: ['#1a0033', '#0a0014', '#ff2bd6', '#00f0ff'],
    personajes: { trazo: '#00f0ff', grosor: 3, paleta: ['#1b0638', '#160a3a', '#120a2a', '#2a0838', '#0a1838', '#1a1a3a', '#2a0a2a', '#0a2a2a'], claro: '#0a0014', pupila: '#ff2bd6', sombrero: '#ff2bd6', cachete: '#ff2bd6', filtro: 'neon' },
  },
  {
    id: 'dark-premium', nombre: 'Dark premium (Linear / Vercel)', modo: 'oscuro',
    descripcion: 'Negro profundo, bordes de un pixel, tipografía precisa y un solo brillo sutil.',
    fuentes: ['Geist:wght@400;500;600;700'],
    equipos: ['#60a5fa', '#f87171'],
    dorso: ['#18181b', '#09090b', '#3f3f46', '#fafafa'],
    personajes: { trazo: '#3f3f46', grosor: 2.5, paleta: ['#27272a', '#3f3f46', '#e4e4e7', '#52525b', '#27272a', '#fafafa', '#3f3f46', '#52525b'], claro: '#fafafa', pupila: '#09090b', sombrero: '#09090b', cachete: '#a78bfa' },
  },
  {
    id: 'aurora', nombre: 'Aurora / Mesh gradients', modo: 'oscuro',
    descripcion: 'Degradados de malla que se mueven lento, como una aurora austral.',
    fuentes: ['Sora:wght@500;700;800'],
    equipos: ['#67e8f9', '#fb7185'],
    dorso: ['#7c3aed', '#0e7490', 'rgba(255,255,255,.4)', '#ffffff'],
    personajes: { trazo: 'rgba(10,8,30,.7)', grosor: 3, paleta: ['#c4b5fd', '#67e8f9', '#f0f9ff', '#a7f3d0', '#f9a8d4', '#ffffff', '#fdba74', '#86efac'], pupila: '#0b0a1f', sombrero: '#1e1b4b', cachete: '#fb7185', opacidad: 0.88 },
  },
  {
    id: 'cuaderno', nombre: 'Skeuomorfismo (cuaderno)', modo: 'claro',
    descripcion: 'Un cuaderno Rivadavia sobre el escritorio: hojas rayadas, cinta, post-its y birome.',
    fuentes: ['Kalam:wght@400;700', 'Patrick+Hand'],
    equipos: ['#1f4fbf', '#c62828'],
    dorso: ['#2f5d9e', '#1d3d6e', '#ffffff', '#ffffff'],
    personajes: { trazo: '#1f3a93', grosor: 3, paleta: ['#ffe9a8', '#e8cfa8', '#ffffff', '#f7d9c4', '#d9c4a8', '#ffffff', '#ffc8a8', '#c8e6b0'], pupila: '#1f3a93', sombrero: '#1f3a93', cachete: '#ff8a80', filtro: 'garabato' },
  },
  {
    id: 'editorial', nombre: 'Editorial / Revista', modo: 'claro',
    descripcion: 'Papel de diario, serif con contraste, filetes finos y titulares grandes.',
    fuentes: ['Playfair+Display:ital,wght@0,700;0,900;1,700', 'Source+Serif+4:wght@400;600'],
    equipos: ['#1e3a5f', '#b3261e'],
    dorso: ['#f5f1e8', '#b3261e', '#1a1a1a', '#f5f1e8'],
    personajes: { trazo: '#1a1a1a', grosor: 2.5, paleta: ['#e8c9a0', '#c9a27a', '#f5f1e8', '#d8b48c', '#b3261e', '#f5f1e8', '#d9773a', '#9aa77a'], pupila: '#1a1a1a', sombrero: '#1a1a1a', cachete: '#b3261e' },
  },
  {
    id: 'doodle', nombre: 'Hand-drawn / Doodle', modo: 'claro',
    descripcion: 'Dibujado con fibra negra: líneas temblorosas, rayado y garabatos.',
    fuentes: ['Gaegu:wght@400;700', 'Caveat:wght@600;700'],
    equipos: ['#2b7fff', '#ff4a3d'],
    dorso: ['#ffffff', '#ffe066', '#222222', '#222222'],
    personajes: { trazo: '#222', grosor: 4, paleta: ['#ffffff', '#ffe066', '#ffffff', '#ffd6a5', '#ffffff', '#ffffff', '#ffb38a', '#c1f0b0'], pupila: '#222', sombrero: '#222', cachete: '#ff8a80', filtro: 'garabato' },
  },
  {
    id: 'gamificado', nombre: 'Gamificado (estilo Duolingo)', modo: 'claro',
    descripcion: 'Botones gorditos en 3D, verde brillante, rachas y todo redondeado.',
    fuentes: ['Nunito:wght@700;800;900'],
    equipos: ['#1cb0f6', '#ff4b4b'],
    dorso: ['#58cc02', '#46a302', '#ffffff', '#ffffff'],
    personajes: { trazo: '#3c3c3c', grosor: 3.5, paleta: ['#ffc800', '#ce82ff', '#ffffff', '#ff9600', '#1cb0f6', '#ffffff', '#ff4b4b', '#58cc02'], pupila: '#3c3c3c', sombrero: '#3c3c3c', cachete: '#ff86d0' },
  },
];

const CLAVE = 'truco-estilo';
let actual: EstiloPreview = ESTILOS[0];

export function estiloActual() {
  return actual;
}

export function idDesdeUrl(): string | null {
  return new URLSearchParams(location.search).get('estilo');
}

/** Lee ?estilo= (o el guardado) y aplica el estilo. Hay que llamarla antes de crear la mesa. */
export function iniciarEstilo(opciones: { persistir?: boolean; selector?: boolean } = {}) {
  const pedido = idDesdeUrl();
  let id = pedido ?? (opciones.persistir ? localStorage.getItem(CLAVE) : null) ?? 'actual';
  if (!ESTILOS.some((e) => e.id === id)) id = 'actual';
  if (opciones.persistir && pedido) localStorage.setItem(CLAVE, id);
  actual = ESTILOS.find((e) => e.id === id)!;

  const html = document.documentElement;
  if (actual.id !== 'actual') {
    html.dataset.estilo = actual.id;
    html.classList.add('rediseno', `modo-${actual.modo}`);
    if (actual.equipos) {
      COLOR_EQUIPO[0] = actual.equipos[0];
      COLOR_EQUIPO[1] = actual.equipos[1];
      html.style.setProperty('--celeste', actual.equipos[0]);
      html.style.setProperty('--colorado', actual.equipos[1]);
    }
    if (actual.dorso) configurarDorso(actual.dorso);
    if (actual.fuentes?.length) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?${actual.fuentes.map((f) => 'family=' + f).join('&')}&display=swap`;
      document.head.appendChild(link);
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', actual.modo === 'oscuro' ? '#0a0a12' : '#ffffff');
  }
  if (opciones.selector && (pedido || localStorage.getItem(CLAVE))) montarSelector();
}

/** Personaje para un asiento: gaucho en el diseño actual, criatura en los rediseños. */
export function avatarSVG(asiento: number, panuelo: string, id: string): string {
  if (!actual.personajes) return gauchoSVG(GAUCHOS[asiento % GAUCHOS.length], panuelo, id);
  return criaturaSVG(CRIATURAS[asiento % CRIATURAS.length], asiento, panuelo, id, actual.personajes);
}

/** Selector flotante para cambiar de estilo sin salir del juego. */
function montarSelector() {
  const caja = document.createElement('div');
  caja.id = 'selector-estilo';
  caja.innerHTML = `
    <a href="/preview.html" title="Ver todos los estilos">◧</a>
    <select aria-label="Estilo">${ESTILOS.map((e, i) => `<option value="${e.id}"${e.id === actual.id ? ' selected' : ''}>${i}. ${e.nombre}</option>`).join('')}</select>`;
  caja.querySelector('select')!.onchange = (ev) => {
    const id = (ev.target as HTMLSelectElement).value;
    localStorage.setItem(CLAVE, id);
    const q = new URLSearchParams(location.search);
    q.set('estilo', id);
    location.search = q.toString();
  };
  document.body.appendChild(caja);
}
