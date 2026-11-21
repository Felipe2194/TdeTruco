/*
 * Genera las imágenes de diseño en ./diseno, separadas por parte del juego.
 * Requiere el servidor de desarrollo corriendo:  npm run dev -- --port 5180
 * Uso:  node scripts/capturas.mjs [http://localhost:5180] [ruta-a-chrome]
 */
import { chromium } from 'playwright-core';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:5180';
const CHROME = process.argv[3] ?? (process.platform === 'win32'
  ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  : process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome');
const OUT = 'diseno';
const W = 1600, H = 900;

const PALOS = ['espada', 'basto', 'oro', 'copa'];
const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
const SENAS = ['anchoEspada', 'anchoBasto', 'sieteEspada', 'sieteOro', 'tres', 'dos', 'anchoFalso', 'envido', 'nada'];
const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const dos = (n) => String(n).padStart(2, '0');

let total = 0;
const carpeta = async (...p) => { const d = join(OUT, ...p); await mkdir(d, { recursive: true }); return d; };

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: W, height: H } });
const errores = [];
page.on('pageerror', (e) => errores.push(e.message));

async function abrir(parte, params = {}) {
  const qs = new URLSearchParams({ parte, ...params });
  await page.goto(`${BASE}/galeria.html?${qs}`);
  await page.waitForFunction(() => window.__listo === true, null, { timeout: 20000 });
}
async function foto(archivo, opciones = {}) {
  await page.screenshot({ path: archivo, ...opciones });
  total++;
}
async function fotoElemento(selector, archivo, opciones = {}) {
  const el = await page.$(selector);
  if (!el) throw new Error(`No encontré ${selector}`);
  await el.screenshot({ path: archivo, ...opciones });
  total++;
}
async function guardarTexto(archivo, texto) {
  await writeFile(archivo, texto, 'utf8');
  total++;
}
async function guardarDataUrl(archivo, dataUrl) {
  await writeFile(archivo, Buffer.from(dataUrl.split(',')[1], 'base64'));
  total++;
}

await rm(OUT, { recursive: true, force: true });

// ------------------------------------------------------------------ 01 Pantallas completas
{
  const d = await carpeta('01-pantallas');
  await abrir('inicio'); await foto(join(d, '01-inicio.png'));
  await abrir('lobby', { n: 4 }); await foto(join(d, '02-lobby-2v2.png'));
  await abrir('lobby', { n: 8 }); await foto(join(d, '03-lobby-4v4.png'));
  const partidas = [
    ['04-mesa-1v1', { n: 2, cartas: 1 }],
    ['05-mesa-2v2', { n: 4, cartas: 3 }],
    ['06-mesa-3v3', { n: 6, cartas: 5 }],
    ['07-mesa-4v4', { n: 8, cartas: 7 }],
    ['08-pica-pica-3v3', { n: 6, cartas: 4, pica: 1 }],
    ['09-pica-pica-4v4', { n: 8, cartas: 6, pica: 1 }],
    ['10-mesa-2v2-segunda-baza', { n: 4, cartas: 6 }],
    ['11-mesa-companero-hace-sena', { n: 4, cartas: 1, sena: 'anchoBasto' }],
    ['12-mesa-companero-dice-voy', { n: 4, cartas: 1, decir: '¡Dejámela a mí!' }],
  ];
  for (const [nombre, params] of partidas) {
    await abrir('partida', Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])));
    await foto(join(d, `${nombre}.png`));
  }
  await abrir('fin'); await foto(join(d, '13-fin-de-partido.png'));
}

// ------------------------------------------------------------------ 02 Fondo
{
  const d = await carpeta('02-fondo');
  await abrir('fondo');
  await foto(join(d, '00-fondo-completo.png'));
}

// ------------------------------------------------------------------ 03 Mesa
{
  const d = await carpeta('03-mesa');
  await abrir('mesa');
  await foto(join(d, '01-mesa-con-ambiente.png'));
  await foto(join(d, '02-mesa-pano.png'), { clip: { x: 0, y: H * 0.34, width: W, height: H * 0.66 } });
  await fotoElemento('#mate', join(d, '03-mate.png'), { omitBackground: true });
  await guardarTexto(join(d, 'mate.svg'), await page.evaluate(() => window.__galeria.MATE_SVG));
}

// ------------------------------------------------------------------ 04 Personajes y 05 Señas
const gauchos = await (async () => { await abrir('personaje'); return page.evaluate(() => window.__galeria.PERSONAJES.map((g) => g.nombre)); })();
{
  const d = await carpeta('04-personajes');
  for (let i = 0; i < gauchos.length; i++) {
    const base = `${dos(i + 1)}-${slug(gauchos[i])}`;
    for (const [eq, color] of [[0, 'celeste'], [1, 'colorado']]) {
      await abrir('personaje', { g: String(i), equipo: String(eq), t: '1' });
      await fotoElemento('#pieza', join(d, `${base}-equipo-${color}.png`), { omitBackground: true });
    }
    const svg = await page.evaluate((i) => {
      const g = window.__galeria;
      return g.personajeSVG(g.PERSONAJES[i], '#5ab0ff').trim();
    }, i);
    await guardarTexto(join(d, `${base}.svg`), svg);
  }
  const s = await carpeta('05-senas');
  for (let i = 0; i < gauchos.length; i++) {
    const dg = await carpeta('05-senas', `${dos(i + 1)}-${slug(gauchos[i])}`);
    await abrir('personaje', { g: String(i), t: '1' });
    await fotoElemento('#pieza', join(dg, '00-neutral.png'), { omitBackground: true });
    for (let k = 0; k < SENAS.length; k++) {
      await abrir('personaje', { g: String(i), sena: SENAS[k], t: '1' });
      await fotoElemento('#pieza', join(dg, `${dos(k + 1)}-${slug(SENAS[k].replace(/([A-Z])/g, ' $1'))}.png`), { omitBackground: true });
    }
  }
  void s;
}

// ------------------------------------------------------------------ 06 Cartas (pixel art: SVG de 64x96 + PNG a 4x)
{
  await abrir('indice');
  const png = async (svg, archivo) => {
    await page.evaluate((svg) => {
      document.getElementById('app').innerHTML = '<img id="pieza-carta" style="position:absolute;left:0;top:0;width:256px;height:384px;image-rendering:pixelated">';
      document.getElementById('pieza-carta').src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }, svg);
    await page.waitForTimeout(30);
    await fotoElemento('#pieza-carta', archivo, { omitBackground: true });
  };
  for (const palo of PALOS) {
    const d = await carpeta('06-cartas', palo);
    for (const n of NUMEROS) {
      const svg = await page.evaluate(([n, p]) => window.__galeria.cartaSVG({ n, p }), [n, palo]);
      await guardarTexto(join(d, `${dos(n)}-${palo}.svg`), svg);
      await png(svg, join(d, `${dos(n)}-${palo}.png`));
    }
  }
  const d = await carpeta('06-cartas');
  const dorso = await page.evaluate(() => window.__galeria.dorsoSVG());
  await guardarTexto(join(d, 'dorso.svg'), dorso);
  await png(dorso, join(d, 'dorso.png'));
  // Hoja con las 40 cartas.
  await page.evaluate(([palos, numeros]) => {
    document.body.style.background = '#1b2a30';
    const hoja = document.createElement('div');
    hoja.id = 'hoja';
    hoja.style.cssText = 'position:absolute;left:0;top:0;width:1600px;display:grid;grid-template-columns:repeat(10,1fr);gap:12px;padding:16px;background:#1b2a30';
    for (const p of palos) for (const n of numeros) {
      const img = document.createElement('img');
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(window.__galeria.cartaSVG({ n, p }));
      img.style.cssText = 'width:100%;image-rendering:pixelated';
      hoja.appendChild(img);
    }
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(hoja);
  }, [PALOS, NUMEROS]);
  await page.waitForTimeout(300);
  await fotoElemento('#hoja', join(d, 'hoja-completa.png'));
}

// ------------------------------------------------------------------ 07 Marcador
{
  for (const objetivo of [30, 15]) {
    const d = await carpeta('07-marcador', `partido-a-${objetivo}`);
    for (let n = 0; n <= objetivo; n++) {
      await abrir('marcador', { n: String(n), objetivo: String(objetivo), t: '1' });
      await fotoElemento('#pieza', join(d, `porotos-${dos(n)}.png`), { omitBackground: true });
    }
  }
}

// ------------------------------------------------------------------ 08 Interfaz
{
  const d = await carpeta('08-interfaz');
  await abrir('hud', { estado: 'turno' });
  await fotoElemento('#marcador', join(d, '01-panel-marcador.png'));
  await fotoElemento('#info', join(d, '02-panel-info.png'));
  await fotoElemento('#senas', join(d, '03-panel-senas.png'));
  await fotoElemento('#acciones', join(d, '04-panel-acciones-tu-turno.png'));
  await abrir('hud', { estado: 'truco' });
  await fotoElemento('#acciones', join(d, '05-panel-acciones-te-cantan-truco.png'));
  await abrir('hud', { estado: 'envido' });
  await fotoElemento('#acciones', join(d, '06-panel-acciones-te-cantan-envido.png'));
  await abrir('hud', { estado: 'plegado' });
  await foto(join(d, '07-paneles-plegados.png'));
  await abrir('componentes');
  await fotoElemento('#c-botones', join(d, '08-botones.png'));
  await fotoElemento('#c-opciones', join(d, '09-selector-de-opciones.png'));
  await fotoElemento('#c-burbuja', join(d, '10-globo-de-dialogo.png'), { omitBackground: true });
  await fotoElemento('#c-burbuja-tanto', join(d, '11-globo-tanto-envido.png'), { omitBackground: true });
  await fotoElemento('#c-cartel', join(d, '12-cartel-puntos-nosotros.png'));
  await fotoElemento('#c-cartel-ellos', join(d, '13-cartel-puntos-ellos.png'));
  await fotoElemento('#c-placas', join(d, '14-placas-de-nombre.png'));
}

await browser.close();
console.log(`Listo: ${total} archivos en ./${OUT}`);
if (errores.length) {
  console.log('Errores en la página:\n' + errores.join('\n'));
  process.exitCode = 1;
}
